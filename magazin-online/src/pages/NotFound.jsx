import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden font-sans">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, #f4e8e1 0%, #f7f5f2 52%, #eef2f5 100%)",
        }}
      />
      <div className="absolute left-37.5 top-25 h-125 w-125 rounded-full bg-[#f0d8cb] opacity-25 blur-[120px]" />
      <div className="absolute right-37.5 top-25 h-125 w-125 rounded-full bg-[#dfe7ee] opacity-25 blur-[120px]" />

      <div className="relative z-10">
        <Navbar />

        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <p className="font-display text-6xl text-ink">404</p>
          <h1 className="mt-4 font-display text-2xl text-ink">
            Pagina nu a fost găsită
          </h1>
          <p className="mt-2 text-sm text-ink/55">
            Linkul accesat nu există sau a fost mutat.
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-6 rounded-full bg-ink px-6 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
          >
            Înapoi la pagina principală
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
