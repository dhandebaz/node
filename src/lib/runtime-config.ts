const DEFAULT_PRODUCTION_APP_URL = "https://nodebase.space";
const DEFAULT_LOCAL_APP_URL = "http://localhost:3000";

function firstNonEmpty(...values: Array<string | undefined | null>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function normalizeUrl(value: string | undefined | null) {
  const raw = firstNonEmpty(value);
  if (!raw) return null;

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return withProtocol.replace(/\/$/, "");
}

export function getAppUrl() {
  return (
    normalizeUrl(process.env.NEXT_PUBLIC_APP_URL) ||
    normalizeUrl(process.env.APP_URL) ||
    normalizeUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
    normalizeUrl(process.env.VERCEL_URL) ||
    (process.env.NODE_ENV === "development"
      ? DEFAULT_LOCAL_APP_URL
      : DEFAULT_PRODUCTION_APP_URL)
  );
}

export function getAppUrlFromRequest(request: Request) {
  const configuredUrl =
    normalizeUrl(process.env.NEXT_PUBLIC_APP_URL) ||
    normalizeUrl(process.env.APP_URL);

  if (configuredUrl) {
    return configuredUrl;
  }

  const forwardedHost =
    request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!forwardedHost) {
    return getAppUrl();
  }

  const forwardedProto =
    request.headers.get("x-forwarded-proto") ||
    (forwardedHost.includes("localhost") ? "http" : "https");

  return `${forwardedProto}://${forwardedHost}`;
}

export function getRazorpayKeyId() {
  return firstNonEmpty(process.env.RAZORPAY_KEY_ID, process.env.key_id);
}

export function getRazorpayKeySecret() {
  return firstNonEmpty(
    process.env.RAZORPAY_KEY_SECRET,
    process.env.key_secret,
  );
}

export function hasRazorpayCredentials() {
  return Boolean(getRazorpayKeyId() && getRazorpayKeySecret());
}
