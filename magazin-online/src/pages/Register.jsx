import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Icon from "../components/Icon";
import supabase from "../services/supabaseClient";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-slate-300 focus:border-volt focus:outline-none focus:ring-2 focus:ring-volt/20";

const Register = () => {
  const [formValues, setFormValues] = useState(initialForm);
  const [state, setState] = useState("idle");
  const [message, setMessage] = useState("");

  const handleChange = (field) => (e) => {
    setFormValues((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

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
    setFormValues(initialForm);
  };

  const isSubmitting = state === "submitting";

  return (
    <Layout>
      <div className="mx-auto max-w-lg py-12">
        <header className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-ink text-white">
            <Icon name="bolt" className="h-5 w-5" filled />
          </span>
          <h1 className="mt-5 font-display text-3xl font-bold text-ink">
            Creează-ți cont
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Îți urmărești comenzile, salvezi favorite și primești ofertele
            înaintea tuturor.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                Prenume
              </span>
              <input
                type="text"
                value={formValues.firstName}
                onChange={handleChange("firstName")}
                placeholder="Andrei"
                className={inputClass}
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                Nume
              </span>
              <input
                type="text"
                value={formValues.lastName}
                onChange={handleChange("lastName")}
                placeholder="Popescu"
                className={inputClass}
              />
            </label>

            <label className="grid gap-1.5 sm:col-span-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                Email
              </span>
              <input
                type="email"
                value={formValues.email}
                onChange={handleChange("email")}
                placeholder="adresa@email.com"
                autoComplete="email"
                className={inputClass}
              />
            </label>

            <label className="grid gap-1.5 sm:col-span-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                Telefon (opțional)
              </span>
              <input
                type="tel"
                value={formValues.phone}
                onChange={handleChange("phone")}
                placeholder="07xx xxx xxx"
                className={inputClass}
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                Parolă
              </span>
              <input
                type="password"
                value={formValues.password}
                onChange={handleChange("password")}
                placeholder="Minim 8 caractere"
                autoComplete="new-password"
                className={inputClass}
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                Confirmă parola
              </span>
              <input
                type="password"
                value={formValues.confirmPassword}
                onChange={handleChange("confirmPassword")}
                placeholder="Repetă parola"
                autoComplete="new-password"
                className={inputClass}
              />
            </label>

            {message && (
              <div
                className={`sm:col-span-2 rounded-xl border px-4 py-3 text-sm ${
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
              className="sm:col-span-2 w-full rounded-xl bg-ink py-3.5 text-sm font-semibold text-white transition hover:bg-volt disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Se creează contul…" : "Creează cont"}
            </button>
          </div>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Ai deja cont?{" "}
          <Link to="/login" className="font-semibold text-volt hover:underline">
            Autentifică-te
          </Link>
        </p>
      </div>
    </Layout>
  );
};

export default Register;
