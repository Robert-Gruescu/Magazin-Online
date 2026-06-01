import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { isSupabaseConfigured, supabase } from "../supabaseClient";

const initialForm = {
  categoryId: "",
  name: "",
  description: "",
  price: "",
  imageUrl: "",
  faraZahar: false,
  bio: false,
};

function AddProduct() {
  const [formValues, setFormValues] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [categoriesState, setCategoriesState] = useState("idle");
  const [submitState, setSubmitState] = useState("idle");
  const [submitMessage, setSubmitMessage] = useState("");

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
    const categoryId = Number.parseInt(formValues.categoryId, 10);

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

    setSubmitState("submitting");

    const payload = {
      category_id: categoryId,
      name: trimmedName,
      description: formValues.description.trim() || null,
      price: Number(priceValue.toFixed(2)),
      image_url: formValues.imageUrl.trim() || null,
      fara_zahar: formValues.faraZahar,
      bio: formValues.bio,
    };

    const { error } = await supabase.from("products").insert(payload);

    if (error) {
      setSubmitState("error");
      setSubmitMessage("Produsul nu a putut fi salvat. Incearca din nou.");
      return;
    }

    setSubmitState("success");
    setSubmitMessage("Produsul a fost salvat cu succes.");
    setFormValues((prev) => ({
      ...initialForm,
      categoryId: prev.categoryId,
    }));
  };

  const handleReset = () => {
    setFormValues(initialForm);
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
                  placeholder="Ex: Biscuiti vegani"
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
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-start gap-3 rounded-2xl border border-ink/10 bg-white/80 p-4">
                  <input
                    type="checkbox"
                    checked={formValues.faraZahar}
                    onChange={handleChange("faraZahar")}
                    className="mt-1 h-4 w-4"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-ink">
                      Fara zahar
                    </span>
                    <span className="block text-xs text-ink/60">
                      Marcheaza produsele potrivite pentru diabetici.
                    </span>
                  </span>
                </label>

                <label className="flex items-start gap-3 rounded-2xl border border-ink/10 bg-white/80 p-4">
                  <input
                    type="checkbox"
                    checked={formValues.bio}
                    onChange={handleChange("bio")}
                    className="mt-1 h-4 w-4"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-ink">
                      Bio
                    </span>
                    <span className="block text-xs text-ink/60">
                      Evidentiaza produsele din ingrediente organice.
                    </span>
                  </span>
                </label>
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
            <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-soft backdrop-blur">
              <h2 className="font-display text-2xl text-ink">
                Chei importante
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-ink/70">
                <li>category_id este obligatoriu si provine din categories.</li>
                <li>created_at se seteaza automat la salvare.</li>
                <li>fara_zahar si bio sunt valori boolean.</li>
                <li>image_url este optional si poate ramane gol.</li>
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
