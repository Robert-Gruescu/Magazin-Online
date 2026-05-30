import React, { useState } from "react";

const Filter = ({ onSugarFreeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSugarFreeOnly, setIsSugarFreeOnly] = useState(false);

  const handleSugarFreeChange = (event) => {
    const checked = event.target.checked;
    setIsSugarFreeOnly(checked);
    onSugarFreeChange?.(checked);
  };

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="rounded-md border border-orange-500 px-4 py-2 text-orange-500 hover:bg-orange-500 hover:text-black transition"
      >
        Filtru
      </button>
      {isOpen && (
        <div className="mt-4 rounded-lg border border-orange-500/30 bg-zinc-900/80 p-4">
          <p className="text-sm text-gray-400">Alege filtre</p>
          <div className="mt-3 flex flex-col gap-3">
            <label className="flex items-center gap-2 text-orange-100">
              <input type="checkbox" className="h-4 w-4 accent-orange-500" />
              Bio
            </label>
            <label className="flex items-center gap-2 text-orange-100">
              <input type="checkbox" className="h-4 w-4 accent-orange-500" />
              Reduceri
            </label>
            <label className="flex items-center gap-2 text-orange-100">
              <input
                type="checkbox"
                checked={isSugarFreeOnly}
                onChange={handleSugarFreeChange}
                className="h-4 w-4 accent-orange-500"
              />
              Fara zahar
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filter;
