import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Seo from "../components/Seo";
import Icon from "../components/Icon";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../hooks/useChat";
import { SITE } from "../config/site";

const GREETING = {
  content:
    "Bună! Sunt agentul de suport VoltMag. Te pot ajuta cu statusul unei comenzi, retur, garanție sau livrare. Spune-mi ce s-a întâmplat.",
};

const TOPICS = [
  {
    icon: "truck",
    label: "Unde este comanda mea?",
    prompt: "Vreau să aflu unde este comanda mea.",
  },
  {
    icon: "refresh",
    label: "Vreau să returnez un produs",
    prompt: "Vreau să returnez un produs. Cum procedez?",
  },
  {
    icon: "shield",
    label: "Întrebare despre garanție",
    prompt: "Am o întrebare despre garanția unui produs.",
  },
  {
    icon: "close",
    label: "Anulare sau modificare comandă",
    prompt: "Vreau să anulez sau să modific o comandă pe care am plasat-o.",
  },
];

// Răspunsuri afișate instant, fără a consuma un apel către model.
const FAQ = [
  {
    q: "Cât durează livrarea?",
    a: "Livrăm în 24-48 de ore în toată țara, prin curier. Transportul este gratuit pentru comenzile de peste 500 lei, iar sub acest prag costă 25 lei. Curierul te sună înainte să ajungă.",
  },
  {
    q: "În cât timp pot returna un produs?",
    a: "Ai 30 de zile de la primire, fără să explici motivul. Produsul trebuie să fie complet, cu accesoriile și ambalajul original. Banii se întorc în maximum 14 zile de la primirea coletului înapoi.",
  },
  {
    q: "Ce garanție au produsele?",
    a: "Minimum 24 de luni, iar unele componente ajung la 36 sau chiar 72 de luni. Perioada exactă este scrisă pe pagina fiecărui produs. Diagnoza în laboratorul nostru este gratuită.",
  },
  {
    q: "Cum pot plăti?",
    a: "Ramburs la curier, în numerar sau cu cardul, ori prin transfer bancar pe baza unei facturi proforme. Plata online cu cardul direct pe site nu este încă disponibilă.",
  },
  {
    q: "Unde găsesc numărul comenzii?",
    a: "Este în emailul de confirmare și are forma VM-2026-01000. Dacă ai cont, îl vezi și în secțiunea Comenzile mele.",
  },
  {
    q: "Pot cumpăra fără să îmi fac cont?",
    a: "Da. Ai nevoie doar de o adresă de email validă, pe care o folosim pentru confirmare și pentru a putea verifica ulterior statusul comenzii.",
  },
];

const Support = () => {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const { messages, sending, error, send, reset, isFresh } = useChat({
    endpoint: "/api/suport",
    greeting: GREETING,
    buildPayload: () => ({ userEmail: user?.email ?? null }),
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending]);

  const submit = (text) => {
    send(text);
    setInput("");
    inputRef.current?.focus();
  };

  return (
    <Layout>
      <Seo
        title="Suport clienți"
        description="Verifică statusul comenzii, află cum funcționează returul și garanția sau vorbește cu echipa VoltMag."
        path="/suport"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }}
      />

      {/* Antet */}
      <header className="relative overflow-hidden rounded-3xl bg-ink px-8 py-12 text-white">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-volt/25 blur-[100px]" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-volt">
            <Icon name="bolt" className="h-3 w-3" filled />
            Suport clienți
          </span>
          <h1 className="mt-5 font-display text-3xl font-bold sm:text-4xl">
            Cu ce te putem ajuta?
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/60">
            Agentul nostru are acces la sistemul de comenzi și îți poate spune pe
            loc unde se află coletul tău. Pentru situațiile care cer o decizie
            umană, te punem în legătură cu echipa.
          </p>
        </div>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Chat */}
        <section className="flex min-h-[32rem] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-3.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-white">
              <Icon name="user" className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-bold text-ink">
                Agent de suport
              </p>
              <p className="text-[11px] text-slate-400">
                {user
                  ? `Conectat ca ${user.email}`
                  : "Răspunde imediat, non-stop"}
              </p>
            </div>
            {!isFresh && (
              <button
                type="button"
                onClick={reset}
                className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 transition hover:text-ink"
              >
                Conversație nouă
              </button>
            )}
          </div>

          {/* Mesaje */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-5">
            {messages.map((message, index) => (
              <div
                key={index}
                className={
                  message.role === "user"
                    ? "ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-sm bg-ink px-4 py-2.5 text-sm text-white"
                    : "w-fit max-w-[85%] whitespace-pre-line rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-2.5 text-sm leading-relaxed text-ink"
                }
              >
                {message.content}
              </div>
            ))}

            {sending && (
              <div className="flex w-fit items-center gap-1.5 rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-3.5">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
                {error} Dacă problema persistă, sună-ne la {SITE.phone}.
              </div>
            )}

            {/* Subiecte frecvente, doar la început */}
            {isFresh && !sending && (
              <div className="grid gap-2 pt-2 sm:grid-cols-2">
                {TOPICS.map((topic) => (
                  <button
                    key={topic.label}
                    type="button"
                    onClick={() => submit(topic.prompt)}
                    className="flex items-center gap-2.5 rounded-xl border border-slate-200 px-3.5 py-3 text-left text-xs font-medium text-slate-600 transition hover:border-volt/40 hover:text-ink"
                  >
                    <Icon name={topic.icon} className="h-4 w-4 shrink-0 text-volt" />
                    {topic.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Compunere */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
            className="flex items-center gap-2 border-t border-slate-100 p-4"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Descrie problema sau scrie numărul comenzii…"
              maxLength={500}
              disabled={sending}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink placeholder:text-slate-400 focus:border-volt focus:bg-white focus:outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink text-white transition hover:bg-volt disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              aria-label="Trimite"
            >
              <Icon name="chevronRight" className="h-4 w-4" />
            </button>
          </form>

          <p className="border-t border-slate-100 px-5 py-2.5 text-center text-[10px] text-slate-400">
            Agent AI. Nu poate anula comenzi sau aproba retururi — pentru asta te
            îndrumă către echipă.
          </p>
        </section>

        {/* Bară laterală */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="font-display text-sm font-bold text-ink">
              Ai numărul comenzii la îndemână?
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Ca să îți verific o comandă, am nevoie de numărul ei (forma{" "}
              <span className="font-semibold text-ink">VM-2026-01000</span>) și
              de adresa de email folosită la plasare. Le găsești în emailul de
              confirmare.
            </p>
            {user && (
              <Link
                to="/comenzile-mele"
                className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-volt transition hover:gap-2.5"
              >
                Vezi comenzile mele
                <Icon name="chevronRight" className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="font-display text-sm font-bold text-ink">
              Vorbește cu un om
            </h2>
            <p className="mt-2 text-xs text-slate-500">
              Pentru reclamații, colete pierdute sau anulări.
            </p>
            <ul className="mt-3 space-y-2.5 text-xs">
              <li className="flex items-start gap-2.5">
                <Icon name="mail" className="mt-0.5 h-4 w-4 shrink-0 text-volt" />
                <a
                  href={`mailto:${SITE.email}`}
                  className="text-slate-600 hover:text-ink"
                >
                  {SITE.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Icon name="phone" className="mt-0.5 h-4 w-4 shrink-0 text-volt" />
                <a
                  href={`tel:${SITE.phone.replace(/\s/g, "")}`}
                  className="text-slate-600 hover:text-ink"
                >
                  {SITE.phone}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Icon name="clock" className="mt-0.5 h-4 w-4 shrink-0 text-volt" />
                <span className="text-slate-600">{SITE.schedule}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0 text-volt" />
                <span className="text-slate-600">{SITE.address}</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Întrebări frecvente — răspunsuri instant, fără AI */}
      <section className="mt-14">
        <h2 className="font-display text-2xl font-bold text-ink">
          Întrebări frecvente
        </h2>
        <p className="mt-1.5 text-sm text-slate-500">
          Răspunsuri imediate la cele mai dese nelămuriri.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {FAQ.map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={item.q}
                className="rounded-2xl border border-slate-200 bg-white shadow-soft"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-ink">
                    {item.q}
                  </span>
                  <Icon
                    name="chevronDown"
                    className={`h-4 w-4 shrink-0 text-slate-400 transition ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="border-t border-slate-100 px-5 py-4 text-sm leading-relaxed text-slate-600">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </Layout>
  );
};

export default Support;
