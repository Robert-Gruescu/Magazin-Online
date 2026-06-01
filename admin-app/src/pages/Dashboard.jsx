import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { isSupabaseConfigured, supabase } from "../supabaseClient";

const metricsFallback = [
  { label: "Total produse", value: "-" },
  { label: "Produse adaugate azi", value: "-" },
  { label: "Fara zahar", value: "-" },
  { label: "Bio", value: "-" },
];

const quickActions = [
  {
    title: "Publica promotie",
    detail: "Campanii pe 7 zile pentru produse sezoniere",
  },
  {
    title: "Reaprovizionare rapida",
    detail: "Genereaza comenzi catre furnizori prioritari",
  },
  {
    title: "Revizuire livrari",
    detail: "Verifica statusul coletelor intarziate",
  },
];

const alerts = [
  {
    title: "Transport express activ",
    detail: "12 comenzi vor pleca azi pana la 18:00",
  },
  {
    title: "Preturi sincronizate",
    detail: "Ultimul import a rulat acum 2 ore",
  },
  {
    title: "Feedback clienti",
    detail: "4 recenzii asteapta aprobare",
  },
];

const recentProductsFallback = [];

function Dashboard() {
  const [supabaseState, setSupabaseState] = useState("idle");
  const [metrics, setMetrics] = useState(metricsFallback);
  const [recentProducts, setRecentProducts] = useState(recentProductsFallback);
  const [dataState, setDataState] = useState("idle");

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setSupabaseState("missing");
      setDataState("missing");
      return;
    }

    let active = true;

    const checkSupabase = async () => {
      setSupabaseState("checking");
      try {
        const { error } = await supabase.auth.getSession();
        if (!active) return;
        setSupabaseState(error ? "error" : "ready");
      } catch (err) {
        if (!active) return;
        setSupabaseState("error");
      }
    };

    const loadDashboard = async () => {
      setDataState("loading");
      const now = new Date();
      const startOfDay = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
      ).toISOString();

      const [totalRes, todayRes, faraZaharRes, bioRes, recentRes] =
        await Promise.all([
          supabase
            .from("products")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("products")
            .select("id", { count: "exact", head: true })
            .gte("created_at", startOfDay),
          supabase
            .from("products")
            .select("id", { count: "exact", head: true })
            .eq("fara_zahar", true),
          supabase
            .from("products")
            .select("id", { count: "exact", head: true })
            .eq("bio", true),
          supabase
            .from("products")
            .select("id, name, price, created_at")
            .order("created_at", { ascending: false })
            .limit(3),
        ]);

      if (!active) return;

      if (
        totalRes.error ||
        todayRes.error ||
        faraZaharRes.error ||
        bioRes.error ||
        recentRes.error
      ) {
        setDataState("error");
        return;
      }

      setMetrics([
        { label: "Total produse", value: totalRes.count ?? 0 },
        { label: "Produse adaugate azi", value: todayRes.count ?? 0 },
        { label: "Fara zahar", value: faraZaharRes.count ?? 0 },
        { label: "Bio", value: bioRes.count ?? 0 },
      ]);
      setRecentProducts(recentRes.data ?? []);
      setDataState("ready");
    };

    checkSupabase();
    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const supabaseBadge = useMemo(() => {
    const states = {
      idle: {
        label: "In asteptare",
        className: "bg-stone/70 text-ink",
      },
      missing: {
        label: "Lipsesc variabilele de mediu",
        className: "bg-amber-100 text-amber-800",
      },
      checking: {
        label: "Verificare conectare",
        className: "bg-sand text-ink",
      },
      ready: {
        label: "Conectat la Supabase",
        className: "bg-emerald-100 text-emerald-800",
      },
      error: {
        label: "Eroare la conectare",
        className: "bg-rose-100 text-rose-800",
      },
    };

    return states[supabaseState] ?? states.idle;
  }, [supabaseState]);

  const dataHint = useMemo(() => {
    const states = {
      idle: "",
      loading: "Se incarca datele...",
      ready: "",
      error: "Nu am putut incarca datele din produse.",
      missing: "Supabase nu este configurat pentru date live.",
    };

    return states[dataState] ?? "";
  }, [dataState]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">
              Admin panel
            </p>
            <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
              Magazin Online
            </h1>
            <p className="mt-2 max-w-xl text-sm text-ink/60">
              Gestionare rapida a comenzilor, produselor si campaniilor active.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-ink/10 bg-white/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-ink/70">
              Live
            </span>
            <Link
              to="/products/new"
              className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
            >
              Nou produs
            </Link>
          </div>
        </header>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-soft backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-ink">Rezumat</h2>
              <span className="text-xs uppercase tracking-[0.25em] text-ink/50">
                Ultimele 24h
              </span>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-ink/5 bg-white/70 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
                    {metric.label}
                  </p>
                  <div className="mt-3 flex items-end justify-between">
                    <span className="text-2xl font-semibold text-ink">
                      {metric.value}
                    </span>
                    {dataState === "loading" ? (
                      <span className="text-xs font-semibold text-moss">
                        ...
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
            {dataHint ? (
              <p className="mt-3 text-xs text-ink/60">{dataHint}</p>
            ) : null}
            <div className="relative mt-6 overflow-hidden rounded-2xl border border-ink/10 bg-sand p-5">
              <div className="absolute inset-0 opacity-30">
                <div className="h-full w-1/2 animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
              </div>
              <p className="relative text-sm font-semibold text-ink">
                Focus astazi: optimizare stoc si validare livrari rapide.
              </p>
              <p className="relative mt-2 text-xs text-ink/60">
                Prioritizeaza produsele cu rulaj mare si verifica fluxul
                curierilor.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/60 bg-white/75 p-6 shadow-soft backdrop-blur">
            <h2 className="font-display text-2xl text-ink">Flux rapid</h2>
            <div className="mt-5 space-y-4">
              {quickActions.map((action) => (
                <div
                  key={action.title}
                  className="rounded-2xl border border-ink/5 bg-white/70 p-4"
                >
                  <p className="text-sm font-semibold text-ink">
                    {action.title}
                  </p>
                  <p className="mt-1 text-xs text-ink/60">{action.detail}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-dashed border-ink/20 bg-white/60 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
                Supabase
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${supabaseBadge.className}`}
                >
                  {supabaseBadge.label}
                </span>
                <span className="text-xs text-ink/60">
                  Configureaza .env.local pentru autentificare si date live.
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {alerts.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-ink/5 bg-white/70 p-4 shadow-soft"
            >
              <p className="text-sm font-semibold text-ink">{item.title}</p>
              <p className="mt-2 text-xs text-ink/60">{item.detail}</p>
            </div>
          ))}
        </section>

        <section className="mt-10 rounded-3xl border border-white/60 bg-white/85 p-6 shadow-soft backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-ink">Produse recente</h2>
            <Link
              to="/orders"
              className="rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/70"
            >
              Vezi toate comenzile
            </Link>
          </div>
          <div className="mt-6 grid gap-3">
            {recentProducts.length ? (
              recentProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ink/5 bg-white/70 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {product.name}
                    </p>
                    <p className="text-xs text-ink/60">ID #{product.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-ink">
                      {product.price} lei
                    </p>
                    <p className="text-xs text-ink/60">
                      {new Date(product.created_at).toLocaleDateString("ro-RO")}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-ink/10 bg-white/70 px-4 py-3 text-sm text-ink/60">
                Nu exista produse inca.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
