"use client";

import { useState } from "react";
import { Building2, Upload, Save, Globe, MapPin, Phone, Mail } from "lucide-react";
import { DBTenant } from "@/types/database";
import { updateTenantProfileAction } from "@/app/actions/customer";
import { toast } from "sonner";

interface BusinessProfileSettingsProps {
  tenant: DBTenant;
}

export function BusinessProfileSettings({ tenant }: BusinessProfileSettingsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: tenant.name || "",
    business_type: tenant.business_type || "",
    address: (tenant as any).address || "", 
    website: (tenant as any).website || "",
    contact_email: (tenant as any).email || "",
    contact_phone: (tenant as any).phone || "",
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateTenantProfileAction({
        name: formData.name,
        address: formData.address,
        phone: formData.contact_phone,
        email: formData.contact_email,
        website: formData.website,
      });
      
      if (result.success) {
        toast.success("Business profile updated successfully");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-zinc-800 flex items-center gap-4">
        <div className="p-3 bg-zinc-800 rounded-lg">
          <Building2 className="w-6 h-6 text-orange-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Business Profile</h2>
          <p className="text-sm text-zinc-400">Manage your organization details</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-start gap-6">
          <div className="relative group">
            <div className="w-24 h-24 bg-zinc-800 rounded-xl border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center gap-2 overflow-hidden group-hover:border-orange-500 transition-colors cursor-pointer">
              <Upload className="w-6 h-6 text-zinc-500 group-hover:text-orange-500 transition-colors" />
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider group-hover:text-orange-500 transition-colors">Logo</span>
            </div>
            <button className="absolute -bottom-2 -right-2 p-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-400 hover:text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1 grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Business Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Business Type</label>
              <select 
                value={formData.business_type}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 transition-colors appearance-none"
                disabled
              >
                <option value={formData.business_type}>{formData.business_type.replace(/_/g, " ")}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative">
            <Globe className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Website URL"
              value={formData.website}
              onChange={(e) => setFormData({...formData, website: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Business Address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input 
              type="email" 
              placeholder="Support Email"
              value={formData.contact_email}
              onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input 
              type="tel" 
              placeholder="Support Phone"
              value={formData.contact_phone}
              onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-zinc-800">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-brand-red text-white px-6 py-2 rounded-lg font-bold hover:bg-red-600 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
