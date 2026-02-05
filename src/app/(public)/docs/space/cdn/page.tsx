import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edge CDN - Nodebase Space Docs",
  description: "Global content delivery network.",
};

export default function Page() {
  return (
    <div className="prose prose-invert prose-lg max-w-none text-zinc-300">
      <h1 className="text-4xl font-bold text-white mb-6">Edge CDN</h1>
      <p className="lead text-xl text-zinc-400 mb-8">
        The Nodebase Content Delivery Network (CDN) caches your content at the edge of our network, ensuring millisecond-latency for users across India.
      </p>

      <h2 className="text-white mt-12">How It Works</h2>
      <p>
        When you deploy an application to Nodebase Space, a CDN distribution is automatically created for you.
      </p>
      <ol>
        <li><strong>Origin:</strong> Your static assets are stored in our Okhla, Delhi Data Center (Origin Server).</li>
        <li><strong>Caching:</strong> When a user requests a file, it is cached at the nearest Point of Presence (PoP).</li>
        <li><strong>Delivery:</strong> Subsequent requests are served directly from the cache, bypassing the origin.</li>
      </ol>

      <h2 className="text-white mt-12">Features</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose mb-12">
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-2">Brotli & Gzip Compression</h3>
          <p className="text-sm text-zinc-400">
            Assets are automatically compressed to reduce transfer size and speed up page loads.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-2">TLS 1.3</h3>
          <p className="text-sm text-zinc-400">
            Modern security protocols are enforced by default. We handle certificate renewal automatically.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-2">DDoS Mitigation</h3>
          <p className="text-sm text-zinc-400">
            Our edge layer absorbs Layer 3/4 attacks, protecting your origin server from malicious traffic.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-2">Smart Invalidation</h3>
          <p className="text-sm text-zinc-400">
            When you redeploy, we automatically invalidate changed assets so users always see the latest version.
          </p>
        </div>
      </div>

      <h2 className="text-white mt-12">Cache Control</h2>
      <p>
        You can control caching behavior using standard HTTP headers.
      </p>
      <ul>
        <li><code>Cache-Control: public, max-age=31536000, immutable</code> - For hashed static assets (images, JS, CSS).</li>
        <li><code>Cache-Control: public, max-age=0, must-revalidate</code> - For HTML files that change frequently.</li>
      </ul>

      <div className="bg-zinc-900 border-l-4 border-brand-saffron p-4 my-6 not-prose">
        <p className="text-sm text-zinc-300 m-0">
          <strong>Note:</strong> By default, Nodebase automatically sets optimal headers for Next.js and other frameworks. You usually don't need to configure this manually.
        </p>
      </div>
    </div>
  );
}
