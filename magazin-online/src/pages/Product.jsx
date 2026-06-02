import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import supabase from "../services/supabaseClient";

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      if (!id) {
        setError("Produsul nu a fost gasit.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("products")
        .select("id, name, description, price, image_url")
        .eq("id", id)
        .single();

      if (!isMounted) {
        return;
      }

      if (fetchError) {
        setError("Nu am putut incarca produsul.");
        setProduct(null);
      } else {
        setProduct(data);
      }

      setLoading(false);
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Navbar />
      <div className="container mx-auto p-8">
        <Link to="/" className="text-orange-400 hover:text-orange-300">
          Inapoi la produse
        </Link>

        {loading && (
          <p className="mt-6 text-gray-400">Se incarca produsul...</p>
        )}

        {!loading && error && <p className="mt-6 text-red-400">{error}</p>}

        {!loading && !error && product && (
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div className="aspect-square w-full overflow-hidden rounded-xl border border-gray-800 bg-zinc-900">
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
            <div>
              <h1 className="text-3xl font-bold text-white">{product.name}</h1>
              <p className="mt-4 text-gray-400">{product.description}</p>
              <div className="mt-6 text-2xl font-semibold text-white">
                {product.price !== null && product.price !== undefined
                  ? `${product.price} lei`
                  : "Pret indisponibil"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Product;
