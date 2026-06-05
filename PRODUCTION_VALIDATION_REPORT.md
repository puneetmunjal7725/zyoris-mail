# Zyoris Mail — Production Validation Report

**Date:** 2026-06-05  
**Validator:** Automated (`scripts/validate-production.mjs`) + manual API checks

## Vercel migration proof

| Check | Result |
|-------|--------|
| Old project `prj_bRcrQ1RlxGN7eDz1rOY7Y137DoGQ` | **404** (deleted) |
| New project `prj_9Kgnpwy4BlVGxZaOtkUEoMxxNpxp` | Active |
| `zyoris-mail.vercel.app` alias | Reassigned to **new** deployment URL |
| CLI account | `work.navleensingh@gmail.com` / team `navleen-s-projects` |

## URLs

| URL | Status |
|-----|--------|
| https://zyoris-mail-23ibq6o4l-navleen-s-projects.vercel.app | Production deployment (direct) |
| https://zyoris-mail.vercel.app | Alias → new deployment |
| https://mail.zyoris.com | **DNS NXDOMAIN** — not reachable |
| https://zyoris.com | **GitHub Pages** (not this app) |

## Automated smoke tests (new deployment)

```
PASS health 200
PASS signup rejects invalid 400
PASS login page 200
PASS signup page 200
4/4 checks passed
```

Command: `node scripts/validate-production.mjs https://zyoris-mail-23ibq6o4l-navleen-s-projects.vercel.app`

## Feature validation

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Health API | Pass | `{"ok":true}` |
| 2 | Signup flow | **Fail** | POST `/api/auth/signup` → **500** (invalid/placeholder `MONGODB_URI`) |
| 3 | Login flow | Blocked | Requires DB + seeded user |
| 4 | Organization creation | Blocked | Part of signup |
| 5 | Mailbox creation | Blocked | Requires auth + DB |
| 6 | Alias creation | Blocked | Requires auth + DB |
| 7 | Domain verification | Blocked | Requires auth + DB |
| 8 | Inbound email | Blocked | Resend + DNS + DB |
| 9 | Outbound email | Blocked | Resend API key |
| 10 | Attachment uploads | Blocked | R2 + auth |
| 11 | Scheduled emails | Blocked | Redis + worker |
| 12 | RBAC | Not tested | Requires users in DB |
| 13 | Admin dashboard | Not tested | Requires SUPER_ADMIN seed |
| 14 | Billing | Not tested | Requires auth |

## Environment variables (production)

Set on new project via `scripts/push-vercel-env.mjs`:

- `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `ENCRYPTION_KEY`, `EMAIL_PROVIDER`, `FROM_EMAIL`
- `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_NAME`, `SUPER_ADMIN_PASSWORD`, `NODE_ENV`
- `MONGODB_URI` — **placeholder** (`REPLACE_USER` / `REPLACE_PASS`) → causes signup 500

Missing (not set):

- `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`
- `REDIS_URL`
- `STORAGE_*`

## Verdict

**Not production-complete.** App builds and serves static/auth validation routes on the **correct new Vercel project**, but **mail.zyoris.com is not live**, **MongoDB is not connected**, and **email providers are not configured**.

## Evidence commands (re-run locally)

```bash
# Old project gone
curl -s -o /dev/null -w "%{http_code}" https://api.vercel.com/v9/projects/prj_bRcrQ1RlxGN7eDz1rOY7Y137DoGQ -H "Authorization: Bearer $VERCEL_TOKEN"

# New deployment health
node scripts/validate-production.mjs https://zyoris-mail.vercel.app

# DNS
nslookup mail.zyoris.com 8.8.8.8
```
