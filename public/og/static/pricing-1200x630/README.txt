OG Image Placeholder & Implementation Notes — pricing-1200x630

Filename (place a binary image at):
- node\public\og\static\pricing-1200x630\pricing-1200x630.png
- optional: pricing-1200x630.webp (recommended for modern delivery)
- fallback: pricing-1200x630.jpg

Purpose
- Visual preview when a pricing page link is shared on social platforms (Facebook, LinkedIn, Twitter).
- Communicates trust and clarity: short headline + simple subhead + logo.

Image specs
- Recommended size: 1200 x 630 px (1.91:1)
- Safe text area: center 1040 x 430 px (leave ~80px horizontal & ~100px vertical margin)
- File format: PNG for crisp text/logo; WebP for smaller file size where supported
- Color/profile: sRGB
- Max file size: keep under ~200KB where possible to avoid long fetch times

Alt text
- "Nodebase pricing — simple, transparent plans"

Suggested visual layout (concise)
- Background: subtle brand gradient or clean solid color (avoid busy photos behind text)
- Left: logo (10–14% width) or top-left
- Center / Right: headline (short) + optional subhead
- Headline (one line): "Simple, honest pricing"
- Subhead (one short line): "No hidden fees. Pay only for what you use."
- Small footer/label: "Plans for small businesses" or "Start with a 14‑day trial"
- Keep typography large and high contrast; test at small sizes

Text guidance
- Headline: <= 45 characters (single-line preferred)
- Subhead: <= 70 characters
- CTA or label (optional): <= 20 characters (very small)

Accessibility & SEO
- Provide alt text as above.
- Use an absolute URL when referencing in meta tags.

Caching & delivery
- Set long cache TTL for static OG assets (e.g., Cache-Control: public, max-age=604800).
- If you update the image, version the filename or add a query string to bust caches.

Example meta tags (replace domain with production domain)
<meta property="og:type" content="website" />
<meta property="og:title" content="Pricing | Nodebase" />
<meta property="og:description" content="Simple, honest pricing. No hidden fees — pay only for the AI messages you use." />
<meta property="og:url" content="https://yourdomain.com/pricing" />
<meta property="og:image" content="https://yourdomain.com/og/static/pricing-1200x630/pricing-1200x630.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Pricing | Nodebase" />
<meta name="twitter:description" content="Simple, honest pricing. No hidden fees — pay only for the AI messages you use." />
<meta name="twitter:image" content="https://yourdomain.com/og/static/pricing-1200x630/pricing-1200x630.png" />

Testing
- After deploy, validate previews:
  - Twitter Card Validator (for twitter)
  - Facebook Sharing Debugger (for Facebook/WhatsApp/LinkedIn)
- Ensure the preview updates after cache busting (use a new filename or query parameter if needed)

Designer/dev notes
- Keep the file source (SVG, Figma) version-controlled separately. Export PNG/WebP at 1200x630 for production.
- If you implement dynamic OG generation (server-rendered images), keep this static file as a fallback.

Replace this README with the actual binary image at:
node\public\og\static\pricing-1200x630\pricing-1200x630.png
