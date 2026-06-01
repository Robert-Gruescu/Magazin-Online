const orders = [
  {
    id: "MN-2049",
    customer: "Bianca Ionescu",
    total: "410 lei",
    status: "Pregatire",
  },
  {
    id: "MN-2050",
    customer: "Daniel Pop",
    total: "118 lei",
    status: "Noua",
  },
  {
    id: "MN-2051",
    customer: "Nicoleta Dragomir",
    total: "650 lei",
    status: "Livrare",
  },
  {
    id: "MN-2052",
    customer: "Cosmin Sava",
    total: "235 lei",
    status: "Pregatire",
  },
  {
    id: "MN-2053",
    customer: "Andra Ciobanu",
    total: "520 lei",
    status: "Livrare",
  },
];

function Orders() {
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
              Vizualizeaza comenzile recente din magazin.
            </p>
          </div>
          <span className="rounded-full border border-ink/10 bg-white/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-ink/70">
            Live
          </span>
        </header>

        <section className="mt-10 rounded-3xl border border-white/60 bg-white/85 p-6 shadow-soft backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-ink">Lista comenzi</h2>
            <span className="text-xs uppercase tracking-[0.25em] text-ink/50">
              Ultimele 24h
            </span>
          </div>
          <div className="mt-6 grid gap-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ink/5 bg-white/70 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-ink">{order.id}</p>
                  <p className="text-xs text-ink/60">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-ink">
                    {order.total}
                  </p>
                  <p className="text-xs text-ink/60">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Orders;
