// api/reduceri.js — Vercel Serverless Function
//
// Expune reducerile săptămânale (tabelul `weekly_deals` din Supabase) ca JSON,
// ca aplicația mobilă (sau orice client) să le citească DE PE SITE, fără a
// accesa direct baza de date. Vercel detectează automat folderul `api/` și
// publică această funcție la:  https://<domeniul-tau>/api/reduceri
//
// Oglindește logica din src/pages/WeeklyDeals.jsx:
//   - selectează aceleași câmpuri din `weekly_deals`,
//   - păstrează doar reducerile încă valabile (după `valid_until`),
//   - calculează `discount_percent` din `old_price` și `price`.

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const stillValid = (validUntil) => {
  if (!validUntil) return true;
  const until = new Date(validUntil);
  if (Number.isNaN(until.getTime())) return true;
  until.setHours(23, 59, 59, 999); // valabil până la sfârșitul zilei
  return until.getTime() >= Date.now();
};

const discountPercent = (oldPrice, price) => {
  const o = Number(oldPrice);
  const p = Number(price);
  if (!Number.isFinite(o) || !Number.isFinite(p) || o <= 0 || p >= o) {
    return null;
  }
  return Math.round((1 - p / o) * 100);
};

export default async function handler(req, res) {
  // CORS (util dacă e accesat și din browser; pe mobil nu contează).
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res
      .status(500)
      .json({ error: "Lipsesc variabilele de mediu Supabase pe server." });
  }

  try {
    const url =
      `${SUPABASE_URL}/rest/v1/weekly_deals` +
      `?select=id,name,description,old_price,price,image_url,valid_until` +
      `&order=created_at.desc`;

    const response = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });

    if (!response.ok) {
      return res
        .status(502)
        .json({ error: `Eroare Supabase: ${response.status}` });
    }

    const rows = await response.json();

    const deals = (Array.isArray(rows) ? rows : [])
      .filter((d) => stillValid(d.valid_until))
      .map((d) => {
        const o = Number(d.old_price);
        const p = Number(d.price);
        return {
          id: d.id,
          name: d.name,
          description: d.description ?? null,
          price: Number.isFinite(p) ? p : null,
          old_price: Number.isFinite(o) ? o : null,
          discount_percent: discountPercent(d.old_price, d.price),
          image_url: d.image_url ?? null,
          valid_until: d.valid_until ?? null,
        };
      });

    // Cache CDN scurt (5 min) ca să nu lovim Supabase la fiecare cerere.
    res.setHeader(
      "Cache-Control",
      "s-maxage=300, stale-while-revalidate=600"
    );
    return res.status(200).json(deals);
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
