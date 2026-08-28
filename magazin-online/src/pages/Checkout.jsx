import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Seo from "../components/Seo";
import Icon from "../components/Icon";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/format";
import {
  FREE_SHIPPING_THRESHOLD,
  placeOrder,
  shippingFor,
} from "../services/orders";

const PAYMENT_METHODS = [
  {
    value: "ramburs",
    label: "Ramburs la curier",
    hint: "Plătești în numerar sau cu cardul la livrare.",
  },
  {
    value: "transfer",
    label: "Transfer bancar",
    hint: "Îți trimitem factura proformă pe email.",
  },
];

const emptyForm = {
  full_name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  county: "",
  notes: "",
  payment_method: "ramburs",
};

const Field = ({ label, error, children }) => (
  <label className="grid gap-1.5">
    <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
      {label}
    </span>
    {children}
    {error && <span className="text-xs text-rose-600">{error}</span>}
  </label>
);

const inputClass =
  "rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-slate-300 focus:border-volt focus:outline-none focus:ring-2 focus:ring-volt/20";

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();

  const [form, setForm] = useState({
    ...emptyForm,
    email: user?.email || "",
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  const shipping = shippingFor(totalPrice);
  const grandTotal = totalPrice + shipping;

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.full_name.trim()) next.full_name = "Numele complet este obligatoriu.";
    if (!/^[0-9+\s().-]{9,}$/.test(form.phone.trim()))
      next.phone = "Introdu un număr de telefon valid.";
    // Emailul identifica clientul in tabelul `customers`, deci e obligatoriu.
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
      next.email = "Introdu o adresă de email validă.";
    if (!form.address.trim()) next.address = "Adresa este obligatorie.";
    if (!form.city.trim()) next.city = "Orașul este obligatoriu.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");

    if (!validate()) return;

    setSubmitting(true);
    const { data, error } = await placeOrder(form, items);
    setSubmitting(false);

    if (error) {
      setSubmitError(error);
      return;
    }

    setConfirmation(data);
    clearCart();
    window.scrollTo({ top: 0 });
  };

  // --- Confirmare ---
  if (confirmation) {
    return (
      <Layout>
      <Seo title="Finalizare comandă" noindex />
        <div className="mx-auto max-w-lg py-20 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Icon name="check" className="h-8 w-8" />
          </span>
          <h1 className="mt-6 font-display text-3xl font-bold text-ink">
            Comanda a fost înregistrată
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Mulțumim, {form.full_name}! Te contactăm la {form.phone} pentru
            confirmare.
          </p>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Număr comandă
              </span>
              <span className="font-display text-lg font-bold text-ink">
                {confirmation.order_number}
              </span>
            </div>
            <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Produse</span>
                <span>{formatPrice(confirmation.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Livrare</span>
                <span>
                  {Number(confirmation.shipping_cost) === 0
                    ? "Gratuit"
                    : formatPrice(confirmation.shipping_cost)}
                </span>
              </div>
              <div className="flex justify-between pt-2 font-display text-lg font-bold text-ink">
                <span>Total</span>
                <span>{formatPrice(confirmation.total)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/produse"
              className="rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-volt"
            >
              Continuă cumpărăturile
            </Link>
            {user && (
              <Link
                to="/comenzile-mele"
                className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:text-ink"
              >
                Vezi comenzile mele
              </Link>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // --- Coș gol ---
  if (items.length === 0) {
    return (
      <Layout>
        <div className="py-24 text-center">
          <Icon name="cart" className="mx-auto h-10 w-10 text-slate-300" />
          <h1 className="mt-4 font-display text-2xl font-bold text-ink">
            Coșul este gol
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Adaugă produse înainte de a finaliza comanda.
          </p>
          <Link
            to="/produse"
            className="mt-6 inline-block rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-volt"
          >
            Vezi produsele
          </Link>
        </div>
      </Layout>
    );
  }

  // --- Formular ---
  return (
    <Layout>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-volt">
            Pasul 2 din 2
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
            Finalizare comandă
          </h1>
        </div>
        <Link
          to="/cart"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:text-ink"
        >
          Înapoi la coș
        </Link>
      </header>

      <form
        onSubmit={handleSubmit}
        className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]"
      >
        {/* Date livrare */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold text-ink">
              Date de livrare
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Nume complet" error={errors.full_name}>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={handleChange("full_name")}
                    placeholder="Andrei Popescu"
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="Telefon" error={errors.phone}>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={handleChange("phone")}
                  placeholder="07xx xxx xxx"
                  className={inputClass}
                />
              </Field>

              <Field label="Email" error={errors.email}>
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  placeholder="adresa@email.com"
                  className={inputClass}
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Adresă" error={errors.address}>
                  <input
                    type="text"
                    value={form.address}
                    onChange={handleChange("address")}
                    placeholder="Stradă, număr, bloc, apartament"
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="Oraș" error={errors.city}>
                <input
                  type="text"
                  value={form.city}
                  onChange={handleChange("city")}
                  placeholder="Cluj-Napoca"
                  className={inputClass}
                />
              </Field>

              <Field label="Județ (opțional)">
                <input
                  type="text"
                  value={form.county}
                  onChange={handleChange("county")}
                  placeholder="Cluj"
                  className={inputClass}
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Observații (opțional)">
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={handleChange("notes")}
                    placeholder="Detalii pentru curier"
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>
          </section>

          {/* Plată */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold text-ink">
              Modalitate de plată
            </h2>
            <div className="mt-4 grid gap-3">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                    form.payment_method === method.value
                      ? "border-volt bg-volt/5"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value={method.value}
                    checked={form.payment_method === method.value}
                    onChange={handleChange("payment_method")}
                    className="mt-0.5 h-4 w-4 accent-volt"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-ink">
                      {method.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {method.hint}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Sumar */}
        <aside className="lg:sticky lg:top-40 lg:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold text-ink">
              Comanda ta
            </h2>

            <ul className="mt-4 space-y-3">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-contain p-1"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-ink">
                    {formatPrice(Number(item.price) * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Livrare</span>
                <span className={shipping === 0 ? "text-emerald-600" : ""}>
                  {shipping === 0 ? "Gratuit" : formatPrice(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                <p className="rounded-lg bg-volt/5 px-3 py-2 text-[11px] text-volt">
                  Mai adaugă {formatPrice(FREE_SHIPPING_THRESHOLD - totalPrice)}{" "}
                  pentru livrare gratuită.
                </p>
              )}
              <div className="flex items-baseline justify-between border-t border-slate-100 pt-3">
                <span className="text-sm text-slate-500">Total</span>
                <span className="font-display text-2xl font-bold text-ink">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>

            {submitError && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-5 w-full rounded-xl bg-ink py-3.5 text-sm font-semibold text-white transition hover:bg-volt disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Se trimite comanda…" : "Trimite comanda"}
            </button>

            <p className="mt-3 text-center text-[11px] text-slate-400">
              Prin trimiterea comenzii accepți termenii și condițiile.
            </p>
          </div>
        </aside>
      </form>
    </Layout>
  );
};

export default Checkout;
