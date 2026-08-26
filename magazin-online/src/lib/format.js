// Helpers mici, folosiți în tot frontend-ul.

/** "TV & Audio" -> "tv-audio". Elimină diacriticele, apoi tot ce nu e alfanumeric. */
export const slugify = (value) =>
  (value ?? "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[țţ]/gi, "t")
    .replace(/[șş]/gi, "s")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const priceFormatter = new Intl.NumberFormat("ro-RO", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 1299.9 -> "1.299,90 lei". Returnează null dacă valoarea nu e numerică. */
export const formatPrice = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return `${priceFormatter.format(n)} lei`;
};

/** Procentul de reducere dintre prețul vechi și cel curent, sau null. */
export const discountPercent = (oldPrice, price) => {
  const o = Number(oldPrice);
  const p = Number(price);
  if (!Number.isFinite(o) || !Number.isFinite(p) || o <= 0 || p >= o) {
    return null;
  }
  return Math.round((1 - p / o) * 100);
};

/** Eticheta de stoc afișată pe card și pe pagina de produs. */
export const stockLabel = (stock) => {
  if (typeof stock !== "number" || !Number.isFinite(stock)) return null;
  if (stock <= 0) return { tone: "out", text: "Stoc epuizat" };
  if (stock <= 5) return { tone: "low", text: `Ultimele ${stock} bucăți` };
  if (stock <= 20) return { tone: "low", text: "Stoc limitat" };
  return { tone: "in", text: "În stoc" };
};

/** Transformă `specificatii` (JSONB) într-o listă [{ label, value }]. */
export const specEntries = (specs) => {
  if (!specs || typeof specs !== "object" || Array.isArray(specs)) return [];
  return Object.entries(specs)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([label, value]) => ({ label, value: String(value) }));
};
