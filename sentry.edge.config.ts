import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://832f79bf8b49039202d0e29f52839843@o4511131934588928.ingest.us.sentry.io/4511131936292864",

  // Lowered for high traffic: Reduce CPU and Function invocations by only tracing 10% of requests in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Enable default PII to capture user contexts
  sendDefaultPii: true,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
