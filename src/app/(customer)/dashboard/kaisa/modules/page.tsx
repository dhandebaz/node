
import { getKaisaDashboardData } from "@/app/actions/customer";
import { 
  MessageSquare, 
  FileText, 
  Share2, 
  Users, 
  Package, 
  Check,
  X
} from "lucide-react";
import { ToggleModuleButton } from "@/components/customer/ToggleModuleButton";

const MODULE_INFO = {
  "Frontdesk": { icon: MessageSquare, description: "Handles guest inquiries, bookings, and reception tasks." },
  "Billing": { icon: FileText, description: "Manages invoices, payments, and financial reports." },
  "Social Media": { icon: Share2, description: "Creates and schedules posts for Instagram and Facebook." },
  "CRM": { icon: Users, description: "Manages customer relationships and history." },
  "Inventory": { icon: Package, description: "Tracks stock levels and orders supplies." },
};

export default async function KaisaModulesPage() {
  const data = await getKaisaDashboardData();
  const { profile } = data;
  const activeModules = profile?.activeModules || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Modules</h1>
        <p className="text-zinc-400">Enable capabilities for your AI workforce.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(MODULE_INFO).map(([name, info]) => {
          const isActive = activeModules.includes(name);
          const Icon = info.icon;

          return (
            <div key={name} className={`relative p-6 rounded-xl border transition-all ${
              isActive 
                ? "bg-zinc-900 border-blue-500/30" 
                : "bg-zinc-900/50 border-zinc-800 opacity-75 hover:opacity-100"
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${isActive ? "bg-blue-500/20 text-blue-400" : "bg-zinc-800 text-zinc-500"}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <ToggleModuleButton name={name} isActive={isActive} />
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2">{name}</h3>
              <p className="text-sm text-zinc-400 h-10">{info.description}</p>
              
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center text-xs">
                 {isActive ? (
                    <span className="flex items-center gap-1 text-green-500 font-medium">
                        <Check className="w-3 h-3" /> Active
                    </span>
                 ) : (
                    <span className="flex items-center gap-1 text-zinc-500">
                        <X className="w-3 h-3" /> Inactive
                    </span>
                 )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
