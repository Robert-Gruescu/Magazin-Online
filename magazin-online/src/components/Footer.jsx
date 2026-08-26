import { Link } from "react-router-dom";
import Icon from "./Icon";
import { CATEGORIES, SITE } from "../config/site";

const infoLinks = [
  { to: "/suport", label: "Suport clienți" },
  { to: "/produse", label: "Toate produsele" },
  { to: "/reduceri", label: "Reducerile săptămânii" },
  { to: "/favorite", label: "Favoritele mele" },
  { to: "/cart", label: "Coșul meu" },
];

const Footer = () => (
  <footer className="mt-24 border-t border-white/10 bg-ink text-white/70">
    <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
      {/* Brand */}
      <div>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-volt text-white">
            <Icon name="bolt" className="h-4 w-4" filled />
          </span>
          <span className="font-display text-xl font-semibold text-white">
            {SITE.name}
          </span>
        </div>
        <p className="mt-4 text-sm leading-relaxed">{SITE.description}</p>
      </div>

      {/* Categorii */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
          Categorii
        </h3>
        <ul className="mt-4 space-y-2 text-sm">
          {CATEGORIES.map((cat) => (
            <li key={cat.slug}>
              <Link
                to={`/categorie/${cat.slug}`}
                className="transition hover:text-white"
              >
                {cat.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Linkuri utile */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
          Magazin
        </h3>
        <ul className="mt-4 space-y-2 text-sm">
          {infoLinks.map((link) => (
            <li key={link.to}>
              <Link to={link.to} className="transition hover:text-white">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Contact */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
          Contact
        </h3>
        <ul className="mt-4 space-y-3 text-sm">
          <li className="flex items-start gap-2.5">
            <Icon name="mail" className="mt-0.5 h-4 w-4 shrink-0 text-volt" />
            <a href={`mailto:${SITE.email}`} className="hover:text-white">
              {SITE.email}
            </a>
          </li>
          <li className="flex items-start gap-2.5">
            <Icon name="phone" className="mt-0.5 h-4 w-4 shrink-0 text-volt" />
            <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="hover:text-white">
              {SITE.phone}
            </a>
          </li>
          <li className="flex items-start gap-2.5">
            <Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0 text-volt" />
            <span>{SITE.address}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <Icon name="clock" className="mt-0.5 h-4 w-4 shrink-0 text-volt" />
            <span>{SITE.schedule}</span>
          </li>
        </ul>
      </div>
    </div>

    <div className="border-t border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-white/40 sm:flex-row">
        <span>
          © {new Date().getFullYear()} {SITE.name}. Toate drepturile rezervate.
        </span>
        <span>Prețurile includ TVA. Produse originale, cu factură.</span>
      </div>
    </div>
  </footer>
);

export default Footer;
