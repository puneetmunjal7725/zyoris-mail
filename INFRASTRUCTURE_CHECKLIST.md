# Zyoris Mail — Infrastructure Checklist

| Service | Purpose | Status | Owner action |
|---------|---------|--------|--------------|
| **Vercel** `navleen-s-projects/zyoris-mail` | App hosting | Deployed | Optional: login as Puneet account if different from Navleen |
| **MongoDB Atlas** | Primary DB | **Not connected** (placeholder URI) | Provide `MONGODB_URI` |
| **GoDaddy DNS** | `zyoris.com` zone | **mail** record missing | Add CNAME `mail` → `cname.vercel-dns.com` |
| **Resend** | Outbound + inbound | Not configured | API key + domain verify |
| **Upstash Redis** | Queues / scheduled mail | Not configured | `REDIS_URL` |
| **Cloudflare R2** | Attachments | Not configured | `STORAGE_*` vars |
| **BullMQ worker** | Scheduled send | Not hosted | Separate process + Redis |

## DNS detail (from Vercel domain API)

- Registrar nameservers: `ns55.domaincontrol.com`, `ns56.domaincontrol.com` (GoDaddy)
- `mail.zyoris.com`: **misconfigured** — no public DNS record
- Recommended CNAME: `mail` → `cname.vercel-dns.com`
- Apex `zyoris.com` currently points to **GitHub Pages** (`185.199.108.153` etc.)

## Credential matrix

| Credential | Required for |
|------------|----------------|
| `MONGODB_URI` | Signup, login, all data |
| `NEXTAUTH_SECRET` | Sessions (set on Vercel) |
| `RESEND_API_KEY` | Outbound email |
| `RESEND_WEBHOOK_SECRET` | Inbound email |
| `REDIS_URL` | Scheduled email queue |
| `STORAGE_*` | Attachment upload |
| GoDaddy login | DNS for `mail.zyoris.com` |
