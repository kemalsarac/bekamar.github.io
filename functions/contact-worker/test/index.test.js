import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";

const originalFetch = globalThis.fetch;
const origin = "https://bekamar.com";
const sender = "website@send.example.test";

function environment({ emailEnabled = "true", rateAllowed = true, turnstileValid = true, resendOk = true } = {}) {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    if (String(url).includes("siteverify")) {
      return Response.json({ success: turnstileValid, action: "contact", hostname: "bekamar.com" });
    }
    return resendOk ? Response.json({ id: "test-email-id" }) : Response.json({ message: "failed" }, { status: 500 });
  };
  return {
    calls,
    env: {
      EMAIL_ENABLED: emailEnabled,
      ALLOWED_ORIGINS: origin,
      TURNSTILE_HOSTNAMES: "bekamar.com",
      TURNSTILE_SECRET_KEY: "test-turnstile-secret",
      RESEND_API_KEY: "test-resend-secret",
      EMAIL_FROM: sender,
      VERIFIED_SENDER_DOMAIN: "send.example.test",
      CONTACT_RATE_LIMITER: { limit: async () => ({ success: rateAllowed }) },
    },
  };
}

function request(payload, { method = "POST", headers = {}, rawBody } = {}) {
  const body = rawBody ?? (payload === undefined ? undefined : JSON.stringify(payload));
  const defaults = { Origin: origin, "Content-Type": "application/json" };
  if (method === "POST" && body !== undefined) defaults["Content-Length"] = String(new TextEncoder().encode(body).byteLength);
  return new Request("https://worker.example/api/contact", { method, headers: { ...defaults, ...headers }, body: method === "GET" || method === "HEAD" ? undefined : body });
}

function validPayload() {
  return { name: "Ada Lovelace", email: "ada@example.com", phone: "", topic: "Diğer", message: "Merhaba Bekamar", turnstileToken: "valid-test-token" };
}

test.afterEach(() => { globalThis.fetch = originalFetch; });

test("valid form is sent to the fixed recipient with customer reply-to", async () => {
  const { env, calls } = environment();
  const response = await worker.fetch(request({ ...validPayload(), message: "<img src=x onerror=alert(1)>" }), env);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  const message = JSON.parse(calls.find(call => call.url.includes("api.resend.com")).init.body);
  assert.deepEqual(message.to, ["info@bekamar.com"]);
  assert.equal(message.reply_to, "ada@example.com");
  assert.equal("html" in message, false);
  assert.match(message.text, /<img src=x onerror=alert\(1\)>/);
});

test("client cannot override sender or recipient", async () => {
  const { env, calls } = environment();
  const response = await worker.fetch(request({ ...validPayload(), to: "attacker@example.com" }), env);
  assert.equal(response.status, 400);
  assert.equal(calls.length, 0);
});

test("missing required field is rejected", async () => {
  const { env, calls } = environment();
  const payload = validPayload(); delete payload.message;
  const response = await worker.fetch(request(payload), env);
  assert.equal(response.status, 400);
  assert.equal(calls.length, 0);
});

test("malformed email is rejected", async () => {
  const { env } = environment();
  const response = await worker.fetch(request({ ...validPayload(), email: "not-an-email" }), env);
  assert.equal(response.status, 400);
});

test("oversized body is rejected", async () => {
  const { env } = environment();
  const response = await worker.fetch(request(undefined, { rawBody: " ".repeat(16 * 1024 + 1) }), env);
  assert.equal(response.status, 413);
});

test("wrong method is rejected", async () => {
  const { env } = environment();
  const response = await worker.fetch(request(undefined, { method: "GET" }), env);
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("Allow"), "POST, OPTIONS");
});

test("invalid Turnstile token prevents email send", async () => {
  const { env, calls } = environment({ turnstileValid: false });
  const response = await worker.fetch(request(validPayload()), env);
  assert.equal(response.status, 403);
  assert.equal(calls.some(call => call.url.includes("api.resend.com")), false);
});

test("rate limit is enforced", async () => {
  const { env, calls } = environment({ rateAllowed: false });
  const response = await worker.fetch(request(validPayload()), env);
  assert.equal(response.status, 429);
  assert.equal(calls.length, 0);
});

test("Resend failure is returned as an error", async () => {
  const { env } = environment({ resendOk: false });
  const response = await worker.fetch(request(validPayload()), env);
  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { ok: false, error: "email_unavailable" });
});

test("email remains disabled when not explicitly enabled", async () => {
  const { env, calls } = environment({ emailEnabled: "false" });
  const response = await worker.fetch(request(validPayload()), env);
  assert.equal(response.status, 503);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url.includes("siteverify"), true);
  assert.equal(calls.some(call => call.url.includes("api.resend.com")), false);
});
