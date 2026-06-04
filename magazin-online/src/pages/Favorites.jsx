import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useFavorites } from "../context/FavoritesContext";
import { useCart } from "../context/CartContext";

function Favorites() {
  const { favorites, removeFavorite } = useFavorites();
  const { addItem } = useCart();
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden font-sans">
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
          <header className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-ink/40">
                Contul tău
              </p>
              <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
                Favorite
              </h1>
              <p className="mt-2 text-sm text-ink/55">
                {favorites.length === 0
                  ? "Nu ai salvat niciun produs."
                  : `${favorites.length} ${favorites.length === 1 ? "produs salvat" : "produse salvate"}`}
              </p>
            </div>
            <Link
              to="/"
              className="rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/60 transition hover:bg-white"
            >
              Înapoi la produse
            </Link>
          </header>

          {favorites.length === 0 ? (
            <div className="mt-20 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-ink/8 bg-white/70">
                <svg
                  className="h-7 w-7 text-ink/30"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </div>
              <p className="text-sm text-ink/40">
                Nu ai niciun produs salvat la favorite.
              </p>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="mt-4 rounded-full bg-ink px-6 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
              >
                Explorează produsele
              </button>
            </div>
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map((product) => (
                <div
                  key={product.id}
                  className="group rounded-3xl border border-white/60 bg-white/85 shadow-soft backdrop-blur"
                >
                  {/* Imagine */}
                  <button
                    type="button"
                    onClick={() => navigate(`/produs/${product.id}`)}
                    className="w-full"
                    aria-label={`Vezi produsul ${product.name}`}
                  >
                    <div className="aspect-4/3 w-full overflow-hidden rounded-t-3xl bg-ink/5">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-ink/30">
                          Imagine indisponibilă
                        </div>
                      )}
                    </div>
                  </button>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className="cursor-pointer font-display text-lg text-ink hover:underline"
                        onClick={() => navigate(`/produs/${product.id}`)}
                      >
                        {product.name}
                      </h3>
                      {/* Buton sterge din favorite */}
                      <button
                        type="button"
                        onClick={() => removeFavorite(product.id)}
                        className="flex-shrink-0 rounded-xl border border-ink/8 bg-white/70 p-1.5 text-ink/30 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500"
                        aria-label="Șterge din favorite"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                        </svg>
                      </button>
                    </div>

                    {product.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-ink/50">
                        {product.description}
                      </p>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-base font-semibold text-ink">
                        {product.price != null
                          ? `${Number(product.price).toFixed(2)} lei`
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

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          addItem(product, 1);
                          navigate("/cart");
                        }}
                        className="rounded-full bg-ink py-2 text-xs font-semibold text-white transition hover:bg-ink/80"
                      >
                        Adaugă în coș
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/produs/${product.id}`)}
                        className="rounded-full border border-ink/10 bg-white/70 py-2 text-xs font-semibold text-ink/60 transition hover:bg-white"
                      >
                        Vezi produs
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Favorites;
