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
            "id, name, description, price, image_url, category_id, fara_zahar, bio",
          ),
      ]);

      if (!isMounted) {
        return;
      }

      if (categoriesError || productsError) {
        setError("Nu am putut incarca produsele din categorie.");
        setCategory(null);
        setProducts([]);
        setLoading(false);
        return;
      }

      const foundCategory = (categoriesData || []).find(
        (item) => normalizeName(item.name) === normalizedSlug,
      );

      if (!foundCategory) {
        setError("Categoria nu a fost gasita.");
        setCategory(null);
        setProducts([]);
        setLoading(false);
        return;
      }

      const categoryProducts = (productsData || []).filter(
        (product) =>
          product.category_id === foundCategory.id ||
          normalizeName(product.name) === normalizeName(foundCategory.name),
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
    <div className="min-h-screen bg-black text-white font-sans">
      <Navbar />
      <div className="container mx-auto p-8">
        <Link to="/" className="text-orange-400 hover:text-orange-300">
          Inapoi la pagina principala
        </Link>

        {loading && (
          <p className="mt-8 text-gray-400">Se incarca categoria...</p>
        )}

        {!loading && error && <p className="mt-8 text-red-400">{error}</p>}

        {!loading && !error && category && (
          <>
            <h1 className="mt-6 text-3xl font-bold text-white">
              {category.name}
            </h1>
            <p className="mt-3 text-gray-400">
              Produsele din categoria {category.name}.
            </p>

            {products.length === 0 ? (
              <p className="mt-8 text-gray-400">Produse indisponibile</p>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                {products.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => navigate(`/produs/${product.id}`)}
                    className="group w-full cursor-pointer rounded-xl border border-gray-800 bg-zinc-900/70 p-4 text-left transition hover:border-orange-500/60"
                    aria-label={`Vezi produsul ${product.name || ""}`}
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
                      {product.price !== null && product.price !== undefined
                        ? `${product.price} lei`
                        : "Pret indisponibil"}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {product.bio ? "Bio" : "Non-bio"}
                      {typeof product.fara_zahar === "boolean"
                        ? product.fara_zahar
                          ? " • Fara zahar"
                          : " • Cu zahar"
                        : ""}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Category;
