#!/usr/bin/env node
/**
 * Set MONGODB_URI on Vercel (production + preview) and remove bad entries.
 * Usage: node scripts/set-vercel-mongodb.mjs "mongodb+srv://..."
 */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const uri = process.argv[2]?.trim();
if (!uri || uri.length < 20) {
  console.error("Usage: node scripts/set-vercel-mongodb.mjs \"mongodb+srv://...\"");
  process.exit(1);
}
if (uri.includes("127.0.0.1") || uri.includes("localhost")) {
  console.error("Refusing to set localhost URI on Vercel.");
  process.exit(1);
}

const token = JSON.parse(
  readFileSync(join(process.env.APPDATA, "xdg.data/com.vercel.cli/auth.json"), "utf8"),
).token;
const teamId = "team_W6IOZnpfViqVB1Y7l1JGYzxh";
const projectId = "prj_hXgaUH5BManGZZFvEq4jHMYAR95B";
const base = `https://api.vercel.com/v10/projects/${projectId}/env`;

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

const list = await fetch(`${base}?teamId=${teamId}`, { headers }).then((r) => r.json());
for (const e of list.envs.filter((x) => x.key === "MONGODB_URI")) {
  await fetch(`${base}/${e.id}?teamId=${teamId}`, { method: "DELETE", headers });
  console.log("removed", e.id, e.target);
}

for (const target of ["production", "preview"]) {
  const res = await fetch(`${base}?teamId=${teamId}`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      key: "MONGODB_URI",
      value: uri,
      type: "encrypted",
      target: [target],
    }),
  });
  const body = await res.json();
  if (!res.ok) {
    console.error("failed", target, body);
    process.exit(1);
  }
  console.log("set MONGODB_URI for", target);
}

console.log("Done. Run: npx vercel deploy --prod --yes");
