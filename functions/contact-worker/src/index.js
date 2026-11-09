const PATH = "/api/contact";
const RECIPIENT = "info@bekamar.com";
const MAX_BODY_BYTES = 16 * 1024;
const MAX_TOKEN_LENGTH = 2048;
const MAX_FIELD_LENGTHS = Object.freeze({ name: 100, email: 254, phone: 40, topic: 80, message: 5000 });
const ALLOWED_TOPICS = new Set([
  "Doğal taş ürünleri",
  "Proje ve fiyat teklifi",
  "Showroom ziyareti",
  "Bayilik ve iş ortaklığı",
  "Diğer",
]);
const DEFAULT_ORIGINS = new Set(["https://bekamar.com", "https://www.bekamar.com"]);

function json(data, status, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers },
  });
}

function originsFor(env) {
  const configured = (env.ALLOWED_ORIGINS || "").split(",").map(value => value.trim()).filter(Boolean);
  return configured.length ? new Set(configured) : DEFAULT_ORIGINS;
}

function corsHeaders(origin, allowed) {
  if (!origin || !allowed.has(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "600",
    Vary: "Origin",
  };
}

function cleanSingleLine(value) {
  return value.trim().replace(/[\u0000-\u001f\u007f]/g, "");
}

function cleanMessage(value) {
  return value.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim();
}

function validEmail(value) {
  return value.length <= MAX_FIELD_LENGTHS.email &&
    /^[^\s@<>]+@[^\s@<>.]+(?:\.[^\s@<>.]+)+$/.test(value);
}

function validateFields(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const allowedKeys = new Set(["name", "email", "phone", "topic", "message", "turnstileToken"]);
  if (Object.keys(input).some(key => !allowedKeys.has(key))) return null;
  if (["name", "email", "topic", "message", "turnstileToken"].some(key => typeof input[key] !== "string")) return null;

  const fields = {
    name: cleanSingleLine(input.name),
    email: cleanSingleLine(input.email),
    phone: typeof input.phone === "string" ? cleanSingleLine(input.phone) : "",
    topic: cleanSingleLine(input.topic),
    message: cleanMessage(input.message),
    turnstileToken: input.turnstileToken,
  };
  if (Object.entries(MAX_FIELD_LENGTHS).some(([key, limit]) => fields[key].length > limit)) return null;
  if (fields.name.length < 2 || !validEmail(fields.email) || !ALLOWED_TOPICS.has(fields.topic) || fields.message.length < 2) return null;
  if (!fields.turnstileToken.trim() || fields.turnstileToken.length > MAX_TOKEN_LENGTH) return null;
  return fields;
}

async function readLimitedJson(request) {
  const lengthHeader = request.headers.get("Content-Length");
  if (lengthHeader && (!/^\d+$/.test(lengthHeader) || Number(lengthHeader) > MAX_BODY_BYTES)) {
    return { error: "too_large" };
  }
  if (!request.body) return { error: "invalid_json" };

  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        return { error: "too_large" };
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return { value: JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) };
  } catch {
    return { error: "invalid_json" };
  }
}

function senderAddress(env) {
  const email = (env.EMAIL_FROM || "").trim();
  const verifiedDomain = (env.VERIFIED_SENDER_DOMAIN || "").trim().toLowerCase();
  if (!email || !verifiedDomain || /[\r\n<>\s]/.test(email) || !validEmail(email)) return null;
  if (email.slice(email.lastIndexOf("@") + 1).toLowerCase() !== verifiedDomain) return null;
  return email;
}

async function verifyTurnstile(token, request, env) {
  if (!env.TURNSTILE_SECRET_KEY) return false;
  const form = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token });
  const remoteIp = request.headers.get("CF-Connecting-IP");
  if (remoteIp) form.set("remoteip", remoteIp);

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return false;
    const result = await response.json();
    if (result.success !== true) return false;
    if (env.TURNSTILE_TEST_MODE === "true") return result.hostname === "example.com";
    const hostnames = new Set((env.TURNSTILE_HOSTNAMES || "").split(",").map(value => value.trim().toLowerCase()).filter(Boolean));
    return result.action === "contact" && hostnames.has(String(result.hostname || "").toLowerCase());
  } catch {
    return false;
  }
}

async function sendEmail(fields, env) {
  const fromAddress = senderAddress(env);
  if (!env.RESEND_API_KEY || !fromAddress) return false;
  const text = [
    "Yeni Bekamar web sitesi iletişim talebi",
    "",
    `Ad Soyad: ${fields.name}`,
    `E-posta: ${fields.email}`,
    `Telefon: ${fields.phone || "Belirtilmedi"}`,
    `Konu: ${fields.topic}`,
    "",
    "Mesaj:",
    fields.message,
  ].join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `Bekamar Web <${fromAddress}>`,
        to: [RECIPIENT],
        reply_to: fields.email,
        subject: `Bekamar iletişim talebi: ${fields.topic}`,
        text,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return false;
    const result = await response.json();
    return typeof result.id === "string" && result.id.length > 0;
  } catch {
    return false;
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== PATH) return json({ ok: false, error: "not_found" }, 404);

    const allowed = originsFor(env);
    const origin = request.headers.get("Origin");
    const cors = corsHeaders(origin, allowed);
    if (origin && !allowed.has(origin)) return json({ ok: false, error: "origin_not_allowed" }, 403);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405, { Allow: "POST, OPTIONS", ...cors });

    const emailEnabled = env.EMAIL_ENABLED === "true";
    if (!env.TURNSTILE_SECRET_KEY || !env.CONTACT_RATE_LIMITER || (emailEnabled && (!env.RESEND_API_KEY || !senderAddress(env)))) {
      return json({ ok: false, error: "temporarily_unavailable" }, 503, cors);
    }

    const clientIp = request.headers.get("CF-Connecting-IP") || "unknown-client";
    try {
      const { success } = await env.CONTACT_RATE_LIMITER.limit({ key: clientIp });
      if (!success) return json({ ok: false, error: "rate_limited" }, 429, cors);
    } catch {
      return json({ ok: false, error: "temporarily_unavailable" }, 503, cors);
    }

    if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("Content-Type") || "")) {
      return json({ ok: false, error: "unsupported_media_type" }, 415, cors);
    }
    const parsed = await readLimitedJson(request);
    if (parsed.error === "too_large") return json({ ok: false, error: "payload_too_large" }, 413, cors);
    if (parsed.error) return json({ ok: false, error: "invalid_request" }, 400, cors);
    const fields = validateFields(parsed.value);
    if (!fields) return json({ ok: false, error: "invalid_request" }, 400, cors);

    if (!await verifyTurnstile(fields.turnstileToken, request, env)) {
      return json({ ok: false, error: "verification_failed" }, 403, cors);
    }
    if (!emailEnabled) return json({ ok: false, error: "temporarily_unavailable" }, 503, cors);
    if (!await sendEmail(fields, env)) return json({ ok: false, error: "email_unavailable" }, 502, cors);
    return json({ ok: true }, 200, cors);
  },
};
