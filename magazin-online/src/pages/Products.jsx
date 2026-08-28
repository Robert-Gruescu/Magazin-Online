import { Link } from "react-router-dom";
import Catalog from "./Catalog";

const Products = () => (
  <Catalog
    seoPath="/produse"
    title="Toate produsele"
    subtitle="livrare în 24–48h"
    breadcrumb={
      <Link
        to="/"
        className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 transition hover:text-volt"
      >
        Acasă / Catalog
      </Link>
    }
  />
);

export default Products;
