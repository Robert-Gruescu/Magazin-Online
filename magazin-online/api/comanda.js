// api/comanda.js — plasarea comenzii.
//
// Checkout-ul nu mai apelează direct funcția PostgreSQL, ci trece pe aici, ca
// să putem trimite emailul de confirmare imediat după ce comanda a fost scrisă.
//
// Comanda în sine se creează tot în `place_order()`, deci toate garanțiile
// rămân intacte: prețurile se citesc din baza de date, stocul se verifică și se
// scade atomic, iar clientul nu poate influența totalurile.

import { createClient } from "@supabase/supabase-js";
import { SITE } from "../src/config/site.js";
import {
  emailComandaNoua,
  emailConfirmareComanda,
  emailConfigurat,
  trimiteEmail,
} from "./_email.js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const MAX_ARTICOLE = 50;

/** Curăță datele clientului. Validarea de fond o face oricum place_order(). */
function curataClient(brut) {
  if (!brut || typeof brut !== "object") return null;

  const text = (v, max = 200) =>
    typeof v === "string" ? v.trim().slice(0, max) : "";

  const client = {
    full_name: text(brut.full_name, 120),
    phone: text(brut.phone, 40),
    email: text(brut.email, 200).toLowerCase(),
    address: text(brut.address, 300),
    city: text(brut.city, 120),
    county: text(brut.county, 120),
    notes: text(brut.notes, 500),
    payment_method: brut.payment_method === "transfer" ? "transfer" : "ramburs",
  };

  if (!client.full_name || !client.phone || !client.address || !client.city) {
    return null;
  }
  if (!/^\S+@\S+\.\S+$/.test(client.email)) return null;

  return client;
}

/** Din coșul primit păstrăm doar id-ul și cantitatea. Prețurile vin din DB. */
function curataArticole(brut) {
  if (!Array.isArray(brut) || brut.length === 0) return null;

  const articole = brut
    .map((i) => ({
      product_id: String(i?.id ?? i?.product_id ?? "").slice(0, 40),
      quantity: Math.max(1, Math.min(99, Number(i?.quantity) || 1)),
    }))
    .filter((i) => i.product_id)
    .slice(0, MAX_ARTICOLE);

  return articole.length > 0 ? articole : null;
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Doar POST." });
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res
      .status(500)
      .json({ error: "Lipsesc variabilele de mediu Supabase pe server." });
  }

  const client = curataClient(req.body?.customer);
  const articole = curataArticole(req.body?.items);

  if (!client) return res.status(400).json({ error: "Datele de livrare sunt incomplete." });
  if (!articole) return res.status(400).json({ error: "Coșul este gol." });

  // Dacă utilizatorul e autentificat, îi transmitem tokenul mai departe, ca
  // `auth.uid()` din place_order() să lege comanda de contul lui. Fără asta,
  // comanda ar apărea corect în admin, dar nu și în „Comenzile mele".
  const autorizare = req.headers.authorization;
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    global: autorizare ? { headers: { Authorization: autorizare } } : {},
  });

  const { data, error } = await supabase.rpc("place_order", {
    p_customer: client,
    p_items: articole,
  });

  if (error) {
    if (error.code === "PGRST202" || /place_order/i.test(error.message || "")) {
      return res.status(500).json({
        error:
          "Comenzile nu sunt încă activate în baza de date. Rulează scriptul sql/002_comenzi.sql în Supabase.",
      });
    }
    // Mesajele ridicate de funcție (stoc insuficient etc.) sunt scrise pentru
    // client, deci le transmitem ca atare.
    return res.status(400).json({ error: error.message });
  }

  // Comanda există deja. De aici încolo, orice eșec este raportat, dar nu
  // anulează comanda — un email nelivrat nu trebuie să piardă o vânzare.
  let emailTrimis = false;

  if (emailConfigurat()) {
    const produse = (req.body?.items || []).map((i) => ({
      name: String(i?.name ?? "Produs").slice(0, 200),
      quantity: Math.max(1, Number(i?.quantity) || 1),
      price: Number(i?.price) || 0,
    }));

    const catreClient = emailConfirmareComanda({ comanda: data, client, produse });
    const rezultat = await trimiteEmail({
      to: client.email,
      subject: catreClient.subject,
      html: catreClient.html,
      replyTo: SITE.email,
    });
    emailTrimis = rezultat.trimis;

    if (!rezultat.trimis) {
      console.error(`Comanda ${data.order_number}: emailul catre client nu a plecat -`, rezultat.motiv);
    }

    // Notificarea internă e best-effort și nu influențează răspunsul.
    // EMAIL_SHOP permite trimiterea către o adresă reală în timpul testelor,
    // fără să schimbăm adresa publică de contact din config/site.js.
    const catreMagazin = emailComandaNoua({ comanda: data, client, produse });
    trimiteEmail({
      to: process.env.EMAIL_SHOP || SITE.email,
      subject: catreMagazin.subject,
      html: catreMagazin.html,
      replyTo: client.email,
    }).catch(() => {});
  }

  return res.status(200).json({ ...data, email_trimis: emailTrimis });
}
