import { Metadata } from "next";

export const metadata: Metadata = {
  title: "H100 Clusters - Nodebase Infrastructure",
  description: "Deploy high-performance NVIDIA H100 Tensor Core GPU clusters for massive AI workloads.",
};

export default function Page() {
  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-white">H100 Clusters</h1>
        <p className="text-xl text-zinc-400">
          The world's most advanced GPU architecture, available on-demand in India for LLM training and high-scale inference.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-900/20 to-black border border-green-500/20">
          <h3 className="text-4xl font-bold text-green-400 mb-2">30 TB/s</h3>
          <p className="text-zinc-400 text-sm">Aggregate Memory Bandwidth</p>
        </div>
        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-900/20 to-black border border-green-500/20">
          <h3 className="text-4xl font-bold text-green-400 mb-2">3.2 Tbps</h3>
          <p className="text-zinc-400 text-sm">InfiniBand Networking</p>
        </div>
        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-900/20 to-black border border-green-500/20">
          <h3 className="text-4xl font-bold text-green-400 mb-2">700W</h3>
          <p className="text-zinc-400 text-sm">TDP per GPU (Liquid Cooled)</p>
        </div>
      </div>

      <div className="prose prose-invert max-w-none">
        <h2>Overview</h2>
        <p>
          Nodebase H100 clusters are built for the era of Generative AI. We offer bare-metal access to 
          HGX H100 systems, interconnected with NVIDIA Quantum-2 InfiniBand for seamless scaling across thousands of GPUs.
        </p>

        <h3>Hardware Specifications (Per Node)</h3>
        <ul className="list-disc pl-6 space-y-2 text-zinc-400">
          <li><strong>GPUs:</strong> 8x NVIDIA H100 80GB SXM5</li>
          <li><strong>CPU:</strong> 2x Intel Xeon Platinum 8480+ (112 Cores total)</li>
          <li><strong>RAM:</strong> 2TB DDR5 ECC</li>
          <li><strong>Storage:</strong> 30TB NVMe Gen5 Local Storage</li>
          <li><strong>Networking:</strong> 4x 400Gbps OSFP (NDR InfiniBand)</li>
        </ul>

        <h2>Pricing Models</h2>
        <p>
          We offer flexible pricing to suit both R&D experiments and production training runs.
          Pricing is denominated in INR to insulate you from forex fluctuations.
        </p>

        <div className="not-prose mt-6 overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-left border-collapse bg-white/5">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-white font-medium">Tier</th>
                <th className="p-4 text-white font-medium">Commitment</th>
                <th className="p-4 text-white font-medium">Hourly Rate (per GPU)</th>
                <th className="p-4 text-white font-medium">Availability</th>
              </tr>
            </thead>
            <tbody className="text-sm text-zinc-400">
              <tr className="border-b border-white/5">
                <td className="p-4 font-mono text-white">On-Demand</td>
                <td className="p-4">None (Hourly)</td>
                <td className="p-4">₹299 / hr</td>
                <td className="p-4"><span className="px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs">Limited</span></td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="p-4 font-mono text-white">Reserved (1y)</td>
                <td className="p-4">1 Year</td>
                <td className="p-4">₹180 / hr</td>
                <td className="p-4"><span className="px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-xs">Guaranteed</span></td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="p-4 font-mono text-white">Spot</td>
                <td className="p-4">Interruptible</td>
                <td className="p-4">₹120 / hr</td>
                <td className="p-4"><span className="px-2 py-1 rounded-full bg-red-500/10 text-red-400 text-xs">Volatile</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Deployment</h2>
        <p>
          You can provision H100 clusters via the Nodebase CLI or Console. 
          We provide pre-configured images for PyTorch, TensorFlow, and JAX.
        </p>

        <div className="bg-zinc-900 rounded-lg p-4 border border-white/10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-zinc-500 font-mono">Terminal</span>
          </div>
          <pre className="text-sm font-mono text-zinc-300 overflow-x-auto">
{`# List available GPU types
$ nb compute types list --gpu
TYPE        GPUS    VRAM     PRICE
a100-40     1x      40GB     ₹85/hr
a100-80     1x      80GB     ₹110/hr
h100-sxm    8x      640GB    ₹2392/hr

# Launch an 8x H100 Pod
$ nb compute create \\
    --type h100-sxm \\
    --image pytorch-2.1-cuda12 \\
    --region ind-del-1 \\
    --name my-training-pod

> Provisioning dedicated host...
> Mounting high-speed NVMe...
> Cluster 'my-training-pod' is ready (10.12.0.5)`}
          </pre>
        </div>

        <h3>Software Stack</h3>
        <p>
          All H100 instances come with the Nodebase AI Stack pre-installed:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-zinc-400">
          <li>NVIDIA Driver 535+</li>
          <li>CUDA 12.2 Toolkit</li>
          <li>cuDNN 8.9</li>
          <li>NCCL 2.18 for multi-node training</li>
          <li>Docker & NVIDIA Container Toolkit</li>
        </ul>
      </div>
    </div>
  );
}
