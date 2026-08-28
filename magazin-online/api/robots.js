// api/robots.js — robots.txt, servit la /robots.txt printr-un rewrite.
// Dinamic, ca linia Sitemap să conțină domeniul real, fără să-l configurăm.

export default function handler(req, res) {
  const gazda = req.headers["x-forwarded-host"] || req.headers.host;
  const protocol = req.headers["x-forwarded-proto"] || "https";

  const continut = [
    "User-agent: *",
    "Allow: /",
    "",
    "# Pagini personale sau tranzacționale — nu au ce căuta în index",
    "Disallow: /cart",
    "Disallow: /checkout",
    "Disallow: /favorite",
    "Disallow: /comenzile-mele",
    "Disallow: /login",
    "Disallow: /register",
    "Disallow: /api/",
    "",
    `Sitemap: ${protocol}://${gazda}/sitemap.xml`,
    "",
  ].join("\n");

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=86400");
  res.status(200).send(continut);
}
