import React, { useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-black text-[#FF6600] p-4 font-sans border-b border-gray-900">
      <div className="container mx-auto flex justify-between items-center">
        {/* Numele Site-ului */}
        <div className="text-xl font-bold">
          <a href="/" className="hover:text-white transition-colors">
            Magazin Online
          </a>
        </div>

        {/* Desktop Menu - Categoriile cerute de tine */}
        <div className="hidden md:flex space-x-6 font-semibold">
          <a
            href="/category/fructe"
            className="hover:text-white transition-colors"
          >
            Fructe
          </a>
          <a
            href="/category/legume"
            className="hover:text-white transition-colors"
          >
            Legume
          </a>
          <a
            href="/category/mezeluri"
            className="hover:text-white transition-colors"
          >
            Mezeluri
          </a>
          <a
            href="/category/congelate"
            className="hover:text-white transition-colors"
          >
            Congelate
          </a>
          <a
            href="/category/bauturi"
            className="hover:text-white transition-colors"
          >
            Bauturi
          </a>
          <a
            href="/category/carne"
            className="hover:text-white transition-colors"
          >
            Carne
          </a>
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

      {/* Meniu Mobil - Afișat doar când e deschis */}
      {isOpen && (
        <div className="md:hidden bg-black mt-2 space-y-2 pb-4 px-2 flex flex-col font-semibold border-t border-gray-900 pt-2">
          <a
            href="/category/fructe"
            className="hover:text-white py-1 transition-colors"
          >
            Fructe
          </a>
          <a
            href="/category/legume"
            className="hover:text-white py-1 transition-colors"
          >
            Legume
          </a>
          <a
            href="/category/mezeluri"
            className="hover:text-white py-1 transition-colors"
          >
            Mezeluri
          </a>
          <a
            href="/category/congelate"
            className="hover:text-white py-1 transition-colors"
          >
            Congelate
          </a>
          <a
            href="/category/bauturi"
            className="hover:text-white py-1 transition-colors"
          >
            Bauturi
          </a>
          <a
            href="/category/carne"
            className="hover:text-white py-1 transition-colors"
          >
            Carne
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
