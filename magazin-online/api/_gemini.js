// api/_gemini.js — logica comună a celor doi agenți AI (vânzări și suport).
//
// Fișierele din api/ care încep cu "_" NU devin rute pe Vercel, deci acesta
// este doar un modul importat de asistent.js și suport.js.
//
// Folosim Google Gemini prin SDK-ul oficial @google/genai. Cheia stă exclusiv
// pe server, în GEMINI_API_KEY.

import { GoogleGenAI, ApiError } from "@google/genai";

/**
 * Modelul folosit de ambii agenți. `gemini-2.5-flash` este rapid, ieftin și
 * are function calling — potrivit pentru un chat de magazin.
 *
 * Ca să vezi ce modele îți sunt disponibile cu cheia ta:
 *   curl "https://generativelanguage.googleapis.com/v1beta/models?key=CHEIA_TA"
 */
export const MODEL = "gemini-2.5-flash";

export const MAX_HISTORY_TURNS = 24;
export const MAX_MESSAGE_CHARS = 2000;

/** Tipurile din schema OpenAPI cerută de Gemini (majuscule, nu JSON Schema). */
export const T = {
  OBJECT: "OBJECT",
  STRING: "STRING",
  NUMBER: "NUMBER",
  INTEGER: "INTEGER",
  BOOLEAN: "BOOLEAN",
  ARRAY: "ARRAY",
};

let client = null;
function getClient() {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

/**
 * Curăță istoricul primit de la client. Nu avem încredere în el: verificăm
 * rolurile, tăiem mesajele prea lungi și ne asigurăm că discuția începe și se
 * termină cu un mesaj al utilizatorului.
 */
export function sanitizeMessages(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const cleaned = raw
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .slice(-MAX_HISTORY_TURNS)
    .map((m) => ({
      role: m.role,
      content: m.content.slice(0, MAX_MESSAGE_CHARS),
    }));

  while (cleaned.length > 0 && cleaned[0].role !== "user") cleaned.shift();
  if (cleaned.length === 0 || cleaned[cleaned.length - 1].role !== "user") {
    return null;
  }

  return cleaned;
}

/** Istoricul nostru → formatul `contents` al Gemini (rolul „assistant" = „model"). */
function toContents(messages) {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}

/**
 * Scoate markdown-ul din răspuns.
 *
 * Interfața afișează text simplu, deci un `**text**` s-ar vedea literal, cu
 * asteriscuri cu tot. Instrucțiunea din prompt ajută, dar modelul tot alunecă
 * în markdown din când în când — asta e plasa de siguranță deterministă.
 */
export function curataMarkdown(text) {
  return (
    String(text || "")
      // Delimitatori de cod
      .replace(/```[a-z]*\n?/gi, "")
      .replace(/`/g, "")
      // Titluri: „## Ceva" -> „Ceva"
      .replace(/^[ \t]*#{1,6}[ \t]+/gm, "")
      // Marcatori de listă la început de rând: „* ", „- ", „• "
      .replace(/^[ \t]*[*+•‧–—-][ \t]+/gm, "")
      // Îngroșat și italic, în ambele notații
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/__([^_]+)__/g, "$1")
      .replace(/\*([^*\n]+)\*/g, "$1")
      // Linkuri markdown: „[text](url)" -> „text"
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      // Asteriscuri rămase razlețe
      .replace(/\*/g, "")
      // Spațiere: maximum un rând gol, fără spații la capete de rând
      .replace(/[ \t]+$/gm, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

// Motive pentru care modelul se poate opri fără text util.
const FINISH_BLOCAT = new Set([
  "SAFETY",
  "PROHIBITED_CONTENT",
  "BLOCKLIST",
  "SPII",
  "RECITATION",
]);

/**
 * Rulează bucla de unelte: modelul cere o funcție → o executăm → îi dăm
 * rezultatul → repetăm până răspunde cu text.
 *
 * @param systemInstruction  instrucțiunea de sistem
 * @param functionDeclarations  uneltele, în format Gemini
 * @param implementations    { numeUnealta: async (args) => rezultat }
 * @param messages           istoricul deja curățat
 * @param maxIterations      limită de runde, ca să mărginim costul și latența
 * @param onToolResult       apelat cu rezultatul fiecărei unelte (opțional)
 *
 * @returns { text, blocked }
 */
export async function runToolLoop({
  systemInstruction,
  functionDeclarations,
  implementations,
  messages,
  maxIterations = 6,
  onToolResult,
}) {
  const ai = getClient();
  const contents = toContents(messages);

  for (let i = 0; i < maxIterations; i += 1) {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations }],
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    });

    const candidate = response.candidates?.[0];

    if (candidate?.finishReason && FINISH_BLOCAT.has(candidate.finishReason)) {
      return { text: "", blocked: true };
    }

    const calls = response.functionCalls ?? [];

    if (calls.length === 0) {
      return { text: curataMarkdown(response.text), blocked: false };
    }

    // Păstrăm exact părțile întoarse de model; dacă lipsesc, le reconstruim
    // din apelurile de funcție, ca istoricul să rămână coerent.
    contents.push({
      role: "model",
      parts: candidate?.content?.parts ?? calls.map((c) => ({ functionCall: c })),
    });

    // Uneltele sunt independente, deci le rulăm în paralel.
    const parts = await Promise.all(
      calls.map(async (call) => {
        const implementation = implementations[call.name];
        let output;

        if (!implementation) {
          output = { eroare: "Unealtă necunoscută." };
        } else {
          try {
            output = await implementation(call.args || {});
          } catch (toolError) {
            console.error(`Unealta ${call.name} a esuat:`, toolError);
            output = { eroare: "Interogarea a eșuat." };
          }
        }

        onToolResult?.(output);

        const functionResponse = { name: call.name, response: { output } };
        if (call.id) functionResponse.id = call.id;
        return { functionResponse };
      }),
    );

    contents.push({ role: "user", parts });
  }

  // Am consumat toate rundele fără ca modelul să ajungă la un răspuns.
  return { text: "", blocked: false };
}

/**
 * Traduce o eroare în răspuns HTTP. Mesajele sunt pentru client, deci nu conțin
 * detalii interne — acelea ajung în log.
 */
export function handleError(error, res, ceEste = "Asistentul") {
  if (error instanceof ApiError) {
    console.error(`Eroare Gemini ${error.status}:`, error.message);

    if (error.status === 429) {
      return res.status(429).json({
        error:
          "Am atins limita de întrebări pentru moment. Mai încearcă peste un minut.",
      });
    }

    // Gemini raportează o cheie invalidă cu 400 + API_KEY_INVALID, nu cu 401.
    // Fără verificarea pe mesaj, ar arăta ca o indisponibilitate temporară.
    const cheieInvalida =
      error.status === 401 ||
      error.status === 403 ||
      /API_KEY_INVALID|API key not valid/i.test(error.message || "");

    if (cheieInvalida) {
      return res.status(500).json({
        error: `${ceEste} nu este configurat corect: cheia GEMINI_API_KEY lipsește sau este invalidă.`,
      });
    }
    if (error.status === 404) {
      return res.status(500).json({
        error: `Modelul ${MODEL} nu este disponibil pentru cheia ta. Verifică lista de modele.`,
      });
    }
    return res
      .status(502)
      .json({ error: `${ceEste} nu este disponibil momentan.` });
  }

  console.error(`Eroare neasteptata (${ceEste}):`, error);
  return res.status(500).json({ error: "Ceva nu a mers. Încearcă din nou." });
}

/** Verifică variabilele de mediu. Întoarce un mesaj de eroare sau null. */
export function checkConfig(supabaseUrl, supabaseKey, ceEste = "Asistentul") {
  if (!process.env.GEMINI_API_KEY) {
    return `${ceEste} nu este configurat: lipsește GEMINI_API_KEY.`;
  }
  if (!supabaseUrl || !supabaseKey) {
    return "Lipsesc variabilele de mediu Supabase pe server.";
  }
  return null;
}
