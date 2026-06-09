const DOMAIN_RE = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;

export function normalizeDomain(input: string) {
  return input.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
}

export function isValidDomain(input: string) {
  const domain = normalizeDomain(input);
  if (!domain || domain.length > 253) return false;
  if (domain === "zyoris.com") return false;
  return DOMAIN_RE.test(domain);
}

export function domainValidationMessage(input: string) {
  const domain = normalizeDomain(input);
  if (!domain) return "Please enter a valid domain";
  if (domain === "zyoris.com") return "zyoris.com addresses are created during signup";
  if (!DOMAIN_RE.test(domain)) return "Please enter a valid domain";
  return null;
}
