import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Seo from "../components/Seo";
import Icon from "../components/Icon";
import supabase from "../services/supabaseClient";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-slate-300 focus:border-volt focus:outline-none focus:ring-2 focus:ring-volt/20";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState("idle");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

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
      setMessage(
        error.message === "Invalid login credentials"
          ? "Email sau parolă greșită."
          : error.message,
      );
      return;
    }

    setState("success");
    navigate("/");
  };

  const isSubmitting = state === "submitting";

  return (
    <Layout>
      <Seo title="Autentificare" noindex />
      <div className="mx-auto max-w-md py-12">
        <header className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-ink text-white">
            <Icon name="user" className="h-5 w-5" />
          </span>
          <h1 className="mt-5 font-display text-3xl font-bold text-ink">
            Bine ai revenit
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Autentifică-te ca să-ți vezi comenzile și favoritele.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft"
        >
          <div className="grid gap-4">
            <label className="grid gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="adresa@email.com"
                autoComplete="email"
                className={inputClass}
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                Parolă
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Parola ta"
                autoComplete="current-password"
                className={inputClass}
              />
            </label>

            {message && (
              <div
                className={`rounded-xl border px-4 py-3 text-sm ${
                  state === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-rose-200 bg-rose-50 text-rose-800"
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 w-full rounded-xl bg-ink py-3.5 text-sm font-semibold text-white transition hover:bg-volt disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Se autentifică…" : "Autentificare"}
            </button>
          </div>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Nu ai cont?{" "}
          <Link to="/register" className="font-semibold text-volt hover:underline">
            Creează unul aici
          </Link>
        </p>
      </div>
    </Layout>
  );
};

export default Login;
