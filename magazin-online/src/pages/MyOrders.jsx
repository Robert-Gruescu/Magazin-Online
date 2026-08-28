import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Seo from "../components/Seo";
import Icon from "../components/Icon";
import { useAuth } from "../context/AuthContext";
import { fetchMyOrders, itemLabel, itemTotal } from "../services/orders";
import { formatPrice } from "../lib/format";
import { statusInfo } from "../lib/orderStatus";

const formatDate = (value) =>
  new Date(value).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const MyOrders = () => {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Cazul „fără user" e tratat direct în render, nu are nevoie de state.
    if (authLoading || !user) return;

    let isMounted = true;
    fetchMyOrders().then(({ data, error: fetchError }) => {
      if (!isMounted) return;
      if (fetchError) setError(fetchError);
      else setOrders(data);
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  if (!authLoading && !user) {
    return (
      <Layout>
      <Seo title="Comenzile mele" noindex />
        <div className="py-24 text-center">
          <Icon name="user" className="mx-auto h-10 w-10 text-slate-300" />
          <h1 className="mt-4 font-display text-2xl font-bold text-ink">
            Autentifică-te ca să-ți vezi comenzile
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Comenzile plasate fără cont pot fi urmărite doar telefonic.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-volt"
          >
            Autentificare
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-volt">
          Contul meu
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
          Comenzile mele
        </h1>
      </header>

      {(loading || authLoading) && (
        <div className="mt-8 space-y-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
            />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="text-sm text-slate-500">Nu ai plasat încă nicio comandă.</p>
          <Link
            to="/produse"
            className="mt-4 inline-block rounded-xl bg-ink px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-volt"
          >
            Vezi produsele
          </Link>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="mt-8 space-y-4">
          {orders.map((order) => {
            const status = statusInfo(order.status);
            return (
              <article
                key={order.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-bold text-ink">
                      {order.order_number || `Comanda #${order.id}`}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <span
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>

                <ul className="mt-4 space-y-1.5 border-t border-slate-100 pt-4">
                  {(order.order_items || []).map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between text-sm text-slate-600"
                    >
                      <span className="truncate pr-3">
                        {itemLabel(item)} × {item.quantity}
                      </span>
                      <span className="shrink-0">
                        {formatPrice(itemTotal(item))}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex items-baseline justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs text-slate-400">
                    Livrare:{" "}
                    {Number(order.shipping_cost) === 0
                      ? "gratuit"
                      : formatPrice(order.shipping_cost)}
                  </span>
                  <span className="font-display text-lg font-bold text-ink">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </Layout>
  );
};

export default MyOrders;
