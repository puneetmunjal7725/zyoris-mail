# Adds minimum Vercel env vars for Zyoris Mail (run once after vercel link).
# Override MONGODB_URI and provider keys with your production values.

$vars = @{
  NODE_ENV = "production"
  NEXTAUTH_SECRET = "zyoris-mail-prod-secret-change-in-dashboard-32"
  NEXTAUTH_URL = "https://mail.zyoris.com"
  MONGODB_URI = "mongodb+srv://REPLACE_USER:REPLACE_PASS@cluster0.mongodb.net/zyoris-mail?retryWrites=true&w=majority"
  ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef"
  EMAIL_PROVIDER = "RESEND"
  FROM_EMAIL = "mail@zyoris.com"
  REDIS_URL = "rediss://default:REPLACE@REPLACE.upstash.io:6379"
  SUPER_ADMIN_EMAIL = "admin@zyoris.com"
  SUPER_ADMIN_PASSWORD = "ChangeMeNow123!"
  SUPER_ADMIN_NAME = "Zyoris Super Admin"
}

foreach ($key in $vars.Keys) {
  $value = $vars[$key]
  $value | npx vercel env add $key production --force 2>&1
  $value | npx vercel env add $key preview --force 2>&1
  $value | npx vercel env add $key development --force 2>&1
}

Write-Host "Done. Update MONGODB_URI, REDIS_URL, RESEND_API_KEY, and STORAGE_* in the Vercel dashboard."
