import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { loadEnv } from "vite";

/**
 * Rulează funcțiile din `api/` în serverul de dezvoltare Vite.
 *
 * Vite este doar un bundler de frontend: nu are runtime de server, deci în mod
 * normal o cerere către /api/ceva primește fișierul sursă ca text simplu.
 * Pentru a testa comanda sau chatul AI era nevoie de `vercel dev`.
 *
 * Pluginul acesta traduce cererile HTTP ale lui Vite în forma pe care o
 * așteaptă o funcție Vercel (`req.body` deja parsat, `res.status().json()`) și
 * apelează handler-ul. Astfel `npm run dev` acoperă tot site-ul, iar cheile
 * rămân pe server — nu ajung niciodată în bundle-ul din browser.
 *
 * Rulează DOAR în dezvoltare. În producție, Vercel execută aceleași fișiere ca
 * funcții serverless, iar pluginul nu are niciun efect.
 */
export default function apiDevServer() {
  // Rute care nu se numesc /api/... dar sunt tot funcții (vezi vercel.json).
  const ALIASURI = {
    "/sitemap.xml": "sitemap",
    "/robots.txt": "robots",
  };

  return {
    name: "voltmag:api-dev-server",
    apply: "serve",

    configureServer(server) {
      const radacina = server.config.root;
      const folderApi = path.join(radacina, "api");

      // Variabilele fără prefix (GEMINI_API_KEY, RESEND_API_KEY, ...) nu ajung
      // în `import.meta.env` din browser, dar funcțiile de pe server le cer din
      // `process.env`. Le încărcăm aici, exact ca pe Vercel.
      const env = loadEnv(server.config.mode, radacina, "");
      for (const [cheie, valoare] of Object.entries(env)) {
        if (process.env[cheie] === undefined) process.env[cheie] = valoare;
      }

      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, "http://localhost");
        const cale = url.pathname;

        let numeFunctie = ALIASURI[cale];
        if (!numeFunctie && cale.startsWith("/api/")) {
          numeFunctie = cale.slice("/api/".length).replace(/\/+$/, "");
        }

        // Fișierele care încep cu "_" sunt module comune, nu rute — la fel ca pe Vercel.
        if (!numeFunctie || numeFunctie.startsWith("_") || numeFunctie.includes("..")) {
          return next();
        }

        const fisier = path.join(folderApi, `${numeFunctie}.js`);
        if (!fs.existsSync(fisier)) return next();

        try {
          // Sufixul de timp forțează reîncărcarea la fiecare cerere, ca
          // modificările din api/ să se vadă fără repornirea serverului.
          const modul = await import(
            `${pathToFileURL(fisier).href}?t=${Date.now()}`
          );
          const handler = modul.default;

          if (typeof handler !== "function") {
            res.statusCode = 500;
            res.end(`api/${numeFunctie}.js nu exportă o funcție implicită.`);
            return;
          }

          await handler(
            await construiesteReq(req, url),
            construiesteRes(res),
          );
        } catch (error) {
          console.error(`[api] ${cale} a esuat:`, error);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ error: String(error?.message || error) }));
        }
      });

      server.config.logger.info(
        "  \x1b[32m➜\x1b[0m  \x1b[1mapi\x1b[0m:     functiile din api/ ruleaza local",
      );
    },
  };
}

/** Cererea Node → forma așteptată de o funcție Vercel. */
async function construiesteReq(req, url) {
  let body = undefined;

  if (req.method !== "GET" && req.method !== "HEAD") {
    const bucati = [];
    for await (const bucata of req) bucati.push(bucata);
    const brut = Buffer.concat(bucati).toString("utf8");

    if (brut) {
      try {
        body = JSON.parse(brut);
      } catch {
        body = brut; // lăsăm textul brut, ca handler-ul să decidă
      }
    }
  }

  return {
    method: req.method,
    url: req.url,
    headers: req.headers,
    query: Object.fromEntries(url.searchParams),
    body,
  };
}

/** Răspunsul Node → API-ul `res.status().json()` folosit de funcțiile Vercel. */
function construiesteRes(res) {
  const api = {
    status(cod) {
      res.statusCode = cod;
      return api;
    },
    setHeader(cheie, valoare) {
      res.setHeader(cheie, valoare);
      return api;
    },
    json(corp) {
      if (!res.getHeader("Content-Type")) {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
      }
      res.end(JSON.stringify(corp));
      return api;
    },
    send(corp) {
      res.end(typeof corp === "string" ? corp : String(corp));
      return api;
    },
    end(corp) {
      res.end(corp);
      return api;
    },
  };

  return api;
}
