import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../supabaseClient";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useState("idle");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("=== SUBMIT APELAT ===");
    console.log("email value:", JSON.stringify(email));
    console.log("password value:", JSON.stringify(password));
    console.log("state:", state);

    if (state === "submitting") return; // previne dublu submit

    setMessage("");

    if (!isSupabaseConfigured || !supabase) {
      setState("error");
      setMessage("Supabase nu este configurat. Verifică .env.local.");
      return;
    }

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setState("error");
      setMessage("Completează emailul și parola.");
      return;
    }

    setState("submitting");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password: trimmedPassword,
    });

    if (error) {
      setState("error");
      setMessage("Email sau parolă incorecte.");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError) {
      await supabase.auth.signOut();
      setState("error");
      setMessage(`Eroare profil: ${profileError.message}`);
      return;
    }

    if (!profile || profile.role !== "admin") {
      await supabase.auth.signOut();
      setState("error");
      setMessage("Nu ai permisiuni de admin.");
      return;
    }

    navigate("/");
  };

  const isSubmitting = state === "submitting";

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-ink">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="#f5f2eb"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink/40">
            Panou administrare
          </p>
          <h1 className="mt-2 font-display text-3xl text-ink">
            Magazin Online
          </h1>
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-ink/5 px-3 py-1 text-xs text-ink/50">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Acces restricționat · Doar admini
          </span>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/60 bg-white/88 p-8 shadow-soft backdrop-blur">
          <div className="mb-5">
            <h2 className="font-display text-2xl text-ink">Autentificare</h2>
            <p className="mt-1 text-sm text-ink/50">
              Introdu datele contului tău de admin.
            </p>
          </div>

          <div className="mb-5 h-px bg-ink/7" />

          <form onSubmit={handleSubmit} className="grid gap-4">
            {message ? (
              <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
                <svg
                  className="h-4 w-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {message}
              </div>
            ) : null}

            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.2em] text-ink/45">
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@magazin.ro"
                autoComplete="email"
                className="rounded-2xl border border-ink/10 bg-white/90 px-4 py-3 text-sm outline-none focus:border-ink/35"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.2em] text-ink/45">
                Parolă
              </span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Parola ta"
                  autoComplete="current-password"
                  className="w-full rounded-2xl border border-ink/10 bg-white/90 px-4 py-3 pr-12 text-sm outline-none focus:border-ink/35"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/35 hover:text-ink/60"
                >
                  {showPassword ? (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-full bg-ink py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55"
            >
              {isSubmitting ? "Se verifică..." : "Intră în panou"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-ink/35">
            Nu ai acces? Contactează administratorul principal.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
