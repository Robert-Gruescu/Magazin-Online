import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import Catalog from "./Catalog";
import { CATEGORIES } from "../config/site";
import { fetchCategories } from "../services/products";

/**
 * /categorie/:slug — rezolvă slug-ul într-un `category_id` real din Supabase,
 * apoi refolosește catalogul cu filtrul de categorie aplicat.
 */
const Category = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [state, setState] = useState("loading");

  // Descrierea din config, ca antetul să aibă conținut chiar dacă DB-ul nu are.
  const configEntry = CATEGORIES.find((c) => c.slug === slug);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setState("loading");
      const { data, error } = await fetchCategories();
      if (!isMounted) return;

      if (error) {
        setState("error");
        return;
      }

      const found = data.find((row) => row.slug === slug);
      if (!found) {
        setState("missing");
        setCategory(null);
        return;
      }

      setCategory(found);
      setState("ready");
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (state === "ready" && category) {
    return (
      <Catalog
        key={category.id}
        categoryId={category.id}
        title={configEntry?.label || category.name}
        subtitle={configEntry?.blurb}
        breadcrumb={
          <Link
            to="/produse"
            className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 transition hover:text-volt"
          >
            Catalog / {configEntry?.label || category.name}
          </Link>
        }
      />
    );
  }

  return (
    <Layout>
      <div className="py-24 text-center">
        {state === "loading" && (
          <p className="text-sm text-slate-400">Se încarcă categoria…</p>
        )}

        {state === "error" && (
          <div className="mx-auto max-w-md rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            Nu am putut încărca categoriile.
          </div>
        )}

        {state === "missing" && (
          <>
            <h1 className="font-display text-2xl font-bold text-ink">
              Categoria „{configEntry?.label || slug}” nu există încă
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-slate-500">
              Adaug-o în tabelul <code>categories</code> din Supabase (rulează
              scriptul <code>sql/001_electronice.sql</code>) și produsele vor
              apărea automat aici.
            </p>
            <Link
              to="/produse"
              className="mt-6 inline-block rounded-xl bg-ink px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-volt"
            >
              Vezi toate produsele
            </Link>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Category;
