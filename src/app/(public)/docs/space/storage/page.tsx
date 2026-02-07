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
        <motion.h1 variants={fadeInUp} className="text-4xl font-bold text-brand-bone mb-6 uppercase tracking-tighter">Object Storage</motion.h1>
        <motion.p variants={fadeInUp} className="lead text-xl text-brand-bone/60 mb-8">
          Nodebase Object Storage is an S3-compatible service for storing and retrieving any amount of data. It is designed for 99.99% durability and low-latency access within India.
        </motion.p>

        <motion.div variants={fadeInUp} className="not-prose bg-brand-bone/5 border border-brand-bone/10 rounded-lg p-4 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-brand-saffron/20 text-brand-saffron px-2 py-1 rounded text-xs font-bold">ENDPOINT</span>
            <code className="text-brand-bone">https://s3.ind-del-1.nodebase.space</code>
          </div>
          <p className="text-sm text-brand-bone/50 m-0">Region: <code className="text-brand-bone/60">ind-del-1</code></p>
        </motion.div>

        <motion.h2 variants={fadeInUp} className="text-brand-bone mt-8 uppercase tracking-wide text-lg border-b border-brand-bone/10 pb-2">Compatibility</motion.h2>
        <motion.p variants={fadeInUp}>
          Because our API is S3-compatible, you can use the vast ecosystem of S3 tools and libraries.
        </motion.p>
        <motion.ul variants={fadeInUp}>
          <li><strong>AWS CLI</strong></li>
          <li><strong>MinIO Client (mc)</strong></li>
          <li><strong>Rclone</strong></li>
          <li><strong>S3fs</strong></li>
          <li>SDKs for Python (boto3), Node.js (aws-sdk), Go, etc.</li>
        </motion.ul>

        <motion.h2 variants={fadeInUp} className="text-brand-bone mt-12 uppercase tracking-wide text-lg border-b border-brand-bone/10 pb-2">Configuration Examples</motion.h2>

        <motion.h3 variants={fadeInUp} className="text-brand-bone/90 font-medium">AWS CLI</motion.h3>
        <p>Configure a profile in `~/.aws/credentials`:</p>
        <div className="bg-black/40 p-4 rounded-lg overflow-x-auto border border-brand-bone/5 mb-6 backdrop-blur-sm">
          <pre className="text-sm text-brand-bone/80 font-mono">
{`[profile nodebase]
aws_access_key_id = <your_access_key>
aws_secret_access_key = <your_secret_key>
region = ind-del-1`}
          </pre>
        </div>

        <p>Then run commands specifying the endpoint:</p>
        <div className="bg-black/40 p-4 rounded-lg font-mono text-sm backdrop-blur-sm border border-brand-bone/5">
          <div className="text-brand-bone/50"># List buckets</div>
          <div className="text-green-400">$ aws s3 ls --endpoint-url https://s3.ind-del-1.nodebase.space --profile nodebase</div>
          <br/>
          <div className="text-brand-bone/50"># Upload a file</div>
          <div className="text-green-400">$ aws s3 cp my-file.txt s3://my-bucket/ --endpoint-url https://s3.ind-del-1.nodebase.space --profile nodebase</div>
        </div>

        <motion.h3 variants={fadeInUp} className="text-brand-bone/90 mt-12 font-medium">Node.js (AWS SDK v3)</motion.h3>
        <div className="bg-black/40 p-4 rounded-lg overflow-x-auto border border-brand-bone/5 backdrop-blur-sm">
          <pre className="text-sm text-blue-300">
{`import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "ind-del-1",
  endpoint: "https://s3.ind-del-1.nodebase.space",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY
  }
});

// Upload a file
await s3.send(new PutObjectCommand({
  Bucket: "my-bucket",
  Key: "hello.txt",
  Body: "Hello from Nodebase!"
}));`}
          </pre>
        </div>

        <motion.h2 variants={fadeInUp} className="text-brand-bone mt-12 uppercase tracking-wide text-lg border-b border-brand-bone/10 pb-2">Features & Limits</motion.h2>
        <motion.table variants={fadeInUp} className="w-full text-left border-collapse">
          <tbody className="text-sm text-brand-bone/60">
            <tr className="border-b border-brand-bone/5">
              <td className="py-2 font-bold text-brand-bone">Maximum Object Size</td>
              <td className="py-2">5 TB</td>
            </tr>
            <tr className="border-b border-brand-bone/5">
              <td className="py-2 font-bold text-brand-bone">Bucket Limit</td>
              <td className="py-2">100 per account</td>
            </tr>
            <tr className="border-b border-brand-bone/5">
              <td className="py-2 font-bold text-brand-bone">Consistency</td>
              <td className="py-2">Strong read-after-write consistency</td>
            </tr>
            <tr className="border-b border-brand-bone/5">
              <td className="py-2 font-bold text-brand-bone">Public Access</td>
              <td className="py-2">Supported (ACLs and Bucket Policies)</td>
            </tr>
          </tbody>
        </motion.table>
      </motion.div>
    </div>
  );
}
