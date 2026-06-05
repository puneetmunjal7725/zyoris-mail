# Zyoris Mail

Production-ready multi-tenant business email SaaS built with Next.js 15, MongoDB Atlas, Redis/BullMQ, and S3-compatible storage.

## Features
- Authentication (signup, OTP verification, login, forgot/reset password, logout)
- Organizations, team invites, role management
- Domain onboarding with live DNS verification (TXT, SPF, DKIM, DMARC, MX)
- Mailboxes, aliases, catch-all routing
- Full mail client (inbox, sent, drafts, trash, spam, starred, search, bulk actions)
- Rich compose with Tiptap, attachments, scheduling
- Inbound webhooks (Resend/Mailgun) with signature verification
- Admin analytics and security monitoring
- Billing plans and usage limits (free/growth/enterprise)

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Seed super admin:

```bash
npm run seed:admin
```

Run mail worker:

```bash
npm run worker:mail
```

## Scripts
- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — production server
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript check
- `npm run test` — Vitest unit/integration tests
- `npm run test:e2e` — Playwright E2E
- `npm run worker:mail` — BullMQ scheduled email worker
- `npm run seed:admin` — create SUPER_ADMIN user

## Deployment
See [DEPLOYMENT.md](./DEPLOYMENT.md) for MongoDB Atlas, Upstash, R2, Resend, Vercel, and Cloudflare DNS setup for `zyoris.com`.

## License
Private — Zyoris.
