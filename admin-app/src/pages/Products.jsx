import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { isSupabaseConfigured, supabase } from "../supabaseClient";

const formatPrice = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? `${n.toFixed(2)} lei` : "-";
};

/**
 * Lista produselor, cu numarul de imagini al fiecaruia. Punctul de intrare
 * pentru gestionarea galeriilor.
 */
function Products() {
  const [products, setProducts] = useState([]);
  const [state, setState] = useState("loading");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [onlyWithoutImages, setOnlyWithoutImages] = useState(false);

  const supabaseReady = Boolean(isSupabaseConfigured && supabase);

  const loadProducts = useCallback(async () => {
    if (!supabaseReady) return;

    const { data, error } = await supabase
      .from("products")
      .select(
        "id, name, sku, brand, price, stock, active, image_url, categories(name), product_images(id)",
      )
      .order("created_at", { ascending: false });

    if (error) {
      setState("error");
      setMessage(
        /product_images/.test(error.message)
          ? "Tabelul product_images nu exista. Ruleaza sql/005_imagini.sql in Supabase."
          : error.message,
      );
      return;
    }

    setMessage("");
    setProducts(data ?? []);
    setState("ready");
  }, [supabaseReady]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProducts();
  }, [loadProducts]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (onlyWithoutImages && (p.product_images?.length ?? 0) > 0) return false;
      if (!q) return true;
      return (
        p.name?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)
      );
    });
  }, [products, search, onlyWithoutImages]);

  const withoutImages = products.filter(
    (p) => (p.product_images?.length ?? 0) === 0,
  ).length;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">
              Produse
            </p>
            <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
              Catalog
            </h1>
            <p className="mt-2 max-w-xl text-sm text-ink/60">
              {products.length} produse in total
              {withoutImages > 0
                ? `, din care ${withoutImages} fara nicio imagine`
                : ""}
              .
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/70"
            >
              Inapoi la panou
            </Link>
            <Link
              to="/products/new"
              className="rounded-full bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
            >
              Produs nou
            </Link>
          </div>
        </header>

        {!supabaseReady && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Supabase nu este configurat. Verifica VITE_SUPABASE_URL si
            VITE_SUPABASE_ANON_KEY.
          </div>
        )}

        {message && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {message}
          </div>
        )}

        <section className="mt-8 rounded-3xl border border-white/60 bg-white/85 p-6 shadow-soft backdrop-blur">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cauta dupa nume, SKU sau brand"
              className="flex-1 rounded-xl border border-ink/10 bg-white px-4 py-2.5 text-sm"
            />
            <label className="flex items-center gap-2 text-xs text-ink/60">
              <input
                type="checkbox"
                checked={onlyWithoutImages}
                onChange={(e) => setOnlyWithoutImages(e.target.checked)}
                className="h-4 w-4"
              />
              Doar fara imagini
            </label>
          </div>

          {state === "loading" && (
            <p className="mt-6 text-sm text-ink/50">Se incarca produsele...</p>
          )}

          {state === "ready" && visible.length === 0 && (
            <p className="mt-6 text-sm text-ink/50">
              Niciun produs pentru filtrele alese.
            </p>
          )}

          <div className="mt-6 grid gap-2">
            {visible.map((product) => {
              const imageCount = product.product_images?.length ?? 0;

              return (
                <div
                  key={product.id}
                  className="flex flex-wrap items-center gap-4 rounded-2xl border border-ink/5 bg-white/70 px-4 py-3"
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-ink/5 bg-ink/5">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-contain p-1"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-ink/30">
                        fara
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {product.name}
                    </p>
                    <p className="text-xs text-ink/50">
                      {[product.brand, product.sku, product.categories?.name]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold text-ink">
                      {formatPrice(product.price)}
                    </p>
                    <p className="text-xs text-ink/50">
                      stoc {product.stock}
                      {product.active === false ? " · inactiv" : ""}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      imageCount === 0
                        ? "bg-rose-100 text-rose-700"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {imageCount} img
                  </span>

                  <div className="flex gap-2">
                    <Link
                      to={`/products/${product.id}/edit`}
                      className="rounded-xl bg-ink px-3 py-2 text-xs font-semibold text-white hover:bg-ink/80"
                    >
                      Editeaza
                    </Link>
                    <Link
                      to={`/products/${product.id}/images`}
                      className="rounded-xl border border-ink/10 bg-white px-3 py-2 text-xs font-semibold text-ink/70 hover:text-ink"
                    >
                      Imagini
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Products;
