import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Icon from "../components/Icon";
import { CATEGORIES } from "../config/site";

const NotFound = () => (
  <Layout>
    <div className="mx-auto max-w-2xl py-24 text-center">
      <p className="font-display text-6xl font-bold text-slate-200">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-ink">
        Pagina nu a fost găsită
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Linkul accesat nu există sau a fost mutat. Încearcă una dintre
        categoriile de mai jos.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            to={`/categorie/${cat.slug}`}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:border-volt/40 hover:text-ink"
          >
            <Icon name={cat.icon} className="h-3.5 w-3.5 text-volt" />
            {cat.label}
          </Link>
        ))}
      </div>

      <Link
        to="/"
        className="mt-8 inline-block rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-volt"
      >
        Înapoi la pagina principală
      </Link>
    </div>
  </Layout>
);

export default NotFound;
