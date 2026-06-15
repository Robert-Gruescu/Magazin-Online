import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQuery(params.get("q") || "");
  }, [location.search]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = query.trim();
    const params = new URLSearchParams(location.search);

    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }

    navigate({
      pathname: "/",
      search: params.toString() ? `?${params.toString()}` : "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl">
      <input
        type="search"
        placeholder="Incepe o noua cautare"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="w-full rounded-full border border-ink/10 bg-white px-4 py-2 pr-12 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-ink/30"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-ink/60 hover:bg-ink/5 hover:text-ink"
        aria-label="Caută"
      >
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
      </button>
    </form>
  );
};

export default Search;
