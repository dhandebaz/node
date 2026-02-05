import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security & Compliance - Nodebase Docs",
  description: "Understanding Nodebase's physical, network, and data security measures compliant with DPDP Act 2023.",
};

export default function Page() {
  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-white">Security & Compliance</h1>
        <p className="text-xl text-zinc-400">
          Defense-in-depth architecture designed to protect Indian enterprise data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-medium text-white mb-2">DPDP Act 2023 Ready</h3>
          <p className="text-zinc-400">
            Our infrastructure is built from the ground up to comply with the Digital Personal Data Protection Act, 
            ensuring data fiduciary obligations are met.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-medium text-white mb-2">ISO 27001 Certified</h3>
          <p className="text-zinc-400">
            Our data centers and operations maintain rigorous ISO 27001:2013 certification for information security management.
          </p>
        </div>
      </div>

      <div className="prose prose-invert max-w-none">
        <h2>Physical Security</h2>
        <p>
          Security begins at the physical layer. Our Okhla (DC-DEL-01) facility is a fortress.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-zinc-400">
          <li><strong>Perimeter:</strong> 15ft high concrete walls with anti-climb fencing.</li>
          <li><strong>Access Control:</strong> 5-layer authentication including biometric scanners, mantraps, and 24/7 armed guards.</li>
          <li><strong>Surveillance:</strong> Full CCTV coverage with 90-day retention.</li>
          <li><strong>Asset Tracking:</strong> RFID tagging on all server chassis and hard drives.</li>
        </ul>

        <h2>Network Security</h2>
        <h3>DDoS Protection</h3>
        <p>
          Every public IP on Nodebase is protected by our always-on DDoS mitigation system.
          It automatically detects and scrubs volumetric attacks (UDP floods, SYN floods) at the edge, 
          keeping your services online without latency penalties.
        </p>

        <h3>Virtual Private Cloud (VPC)</h3>
        <p>
          By default, customer environments are isolated.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-zinc-400">
          <li><strong>L2 Isolation:</strong> VXLAN encapsulation ensures your private traffic is invisible to other tenants.</li>
          <li><strong>Firewall:</strong> Stateful cloud firewalls allow you to define ingress/egress rules at the instance level.</li>
        </ul>

        <div className="bg-zinc-900 rounded-lg p-4 border border-white/10 my-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-zinc-500 font-mono">Example: Security Group Configuration</span>
          </div>
          <pre className="text-sm font-mono text-zinc-300 overflow-x-auto">
{`# Allow SSH only from office VPN
$ nb firewall create-rule \\
    --direction ingress \\
    --protocol tcp \\
    --port 22 \\
    --source 203.0.113.0/24 \\
    --action allow

# Block all other incoming traffic
$ nb firewall set-default --direction ingress --action deny`}
          </pre>
        </div>

        <h2>Data Protection</h2>
        <p>
          We provide tools and guarantees to keep your data safe at rest and in transit.
        </p>
        
        <h3>Encryption</h3>
        <ul className="list-disc pl-6 space-y-2 text-zinc-400">
          <li><strong>At Rest:</strong> All NVMe drives are encrypted using AES-256-XTS. Keys are managed via Hardware Security Modules (HSM).</li>
          <li><strong>In Transit:</strong> All control plane APIs and object storage endpoints enforce TLS 1.3.</li>
        </ul>

        <h3>Data Residency</h3>
        <p>
          We guarantee that customer data stored in the `ind-del-1` region is never replicated to servers outside of India. 
          This provides legal certainty for government and BFSI workloads.
        </p>

        <h2>Vulnerability Management</h2>
        <p>
          Our security team performs daily automated scans and quarterly penetration testing. 
          We also run a Bug Bounty program to incentivize responsible disclosure.
        </p>
      </div>
    </div>
  );
}
