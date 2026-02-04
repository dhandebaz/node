"use client";

import { Server } from "lucide-react";

export default function InfraDocsPage() {
  return (
    <div className="prose prose-invert prose-lg max-w-none">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-brand-green/10 rounded-xl flex items-center justify-center text-brand-green">
           <Server className="w-6 h-6" />
        </div>
        <h1 className="m-0">Infrastructure Documentation</h1>
      </div>
      
      <p className="lead">
        This section is for participants in the physical Nodebase network. Learn how to procure, setup, and maintain a Node.
      </p>

      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-amber-200 text-sm mb-8">
        <strong>Note:</strong> Participation in the physical network is currently by invitation or application only.
      </div>

      <h2>Node Specifications</h2>
      <p>
        To ensure uniformity and reliability, we only support specific hardware configurations.
      </p>

      <h3>Type A: Compute Node</h3>
      <ul>
        <li><strong>CPU:</strong> AMD EPYC 9004 Series (64+ Cores)</li>
        <li><strong>RAM:</strong> 512GB DDR5 ECC</li>
        <li><strong>Storage:</strong> 2x 3.84TB NVMe (RAID 1)</li>
        <li><strong>Network:</strong> Dual 25GbE SFP28</li>
      </ul>

      <h3>Type B: AI Training Node</h3>
      <ul>
        <li><strong>GPU:</strong> 8x NVIDIA H100 (80GB)</li>
        <li><strong>Interconnect:</strong> NVLink Switch</li>
        <li><strong>RAM:</strong> 2TB DDR5</li>
        <li><strong>Storage:</strong> 30TB NVMe Pool</li>
      </ul>

      <h2>Onboarding Process</h2>
      <ol>
        <li><strong>Procurement:</strong> Order certified hardware through our supply chain partners.</li>
        <li><strong>Shipping:</strong> Ship to the designated data center (Okhla or Navi Mumbai).</li>
        <li><strong>Provisioning:</strong> Our on-site team racks and cables the unit.</li>
        <li><strong>Activation:</strong> The node boots via PXE into the Nodebase OS and joins the cluster.</li>
      </ol>

      <h2>Rewards & Yield</h2>
      <p>
        Node owners receive revenue share based on the utilization of their hardware. 
        Payouts are processed monthly in INR.
      </p>
    </div>
  );
}
