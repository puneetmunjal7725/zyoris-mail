# Migrates Zyoris Mail to a fresh Vercel project under the currently authenticated CLI account.
# Usage: powershell -ExecutionPolicy Bypass -File scripts/migrate-vercel.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "Authenticated Vercel user:"
npx vercel whoami

Write-Host "`nBacking up production env..."
if (Test-Path .env.production.backup) { Remove-Item .env.production.backup -Force }
npx vercel env pull .env.production.backup --environment=production --yes

Write-Host "`nUnlinking local project..."
if (Test-Path .vercel) { npx vercel unlink --yes }

Write-Host "`nRemoving legacy project (if exists)..."
npx vercel project rm zyoris-mail --yes 2>$null

Write-Host "`nLinking new project..."
npx vercel link --yes --project zyoris-mail

Write-Host "`nRestoring env vars from backup..."
Get-Content .env.production.backup | ForEach-Object {
  if ($_ -match '^\s*([A-Z0-9_]+)=(.*)$' -and $matches[1] -notmatch '^VERCEL|^TURBO|^NX_') {
    $name = $matches[1]
    $val = $matches[2].Trim('"')
    if ($val.Length -gt 0) {
      $val | npx vercel env add $name production --force 2>$null | Out-Null
      $val | npx vercel env add $name preview --force 2>$null | Out-Null
      $val | npx vercel env add $name development --force 2>$null | Out-Null
      Write-Host "  set $name"
    }
  }
}

Write-Host "`nAdding domains..."
npx vercel domains add mail.zyoris.com 2>$null
npx vercel domains add zyoris.com 2>$null

Write-Host "`nDeploying production..."
npx vercel deploy --prod --yes

Write-Host "`nDone. Verify: npx vercel project ls"
