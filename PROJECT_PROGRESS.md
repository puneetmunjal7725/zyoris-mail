# Zyoris Mail — Project Progress

Last updated: 2026-06-05 (post–Vercel migration)

## Completed

- [x] Full application codebase (auth, mail client, org/admin, APIs, security)
- [x] Tests: 10/10 Vitest; build passes
- [x] **Vercel migration** to fresh project under CLI-authenticated account
- [x] Old project removed (`prj_bRcrQ1RlxGN7eDz1rOY7Y137DoGQ` → API 404)
- [x] New project `prj_9Kgnpwy4BlVGxZaOtkUEoMxxNpxp` deployed
- [x] `zyoris-mail.vercel.app` alias → new deployment
- [x] Production smoke: health, pages, invalid signup 400
- [x] Migration/deploy scripts in `scripts/`
- [x] Checklists: `DEPLOYMENT_CHECKLIST.md`, `INFRASTRUCTURE_CHECKLIST.md`, `PRODUCTION_VALIDATION_REPORT.md`

## Pending / blockers

| Blocker | Impact |
|---------|--------|
| **Real `MONGODB_URI` on Vercel** | Signup/login return 500 |
| **GoDaddy DNS: `mail` CNAME** | `mail.zyoris.com` does not resolve |
| **Resend** keys + domain verify | No send/receive |
| **Upstash `REDIS_URL` + worker** | No scheduled mail |
| **R2 `STORAGE_*`** | No attachments in prod |
| **Optional: different Vercel login** | If Puneet’s Vercel ≠ `work.navleensingh@gmail.com`, run `vercel login` |

## Deployment (current)

| Item | Value |
|------|--------|
| Vercel user | `workpuneetkumar-1916` (`work.puneetkumar@gmail.com`) |
| Vercel team | `puneets-projects-a43040fa` (Puneet's projects) |
| Project | `zyoris-mail` |
| Project ID | `prj_hXgaUH5BManGZZFvEq4jHMYAR95B` |
| Production URL | https://zyoris-mail-nine.vercel.app |
| Preview URL pattern | `https://zyoris-mail-<hash>-puneets-projects-a43040fa.vercel.app` |
| Target custom domain | https://mail.zyoris.com (DNS **not** configured) |
| Dashboard | https://vercel.com/puneets-projects-a43040fa/zyoris-mail |

**Previous (wrong) account:** `navleen-s-projects` / `worknavleensingh-8981` — logged out; do not use.

## Manual steps for owner

1. **MongoDB Atlas** — create cluster, set `MONGODB_URI` in Vercel, redeploy, `npm run seed:admin`.
2. **GoDaddy** — add CNAME: `mail` → `cname.vercel-dns.com` (wait up to 48h).
3. **Vercel** — set `NEXTAUTH_URL=https://mail.zyoris.com` after DNS works.
4. **Resend** — verify `zyoris.com`, add API + webhook secrets.
5. **Upstash + R2** — add env vars; deploy worker.
6. If Vercel account should be **Puneet’s** (not Navleen’s email): `npx vercel logout` → `npx vercel login` → re-run `scripts/push-vercel-env.mjs` and redeploy.

## Credentials required from owner

| Credential | Where to get it |
|------------|-----------------|
| `MONGODB_URI` | MongoDB Atlas → Connect |
| GoDaddy account | DNS for `zyoris.com` |
| `RESEND_API_KEY` / webhook secret | resend.com |
| `REDIS_URL` | upstash.com |
| `STORAGE_*` | Cloudflare R2 |
| (Optional) Puneet Vercel login | if current CLI user is wrong |

## Admin bootstrap (after Atlas)

Env on Vercel: `SUPER_ADMIN_EMAIL=admin@zyoris.com`, password set via `scripts/push-vercel-env.mjs` (rotate in dashboard). Run `npm run seed:admin` with production `MONGODB_URI`.
