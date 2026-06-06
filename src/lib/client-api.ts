"use client";

function getCsrfToken() {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|;\s*)csrf-token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

export async function clientApi<T = unknown>(url: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const method = (init.method || "GET").toUpperCase();
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    headers.set("x-csrf-token", getCsrfToken());
  }

  const res = await fetch(url, { ...init, headers, credentials: "include" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = (data as { error?: unknown }).error;
    let message = `Request failed (${res.status})`;
    if (typeof err === "string") message = err;
    else if (err && typeof err === "object" && "formErrors" in (err as object)) {
      const flat = err as { formErrors?: string[]; fieldErrors?: Record<string, string[]> };
      const parts = [...(flat.formErrors || []), ...Object.values(flat.fieldErrors || {}).flat()];
      if (parts.length) message = parts.join(". ");
    } else if (err && typeof err === "object") {
      message = JSON.stringify(err);
    }
    throw new Error(message);
  }
  return data as T;
}
