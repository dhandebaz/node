import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, FileText } from "lucide-react";
import Link from "next/link";

export default function SupportPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">How can we help?</h1>
      <p className="text-zinc-400 mb-8">We're here to support your business growth.</p>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 bg-zinc-900 border-white/10 flex flex-col items-center text-center hover:border-white/20 transition-colors">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="font-semibold mb-2">Email Support</h3>
          <p className="text-sm text-zinc-400 mb-6">Get a response within 24 hours for detailed inquiries.</p>
          <Button asChild variant="outline" className="w-full">
            <a href="mailto:support@nodebase.ai">Email Us</a>
          </Button>
        </Card>

        <Card className="p-6 bg-zinc-900 border-white/10 flex flex-col items-center text-center hover:border-white/20 transition-colors">
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
            <MessageCircle className="w-6 h-6 text-green-400" />
          </div>
          <h3 className="font-semibold mb-2">WhatsApp</h3>
          <p className="text-sm text-zinc-400 mb-6">Quick answers and urgent issues during business hours.</p>
          <Button asChild variant="outline" className="w-full">
            <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer">Chat Now</a>
          </Button>
        </Card>

        <Card className="p-6 bg-zinc-900 border-white/10 flex flex-col items-center text-center hover:border-white/20 transition-colors">
          <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="font-semibold mb-2">Documentation</h3>
          <p className="text-sm text-zinc-400 mb-6">Guides on setting up your AI employee and integrations.</p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/docs">View Docs</Link>
          </Button>
        </Card>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-zinc-900/50 border border-white/5">
            <h4 className="font-medium mb-2">My AI stopped replying. What do I do?</h4>
            <p className="text-sm text-zinc-400">Check your <Link href="/dashboard/billing" className="text-blue-400 hover:underline">Wallet Balance</Link>. If your balance is zero, the AI pauses automatically. Top up to resume immediately.</p>
          </div>
          <div className="p-4 rounded-lg bg-zinc-900/50 border border-white/5">
            <h4 className="font-medium mb-2">How do I change my AI's tone?</h4>
            <p className="text-sm text-zinc-400">Go to <Link href="/dashboard/ai/settings" className="text-blue-400 hover:underline">AI Settings</Link> to adjust tone, response length, and specific instructions.</p>
          </div>
          <div className="p-4 rounded-lg bg-zinc-900/50 border border-white/5">
            <h4 className="font-medium mb-2">Is my data safe?</h4>
            <p className="text-sm text-zinc-400">Yes. We do not use your private guest conversations to train our public models. All guest IDs are encrypted.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
