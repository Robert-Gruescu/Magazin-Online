import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Logica de conversație, comună asistentului de vânzări și agentului de suport.
 * Ține istoricul, trimite cererea și expune starea de încărcare și eroare.
 *
 * @param endpoint     ruta serverless care răspunde (ex: "/api/suport")
 * @param greeting     mesajul afișat la deschidere; e generat local și NU se
 *                     trimite la server, ca modelul să nu creadă că l-a scris el
 * @param buildPayload funcție opțională care întoarce câmpuri suplimentare
 *                     pentru corpul cererii (coș, email, etc.)
 */
export function useChat({ endpoint, greeting, buildPayload }) {
  const [messages, setMessages] = useState(() => [
    { ...greeting, role: "assistant", local: true },
  ]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Ținem funcția într-un ref ca `send` să rămână stabilă între render-uri,
  // chiar dacă apelantul o definește inline. Actualizarea se face în effect,
  // nu în timpul render-ului — `send` e chemat doar din handlere de evenimente,
  // deci ref-ul e mereu la zi când contează.
  const payloadRef = useRef(buildPayload);
  useEffect(() => {
    payloadRef.current = buildPayload;
  }, [buildPayload]);

  const send = useCallback(
    async (text) => {
      const trimmed = (text || "").trim();
      if (!trimmed || sending) return;

      setError("");

      const nextMessages = [
        ...messages,
        { role: "user", content: trimmed },
      ];
      setMessages(nextMessages);
      setSending(true);

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: nextMessages
              .filter((m) => !m.local)
              .map(({ role, content }) => ({ role, content })),
            ...(payloadRef.current?.() ?? {}),
          }),
        });

        // Răspunsul poate să nu fie JSON: serverul de dezvoltare Vite întoarce
        // 404 gol pentru /api/*, fiindcă funcțiile serverless rulează pe Vercel,
        // nu în Vite. Citim text și încercăm să parsăm, ca să putem da un mesaj
        // corect în loc să dăm vina pe conexiune.
        const raw = await response.text();
        let data = null;
        try {
          data = raw ? JSON.parse(raw) : null;
        } catch {
          data = null;
        }

        if (!response.ok || !data) {
          // Sub `npm run dev`, Vite serveste fisierele din api/ ca text simplu
          // (cod sursa) sau intoarce index.html, ambele cu HTTP 200. Deci
          // semnalul real nu e codul de stare, ci faptul ca raspunsul nu e JSON.
          if (data === null) {
            setError(
              `Ruta ${endpoint} nu a răspuns cu JSON. Funcțiile din api/ nu rulează. Serverul Vite (npm run dev) nu le execută — pornește proiectul cu "vercel dev" sau testează pe deployment.`,
            );
          } else if (data?.error) {
            setError(data.error);
          } else {
            setError(
              `Serverul a răspuns cu ${response.status}, într-un format neașteptat.`,
            );
          }
          return;
        }

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.reply,
            products: data.products || [],
          },
        ]);
      } catch {
        // Aici ajungem doar la o eroare reală de rețea (fetch a eșuat complet).
        setError("Nu am putut contacta serverul. Verifică-ți conexiunea.");
      } finally {
        setSending(false);
      }
    },
    [endpoint, messages, sending],
  );

  const reset = useCallback(() => {
    setMessages([{ ...greeting, role: "assistant", local: true }]);
    setError("");
  }, [greeting]);

  return {
    messages,
    sending,
    error,
    send,
    reset,
    /** true cât timp nu s-a trimis încă niciun mesaj */
    isFresh: messages.length === 1,
  };
}
