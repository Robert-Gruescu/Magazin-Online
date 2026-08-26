// Configurația magazinului. Tot ce ține de identitate (nume, categorii, texte
// de prezentare, date de contact) stă aici, ca să nu fie împrăștiat prin JSX.

export const SITE = {
  name: "VoltMag",
  tagline: "Electronice pe bune",
  description:
    "Laptopuri, telefoane, componente PC și gaming — produse originale, garanție extinsă și livrare rapidă în toată țara.",
  email: "contact@voltmag.ro",
  phone: "0374 000 000",
  address: "Str. Energiei 12, Cluj-Napoca",
  schedule: "Luni – Vineri, 09:00 – 18:00",
};

// Categoriile magazinului. `slug` este folosit în URL (/categorie/:slug) și
// trebuie să corespundă cu slugify(name) al rândului din tabelul `categories`.
export const CATEGORIES = [
  {
    slug: "laptopuri",
    label: "Laptopuri",
    blurb: "Ultrabook-uri, laptopuri de gaming și stații mobile de lucru.",
    icon: "laptop",
  },
  {
    slug: "telefoane",
    label: "Telefoane",
    blurb: "Smartphone-uri noi și resigilate, cu garanție de la 12 luni.",
    icon: "phone",
  },
  {
    slug: "componente-pc",
    label: "Componente PC",
    blurb: "Plăci video, procesoare, memorii, SSD-uri și surse.",
    icon: "cpu",
  },
  {
    slug: "tv-audio",
    label: "TV & Audio",
    blurb: "Televizoare 4K, soundbar-uri, boxe și căști audiofile.",
    icon: "tv",
  },
  {
    slug: "gaming",
    label: "Gaming",
    blurb: "Console, scaune, volane și accesorii pentru jocuri.",
    icon: "gamepad",
  },
  {
    slug: "periferice",
    label: "Periferice",
    blurb: "Monitoare, tastaturi mecanice, mouse-uri și webcam-uri.",
    icon: "keyboard",
  },
  {
    slug: "smart-home",
    label: "Smart Home",
    blurb: "Becuri inteligente, camere, senzori și asistenți vocali.",
    icon: "home",
  },
];

// Argumentele de încredere afișate pe landing page și în footer.
export const TRUST_POINTS = [
  {
    icon: "shield",
    title: "Garanție până la 36 de luni",
    text: "Produse originale, cu factură și certificat de garanție.",
  },
  {
    icon: "truck",
    title: "Livrare în 24–48h",
    text: "Curier rapid în toată țara, gratuit peste 500 lei.",
  },
  {
    icon: "refresh",
    title: "Retur în 30 de zile",
    text: "Te răzgândești? Îți returnăm banii, fără întrebări.",
  },
  {
    icon: "wrench",
    title: "Service autorizat",
    text: "Diagnoză gratuită și reparații în laboratorul propriu.",
  },
];
