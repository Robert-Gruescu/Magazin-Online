import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

const initialForm = {
  fullName: "",
  phone: "",
  address: "",
  city: "",
  notes: "",
};

function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const [formValues, setFormValues] = useState(initialForm);
  const [placed, setPlaced] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (field) => (event) => {
    setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!formValues.fullName.trim()) {
      setError("Numele complet este obligatoriu.");
      return;
    }
    if (!formValues.phone.trim()) {
      setError("Numărul de telefon este obligatoriu.");
      return;
    }
    if (!formValues.address.trim() || !formValues.city.trim()) {
      setError("Adresa și orașul sunt obligatorii.");
      return;
    }

    clearCart();
    setPlaced(true);
  };

  return (
    <div className="relative min-h-screen overflow-hidden font-sans">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, #f4e8e1 0%, #f7f5f2 52%, #eef2f5 100%)",
        }}
      />
      <div className="absolute left-37.5 top-25 h-125 w-125 rounded-full bg-[#f0d8cb] opacity-25 blur-[120px]" />
      <div className="absolute right-37.5 top-25 h-125 w-125 rounded-full bg-[#dfe7ee] opacity-25 blur-[120px]" />

      <div className="relative z-10">
        <Navbar />

        <div className="mx-auto max-w-5xl px-6 py-10">
          <header className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-ink/40">
                Finalizare comandă
              </p>
              <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
                Checkout
              </h1>
            </div>
            <Link
              to="/cart"
              className="rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/60 transition hover:bg-white"
            >
              Înapoi la coș
            </Link>
          </header>

          {/* Comandă plasată cu succes */}
          {placed ? (
            <div className="mt-16 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50">
                <svg
                  className="h-8 w-8 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h2 className="font-display text-2xl text-ink">
                Comanda a fost plasată!
              </h2>
              <p className="mt-2 text-sm text-ink/55">
                Îți mulțumim, {formValues.fullName}. Te vom contacta la{" "}
                {formValues.phone} pentru confirmare.
              </p>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="mt-6 rounded-full bg-ink px-6 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
              >
                Înapoi la produse
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="mt-20 text-center">
              <p className="text-sm text-ink/40">
                Coșul este gol. Adaugă produse înainte de a comanda.
              </p>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="mt-4 rounded-full bg-ink px-6 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
              >
                Vezi produsele
              </button>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              {/* Formular livrare */}
              <form
                onSubmit={handleSubmit}
                className="rounded-3xl border border-white/60 bg-white/85 p-6 shadow-soft backdrop-blur"
              >
                <h2 className="font-display text-2xl text-ink">Date livrare</h2>

                <div className="mt-6 grid gap-4">
                  <label className="grid gap-2">
                    <span className="text-xs uppercase tracking-[0.2em] text-ink/50">
                      Nume complet
                    </span>
                    <input
                      type="text"
                      value={formValues.fullName}
                      onChange={handleChange("fullName")}
                      placeholder="Ex: Andrei Popescu"
                      className="rounded-2xl border border-ink/10 bg-white/90 px-4 py-3 text-sm"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-xs uppercase tracking-[0.2em] text-ink/50">
                      Telefon
                    </span>
                    <input
                      type="tel"
                      value={formValues.phone}
                      onChange={handleChange("phone")}
                      placeholder="07xx xxx xxx"
                      className="rounded-2xl border border-ink/10 bg-white/90 px-4 py-3 text-sm"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-xs uppercase tracking-[0.2em] text-ink/50">
                      Adresă
                    </span>
                    <input
                      type="text"
                      value={formValues.address}
                      onChange={handleChange("address")}
                      placeholder="Stradă, număr, bloc, ap."
                      className="rounded-2xl border border-ink/10 bg-white/90 px-4 py-3 text-sm"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-xs uppercase tracking-[0.2em] text-ink/50">
                      Oraș
                    </span>
                    <input
                      type="text"
                      value={formValues.city}
                      onChange={handleChange("city")}
                      placeholder="Ex: Cluj-Napoca"
                      className="rounded-2xl border border-ink/10 bg-white/90 px-4 py-3 text-sm"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-xs uppercase tracking-[0.2em] text-ink/50">
                      Observații (opțional)
                    </span>
                    <textarea
                      value={formValues.notes}
                      onChange={handleChange("notes")}
                      rows={3}
                      placeholder="Detalii pentru curier"
                      className="rounded-2xl border border-ink/10 bg-white/90 px-4 py-3 text-sm"
                    />
                  </label>

                  {error ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                      {error}
                    </div>
                  ) : null}
                </div>

                <button
                  type="submit"
                  className="mt-6 w-full rounded-full bg-ink py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
                >
                  Confirmă comanda
                </button>
              </form>

              {/* Sumar comandă */}
              <div className="rounded-3xl border border-white/60 bg-white/85 p-6 shadow-soft backdrop-blur">
                <h2 className="font-display text-xl text-ink">Comanda ta</h2>
                <div className="mt-4 space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-xs text-ink/55"
                    >
                      <span className="truncate pr-2">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="flex-shrink-0">
                        {(Number(item.price) * item.quantity).toFixed(2)} lei
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 border-t border-ink/8 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ink/60">Total</span>
                    <span className="font-display text-2xl text-ink">
                      {totalPrice.toFixed(2)} lei
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Checkout;
