"use client";

import { useState } from "react";
import { Calculator, Info, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// NOTE: These are estimated baseline figures based on market rates for high-performance compute.
// Actual figures will vary based on real-time demand and operational costs.
const BASE_QUARTERLY_REVENUE_PER_UNIT = 180000; // Base revenue at 100% utilization
const BASE_QUARTERLY_COST_PER_UNIT = 18500;    // Base operational cost per unit (Power, Colo, Ops)

export function RoiCalculator() {
  const [numUnits, setNumUnits] = useState(1);
  const [utilization, setUtilization] = useState<"low" | "base" | "high">("base");

  const scenarios = {
    low: { label: "Low (30%)", factor: 0.3 },
    base: { label: "Base (50%)", factor: 0.5 },
    high: { label: "High (70%)", factor: 0.7 },
  };

  // Calculation Logic
  const calculateEstimates = () => {
    const revenueFactor = scenarios[utilization].factor;
    
    // Cost Efficiency: As units increase, operational overhead per unit decreases slightly (Economies of Scale).
    // Reduces cost by 1.5% per additional unit, capped at 15% reduction.
    const efficiencyFactor = Math.max(0.85, 1 - (numUnits - 1) * 0.015);
    const adjustedCostPerUnit = BASE_QUARTERLY_COST_PER_UNIT * efficiencyFactor;

    const grossRevenue = BASE_QUARTERLY_REVENUE_PER_UNIT * numUnits * revenueFactor;
    const totalCost = adjustedCostPerUnit * numUnits;
    
    // Net Revenue
    const netRevenue = Math.max(0, grossRevenue - totalCost);
    
    // Range (±10% variance for estimation - tightened range)
    const lowRange = Math.floor(netRevenue * 0.90);
    const highRange = Math.ceil(netRevenue * 1.10);

    // Break-even (Total Investment / Quarterly Net Revenue)
    const investment = numUnits * 1000000;
    
    // Calculate break-even in quarters
    const breakEvenQuartersLow = netRevenue > 0 ? (investment / highRange) : 0;
    const breakEvenQuartersHigh = netRevenue > 0 ? (investment / lowRange) : 0;

    const formatQuarters = (q: number) => {
        if (q === 0) return "N/A";
        // Convert to Years and Months for "Real" timeline feel
        const years = Math.floor(q / 4);
        const months = Math.round((q % 4) * 3);
        if (years > 0) return `${years}y ${months}m`;
        return `${months}m`;
    };

    return {
      range: `₹${lowRange.toLocaleString()} – ₹${highRange.toLocaleString()}`,
      breakEven: netRevenue > 0 ? `${formatQuarters(breakEvenQuartersLow)} – ${formatQuarters(breakEvenQuartersHigh)}` : "Extended",
    };
  };

  const estimates = calculateEstimates();

  return (
    <div className="glass-card rounded-2xl p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-brand-saffron/10 rounded-lg text-brand-saffron">
          <Calculator className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-bold text-white">ROI Estimation Calculator</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Number of Node Units
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="20"
                value={numUnits}
                onChange={(e) => setNumUnits(parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-saffron"
              />
              <span className="text-2xl font-bold text-white w-12 text-center">{numUnits}</span>
            </div>
            <p className="text-xs text-white/40 mt-1">Total Participation: ₹{(numUnits * 10).toLocaleString()} Lakhs</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Utilization Scenario
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(scenarios) as Array<keyof typeof scenarios>).map((key) => (
                <button
                  key={key}
                  onClick={() => setUtilization(key)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-all border",
                    utilization === key
                      ? "bg-brand-saffron text-black border-brand-saffron"
                      : "bg-black text-white/60 border-white/10 hover:bg-white/10"
                  )}
                >
                  {scenarios[key].label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-4 bg-black/40 rounded-lg border border-white/5">
             <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Assumptions</h4>
             <ul className="text-xs text-white/40 space-y-1">
               <li>• Facility: Okhla, Delhi (Phase 1)</li>
               <li>• Revenue sources: kaisa AI & Nodebase Space</li>
               <li>• Deductions: Power, Bandwidth, Colocation, Ops</li>
               <li>• Operational efficiency scales with unit count</li>
               <li>• Figures are pre-tax estimates</li>
             </ul>
             <p className="text-[10px] text-white/30 mt-3 italic">
               *Early Nodes participate in the initial infrastructure phase before geographic distribution. 
               Estimates reflect single-site operational efficiency.
             </p>
          </div>
        </div>

        {/* Outputs */}
        <div className="bg-black rounded-xl border border-white/10 p-6 flex flex-col justify-center">
          <div className="mb-6">
            <h4 className="text-sm font-medium text-white/50 mb-1">Est. Quarterly Net Revenue</h4>
            <div className="text-2xl md:text-3xl font-bold text-brand-saffron">
              {estimates.range}
            </div>
            <p className="text-xs text-white/30 mt-1">Range based on ±10% variance</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-white/50 mb-1">Est. Break-even Timeline</h4>
            <div className="text-2xl md:text-3xl font-bold text-white">
              {estimates.breakEven}
            </div>
            <p className="text-xs text-white/30 mt-1">Dependent on consistent utilization</p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex gap-2">
             <AlertCircle className="w-4 h-4 text-white/30 shrink-0 mt-0.5" />
             <p className="text-[10px] text-white/30 leading-relaxed">
               <strong>Disclaimer:</strong> Actual outcomes depend on real customer usage, pricing, and operational conditions. 
               These figures are estimates only and do not constitute a guarantee of performance or return.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
