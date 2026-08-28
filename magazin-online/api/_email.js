// api/_email.js — trimiterea emailurilor, prin Resend.
//
// Folosim API-ul REST direct, cu fetch, ca să nu adăugăm încă o dependință
// pentru un singur apel HTTP.
//
// Variabile de mediu:
//   RESEND_API_KEY  — cheia din resend.com
//   EMAIL_FROM      — expeditorul, ex: "VoltMag <comenzi@domeniul-tau.ro>"
//                     Domeniul trebuie verificat în Resend.
//
// Dacă lipsesc, trimiterea este sărită tăcut: o comandă nu trebuie să eșueze
// pentru că serviciul de email nu e configurat.

import { SITE } from "../src/config/site.js";

const RESEND_URL = "https://api.resend.com/emails";

export const emailConfigurat = () =>
  Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

/**
 * Trimite un email. Nu aruncă niciodată — întoarce { trimis, motiv }, ca
 * apelantul să poată continua indiferent de rezultat.
 */
export async function trimiteEmail({ to, subject, html, replyTo }) {
  if (!emailConfigurat()) {
    return { trimis: false, motiv: "Resend nu este configurat (RESEND_API_KEY / EMAIL_FROM)." };
  }

  try {
    const raspuns = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    if (!raspuns.ok) {
      const detaliu = await raspuns.text();
      console.error("Resend a refuzat emailul:", raspuns.status, detaliu.slice(0, 300));
      return { trimis: false, motiv: `Resend ${raspuns.status}` };
    }

    return { trimis: true };
  } catch (error) {
    console.error("Trimiterea emailului a esuat:", error);
    return { trimis: false, motiv: "Eroare de rețea." };
  }
}

const esc = (s) =>
  String(s ?? "").replace(/[<>&"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c],
  );

const lei = (n) =>
  `${Number(n).toLocaleString("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} lei`;

/** Emailul de confirmare trimis clientului. */
export function emailConfirmareComanda({ comanda, client, produse }) {
  const randuri = produse
    .map(
      (p) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
          ${esc(p.name)} <span style="color:#64748b;">× ${p.quantity}</span>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right;white-space:nowrap;">
          ${lei(Number(p.price) * Number(p.quantity))}
        </td>
      </tr>`,
    )
    .join("");

  const transport =
    Number(comanda.shipping_cost) === 0 ? "Gratuit" : lei(comanda.shipping_cost);

  return {
    subject: `Comanda ${comanda.order_number} a fost înregistrată — ${SITE.name}`,
    html: `<!doctype html>
<html lang="ro"><body style="margin:0;padding:24px;background:#f8fafc;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#0b1220;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">

    <div style="background:#0b1220;color:#ffffff;padding:24px;">
      <div style="font-size:20px;font-weight:700;">${esc(SITE.name)}</div>
      <div style="font-size:13px;color:#94a3b8;margin-top:4px;">${esc(SITE.tagline)}</div>
    </div>

    <div style="padding:24px;">
      <h1 style="margin:0 0 8px;font-size:19px;">Mulțumim pentru comandă, ${esc(client.full_name)}!</h1>
      <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#475569;">
        Am înregistrat comanda ta. Te contactăm în cel mai scurt timp la
        <strong>${esc(client.phone)}</strong> pentru confirmare.
      </p>

      <div style="background:#f1f5f9;border-radius:12px;padding:14px 16px;margin-bottom:20px;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#64748b;">Număr comandă</div>
        <div style="font-size:20px;font-weight:700;margin-top:2px;">${esc(comanda.order_number)}</div>
        <div style="font-size:12px;color:#64748b;margin-top:6px;">
          Păstrează-l: cu el și cu adresa aceasta de email poți verifica oricând statusul, pe pagina de suport.
        </div>
      </div>

      <table style="width:100%;border-collapse:collapse;font-size:14px;">${randuri}
        <tr>
          <td style="padding:10px 0 2px;color:#64748b;">Produse</td>
          <td style="padding:10px 0 2px;text-align:right;">${lei(comanda.subtotal)}</td>
        </tr>
        <tr>
          <td style="padding:2px 0;color:#64748b;">Livrare</td>
          <td style="padding:2px 0;text-align:right;">${transport}</td>
        </tr>
        <tr>
          <td style="padding:10px 0 0;font-weight:700;font-size:16px;border-top:2px solid #0b1220;">Total</td>
          <td style="padding:10px 0 0;text-align:right;font-weight:700;font-size:16px;border-top:2px solid #0b1220;">${lei(comanda.total)}</td>
        </tr>
      </table>

      <div style="margin-top:22px;font-size:13px;line-height:1.7;color:#475569;">
        <strong style="color:#0b1220;">Livrare</strong><br>
        ${esc(client.address)}, ${esc(client.city)}${client.county ? ", " + esc(client.county) : ""}<br>
        Plată: ${esc(client.payment_method === "transfer" ? "transfer bancar" : "ramburs la curier")}
      </div>

      <div style="margin-top:22px;padding-top:18px;border-top:1px solid #e2e8f0;font-size:12px;line-height:1.7;color:#64748b;">
        Livrare în 24-48h · Retur în 30 de zile · Garanție și factură incluse<br>
        Întrebări? Scrie-ne la <a href="mailto:${esc(SITE.email)}" style="color:#1d4ed8;">${esc(SITE.email)}</a>
        sau sună la ${esc(SITE.phone)}.
      </div>
    </div>
  </div>
</body></html>`,
  };
}

/** Notificarea internă, către magazin. */
export function emailComandaNoua({ comanda, client, produse }) {
  const randuri = produse
    .map((p) => `<li>${esc(p.name)} × ${p.quantity} — ${lei(Number(p.price) * Number(p.quantity))}</li>`)
    .join("");

  return {
    subject: `Comandă nouă ${comanda.order_number} — ${lei(comanda.total)}`,
    html: `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:14px;color:#0b1220;">
  <h2 style="margin:0 0 12px;">Comandă nouă: ${esc(comanda.order_number)}</h2>
  <p style="margin:0 0 6px;"><strong>${esc(client.full_name)}</strong> · ${esc(client.phone)} · ${esc(client.email)}</p>
  <p style="margin:0 0 12px;color:#475569;">${esc(client.address)}, ${esc(client.city)}${client.county ? ", " + esc(client.county) : ""}</p>
  <ul style="margin:0 0 12px;padding-left:18px;">${randuri}</ul>
  <p style="margin:0;"><strong>Total: ${lei(comanda.total)}</strong> (produse ${lei(comanda.subtotal)} + livrare ${lei(comanda.shipping_cost)})</p>
  <p style="margin:12px 0 0;color:#475569;">Plată: ${esc(client.payment_method)}${client.notes ? ` · Observații: ${esc(client.notes)}` : ""}</p>
</div>`,
  };
}
