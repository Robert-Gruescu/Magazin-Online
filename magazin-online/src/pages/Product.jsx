import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import supabase from "../services/supabaseClient";

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      if (!id) {
        setError("Produsul nu a fost găsit.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("products")
        .select("id, name, description, price, image_url, fara_zahar, bio")
        .eq("id", id)
        .single();

      if (!isMounted) return;

      if (fetchError) {
        setError("Nu am putut încărca produsul.");
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
    <div className="min-h-screen bg-[#f5f2eb] font-sans">
      <Navbar />

      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-ink/40">
          <Link to="/" className="transition hover:text-ink">
            Produse
          </Link>
          <span>/</span>
          <span className="text-ink/70">{product?.name ?? "..."}</span>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-20 text-center text-sm text-ink/40">
            Se încarcă produsul...
          </div>
        )}

        {/* Eroare */}
        {!loading && error && (
          <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        )}

        {/* Produs */}
        {!loading && !error && product && (
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            {/* Imagine */}
            <div className="aspect-square w-full overflow-hidden rounded-3xl border border-white/60 bg-white/85 shadow-soft">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-ink/30">
                  Imagine indisponibilă
                </div>
              )}
            </div>

            {/* Detalii */}
            <div className="flex flex-col">
              <div className="rounded-3xl border border-white/60 bg-white/85 p-6 shadow-soft backdrop-blur">
                {/* Badges */}
                <div className="flex items-center gap-2">
                  {product.bio && (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                      Bio
                    </span>
                  )}
                  {product.fara_zahar && (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                      Fără zahăr
                    </span>
                  )}
                  {!product.bio && !product.fara_zahar && (
                    <span className="rounded-full bg-ink/5 px-3 py-1 text-xs text-ink/40">
                      Produs standard
                    </span>
                  )}
                </div>

                {/* Titlu */}
                <h1 className="mt-4 font-display text-3xl text-ink sm:text-4xl">
                  {product.name}
                </h1>

                {/* Descriere */}
                {product.description && (
                  <p className="mt-3 text-sm leading-relaxed text-ink/60">
                    {product.description}
                  </p>
                )}

                {/* Pret */}
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="font-display text-3xl text-ink">
                    {product.price != null
                      ? `${Number(product.price).toFixed(2)} lei`
                      : "Preț indisponibil"}
                  </span>
                  <span className="text-xs text-ink/40">/ bucată</span>
                </div>

                <div className="mt-6 h-px bg-ink/7" />

                {/* Cantitate */}
                <div className="mt-5 flex items-center gap-4">
                  <span className="text-xs uppercase tracking-[0.2em] text-ink/45">
                    Cantitate
                  </span>
                  <div className="flex items-center gap-2 rounded-2xl border border-ink/10 bg-white/90 px-3 py-1.5">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="flex h-6 w-6 items-center justify-center rounded-full text-ink/50 transition hover:bg-ink/5 hover:text-ink"
                      aria-label="Scade cantitatea"
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                    <span className="w-6 text-center text-sm font-semibold text-ink">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-full text-ink/50 transition hover:bg-ink/5 hover:text-ink"
                      aria-label="Crește cantitatea"
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Total */}
                {product.price != null && (
                  <div className="mt-3 rounded-2xl border border-ink/5 bg-ink/3 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-ink/50">Total</span>
                      <span className="text-sm font-semibold text-ink">
                        {(Number(product.price) * quantity).toFixed(2)} lei
                      </span>
                    </div>
                  </div>
                )}

                {/* Butoane */}
                <div className="mt-5 flex flex-col gap-3">
                  <button
                    type="button"
                    className="w-full rounded-full bg-ink py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
                  >
                    Adaugă în coș
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-full rounded-full border border-ink/10 bg-white/70 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-ink/60 transition hover:bg-white"
                  >
                    Înapoi la produse
                  </button>
                </div>
              </div>

              {/* Info extra */}
              <div className="mt-4 rounded-3xl border border-white/60 bg-white/75 p-5 shadow-soft backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
                  Informații livrare
                </p>
                <ul className="mt-3 space-y-2 text-xs text-ink/60">
                  <li>Livrare în 24–48h în toată țara.</li>
                  <li>Ridicare gratuită din depozit.</li>
                  <li>Retur acceptat în 14 zile.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Product;
