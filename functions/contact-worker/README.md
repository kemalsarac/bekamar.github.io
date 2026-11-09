# Bekamar contact Worker

POST `/api/contact` is intentionally disabled until Turnstile, Resend, the verified sender domain, and the API route are configured. The Worker returns HTTP 503 while `EMAIL_ENABLED` is not exactly `true` or any required secret/sender/rate-limit binding is missing.

## Local checks

This Worker uses only Web APIs at runtime. Tests use Node's built-in test runner and mock Cloudflare bindings and upstream APIs:

```sh
npm test
```

Install Wrangler before local preview (`npm install`). `npm run dev` starts the `dev` environment, which also keeps email disabled. No Cloudflare account credentials are stored in this project.

## Deployment prerequisites

1. Replace each rate-limit `namespace_id` in `wrangler.jsonc` with an integer unique to the Cloudflare account.
2. Add and verify a sender domain in Resend. Set `VERIFIED_SENDER_DOMAIN` and `EMAIL_FROM` only after verification.
3. Create the Turnstile widget for the production hostnames and set `TURNSTILE_HOSTNAMES` to those exact hostnames.
4. Add Worker secrets with `wrangler secret put RESEND_API_KEY` and `wrangler secret put TURNSTILE_SECRET_KEY`.
5. Configure the frontend's public Turnstile site key and Worker URL in `js/contact-config.js`.
6. Attach the Worker to an approved route/custom domain, then test in staging. Only after approval set `EMAIL_ENABLED` to `true` for the production environment.

The destination is fixed in code to `info@bekamar.com`; caller-supplied recipient or sender fields are rejected. Rate limiting is an approximate Cloudflare per-location limit keyed by the Cloudflare client IP. It is not a strict global quota. See `../../FORM_SETUP.md` for setup details.
