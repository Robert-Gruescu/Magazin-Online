import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../services/supabaseClient";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

function Register() {
  const [formValues, setFormValues] = useState(initialForm);
  const [state, setState] = useState("idle");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (field) => (e) => {
    setFormValues((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleReset = () => {
    setFormValues(initialForm);
    setState("idle");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!supabase) {
      setState("error");
      setMessage("Supabase nu este configurat. Verifică .env.local.");
      return;
    }

    if (!formValues.firstName.trim() || !formValues.lastName.trim()) {
      setState("error");
      setMessage("Numele și prenumele sunt obligatorii.");
      return;
    }

    if (!formValues.email.trim()) {
      setState("error");
      setMessage("Emailul este obligatoriu.");
      return;
    }

    if (formValues.password.length < 8) {
      setState("error");
      setMessage("Parola trebuie să aibă minim 8 caractere.");
      return;
    }

    if (formValues.password !== formValues.confirmPassword) {
      setState("error");
      setMessage("Parolele nu coincid.");
      return;
    }

    setState("submitting");

    const { error } = await supabase.auth.signUp({
      email: formValues.email.trim(),
      password: formValues.password,
      options: {
        data: {
          full_name: `${formValues.firstName.trim()} ${formValues.lastName.trim()}`,
          phone: formValues.phone.trim() || null,
          source: "client_app",
        },
      },
    });

    if (error) {
      setState("error");
      setMessage(error.message);
      return;
    }

    setState("success");
    setMessage("Cont creat! Verifică emailul pentru confirmare.");
  };

  const isSubmitting = state === "submitting";

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">
              Cont nou
            </p>
            <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
              Creează cont
            </h1>
            <p className="mt-2 max-w-xl text-sm text-ink/60">
              Înregistrează-te pentru a plasa comenzi și a urmări statusul lor.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/70"
            >
              Am deja cont
            </Link>
            <span className="rounded-full border border-ink/10 bg-white/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-ink/70">
              Live
            </span>
          </div>
        </header>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-white/60 bg-white/85 p-6 shadow-soft backdrop-blur"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-ink">Date cont</h2>
              <span className="text-xs uppercase tracking-[0.25em] text-ink/50">
                Formular
              </span>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-ink/50">
                    Prenume
                  </span>
                  <input
                    type="text"
                    value={formValues.firstName}
                    onChange={handleChange("firstName")}
                    placeholder="Ex: Andrei"
                    className="rounded-2xl border border-ink/10 bg-white/90 px-4 py-3 text-sm"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-ink/50">
                    Nume
                  </span>
                  <input
                    type="text"
                    value={formValues.lastName}
                    onChange={handleChange("lastName")}
                    placeholder="Ex: Popescu"
                    className="rounded-2xl border border-ink/10 bg-white/90 px-4 py-3 text-sm"
                  />
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-xs uppercase tracking-[0.2em] text-ink/50">
                  Email
                </span>
                <input
                  type="email"
                  value={formValues.email}
                  onChange={handleChange("email")}
                  placeholder="adresa@email.com"
                  className="rounded-2xl border border-ink/10 bg-white/90 px-4 py-3 text-sm"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs uppercase tracking-[0.2em] text-ink/50">
                  Telefon (opțional)
                </span>
                <input
                  type="tel"
                  value={formValues.phone}
                  onChange={handleChange("phone")}
                  placeholder="07xx xxx xxx"
                  className="rounded-2xl border border-ink/10 bg-white/90 px-4 py-3 text-sm"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-ink/50">
                    Parolă
                  </span>
                  <input
                    type="password"
                    value={formValues.password}
                    onChange={handleChange("password")}
                    placeholder="Minim 8 caractere"
                    className="rounded-2xl border border-ink/10 bg-white/90 px-4 py-3 text-sm"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-ink/50">
                    Confirmă parola
                  </span>
                  <input
                    type="password"
                    value={formValues.confirmPassword}
                    onChange={handleChange("confirmPassword")}
                    placeholder="Repetă parola"
                    className="rounded-2xl border border-ink/10 bg-white/90 px-4 py-3 text-sm"
                  />
                </label>
              </div>

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
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-ink px-6 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Se creează..." : "Creează cont"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-full border border-ink/10 bg-white/70 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/70"
              >
                Resetează
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-dashed border-ink/20 bg-white/60 p-4">
              <p className="text-xs text-ink/55">
                Ai deja cont?{" "}
                <Link to="/login" className="font-semibold text-ink underline">
                  Autentifică-te aici
                </Link>
              </p>
            </div>
          </form>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-soft backdrop-blur">
              <h2 className="font-display text-2xl text-ink">De ce un cont?</h2>
              <ul className="mt-4 space-y-3 text-sm text-ink/70">
                <li>Urmărești statusul comenzilor în timp real.</li>
                <li>Adresa se completează automat la checkout.</li>
                <li>Acces la istoricul tuturor comenzilor tale.</li>
                <li>Notificări când comanda este expediată.</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-white/60 bg-white/75 p-6 shadow-soft backdrop-blur">
              <h2 className="font-display text-2xl text-ink">Tip cont</h2>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink/65">
                    Înregistrat din aplicație
                  </span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                    Client
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink/65">
                    Creat din Supabase
                  </span>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                    Admin
                  </span>
                </div>
              </div>
              <p className="mt-4 text-xs text-ink/40">
                Rolul se atribuie automat la creare.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Register;
