import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import supabase from "../services/supabaseClient";

const isStillValid = (validUntil) => {
  if (!validUntil) return true;
  const until = new Date(validUntil);
  if (Number.isNaN(until.getTime())) return true;
  // valabil până la sfârșitul zilei
  until.setHours(23, 59, 59, 999);
  return until.getTime() >= Date.now();
};

const discountPercent = (oldPrice, price) => {
  const o = Number(oldPrice);
  const p = Number(price);
  if (!Number.isFinite(o) || !Number.isFinite(p) || o <= 0 || p >= o) {
    return null;
  }
  return Math.round((1 - p / o) * 100);
};

const formatDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
  });
};

const WeeklyDeals = () => {
  const [activeDeals, setActiveDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDeals = async () => {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("weekly_deals")
        .select("id, name, description, old_price, price, image_url, valid_until")
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (fetchError) {
        setError("Nu am putut încărca reducerile.");
        setActiveDeals([]);
      } else {
        setActiveDeals((data || []).filter((deal) => isStillValid(deal.valid_until)));
      }

      setLoading(false);
    };

    loadDeals();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden font-sans">
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, #f4e8e1 0%, #f7f5f2 52%, #eef2f5 100%)",
        }}
      />

      {/* Glow stânga */}
      <div className="absolute left-37.5 top-25 h-125 w-125 rounded-full bg-[#f0d8cb] opacity-25 blur-[120px]" />

      {/* Glow dreapta */}
      <div className="absolute right-37.5 top-25 h-125 w-125 rounded-full bg-[#dfe7ee] opacity-25 blur-[120px]" />

      <div className="relative z-10">
        <Navbar />

        <div className="mx-auto max-w-6xl px-6 py-10">
          {/* Hero */}
          <header className="mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-rose-500/70">
              Oferte limitate
            </p>

            <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
              Reducerile săptămânii
            </h1>

            <p className="mt-2 text-sm text-ink/55">
              {activeDeals.length}{" "}
              {activeDeals.length === 1 ? "ofertă activă" : "oferte active"}
            </p>
          </header>

          {loading && (
            <div className="mt-16 text-center text-sm text-ink/40">
              Se încarcă reducerile...
            </div>
          )}

          {!loading && error && (
            <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error}
            </div>
          )}

          {!loading && !error && activeDeals.length === 0 && (
            <div className="mt-16 text-center text-sm text-ink/40">
              Nu există reduceri active momentan. Revino în curând!
            </div>
          )}

          {!loading && !error && activeDeals.length > 0 && (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {activeDeals.map((deal) => {
                const percent = discountPercent(deal.old_price, deal.price);
                const validLabel = formatDate(deal.valid_until);

                return (
                  <div
                    key={deal.id}
                    className="group relative w-full rounded-3xl border border-white/60 bg-white/85 text-left shadow-soft backdrop-blur transition hover:-translate-y-0.5"
                  >
                    {/* Badge reducere */}
                    {percent != null && (
                      <div className="absolute right-3 top-3 z-10 rounded-full bg-rose-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                        -{percent}%
                      </div>
                    )}

                    <div className="aspect-4/3 w-full overflow-hidden rounded-t-3xl bg-ink/5">
                      {deal.image_url ? (
                        <img
                          src={deal.image_url}
                          alt={deal.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-ink/30">
                          Imagine indisponibilă
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-display text-lg text-ink">
                        {deal.name}
                      </h3>

                      {deal.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-ink/50">
                          {deal.description}
                        </p>
                      )}

                      <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-xl font-semibold text-rose-600">
                          {deal.price != null
                            ? `${Number(deal.price).toFixed(2)} lei`
                            : "Preț indisponibil"}
                        </span>
                        {deal.old_price != null && (
                          <span className="text-sm text-ink/40 line-through">
                            {Number(deal.old_price).toFixed(2)} lei
                          </span>
                        )}
                      </div>

                      {validLabel && (
                        <p className="mt-3 text-xs text-ink/45">
                          Valabil până la {validLabel}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyDeals;
