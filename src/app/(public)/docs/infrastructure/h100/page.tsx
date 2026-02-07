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
    <div className="space-y-12">
      <motion.div 
        initial="initial"
        animate="animate"
        variants={stagger}
        className="space-y-6"
      >
        <motion.h1 variants={fadeInUp} className="text-4xl font-bold text-brand-bone uppercase tracking-tighter">H100 Clusters</motion.h1>
        <motion.p variants={fadeInUp} className="text-xl text-brand-bone/70 font-light">
          The world's most advanced GPU architecture, available on-demand in India for LLM training and high-scale inference.
        </motion.p>
      </motion.div>

      <motion.div 
        initial="initial"
        animate="animate"
        variants={stagger}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div variants={fadeInUp} className="p-6 rounded-2xl bg-brand-bone/5 border border-brand-bone/10">
          <h3 className="text-4xl font-bold text-brand-bone mb-2">30 TB/s</h3>
          <p className="text-brand-bone/60 text-sm uppercase tracking-wider">Aggregate Memory Bandwidth</p>
        </motion.div>
        <motion.div variants={fadeInUp} className="p-6 rounded-2xl bg-brand-bone/5 border border-brand-bone/10">
          <h3 className="text-4xl font-bold text-brand-bone mb-2">3.2 Tbps</h3>
          <p className="text-brand-bone/60 text-sm uppercase tracking-wider">InfiniBand Networking</p>
        </motion.div>
        <motion.div variants={fadeInUp} className="p-6 rounded-2xl bg-brand-bone/5 border border-brand-bone/10">
          <h3 className="text-4xl font-bold text-brand-bone mb-2">700W</h3>
          <p className="text-brand-bone/60 text-sm uppercase tracking-wider">TDP per GPU (Liquid Cooled)</p>
        </motion.div>
      </motion.div>

      <div className="prose prose-invert max-w-none text-brand-bone/80 prose-headings:text-brand-bone prose-strong:text-brand-bone prose-a:text-brand-bone prose-code:text-brand-bone">
        <h2 className="uppercase tracking-tight">Overview</h2>
        <p>
          Nodebase H100 clusters are built for the era of Generative AI. We offer bare-metal access to 
          HGX H100 systems, interconnected with NVIDIA Quantum-2 InfiniBand for seamless scaling across thousands of GPUs.
        </p>

        <h3 className="uppercase tracking-tight">Hardware Specifications (Per Node)</h3>
        <ul className="list-disc pl-6 space-y-2 text-brand-bone/70">
          <li><strong>GPUs:</strong> 8x NVIDIA H100 80GB SXM5</li>
          <li><strong>CPU:</strong> 2x Intel Xeon Platinum 8480+ (112 Cores total)</li>
          <li><strong>RAM:</strong> 2TB DDR5 ECC</li>
          <li><strong>Storage:</strong> 30TB NVMe Gen5 Local Storage</li>
          <li><strong>Networking:</strong> 4x 400Gbps OSFP (NDR InfiniBand)</li>
        </ul>

        <h2 className="uppercase tracking-tight">Pricing Models</h2>
        <p>
          We offer flexible pricing to suit both R&D experiments and production training runs.
          Pricing is denominated in INR to insulate you from forex fluctuations.
        </p>

        <div className="not-prose mt-6 overflow-hidden rounded-xl border border-brand-bone/10">
          <table className="w-full text-left border-collapse bg-brand-bone/5">
            <thead>
              <tr className="border-b border-brand-bone/10">
                <th className="p-4 text-brand-bone font-bold uppercase text-sm tracking-wider">Tier</th>
                <th className="p-4 text-brand-bone font-bold uppercase text-sm tracking-wider">Commitment</th>
                <th className="p-4 text-brand-bone font-bold uppercase text-sm tracking-wider">Hourly Rate (per GPU)</th>
                <th className="p-4 text-brand-bone font-bold uppercase text-sm tracking-wider">Availability</th>
              </tr>
            </thead>
            <tbody className="text-sm text-brand-bone/70">
              <tr className="border-b border-brand-bone/5">
                <td className="p-4 font-mono text-brand-bone">On-Demand</td>
                <td className="p-4">None (Hourly)</td>
                <td className="p-4">₹299 / hr</td>
                <td className="p-4"><span className="px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs">Limited</span></td>
              </tr>
              <tr className="border-b border-brand-bone/5">
                <td className="p-4 font-mono text-brand-bone">Reserved (1y)</td>
                <td className="p-4">1 Year</td>
                <td className="p-4">₹180 / hr</td>
                <td className="p-4"><span className="px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-xs">Guaranteed</span></td>
              </tr>
              <tr className="border-b border-brand-bone/5">
                <td className="p-4 font-mono text-brand-bone">Spot</td>
                <td className="p-4">Interruptible</td>
                <td className="p-4">₹120 / hr</td>
                <td className="p-4"><span className="px-2 py-1 rounded-full bg-red-500/10 text-red-400 text-xs">Volatile</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="uppercase tracking-tight">Deployment</h2>
        <p>
          You can provision H100 clusters via the Nodebase CLI or Console. 
          We provide pre-configured images for PyTorch, TensorFlow, and JAX.
        </p>

        <div className="bg-black/50 rounded-lg p-4 border border-brand-bone/10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-brand-bone/60 font-mono">Terminal</span>
          </div>
          <pre className="text-sm font-mono text-brand-bone/80 overflow-x-auto">
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

        <h3 className="uppercase tracking-tight">Software Stack</h3>
        <p>
          All H100 instances come with the Nodebase AI Stack pre-installed:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-brand-bone/70">
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
