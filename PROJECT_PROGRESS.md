# Zyoris Mail — Project Progress

Last updated: 2026-06-05

## Completed

### Core platform
- [x] Multi-tenant MongoDB models (users, orgs, domains, mailboxes, aliases, emails, threads, attachments, billing, activity logs)
- [x] REST APIs: auth, orgs, users, invitations, domains (real DNS verify), mailboxes, aliases, email folders, send, inbound (Resend/Mailgun), attachments, scheduled mail, billing, admin
- [x] RBAC (SUPER_ADMIN, ORG_ADMIN, USER)
- [x] Docker + GitHub Actions CI (lint, typecheck, test, build)

### Security
- [x] Removed fake `/api/domains/verify` endpoint
- [x] Webhook signature verification (Resend, Mailgun)
- [x] CSRF on mutating `/api/*` routes (Edge-safe token cookie)
- [x] ApiError + `withApi` for consistent 401/403
- [x] Admin stats + monitoring require SUPER_ADMIN / ORG_ADMIN

### Frontend
- [x] Auth: signup (with organizationName), login, forgot/reset password, OTP, accept invite, logout, dark mode
- [x] Email client: inbox, sent, drafts, trash, spam, starred, search, labels, bulk actions, thread view, reader, reply/reply-all/forward
- [x] Compose: mailbox picker, CC/BCC, schedule, attachment upload
- [x] Attachment preview/download in email reader
- [x] Domains, mailboxes, aliases (client API + session)
- [x] Organization settings, users, invitations
- [x] Billing plans UI
- [x] Admin stats + monitoring dashboards
- [x] Zyoris design tokens + responsive shell

### Quality
- [x] Vitest: 10 tests passing (validators, security, routing, health, mailboxes)
- [x] Playwright smoke specs
- [x] Production `npm run build` passes locally and on Vercel

### Deployment
- [x] Vercel project linked: `navleen-s-projects/zyoris-mail`
- [x] Production deploy: **https://zyoris-mail.vercel.app**
- [x] Health check live: `/api/health` → `{"ok":true}`
- [x] Custom domains registered on Vercel project: `mail.zyoris.com`, `zyoris.com`
- [x] `DEPLOYMENT.md`, `.env.example`, `scripts/set-vercel-env.ps1`, `scripts/seed-admin.ts`

## Pending (requires Cloudflare / Atlas / provider credentials)

- [ ] Point DNS at Vercel (see below) — domains added in Vercel but nameservers/DNS must be configured in Cloudflare
- [ ] Replace placeholder `MONGODB_URI` in Vercel with MongoDB Atlas M0 connection string
- [ ] Add `REDIS_URL` (Upstash), `RESEND_API_KEY`, `STORAGE_*` (R2) in Vercel dashboard
- [ ] Run `npm run seed:admin` against production Atlas after URI is set
- [ ] Host BullMQ worker (`npm run worker:mail`) on Railway/Render/Docker
- [ ] Resend: verify `zyoris.com`, configure inbound webhook to production URL
- [ ] Update `NEXTAUTH_URL` to `https://mail.zyoris.com` after DNS propagates

## Blockers

| Blocker | Owner action |
|---------|----------------|
| MongoDB Atlas URI not in Vercel (placeholder) | Add real `MONGODB_URI`; signup/login will fail until fixed |
| Cloudflare DNS for `mail.zyoris.com` | CNAME `mail` → `cname.vercel-dns.com` (or Vercel-provided target) |
| Worker not on Vercel | Scheduled send needs separate Redis + worker process |
| GitHub ↔ Vercel integration | Connect repo in Vercel if you want auto-deploy on push |

## Deployment details

| Item | Value |
|------|--------|
| Vercel team | `navleen-s-projects` |
| Project | `zyoris-mail` |
| Production URL | https://zyoris-mail.vercel.app |
| Recommended mail app URL | https://mail.zyoris.com |
| Marketing (optional) | https://www.zyoris.com → redirect or separate site |
| Inbound webhook | `https://mail.zyoris.com/api/emails/inbound/resend` |
| Region | `bom1` (vercel.json) |
| Inspector | https://vercel.com/navleen-s-projects/zyoris-mail |

### DNS (Cloudflare for zyoris.com)

| Type | Name | Value |
|------|------|-------|
| CNAME | mail | `cname.vercel-dns.com` |
| CNAME | www | `cname.vercel-dns.com` (optional marketing) |
| TXT | @ | SPF from Resend |
| TXT | resend._domainkey | DKIM from Resend |
| TXT | _dmarc | `v=DMARC1; p=none` |
| MX | @ | Resend inbound MX (if using Resend inbound) |

After DNS propagates, set Vercel env `NEXTAUTH_URL=https://mail.zyoris.com` and redeploy.
