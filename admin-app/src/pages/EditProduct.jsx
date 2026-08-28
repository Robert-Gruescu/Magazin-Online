import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ImageManager from "../components/ImageManager";
import { isSupabaseConfigured, supabase } from "../supabaseClient";

const camp =
  "rounded-2xl border border-ink/10 bg-white/90 px-4 py-3 text-sm w-full";
const eticheta = "text-xs uppercase tracking-[0.2em] text-ink/50";

/** Transforma randul din DB in starea formularului. */
const dinProdus = (p) => ({
  categoryId: String(p.category_id ?? ""),
  name: p.name ?? "",
  description: p.description ?? "",
  price: p.price != null ? String(p.price) : "",
  pretVechi: p.pret_vechi != null ? String(p.pret_vechi) : "",
  stock: p.stock != null ? String(p.stock) : "0",
  brand: p.brand ?? "",
  sku: p.sku ?? "",
  garantieLuni: p.garantie_luni != null ? String(p.garantie_luni) : "",
  rating: p.rating != null ? String(p.rating) : "",
  active: p.active !== false,
  specs: Object.entries(p.specificatii ?? {}).map(([key, value]) => ({
    key,
    value: String(value),
  })),
});

function EditProduct() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [categories, setCategories] = useState([]);
  const [state, setState] = useState("loading");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const supabaseReady = Boolean(isSupabaseConfigured && supabase);

  const incarca = useCallback(async () => {
    if (!supabaseReady) return;

    const [{ data: produs, error }, { data: cats }] = await Promise.all([
      supabase.from("products").select("*").eq("id", id).maybeSingle(),
      supabase.from("categories").select("id, name").order("name"),
    ]);

    if (error || !produs) {
      setState("missing");
      return;
    }

    setCategories(cats ?? []);
    const initial = dinProdus(produs);
    setForm(
      initial.specs.length > 0
        ? initial
        : { ...initial, specs: [{ key: "", value: "" }] },
    );
    setState("ready");
  }, [id, supabaseReady]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    incarca();
  }, [incarca]);

  const schimba = (cheie) => (event) => {
    const { value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [cheie]: type === "checkbox" ? checked : value }));
    setMessage("");
  };

  const schimbaSpec = (index, camp2) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({
      ...prev,
      specs: prev.specs.map((r, i) => (i === index ? { ...r, [camp2]: value } : r)),
    }));
  };

  const adaugaSpec = () =>
    setForm((prev) => ({ ...prev, specs: [...prev.specs, { key: "", value: "" }] }));

  const stergeSpec = (index) =>
    setForm((prev) => {
      const specs = prev.specs.filter((_, i) => i !== index);
      return { ...prev, specs: specs.length ? specs : [{ key: "", value: "" }] };
    });

  const salveaza = async (event) => {
    event.preventDefault();
    setMessage("");

    const pret = Number.parseFloat(form.price);
    const stoc = Number.parseInt(form.stock, 10);
    const rating = Number.parseFloat(form.rating);
    const pretVechi = Number.parseFloat(form.pretVechi);
    const garantie = Number.parseInt(form.garantieLuni, 10);

    if (!form.name.trim()) return setMessage("Numele este obligatoriu.");
    if (!Number.isFinite(pret) || pret <= 0) return setMessage("Pretul trebuie sa fie mai mare ca 0.");
    if (!Number.isFinite(stoc) || stoc < 0) return setMessage("Stocul nu poate fi negativ.");
    if (form.rating && (!Number.isFinite(rating) || rating < 0 || rating > 5))
      return setMessage("Rating-ul trebuie sa fie intre 0 si 5.");
    if (form.pretVechi && Number.isFinite(pretVechi) && pretVechi <= pret)
      return setMessage("Pretul vechi trebuie sa fie mai mare decat cel curent, altfel reducerea nu apare.");

    const specificatii = form.specs.reduce((acc, r) => {
      const k = r.key.trim();
      const v = r.value.trim();
      if (k && v) acc[k] = v;
      return acc;
    }, {});

    setSaving(true);
    const { error } = await supabase
      .from("products")
      .update({
        category_id: Number.parseInt(form.categoryId, 10),
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: Number(pret.toFixed(2)),
        pret_vechi: form.pretVechi && Number.isFinite(pretVechi) ? Number(pretVechi.toFixed(2)) : null,
        stock: stoc,
        brand: form.brand.trim() || null,
        sku: form.sku.trim() || null,
        garantie_luni: Number.isFinite(garantie) ? garantie : null,
        rating: form.rating && Number.isFinite(rating) ? rating : null,
        active: form.active,
        specificatii,
      })
      .eq("id", id);
    setSaving(false);

    if (error) {
      // Fara politica de UPDATE pe products, Postgres refuza tacut: 0 randuri.
      setMessage(
        /row-level security|permission/i.test(error.message)
          ? "Refuzat de baza de date. Ruleaza sql/007_blindare_scriere.sql si asigura-te ca ai rolul admin in profiles."
          : `Nu am putut salva: ${error.message}`,
      );
      return;
    }

    setMessage("Modificarile au fost salvate.");
  };

  if (state === "loading") {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10 text-sm text-ink/50">
        Se incarca produsul...
      </div>
    );
  }

  if (state === "missing") {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          Produsul nu a fost gasit.
        </div>
        <Link to="/products" className="mt-4 inline-block text-sm text-ink/70 underline">
          Inapoi la catalog
        </Link>
      </div>
    );
  }

  const esteEroare = message && !message.startsWith("Modificarile");

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <Link to="/products" className="text-xs uppercase tracking-[0.3em] text-ink/50 hover:text-ink">
              &larr; Catalog
            </Link>
            <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
              {form.name || "Editeaza produs"}
            </h1>
            <p className="mt-2 text-sm text-ink/60">
              {form.sku ? `Cod ${form.sku} · ` : ""}id {id}
            </p>
          </div>
          <Link
            to={`/products/${id}/images`}
            className="rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/70"
          >
            Imagini
          </Link>
        </header>

        <form onSubmit={salveaza} className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/60 bg-white/85 p-6 shadow-soft backdrop-blur">
            <h2 className="font-display text-2xl text-ink">Detalii produs</h2>

            <div className="mt-6 grid gap-4">
              <label className="grid gap-2">
                <span className={eticheta}>Categorie</span>
                <select value={form.categoryId} onChange={schimba("categoryId")} className={camp}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className={eticheta}>Nume produs</span>
                <input type="text" value={form.name} onChange={schimba("name")} className={camp} />
              </label>

              <label className="grid gap-2">
                <span className={eticheta}>Descriere</span>
                <textarea rows={4} value={form.description} onChange={schimba("description")} className={camp} />
                <span className="text-xs text-ink/50">
                  Conteaza pentru cautare: asistentul AI cauta si in descriere, nu doar in nume.
                </span>
              </label>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="grid gap-2">
                  <span className={eticheta}>Pret (lei)</span>
                  <input type="number" step="0.01" value={form.price} onChange={schimba("price")} className={camp} />
                </label>
                <label className="grid gap-2">
                  <span className={eticheta}>Pret vechi</span>
                  <input type="number" step="0.01" value={form.pretVechi} onChange={schimba("pretVechi")} placeholder="optional" className={camp} />
                </label>
                <label className="grid gap-2">
                  <span className={eticheta}>Stoc</span>
                  <input type="number" min="0" value={form.stock} onChange={schimba("stock")} className={camp} />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className={eticheta}>Brand</span>
                  <input type="text" value={form.brand} onChange={schimba("brand")} className={camp} />
                </label>
                <label className="grid gap-2">
                  <span className={eticheta}>Cod produs (SKU)</span>
                  <input type="text" value={form.sku} onChange={schimba("sku")} className={camp} />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className={eticheta}>Garantie (luni)</span>
                  <input type="number" min="0" value={form.garantieLuni} onChange={schimba("garantieLuni")} className={camp} />
                </label>
                <label className="grid gap-2">
                  <span className={eticheta}>Rating (0-5)</span>
                  <input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={schimba("rating")} className={camp} />
                </label>
              </div>

              {/* Specificatii */}
              <div className="rounded-2xl border border-ink/10 bg-white/80 p-4">
                <div className="flex items-center justify-between">
                  <span className={eticheta}>Specificatii tehnice</span>
                  <button type="button" onClick={adaugaSpec} className="rounded-full border border-ink/10 bg-white px-3 py-1 text-xs font-semibold text-ink/70">
                    + Adauga rand
                  </button>
                </div>
                <div className="mt-3 grid gap-2">
                  {form.specs.map((rand, index) => (
                    <div key={index} className="flex gap-2">
                      <input type="text" value={rand.key} onChange={schimbaSpec(index, "key")} placeholder="Procesor" className="w-2/5 rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm" />
                      <input type="text" value={rand.value} onChange={schimbaSpec(index, "value")} placeholder="Intel Core i7" className="flex-1 rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm" />
                      <button type="button" onClick={() => stergeSpec(index)} className="rounded-xl border border-ink/10 bg-white px-3 text-sm text-ink/40 hover:text-rose-500" aria-label="Sterge randul">
                        x
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {message ? (
                <div className={`rounded-2xl border px-4 py-3 text-sm ${esteEroare ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
                  {message}
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button type="submit" disabled={saving} className="rounded-full bg-ink px-6 py-2 text-sm font-semibold text-white shadow-soft disabled:opacity-60">
                {saving ? "Se salveaza..." : "Salveaza modificarile"}
              </button>
              <button type="button" onClick={incarca} className="rounded-full border border-ink/10 bg-white/70 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/70">
                Renunta la modificari
              </button>
            </div>
          </div>

          {/* Disponibilitate + imagini */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/60 bg-white/85 p-6 shadow-soft backdrop-blur">
              <h2 className="font-display text-xl text-ink">Disponibilitate</h2>
              <label className="mt-4 flex items-start gap-3 rounded-2xl border border-ink/10 bg-white/80 p-4">
                <input type="checkbox" checked={form.active} onChange={schimba("active")} className="mt-1 h-4 w-4" />
                <span>
                  <span className="block text-sm font-semibold text-ink">
                    Produs activ
                  </span>
                  <span className="block text-xs text-ink/60">
                    Debifat, produsul dispare din catalog, din cautari si din
                    recomandarile asistentului AI, dar ramane in comenzile deja
                    plasate.
                  </span>
                </span>
              </label>

              <p className="mt-4 text-xs text-ink/55">
                Foloseste dezactivarea in locul stergerii. Produsele sunt
                referite de comenzi cu ON DELETE RESTRICT, deci stergerea unui
                produs vandut este oricum refuzata de baza de date.
              </p>
            </div>

            <div className="rounded-3xl border border-white/60 bg-white/85 p-6 shadow-soft backdrop-blur">
              <h2 className="font-display text-xl text-ink">Imagini</h2>
              <div className="mt-4">
                <ImageManager productId={Number(id)} compact />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProduct;
