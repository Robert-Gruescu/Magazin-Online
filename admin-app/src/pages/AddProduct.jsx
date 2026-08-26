import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { isSupabaseConfigured, supabase } from "../supabaseClient";
import ImageManager from "../components/ImageManager";
import { uploadProductImage, validateImage } from "../services/productImages";

const initialForm = {
  categoryId: "",
  name: "",
  description: "",
  price: "",
  stock: "",
  imageUrl: "",
  brand: "",
  sku: "",
  pretVechi: "",
  garantieLuni: "24",
  rating: "",
  specs: [{ key: "", value: "" }],
};

function AddProduct() {
  const [formValues, setFormValues] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [categoriesState, setCategoriesState] = useState("idle");
  const [submitState, setSubmitState] = useState("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  // Imaginile alese inainte de salvare; se urca dupa ce produsul primeste un id.
  const [pendingFiles, setPendingFiles] = useState([]);
  const [createdProductId, setCreatedProductId] = useState(null);

  const supabaseReady = Boolean(isSupabaseConfigured && supabase);

  useEffect(() => {
    if (!supabaseReady) {
      setCategoriesState("missing");
      return;
    }

    let active = true;
    setCategoriesState("loading");

    const loadCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name", { ascending: true });

      if (!active) return;

      if (error) {
        setCategoriesState("error");
        return;
      }

      setCategories(data ?? []);
      setCategoriesState("ready");
    };

    loadCategories();

    return () => {
      active = false;
    };
  }, [supabaseReady]);

  const categoryHint = useMemo(() => {
    const states = {
      idle: "Selecteaza categoria pentru produs.",
      loading: "Se incarca lista de categorii...",
      ready: categories.length
        ? "Categorie selectata va fi salvata in products.category_id."
        : "Nu exista categorii. Creeaza una inainte.",
      error: "Nu am putut incarca categoriile.",
      missing: "Supabase nu este configurat pentru citirea categoriilor.",
    };
    return states[categoriesState] ?? states.idle;
  }, [categoriesState, categories.length]);

  const handleChange = (field) => (event) => {
    const { value, type, checked } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [field]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePickFiles = (event) => {
    const picked = Array.from(event.target.files || []);
    const problems = picked.map(validateImage).filter(Boolean);

    if (problems.length > 0) {
      setSubmitState("error");
      setSubmitMessage(problems.join(" "));
    }

    setPendingFiles((prev) => [
      ...prev,
      ...picked.filter((file) => !validateImage(file)),
    ]);
    event.target.value = "";
  };

  const removePendingFile = (index) =>
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));

  const handleSpecChange = (index, field) => (event) => {
    const { value } = event.target;
    setFormValues((prev) => ({
      ...prev,
      specs: prev.specs.map((row, i) =>
        i === index ? { ...row, [field]: value } : row,
      ),
    }));
  };

  const addSpecRow = () =>
    setFormValues((prev) => ({
      ...prev,
      specs: [...prev.specs, { key: "", value: "" }],
    }));

  const removeSpecRow = (index) =>
    setFormValues((prev) => {
      const specs = prev.specs.filter((_, i) => i !== index);
      return { ...prev, specs: specs.length ? specs : [{ key: "", value: "" }] };
    });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitMessage("");

    if (!supabaseReady) {
      setSubmitState("error");
      setSubmitMessage("Supabase nu este configurat. Verifica .env.local.");
      return;
    }

    const trimmedName = formValues.name.trim();
    const priceValue = Number.parseFloat(formValues.price);
    const stockValue = Number.parseInt(formValues.stock, 10);
    const categoryId = Number.parseInt(formValues.categoryId, 10);
    const oldPriceValue = Number.parseFloat(formValues.pretVechi);
    const warrantyValue = Number.parseInt(formValues.garantieLuni, 10);
    const ratingValue = Number.parseFloat(formValues.rating);

    // Perechile cheie/valoare completate devin obiectul JSONB `specificatii`.
    const specsObject = formValues.specs.reduce((acc, row) => {
      const key = row.key.trim();
      const value = row.value.trim();
      if (key && value) acc[key] = value;
      return acc;
    }, {});

    if (!formValues.categoryId) {
      setSubmitState("error");
      setSubmitMessage("Alege o categorie pentru produs.");
      return;
    }

    if (!trimmedName) {
      setSubmitState("error");
      setSubmitMessage("Numele produsului este obligatoriu.");
      return;
    }

    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      setSubmitState("error");
      setSubmitMessage("Introdu un pret valid.");
      return;
    }

    if (
      formValues.rating &&
      (!Number.isFinite(ratingValue) || ratingValue < 0 || ratingValue > 5)
    ) {
      setSubmitState("error");
      setSubmitMessage("Rating-ul trebuie sa fie intre 0 si 5.");
      return;
    }

    setSubmitState("submitting");

    const payload = {
      category_id: categoryId,
      name: trimmedName,
      description: formValues.description.trim() || null,
      price: Number(priceValue.toFixed(2)),
      stock: Number.isFinite(stockValue) ? stockValue : 0,
      image_url: formValues.imageUrl.trim() || null,
      brand: formValues.brand.trim() || null,
      sku: formValues.sku.trim() || null,
      pret_vechi: Number.isFinite(oldPriceValue)
        ? Number(oldPriceValue.toFixed(2))
        : null,
      garantie_luni: Number.isFinite(warrantyValue) ? warrantyValue : null,
      rating: Number.isFinite(ratingValue) ? ratingValue : null,
      specificatii: specsObject,
    };

    const { data: created, error } = await supabase
      .from("products")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      setSubmitState("error");
      setSubmitMessage("Produsul nu a putut fi salvat. Incearca din nou.");
      return;
    }

    // Imaginile se urca abia acum: aveam nevoie de id-ul produsului pentru
    // calea din bucket si pentru randurile din product_images.
    const uploadProblems = [];
    for (const file of pendingFiles) {
      const { error: uploadError } = await uploadProductImage(created.id, file);
      if (uploadError) uploadProblems.push(uploadError);
    }

    setCreatedProductId(created.id);
    setPendingFiles([]);
    setSubmitState(uploadProblems.length > 0 ? "error" : "success");
    setSubmitMessage(
      uploadProblems.length > 0
        ? `Produsul a fost salvat, dar unele imagini nu au putut fi urcate: ${uploadProblems.join(" ")}`
        : "Produsul a fost salvat cu succes.",
    );
    setFormValues((prev) => ({
      ...initialForm,
      specs: [{ key: "", value: "" }],
      categoryId: prev.categoryId,
    }));
  };

  const handleReset = () => {
    setFormValues({ ...initialForm, specs: [{ key: "", value: "" }] });
    setPendingFiles([]);
    setCreatedProductId(null);
    setSubmitState("idle");
    setSubmitMessage("");
  };

  const isSubmitting = submitState === "submitting";
  const isSuccess = submitState === "success";
  const isError = submitState === "error";

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">
              Produse
            </p>
            <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
              Adauga produs
            </h1>
            <p className="mt-2 max-w-xl text-sm text-ink/60">
              Completeaza datele pentru a insera un produs in tabela products.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/70"
            >
              Inapoi la panou
            </Link>
            <span className="rounded-full border border-ink/10 bg-white/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-ink/70">
              Live
            </span>
          </div>
        </header>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-white/60 bg-white/85 p-6 shadow-soft backdrop-blur"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-ink">Detalii produs</h2>
              <span className="text-xs uppercase tracking-[0.25em] text-ink/50">
                Formular
              </span>
            </div>

            <div className="mt-6 grid gap-4">
              <label className="grid gap-2">
                <span className="text-xs uppercase tracking-[0.2em] text-ink/50">
                  Categorie
                </span>
                <select
                  value={formValues.categoryId}
                  onChange={handleChange("categoryId")}
                  className="rounded-2xl border border-ink/10 bg-white/90 px-4 py-3 text-sm"
                >
                  <option value="">Selecteaza categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-ink/60">{categoryHint}</span>
              </label>

              <label className="grid gap-2">
                <span className="text-xs uppercase tracking-[0.2em] text-ink/50">
                  Nume produs
                </span>
                <input
                  type="text"
                  value={formValues.name}
                  onChange={handleChange("name")}
                  placeholder="Ex: ASUS ROG Strix G16"
                  className="rounded-2xl border border-ink/10 bg-white/90 px-4 py-3 text-sm"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs uppercase tracking-[0.2em] text-ink/50">
                  Descriere
                </span>
                <textarea
                  value={formValues.description}
                  onChange={handleChange("description")}
                  placeholder="Scurta descriere pentru produs"
                  rows={4}
                  className="rounded-2xl border border-ink/10 bg-white/90 px-4 py-3 text-sm"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-ink/50">
                    Pret (lei)
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={formValues.price}
                    onChange={handleChange("price")}
                    placeholder="0.00"
                    className="rounded-2xl border border-ink/10 bg-white/90 px-4 py-3 text-sm"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-ink/50">
                    Stoc (buc)
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formValues.stock}
                    onChange={handleChange("stock")}
                    placeholder="0"
                    className="rounded-2xl border border-ink/10 bg-white/90 px-4 py-3 text-sm"
                  />
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-xs uppercase tracking-[0.2em] text-ink/50">
                  Imagine (URL)
                </span>
                <input
                  type="url"
                  value={formValues.imageUrl}
                  onChange={handleChange("imageUrl")}
                  placeholder="https://"
                  className="rounded-2xl border border-ink/10 bg-white/90 px-4 py-3 text-sm"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-ink/50">
                    Brand
                  </span>
                  <input
                    type="text"
                    value={formValues.brand}
                    onChange={handleChange("brand")}
                    placeholder="Ex: ASUS"
                    className="rounded-2xl border border-ink/10 bg-white/90 px-4 py-3 text-sm"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-ink/50">
                    Cod produs (SKU)
                  </span>
                  <input
                    type="text"
                    value={formValues.sku}
                    onChange={handleChange("sku")}
                    placeholder="ASU-ROG-G16"
                    className="rounded-2xl border border-ink/10 bg-white/90 px-4 py-3 text-sm"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="grid gap-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-ink/50">
                    Pret vechi (lei)
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={formValues.pretVechi}
                    onChange={handleChange("pretVechi")}
                    placeholder="Optional"
                    className="rounded-2xl border border-ink/10 bg-white/90 px-4 py-3 text-sm"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-ink/50">
                    Garantie (luni)
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formValues.garantieLuni}
                    onChange={handleChange("garantieLuni")}
                    placeholder="24"
                    className="rounded-2xl border border-ink/10 bg-white/90 px-4 py-3 text-sm"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-ink/50">
                    Rating (0-5)
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formValues.rating}
                    onChange={handleChange("rating")}
                    placeholder="4.7"
                    className="rounded-2xl border border-ink/10 bg-white/90 px-4 py-3 text-sm"
                  />
                </label>
              </div>

              {/* Specificatii tehnice -> coloana JSONB `specificatii` */}
              <div className="rounded-2xl border border-ink/10 bg-white/80 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.2em] text-ink/50">
                    Specificatii tehnice
                  </span>
                  <button
                    type="button"
                    onClick={addSpecRow}
                    className="rounded-full border border-ink/10 bg-white px-3 py-1 text-xs font-semibold text-ink/70"
                  >
                    + Adauga rand
                  </button>
                </div>

                <div className="mt-3 grid gap-2">
                  {formValues.specs.map((row, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={row.key}
                        onChange={handleSpecChange(index, "key")}
                        placeholder="Procesor"
                        className="w-2/5 rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm"
                      />
                      <input
                        type="text"
                        value={row.value}
                        onChange={handleSpecChange(index, "value")}
                        placeholder="Intel Core i7-13650HX"
                        className="flex-1 rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeSpecRow(index)}
                        className="rounded-xl border border-ink/10 bg-white px-3 text-sm text-ink/40 hover:text-rose-500"
                        aria-label="Sterge randul"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Imagini */}
              <div className="rounded-2xl border border-ink/10 bg-white/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-ink/50">
                    Imagini produs
                  </span>
                  <label className="cursor-pointer rounded-full border border-ink/10 bg-white px-3 py-1 text-xs font-semibold text-ink/70">
                    + Alege imagini
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      multiple
                      className="hidden"
                      onChange={handlePickFiles}
                    />
                  </label>
                </div>

                {pendingFiles.length === 0 ? (
                  <p className="mt-3 text-xs text-ink/45">
                    Optional. Imaginile se urca automat dupa ce salvezi produsul.
                    Prima devine imaginea principala.
                  </p>
                ) : (
                  <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {pendingFiles.map((file, index) => (
                      <figure
                        key={`${file.name}-${index}`}
                        className="relative overflow-hidden rounded-xl border border-ink/10 bg-ink/5"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt=""
                          className="aspect-square w-full object-contain p-1"
                        />
                        {index === 0 && (
                          <span className="absolute left-1 top-1 rounded bg-ink px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                            Principala
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removePendingFile(index)}
                          className="absolute right-1 top-1 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-rose-600"
                          aria-label={`Scoate ${file.name}`}
                        >
                          x
                        </button>
                      </figure>
                    ))}
                  </div>
                )}
              </div>

              {submitMessage ? (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm ${
                    isSuccess
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : isError
                        ? "border-rose-200 bg-rose-50 text-rose-800"
                        : "border-ink/10 bg-white/80 text-ink"
                  }`}
                >
                  {submitMessage}
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-ink px-6 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Se salveaza..." : "Salveaza produs"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-full border border-ink/10 bg-white/70 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/70"
              >
                Reseteaza
              </button>
            </div>
          </form>

          <div className="space-y-6">
            {createdProductId && (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6 shadow-soft">
                <h2 className="font-display text-2xl text-ink">
                  Galeria produsului salvat
                </h2>
                <p className="mt-1 text-sm text-ink/60">
                  Poti adauga sau reordona imaginile chiar acum.
                </p>
                <div className="mt-4">
                  <ImageManager productId={createdProductId} compact />
                </div>
              </div>
            )}

            <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-soft backdrop-blur">
              <h2 className="font-display text-2xl text-ink">
                Chei importante
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-ink/70">
                <li>category_id este obligatoriu si provine din categories.</li>
                <li>created_at se seteaza automat la salvare.</li>
                <li>brand si sku ajuta filtrarea si cautarea in catalog.</li>
                <li>specificatii se salveaza ca JSONB si apare pe pagina de produs.</li>
                <li>pret_vechi activeaza badge-ul de reducere pe card.</li>
                <li>image_url este optional si poate ramane gol.</li>
                <li>stock reprezinta cantitatea disponibila in depozit.</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-white/60 bg-white/75 p-6 shadow-soft backdrop-blur">
              <h2 className="font-display text-2xl text-ink">
                Status conectare
              </h2>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    supabaseReady
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {supabaseReady
                    ? "Conectat la Supabase"
                    : "Supabase neconfigurat"}
                </span>
                <span className="text-xs text-ink/60">
                  Verifica VITE_SUPABASE_URL si VITE_SUPABASE_ANON_KEY.
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AddProduct;
