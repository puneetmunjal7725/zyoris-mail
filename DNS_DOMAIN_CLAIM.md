# Claim zyoris.com on your Vercel account

Your dashboard (`puneetmunjal7725-2741`) shows the domain is registered on another Vercel account. Add this **TXT** record in **GoDaddy DNS** for `zyoris.com`, then click **Verify & Claim** in Vercel.

## Step 1 — Ownership TXT (required once)

| Type | Host / Name | Value | TTL |
|------|-------------|-------|-----|
| **TXT** | `_vercel` | `vc-domain-verify=zyoris.com,f577717e8f115767ebe7` | 600 (or default) |

In GoDaddy:
1. Go to **DNS** → **Manage DNS** for `zyoris.com`
2. **Add** → Type **TXT**
3. Name: `_vercel` (GoDaddy may show `_vercel.zyoris.com`)
4. Value: paste the full string above (no quotes)
5. Save → wait 5–30 minutes → **Verify & Claim** in Vercel

You can remove this TXT record after verification succeeds.

## Step 2 — Mail app subdomain (after claim)

| Type | Host | Value |
|------|------|-------|
| **CNAME** | `mail` | `cname.vercel-dns.com` |

Then in Vercel project **zyoris-mail** → Domains → add `mail.zyoris.com`.

Set env `NEXTAUTH_URL=https://mail.zyoris.com` and redeploy.

## Step 3 — Optional apex

If you want `zyoris.com` on Vercel (instead of GitHub Pages):

| Type | Host | Value |
|------|------|-------|
| **A** | `@` | `76.76.21.21` |

Or keep apex on GitHub Pages and only use `mail.zyoris.com` for Zyoris Mail.

## Verify DNS propagation

```powershell
nslookup -type=TXT _vercel.zyoris.com 8.8.8.8
nslookup mail.zyoris.com 8.8.8.8
```

When TXT is visible, Vercel domain claim will succeed.
