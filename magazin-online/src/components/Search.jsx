import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Icon from "./Icon";

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const urlQuery = new URLSearchParams(location.search).get("q") || "";
  const [query, setQuery] = useState(urlQuery);

  // Când se schimbă ?q= din URL (navigare, back/forward), resincronizăm inputul.
  const [lastUrlQuery, setLastUrlQuery] = useState(urlQuery);
  if (lastUrlQuery !== urlQuery) {
    setLastUrlQuery(urlQuery);
    setQuery(urlQuery);
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = query.trim();
    // Căutarea duce mereu în catalog, nu pe landing page.
    const params = new URLSearchParams();
    if (trimmed) params.set("q", trimmed);

    navigate({
      pathname: "/produse",
      search: params.toString() ? `?${params.toString()}` : "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Icon
        name="search"
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
      />
      <input
        type="search"
        placeholder="Caută laptop, telefon, placă video…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-24 text-sm text-ink placeholder:text-slate-400 focus:border-volt focus:bg-white focus:outline-none focus:ring-2 focus:ring-volt/20"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-ink px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-volt"
      >
        Caută
      </button>
    </form>
  );
};

export default Search;
