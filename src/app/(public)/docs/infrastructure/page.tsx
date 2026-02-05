import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Infrastructure Overview - Nodebase Docs",
  description: "Explore Nodebase's sovereign infrastructure, data center specifications, and node capabilities in Okhla, Delhi.",
};

export default function Page() {
  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-white">Infrastructure Overview</h1>
        <p className="text-xl text-zinc-400">
          Sovereign, high-performance bare metal and cloud infrastructure hosted physically in India.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-medium text-white mb-2">Sovereign Territory</h3>
          <p className="text-zinc-400">
            All data and compute resources are physically located in Okhla, New Delhi (DC-DEL-01). 
            Your data never leaves Indian borders, ensuring full compliance with the DPDP Act 2023.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-medium text-white mb-2">Tier IV Reliability</h3>
          <p className="text-zinc-400">
            Our data center features 2N+1 redundancy for power and cooling, guaranteeing 99.99% uptime 
            for mission-critical workloads.
          </p>
        </div>
      </div>

      <div className="prose prose-invert max-w-none">
        <h2>Data Center Specifications</h2>
        <p>
          Nodebase operates out of a state-of-the-art facility designed for high-density compute and AI workloads.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-zinc-400">
          <li><strong>Location:</strong> Okhla Industrial Estate, New Delhi</li>
          <li><strong>Power Capacity:</strong> 12 MW total IT load</li>
          <li><strong>Cooling:</strong> Liquid immersion cooling ready for H100 clusters</li>
          <li><strong>Connectivity:</strong> Carrier-neutral with direct peering to major Indian ISPs (Airtel, Jio, VI)</li>
          <li><strong>Latency:</strong> &lt;5ms to Delhi NCR, &lt;25ms to Mumbai/Bangalore</li>
        </ul>

        <h2>Compute Instances</h2>
        <p>
          We offer a range of bare metal and virtualized instances optimized for different workloads.
        </p>

        <div className="not-prose mt-6 overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-left border-collapse bg-white/5">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-white font-medium">Instance Family</th>
                <th className="p-4 text-white font-medium">Use Case</th>
                <th className="p-4 text-white font-medium">Specs</th>
              </tr>
            </thead>
            <tbody className="text-sm text-zinc-400">
              <tr className="border-b border-white/5">
                <td className="p-4 font-mono text-brand-saffron">General Purpose (G-Series)</td>
                <td className="p-4">Web servers, microservices, databases</td>
                <td className="p-4">Up to 64 vCPUs, 256GB RAM</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="p-4 font-mono text-white">Compute Optimized (C-Series)</td>
                <td className="p-4">Batch processing, CI/CD, gaming servers</td>
                <td className="p-4">Up to 128 vCPUs (High Frequency)</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="p-4 font-mono text-purple-400">Memory Optimized (M-Series)</td>
                <td className="p-4">Redis, In-memory DBs, Big Data</td>
                <td className="p-4">Up to 2TB RAM</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="p-4 font-mono text-green-400">Accelerated Computing (A-Series)</td>
                <td className="p-4">AI Inference, Training, Rendering</td>
                <td className="p-4">NVIDIA H100 / A100 GPUs</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Network Architecture</h2>
        <p>
          Every instance comes with a 10Gbps public uplink and a 25Gbps private network interface. 
          Our internal network is non-blocking, ensuring maximum throughput between your nodes and storage.
        </p>
        
        <h3>Private Networking</h3>
        <p>
          Instances within the same project can communicate over a private VPC (10.x.x.x) which is isolated 
          from the public internet. Bandwidth within the private network is free and unmetered.
        </p>

        <pre className="bg-zinc-900 p-4 rounded-lg overflow-x-auto text-sm text-zinc-300">
{`# Check private IP address
$ ip addr show eth1
3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
    link/ether 02:00:17:00:04:a2 brd ff:ff:ff:ff:ff:ff
    inet 10.12.0.4/16 brd 10.12.255.255 scope global eth1`}
        </pre>
      </div>
    </div>
  );
}
