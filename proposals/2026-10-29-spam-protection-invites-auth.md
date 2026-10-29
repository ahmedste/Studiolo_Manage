# Brief: the `example.test` contacts in Loops, and spam protection for requests, sign-up and sign-in

Status: proposal · 29 Oct 2026 · not applied to `studiolo`

Based on `studiolo` at `e5bf930` (main, 29 Oct 2026). Patch: [`2026-10-29-no-loops-in-tests.patch`](2026-10-29-no-loops-in-tests.patch).

## 1. The `operator-retry-…@example.test` contacts are not spam

They come from our own integration test, not from a bot.

- `tests/integration/database-contract.test.ts:119` makes the address with `uniqueEmail("operator-retry")`. `tests/support/principals.ts` builds it as `operator-retry-<uuid>@example.test`.
- The test runs the real invite command, `scripts/invite.mjs`, with `env: process.env` (lines 111–116).
- `npm run test:integration` starts Node with `--env-file-if-exists=.env.local` (`package.json:22`). Your `.env.local` holds the live `LOOPS_API_KEY`, which the invite command needs.
- So every local integration run creates an invitation, and `notifyInvited` (`scripts/invite-core.mjs`) sends Loops an `invited` event for that address. The contact gets `source: studiolo-invite`. Loops' `invited` workflow, or the transactional invitation if `LOOPS_INVITE_TRANSACTIONAL_ID` is set, then tries to email a `.test` address, which can never receive mail.
- The e2e runner already blanks the Loops keys (`scripts/run-e2e.mjs:78`). Vitest does not. CI is safe because its integration job has no Loops key.

**How to confirm in Loops:** the junk contacts have `source = studiolo-invite` and an `invited` event, not `studiolo-request` / `invitation_requested`. Each one appeared right after someone ran `npm run test:integration` locally.

**Why it matters:** every attempted send to a `.test` address can be logged as a bounce, and bounces hurt the sender reputation of the domain that sends your real invitations.

### Fix (patch, verified in isolation)

`tests/support/no-live-services.ts` is a Vitest `setupFiles` entry in `vitest.config.ts`. It blanks `LOOPS_API_KEY`, `LOOPS_WAITLIST_LIST_ID` and `LOOPS_INVITE_TRANSACTIONAL_ID` in every worker, so tests and any script a test starts never see the live key. This follows the same pattern as `TRIGGER_SECRET_KEY = ""` in `tests/support/test-database/worker-setup.ts`. The branches config merges the root config, so it is covered too. No unit test reads Loops settings from `process.env`: they pass their own key and fetch stub. The patch also adds a sentence to `production-cutover.md`.

Verified: a scratch Vitest 5.0.1 project with a fake `.env.local` and a spawned child script.
- Without the setup file, the child sees the key (the leak reproduces).
- With it, the child sees `""`.
- A test can still set its own key afterwards.

**Not run:** the `studiolo` suites. `npm ci` fails in this container under Node 22, and the repo targets Node 24. Run `npm run test:unit` and `npm run test:integration` before merging.

### Owner actions

1. Apply the patch on a branch in `studiolo` and run the two suites above.
2. In Loops (Audience), filter emails containing `example.test` and delete those contacts.
3. Check Loops' sending or bounce stats. If the junk contacts show bounces, they stop once the patch is in.

## 2. Spam protection: what exists and what to add

### Request an invitation (`POST /api/invitation-requests`)

**Already in place** (`src/app/api/invitation-requests/route.ts`, backend guide "Marketing contacts (Loops)"):
- An `APP_ORIGIN` check.
- A 2 KB body limit and validation.
- A honeypot field, `hp_note`.
- An in-memory limit: 5 an hour per IP and 3 a day per address.
- The Vercel Firewall rule: 10 per 60 s per IP, then 403.
- Each Loops workflow sends once per contact.

**Gap:** a script that rotates IPs and uses real addresses can still put strangers on the Waiting List. Each of them gets a "You're on the list" email they never asked for, which leads to spam complaints against your sender domain.

**Add: Cloudflare Turnstile** (free; Cloudflare is already in the stack). `production-cutover.md` already names it as the next step.
- The form renders the Turnstile widget in Managed or Invisible mode. Its token goes in the JSON body (for example `turnstileToken`). Raise the 2 KB limit slightly, because tokens are up to about 2 KB.
- After the honeypot check and before the limiter, the route POSTs `secret`, `response` and `remoteip` to `https://challenges.cloudflare.com/turnstile/v0/siteverify`.
- Fail closed: a missing or invalid token answers `403 { kind: "denied" }`. A timeout or a Cloudflare outage answers `503 { kind: "unavailable" }`, which the form already handles.
- New settings: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`. Without the secret, the check is skipped outside production and the route refuses in production, so it cannot ship half-configured.
- Tests: use Cloudflare's published test keys (always-pass and always-fail) in unit tests. The e2e runner sets the always-pass pair.

**Optional:** at parse time, drop addresses on reserved domains (`.test`, `.example`, `.invalid`, `.localhost`, `example.com/net/org`) and on a short disposable-domain list. Answer `{ kind: "sent" }`, as the honeypot does.

### Sign-up (getting an account)

Studiolo is invite-only, so an account cannot be created without an invitation. `admit` (`src/features/identity/admission.ts`) only redeems an active invitation. Uninvited people reach "This email isn't invited yet".

**Gap:** Neon Auth itself still creates a `neon_auth.user` row for anyone who verifies a code or signs in with Google. It is junk data, not access.

**Option (owner decision): Neon Auth's `user.before_create` webhook.** It is blocking and fail-closed (Neon docs, "Auth › Webhooks").
- A route such as `/api/webhooks/neon-auth` verifies the Ed25519 signature.
- It answers `{ allowed: true }` only when an active invitation exists for the email. Otherwise it answers `{ allowed: false, error_code: "INVITE_REQUIRED" }`.
- Trade-off: uninvited people would get an error at sign-in instead of the friendly Access screen with "Request an invitation". The sign-in form would need to map `INVITE_REQUIRED` to that screen.
- Also, if the endpoint is down, all sign-ups fail.
- Recommendation: not yet. Revisit if junk `neon_auth.user` rows grow.

### Sign-in and password recovery (`/api/auth/*`, proxied to Neon Auth)

**Gap:** anyone can make Studiolo email a sign-in code or a reset code to any address, and can try passwords against `sign-in/email` as often as they like.
- That enables email bombing of strangers from your sender address, and brute force.
- It also uses up the shared Neon sender's limits: the Neon docs say the shared SMTP is rate-limited.
- No firewall rule covers these paths today. All browser calls go through the same-origin proxy `src/app/api/auth/[...path]/route.ts`, so one Vercel rule can cover them.

**Add, in this order:**

1. **Vercel Firewall rate-limit rules** (owner action, no code). Same shape as the existing invitation rule; apply each per IP and deny with 403.

   | Rule | Paths | Limit |
   |---|---|---|
   | Code and reset sends | `POST /api/auth/email-otp/send-verification-otp`, `POST /api/auth/forget-password/email-otp` | 5 per 10 min |
   | Sign-in attempts | `POST /api/auth/sign-in/email`, `POST /api/auth/sign-in/email-otp` | 20 per 10 min |

   Before saving, check the exact paths in the browser's network tab. These are Better Auth's standard paths for the client calls in `src/features/identity/auth-form.tsx` (lines 191, 192, 225 and 266).
2. **Neon Auth settings** (owner action, in the production checklist already): use your own SMTP provider or the `send.otp` webhook, set Neon Auth's rate limits, and turn off "Allow Localhost" in production.
3. **Turnstile on the "send code" and password steps.** `AuthForm` adds the widget and sends the token as a header (for example `x-turnstile-token`). The proxy's `POST` verifies it before calling `getNeonAuth().handler().POST` for the three send and password paths. Other paths pass straight through, so Google sign-in and session reads are untouched. This reuses the verify helper from the request route.

### Suggested order

1. Apply the test patch and clean up Loops (today).
2. Add the Vercel rules for `/api/auth/*` (minutes, no code).
3. Add Turnstile to the request form, then to sign-in and recovery (one branch, one shared helper).
4. Decide later on the `user.before_create` allowlist.

## Open decisions for the owner

- Turnstile mode: Managed (sometimes shows a checkbox) or Invisible (never visible, slightly weaker). Recommendation: Managed, because it is shown only to suspicious traffic.
- The `user.before_create` allowlist: whether to block uninvited sign-ups at Neon Auth and give up the Access screen flow.
- The firewall limits above are starting points. Change them if real users hit them.
