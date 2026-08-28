import supabase from "./supabaseClient";

export const FREE_SHIPPING_THRESHOLD = 500;
export const SHIPPING_COST = 25;

/** Costul de livrare pentru un subtotal dat (oglindește logica din place_order). */
export const shippingFor = (subtotal) =>
  Number(subtotal) >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

/**
 * Plasează comanda.
 *
 * Trece prin `/api/comanda`, nu direct prin RPC, ca serverul să poată trimite
 * emailul de confirmare imediat după ce comanda a fost scrisă. Comanda în sine
 * se creează tot în funcția Postgres `place_order()`, deci prețurile se citesc
 * din baza de date, iar stocul se verifică și se scade atomic.
 */
export async function placeOrder(customer, items) {
  // Tokenul sesiunii, ca `auth.uid()` din place_order() să lege comanda de
  // contul clientului. Fără el, comanda nu ar apărea în „Comenzile mele".
  const {
    data: { session },
  } = await supabase.auth.getSession();

  try {
    const response = await fetch("/api/comanda", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : {}),
      },
      body: JSON.stringify({
        customer,
        items: items.map((item) => ({
          id: String(item.id),
          quantity: item.quantity,
          name: item.name,
          price: item.price,
        })),
      }),
    });

    const raw = await response.text();
    let data = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      data = null;
    }

    if (!response.ok || !data) {
      // Un raspuns care nu e JSON inseamna ca ruta nu e servita de o functie.
      // Sub `npm run dev`, Vite intoarce codul sursa al fisierului, cu HTTP 200.
      if (data === null) {
        return {
          data: null,
          error:
            'Funcțiile din api/ nu rulează. Serverul Vite (npm run dev) nu le execută — pornește proiectul cu "vercel dev" sau testează pe deployment.',
        };
      }
      return {
        data: null,
        error: data?.error || "Nu am putut plasa comanda. Încearcă din nou.",
      };
    }

    return { data, error: null };
  } catch {
    return {
      data: null,
      error: "Nu am putut contacta serverul. Verifică-ți conexiunea.",
    };
  }
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
