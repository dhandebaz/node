import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createTicketAction } from "@/app/actions/customer"; // Or separate public contact action
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PageProps {
  params: Promise<{ handle: string }>;
}

async function getTenant(handle: string) {
  const admin = await getSupabaseAdmin();
  const { data } = await admin
    .from("tenants")
    .select("name, business_type, address, phone, created_at") // Add logo_url if exists
    .eq("username", handle)
    .single();
  return data;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const tenant = await getTenant(handle);
  if (!tenant) return { title: "Not Found" };

  return {
    title: `${tenant.name} | Nodebase Profile`,
    description: `Contact ${tenant.name} - ${tenant.business_type}`,
    openGraph: {
      title: tenant.name,
      description: `Official profile for ${tenant.name}`,
      type: "profile",
      username: handle,
    },
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { handle } = await params;
  const tenant = await getTenant(handle);

  if (!tenant) {
    notFound();
  }

  // Generate initials
  const initials = tenant.name
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-zinc-900 border-zinc-800 shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-8 border-b border-zinc-800">
          <div className="mx-auto w-24 h-24 relative">
             <Avatar className="w-full h-full text-2xl border-4 border-zinc-800 shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white font-bold">
                  {initials}
                </AvatarFallback>
             </Avatar>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-white">{tenant.name}</CardTitle>
            <CardDescription className="text-zinc-400 text-lg capitalize mt-1">
              {tenant.business_type?.replace(/_/g, " ")}
            </CardDescription>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm text-zinc-500 pt-2">
            {tenant.address && (
              <div className="flex items-center gap-1">
                📍 {tenant.address}
              </div>
            )}
            {tenant.phone && (
              <div className="flex items-center gap-1">
                📞 {tenant.phone}
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-8">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-center">Contact Us</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input placeholder="Your Name" className="bg-zinc-950 border-zinc-800" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="john@example.com" className="bg-zinc-950 border-zinc-800" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea placeholder="How can we help?" className="bg-zinc-950 border-zinc-800 min-h-[120px]" />
              </div>
              <Button className="w-full bg-white text-black hover:bg-zinc-200 font-bold">
                Send Message
              </Button>
            </form>
            
            <p className="text-xs text-center text-zinc-600 pt-4">
              Powered by <a href="https://nodebase.co" className="hover:text-zinc-400 transition-colors">Nodebase</a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
