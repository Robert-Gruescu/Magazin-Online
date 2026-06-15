import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

function Cart() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();
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

        <div className="mx-auto max-w-5xl px-6 py-10">
          <header className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-ink/40">
                Cumpărături
              </p>
              <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
                Coșul tău
              </h1>
              <p className="mt-2 text-sm text-ink/55">
                {items.length === 0
                  ? "Coșul este gol."
                  : `${items.length} ${items.length === 1 ? "produs" : "produse"} în coș`}
              </p>
            </div>
            <Link
              to="/"
              className="rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/60 transition hover:bg-white"
            >
              Continuă cumpărăturile
            </Link>
          </header>

          {items.length === 0 ? (
            <div className="mt-20 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/70 border border-ink/8">
                <svg
                  className="h-7 w-7 text-ink/30"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  <circle cx="9" cy="20" r="1" />
                  <circle cx="17" cy="20" r="1" />
                  <path d="M3 4h2l2.5 11h11l2-7H7.2" />
                </svg>
              </div>
              <p className="text-sm text-ink/40">Nu ai niciun produs în coș.</p>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="mt-4 rounded-full bg-ink px-6 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
              >
                Vezi produsele
              </button>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.4fr]">
              {/* Lista produse */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-3xl border border-white/60 bg-white/85 p-4 shadow-soft backdrop-blur"
                  >
                    {/* Imagine */}
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-ink/5">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-ink/30">
                          —
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-base text-ink">
                        {item.name}
                      </p>
                      <p className="mt-0.5 text-xs text-ink/50">
                        {Number(item.price).toFixed(2)} lei / buc
                      </p>
                    </div>

                    {/* Cantitate */}
                    <div className="flex items-center gap-2 rounded-2xl border border-ink/10 bg-white/90 px-3 py-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="flex h-6 w-6 items-center justify-center rounded-full text-ink/40 transition hover:bg-ink/5 hover:text-ink"
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
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        disabled={
                          typeof item.stock === "number" &&
                          item.quantity >= item.stock
                        }
                        className="flex h-6 w-6 items-center justify-center rounded-full text-ink/40 transition hover:bg-ink/5 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
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

                    {/* Subtotal */}
                    <div className="w-24 text-right">
                      <p className="text-sm font-semibold text-ink">
                        {(Number(item.price) * item.quantity).toFixed(2)} lei
                      </p>
                    </div>

                    {/* Sterge */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-ink/8 bg-white/70 text-ink/30 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500"
                      aria-label="Șterge produsul"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Sumar */}
              <div className="space-y-4">
                <div className="rounded-3xl border border-white/60 bg-white/85 p-6 shadow-soft backdrop-blur">
                  <h2 className="font-display text-xl text-ink">Sumar</h2>

                  <div className="mt-4 space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-xs text-ink/55"
                      >
                        <span className="truncate pr-2">
                          {item.name} × {item.quantity}
                        </span>
                        <span className="flex-shrink-0">
                          {(Number(item.price) * item.quantity).toFixed(2)} lei
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 border-t border-ink/8 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-ink/60">Total</span>
                      <span className="font-display text-2xl text-ink">
                        {totalPrice.toFixed(2)} lei
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/checkout")}
                    className="mt-5 w-full rounded-full bg-ink py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
                  >
                    Plasează comanda
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="mt-2 w-full rounded-full border border-ink/10 bg-white/70 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-ink/55 transition hover:bg-white"
                  >
                    Continuă cumpărăturile
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Cart;
