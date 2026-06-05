import dns from "dns/promises";

type DnsCheckResult = {
  txt: { ok: boolean; message: string };
  spf: { ok: boolean; message: string };
  dkim: { ok: boolean; message: string };
  dmarc: { ok: boolean; message: string };
  mx: { ok: boolean; message: string };
  isVerified: boolean;
};

export async function verifyDomainDns(domain: string, token: string): Promise<DnsCheckResult> {
  const [txtRecords, mxRecords, dmarcTxt, dkimTxt] = await Promise.all([
    dns.resolveTxt(domain).catch(() => [] as string[][]),
    dns.resolveMx(domain).catch(() => [] as { exchange: string; priority: number }[]),
    dns.resolveTxt(`_dmarc.${domain}`).catch(() => [] as string[][]),
    dns.resolveTxt(`zyoris._domainkey.${domain}`).catch(() => [] as string[][]),
  ]);

  const txtValues = txtRecords.map((x) => x.join(""));
  const hasToken = txtValues.some((v) => v.includes(`zyoris-verification=${token}`));
  const spfRecord = txtValues.find((v) => v.toLowerCase().startsWith("v=spf1"));
  const dmarcValue = dmarcTxt.map((x) => x.join("")).find((v) => v.toLowerCase().startsWith("v=dmarc1"));
  const dkimValue = dkimTxt.map((x) => x.join("")).find((v) => v.toLowerCase().includes("k=rsa"));

  const result: DnsCheckResult = {
    txt: { ok: hasToken, message: hasToken ? "TXT verification token found" : "Missing TXT zyoris-verification token" },
    spf: { ok: Boolean(spfRecord), message: spfRecord || "Missing SPF record" },
    dkim: { ok: Boolean(dkimValue), message: dkimValue || "Missing DKIM key at zyoris._domainkey" },
    dmarc: { ok: Boolean(dmarcValue), message: dmarcValue || "Missing DMARC record" },
    mx: { ok: mxRecords.length > 0, message: mxRecords.length ? mxRecords.map((m) => `${m.priority} ${m.exchange}`).join(", ") : "No MX records found" },
    isVerified: false,
  };

  result.isVerified = result.txt.ok && result.spf.ok && result.dkim.ok && result.dmarc.ok && result.mx.ok;
  return result;
}
