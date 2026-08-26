import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { isSupabaseConfigured, supabase } from "../supabaseClient";

// Valorile trebuie sa corespunda constrangerii `orders_status_check`.
const STATUSES = [
  { value: "noua", label: "Noua" },
  { value: "pregatire", label: "In pregatire" },
  { value: "livrare", label: "In livrare" },
  { value: "livrata", label: "Livrata" },
  { value: "anulata", label: "Anulata" },
];

const STATUS_CLASS = {
  noua: "bg-slate-100 text-slate-700",
  pregatire: "bg-blue-100 text-blue-800",
  livrare: "bg-amber-100 text-amber-800",
  livrata: "bg-emerald-100 text-emerald-800",
  anulata: "bg-rose-100 text-rose-800",
};

// `order_items.price` este pretul unitar; valoarea liniei se calculeaza.
const lineTotal = (item) => Number(item.price) * Number(item.quantity);

const formatPrice = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return `${n.toFixed(2)} lei`;
};

const formatDate = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function Orders() {
  const [orders, setOrders] = useState([]);
  const [state, setState] = useState("loading");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("toate");
  const [expandedId, setExpandedId] = useState(null);

  const supabaseReady = Boolean(isSupabaseConfigured && supabase);

  // Nu setam state inainte de primul `await`: altfel efectul de mai jos ar
  // declansa un render in cascada la fiecare montare.
  const loadOrders = useCallback(async () => {
    if (!supabaseReady) return;

    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, order_number, status, notes, payment_method, subtotal, shipping_cost, total, created_at, customers(id, full_name, email, phone, address), order_items(id, name, sku, quantity, price, products(name))",
      )
      .order("created_at", { ascending: false });

    if (error) {
      setState("error");
      setMessage(
        error.code === "42P01"
          ? "Tabelul orders nu exista. Ruleaza sql/002_comenzi.sql in Supabase."
          : error.message,
      );
      return;
    }

    setMessage("");
    setOrders(data ?? []);
    setState("ready");
  }, [supabaseReady]);

  useEffect(() => {
    // Incarcare la montare; setState-ul se intampla abia dupa raspunsul retelei.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrders();
  }, [loadOrders]);

  const changeStatus = async (orderId, status) => {
    const previous = orders;
    // Actualizare optimista, cu revenire daca serverul refuza.
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o)),
    );

    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) {
      setOrders(previous);
      setMessage(`Statusul nu a putut fi schimbat: ${error.message}`);
    }
  };

  const visibleOrders = useMemo(
    () =>
      filter === "toate"
        ? orders
        : orders.filter((order) => order.status === filter),
    [orders, filter],
  );

  const stats = useMemo(() => {
    const active = orders.filter((o) => o.status !== "anulata");
    return {
      count: orders.length,
      revenue: active.reduce((sum, o) => sum + Number(o.total || 0), 0),
      pending: orders.filter((o) => o.status === "noua").length,
    };
  }, [orders]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">
              Comenzi
            </p>
            <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
              Toate comenzile
            </h1>
            <p className="mt-2 max-w-xl text-sm text-ink/60">
              Comenzile plasate din magazin, direct din tabelul orders.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/70"
            >
              Inapoi la panou
            </Link>
            <button
              type="button"
              onClick={loadOrders}
              className="rounded-full bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
            >
              Reincarca
            </button>
          </div>
        </header>

        {/* Sumar */}
        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Comenzi totale", value: stats.count },
            { label: "Comenzi noi", value: stats.pending },
            { label: "Valoare totala", value: formatPrice(stats.revenue) },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-3xl border border-white/60 bg-white/85 p-5 shadow-soft backdrop-blur"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-ink/50">
                {card.label}
              </p>
              <p className="mt-2 font-display text-2xl text-ink">{card.value}</p>
            </div>
          ))}
        </section>

        {message ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {message}
          </div>
        ) : null}

        {!supabaseReady && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Supabase nu este configurat. Verifica VITE_SUPABASE_URL si
            VITE_SUPABASE_ANON_KEY.
          </div>
        )}

        <section className="mt-6 rounded-3xl border border-white/60 bg-white/85 p-6 shadow-soft backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-ink">Lista comenzi</h2>
            <div className="flex flex-wrap gap-1.5">
              {[{ value: "toate", label: "Toate" }, ...STATUSES].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    filter === item.value
                      ? "bg-ink text-white"
                      : "border border-ink/10 bg-white text-ink/60"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {state === "loading" && (
            <p className="mt-6 text-sm text-ink/50">Se incarca comenzile...</p>
          )}

          {state === "ready" && visibleOrders.length === 0 && (
            <p className="mt-6 text-sm text-ink/50">
              Nu exista comenzi pentru filtrul selectat.
            </p>
          )}

          <div className="mt-6 grid gap-3">
            {visibleOrders.map((order) => {
              const isOpen = expandedId === order.id;

              return (
                <article
                  key={order.id}
                  className="rounded-2xl border border-ink/5 bg-white/70 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isOpen ? null : order.id)}
                      className="text-left"
                    >
                      <p className="text-sm font-semibold text-ink">
                        {order.order_number || `Comanda #${order.id}`}
                      </p>
                      <p className="text-xs text-ink/60">
                        {order.customers?.full_name ?? "Client necunoscut"}
                        {order.customers?.phone
                          ? ` · ${order.customers.phone}`
                          : ""}
                      </p>
                      <p className="text-xs text-ink/40">
                        {formatDate(order.created_at)}
                      </p>
                    </button>

                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          STATUS_CLASS[order.status] || STATUS_CLASS.noua
                        }`}
                      >
                        {STATUSES.find((s) => s.value === order.status)?.label ||
                          order.status}
                      </span>

                      <select
                        value={order.status}
                        onChange={(e) => changeStatus(order.id, e.target.value)}
                        className="rounded-xl border border-ink/10 bg-white px-2 py-1.5 text-xs"
                      >
                        {STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>

                      <p className="w-24 text-right text-sm font-semibold text-ink">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="mt-4 grid gap-4 border-t border-ink/5 pt-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
                          Livrare
                        </p>
                        <p className="mt-2 text-sm text-ink/70">
                          {order.customers?.address ?? "-"}
                        </p>
                        {order.customers?.email ? (
                          <p className="text-xs text-ink/50">
                            {order.customers.email}
                          </p>
                        ) : null}
                        <p className="mt-2 text-xs text-ink/50">
                          Plata: {order.payment_method}
                        </p>
                        {order.notes ? (
                          <p className="mt-2 text-xs italic text-ink/50">
                            „{order.notes}”
                          </p>
                        ) : null}
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
                          Produse
                        </p>
                        <ul className="mt-2 space-y-1">
                          {(order.order_items || []).map((item) => (
                            <li
                              key={item.id}
                              className="flex justify-between text-sm text-ink/70"
                            >
                              <span className="truncate pr-2">
                                {item.name ?? item.products?.name ?? "Produs"} ×{" "}
                                {item.quantity}
                              </span>
                              <span>{formatPrice(lineTotal(item))}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-2 border-t border-ink/5 pt-2 text-xs text-ink/50">
                          Produse {formatPrice(order.subtotal)} · Livrare{" "}
                          {formatPrice(order.shipping_cost)}
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Orders;
