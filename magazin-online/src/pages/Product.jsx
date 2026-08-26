import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import Icon from "../components/Icon";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import {
  fetchProductById,
  fetchProductImages,
  queryProducts,
} from "../services/products";
import {
  discountPercent,
  formatPrice,
  specEntries,
  stockLabel,
} from "../lib/format";
import { TRUST_POINTS } from "../config/site";

const toneClasses = {
  in: "bg-emerald-50 text-emerald-700 border-emerald-200",
  low: "bg-amber-50 text-amber-700 border-amber-200",
  out: "bg-rose-50 text-rose-700 border-rose-200",
};

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState("specificatii");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError("");
      setQuantity(1);
      setAdded(false);
      setActiveImage(0);

      const { data, error: fetchError } = await fetchProductById(id);
      if (!isMounted) return;

      if (fetchError || !data) {
        setError("Nu am putut încărca produsul.");
        setProduct(null);
        setLoading(false);
        return;
      }

      setProduct(data);
      setLoading(false);

      // Galeria. Dacă tabelul lipsește, rămânem cu imaginea din `image_url`.
      const { data: images } = await fetchProductImages(data.id);
      if (isMounted) {
        setGallery(
          images.length > 0
            ? images
            : data.image_url
              ? [{ id: "principal", url: data.image_url, alt: data.name }]
              : [],
        );
      }

      // Produse similare din aceeași categorie.
      if (data.category_id) {
        const { data: siblings } = await queryProducts((q) =>
          q
            .eq("category_id", data.category_id)
            .eq("active", true)
            .neq("id", data.id)
            .gt("stock", 0)
            .limit(4),
        );
        if (isMounted) setRelated(siblings);
      } else if (isMounted) {
        setRelated([]);
      }
    };

    load();
    window.scrollTo({ top: 0 });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="grid gap-8 py-8 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-3xl bg-slate-100" />
          <div className="space-y-4">
            <div className="h-6 w-1/3 animate-pulse rounded bg-slate-100" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-slate-100" />
            <div className="h-24 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="py-24 text-center">
          <p className="text-sm text-rose-700">
            {error || "Produsul nu a fost găsit."}
          </p>
          <Link
            to="/produse"
            className="mt-6 inline-block rounded-xl bg-ink px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-volt"
          >
            Înapoi la catalog
          </Link>
        </div>
      </Layout>
    );
  }

  const stock = product.stock;
  const outOfStock =
    product.active === false || (typeof stock === "number" && stock <= 0);
  const stockInfo = stockLabel(stock);
  const discount = discountPercent(product.pret_vechi, product.price);
  const specs = specEntries(product.specificatii);
  const favorite = isFavorite(product.id);
  const maxQuantity = typeof stock === "number" ? Math.max(1, stock) : 99;
  const currentImage = gallery[activeImage] ?? gallery[0] ?? null;

  const handleAdd = () => {
    addItem(product, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Layout>
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
        <Link to="/" className="transition hover:text-volt">
          Acasă
        </Link>
        <Icon name="chevronRight" className="h-3 w-3" />
        <Link to="/produse" className="transition hover:text-volt">
          Catalog
        </Link>
        <Icon name="chevronRight" className="h-3 w-3" />
        <span className="truncate text-ink/70 normal-case tracking-normal">
          {product.name}
        </span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_420px]">
        {/* Imagine */}
        <div>
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
            {discount !== null && (
              <span className="absolute left-4 top-4 z-10 rounded-lg bg-rose-500 px-2.5 py-1 text-xs font-bold text-white">
                -{discount}%
              </span>
            )}
            {currentImage ? (
              <img
                key={currentImage.id}
                src={currentImage.url}
                alt={currentImage.alt || product.name}
                className="h-full w-full object-contain p-10"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-slate-300">
                Imagine indisponibilă
              </div>
            )}
          </div>

          {/* Miniaturi — apar doar când produsul chiar are mai multe poze. */}
          {gallery.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {gallery.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`Imaginea ${index + 1} din ${gallery.length}`}
                  aria-current={index === activeImage}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition ${
                    index === activeImage
                      ? "border-volt"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.alt || ""}
                    loading="lazy"
                    className="h-full w-full object-contain p-1.5"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Taburi: specificații / descriere / livrare */}
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white shadow-soft">
            <div className="flex gap-1 border-b border-slate-100 p-2">
              {[
                { key: "specificatii", label: "Specificații" },
                { key: "descriere", label: "Descriere" },
                { key: "livrare", label: "Livrare & garanție" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTab(item.key)}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                    tab === item.key
                      ? "bg-ink text-white"
                      : "text-slate-500 hover:text-ink"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {tab === "specificatii" &&
                (specs.length > 0 ? (
                  <dl className="divide-y divide-slate-100">
                    {specs.map((spec) => (
                      <div
                        key={spec.label}
                        className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-4 py-2.5"
                      >
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {spec.label}
                        </dt>
                        <dd className="text-sm text-ink">{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="text-sm text-slate-400">
                    Specificațiile tehnice nu au fost completate pentru acest
                    produs.
                  </p>
                ))}

              {tab === "descriere" && (
                <p className="text-sm leading-relaxed text-slate-600">
                  {product.description ||
                    "Acest produs nu are încă o descriere detaliată."}
                </p>
              )}

              {tab === "livrare" && (
                <ul className="space-y-3">
                  {TRUST_POINTS.map((point) => (
                    <li key={point.title} className="flex items-start gap-3">
                      <Icon
                        name={point.icon}
                        className="mt-0.5 h-4 w-4 shrink-0 text-volt"
                      />
                      <div>
                        <p className="text-sm font-semibold text-ink">
                          {point.title}
                        </p>
                        <p className="text-xs text-slate-500">{point.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Panou de cumpărare */}
        <div className="lg:sticky lg:top-40 lg:self-start">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            {product.brand && (
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-volt">
                {product.brand}
              </span>
            )}

            <h1 className="mt-1.5 font-display text-2xl font-bold leading-snug text-ink">
              {product.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              {Number.isFinite(Number(product.rating)) &&
                Number(product.rating) > 0 && (
                  <span className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Icon
                        key={n}
                        name="star"
                        className={`h-3.5 w-3.5 ${
                          n <= Math.round(Number(product.rating))
                            ? "text-amber-400"
                            : "text-slate-200"
                        }`}
                        filled
                      />
                    ))}
                    <span className="ml-1 text-xs text-slate-500">
                      {Number(product.rating).toFixed(1)}
                    </span>
                  </span>
                )}
              {product.sku && (
                <span className="text-xs text-slate-400">
                  Cod: {product.sku}
                </span>
              )}
            </div>

            {/* Preț */}
            <div className="mt-6 flex flex-wrap items-baseline gap-3">
              <span className="font-display text-3xl font-bold text-ink">
                {formatPrice(product.price) ?? "Preț indisponibil"}
              </span>
              {discount !== null && (
                <>
                  <span className="text-sm text-slate-400 line-through">
                    {formatPrice(product.pret_vechi)}
                  </span>
                  <span className="rounded-md bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-600">
                    economisești {formatPrice(
                      Number(product.pret_vechi) - Number(product.price),
                    )}
                  </span>
                </>
              )}
            </div>

            {stockInfo && (
              <span
                className={`mt-4 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${toneClasses[stockInfo.tone]}`}
              >
                <Icon name={stockInfo.tone === "out" ? "close" : "check"} className="h-3 w-3" />
                {stockInfo.text}
              </span>
            )}

            {product.garantie_luni ? (
              <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <Icon name="shield" className="h-4 w-4 text-volt" />
                Garanție {product.garantie_luni} luni
              </p>
            ) : null}

            <div className="my-6 h-px bg-slate-100" />

            {/* Cantitate */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                Cantitate
              </span>
              <div className="flex items-center gap-1 rounded-xl border border-slate-200 p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-50 disabled:opacity-30"
                  aria-label="Scade cantitatea"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-semibold text-ink">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                  disabled={quantity >= maxQuantity}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-50 disabled:opacity-30"
                  aria-label="Crește cantitatea"
                >
                  +
                </button>
              </div>
            </div>

            {product.price != null && (
              <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-xs text-slate-500">Total</span>
                <span className="font-display text-lg font-bold text-ink">
                  {formatPrice(Number(product.price) * quantity)}
                </span>
              </div>
            )}

            {/* Acțiuni */}
            <button
              type="button"
              onClick={handleAdd}
              disabled={outOfStock}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-3.5 text-sm font-semibold text-white transition hover:bg-volt disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              <Icon name={added ? "check" : "cart"} className="h-4 w-4" />
              {outOfStock
                ? "Stoc epuizat"
                : added
                  ? "Adăugat în coș"
                  : "Adaugă în coș"}
            </button>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => toggleFavorite(product)}
                className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition ${
                  favorite
                    ? "border-rose-200 bg-rose-50 text-rose-600"
                    : "border-slate-200 text-slate-500 hover:border-rose-200 hover:text-rose-600"
                }`}
              >
                <Icon name="heart" className="h-4 w-4" filled={favorite} />
                {favorite ? "Salvat" : "Favorite"}
              </button>
              <Link
                to="/cart"
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-500 transition hover:text-ink"
              >
                Vezi coșul
              </Link>
            </div>
          </div>

          {/* Beneficii scurte */}
          <ul className="mt-4 space-y-2.5 rounded-3xl border border-slate-200 bg-white/70 p-5">
            {TRUST_POINTS.slice(0, 3).map((point) => (
              <li
                key={point.title}
                className="flex items-center gap-2.5 text-xs text-slate-600"
              >
                <Icon name={point.icon} className="h-4 w-4 shrink-0 text-volt" />
                {point.title}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Produse similare */}
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl font-bold text-ink">
            Produse similare
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
};

export default Product;
