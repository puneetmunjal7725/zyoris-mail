#!/usr/bin/env node
import { readFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { randomBytes } from "crypto";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const file = join(root, "scripts", "vercel-env-production.json");

const base = existsSync(file)
  ? JSON.parse(readFileSync(file, "utf8"))
  : {};

const env = {
  ...base,
  NEXTAUTH_SECRET: base.NEXTAUTH_SECRET || randomBytes(32).toString("hex"),
  SUPER_ADMIN_PASSWORD: base.SUPER_ADMIN_PASSWORD || "ZyorisAdmin2026!",
  MONGODB_URI:
    base.MONGODB_URI ||
    process.env.MONGODB_URI ||
    "mongodb+srv://REPLACE_USER:REPLACE_PASS@cluster0.mongodb.net/zyoris-mail?retryWrites=true&w=majority",
};

for (const target of ["production", "preview", "development"]) {
  for (const [key, value] of Object.entries(env)) {
    if (!value) continue;
    try {
      execSync(`npx vercel env add ${key} ${target} --force`, {
        cwd: root,
        input: String(value),
        stdio: ["pipe", "pipe", "pipe"],
      });
      console.log(`[${target}] ${key}`);
    } catch (e) {
      console.error(`failed ${key} ${target}`, e.message);
    }
  }
}

console.log("Done. Set MONGODB_URI to a real Atlas URI when available.");
