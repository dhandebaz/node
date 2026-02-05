import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Object Storage - Nodebase Space Docs",
  description: "Scalable S3-compatible object storage.",
};

export default function Page() {
  return (
    <div className="prose prose-invert prose-lg max-w-none text-zinc-300">
      <h1 className="text-4xl font-bold text-white mb-6">Object Storage</h1>
      <p className="lead text-xl text-zinc-400 mb-8">
        Nodebase Object Storage is an S3-compatible service for storing and retrieving any amount of data. It is designed for 99.99% durability and low-latency access within India.
      </p>

      <div className="not-prose bg-zinc-900 border border-white/10 rounded-lg p-4 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-brand-saffron/20 text-brand-saffron px-2 py-1 rounded text-xs font-bold">ENDPOINT</span>
          <code className="text-zinc-300">https://s3.ind-del-1.nodebase.space</code>
        </div>
        <p className="text-sm text-zinc-500 m-0">Region: <code className="text-zinc-400">ind-del-1</code></p>
      </div>

      <h2 className="text-white mt-8">Compatibility</h2>
      <p>
        Because our API is S3-compatible, you can use the vast ecosystem of S3 tools and libraries.
      </p>
      <ul>
        <li><strong>AWS CLI</strong></li>
        <li><strong>MinIO Client (mc)</strong></li>
        <li><strong>Rclone</strong></li>
        <li><strong>S3fs</strong></li>
        <li>SDKs for Python (boto3), Node.js (aws-sdk), Go, etc.</li>
      </ul>

      <h2 className="text-white mt-12">Configuration Examples</h2>

      <h3 className="text-white">AWS CLI</h3>
      <p>Configure a profile in `~/.aws/credentials`:</p>
      <div className="bg-zinc-950 p-4 rounded-lg overflow-x-auto border border-white/5 mb-6">
        <pre className="text-sm text-zinc-300">
{`[profile nodebase]
aws_access_key_id = <your_access_key>
aws_secret_access_key = <your_secret_key>
region = ind-del-1`}
        </pre>
      </div>

      <p>Then run commands specifying the endpoint:</p>
      <div className="bg-black/50 p-4 rounded-lg font-mono text-sm">
        <div className="text-zinc-400"># List buckets</div>
        <div className="text-green-400">$ aws s3 ls --endpoint-url https://s3.ind-del-1.nodebase.space --profile nodebase</div>
        <br/>
        <div className="text-zinc-400"># Upload a file</div>
        <div className="text-green-400">$ aws s3 cp my-file.txt s3://my-bucket/ --endpoint-url https://s3.ind-del-1.nodebase.space --profile nodebase</div>
      </div>

      <h3 className="text-white mt-12">Node.js (AWS SDK v3)</h3>
      <div className="bg-zinc-950 p-4 rounded-lg overflow-x-auto border border-white/5">
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

      <h2 className="text-white mt-12">Features & Limits</h2>
      <table className="w-full text-left border-collapse">
        <tbody className="text-sm text-zinc-400">
          <tr className="border-b border-white/5">
            <td className="py-2 font-bold text-white">Maximum Object Size</td>
            <td className="py-2">5 TB</td>
          </tr>
          <tr className="border-b border-white/5">
            <td className="py-2 font-bold text-white">Bucket Limit</td>
            <td className="py-2">100 per account</td>
          </tr>
          <tr className="border-b border-white/5">
            <td className="py-2 font-bold text-white">Consistency</td>
            <td className="py-2">Strong read-after-write consistency</td>
          </tr>
          <tr className="border-b border-white/5">
            <td className="py-2 font-bold text-white">Public Access</td>
            <td className="py-2">Supported (ACLs and Bucket Policies)</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
