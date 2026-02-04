"use client";

import { Cloud } from "lucide-react";

export default function SpaceDocsPage() {
  return (
    <div className="prose prose-invert prose-lg max-w-none">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue">
           <Cloud className="w-6 h-6" />
        </div>
        <h1 className="m-0">Nodebase Space</h1>
      </div>
      
      <p className="lead">
        Space is our sovereign cloud platform. It provides the fundamental primitives for building applications: Compute, Storage, and Networking.
      </p>

      <h2>Regions</h2>
      <p>
        Nodebase Space is currently available in the following zones:
      </p>
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/20">
            <th className="py-2">Region ID</th>
            <th className="py-2">Location</th>
            <th className="py-2">Services</th>
          </tr>
        </thead>
        <tbody className="text-white/70">
          <tr className="border-b border-white/10">
            <td className="py-2 font-mono text-brand-saffron">ind-mum-1</td>
            <td className="py-2">Mumbai (Flagship)</td>
            <td className="py-2">Compute, Storage, GPU</td>
          </tr>
          <tr className="border-b border-white/10">
            <td className="py-2 font-mono text-brand-saffron">ind-blr-1</td>
            <td className="py-2">Bangalore</td>
            <td className="py-2">Compute, Edge</td>
          </tr>
          <tr className="border-b border-white/10">
            <td className="py-2 font-mono text-brand-saffron">ind-del-1</td>
            <td className="py-2">Delhi NCR</td>
            <td className="py-2">Storage, Edge</td>
          </tr>
        </tbody>
      </table>

      <h2 className="mt-8">Product Offerings</h2>
      
      <h3>1. Shared Hosting (App Platform)</h3>
      <p>
        For static sites, PHP applications, and Node.js services. Uses CageFS for isolation.
        Ideal for blogs, portfolios, and small business sites.
      </p>

      <h3>2. Dedicated Compute</h3>
      <p>
        Bare metal instances with full root access. No hypervisor overhead.
        Ideal for high-performance databases and AI training.
      </p>

      <h3>3. Object Storage (S3 Compatible)</h3>
      <p>
        Store images, backups, and logs. Fully compatible with the AWS S3 API, so you can use existing tools like `boto3` or `rclone`.
      </p>

      <div className="bg-black/50 border border-white/10 rounded-xl p-4 my-6 font-mono text-sm">
        <div className="text-white/50 mb-2"># Example: Using AWS CLI with Nodebase</div>
        <div className="text-green-400">
          $ aws s3 ls --endpoint-url https://s3.ind-mum-1.nodebase.space
        </div>
      </div>
    </div>
  );
}
