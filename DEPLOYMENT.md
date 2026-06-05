# Zyoris Mail — Production Deployment

## 1. MongoDB Atlas (Free)
1. Create M0 cluster.
2. Create DB user and allow `0.0.0.0/0` (or Vercel IP ranges).
3. Copy connection string to `MONGODB_URI`.

## 2. Upstash Redis (Free)
1. Create Redis database.
2. Copy `REDIS_URL` (TLS URL).

## 3. Cloudflare R2 (Free tier)
1. Create bucket `zyoris-mail`.
2. Create API token with read/write.
3. Set `STORAGE_*` env vars.

## 4. Resend (Free tier)
1. Verify sending domain `zyoris.com`.
2. Create API key → `RESEND_API_KEY`.
3. Configure inbound/webhook URL:
   - `https://mail.zyoris.com/api/emails/inbound/resend`
4. Set `RESEND_WEBHOOK_SECRET`.

## 5. Vercel
1. Import GitHub repo.
2. Add all env vars from `.env.example`.
3. Deploy production branch.
4. Set custom domain `mail.zyoris.com` (recommended subdomain for mail app).

## 6. DNS (zyoris.com)

**Current registrar:** GoDaddy (`ns55.domaincontrol.com`). Use GoDaddy DNS manager (or move NS to Cloudflare).

| Type | Name | Value |
|------|------|-------|
| CNAME | mail | cname.vercel-dns.com |
| TXT | @ | SPF record for Resend |
| TXT | zyoris._domainkey | DKIM from Resend |
| TXT | _dmarc | v=DMARC1; p=none |
| MX | @ | Resend/Mailgun MX targets |

## 7. Worker (scheduled email)
Run BullMQ worker separately (Railway/Render free tier or Docker):

```bash
npm run worker:mail
```

## 8. Seed super admin

```bash
npm run seed:admin
```

## 9. Smoke test
- Signup → OTP verify → Login
- Add domain → Verify DNS
- Create mailbox → Send email
- Confirm inbound webhook delivers to inbox
