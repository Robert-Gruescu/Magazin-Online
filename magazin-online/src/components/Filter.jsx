import React, { useState } from "react";

const Filter = ({ onSugarFreeChange, onBioChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSugarFreeOnly, setIsSugarFreeOnly] = useState(false);
  const [isBioOnly, setIsBioOnly] = useState(false);

  const handleSugarFreeChange = (event) => {
    const checked = event.target.checked;
    setIsSugarFreeOnly(checked);
    onSugarFreeChange?.(checked);
  };

  const handleBioChange = (event) => {
    const checked = event.target.checked;
    setIsBioOnly(checked);
    onBioChange?.(checked);
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-ink/70 transition hover:bg-white"
      >
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M4 6h16M7 12h10M10 18h4" />
        </svg>
        Filtre
      </button>

      {isOpen && (
        <div className="mt-4 rounded-3xl border border-white/60 bg-white/85 p-5 shadow-soft backdrop-blur">
          <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
            Alege filtre
          </p>
          <div className="mt-3 flex flex-col gap-3">
            <label className="flex items-center gap-3 text-sm text-ink/70">
              <input
                type="checkbox"
                checked={isBioOnly}
                onChange={handleBioChange}
                className="h-4 w-4 accent-emerald-600"
              />
              Doar produse Bio
            </label>
            <label className="flex items-center gap-3 text-sm text-ink/70">
              <input
                type="checkbox"
                checked={isSugarFreeOnly}
                onChange={handleSugarFreeChange}
                className="h-4 w-4 accent-amber-600"
              />
              Doar fără zahăr
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filter;
