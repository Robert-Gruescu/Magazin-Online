import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

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

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const currentCategorySlug = location.pathname.startsWith("/category/")
    ? location.pathname.split("/")[2]
    : "";

  const isCategorySelected = (slug) => currentCategorySlug === slug;

  const handleCategoryClick = (slug) => {
    if (isCategorySelected(slug)) {
      navigate("/");
      return;
    }

    navigate(`/category/${slug}`);
  };

  return (
    <nav className="bg-black text-[#FF6600] p-4 font-sans border-b border-gray-900">
      <div className="container mx-auto flex items-center gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {/* Numele Site-ului */}
          <div className="shrink-0 text-2xl font-bold">
            <Link to="/" className="hover:text-white transition-colors">
              Magazin Online
            </Link>
          </div>

          {/* Bara de cautare */}
          <div className="relative w-full max-w-2xl">
            <input
              type="search"
              placeholder="Incepe o noua cautare"
              className="w-full rounded-full bg-white px-4 py-2 pr-12 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF6600]/60"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-[#FF6600] hover:bg-gray-100"
              aria-label="Cauta"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Buton Burger pentru Mobil */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-[#FF6600] hover:text-white focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
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

      {/* Bara cu Produse (exact ca in imagine) */}
      <div className="mt-3 hidden md:block">
        <div className="rounded-lg bg-linear-to-r from-red-600 via-purple-600 to-blue-600 px-3 py-2">
          <div className="flex items-center justify-between gap-4">
            <div className="relative" ref={productsMenuRef}>
              <button
                type="button"
                onClick={() => setIsProductsOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-black shadow-sm ring-1 ring-black/10 hover:bg-gray-100"
                aria-expanded={isProductsOpen}
                aria-haspopup="true"
              >
                <span className="inline-flex h-4 w-4 flex-col justify-between">
                  <span className="h-0.5 w-full bg-black" />
                  <span className="h-0.5 w-full bg-black" />
                  <span className="h-0.5 w-full bg-black" />
                </span>
                Produse
                <svg
                  className="h-4 w-4 text-black/70"
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
                <div
                  className="absolute left-0 z-10 mt-2 w-64 rounded-md bg-white py-2 text-sm text-black shadow-lg ring-1 ring-black/10"
                  role="menu"
                >
                  <button
                    type="button"
                    onClick={() => handleCategoryClick("fructe")}
                    className="flex items-center px-4 py-2 hover:bg-gray-100"
                  >
                    <span
                      className={`mr-3 flex h-4 w-4 items-center justify-center rounded border ${
                        isCategorySelected("fructe")
                          ? "border-orange-500 bg-orange-500"
                          : "border-gray-300 bg-gray-100"
                      }`}
                      aria-hidden="true"
                    />
                    Fructe
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCategoryClick("legume")}
                    className="flex items-center px-4 py-2 hover:bg-gray-100"
                  >
                    <span
                      className={`mr-3 flex h-4 w-4 items-center justify-center rounded border ${
                        isCategorySelected("legume")
                          ? "border-orange-500 bg-orange-500"
                          : "border-gray-300 bg-gray-100"
                      }`}
                      aria-hidden="true"
                    />
                    Legume
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCategoryClick("bauturi")}
                    className="flex items-center px-4 py-2 hover:bg-gray-100"
                  >
                    <span
                      className={`mr-3 flex h-4 w-4 items-center justify-center rounded border ${
                        isCategorySelected("bauturi")
                          ? "border-orange-500 bg-orange-500"
                          : "border-gray-300 bg-gray-100"
                      }`}
                      aria-hidden="true"
                    />
                    Bauturi
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCategoryClick("congelate")}
                    className="flex items-center px-4 py-2 hover:bg-gray-100"
                  >
                    <span
                      className={`mr-3 flex h-4 w-4 items-center justify-center rounded border ${
                        isCategorySelected("congelate")
                          ? "border-orange-500 bg-orange-500"
                          : "border-gray-300 bg-gray-100"
                      }`}
                      aria-hidden="true"
                    />
                    Congelate
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCategoryClick("carne")}
                    className="flex items-center px-4 py-2 hover:bg-gray-100"
                  >
                    <span
                      className={`mr-3 flex h-4 w-4 items-center justify-center rounded border ${
                        isCategorySelected("carne")
                          ? "border-orange-500 bg-orange-500"
                          : "border-gray-300 bg-gray-100"
                      }`}
                      aria-hidden="true"
                    />
                    Carne
                  </button>
                </div>
              )}
            </div>
            <Link
              to="/cos-cumparaturi"
              className="ml-auto flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
            >
              <svg
                className="h-5 w-5"
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
              Cos
            </Link>
          </div>
        </div>
      </div>

      {/* Meniu Mobil - Afișat doar când e deschis */}
      {isOpen && (
        <div className="md:hidden bg-black mt-2 space-y-2 pb-4 px-2 flex flex-col font-semibold border-t border-gray-900 pt-2">
          <Link
            to="/category/fructe"
            className="hover:text-white py-1 transition-colors"
          >
            Fructe
          </Link>
          <Link
            to="/category/legume"
            className="hover:text-white py-1 transition-colors"
          >
            Legume
          </Link>
          <Link
            to="/category/bauturi"
            className="hover:text-white py-1 transition-colors"
          >
            Bauturi
          </Link>
          <Link
            to="/category/congelate"
            className="hover:text-white py-1 transition-colors"
          >
            Congelate
          </Link>
          <Link
            to="/category/carne"
            className="hover:text-white py-1 transition-colors"
          >
            Carne
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
