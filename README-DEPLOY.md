# IMAGE 24 v18.2 — production security-hardened deployment

This package is prepared for deployment to the existing IMAGE 24 Cloudflare Worker and D1 database. The D1 database ID has been filled in from the user's provided database. Worker secrets are intentionally not included.


This build keeps the browser-first file workflow, adds a Cloudflare Worker API, D1-backed accounts/usage/history, Cloudflare Turnstile protection, and a Razorpay subscription backend.

## What changed

Security hardening in v18.2:
- Atomic per-user billing checkout lock prevents concurrent duplicate Razorpay subscriptions.
- Subscription records are stored independently; stale subscription webhooks cannot replace the current subscription.
- Razorpay webhook signatures are verified against the raw body and duplicate event IDs are rejected atomically.
- Billing endpoints validate same-origin requests and are rate limited.
- AUTH_PEPPER has no development fallback.
- Session hashes are derived with AUTH_PEPPER for database-compromise defense in depth.
- Login uses a dummy PBKDF2 path for unknown accounts to reduce timing-based email enumeration.
- JSON API request sizes/content types are validated.
- Security headers include a CSP.
- Scheduled cleanup removes expired sessions, old rate-limit records, old jobs, old webhook events, old usage rows and expired checkout locks.
- Wrangler is pinned to a known version.
- Custom 404 handling is enabled.

- 50 MB per-file validation in the browser.
- Free limit: 10 jobs/day.
- Pro limit: 500 jobs/day.
- Limits are enforced by `/api/jobs/reserve`, not only by UI text.
- Signed sessions use an HttpOnly + Secure + SameSite cookie.
- Passwords are PBKDF2-SHA256 hashed; plaintext passwords are never stored.
- Login/registration/feedback endpoints have IP-based rate limiting.
- Job history stores tool/status/timestamp only; browser-first source files are not uploaded.
- Feedback is stored in D1; Cloudflare Turnstile protects account registration/sign-in and can also protect feedback when configured.
- Razorpay subscription checkout and signed webhook handling are included.
- Pro cancellation can be requested at the end of the current billing cycle.
- Static assets are served by Workers Static Assets; `/api/*` runs through the Worker first.
- SEO metadata, canonical tool URLs, Open Graph tags, WebSite/Organization/Article/Breadcrumb JSON-LD, sitemap, robots rules, guide content and canonical redirects are included.
- The homepage exposes a crawlable Guides section linking each guide to its matching tool.
- Tool pages now lazy-load heavy conversion libraries instead of downloading every PDF/office library on every page.
- A custom 404 page, static security headers and workers.dev noindex protection were added.

## 1. Create the D1 database

The package is configured to use the existing D1 database `image24-production`.

The database ID is already filled in in `wrangler.jsonc`. Do not replace it unless you intentionally switch to a different D1 database.

For a fresh database, apply the versioned migrations:

```bash
npx wrangler d1 migrations apply image24-production --remote
```

For an existing database that already has the v18.1 core tables, run the versioned migrations. v18.2 also includes a small follow-up migration for the Razorpay checkout URL. Do not mix ad-hoc production schema edits with the migration history.

## 2. Configure Worker secrets

The source code intentionally contains no production secrets.

Required:

- `AUTH_PEPPER` — long random secret used for password/session/anonymous usage hashing.

Optional until billing is enabled:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_PLAN_ID`
- `RAZORPAY_WEBHOOK_SECRET`
- `RAZORPAY_TOTAL_COUNT` (default is 1200 monthly cycles)
- `TURNSTILE_SECRET, RESEND_API_KEY and FROM_EMAIL`
- `TURNSTILE_SITE_KEY` (site key is public, but keeping it as a Worker variable makes configuration easier)

In the Cloudflare dashboard: Workers & Pages → your Worker → Settings → Variables and Secrets.

Or with Wrangler:

```bash
npx wrangler secret put AUTH_PEPPER
npx wrangler secret put RAZORPAY_KEY_ID
npx wrangler secret put RAZORPAY_KEY_SECRET
npx wrangler secret put RAZORPAY_PLAN_ID
npx wrangler secret put RAZORPAY_WEBHOOK_SECRET
npx wrangler secret put TURNSTILE_SECRET, RESEND_API_KEY and FROM_EMAIL
```

Do not put secrets in `wrangler.jsonc`, HTML, JavaScript sent to the browser, GitHub, or a public ZIP.

## 3. Configure Razorpay Pro

Create a monthly Razorpay Subscription Plan for ₹299/month and copy its Plan ID into `RAZORPAY_PLAN_ID`.

Set the Razorpay webhook URL to:

`https://YOUR-DOMAIN/api/billing/webhook`

Subscribe to the subscription events needed for status changes, especially activation/charge/cancellation/halt/completion events.

The webhook handler verifies `X-Razorpay-Signature` against the raw request body before changing the user's plan.

Test the complete subscription flow in Razorpay Test Mode before switching to live keys.

## 4. Configure Turnstile

Create a Cloudflare Turnstile widget for your production hostname.

Set:

- `TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET, RESEND_API_KEY and FROM_EMAIL`

The feedback form will automatically render the widget when the site key exists. The Worker validates the token server-side.

## 5. Deploy

Install Wrangler if needed:

```bash
npm install
```

Deploy:

```bash
npx wrangler deploy
```

The Worker serves the `public/` directory and handles `/api/*` routes.

## 6. Custom domain

After deployment, attach the production domain from Workers & Pages → your Worker → Domains.

For this project the intended canonical domain is `image24.in`; if your real domain is different, update the canonical/meta/sitemap values in `public/index.html` and `public/sitemap.xml`.

## 7. Verify after deployment

Open:

- `/health`
- `/api/health`
- `/`
- `/privacy.html`
- `/terms.html`
- `/cookies.html`

Then test:

1. Create a Free account.
2. Sign out and sign in again.
3. Run an image tool.
4. Confirm usage increases.
5. Reach the Free limit in a test environment and confirm processing is blocked.
6. Submit feedback.
7. Create a Razorpay Test subscription.
8. Confirm the webhook changes the account to Pro.
9. Confirm Pro shows 500 jobs/day.
10. Request cancellation and confirm the provider/webhook updates the status.
11. Test the site on Android Chrome.
12. Test a file larger than 50 MB and confirm it is rejected before processing.

## Important architecture note

IMAGE 24 deliberately does **not** add R2 to the current browser-first workflow. R2 should only be introduced if a tool actually needs temporary server-side file processing. This keeps the current privacy claim aligned with the implementation and avoids unnecessary file storage.

## Production note

The policy pages are technical product templates, not legal advice. Review privacy, consumer, refund, tax and subscription disclosures for the jurisdictions in which you operate before accepting real customers.


## Mobile-only dashboard checklist (no terminal)

If you are deploying from the Cloudflare dashboard on Android, complete these items before launch:

1. Open **Workers & Pages** → open `image24`.
2. Open **Settings → Bindings** → add a **D1 database** binding named `DB` and select `image24-production`.
3. Open **Settings → Variables and Secrets** → add the required `AUTH_PEPPER` secret. Configure the required AUTH_PEPPER and the Turnstile secrets/site key before production auth is enabled. Configure Razorpay secrets/plan ID before enabling Pro billing.
4. Deploy the final ZIP/source from the project deployment screen.
5. Open **Settings → Domains & Routes → Add → Custom Domain** and attach `image24.in`.
6. After the domain is live, open `https://image24.in/health` and `https://image24.in/api/health`. The second endpoint should report database availability as `true`. Turnstile must be configured for registration/sign-in; Razorpay may remain disabled until Pro billing is ready.
7. In Google Search Console, verify `image24.in`, submit `https://image24.in/sitemap.xml`, then inspect `/` and the priority tool URLs and request indexing.

If you use the Cloudflare dashboard rather than Wrangler, the D1 binding is the important manual step: the Worker must have a binding whose variable name is exactly `DB`, because the source code reads `env.DB`.


## v18.2 security note

This revision removes the runtime dependency on `env.ASSETS.fetch()` from the Worker. Cloudflare Workers Static Assets serves files from `public/` directly before invoking the Worker. The Worker is therefore used for `/api/*`, `/health`, and the scheduled cleanup job.

For deployment, use the repository/project deployment configuration so Wrangler deploys the `public/` directory together with `worker.js`. Do not use the dashboard **Edit code** preview as the deployment mechanism for this project.


## Privacy hardening (18.4.0)
- Account deletion requires an authenticated session and password confirmation.
- Active Pro subscriptions must be cancelled before account deletion.
- Account deletion removes account sessions, job history, linked feedback, subscription records and checkout locks from D1.
- Automated retention removes old jobs (90d), feedback (180d), webhook events (90d), rate-limit rows (2d) and anonymous usage counters (7d).
- Browser-first source files are not uploaded by the application workflow.

## V18.4.0 Human Login / Anti-Bot hardening
- Cloudflare Turnstile is mandatory for both account registration and sign-in when deployed. The Worker fails closed if `TURNSTILE_SECRET, RESEND_API_KEY and FROM_EMAIL` is missing, so auth cannot silently fall back to password-only mode.
- Login is protected by IP, email-hash, and email+IP-hash throttles; registration has IP and email-hash throttles.
- Turnstile tokens are never stored or logged by the application.
- Configure both `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET, RESEND_API_KEY and FROM_EMAIL` in production. The site key is public; the secret must remain a Worker secret.
- This blocks automated/bot login attempts, but no system can guarantee that a bot cannot sign in using a real user's stolen password. Email verification/MFA is the next layer if you need stronger account-ownership assurance.


## V18.4 UI upgrade
The V18.4 build adds a responsive professional UI layer: glass navigation, clearer tool cards, improved workspace states, mobile quick navigation, refined account/auth modals, pricing cards, and responsive tool-page layouts. Security/authentication functionality from V18.3.2 is retained.


## V18.4.1 Image to Text OCR
- Added `/tools/image-to-text.html` with browser-based OCR.
- Supports batch images, multiple languages, preprocessing, copy, TXT/DOCX/PDF export.
- OCR source images are processed in the browser; review extracted text before relying on it for important documents.


## V18.7.0 Production Hardening

- Image-to-Text OCR is integrated with `/api/jobs/reserve` and `/api/jobs/complete`, so OCR runs count against the same daily usage allowance as other tools.
- OCR enforces a 50 MB compressed-file limit, a 40 million decoded-pixel safety limit, a 50-image batch limit, and releases decoded image/canvas memory after each file.
- Tesseract.js is pinned to version 5.1.1, and the production CSP explicitly permits its required jsDelivr network loading.
- Unicode PDF export renders extracted text through the browser canvas before embedding each page as an image in the PDF. This preserves the visual appearance of Hindi, Arabic and other complex scripts, although the resulting PDF text is not selectable. TXT/DOCX remain the preferred editable Unicode exports.
- OCR preview object URLs are revoked quickly and the file input is reset after selection.
- Production checklist: configure `AUTH_PEPPER`, `TURNSTILE_SECRET, RESEND_API_KEY and FROM_EMAIL`, and `TURNSTILE_SITE_KEY`; deploy the current D1 migrations before release.


## Email verification (V18.7)
Production registration requires email verification. Configure `RESEND_API_KEY` and `FROM_EMAIL` as Wrangler secrets/vars before enabling registration. Verification tokens are single-use, hashed at rest, and expire after 24 hours. Unverified accounts cannot create sessions or sign in. Apply migration `0004_email_verification.sql`.


## V18.8 security additions
- Password reset uses single-use, hashed, 1-hour tokens stored in D1.
- Reset invalidates all existing sessions after a successful password change.
- Configure `RESEND_API_KEY` and `FROM_EMAIL` for password reset email delivery.
- Reset requests use generic responses to reduce account enumeration.


## V19.1 security hardening
- Removed inline HTML event-handler attributes and migrated UI actions to delegated, CSP-safe listeners.
- CSP no longer uses `script-src 'unsafe-inline'`; executable inline scripts are allowlisted by SHA-256 hashes.
- Added `script-src-attr 'none'` to block inline event-handler attributes.
- Updated security headers and health version to 19.0.0-production.
- Accessibility action handling remains centralized in `/assets/a11y.js`.


## V19.1 hardening
- WCAG-oriented focus, touch-target and reduced-motion improvements.
- OCR and tool-page inline event assignments reduced in the canonical implementation.
- Password-reset completion is rate-limited server-side in addition to request throttling.
- Reset form enforces 8–128 character bounds in the browser; server remains authoritative.
- Mobile tool containers and primary controls use safer touch-target sizing.


## V21.0 production hardening
- Added scheduled billing-state reconciliation for subscription rows already linked to users; stale local plan/status/cancel flags are corrected from the authoritative stored subscription record.
- Added MFA-ready D1 tables for encrypted TOTP secret storage and one-time recovery-code hashes. MFA activation/login UX is intentionally not enabled until the corresponding encryption key and verification flow are deployed.
- Added Cross-Origin-Opener-Policy and Cross-Origin-Resource-Policy security headers.
- Health/version marker is `20.0.0-production`.

## V21.0 production hardening
- Added optional TOTP authenticator-app MFA with encrypted-at-rest MFA secret storage.
- MFA login uses a short-lived, single-use challenge with bounded attempts.
- Added MFA setup/enable/disable API routes and account controls.
- Billing reconciliation now queries the authoritative Razorpay subscription endpoint when Razorpay credentials are configured, with a bounded batch per scheduled run.
- Add `MFA_ENCRYPTION_KEY` as a 32-byte base64 deployment secret before enabling MFA. Generate one with a cryptographically secure random generator; do not commit it to source control.
- Apply `migrations/0007_mfa_challenges.sql` after the previous migrations.
- MFA is optional; existing accounts continue to work without it.

## Production smoke test

After deployment, verify these flows on a real Android/iOS device and one desktop browser:

1. `/health` returns HTTP 200 and version `21.0.0-production` (or the deployed Worker version).
2. Static pages load without CSP errors in the browser console.
3. Register -> email verification -> sign in works.
4. Wrong password, expired verification token, and expired reset token fail safely.
5. Enable MFA -> scan/copy TOTP secret -> verify code -> sign out -> sign in -> MFA challenge -> successful verification.
6. Disable MFA requires the account password and current TOTP code.
7. Job reservation/complete enforces the server-side tool allowlist and quota.
8. Pro checkout/cancel/webhook paths work only with configured Razorpay secrets; scheduled reconciliation updates stale subscription state.
9. Account deletion removes the authenticated account data and rejects subsequent authenticated requests.
10. Test Chrome Android at narrow width, including file picker, drag/drop fallback, OCR, PDF tools, and download actions.

Do not test production billing with real money until Razorpay webhook signing, plan ID, and reconciliation secrets/configuration have been verified.
