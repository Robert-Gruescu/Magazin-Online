// api/sitemap.js — sitemap.xml generat din catalogul real.
//
// Servit la /sitemap.xml printr-un rewrite din vercel.json. Se generează
// dinamic pentru că produsele se schimbă; un fișier static ar rămâne în urmă.

import { createClient } from "@supabase/supabase-js";
import { CATEGORIES } from "../src/config/site.js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const escape = (s) =>
  String(s).replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c],
  );

const url = (loc, { lastmod, changefreq, priority } = {}) =>
  [
    "  <url>",
    `    <loc>${escape(loc)}</loc>`,
    lastmod ? `    <lastmod>${lastmod.slice(0, 10)}</lastmod>` : null,
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
    priority ? `    <priority>${priority}</priority>` : null,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");

export default async function handler(req, res) {
  const gazda = req.headers["x-forwarded-host"] || req.headers.host;
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const baza = `${protocol}://${gazda}`;

  const intrari = [
    url(`${baza}/`, { changefreq: "daily", priority: "1.0" }),
    url(`${baza}/produse`, { changefreq: "daily", priority: "0.9" }),
    url(`${baza}/reduceri`, { changefreq: "weekly", priority: "0.8" }),
    url(`${baza}/suport`, { changefreq: "monthly", priority: "0.5" }),
    ...CATEGORIES.map((c) =>
      url(`${baza}/categorie/${c.slug}`, { changefreq: "weekly", priority: "0.8" }),
    ),
  ];

  // Produsele sunt opționale: dacă baza de date nu răspunde, livrăm măcar
  // paginile statice, în loc să întoarcem o eroare către Google.
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      const { data } = await supabase
        .from("products")
        .select("id, created_at")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(5000);

      for (const p of data || []) {
        intrari.push(
          url(`${baza}/produs/${p.id}`, {
            lastmod: p.created_at,
            changefreq: "weekly",
            priority: "0.7",
          }),
        );
      }
    } catch (error) {
      console.error("Sitemap: nu am putut citi produsele:", error);
    }
  }

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=3600");
  res.status(200).send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${intrari.join("\n")}\n</urlset>\n`,
  );
}
