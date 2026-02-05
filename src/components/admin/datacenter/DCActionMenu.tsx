"use client";

import { useState } from "react";
import { MoreHorizontal, Server, Settings, Terminal, X, Save, ShieldCheck } from "lucide-react";
import { updateHardwareConfigAction, updateDCCapacityAction } from "@/app/actions/datacenter";

interface DCActionMenuProps {
  dcId: string;
  dcName: string;
  currentConfig?: any;
  currentCapacity: number;
}

export function DCActionMenu({ dcId, dcName, currentConfig, currentCapacity }: DCActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showHardwareModal, setShowHardwareModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Hardware Form State
  const [form, setForm] = useState({
    ipAddress: currentConfig?.ipAddress || "",
    sshPort: currentConfig?.sshPort || 22,
    authType: currentConfig?.authType || "ssh_key",
    username: "root",
    secret: "", // Password or Private Key
    agentToken: "",
  });

  // Edit Form State
  const [capacity, setCapacity] = useState(currentCapacity);

  const handleConnect = async () => {
    setLoading(true);
    // Simulate connection delay
    await new Promise(r => setTimeout(r, 1500));
    
    await updateHardwareConfigAction(dcId, {
      ...form,
      connectionStatus: "connected",
      agentVersion: "1.0.4-stable"
    });
    
    setLoading(false);
    setShowHardwareModal(false);
    setIsOpen(false);
  };

  const handleEditSave = async () => {
    setLoading(true);
    await updateDCCapacityAction(dcId, capacity);
    setLoading(false);
    setShowEditModal(false);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-20 overflow-hidden py-1">
            <button 
              className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-2"
              onClick={() => {
                setShowEditModal(true);
                setIsOpen(false);
              }}
            >
              <Settings className="w-4 h-4 text-zinc-500" />
              Edit Capacity
            </button>
            <button 
              className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-2"
              onClick={() => {
                setShowHardwareModal(true);
                setIsOpen(false);
              }}
            >
              <Terminal className="w-4 h-4 text-purple-400" />
              Connect Hardware
            </button>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-zinc-400" />
                Edit Datacenter
              </h2>
              <button onClick={() => setShowEditModal(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Total Capacity (Nodes)</label>
                <input 
                  type="number" 
                  className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:border-purple-500 outline-none"
                  value={capacity}
                  onChange={e => setCapacity(parseInt(e.target.value))}
                />
                <p className="text-[10px] text-zinc-600 mt-1">Total rack units available for deployment.</p>
              </div>
            </div>
            <div className="p-6 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900/50">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
              <button onClick={handleEditSave} disabled={loading} className="px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-zinc-200">
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hardware Connection Modal */}
      {showHardwareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Server className="w-5 h-5 text-purple-400" />
                  Connect Local Hardware
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Configure physical server access for {dcName}
                </p>
              </div>
              <button 
                onClick={() => setShowHardwareModal(false)}
                className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-purple-900/10 border border-purple-900/30 rounded text-xs text-purple-300 leading-relaxed">
                By connecting this hardware, you enable <strong>Nodebase Space</strong> to deploy Kaisa AI agents directly to this datacenter's local infrastructure. Ensure the <strong>Node Agent</strong> is installed on the gateway server.
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Gateway IP Address</label>
                  <input 
                    type="text" 
                    className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:border-purple-500 outline-none font-mono"
                    placeholder="192.168.1.10"
                    value={form.ipAddress}
                    onChange={e => setForm({...form, ipAddress: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">SSH Port</label>
                  <input 
                    type="number" 
                    className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:border-purple-500 outline-none font-mono"
                    value={form.sshPort}
                    onChange={e => setForm({...form, sshPort: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Authentication Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["ssh_key", "password", "agent_token"] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setForm({...form, authType: type})}
                      className={`px-3 py-2 rounded text-xs font-medium border transition-colors ${
                        form.authType === type 
                          ? "bg-zinc-800 border-zinc-600 text-white" 
                          : "bg-black border-zinc-800 text-zinc-500 hover:bg-zinc-900"
                      }`}
                    >
                      {type.replace("_", " ").toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {form.authType === "ssh_key" && (
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Private Key (PEM)</label>
                  <textarea 
                    className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-400 focus:border-purple-500 outline-none font-mono h-24 resize-none"
                    placeholder="-----BEGIN RSA PRIVATE KEY-----..."
                    value={form.secret}
                    onChange={e => setForm({...form, secret: e.target.value})}
                  />
                </div>
              )}

              {form.authType === "agent_token" && (
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Agent Access Token</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                    <input 
                      type="password" 
                      className="w-full bg-black border border-zinc-800 rounded pl-9 pr-3 py-2 text-sm text-zinc-200 focus:border-purple-500 outline-none font-mono"
                      placeholder="nb_agent_..."
                      value={form.agentToken}
                      onChange={e => setForm({...form, agentToken: e.target.value})}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900/50">
              <button 
                onClick={() => setShowHardwareModal(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConnect}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded shadow-lg shadow-purple-900/20 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>Connecting...</>
                ) : (
                  <>
                    <Terminal className="w-4 h-4" />
                    Connect Gateway
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
