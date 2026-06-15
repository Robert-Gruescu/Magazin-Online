import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import supabase from "../services/supabaseClient";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState("idle");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!supabase) {
      setState("error");
      setMessage("Supabase nu este configurat. Verifică .env.local.");
      return;
    }

    if (!email.trim() || !password) {
      setState("error");
      setMessage("Completează emailul și parola.");
      return;
    }

    setState("submitting");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setState("error");
      setMessage(error.message);
      return;
    }

    setState("success");
    setMessage("Autentificare reușită!");
    navigate("/");
  };

  const isSubmitting = state === "submitting";

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

        <div className="mx-auto max-w-md px-6 py-16">
          <header className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/40">
              Cont client
            </p>
            <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
              Autentificare
            </h1>
          </header>

          <form
            onSubmit={handleSubmit}
            className="mt-8 rounded-3xl border border-white/60 bg-white/85 p-6 shadow-soft backdrop-blur"
          >
            <div className="grid gap-4">
              <label className="grid gap-2">
                <span className="text-xs uppercase tracking-[0.2em] text-ink/50">
                  Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="adresa@email.com"
                  className="rounded-2xl border border-ink/10 bg-white/90 px-4 py-3 text-sm"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs uppercase tracking-[0.2em] text-ink/50">
                  Parolă
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Parola ta"
                  className="rounded-2xl border border-ink/10 bg-white/90 px-4 py-3 text-sm"
                />
              </label>

              {message ? (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm ${
                    state === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-rose-200 bg-rose-50 text-rose-800"
                  }`}
                >
                  {message}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full rounded-full bg-ink py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Se autentifică..." : "Autentificare"}
              </button>
            </div>
          </form>

          <p className="mt-4 text-center text-xs text-ink/55">
            Nu ai cont?{" "}
            <Link to="/register" className="font-semibold text-ink underline">
              Creează unul aici
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
