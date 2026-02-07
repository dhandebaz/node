"use client";

import { motion } from "framer-motion";

export default function Page() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="prose prose-invert prose-lg max-w-none text-brand-bone/80 prose-headings:text-brand-bone prose-strong:text-brand-bone prose-a:text-brand-bone prose-code:text-brand-bone">
      <motion.div
        initial="initial"
        animate="animate"
        variants={stagger}
      >
        <motion.h1 variants={fadeInUp} className="text-4xl font-bold text-brand-bone mb-6 uppercase tracking-tighter">Edge CDN</motion.h1>
        <motion.p variants={fadeInUp} className="lead text-xl text-brand-bone/60 mb-8">
          The Nodebase Content Delivery Network (CDN) caches your content at the edge of our network, ensuring millisecond-latency for users across India.
        </motion.p>

        <motion.h2 variants={fadeInUp} className="text-brand-bone mt-12 uppercase tracking-wide text-lg border-b border-brand-bone/10 pb-2">How It Works</motion.h2>
        <motion.p variants={fadeInUp}>
          When you deploy an application to Nodebase Space, a CDN distribution is automatically created for you.
        </motion.p>
        <motion.ol variants={fadeInUp}>
          <li><strong>Origin:</strong> Your static assets are stored in our Okhla, Delhi Data Center (Origin Server).</li>
          <li><strong>Caching:</strong> When a user requests a file, it is cached at the nearest Point of Presence (PoP).</li>
          <li><strong>Delivery:</strong> Subsequent requests are served directly from the cache, bypassing the origin.</li>
        </motion.ol>

        <motion.h2 variants={fadeInUp} className="text-brand-bone mt-12 uppercase tracking-wide text-lg border-b border-brand-bone/10 pb-2">Features</motion.h2>
        
        <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose mb-12">
          <div className="p-6 rounded-xl bg-brand-bone/5 border border-brand-bone/10">
            <h3 className="text-lg font-bold text-brand-bone mb-2">Brotli & Gzip Compression</h3>
            <p className="text-sm text-brand-bone/60">
              Assets are automatically compressed to reduce transfer size and speed up page loads.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-brand-bone/5 border border-brand-bone/10">
            <h3 className="text-lg font-bold text-brand-bone mb-2">TLS 1.3</h3>
            <p className="text-sm text-brand-bone/60">
              Modern security protocols are enforced by default. We handle certificate renewal automatically.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-brand-bone/5 border border-brand-bone/10">
            <h3 className="text-lg font-bold text-brand-bone mb-2">DDoS Mitigation</h3>
            <p className="text-sm text-brand-bone/60">
              Our edge layer absorbs Layer 3/4 attacks, protecting your origin server from malicious traffic.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-brand-bone/5 border border-brand-bone/10">
            <h3 className="text-lg font-bold text-brand-bone mb-2">Smart Invalidation</h3>
            <p className="text-sm text-brand-bone/60">
              When you redeploy, we automatically invalidate changed assets so users always see the latest version.
            </p>
          </div>
        </motion.div>

        <motion.h2 variants={fadeInUp} className="text-brand-bone mt-12 uppercase tracking-wide text-lg border-b border-brand-bone/10 pb-2">Cache Control</motion.h2>
        <motion.p variants={fadeInUp}>
          You can control caching behavior using standard HTTP headers.
        </motion.p>
        <motion.ul variants={fadeInUp}>
          <li><code>Cache-Control: public, max-age=31536000, immutable</code> - For hashed static assets (images, JS, CSS).</li>
          <li><code>Cache-Control: public, max-age=0, must-revalidate</code> - For HTML files that change frequently.</li>
        </motion.ul>

        <motion.div variants={fadeInUp} className="bg-brand-bone/5 border-l-4 border-brand-saffron p-4 my-6 not-prose">
          <p className="text-sm text-brand-bone/80 m-0">
            <strong>Note:</strong> By default, Nodebase automatically sets optimal headers for Next.js and other frameworks. You usually don't need to configure this manually.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
