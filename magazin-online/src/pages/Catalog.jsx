import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import Icon from "../components/Icon";
import ProductCard from "../components/ProductCard";
import Filter from "../components/Filter";
import { EMPTY_FILTERS } from "../lib/filters";
import { fetchBrands, queryProducts } from "../services/products";

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: "noutati", label: "Cele mai noi", column: "created_at", asc: false },
  { value: "pret-asc", label: "Preț crescător", column: "price", asc: true },
  { value: "pret-desc", label: "Preț descrescător", column: "price", asc: false },
  { value: "rating", label: "Cele mai bine notate", column: "rating", asc: false },
  { value: "nume", label: "Alfabetic", column: "name", asc: true },
];

/**
 * Catalogul (/produse). Filtrarea, sortarea și paginarea se fac în Postgres,
 * nu în browser — pagina rămâne rapidă și la mii de produse.
 */
const Catalog = ({ categoryId = null, title, subtitle, breadcrumb = null }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [brands, setBrands] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const search = (searchParams.get("q") || "").trim();
  const sort = searchParams.get("sort") || "noutati";
  const page = Math.max(1, Number(searchParams.get("page") || 1));

  const sortConfig = useMemo(
    () => SORT_OPTIONS.find((o) => o.value === sort) || SORT_OPTIONS[0],
    [sort],
  );

  const setParam = useCallback(
    (changes) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(changes).forEach(([key, value]) => {
        if (value === null || value === "" || value === undefined) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      });
      setSearchParams(next);
    },
    [searchParams, setSearchParams],
  );

  useEffect(() => {
    fetchBrands().then(setBrands);
  }, []);

  // Revino la prima pagină când se schimbă filtrele sau căutarea.
  useEffect(() => {
    if (page !== 1) setParam({ page: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, search, sort, categoryId]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError("");

      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error: queryError, count } = await queryProducts((q) => {
        // Produsele dezactivate din admin nu apar niciodata in catalog.
        let query = q.eq("active", true);

        if (categoryId) query = query.eq("category_id", categoryId);
        if (search) query = query.ilike("name", `%${search}%`);
        if (filters.brands.length > 0) query = query.in("brand", filters.brands);
        if (filters.minPrice !== "") query = query.gte("price", Number(filters.minPrice));
        if (filters.maxPrice !== "") query = query.lte("price", Number(filters.maxPrice));
        if (filters.minRating > 0) query = query.gte("rating", filters.minRating);
        if (filters.inStockOnly) query = query.gt("stock", 0);

        return query
          .order(sortConfig.column, {
            ascending: sortConfig.asc,
            nullsFirst: false,
          })
          .range(from, to);
      });

      if (!isMounted) return;

      if (queryError) {
        const missingColumn =
          queryError.code === "42703" ||
          /column .* does not exist/i.test(queryError.message || "");
        setError(
          missingColumn
            ? "Baza de date nu are încă structura pentru electronice. Rulează sql/001_electronice.sql în Supabase."
            : "Nu am putut încărca produsele. Încearcă din nou.",
        );
        setProducts([]);
        setTotal(0);
      } else {
        setProducts(data);
        setTotal(count);
      }

      setLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [categoryId, search, sort, sortConfig, page, filters]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Layout>
      {/* Antet */}
      <header>
        {breadcrumb}
        <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
          {search ? `Rezultate pentru „${search}”` : title}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {loading
            ? "Se încarcă…"
            : `${total} ${total === 1 ? "produs găsit" : "produse găsite"}`}
          {subtitle && !search ? ` · ${subtitle}` : ""}
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <Filter
          value={filters}
          onChange={setFilters}
          brands={brands}
          resultCount={total}
        />

        <div>
          {/* Bara de sortare */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5">
            <span className="text-xs text-slate-500">
              Pagina {page} din {totalPages}
            </span>
            <label className="flex items-center gap-2 text-xs text-slate-500">
              Sortează după
              <select
                value={sort}
                onChange={(e) => setParam({ sort: e.target.value, page: null })}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink focus:border-volt focus:outline-none"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Stări */}
          {loading && (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
                />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error}
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <Icon
                name="search"
                className="mx-auto h-8 w-8 text-slate-300"
              />
              <p className="mt-4 text-sm text-slate-500">
                Nu am găsit produse pentru criteriile alese.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFilters({ ...EMPTY_FILTERS });
                  setParam({ q: null, page: null });
                }}
                className="mt-4 rounded-xl bg-ink px-5 py-2 text-xs font-semibold text-white transition hover:bg-volt"
              >
                Resetează căutarea
              </button>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Paginare */}
              {totalPages > 1 && (
                <nav className="mt-10 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setParam({ page: page - 1 })}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:text-ink disabled:opacity-40"
                  >
                    Înapoi
                  </button>

                  {Array.from({ length: totalPages })
                    .map((_, i) => i + 1)
                    .filter(
                      (n) =>
                        n === 1 ||
                        n === totalPages ||
                        Math.abs(n - page) <= 1,
                    )
                    .map((n, index, list) => (
                      <span key={n} className="flex items-center gap-2">
                        {index > 0 && list[index - 1] !== n - 1 && (
                          <span className="text-slate-300">…</span>
                        )}
                        <button
                          type="button"
                          onClick={() => setParam({ page: n })}
                          className={`h-8 w-8 rounded-lg text-xs font-semibold transition ${
                            n === page
                              ? "bg-ink text-white"
                              : "border border-slate-200 bg-white text-slate-600 hover:text-ink"
                          }`}
                        >
                          {n}
                        </button>
                      </span>
                    ))}

                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setParam({ page: page + 1 })}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:text-ink disabled:opacity-40"
                  >
                    Înainte
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Catalog;
