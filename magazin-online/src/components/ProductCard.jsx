import { Link } from "react-router-dom";
import Icon from "./Icon";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { discountPercent, formatPrice, stockLabel } from "../lib/format";

const toneClasses = {
  in: "text-emerald-600",
  low: "text-amber-600",
  out: "text-rose-600",
};

/**
 * Cardul de produs, folosit pe landing, catalog, categorie și favorite.
 * Cardul întreg e un <Link>; butoanele din interior opresc propagarea.
 */
const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const stock = product.stock;
  const outOfStock = typeof stock === "number" && stock <= 0;
  const stockInfo = stockLabel(stock);
  const discount = discountPercent(product.pret_vechi, product.price);
  const favorite = isFavorite(product.id);

  const handleAdd = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!outOfStock) addItem(product, 1);
  };

  const handleFavorite = (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleFavorite(product);
  };

  return (
    <Link
      to={`/produs/${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-soft transition hover:-translate-y-1 hover:border-volt/40 hover:shadow-lift"
    >
      {/* Badge-uri */}
      <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
        {discount !== null && (
          <span className="rounded-md bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white">
            -{discount}%
          </span>
        )}
        {outOfStock && (
          <span className="rounded-md bg-slate-700 px-2 py-0.5 text-[11px] font-bold text-white">
            Stoc epuizat
          </span>
        )}
      </div>

      {/* Favorite */}
      <button
        type="button"
        onClick={handleFavorite}
        aria-label={favorite ? "Șterge din favorite" : "Adaugă la favorite"}
        className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur transition ${
          favorite
            ? "border-rose-200 bg-rose-50 text-rose-500"
            : "border-slate-200 bg-white/80 text-slate-400 hover:text-rose-500"
        }`}
      >
        <Icon name="heart" className="h-4 w-4" filled={favorite} />
      </button>

      {/* Imagine */}
      <div className="aspect-4/3 w-full overflow-hidden bg-slate-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className={`h-full w-full object-contain p-4 transition duration-300 group-hover:scale-105 ${
              outOfStock ? "opacity-50 grayscale" : ""
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
            Imagine indisponibilă
          </div>
        )}
      </div>

      {/* Conținut */}
      <div className="flex flex-1 flex-col p-4">
        {product.brand && (
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-volt">
            {product.brand}
          </span>
        )}

        <h3 className="mt-1 line-clamp-2 font-display text-[15px] font-semibold leading-snug text-ink">
          {product.name}
        </h3>

        {/* Rating */}
        {Number.isFinite(Number(product.rating)) && Number(product.rating) > 0 && (
          <div className="mt-1.5 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <Icon
                key={n}
                name="star"
                className={`h-3 w-3 ${
                  n <= Math.round(Number(product.rating))
                    ? "text-amber-400"
                    : "text-slate-200"
                }`}
                filled
              />
            ))}
            <span className="ml-1 text-[11px] text-slate-400">
              {Number(product.rating).toFixed(1)}
            </span>
          </div>
        )}

        {stockInfo && (
          <p className={`mt-2 text-[11px] font-medium ${toneClasses[stockInfo.tone]}`}>
            {stockInfo.text}
          </p>
        )}

        {/* Preț + acțiune */}
        <div className="mt-auto pt-4">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg font-bold text-ink">
              {formatPrice(product.price) ?? "Preț indisponibil"}
            </span>
            {discount !== null && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(product.pret_vechi)}
              </span>
            )}
          </div>

          {product.garantie_luni ? (
            <p className="mt-1 text-[11px] text-slate-400">
              Garanție {product.garantie_luni} luni
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleAdd}
            disabled={outOfStock}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-2.5 text-xs font-semibold text-white transition hover:bg-volt disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            <Icon name="cart" className="h-4 w-4" />
            {outOfStock ? "Indisponibil" : "Adaugă în coș"}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
