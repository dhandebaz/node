import { getSupabaseBrowser } from "@/lib/supabase/client";
import { SessionExpiredError } from "@/lib/api/errors";

type FetchOptions = RequestInit & { retry?: boolean };

export async function fetchWithAuth<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const supabase = getSupabaseBrowser();
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
    }
  });

  if (response.status === 401) {
    if (options.retry) {
      throw new SessionExpiredError();
    }
    const refreshed = await supabase.auth.refreshSession();
    const nextToken = refreshed.data.session?.access_token;
    if (!nextToken) {
      throw new SessionExpiredError();
    }
    return fetchWithAuth<T>(url, { ...options, retry: true, headers: { ...(options.headers || {}), Authorization: `Bearer ${nextToken}` } });
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.error || "Request failed");
  }

  return response.json();
}

export async function postWithAuth<T>(url: string, body: any, options: FetchOptions = {}): Promise<T> {
  return fetchWithAuth<T>(url, {
    ...options,
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function putWithAuth<T>(url: string, body: any, options: FetchOptions = {}): Promise<T> {
  return fetchWithAuth<T>(url, {
    ...options,
    method: "PUT",
    body: JSON.stringify(body),
  });
}
