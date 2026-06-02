import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Search from "./Search";

const categories = [
  { label: "Fructe", slug: "fructe" },
  { label: "Legume", slug: "legume" },
  { label: "Băuturi", slug: "bauturi" },
  { label: "Congelate", slug: "congelate" },
  { label: "Carne", slug: "carne" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const productsMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        productsMenuRef.current &&
        !productsMenuRef.current.contains(event.target)
      ) {
        setIsProductsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentCategorySlug = location.pathname.startsWith("/category/")
    ? location.pathname.split("/")[2]
    : "";

  const isCategorySelected = (slug) => currentCategorySlug === slug;

  const handleCategoryClick = (slug) => {
    setIsProductsOpen(false);
    if (isCategorySelected(slug)) {
      navigate("/");
      return;
    }
    navigate(`/category/${slug}`);
  };

  return (
    <nav className="border-b border-ink/8 bg-white/88 backdrop-blur">
      {/* Bara principala */}
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-3">
        {/* Brand + Search */}
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <Link to="/" className="shrink-0 font-display text-xl text-ink">
            Magazin Online
          </Link>
          <Search />
        </div>

        {/* Actiuni desktop */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            to="/register"
            className="rounded-full border border-ink/10 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-ink/60 transition hover:bg-white"
          >
            Cont
          </Link>
          <Link
            to="/cos-cumparaturi"
            className="flex items-center gap-2 rounded-full bg-ink px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-black transition hover:bg-ink/80"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="9" cy="20" r="1" />
              <circle cx="17" cy="20" r="1" />
              <path d="M3 4h2l2.5 11h11l2-7H7.2" />
            </svg>
            Coș
          </Link>
        </div>

        {/* Burger mobil */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-xl border border-ink/10 bg-white/70 p-2 md:hidden"
          aria-label="Meniu"
        >
          <svg
            className="h-5 w-5 text-ink"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Bara categorii desktop */}
      <div className="hidden border-t border-ink/6 md:block">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-2">
          {/* Dropdown Produse */}
          <div className="relative" ref={productsMenuRef}>
            <button
              type="button"
              onClick={() => setIsProductsOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-ink/70 transition hover:bg-white"
              aria-expanded={isProductsOpen}
              aria-haspopup="true"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              Categorii
              <svg
                className="h-3 w-3 text-ink/40"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.25 7.5L10 12.25 14.75 7.5"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Dropdown menu */}
            {isProductsOpen && (
              <div className="absolute left-0 z-20 mt-2 w-52 rounded-2xl border border-ink/8 bg-white/95 py-2 shadow-soft backdrop-blur">
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => handleCategoryClick(cat.slug)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-ink/70 transition hover:bg-ink/4 hover:text-ink"
                  >
                    <span
                      className={`h-3.5 w-3.5 flex-shrink-0 rounded border transition ${
                        isCategorySelected(cat.slug)
                          ? "border-ink bg-ink"
                          : "border-ink/20 bg-transparent"
                      }`}
                      aria-hidden="true"
                    />
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Categorii rapide */}
          <div className="flex items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => handleCategoryClick(cat.slug)}
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                  isCategorySelected(cat.slug)
                    ? "bg-ink text-white"
                    : "text-ink/50 hover:text-ink"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Meniu mobil */}
      {isOpen && (
        <div className="border-t border-ink/8 bg-white/95 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => {
                  handleCategoryClick(cat.slug);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isCategorySelected(cat.slug)
                    ? "bg-ink/5 text-ink"
                    : "text-ink/60 hover:text-ink"
                }`}
              >
                <span
                  className={`h-3.5 w-3.5 flex-shrink-0 rounded border ${
                    isCategorySelected(cat.slug)
                      ? "border-ink bg-ink"
                      : "border-ink/20"
                  }`}
                  aria-hidden="true"
                />
                {cat.label}
              </button>
            ))}
            <div className="mt-3 flex gap-2 border-t border-ink/8 pt-3">
              <Link
                to="/register"
                className="rounded-full border border-ink/10 bg-white/70 px-4 py-1.5 text-xs font-semibold text-ink/60"
              >
                Cont
              </Link>
              <Link
                to="/cos-cumparaturi"
                className="flex items-center gap-2 rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-white"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="9" cy="20" r="1" />
                  <circle cx="17" cy="20" r="1" />
                  <path d="M3 4h2l2.5 11h11l2-7H7.2" />
                </svg>
                Coș
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
