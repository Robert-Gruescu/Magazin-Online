import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "./Icon";
import { useCart } from "../context/CartContext";
import { useChat } from "../hooks/useChat";
import { SITE } from "../config/site";
import { formatPrice } from "../lib/format";

const SUGGESTIONS = [
  "Caut un laptop de gaming sub 6000 lei",
  "Ce telefon are cea mai bună cameră?",
  "Am nevoie de un monitor pentru birou",
];

const GREETING = {
  content: `Salut! Sunt consultantul ${SITE.name}. Spune-mi ce cauți și pentru ce ai nevoie, iar eu îți găsesc variantele potrivite.`,
};

/** Cardul compact de produs afișat sub răspunsurile asistentului. */
const SuggestedProduct = ({ product, onNavigate }) => (
  <Link
    to={`/produs/${product.id}`}
    onClick={onNavigate}
    className="flex gap-3 rounded-xl border border-slate-200 bg-white p-2.5 transition hover:border-volt/40 hover:shadow-soft"
  >
    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
      {product.image_url ? (
        <img
          src={product.image_url}
          alt=""
          loading="lazy"
          className="h-full w-full object-contain p-1"
        />
      ) : null}
    </div>

    <div className="min-w-0 flex-1">
      {product.brand && (
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-volt">
          {product.brand}
        </span>
      )}
      <p className="line-clamp-2 text-xs font-semibold leading-snug text-ink">
        {product.nume}
      </p>
      <div className="mt-1 flex items-center gap-2">
        <span className="text-sm font-bold text-ink">
          {formatPrice(product.pret)}
        </span>
        {product.rating ? (
          <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
            <Icon name="star" className="h-2.5 w-2.5 text-amber-400" filled />
            {Number(product.rating).toFixed(1)}
          </span>
        ) : null}
      </div>
    </div>
  </Link>
);

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");

  const { items } = useCart();
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Logica de conversație e comună cu pagina de suport (src/hooks/useChat.js).
  const { messages, sending, error, send, isFresh } = useChat({
    endpoint: "/api/asistent",
    greeting: GREETING,
    buildPayload: () => ({
      cart: items.map((i) => ({ name: i.name, quantity: i.quantity })),
    }),
  });

  // Ține conversația derulată la ultimul mesaj.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  // Escape închide panoul.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const submit = (text) => {
    send(text);
    setInput("");
  };

  return (
    <>
      {/* Buton plutitor */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Închide asistentul" : "Deschide asistentul"}
        aria-expanded={isOpen}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-white shadow-lift transition hover:bg-volt sm:bottom-6 sm:right-6"
      >
        <Icon name={isOpen ? "close" : "bolt"} className="h-6 w-6" filled={!isOpen} />
      </button>

      {/* Panou */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Asistent de cumpărături"
          className="fixed inset-x-3 bottom-24 z-50 flex max-h-[min(34rem,calc(100vh-8rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lift sm:inset-x-auto sm:right-6 sm:w-[26rem]"
        >
          {/* Antet */}
          <header className="flex items-center gap-3 border-b border-slate-100 bg-ink px-4 py-3 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-volt">
              <Icon name="bolt" className="h-4 w-4" filled />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-bold">
                Consultant {SITE.name}
              </p>
              <p className="text-[11px] text-white/50">
                Îți caut produsele potrivite
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
              aria-label="Închide"
            >
              <Icon name="close" className="h-4 w-4" />
            </button>
          </header>

          {/* Conversație */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div key={index}>
                <div
                  className={
                    message.role === "user"
                      ? "ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-ink px-3.5 py-2 text-sm text-white"
                      : "w-fit max-w-[90%] whitespace-pre-line rounded-2xl rounded-bl-sm bg-slate-100 px-3.5 py-2 text-sm leading-relaxed text-ink"
                  }
                >
                  {message.content}
                </div>

                {message.products?.length > 0 && (
                  <div className="mt-2 grid gap-2">
                    {message.products.map((product) => (
                      <SuggestedProduct
                        key={product.id}
                        product={product}
                        onNavigate={() => setIsOpen(false)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {sending && (
              <div className="flex w-fit items-center gap-1.5 rounded-2xl rounded-bl-sm bg-slate-100 px-3.5 py-3">
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
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
                {error}
              </div>
            )}

            {/* Întrebări de pornire, doar la început */}
            {isFresh && !sending && (
              <div className="grid gap-1.5 pt-1">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => submit(suggestion)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-left text-xs text-slate-600 transition hover:border-volt/40 hover:text-ink"
                  >
                    {suggestion}
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
            className="flex items-center gap-2 border-t border-slate-100 p-3"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ce produs cauți?"
              maxLength={500}
              disabled={sending}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-400 focus:border-volt focus:bg-white focus:outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-white transition hover:bg-volt disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              aria-label="Trimite"
            >
              <Icon name="chevronRight" className="h-4 w-4" />
            </button>
          </form>

          <p className="border-t border-slate-100 px-4 py-2 text-center text-[10px] text-slate-400">
            Asistent AI pentru alegerea produselor. Ai o comandă plasată?{" "}
            <Link
              to="/suport"
              onClick={() => setIsOpen(false)}
              className="font-semibold text-volt hover:underline"
            >
              Mergi la suport
            </Link>
          </p>
        </div>
      )}
    </>
  );
};

export default ChatAssistant;
