import { useState } from "react";
import Icon from "./Icon";
import { EMPTY_FILTERS, hasActiveFilters } from "../lib/filters";

/**
 * Panou de filtre pentru electronice: brand, interval de preț, rating minim,
 * doar produse în stoc. Complet controlat de părinte prin `value` / `onChange`,
 * ca starea filtrelor să poată fi sincronizată cu URL-ul.
 *
 * value = { brands: string[], minPrice: string, maxPrice: string,
 *           minRating: number, inStockOnly: boolean }
 */
const Filter = ({ value, onChange, brands = [], resultCount }) => {
  const [isOpen, setIsOpen] = useState(false);

  const patch = (changes) => onChange({ ...value, ...changes });

  const toggleBrand = (brand) => {
    const next = value.brands.includes(brand)
      ? value.brands.filter((b) => b !== brand)
      : [...value.brands, brand];
    patch({ brands: next });
  };

  const active = hasActiveFilters(value);

  const panel = (
    <div className="space-y-6">
      {/* Brand */}
      {brands.length > 0 && (
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Brand
          </h3>
          <div className="mt-3 max-h-56 space-y-1.5 overflow-y-auto pr-1">
            {brands.map((brand) => (
              <label
                key={brand}
                className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600 transition hover:text-ink"
              >
                <input
                  type="checkbox"
                  checked={value.brands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="h-4 w-4 rounded accent-volt"
                />
                {brand}
              </label>
            ))}
          </div>
        </section>
      )}

      {/* Preț */}
      <section>
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          Preț (lei)
        </h3>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="de la"
            value={value.minPrice}
            onChange={(e) => patch({ minPrice: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-volt focus:outline-none"
          />
          <span className="text-slate-300">–</span>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="până la"
            value={value.maxPrice}
            onChange={(e) => patch({ maxPrice: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-volt focus:outline-none"
          />
        </div>
      </section>

      {/* Rating */}
      <section>
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          Rating minim
        </h3>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[0, 3, 4, 4.5].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => patch({ minRating: r })}
              className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                value.minRating === r
                  ? "border-volt bg-volt/10 text-volt"
                  : "border-slate-200 bg-white text-slate-500 hover:text-ink"
              }`}
            >
              {r === 0 ? (
                "Oricare"
              ) : (
                <>
                  <Icon name="star" className="h-3 w-3 text-amber-400" filled />
                  {r}+
                </>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Disponibilitate */}
      <section>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={value.inStockOnly}
            onChange={(e) => patch({ inStockOnly: e.target.checked })}
            className="h-4 w-4 rounded accent-volt"
          />
          Doar produse în stoc
        </label>
      </section>

      {active && (
        <button
          type="button"
          onClick={() => onChange({ ...EMPTY_FILTERS })}
          className="w-full rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-500 transition hover:border-rose-200 hover:text-rose-600"
        >
          Resetează filtrele
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobil: buton + panou colapsabil */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink"
        >
          <span className="flex items-center gap-2">
            <Icon name="sliders" className="h-4 w-4 text-volt" />
            Filtre
            {active && (
              <span className="rounded-full bg-volt px-1.5 text-[10px] font-bold text-white">
                activ
              </span>
            )}
          </span>
          <span className="text-xs font-normal text-slate-400">
            {resultCount != null ? `${resultCount} rezultate` : ""}
          </span>
        </button>
        {isOpen && (
          <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-5">
            {panel}
          </div>
        )}
      </div>

      {/* Desktop: sidebar sticky */}
      <aside className="hidden lg:block">
        <div className="sticky top-40 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4">
            <Icon name="sliders" className="h-4 w-4 text-volt" />
            <h2 className="font-display text-sm font-bold text-ink">Filtre</h2>
          </div>
          {panel}
        </div>
      </aside>
    </>
  );
};

export default Filter;
