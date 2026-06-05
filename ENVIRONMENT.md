# Zyoris Mail — Environment Variables

Copy `.env.example` to `.env.local` for development. Set the same keys in **Vercel → Project → Settings → Environment Variables** for production.

## Required

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `development` or `production` |
| `NEXTAUTH_URL` | Public app URL (e.g. `https://mail.zyoris.com`) |
| `NEXTAUTH_SECRET` | Min 32 characters; session signing secret |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `ENCRYPTION_KEY` | 32-byte hex string for mailbox password encryption |

## Email outbound

| Variable | Description |
|----------|-------------|
| `EMAIL_PROVIDER` | `RESEND`, `MAILGUN`, or `SMTP` |
| `FROM_EMAIL` | Default From address (e.g. `mail@zyoris.com`) |
| `RESEND_API_KEY` | Resend API key (if provider is RESEND) |
| `MAILGUN_API_KEY` | Mailgun key (if MAILGUN) |
| `MAILGUN_DOMAIN` | Mailgun domain |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | SMTP fallback |

## Inbound webhooks

| Variable | Description |
|----------|-------------|
| `RESEND_WEBHOOK_SECRET` | Resend webhook signing secret |
| `MAILGUN_WEBHOOK_SIGNING_KEY` | Mailgun webhook signature key |

## Queue (scheduled send)

| Variable | Description |
|----------|-------------|
| `REDIS_URL` | Upstash Redis TLS URL (`rediss://...`) |

Run worker separately: `npm run worker:mail`

## Object storage (attachments)

| Variable | Description |
|----------|-------------|
| `STORAGE_ENDPOINT` | R2/S3 endpoint URL |
| `STORAGE_REGION` | `auto` for R2 |
| `STORAGE_BUCKET` | Bucket name |
| `STORAGE_ACCESS_KEY` | R2 access key id |
| `STORAGE_SECRET_KEY` | R2 secret |

## Bootstrap super admin

| Variable | Description |
|----------|-------------|
| `SUPER_ADMIN_EMAIL` | Initial platform admin email |
| `SUPER_ADMIN_PASSWORD` | Initial password (change after first login) |
| `SUPER_ADMIN_NAME` | Display name |

Run once per environment: `npm run seed:admin`

## CSRF

No env var. Browser clients must send header `x-csrf-token` matching the `csrf-token` cookie on POST/PATCH/DELETE to `/api/*` (except auth, health, inbound webhooks, invite accept). The `clientApi` helper in `src/lib/client-api.ts` handles this automatically.
