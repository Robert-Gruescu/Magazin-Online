import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Filter from "../components/Filter";
import supabase from "../services/supabaseClient";

const Home = () => {
  const [products, setProducts] = useState([]);
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

      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select(
          "id, name, description, price, image_url, category_id, fara_zahar, bio",
        );

      if (!isMounted) {
        return;
      }

      if (productsError) {
        setError("Nu am putut incarca produsele.");
        setProducts([]);
        setLoading(false);
        return;
      }

      setProducts(productsData || []);
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

  const filteredProducts = products.filter((product) => {
    if (sugarFreeOnly && !product.fara_zahar) {
      return false;
    }
    if (bioOnly && !product.bio) {
      return false;
    }
    if (searchQuery) {
      const nameValue = (product.name || "").toLowerCase();
      return nameValue.includes(searchQuery);
    }
    return true;
  });

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
        <Filter onSugarFreeChange={setSugarFreeOnly} onBioChange={setBioOnly} />

        {loading && (
          <p className="mt-8 text-gray-400">Se incarca produsele...</p>
        )}

        {!loading && error && <p className="mt-8 text-red-400">{error}</p>}

        {!loading && !error && filteredProducts.length === 0 && (
          <p className="mt-8 text-gray-400">
            {searchQuery
              ? "Nu am gasit produse"
              : bioOnly
                ? "Nu sunt produse bio"
                : "Produse indisponibile"}
          </p>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {filteredProducts.map((product) => (
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
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
