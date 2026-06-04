import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Search from "./Search";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";

const categories = [
  { label: "Fructe", slug: "fructe" },
  { label: "Legume", slug: "legume" },
  { label: "Băuturi", slug: "bauturi" },
  { label: "Congelate", slug: "congelate" },
  { label: "Carne", slug: "carne" },
];

const Navbar = ({ selectedCategory, onCategoryClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const productsMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { items } = useCart();
  const { favorites } = useFavorites();

  const uniqueItems = items.length;

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

  const isCategorySelected = (slug) =>
    selectedCategory ? selectedCategory === slug : currentCategorySlug === slug;

  const handleCategoryClick = (slug) => {
    setIsProductsOpen(false);
    if (onCategoryClick) {
      onCategoryClick(slug);
      return;
    }
    if (isCategorySelected(slug)) {
      navigate("/");
      return;
    }
    navigate(`/category/${slug}`);
  };

  return (
    <nav className="border-b border-gray-200 bg-white/90 backdrop-blur sticky top-0 z-50 w-full">
      {/* Bara principala */}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        {/* Brand + Search */}
        <div className="flex items-center gap-4 min-w-0">
          <Link
            to="/"
            className="shrink-0 font-bold text-xl text-black tracking-tight"
          >
            Magazin Online
          </Link>
          <Search />
        </div>

        {/* Actiuni desktop */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {/* Buton Favorite */}
          <Link
            to="/favorite"
            className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-gray-700 transition hover:bg-gray-50"
          >
            <svg
              className="h-3.5 w-3.5 text-gray-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            Favorite
            {favorites.length > 0 && (
              <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-xs font-semibold text-rose-600">
                {favorites.length}
              </span>
            )}
          </Link>

          {/* Buton Cont */}
          <Link
            to="/register"
            className="rounded-full border border-gray-200 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-gray-700 transition hover:bg-gray-50"
          >
            Cont
          </Link>

          {/* Buton Cos - Acum in aceeasi tema ca Favorite */}
          <Link
            to="/cart"
            className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-gray-700 transition hover:bg-gray-50"
          >
            <svg
              className="h-4 w-4 text-gray-600"
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
            {uniqueItems > 0 && (
              <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-semibold text-gray-800">
                {uniqueItems}
              </span>
            )}
          </Link>
        </div>

        {/* Actiuni vizibile pe mobil */}
        <div className="flex items-center gap-2 md:hidden shrink-0">
          {/* Favorite Mobil */}
          <Link
            to="/favorite"
            className="flex items-center justify-center rounded-xl border border-gray-200 bg-white/70 p-2 text-gray-600"
            aria-label="Favorite"
          >
            <svg
              className="h-4 w-4"
              fill={favorites.length > 0 ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </Link>

          {/* Cos Mobil - In aceeasi tema */}
          <Link
            to="/cart"
            className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-gray-700"
          >
            <svg
              className="h-4 w-4 text-gray-600"
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
            {uniqueItems > 0 && (
              <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-semibold text-gray-800">
                {uniqueItems}
              </span>
            )}
          </Link>

          {/* Buton Burger Meniu */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-xl border border-gray-200 bg-white/70 p-2 text-black"
            aria-label="Meniu"
          >
            <svg
              className="h-5 w-5"
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
      </div>

      {/* Bara categorii desktop */}
      <div className="hidden border-t border-gray-100 md:block">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-2">
          <div className="relative" ref={productsMenuRef}>
            <button
              type="button"
              onClick={() => setIsProductsOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-gray-700 transition hover:bg-gray-50"
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
                className="h-3 w-3 text-gray-400"
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

            {isProductsOpen && (
              <div className="absolute left-0 z-20 mt-2 w-52 rounded-2xl border border-gray-100 bg-white py-2 shadow-xl backdrop-blur">
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => handleCategoryClick(cat.slug)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50 hover:text-black"
                  >
                    <span
                      className={`h-3.5 w-3.5 shrink-0 rounded border transition ${
                        isCategorySelected(cat.slug)
                          ? "border-black bg-black"
                          : "border-gray-300 bg-transparent"
                      }`}
                      aria-hidden="true"
                    />
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => handleCategoryClick(cat.slug)}
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                  isCategorySelected(cat.slug)
                    ? "bg-black text-white"
                    : "text-gray-500 hover:text-black"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Meniu mobil dropdown */}
      {isOpen && (
        <div className="border-t border-gray-100 bg-white px-6 py-4 md:hidden">
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
                    ? "bg-gray-100 text-black"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                <span
                  className={`h-3.5 w-3.5 shrink-0 rounded border ${
                    isCategorySelected(cat.slug)
                      ? "border-black bg-black"
                      : "border-gray-300"
                  }`}
                  aria-hidden="true"
                />
                {cat.label}
              </button>
            ))}
            <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
              <Link
                to="/register"
                className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold text-gray-600"
              >
                Cont
              </Link>
              <Link
                to="/favorite"
                className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold text-gray-600"
              >
                Favorite
                {favorites.length > 0 && (
                  <span className="rounded-full bg-rose-100 px-1.5 text-xs font-semibold text-rose-600">
                    {favorites.length}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
