import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Seo from "../components/Seo";
import Icon from "../components/Icon";
import supabase from "../services/supabaseClient";
import { discountPercent, formatPrice } from "../lib/format";

const isStillValid = (validUntil) => {
  if (!validUntil) return true;
  const until = new Date(validUntil);
  if (Number.isNaN(until.getTime())) return true;
  until.setHours(23, 59, 59, 999); // valabil până la sfârșitul zilei
  return until.getTime() >= Date.now();
};

const formatDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("ro-RO", { day: "numeric", month: "long" });
};

const daysLeft = (validUntil) => {
  if (!validUntil) return null;
  const until = new Date(validUntil);
  if (Number.isNaN(until.getTime())) return null;
  until.setHours(23, 59, 59, 999);
  const diff = Math.ceil((until.getTime() - Date.now()) / 86400000);
  return diff >= 0 ? diff : null;
};

const WeeklyDeals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("weekly_deals")
        .select(
          "id, name, description, old_price, price, image_url, valid_until",
        )
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (fetchError) {
        setError("Nu am putut încărca reducerile.");
        setDeals([]);
      } else {
        setDeals((data || []).filter((deal) => isStillValid(deal.valid_until)));
      }

      setLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Layout>
      <Seo
        title="Reducerile săptămânii"
        description="Ofertele săptămânii la electronice: laptopuri, telefoane, componente PC și gaming, cu reduceri de până la 40%."
        path="/reduceri"
      />

      {/* Antet */}
      <div className="relative overflow-hidden rounded-3xl bg-ink px-8 py-12 text-white">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-rose-500/25 blur-[100px]" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em]">
            <Icon name="tag" className="h-3 w-3" />
            Oferte limitate
          </span>
          <h1 className="mt-5 font-display text-3xl font-bold sm:text-4xl">
            Reducerile săptămânii
          </h1>
          <p className="mt-3 text-sm text-white/55">
            {loading
              ? "Se încarcă…"
              : `${deals.length} ${deals.length === 1 ? "ofertă activă" : "oferte active"} · valabile în limita stocului`}
          </p>
        </div>
      </div>

      {loading && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
            />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      {!loading && !error && deals.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="text-sm text-slate-500">
            Nu există reduceri active momentan. Revino luni!
          </p>
          <Link
            to="/produse"
            className="mt-4 inline-block rounded-xl bg-ink px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-volt"
          >
            Vezi catalogul
          </Link>
        </div>
      )}

      {!loading && !error && deals.length > 0 && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {deals.map((deal) => {
            const percent = discountPercent(deal.old_price, deal.price);
            const validLabel = formatDate(deal.valid_until);
            const remaining = daysLeft(deal.valid_until);

            return (
              <article
                key={deal.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-lift"
              >
                {percent != null && (
                  <span className="absolute left-3 top-3 z-10 rounded-md bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white">
                    -{percent}%
                  </span>
                )}
                {remaining != null && remaining <= 3 && (
                  <span className="absolute right-3 top-3 z-10 rounded-md bg-ink px-2 py-0.5 text-[11px] font-bold text-white">
                    {remaining === 0
                      ? "Ultima zi"
                      : `${remaining} ${remaining === 1 ? "zi" : "zile"}`}
                  </span>
                )}

                <div className="aspect-4/3 w-full overflow-hidden bg-slate-100">
                  {deal.image_url ? (
                    <img
                      src={deal.image_url}
                      alt={deal.name}
                      loading="lazy"
                      className="h-full w-full object-contain p-4 transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                      Imagine indisponibilă
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <h2 className="font-display text-[15px] font-semibold leading-snug text-ink">
                    {deal.name}
                  </h2>

                  {deal.description && (
                    <p className="mt-1.5 line-clamp-2 text-xs text-slate-500">
                      {deal.description}
                    </p>
                  )}

                  <div className="mt-auto pt-4">
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-xl font-bold text-rose-600">
                        {formatPrice(deal.price) ?? "Preț indisponibil"}
                      </span>
                      {deal.old_price != null && (
                        <span className="text-sm text-slate-400 line-through">
                          {formatPrice(deal.old_price)}
                        </span>
                      )}
                    </div>

                    {validLabel && (
                      <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Icon name="clock" className="h-3.5 w-3.5" />
                        Valabil până la {validLabel}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </Layout>
  );
};

export default WeeklyDeals;
