import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import Search from "./Search";
import Icon from "./Icon";
import { CATEGORIES, SITE } from "../config/site";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";

const Navbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountRef = useRef(null);
  const location = useLocation();

  const { totalItems } = useCart();
  const { favorites } = useFavorites();
  const { user, signOut } = useAuth();

  // Închide meniurile la schimbarea rutei. Ajustarea stării în timpul
  // render-ului (nu într-un efect) evită un al doilea render inutil.
  const [lastKey, setLastKey] = useState(location.key);
  if (lastKey !== location.key) {
    setLastKey(location.key);
    setIsMobileOpen(false);
    setIsAccountOpen(false);
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setIsAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const pillLink =
    "flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-volt/40 hover:text-ink";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur">
      {/* Bara de anunț */}
      <div className="bg-ink text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-6 py-1.5 text-[11px] font-medium tracking-wide">
          <Icon name="truck" className="h-3.5 w-3.5 text-volt" />
          Livrare gratuită la comenzi peste 500 lei · Retur în 30 de zile
        </div>
      </div>

      {/* Bara principală */}
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-3">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-white">
            <Icon name="bolt" className="h-4 w-4" filled />
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-ink">
            {SITE.name}
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 md:block">
          <Search />
        </div>

        {/* Acțiuni desktop */}
        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <Link to="/favorite" className={pillLink}>
            <Icon
              name="heart"
              className="h-4 w-4"
              filled={favorites.length > 0}
            />
            <span className="hidden lg:inline">Favorite</span>
            {favorites.length > 0 && (
              <span className="rounded-full bg-rose-100 px-1.5 text-[11px] font-bold text-rose-600">
                {favorites.length}
              </span>
            )}
          </Link>

          {/* Cont */}
          <div className="relative" ref={accountRef}>
            <button
              type="button"
              onClick={() => setIsAccountOpen((prev) => !prev)}
              className={pillLink}
              aria-expanded={isAccountOpen}
              aria-haspopup="true"
            >
              <Icon name="user" className="h-4 w-4" />
              <span className="hidden lg:inline">
                {user ? user.email?.split("@")[0] : "Cont"}
              </span>
              <Icon name="chevronDown" className="h-3 w-3 text-slate-400" />
            </button>

            {isAccountOpen && (
              <div className="absolute right-0 z-30 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-lift">
                {user ? (
                  <>
                    <div className="px-3 py-2">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                        Conectat ca
                      </p>
                      <p className="truncate text-sm font-semibold text-ink">
                        {user.email}
                      </p>
                    </div>
                    <div className="my-1 h-px bg-slate-100" />
                    <Link
                      to="/comenzile-mele"
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-ink"
                    >
                      <Icon name="truck" className="h-4 w-4" />
                      Comenzile mele
                    </Link>
                    <Link
                      to="/suport"
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-ink"
                    >
                      <Icon name="wrench" className="h-4 w-4" />
                      Suport
                    </Link>
                    <button
                      type="button"
                      onClick={signOut}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-ink"
                    >
                      <Icon name="logout" className="h-4 w-4" />
                      Deconectare
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-ink"
                    >
                      <Icon name="user" className="h-4 w-4" />
                      Autentificare
                    </Link>
                    <Link
                      to="/register"
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-ink"
                    >
                      <Icon name="check" className="h-4 w-4" />
                      Creează cont
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <Link
            to="/cart"
            className="flex items-center gap-1.5 rounded-xl bg-ink px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-volt"
          >
            <Icon name="cart" className="h-4 w-4" />
            Coș
            {totalItems > 0 && (
              <span className="rounded-full bg-volt px-1.5 text-[11px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>
        </div>

        {/* Acțiuni mobil */}
        <div className="ml-auto flex shrink-0 items-center gap-2 md:hidden">
          <Link
            to="/cart"
            className="relative flex items-center justify-center rounded-xl bg-ink p-2 text-white"
            aria-label="Coș"
          >
            <Icon name="cart" className="h-4 w-4" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-volt px-1 text-[10px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            className="rounded-xl border border-slate-200 bg-white p-2 text-ink"
            aria-label="Meniu"
            aria-expanded={isMobileOpen}
          >
            <Icon name={isMobileOpen ? "close" : "menu"} className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Bara de categorii (desktop) */}
      <div className="hidden border-t border-slate-100 md:block">
        <div className="mx-auto flex max-w-6xl items-center gap-1 px-6 py-1.5">
          <NavLink
            to="/produse"
            className={({ isActive }) =>
              `rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                isActive ? "bg-ink text-white" : "text-slate-600 hover:text-ink"
              }`
            }
          >
            Toate produsele
          </NavLink>

          {CATEGORIES.map((cat) => (
            <NavLink
              key={cat.slug}
              to={`/categorie/${cat.slug}`}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? "bg-ink text-white"
                    : "text-slate-600 hover:text-ink"
                }`
              }
            >
              {cat.label}
            </NavLink>
          ))}

          <Link
            to="/suport"
            className="ml-auto rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:text-ink"
          >
            Suport
          </Link>

          <Link
            to="/reduceri"
            className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-600"
          >
            <Icon name="tag" className="h-3.5 w-3.5" />
            Reduceri
          </Link>
        </div>
      </div>

      {/* Meniu mobil */}
      {isMobileOpen && (
        <div className="border-t border-slate-100 bg-white px-6 py-4 md:hidden">
          <Search />

          <div className="mt-4 grid gap-1">
            <Link
              to="/produse"
              className="rounded-xl px-3 py-2.5 text-sm font-semibold text-ink hover:bg-slate-50"
            >
              Toate produsele
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                to={`/categorie/${cat.slug}`}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-ink"
              >
                <Icon name={cat.icon} className="h-4 w-4 text-volt" />
                {cat.label}
              </Link>
            ))}
          </div>

          <Link
            to="/reduceri"
            className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-3 py-2.5 text-sm font-semibold text-white"
          >
            <Icon name="tag" className="h-4 w-4" />
            Reducerile săptămânii
          </Link>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            <Link to="/favorite" className={pillLink}>
              <Icon name="heart" className="h-4 w-4" />
              Favorite {favorites.length > 0 ? `(${favorites.length})` : ""}
            </Link>
            <Link to="/suport" className={pillLink}>
              <Icon name="wrench" className="h-4 w-4" />
              Suport
            </Link>
            {user ? (
              <button type="button" onClick={signOut} className={pillLink}>
                <Icon name="logout" className="h-4 w-4" />
                Deconectare
              </button>
            ) : (
              <Link to="/login" className={pillLink}>
                <Icon name="user" className="h-4 w-4" />
                Autentificare
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
