import { ShieldAlert } from "lucide-react";

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Audit & Security Logs</h1>
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg font-mono text-xs text-zinc-400 p-4 h-96 overflow-y-auto">
        <div className="mb-2 text-zinc-500">-- END OF LOGS --</div>
        <div className="py-1"><span className="text-blue-400">[INFO]</span> Admin login success (User: SuperAdmin, IP: 192.168.1.1) - 10:42 AM</div>
        <div className="py-1"><span className="text-yellow-400">[WARN]</span> Failed login attempt (IP: 45.33.22.11) - 10:40 AM</div>
        <div className="py-1"><span className="text-green-400">[ACTION]</span> Updated feature flags (User: SuperAdmin) - 09:15 AM</div>
        <div className="py-1"><span className="text-blue-400">[INFO]</span> System startup - 09:00 AM</div>
      </div>
    </div>
  );
}
