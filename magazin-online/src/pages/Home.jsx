import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Filter from "../components/Filter";
import supabase from "../services/supabaseClient";

const normalizeName = (value) => value?.toString().trim().toLowerCase() || "";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sugarFreeOnly, setSugarFreeOnly] = useState(false);
  const [bioOnly, setBioOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setError("");

      const [
        { data: productsData, error: productsError },
        { data: categoriesData, error: categoriesError },
      ] = await Promise.all([
        supabase
          .from("products")
          .select(
            "id, name, description, price, image_url, category_id, fara_zahar, bio",
          ),
        supabase.from("categories").select("id, name"),
      ]);

      if (!isMounted) return;

      if (productsError || categoriesError) {
        setError("Nu am putut încărca produsele.");
        setLoading(false);
        return;
      }

      setProducts(productsData || []);
      setCategories(categoriesData || []);
      setLoading(false);
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const searchQuery = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("q")?.trim().toLowerCase() || "";
  }, [location.search]);

  const handleCategoryClick = (slug) => {
    // Toggle — click pe aceeasi categorie o deselecteaza
    setSelectedCategory((prev) => (prev === slug ? null : slug));
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Filtru categorie
      if (selectedCategory) {
        const cat = categories.find(
          (c) => normalizeName(c.name) === selectedCategory,
        );
        if (cat && product.category_id !== cat.id) return false;
      }

      // Filtru fara zahar
      if (sugarFreeOnly && !product.fara_zahar) return false;

      // Filtru bio
      if (bioOnly && !product.bio) return false;

      // Filtru search
      if (searchQuery) {
        return normalizeName(product.name).includes(searchQuery);
      }

      return true;
    });
  }, [
    products,
    categories,
    selectedCategory,
    sugarFreeOnly,
    bioOnly,
    searchQuery,
  ]);

  return (
    <div className="min-h-screen bg-[#f5f2eb] font-sans">
      <Navbar
        selectedCategory={selectedCategory}
        onCategoryClick={handleCategoryClick}
      />

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Hero */}
        <header className="mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-ink/40">
            Catalog produse
          </p>
          <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
            {selectedCategory
              ? categories.find(
                  (c) => normalizeName(c.name) === selectedCategory,
                )?.name || "Produse"
              : "Toate produsele"}
          </h1>
          <p className="mt-2 text-sm text-ink/55">
            {filteredProducts.length} produse disponibile
          </p>
        </header>

        {/* Filtre bio / fara zahar */}
        <Filter onSugarFreeChange={setSugarFreeOnly} onBioChange={setBioOnly} />

        {/* Loading */}
        {loading && (
          <div className="mt-16 text-center text-sm text-ink/40">
            Se încarcă produsele...
          </div>
        )}

        {/* Eroare */}
        {!loading && error && (
          <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        )}

        {/* Gol */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-sm text-ink/40">
              Nu există produse pentru filtrele selectate.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory(null);
                setSugarFreeOnly(false);
                setBioOnly(false);
              }}
              className="mt-4 rounded-full border border-ink/10 bg-white/70 px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-ink/60 transition hover:bg-white"
            >
              Resetează filtrele
            </button>
          </div>
        )}

        {/* Grid produse */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => navigate(`/produs/${product.id}`)}
                className="group w-full cursor-pointer rounded-3xl border border-white/60 bg-white/85 text-left shadow-soft backdrop-blur transition hover:-translate-y-0.5"
                aria-label={`Vezi produsul ${product.name || ""}`}
              >
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
