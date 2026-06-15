import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { isSupabaseConfigured, supabase } from "../supabaseClient";

const initialForm = {
  name: "",
  description: "",
  oldPrice: "",
  price: "",
  imageUrl: "",
  validUntil: "",
};

function WeeklyDeals() {
  const [formValues, setFormValues] = useState(initialForm);
  const [deals, setDeals] = useState([]);
  const [listState, setListState] = useState("idle");
  const [submitState, setSubmitState] = useState("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  const supabaseReady = Boolean(isSupabaseConfigured && supabase);

  const loadDeals = async () => {
    if (!supabaseReady) {
      setListState("missing");
      return;
    }
    setListState("loading");
    const { data, error } = await supabase
      .from("weekly_deals")
      .select("id, name, old_price, price, valid_until, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      setListState("error");
      return;
    }
    setDeals(data ?? []);
    setListState("ready");
  };

  useEffect(() => {
    loadDeals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabaseReady]);

  const handleChange = (field) => (event) => {
    setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
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
    const oldPriceValue = Number.parseFloat(formValues.oldPrice);
    const priceValue = Number.parseFloat(formValues.price);

    if (!trimmedName) {
      setSubmitState("error");
      setSubmitMessage("Numele produsului este obligatoriu.");
      return;
    }
    if (!Number.isFinite(oldPriceValue) || oldPriceValue <= 0) {
      setSubmitState("error");
      setSubmitMessage("Introdu un pret vechi valid.");
      return;
    }
    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      setSubmitState("error");
      setSubmitMessage("Introdu un pret redus valid.");
      return;
    }
    if (priceValue >= oldPriceValue) {
      setSubmitState("error");
      setSubmitMessage("Pretul redus trebuie sa fie mai mic decat cel vechi.");
      return;
    }

    setSubmitState("submitting");

    const payload = {
      name: trimmedName,
      description: formValues.description.trim() || null,
      old_price: Number(oldPriceValue.toFixed(2)),
      price: Number(priceValue.toFixed(2)),
      image_url: formValues.imageUrl.trim() || null,
      valid_until: formValues.validUntil || null,
    };

    const { error } = await supabase.from("weekly_deals").insert(payload);

    if (error) {
      setSubmitState("error");
      setSubmitMessage("Reducerea nu a putut fi salvata. Incearca din nou.");
      return;
    }

    setSubmitState("success");
    setSubmitMessage("Reducerea a fost adaugata cu succes.");
    setFormValues(initialForm);
    loadDeals();
  };

  const handleDelete = async (id) => {
    if (!supabaseReady) return;
    const { error } = await supabase.from("weekly_deals").delete().eq("id", id);
    if (!error) {
      setDeals((prev) => prev.filter((deal) => deal.id !== id));
    }
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
              Promotii
            </p>
            <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
              Reducerile saptamanii
            </h1>
            <p className="mt-2 max-w-xl text-sm text-ink/60">
              Adauga si gestioneaza ofertele din tabela weekly_deals.
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
          {/* Formular adaugare */}
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-white/60 bg-white/85 p-6 shadow-soft backdrop-blur"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-ink">Adauga reducere</h2>
              <span className="text-xs uppercase tracking-[0.25em] text-ink/50">
                Formular
              </span>
            </div>

            <div className="mt-6 grid gap-4">
              <label className="grid gap-2">
                <span className="text-xs uppercase tracking-[0.2em] text-ink/50">
                  Nume produs
                </span>
                <input
                  type="text"
                  value={formValues.name}
                  onChange={handleChange("name")}
                  placeholder="Ex: Ulei de floarea-soarelui 1L"
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
                  placeholder="Scurta descriere pentru oferta"
                  rows={3}
                  className="rounded-2xl border border-ink/10 bg-white/90 px-4 py-3 text-sm"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-ink/50">
                    Pret vechi (lei)
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={formValues.oldPrice}
                    onChange={handleChange("oldPrice")}
                    placeholder="0.00"
                    className="rounded-2xl border border-ink/10 bg-white/90 px-4 py-3 text-sm"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-ink/50">
                    Pret redus (lei)
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

              <label className="grid gap-2">
                <span className="text-xs uppercase tracking-[0.2em] text-ink/50">
                  Valabil pana la
                </span>
                <input
                  type="date"
                  value={formValues.validUntil}
                  onChange={handleChange("validUntil")}
                  className="rounded-2xl border border-ink/10 bg-white/90 px-4 py-3 text-sm"
                />
              </label>

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
                {isSubmitting ? "Se salveaza..." : "Adauga reducere"}
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

          {/* Lista reduceri existente */}
          <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-soft backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-ink">Reduceri active</h2>
              <span className="text-xs uppercase tracking-[0.25em] text-ink/50">
                {deals.length}
              </span>
            </div>

            <div className="mt-5 grid gap-3">
              {listState === "loading" && (
                <p className="text-sm text-ink/60">Se incarca reducerile...</p>
              )}
              {listState === "error" && (
                <p className="text-sm text-rose-700">
                  Nu am putut incarca reducerile.
                </p>
              )}
              {listState === "missing" && (
                <p className="text-sm text-amber-700">
                  Supabase nu este configurat pentru date live.
                </p>
              )}
              {listState === "ready" && deals.length === 0 && (
                <p className="text-sm text-ink/60">
                  Nu exista reduceri inca. Adauga prima din formular.
                </p>
              )}

              {deals.map((deal) => (
                <div
                  key={deal.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/5 bg-white/70 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {deal.name}
                    </p>
                    <p className="text-xs text-ink/60">
                      <span className="line-through">
                        {Number(deal.old_price).toFixed(2)} lei
                      </span>{" "}
                      <span className="font-semibold text-rose-600">
                        {Number(deal.price).toFixed(2)} lei
                      </span>
                      {deal.valid_until
                        ? ` • pana la ${new Date(
                            deal.valid_until,
                          ).toLocaleDateString("ro-RO")}`
                        : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(deal.id)}
                    className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                  >
                    Sterge
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default WeeklyDeals;
