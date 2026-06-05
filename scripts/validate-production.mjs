#!/usr/bin/env node
/**
 * Production smoke validation for Zyoris Mail.
 * Usage: node scripts/validate-production.mjs https://zyoris-mail.vercel.app
 */
const base = process.argv[2] || "https://zyoris-mail.vercel.app";

const tests = [
  { name: "health", path: "/api/health", expect: (b) => b.ok === true },
  { name: "signup rejects invalid", path: "/api/auth/signup", method: "POST", body: {}, expectStatus: 400 },
  { name: "login page", path: "/login", expectHtml: true },
  { name: "signup page", path: "/signup", expectHtml: true },
];

async function run() {
  console.log("Base URL:", base);
  const results = [];
  for (const t of tests) {
    try {
      const res = await fetch(base + t.path, {
        method: t.method || "GET",
        headers: { "Content-Type": "application/json" },
        body: t.body ? JSON.stringify(t.body) : undefined,
      });
      const text = await res.text();
      let body;
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
      let ok = false;
      if (t.expectStatus) ok = res.status === t.expectStatus;
      else if (t.expect) ok = t.expect(body);
      else if (t.expectHtml) ok = res.ok && String(body).includes("<");
      else ok = res.ok;
      results.push({ name: t.name, ok, status: res.status });
      console.log(ok ? "PASS" : "FAIL", t.name, res.status);
    } catch (e) {
      results.push({ name: t.name, ok: false, error: String(e) });
      console.log("FAIL", t.name, e.message);
    }
  }
  const passed = results.filter((r) => r.ok).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  process.exit(passed === results.length ? 0 : 1);
}

run();
