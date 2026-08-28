import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Seo from "../components/Seo";
import Icon from "../components/Icon";
import ProductCard from "../components/ProductCard";
import { CATEGORIES, SITE, TRUST_POINTS } from "../config/site";
import { queryProducts } from "../services/products";
import { formatPrice } from "../lib/format";

const BRANDS = [
  "Apple",
  "Samsung",
  "ASUS",
  "Lenovo",
  "NVIDIA",
  "AMD",
  "Sony",
  "Logitech",
];

const Landing = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      // Cele mai noi produse aflate în stoc — vitrina paginii de prezentare.
      const { data } = await queryProducts((q) =>
        q
          .eq("active", true)
          .gt("stock", 0)
          .order("created_at", { ascending: false })
          .limit(8),
      );

      if (!isMounted) return;
      setFeatured(data);
      setLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Layout bare>
      <Seo
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Store",
          name: SITE.name,
          description: SITE.description,
          email: SITE.email,
          telephone: SITE.phone,
          address: SITE.address,
        }}
      />
      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-volt/30 blur-[120px]" />
        <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-cyan-glow/20 blur-[120px]" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-volt">
              <Icon name="bolt" className="h-3 w-3" filled />
              {SITE.tagline}
            </span>

            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.1] sm:text-5xl lg:text-6xl">
              Tehnologia care
              <span className="block bg-linear-to-r from-volt to-cyan-glow bg-clip-text text-transparent">
                îți ține pasul.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/60">
              {SITE.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/produse"
                className="flex items-center gap-2 rounded-xl bg-volt px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-volt-dark"
              >
                Vezi produsele
                <Icon name="chevronRight" className="h-4 w-4" />
              </Link>
              <Link
                to="/reduceri"
                className="flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <Icon name="tag" className="h-4 w-4" />
                Reducerile săptămânii
              </Link>
            </div>

            {/* Cifre */}
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-8">
              {[
                { value: "2.400+", label: "produse în stoc" },
                { value: "24–48h", label: "timp de livrare" },
                { value: "4.8/5", label: "scor clienți" },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="font-display text-2xl font-bold text-white">
                    {stat.value}
                  </dt>
                  <dd className="mt-1 text-[11px] uppercase tracking-wide text-white/40">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Vizual: card-uri de categorie plutind */}
          <div className="relative hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              {CATEGORIES.slice(0, 4).map((cat, index) => (
                <Link
                  key={cat.slug}
                  to={`/categorie/${cat.slug}`}
                  className={`group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-volt/50 hover:bg-white/10 ${
                    index % 2 === 1 ? "translate-y-8" : ""
                  }`}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-volt/15 text-volt transition group-hover:bg-volt group-hover:text-white">
                    <Icon name={cat.icon} className="h-5 w-5" />
                  </span>
                  <p className="mt-4 font-display text-sm font-semibold text-white">
                    {cat.label}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bandă de încredere */}
        <div className="relative border-t border-white/10 bg-black/20">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 py-6 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_POINTS.map((point) => (
              <div key={point.title} className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-volt/15 text-volt">
                  <Icon name={point.icon} className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-white">
                    {point.title}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-white/45">
                    {point.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CATEGORII ---------------- */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-volt">
              Ce căutăm azi?
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
              Categoriile noastre
            </h2>
          </div>
          <Link
            to="/produse"
            className="flex items-center gap-1.5 text-sm font-semibold text-volt transition hover:gap-2.5"
          >
            Toate produsele
            <Icon name="chevronRight" className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat, index) => (
            <Link
              key={cat.slug}
              to={`/categorie/${cat.slug}`}
              className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:border-volt/40 hover:shadow-lift ${
                index === 0 ? "sm:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-volt/5 transition group-hover:bg-volt/10" />
              <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-ink text-white transition group-hover:bg-volt">
                <Icon name={cat.icon} className="h-5 w-5" />
              </span>
              <h3 className="relative mt-5 font-display text-lg font-bold text-ink">
                {cat.label}
              </h3>
              <p className="relative mt-1.5 text-sm leading-relaxed text-slate-500">
                {cat.blurb}
              </p>
              <span className="relative mt-4 flex items-center gap-1.5 text-xs font-semibold text-volt transition group-hover:gap-3">
                Explorează
                <Icon name="chevronRight" className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- PRODUSE RECOMANDATE ---------------- */}
      <section className="border-y border-slate-200 bg-white/60">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-volt">
                Proaspăt pe stoc
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
                Noutăți în magazin
              </h2>
            </div>
            <Link
              to="/produse"
              className="flex items-center gap-1.5 text-sm font-semibold text-volt transition hover:gap-2.5"
            >
              Vezi tot catalogul
              <Icon name="chevronRight" className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
                />
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-400">
              Încă nu există produse în stoc. Adaugă-le din panoul de
              administrare.
            </p>
          )}
        </div>
      </section>

      {/* ---------------- BANNER REDUCERI ---------------- */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-ink px-8 py-14 text-white sm:px-14">
          <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-rose-500/20 blur-[100px]" />
          <div className="absolute -bottom-20 left-10 h-72 w-72 rounded-full bg-volt/20 blur-[100px]" />

          <div className="relative flex flex-wrap items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em]">
                <Icon name="tag" className="h-3 w-3" />
                Ofertele săptămânii
              </span>
              <h2 className="mt-5 font-display text-3xl font-bold leading-tight sm:text-4xl">
                Până la 40% reducere la produse selectate
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-white/55">
                Ofertele se schimbă în fiecare luni și sunt valabile în limita
                stocului. Prinde-le înainte să dispară.
              </p>
            </div>

            <Link
              to="/reduceri"
              className="flex items-center gap-2 rounded-xl bg-white px-7 py-4 text-sm font-bold text-ink transition hover:bg-volt hover:text-white"
            >
              Vezi reducerile
              <Icon name="chevronRight" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- DE CE NOI ---------------- */}
      <section className="border-t border-slate-200 bg-white/60">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-volt">
              De ce {SITE.name}
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
              Cumperi electronice fără griji
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              Lucrăm doar cu distribuitori autorizați. Fiecare produs vine cu
              factură, certificat de garanție și suport tehnic real, de la
              oameni care chiar folosesc ce vindem.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_POINTS.map((point) => (
              <div
                key={point.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-volt-soft text-volt">
                  <Icon name={point.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-bold text-ink">
                  {point.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {point.text}
                </p>
              </div>
            ))}
          </div>

          {/* Branduri */}
          <div className="mt-16 border-t border-slate-200 pt-10">
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">
              Branduri disponibile în magazin
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {BRANDS.map((brand) => (
                <span
                  key={brand}
                  className="font-display text-lg font-bold text-slate-300 transition hover:text-slate-500"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- NEWSLETTER ---------------- */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-soft sm:p-14">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-volt-soft text-volt">
            <Icon name="mail" className="h-5 w-5" />
          </span>
          <h2 className="mt-5 font-display text-2xl font-bold text-ink sm:text-3xl">
            Primești ofertele înaintea tuturor
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-slate-500">
            Un singur email pe săptămână, cu reducerile reale și produsele noi.
            Fără spam, te dezabonezi oricând.
          </p>

          <form
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              required
              placeholder="adresa@email.com"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-volt focus:bg-white focus:outline-none focus:ring-2 focus:ring-volt/20"
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-volt"
            >
              Mă abonez
            </button>
          </form>

          <p className="mt-4 text-[11px] text-slate-400">
            Comandă minimă pentru livrare gratuită: {formatPrice(500)}
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default Landing;
