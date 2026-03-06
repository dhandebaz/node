"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Loader2, MessageSquare } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  const { t } = useLanguage();
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No backend wiring yet
    console.log("Form submitted:", formState);
    alert("Thank you for your message. We will get back to you shortly.");
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-deep-red text-brand-bone relative overflow-hidden font-sans selection:bg-brand-bone/20 bg-grid-pattern">
      
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 relative z-10">
        <div className="container mx-auto px-6 text-center">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="max-w-3xl mx-auto"
          >
            <div className="inline-block border border-brand-bone/20 px-4 py-1.5 mb-8 text-xs font-mono font-bold uppercase tracking-widest bg-brand-bone/5 text-brand-bone/60">
              Contact
            </div>
            <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter mb-6 text-brand-bone leading-[0.9]">
              Get in Touch
            </h1>
            <p className="text-xl text-brand-bone/80 leading-relaxed font-light">
              Have questions about our AI Employees? We're here to help you automate your business.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto items-start">
            
            {/* Contact Information */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              <div className="p-8 rounded-3xl border border-brand-bone/10 bg-brand-bone/5 hover:bg-brand-bone/10 transition-colors">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-brand-bone/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-brand-bone" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold uppercase tracking-tight mb-2 text-brand-bone">Support</h2>
                    <p className="text-brand-bone/70 mb-4">Technical assistance and general inquiries.</p>
                    <a href="mailto:support@nodebase.space" className="text-xl font-medium text-brand-bone border-b border-brand-bone/20 hover:border-brand-bone transition-colors pb-1">
                      support@nodebase.space
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-3xl border border-brand-bone/10 bg-brand-bone/5 hover:bg-brand-bone/10 transition-colors">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-brand-bone/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-brand-bone" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold uppercase tracking-tight mb-2 text-brand-bone">Sales</h2>
                    <p className="text-brand-bone/70 mb-4">Enterprise solutions and partnership opportunities.</p>
                    <a href="mailto:sales@nodebase.space" className="text-xl font-medium text-brand-bone border-b border-brand-bone/20 hover:border-brand-bone transition-colors pb-1">
                      sales@nodebase.space
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="p-8 md:p-10 rounded-3xl border border-brand-bone/10 bg-brand-bone/5 backdrop-blur-sm"
            >
              <h2 className="text-2xl font-bold uppercase tracking-tight mb-8 text-brand-bone">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-brand-bone/80">Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Your name" 
                    className="bg-brand-bone/5 border-brand-bone/10 text-brand-bone placeholder:text-brand-bone/30 focus:border-brand-bone/30 focus:ring-brand-bone/30"
                    value={formState.name}
                    onChange={(e) => setFormState({...formState, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-brand-bone/80">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="your@email.com" 
                    className="bg-brand-bone/5 border-brand-bone/10 text-brand-bone placeholder:text-brand-bone/30 focus:border-brand-bone/30 focus:ring-brand-bone/30"
                    value={formState.email}
                    onChange={(e) => setFormState({...formState, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-brand-bone/80">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="How can we help you?" 
                    className="min-h-[150px] bg-brand-bone/5 border-brand-bone/10 text-brand-bone placeholder:text-brand-bone/30 focus:border-brand-bone/30 focus:ring-brand-bone/30 resize-none"
                    value={formState.message}
                    onChange={(e) => setFormState({...formState, message: e.target.value})}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-brand-bone text-brand-deep-red hover:bg-white font-bold tracking-wide uppercase py-6 text-lg"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </Button>
              </form>
            </motion.div>

          </div>
        </div>
      </section>
    </div>
  );
}
