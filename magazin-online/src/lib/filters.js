// Starea panoului de filtre din catalog, ținută separat de componentă ca
// paginile să o poată inițializa fără să importe UI.

export const EMPTY_FILTERS = {
  brands: [],
  minPrice: "",
  maxPrice: "",
  minRating: 0,
  inStockOnly: false,
};

export const hasActiveFilters = (value) =>
  value.brands.length > 0 ||
  value.minPrice !== "" ||
  value.maxPrice !== "" ||
  value.minRating > 0 ||
  value.inStockOnly;
