import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Icon from "../components/Icon";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";

const Favorites = () => {
  const { favorites } = useFavorites();
  const { addItem } = useCart();

  const addAll = () => {
    favorites
      .filter((p) => typeof p.stock !== "number" || p.stock > 0)
      .forEach((product) => addItem(product, 1));
  };

  return (
    <Layout>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-volt">
            Contul tău
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
            Produse favorite
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {favorites.length === 0
              ? "Nu ai salvat niciun produs."
              : `${favorites.length} ${favorites.length === 1 ? "produs salvat" : "produse salvate"}`}
          </p>
        </div>

        {favorites.length > 0 && (
          <button
            type="button"
            onClick={addAll}
            className="flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-volt"
          >
            <Icon name="cart" className="h-4 w-4" />
            Adaugă toate în coș
          </button>
        )}
      </header>

      {favorites.length === 0 ? (
        <div className="py-20 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <Icon name="heart" className="h-7 w-7 text-slate-300" />
          </span>
          <p className="mt-6 text-sm text-slate-500">
            Apasă pe inimioara de pe un produs ca să-l salvezi aici.
          </p>
          <Link
            to="/produse"
            className="mt-6 inline-block rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-volt"
          >
            Explorează produsele
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favorites.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Favorites;
