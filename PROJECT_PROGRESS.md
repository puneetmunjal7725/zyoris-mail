# Zyoris Mail — Project Progress

## Completed
- [x] Security: removed fake `/api/domains/verify`, webhook signatures, CSRF middleware, ApiError 401/403
- [x] Auth UI: signup (org name), login, forgot/reset, OTP, accept invite
- [x] Logout + dark mode theme provider
- [x] Full email client UI (folders, reader, reply/reply-all/forward, search, bulk, labels filter)
- [x] Compose with mailbox picker, CC/BCC, schedule, attachments
- [x] Organization settings, users, invitations UI
- [x] Billing plans API + UI
- [x] Admin monitoring dashboard
- [x] Domains UI (auto org id, catch-all)
- [x] Mailboxes/aliases client-side API integration
- [x] Tests: 10 passing (vitest)
- [x] CI: lint + typecheck + test + build
- [x] Production build passes
- [x] Deployment docs (DEPLOYMENT.md, .env.example, vercel.json)

## Pending (requires your cloud accounts)
- [ ] Vercel production deploy + custom domain `mail.zyoris.com`
- [ ] MongoDB Atlas connection in production
- [ ] Upstash Redis in production
- [ ] Cloudflare R2 bucket + credentials
- [ ] Resend domain verification for zyoris.com
- [ ] BullMQ worker hosted (Railway/Render/Docker)
- [ ] DNS records on Cloudflare for zyoris.com

## Blockers
- Deployment to zyoris.com requires your Vercel/Cloudflare/Resend account credentials (not available in this environment).

## Deployment Details
- Recommended app URL: `https://mail.zyoris.com`
- Marketing site can remain on `https://www.zyoris.com`
- Inbound webhook: `https://mail.zyoris.com/api/emails/inbound/resend`
