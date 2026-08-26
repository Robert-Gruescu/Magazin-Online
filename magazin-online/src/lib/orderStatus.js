// Statusurile de comandă sunt definite de constrângerea `orders_status_check`
// din baza de date. Orice valoare nouă trebuie adăugată întâi acolo.

export const ORDER_STATUSES = [
  { value: "noua", label: "Nouă", className: "bg-slate-100 text-slate-600" },
  {
    value: "pregatire",
    label: "În pregătire",
    className: "bg-blue-50 text-blue-700",
  },
  {
    value: "livrare",
    label: "În livrare",
    className: "bg-amber-50 text-amber-700",
  },
  {
    value: "livrata",
    label: "Livrată",
    className: "bg-emerald-50 text-emerald-700",
  },
  { value: "anulata", label: "Anulată", className: "bg-rose-50 text-rose-700" },
];

export const statusInfo = (value) =>
  ORDER_STATUSES.find((s) => s.value === value) || ORDER_STATUSES[0];
