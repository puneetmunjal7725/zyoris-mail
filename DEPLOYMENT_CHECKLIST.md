# Zyoris Mail — Deployment Checklist

## Vercel (authenticated CLI account)

- [x] Confirm CLI user: `vercel whoami` → `worknavleensingh-8981` (`work.navleensingh@gmail.com`)
- [x] Remove legacy project `prj_bRcrQ1RlxGN7eDz1rOY7Y137DoGQ` (returns **404** via API)
- [x] Create fresh project `zyoris-mail` → `prj_9Kgnpwy4BlVGxZaOtkUEoMxxNpxp`
- [x] Link repo folder: `.vercel/project.json` updated
- [x] Production env vars set (see `npx vercel env ls production`)
- [x] Disable SSO deployment protection on new project
- [x] Production deploy succeeded (build exit 0)
- [ ] Connect GitHub repo in Vercel UI (CLI connect failed for private repo)
- [ ] Assign/point `zyoris-mail.vercel.app` to **new** project if still serving stale deployment

## DNS (GoDaddy — `ns55.domaincontrol.com`)

- [ ] **mail** — CNAME → `cname.vercel-dns.com` (required for `mail.zyoris.com`)
- [ ] **@** — A `76.76.21.21` *or* keep GitHub Pages and use only `mail` subdomain for app
- [ ] Verify: `nslookup mail.zyoris.com 8.8.8.8` resolves

## MongoDB Atlas

- [ ] Create M0 cluster + database user
- [ ] Allow `0.0.0.0/0` (or Vercel IPs)
- [ ] Set `MONGODB_URI` in Vercel production
- [ ] Run `MONGODB_URI=... npm run seed:admin`
- [ ] Redeploy after URI change

## Resend

- [ ] Verify domain `zyoris.com`
- [ ] `RESEND_API_KEY` + `RESEND_WEBHOOK_SECRET` in Vercel
- [ ] Inbound webhook: `https://mail.zyoris.com/api/emails/inbound/resend`

## Upstash + worker

- [ ] `REDIS_URL` in Vercel
- [ ] Deploy worker: `npm run worker:mail` (Railway/Render/Docker)

## Cloudflare R2

- [ ] Bucket + `STORAGE_*` env vars in Vercel

## Post-deploy validation

- [ ] `node scripts/validate-production.mjs https://<production-url>`
- [ ] Signup → OTP → login on production
- [ ] Send/receive test email
