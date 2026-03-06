"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MessageSquare, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { saveWhatsAppOfficialCredentials } from "@/app/actions/whatsapp";

export function WhatsAppOfficialCard() {
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [status, setStatus] = useState<'idle' | 'saving' | 'connected'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumberId || !accessToken) {
      toast.error("Please fill in all fields");
      return;
    }

    setStatus('saving');
    try {
      await saveWhatsAppOfficialCredentials({ phoneNumberId, accessToken });
      toast.success("WhatsApp credentials saved successfully");
      setStatus('connected');
    } catch (error) {
      console.error(error);
      toast.error("Failed to save credentials");
      setStatus('idle');
    }
  };

  return (
    <div className="col-span-full glass-card rounded-xl overflow-hidden mb-6 relative">
      {/* Background Gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="p-6 md:p-8 flex flex-col md:flex-row items-start gap-8">
        {/* Left Side: Icon & Title */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#25D366]/10 rounded-lg">
              <MessageSquare className="w-8 h-8 text-[#25D366]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">WhatsApp Business API (Official)</h2>
              <div className="flex items-center gap-2 mt-1">
                {status === 'connected' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-muted-foreground border border-white/10">
                    Not Connected
                  </span>
                )}
              </div>
            </div>
          </div>
          <p className="text-muted-foreground text-sm max-w-md">
            Connect your official WhatsApp Business Account using the Meta Cloud API.
            You'll need a System User Access Token and Phone Number ID from the Meta Developer Portal.
          </p>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-[400px] bg-white/5 rounded-lg border border-white/10 p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumberId" className="text-foreground">Meta Phone Number ID</Label>
              <Input
                id="phoneNumberId"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                placeholder="e.g. 123456789012345"
                className="bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground/50"
                disabled={status === 'saving' || status === 'connected'}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="accessToken" className="text-foreground">System User Access Token</Label>
              <Input
                id="accessToken"
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="EAAG..."
                className="bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground/50"
                disabled={status === 'saving' || status === 'connected'}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-medium border-none"
              disabled={status === 'saving' || status === 'connected'}
            >
              {status === 'saving' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : status === 'connected' ? (
                "Connected"
              ) : (
                "Save Credentials"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
