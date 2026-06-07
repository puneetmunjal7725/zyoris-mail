export function formatMailDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (msgDay.getTime() === todayStart.getTime()) {
    return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }
  if (msgDay.getTime() === yesterdayStart.getTime()) {
    return "Yesterday";
  }
  if (d.getFullYear() === now.getFullYear()) {
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

export function getDateGroupKey(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (msgDay.getTime() === todayStart.getTime()) return "Today";
  if (msgDay.getTime() === yesterdayStart.getTime()) return "Yesterday";
  if (d.getFullYear() === now.getFullYear()) {
    return d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
  }
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function groupEmailsByDate<T extends { createdAt: string }>(emails: T[]) {
  const groups = new Map<string, T[]>();
  for (const email of emails) {
    const key = getDateGroupKey(email.createdAt);
    const list = groups.get(key) || [];
    list.push(email);
    groups.set(key, list);
  }
  return Array.from(groups.entries());
}
