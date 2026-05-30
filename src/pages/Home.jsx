import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Filter from "../components/Filter";
import supabase from "../services/supabaseClient";

const targetNames = [
  "fructe",
  "legume",
  "bauturi",
  "congelate",
  "carne",
  "mezeluri",
];

const normalizeName = (value) => value?.toString().trim().toLowerCase() || "";

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [sugarFreeOnly, setSugarFreeOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const orderMap = useMemo(
    () => new Map(targetNames.map((name, index) => [name, index])),
    [],
  );

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
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
            "id, name, description, price, image_url, category_id, fara_zahar",
          ),
      ]);

      if (!isMounted) {
        return;
      }

      if (categoriesError || productsError) {
        setError("Nu am putut incarca categoriile sau produsele.");
        setCategories([]);
        setProducts([]);
        setLoading(false);
        return;
      }

      const sortedCategories = (categoriesData || [])
        .filter((category) =>
          targetNames.includes(normalizeName(category.name)),
        )
        .sort(
          (a, b) =>
            (orderMap.get(normalizeName(a.name)) ?? 0) -
            (orderMap.get(normalizeName(b.name)) ?? 0),
        );

      setCategories(sortedCategories);
      setProducts(productsData || []);
      setLoading(false);
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [orderMap]);

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Navbar />
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold text-white">
          Bun venit in magazinul nostru!
        </h1>
        <p className="mt-4 text-gray-400">
          Aici veti gasi cele mai bune produse.
        </p>
        <Filter onSugarFreeChange={setSugarFreeOnly} />

        {loading && (
          <p className="mt-8 text-gray-400">Se incarca produsele...</p>
        )}

        {!loading && error && <p className="mt-8 text-red-400">{error}</p>}

        {!loading && !error && categories.length === 0 && (
          <p className="mt-8 text-gray-400">Produse indisponibile</p>
        )}

        {!loading && !error && categories.length > 0 && (
          <div className="mt-8 space-y-10">
            {categories.map((category) => {
              const categoryProducts = products
                .filter(
                  (product) =>
                    product.category_id === category.id ||
                    normalizeName(product.name) ===
                      normalizeName(category.name),
                )
                .filter((product) =>
                  sugarFreeOnly ? Boolean(product.fara_zahar) : true,
                );

              return (
                <section key={category.id} className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">
                    {category.name}
                  </h2>

                  {categoryProducts.length === 0 ? (
                    <p className="text-gray-400">Produse indisponibile</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                      {categoryProducts.map((product) => (
                        <Link
                          key={product.id}
                          to={`/produs/${product.id}`}
                          className="group rounded-xl border border-gray-800 bg-zinc-900/70 p-4 transition hover:border-orange-500/60"
                        >
                          <div className="aspect-4/3 w-full overflow-hidden rounded-lg border border-gray-800 bg-zinc-800">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
                                Imagine indisponibila
                              </div>
                            )}
                          </div>
                          <h3 className="mt-4 text-lg font-semibold text-white">
                            {product.name}
                          </h3>
                          <p className="mt-2 text-sm text-gray-400">
                            {product.description}
                          </p>
                          <div className="mt-4 text-base font-semibold text-orange-300">
                            {product.price !== null &&
                            product.price !== undefined
                              ? `${product.price} lei`
                              : "Pret indisponibil"}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
