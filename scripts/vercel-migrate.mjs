#!/usr/bin/env node
/**
 * Vercel migration helper: backup env, remove domains, recreate link, restore env.
 * Run: node scripts/vercel-migrate.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const authPath = join(
  process.env.APPDATA || "",
  "xdg.data",
  "com.vercel.cli",
  "auth.json"
);

function getToken() {
  const auth = JSON.parse(readFileSync(authPath, "utf8"));
  return auth.token;
}

async function api(path, opts = {}) {
  const res = await fetch(`https://api.vercel.com${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  if (!res.ok) throw new Error(`${res.status} ${path}: ${text}`);
  return json;
}

const TEAM = "team_xmam0xJJ2sQj5DpYV7we1sj6";
const OLD_PROJECT = "prj_bRcrQ1RlxGN7eDz1rOY7Y137DoGQ";
const BACKUP = join(root, "scripts", "vercel-env-backup.json");

async function backupEnv(projectId) {
  const data = await api(
    `/v10/projects/${projectId}/env?decrypt=true&teamId=${TEAM}`
  );
  const out = {};
  for (const e of data.envs || []) {
    if (!e.key || e.value == null || e.value === "") continue;
    if (e.type === "sensitive" && !e.value) continue;
    if (typeof e.value === "string" && e.value.startsWith("eyJ")) {
      // still encrypted blob — skip
      continue;
    }
    out[e.key] = e.value;
  }
  writeFileSync(BACKUP, JSON.stringify(out, null, 2));
  console.log("Backed up keys:", Object.keys(out).join(", ") || "(none decrypted)");
}

async function removeDomains(projectId) {
  const { domains } = await api(`/v9/projects/${projectId}/domains?teamId=${TEAM}`);
  for (const d of domains || []) {
    await api(`/v9/projects/${projectId}/domains/${d.name}?teamId=${TEAM}`, {
      method: "DELETE",
    });
    console.log("Removed domain from project:", d.name);
  }
}

function run(cmd) {
  console.log(">", cmd);
  execSync(cmd, { cwd: root, stdio: "inherit" });
}

async function main() {
  const me = await api("/v2/user");
  console.log("Authenticated:", me.user?.email, me.user?.username);

  if (existsSync(BACKUP)) {
    console.log("Backup already exists, skipping decrypt backup");
  } else {
    await backupEnv(OLD_PROJECT);
  }

  await removeDomains(OLD_PROJECT);

  run("npx vercel project rm zyoris-mail --yes");
  run("npx vercel unlink --yes");
  run("npx vercel link --yes --project zyoris-mail");

  if (existsSync(BACKUP)) {
    const env = JSON.parse(readFileSync(BACKUP, "utf8"));
    for (const [key, value] of Object.entries(env)) {
      if (!value) continue;
      execSync(`npx vercel env add ${key} production --force`, {
        cwd: root,
        input: String(value),
        stdio: ["pipe", "inherit", "inherit"],
      });
      console.log("Restored", key);
    }
  } else {
    run("powershell -ExecutionPolicy Bypass -File scripts/set-vercel-env.ps1");
  }

  run("npx vercel domains add mail.zyoris.com");
  run("npx vercel domains add zyoris.com");
  run("npx vercel deploy --prod --yes");

  const projects = await api(`/v9/projects?teamId=${TEAM}`);
  const proj = (projects.projects || []).find((p) => p.name === "zyoris-mail");
  console.log("\n=== Migration complete ===");
  console.log("Account:", me.user?.email);
  console.log("Team:", TEAM);
  console.log("Project:", proj?.name, proj?.id);
  console.log("URL:", proj?.targets?.production?.url || "(see deploy output)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
