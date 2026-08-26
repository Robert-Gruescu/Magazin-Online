import supabase from "./supabaseClient";
import { slugify } from "../lib/format";

// Coloanele noi (electronice) există doar după ce a rulat sql/001_electronice.sql.
// Ca site-ul să nu pice pe o bază nemigrată, cerem întâi setul complet și, dacă
// Postgres se plânge de o coloană inexistentă, refacem cererea cu setul de bază.
const FULL_COLUMNS =
  "id, name, description, price, pret_vechi, image_url, category_id, brand, sku, garantie_luni, specificatii, rating, stock, active, created_at";

const BASE_COLUMNS =
  "id, name, description, price, image_url, category_id, stock, active";

let columnsInUse = FULL_COLUMNS;

const isMissingColumn = (error) =>
  error?.code === "42703" ||
  /column .* does not exist/i.test(error?.message || "");

/**
 * Rulează un query pe `products` cu setul complet de coloane și, la nevoie,
 * îl reia cu setul de bază. `build` primește query-ul deja proiectat.
 */
export async function queryProducts(build = (q) => q) {
  const run = async (columns) => {
    const query = build(supabase.from("products").select(columns, { count: "exact" }));
    return query;
  };

  let { data, error, count } = await run(columnsInUse);

  if (error && isMissingColumn(error) && columnsInUse !== BASE_COLUMNS) {
    columnsInUse = BASE_COLUMNS;
    ({ data, error, count } = await run(BASE_COLUMNS));
  }

  return { data: data || [], error, count: count ?? 0 };
}

/** Un singur produs după id, cu același mecanism de fallback. */
export async function fetchProductById(id) {
  const run = async (columns) =>
    supabase.from("products").select(columns).eq("id", id).single();

  let { data, error } = await run(columnsInUse);

  if (error && isMissingColumn(error) && columnsInUse !== BASE_COLUMNS) {
    columnsInUse = BASE_COLUMNS;
    ({ data, error } = await run(BASE_COLUMNS));
  }

  return { data, error };
}

/** Categoriile din DB, normalizate cu un `slug` calculat dacă lipsește. */
export async function fetchCategories() {
  const { data, error } = await supabase.from("categories").select("*");
  if (error) return { data: [], error };

  const rows = (data || []).map((row) => ({
    ...row,
    slug: row.slug || slugify(row.name),
  }));

  return { data: rows, error: null };
}

/** Lista de branduri distincte, pentru panoul de filtre. */
export async function fetchBrands() {
  const { data, error } = await queryProducts((q) => q.not("brand", "is", null));
  if (error) return [];
  return [...new Set((data || []).map((p) => p.brand).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, "ro"),
  );
}

/**
 * Galeria unui produs. Dacă tabelul `product_images` nu există încă
 * (sql/005_imagini.sql nu a rulat), pagina cade elegant pe `image_url`.
 */
export async function fetchProductImages(productId) {
  const { data, error } = await supabase
    .from("product_images")
    .select("id, url, alt, sort_order, is_primary")
    .eq("product_id", productId)
    .order("is_primary", { ascending: false })
    .order("sort_order", { ascending: true });

  if (error) return { data: [], error };
  return { data: data || [], error: null };
}
