"use client";

import { useEffect, useState } from "react";
import { Check, X, RefreshCw, ExternalLink, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useIntegrationsStore } from "@/store/useIntegrationsStore";

export default function IntegrationsPage() {
  const { integrations, loading, fetchIntegrations, connectIntegration, disconnectIntegration } = useIntegrationsStore();
  const [connectingId, setConnectingId] = useState<string | null>(null);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  const handleConnect = async (id: string) => {
    setConnectingId(id);
    await connectIntegration(id);
    setConnectingId(null);
  };

  const handleDisconnect = async (id: string) => {
    if (confirm('Are you sure you want to disconnect? Syncing will stop immediately.')) {
      await disconnectIntegration(id);
    }
  };

  if (loading && integrations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
        <p className="text-gray-500 text-sm">Connect your listing platforms to enable auto-sync</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {integrations.map((integration) => (
          <div 
            key={integration.id}
            className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
               {/* Icon Placeholder */}
               <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {integration.name.substring(0, 3)}
               </div>
               
               <div>
                 <div className="flex items-center gap-3 mb-1">
                   <h3 className="text-lg font-bold text-gray-900">{integration.name}</h3>
                   <span className={cn(
                     "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border",
                     integration.status === 'connected' ? "bg-green-100 text-green-700 border-green-200" :
                     integration.status === 'error' ? "bg-red-100 text-red-700 border-red-200" :
                     "bg-gray-100 text-gray-500 border-gray-200"
                   )}>
                     {integration.status}
                   </span>
                 </div>
                 <p className="text-sm text-gray-600 mb-2">{integration.description}</p>
                 
                 {integration.status === 'connected' && (
                   <div className="flex items-center gap-2 text-xs text-gray-400">
                     <RefreshCw className="w-3 h-3" />
                     Last synced: {integration.lastSync}
                   </div>
                 )}
               </div>
            </div>

            <div className="flex items-center gap-3 md:min-w-[140px] justify-end">
              {integration.status === 'connected' ? (
                <>
                  <button 
                    onClick={() => handleDisconnect(integration.id)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors"
                  >
                    Disconnect
                  </button>
                  <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => handleConnect(integration.id)}
                  disabled={!!connectingId}
                  className="w-full md:w-auto px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {connectingId === integration.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect"
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-blue-900">Sync Information</h4>
          <p className="text-xs text-blue-700 mt-1 leading-relaxed">
            Nodebase automatically syncs availability and bookings every 5 minutes. 
            Price updates are pushed immediately. Ensure you have "Instant Book" enabled on Airbnb for best performance.
          </p>
        </div>
      </div>
    </div>
  );
}
