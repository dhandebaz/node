
"use client";

import { useState, useRef } from "react";
import { 
  Calendar, 
  Home, 
  CreditCard, 
  QrCode, 
  UserCheck, 
  FileUp, 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { extractKycDataAction, completeGuestCheckinAction } from "@/app/actions/kyc";

interface GuestCheckoutFlowProps {
  link: any;
}

export function GuestCheckoutFlow({ link }: GuestCheckoutFlowProps) {
  const [step, setStep] = useState<'details' | 'id_verification' | 'payment' | 'complete'>(
    link.status === 'paid' ? 'complete' : 'details'
  );
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    idNumber: "",
    documentId: "",
    arrivalTime: ""
  });

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Please provide your name, email, and phone");
      return;
    }
    setStep('id_verification');
  };

  const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtracting(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const result = await extractKycDataAction(base64, file.type, true);
        
        if (result.success && result.details) {
          const details = result.details;
          setFormData(prev => ({ 
            ...prev, 
            idNumber: details.idNumber || "",
            documentId: result.documentId || "" 
          }));
          toast.success("ID details verified by AI!");
          setTimeout(() => setStep('payment'), 1500);
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast.error("AI extraction failed. Please enter details manually.");
    } finally {
      setExtracting(false);
    }
  };

  const handlePaymentComplete = async () => {
    setLoading(true);
    try {
      await completeGuestCheckinAction({
        linkId: link.id,
        tenantId: link.tenant_id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        idNumber: formData.idNumber,
        documentId: formData.documentId,
        arrivalTime: formData.arrivalTime
      });
      setStep('complete');
      toast.success("Check-in completed successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to complete check-in");
    } finally {
      setLoading(false);
    }
  };

  if (link.status === 'expired') {
    return (
      <Card className="bg-zinc-900 border-red-500/20 text-center p-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white">Link Expired</h2>
        <p className="text-white/40 mt-2">This booking link is no longer active. Please contact the host.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Stepper */}
      <div className="flex justify-between max-w-xs mx-auto mb-8">
        {[
          { id: 'details', icon: Calendar },
          { id: 'id_verification', icon: UserCheck },
          { id: 'payment', icon: CreditCard }
        ].map((s, idx) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isDone = ['complete', 'payment', 'id_verification', 'details'].indexOf(step) > idx;
          
          return (
            <div key={s.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                isActive ? "bg-emerald-500 text-black" : isDone ? "bg-emerald-500/20 text-emerald-500" : "bg-white/5 text-white/20"
              }`}>
                {isDone && step !== s.id ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              {idx < 2 && <div className="w-12 h-[1px] bg-white/10 mx-2" />}
            </div>
          );
        })}
      </div>

      {step === 'details' && (
        <Card className="bg-zinc-900 border-white/10 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">Booking Details</CardTitle>
            <CardDescription>Confirm your stay for {link.listings?.title}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/5 mb-6">
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">Check-in</div>
                  <div className="text-sm text-white font-medium">{link.metadata?.startDate}</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">Total Amount</div>
                  <div className="text-sm text-emerald-400 font-bold">₹{link.amount}</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-zinc-500 uppercase font-bold">Full Name</label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter your name"
                  className="bg-black/40 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-500 uppercase font-bold">Email Address</label>
                <Input 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@example.com"
                  className="bg-black/40 border-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-zinc-500 uppercase font-bold">Phone Number</label>
                <Input 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+91 99999 99999"
                  className="bg-black/40 border-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-zinc-500 uppercase font-bold">Expected Arrival Time</label>
                <Input 
                  value={formData.arrivalTime}
                  onChange={(e) => setFormData({...formData, arrivalTime: e.target.value})}
                  placeholder="e.g. 2:00 PM"
                  className="bg-black/40 border-white/10 text-white"
                />
              </div>
              
              <Button type="submit" className="w-full bg-white text-black hover:bg-zinc-200 font-bold h-12 mt-4">
                Continue to Verification
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 'id_verification' && (
        <Card className="bg-zinc-900 border-white/10 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">ID Verification</CardTitle>
            <CardDescription>The host requires a valid ID for this stay.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center space-y-4">
              {extracting ? (
                <div className="space-y-4 py-4">
                  <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto" />
                  <div className="text-sm text-white font-medium">AI is verifying your document...</div>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                    <FileUp className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Upload Document</h3>
                    <p className="text-white/40 text-xs mt-1">Upload a clear photo of your PAN or Aadhaar card.</p>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleIdUpload} />
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline" 
                    className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                  >
                    Select Photo
                  </Button>
                </>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs text-zinc-500 uppercase font-bold">ID Number (Extracted by AI)</label>
              <Input 
                value={formData.idNumber}
                onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                placeholder="Details will appear here..."
                className="bg-black/40 border-white/10 text-white"
              />
            </div>

            <Button 
              onClick={() => setStep('payment')}
              disabled={!formData.idNumber}
              className="w-full bg-white text-black hover:bg-zinc-200 font-bold h-12"
            >
              Continue to Payment
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'payment' && (
        <Card className="bg-zinc-900 border-white/10 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">Complete Payment</CardTitle>
            <CardDescription>Securely pay the host to confirm booking.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Business QR Section */}
            {link.tenants?.business_qr_url ? (
              <div className="space-y-6 text-center">
                <div className="bg-white p-4 rounded-2xl inline-block shadow-lg">
                  <img src={link.tenants.business_qr_url} alt="Payment QR" className="w-48 h-48" />
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-white font-medium flex items-center justify-center gap-2">
                    <QrCode className="w-4 h-4 text-emerald-500" />
                    Scan to Pay with UPI
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                    UPI ID: {link.tenants.upi_id || "business@upi"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center space-y-4">
                <CreditCard className="w-12 h-12 text-emerald-500 mx-auto" />
                <Button className="w-full bg-white text-black font-bold h-12">Pay ₹{link.amount} via Gateway</Button>
              </div>
            )}

            <div className="pt-6 border-t border-white/5 space-y-4">
              <p className="text-[10px] text-zinc-500 text-center">
                Once payment is done, click the button below to notify the host.
              </p>
              <Button 
                onClick={handlePaymentComplete}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                I Have Paid
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'complete' && (
        <Card className="bg-zinc-900 border-emerald-500/20 text-center p-12 space-y-6">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500">
            <Sparkles className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Booking Confirmed!</h2>
            <p className="text-white/40">Thank you, {formData.name}. Your stay at {link.listings?.title} is all set.</p>
          </div>
          <div className="bg-white/5 p-4 rounded-xl text-left border border-white/5 space-y-2">
             <div className="flex items-center gap-2 text-xs text-white/60">
               <Calendar className="w-3 h-3" />
               Stay: {link.metadata?.startDate}
             </div>
             <div className="flex items-center gap-2 text-xs text-white/60">
               <ShieldCheck className="w-3 h-3 text-emerald-500" />
               ID Verified
             </div>
          </div>
          <Button variant="outline" className="w-full border-white/10 text-white" onClick={() => window.close()}>
            Close Portal
          </Button>
        </Card>
      )}
    </div>
  );
}
