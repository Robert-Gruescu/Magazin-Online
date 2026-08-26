import supabase from "./supabaseClient";

export const FREE_SHIPPING_THRESHOLD = 500;
export const SHIPPING_COST = 25;

/** Costul de livrare pentru un subtotal dat (oglindește logica din place_order). */
export const shippingFor = (subtotal) =>
  Number(subtotal) >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

/**
 * Plasează comanda prin funcția Postgres `place_order`, care validează stocul,
 * recalculează prețurile pe server și scade stocul într-o singură tranzacție.
 */
export async function placeOrder(customer, items) {
  const payloadItems = items.map((item) => ({
    product_id: String(item.id),
    quantity: item.quantity,
  }));

  const { data, error } = await supabase.rpc("place_order", {
    p_customer: customer,
    p_items: payloadItems,
  });

  if (error) {
    // Funcția lipsește => scriptul sql/002_comenzi.sql nu a fost rulat.
    if (error.code === "PGRST202" || /place_order/i.test(error.message || "")) {
      return {
        data: null,
        error:
          "Comenzile nu sunt încă activate în baza de date. Rulează scriptul sql/002_comenzi.sql în Supabase.",
      };
    }
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/**
 * Comenzile utilizatorului autentificat, cu produsele aferente.
 * RLS filtrează deja după `user_id`, deci nu mai adăugăm condiția aici.
 * În `order_items`, `price` este prețul unitar; valoarea liniei se calculează.
 */
export async function fetchMyOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, subtotal, shipping_cost, total, created_at, order_items(id, name, quantity, price, products(name))",
    )
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: data || [], error: null };
}

/** Numele afișat pentru o linie de comandă (snapshot, cu fallback pe produs). */
export const itemLabel = (item) =>
  item.name || item.products?.name || "Produs indisponibil";

/** Valoarea unei linii de comandă. */
export const itemTotal = (item) => Number(item.price) * Number(item.quantity);
