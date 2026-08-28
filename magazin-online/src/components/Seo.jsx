import { SITE } from "../config/site";

/**
 * Metadatele paginii curente.
 *
 * React 19 ridică automat în <head> elementele <title>, <meta> și <link>
 * randate oriunde în arbore, deci nu avem nevoie de o bibliotecă externă.
 *
 * Fără asta, toate cele 76 de pagini de produs împart același titlu și aceeași
 * descriere, iar Google le tratează practic ca pe una singură.
 */
const Seo = ({ title, description, path, image, noindex = false, jsonLd }) => {
  const titluComplet = title ? `${title} — ${SITE.name}` : `${SITE.name} — ${SITE.tagline}`;
  const descriere = description || SITE.description;

  // Originea reală, ca să nu fie nevoie să configurăm domeniul nicăieri.
  const origine = typeof window !== "undefined" ? window.location.origin : "";
  const canonical = path && origine ? `${origine}${path}` : null;

  return (
    <>
      <title>{titluComplet}</title>
      <meta name="description" content={descriere} />
      {canonical && <link rel="canonical" href={canonical} />}
      {noindex && <meta name="robots" content="noindex, follow" />}

      <meta property="og:type" content={jsonLd?.["@type"] === "Product" ? "product" : "website"} />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:title" content={titluComplet} />
      <meta property="og:description" content={descriere} />
      {canonical && <meta property="og:url" content={canonical} />}
      {image && <meta property="og:image" content={image} />}

      <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={titluComplet} />
      <meta name="twitter:description" content={descriere} />

      {jsonLd && (
        <script
          type="application/ld+json"
          // Datele vin din baza noastră, nu din input de la utilizator.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </>
  );
};

export default Seo;
