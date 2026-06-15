import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import supabase from "../services/supabaseClient";

const categoryOrder = [
  "fructe",
  "legume",
  "bauturi",
  "congelate",
  "carne",
  "mezeluri",
];

const normalizeName = (value) => value?.toString().trim().toLowerCase() || "";

const Category = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const normalizedSlug = useMemo(() => normalizeName(slug), [slug]);

  useEffect(() => {
    let isMounted = true;

    const loadCategory = async () => {
      setLoading(true);
      setError("");

      const [
        { data: categoriesData, error: categoriesError },
        { data: productsData, error: productsError },
      ] = await Promise.all([
        supabase.from("categories").select("id, name"),
        supabase
          .from("products")
          .select(
            "id, name, description, price, image_url, category_id, fara_zahar, bio, stock",
          ),
      ]);

      if (!isMounted) {
        return;
      }

      if (categoriesError || productsError) {
        setError("Nu am putut încărca produsele din categorie.");
        setCategory(null);
        setProducts([]);
        setLoading(false);
        return;
      }

      const foundCategory = (categoriesData || []).find(
        (item) => normalizeName(item.name) === normalizedSlug,
      );

      if (!foundCategory) {
        setError("Categoria nu a fost găsită.");
        setCategory(null);
        setProducts([]);
        setLoading(false);
        return;
      }

      const categoryProducts = (productsData || [])
        .filter(
          (product) =>
            product.category_id === foundCategory.id ||
            normalizeName(product.name) === normalizeName(foundCategory.name),
        )
        // ascunde produsele cu stoc 0 (la fel ca pe Home)
        .filter(
          (product) =>
            product.stock === null ||
            product.stock === undefined ||
            product.stock > 0,
        );

      const sortedProducts = categoryProducts.sort((a, b) => {
        const aIndex = categoryOrder.indexOf(normalizeName(a.name));
        const bIndex = categoryOrder.indexOf(normalizeName(b.name));
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      });

      setCategory(foundCategory);
      setProducts(sortedProducts);
      setLoading(false);
    };

    loadCategory();

    return () => {
      isMounted = false;
    };
  }, [normalizedSlug]);

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
      <div className="absolute left-37.5 top-25 h-125 w-125 rounded-full bg-[#f0d8cb] opacity-25 blur-[120px]" />
      <div className="absolute right-37.5 top-25 h-125 w-125 rounded-full bg-[#dfe7ee] opacity-25 blur-[120px]" />

      <div className="relative z-10">
        <Navbar />

        <div className="mx-auto max-w-6xl px-6 py-10">
          {/* Hero */}
          <header className="mb-8">
            <Link
              to="/"
              className="text-xs uppercase tracking-[0.3em] text-ink/40 transition hover:text-ink"
            >
              ← Înapoi la produse
            </Link>

            <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
              {category?.name || "Categorie"}
            </h1>

            {!loading && !error && category && (
              <p className="mt-2 text-sm text-ink/55">
                {products.length}{" "}
                {products.length === 1
                  ? "produs disponibil"
                  : "produse disponibile"}
              </p>
            )}
          </header>

          {loading && (
            <div className="mt-16 text-center text-sm text-ink/40">
              Se încarcă categoria...
            </div>
          )}

          {!loading && error && (
            <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error}
            </div>
          )}

          {!loading && !error && category && products.length === 0 && (
            <div className="mt-16 text-center text-sm text-ink/40">
              Nu există produse disponibile în această categorie.
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => {
                const stock = product.stock;
                const isLowStock =
                  stock !== null &&
                  stock !== undefined &&
                  stock > 0 &&
                  stock <= 10;

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => navigate(`/produs/${product.id}`)}
                    className="group relative w-full cursor-pointer rounded-3xl border border-white/60 bg-white/85 text-left shadow-soft backdrop-blur transition hover:-translate-y-0.5"
                    aria-label={`Vezi produsul ${product.name || ""}`}
                  >
                    {isLowStock && (
                      <div className="absolute right-3 top-3 z-10 rounded-full bg-rose-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                        Ultimele {stock} {stock === 1 ? "produs" : "produse"}
                      </div>
                    )}

                    <div className="aspect-4/3 w-full overflow-hidden rounded-t-3xl bg-ink/5">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
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
                        {product.name}
                      </h3>

                      {product.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-ink/50">
                          {product.description}
                        </p>
                      )}

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-base font-semibold text-ink">
                          {product.price != null
                            ? `${product.price} lei`
                            : "Preț indisponibil"}
                        </span>

                        <div className="flex items-center gap-2">
                          {product.bio && (
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                              Bio
                            </span>
                          )}
                          {product.fara_zahar && (
                            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                              Fără zahăr
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 w-full rounded-full bg-ink py-2 text-center text-xs font-semibold text-white transition group-hover:bg-ink/80">
                        Vezi produs
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Category;
