export function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const parts = document.cookie.split(";").map((p) => p.trim());
  const cookie = parts.find((p) => p.startsWith("nodebase-csrf-token="));
  if (!cookie) return null;
  const value = cookie.slice("nodebase-csrf-token=".length);
  return value ? decodeURIComponent(value) : null;
}

export function withCsrfHeader(headers?: HeadersInit): HeadersInit | undefined {
  const token = getCsrfToken();
  if (!token) return headers;

  if (!headers) return { "x-csrf-token": token };
  if (headers instanceof Headers) {
    const next = new Headers(headers);
    next.set("x-csrf-token", token);
    return next;
  }
  if (Array.isArray(headers)) {
    return [...headers, ["x-csrf-token", token]];
  }
  return { ...(headers as Record<string, string>), "x-csrf-token": token };
}

