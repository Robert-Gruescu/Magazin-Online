import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Seo from "../components/Seo";
import Icon from "../components/Icon";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/format";
import { FREE_SHIPPING_THRESHOLD, shippingFor } from "../services/orders";

const Cart = () => {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

  const shipping = shippingFor(totalPrice);
  const remaining = FREE_SHIPPING_THRESHOLD - totalPrice;

  if (items.length === 0) {
    return (
      <Layout>
      <Seo title="Coșul tău" noindex />
        <div className="py-24 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <Icon name="cart" className="h-7 w-7 text-slate-300" />
          </span>
          <h1 className="mt-6 font-display text-2xl font-bold text-ink">
            Coșul tău este gol
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Adaugă produse din catalog ca să continui.
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

  return (
    <Layout>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-volt">
            Pasul 1 din 2
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
            Coșul tău
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {totalItems} {totalItems === 1 ? "produs" : "produse"} în coș
          </p>
        </div>
        <Link
          to="/produse"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:text-ink"
        >
          Continuă cumpărăturile
        </Link>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Lista */}
        <div className="space-y-3">
          {items.map((item) => {
            const maxed =
              typeof item.stock === "number" && item.quantity >= item.stock;

            return (
              <div
                key={item.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft"
              >
                <Link
                  to={`/produs/${item.id}`}
                  className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50"
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-300">
                      —
                    </div>
                  )}
                </Link>

                <div className="min-w-0 flex-1">
                  {item.brand && (
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-volt">
                      {item.brand}
                    </span>
                  )}
                  <Link
                    to={`/produs/${item.id}`}
                    className="block truncate font-display text-sm font-semibold text-ink transition hover:text-volt"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {formatPrice(item.price)} / buc
                  </p>
                  {maxed && (
                    <p className="mt-1 text-[11px] text-amber-600">
                      Ai atins stocul disponibil.
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 rounded-xl border border-slate-200 p-1">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-50"
                    aria-label="Scade cantitatea"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-semibold text-ink">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={maxed}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-50 disabled:opacity-30"
                    aria-label="Crește cantitatea"
                  >
                    +
                  </button>
                </div>

                <div className="w-28 text-right">
                  <p className="font-display text-sm font-bold text-ink">
                    {formatPrice(Number(item.price) * item.quantity)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-300 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500"
                  aria-label="Șterge produsul"
                >
                  <Icon name="close" className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Sumar */}
        <aside className="lg:sticky lg:top-40 lg:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold text-ink">Sumar</h2>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Livrare estimată</span>
                <span className={shipping === 0 ? "text-emerald-600" : ""}>
                  {shipping === 0 ? "Gratuit" : formatPrice(shipping)}
                </span>
              </div>
            </div>

            {shipping > 0 && (
              <div className="mt-4 rounded-xl bg-volt/5 p-3">
                <p className="text-[11px] text-volt">
                  Mai adaugă {formatPrice(remaining)} pentru livrare gratuită.
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-volt/15">
                  <div
                    className="h-full rounded-full bg-volt transition-all"
                    style={{
                      width: `${Math.min(100, (totalPrice / FREE_SHIPPING_THRESHOLD) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="mt-5 flex items-baseline justify-between border-t border-slate-100 pt-4">
              <span className="text-sm text-slate-500">Total</span>
              <span className="font-display text-2xl font-bold text-ink">
                {formatPrice(totalPrice + shipping)}
              </span>
            </div>

            <Link
              to="/checkout"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-3.5 text-sm font-semibold text-white transition hover:bg-volt"
            >
              Finalizează comanda
              <Icon name="chevronRight" className="h-4 w-4" />
            </Link>

            <ul className="mt-5 space-y-2 border-t border-slate-100 pt-4">
              {[
                "Retur gratuit în 30 de zile",
                "Factură și garanție incluse",
                "Plata la livrare disponibilă",
              ].map((line) => (
                <li
                  key={line}
                  className="flex items-center gap-2 text-[11px] text-slate-500"
                >
                  <Icon name="check" className="h-3.5 w-3.5 text-emerald-500" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </Layout>
  );
};

export default Cart;
