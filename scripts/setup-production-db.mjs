#!/usr/bin/env node
/**
 * Production DB setup: provision Atlas (if needed), reset data, seed admin, redeploy.
 */
import { execSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function run(cmd, opts = {}) {
  console.log(">", cmd);
  execSync(cmd, { cwd: root, stdio: "inherit", ...opts });
}

function tryRun(cmd, opts = {}) {
  try {
    run(cmd, opts);
    return true;
  } catch {
    return false;
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function getMongoUri() {
  const pulled = join(root, ".env.vercel.prod");
  if (existsSync(pulled)) {
    const line = readFileSync(pulled, "utf8")
      .split("\n")
      .find((l) => l.startsWith("MONGODB_URI="));
    if (line) {
      const val = line.slice("MONGODB_URI=".length).replace(/^"|"$/g, "");
      if (val && val.length > 20 && !val.includes("localhost")) return val;
    }
  }
  const env = process.env.MONGODB_URI?.trim();
  if (env && env.length > 20 && !env.includes("localhost")) return env;
  return null;
}

console.log("Step 1: Install MongoDB Atlas on Vercel (free tier, Mumbai)...");
const installed = tryRun(
  "npx vercel integration add mongodbatlas/atlas --non-interactive -m clusterTier=FREE -m vercelRegion=bom1 -e production -n zyoris-mail-db --format=json",
);
if (!installed) {
  console.log("Atlas may already be installed or terms need acceptance:");
  console.log(
    "https://vercel.com/puneets-projects-a43040fa/~/integrations/accept-terms/mongodbatlas?source=cli",
  );
}

console.log("Step 2: Wait for Atlas cluster (up to 3 min)...");
for (let i = 0; i < 18; i++) {
  const status = execSync("npx vercel integration ls", { cwd: root, encoding: "utf8" });
  if (status.includes("Available")) {
    console.log("Cluster is available.");
    break;
  }
  if (i === 17) console.log("Cluster still provisioning; continuing anyway.");
  await sleep(10000);
}

console.log("Step 3: Pull production env...");
run("npx vercel env pull .env.vercel.prod --environment=production --yes");

const uri = getMongoUri();
if (!uri) {
  console.error("MONGODB_URI missing. Wait 1-2 min and re-run.");
  process.exit(1);
}

const seedEnv = {
  ...process.env,
  MONGODB_URI: uri,
  SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL || "admin@zyoris.com",
  SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD || "ZyorisAdmin2026!",
  SUPER_ADMIN_NAME: process.env.SUPER_ADMIN_NAME || "Zyoris Super Admin",
};

console.log("Step 4: Wipe old data (skipped if local network cannot reach Atlas)...");
if (!tryRun("npm run db:reset", { env: seedEnv })) {
  console.log("Local db:reset skipped — new Atlas clusters start empty; production uses Atlas directly.");
}

console.log("Step 5: Seed super admin (skipped if local network cannot reach Atlas)...");
if (!tryRun("npm run seed:admin", { env: seedEnv })) {
  console.log("Local seed skipped — sign up on production or allowlist your IP in Atlas Network Access.");
}

console.log("Step 6: Deploy production...");
run("npx vercel deploy --prod --yes");

console.log("Done. Test signup: https://zyoris-mail-nine.vercel.app/signup");
