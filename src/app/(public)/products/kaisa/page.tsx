"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, 
  MessageSquare, 
  CheckCircle2, 
  Home, 
  Stethoscope, 
  ShoppingBag, 
  ArrowRight,
  Sparkles,
  Bot,
  Zap,
  ShieldCheck,
  Database,
  Globe,
  Smartphone,
  Mail,
  Calendar,
  Users,
  Box,
  Headphones,
  Check,
  X,
  ChevronDown,
  BrainCircuit,
  Store,
  Crown,
  UserCheck,
  Receipt,
  Share2,
  CalendarDays,
  Coins,
  ChevronRight,
  Plug
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { LightsaberSlider } from "@/components/ui/LightsaberSlider";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { NetworkBackground } from "@/components/ui/NetworkBackground";

const getIntegrationIcon = (toolName: string) => {
  const map: Record<string, string> = {
    "WhatsApp Business": "whatsapp.png",
    "Google Calendar": "google-calendar.png",
    "Practo": "practo.png",
    "Kareo": "kareo.png",
    "Airbnb": "airbnb.png",
    "Booking.com": "booking.png",
    "WhatsApp": "whatsapp.png",
    "Google Sheets": "google-sheets.png",
    "Google Business Profile": "google-business-profile.png",
    "JustDial": "justdial.png",
    "Tally": "tally.png",
    "Razorpay": "razorpay.png",
    "Zoho Books": "zoho-books.png",
    "WhatsApp Pay": "whatsapp.png",
    "Stripe": "stripe.png",
    "PayPal": "paypal.png",
    "Excel": "excel.png",
    "Vyapar": "vyapar.png",
    "Khatabook": "khatabook.png",
    "Pine Labs": "pinelabs.png",
    "Instagram": "instagram.png",
    "Google Maps": "google-maps.png",
    "Facebook": "facebook.png",
    "Canva": "canva.png",
    "TripAdvisor": "tripadvisor.png",
    "Pinterest": "pinterest.png",
    "Instagram Shop": "instagram.png",
    "Facebook Marketplace": "facebook.png",
    "WhatsApp Status": "whatsapp.png",
  };
  
  return map[toolName] ? `/images/integrations/${map[toolName]}` : null;
};

export default function KaisaPage() {
  const { t } = useLanguage();

  // --- CONFIGURATOR STATE ---
  const [businessType, setBusinessType] = useState<"doctor" | "homestay" | "retail">("doctor");
  const [wageBalance, setWageBalance] = useState(100);
  const [frontdesk, setFrontdesk] = useState(true);
  const [billing, setBilling] = useState(false);
  const [socialMedia, setSocialMedia] = useState(false);
  const [managerType, setManagerType] = useState<"none" | "manager" | "cofounder">("none");
  const [totalPrice, setTotalPrice] = useState(0);

  // --- PRICING LOGIC ---
  useEffect(() => {
    const basePrice = 99; // Price per employee type
    const managerPrice = 299;
    const cofounderPrice = 999;

    let price = 0; // Start at 0, base price is now per employee
    
    // Wage Balance is SEPARATE from monthly subscription
    // It is a one-time top-up, not a recurring monthly fee
    // So we DON'T add wageBalance to the monthly total here

    // Employee Types
    if (frontdesk) price += basePrice;
    if (billing) price += basePrice;
    if (socialMedia) price += basePrice;

    // Manager Type
    if (managerType === "manager") price += managerPrice;
    if (managerType === "cofounder") price += cofounderPrice;

    setTotalPrice(Math.round(price));
  }, [wageBalance, frontdesk, billing, socialMedia, managerType]);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedEmployee(expandedEmployee === id ? null : id);
  };

  const getEmployeeDetails = (type: string, business: string) => {
    switch(type) {
      case "frontdesk":
        if (business === "doctor") return {
          desc: "Handles patient inquiries, books appointments, sends reminders, and manages your clinic's schedule automatically.",
          integrations: ["WhatsApp Business", "Google Calendar", "Practo", "Kareo"]
        };
        if (business === "homestay") return {
          desc: "Manages guest check-ins, handles booking inquiries from Airbnb/Booking.com, and coordinates arrival times.",
          integrations: ["Airbnb", "Booking.com", "WhatsApp", "Google Sheets"]
        };
        if (business === "retail") return {
          desc: "Answers customer calls about product availability, store timings, and handles general support queries.",
          integrations: ["WhatsApp Business", "Google Business Profile", "JustDial"]
        };
        return { desc: "", integrations: [] };
      case "billing":
        if (business === "doctor") return {
          desc: "Generates invoices for consultations, tracks pending payments, and sends payment links via WhatsApp.",
          integrations: ["Tally", "Razorpay", "Zoho Books", "WhatsApp Pay"]
        };
        if (business === "homestay") return {
          desc: "Creates bills for room charges and food, collects advance payments, and settles final accounts.",
          integrations: ["Stripe", "PayPal", "Excel", "WhatsApp Pay"]
        };
        if (business === "retail") return {
          desc: "Creates digital invoices, tracks 'khata' (credit) for customers, and sends payment reminders.",
          integrations: ["Vyapar", "Khatabook", "Tally", "Pine Labs"]
        };
        return { desc: "", integrations: [] };
      case "social":
        if (business === "doctor") return {
          desc: "Posts health tips, clinic updates, and replies to comments on Google Maps and Instagram.",
          integrations: ["Instagram", "Google Maps", "Facebook", "Canva"]
        };
        if (business === "homestay") return {
          desc: "Shares photos of your property, guest reviews, and local attractions on social media.",
          integrations: ["Instagram", "Facebook", "TripAdvisor", "Pinterest"]
        };
        if (business === "retail") return {
          desc: "Posts new arrivals, daily offers, and replies to customer queries on Instagram/Facebook.",
          integrations: ["Instagram Shop", "Facebook Marketplace", "WhatsApp Status"]
        };
        return { desc: "", integrations: [] };
      default: return { desc: "", integrations: [] };
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-brand-saffron/30 overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--color-brand-saffron)_0%,_transparent_15%)] opacity-20"></div>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-[1px]"></div>
        <NetworkBackground />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={stagger}
            className="max-w-5xl mx-auto text-center"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark text-brand-saffron text-sm font-medium mb-8 border border-brand-saffron/20">
              <Sparkles className="w-4 h-4" />
              <span>Agentic AI Manager</span>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-8 leading-tight"
            >
              {t("kaisa.hero.title")}
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              {t("kaisa.hero.desc")}
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#configurator" className="px-8 py-4 bg-brand-saffron text-white rounded-full font-medium hover:bg-brand-saffron/90 transition-all shadow-lg shadow-brand-saffron/20 flex items-center gap-2">
                Configure Kaisa
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Configurator Section */}
      <section className="py-12 relative z-10" id="configurator">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto glass-card rounded-3xl overflow-hidden flex flex-col lg:flex-row shadow-2xl shadow-brand-saffron/5">
             <div className="p-8 md:p-12 flex-1 space-y-10">
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">Design Your Agent</h2>
                  
                  {/* Business Type */}
                  <div className="space-y-4">
                    <label className="font-medium text-white/70 flex items-center gap-2 mb-4">
                       <Store className="w-4 h-4" /> Business Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "doctor", label: "Doctor", icon: Stethoscope },
                        { id: "homestay", label: "Homestay", icon: Home },
                        { id: "retail", label: "Retail", icon: ShoppingBag },
                      ].map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setBusinessType(type.id as any)}
                          className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all relative overflow-hidden h-24 ${
                            businessType === type.id
                              ? "bg-brand-saffron/10 border-brand-saffron text-white shadow-[0_0_15px_rgba(255,153,51,0.2)]"
                              : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <type.icon className={`w-6 h-6 ${businessType === type.id ? 'text-brand-saffron' : 'text-white/40'}`} />
                          <span className="text-xs font-medium relative z-10">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Wage Balance */}
                  <div className="space-y-4">
                     <div className="flex justify-between items-center">
                       <label className="font-medium text-white/70 flex items-center gap-2">
                         <Coins className="w-4 h-4" /> Wage Balance
                       </label>
                       <span className="font-bold text-lg text-white">₹<AnimatedCounter value={wageBalance} /></span>
                     </div>
                     <LightsaberSlider 
                       min={100} 
                       max={5000} 
                       step={100} 
                       value={wageBalance} 
                       onChange={(v) => setWageBalance(v)} 
                       color="saffron"
                     />
                     <p className="text-xs text-white/40">This balance is used to pay for tasks performed by your agent (e.g., ₹2 per chat).</p>
                  </div>

                  {/* Kaisa Employee Types */}
                  <div className="space-y-4 pt-6 border-t border-dashed border-white/10">
                    <label className="font-medium text-white/70 flex items-center gap-2 mb-4">
                       <Users className="w-4 h-4" /> Kaisa Employee Types
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                        {/* Frontdesk */}
                        <div className={`rounded-xl border transition-all overflow-hidden ${frontdesk ? 'border-brand-saffron/50 bg-brand-saffron/10 text-white shadow-[0_0_15px_rgba(255,153,51,0.2)]' : 'border-white/10 hover:border-white/20 text-white/70'}`}>
                            <button onClick={() => setFrontdesk(!frontdesk)} className="w-full px-4 py-3 text-sm font-medium text-left flex items-center justify-between h-20 relative">
                                <div className="flex items-center gap-2 relative z-10">
                                    <CalendarDays className={`w-5 h-5 ${frontdesk ? 'text-brand-saffron' : 'text-white/40'}`} /> 
                                    <div className="flex flex-col">
                                        <span>Frontdesk</span>
                                        <span className="text-xs opacity-60 font-normal">₹99/mo</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 relative z-10">
                                    <div 
                                        onClick={(e) => toggleExpand('frontdesk', e)}
                                        className="p-1 hover:bg-white/10 rounded-full transition-colors"
                                    >
                                        <ChevronRight className={`w-4 h-4 transition-transform ${expandedEmployee === 'frontdesk' ? 'rotate-90' : ''}`} />
                                    </div>
                                    {frontdesk && <CheckCircle2 className="w-5 h-5 text-brand-saffron" />}
                                </div>
                            </button>
                            <AnimatePresence>
                                {expandedEmployee === 'frontdesk' && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="px-4 pb-4 text-xs text-white/60 border-t border-white/5 pt-3"
                                    >
                                        <p className="mb-3 leading-relaxed">
                                          {getEmployeeDetails("frontdesk", businessType).desc}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                          {getEmployeeDetails("frontdesk", businessType).integrations.map((tool, i) => {
                                            const iconPath = getIntegrationIcon(tool);
                                            return (
                                              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-white/50">
                                                {iconPath ? (
                                                  <Image src={iconPath} alt={tool} width={12} height={12} className="w-3 h-3 object-contain" />
                                                ) : (
                                                  <Plug className="w-3 h-3" />
                                                )}
                                                {tool}
                                              </span>
                                            );
                                          })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Billing */}
                        <div className={`rounded-xl border transition-all overflow-hidden ${billing ? 'border-brand-saffron/50 bg-brand-saffron/10 text-white shadow-[0_0_15px_rgba(255,153,51,0.2)]' : 'border-white/10 hover:border-white/20 text-white/70'}`}>
                            <button onClick={() => setBilling(!billing)} className="w-full px-4 py-3 text-sm font-medium text-left flex items-center justify-between h-20 relative">
                                <div className="flex items-center gap-2 relative z-10">
                                    <Receipt className={`w-5 h-5 ${billing ? 'text-brand-saffron' : 'text-white/40'}`} /> 
                                    <div className="flex flex-col">
                                        <span>Billing</span>
                                        <span className="text-xs opacity-60 font-normal">₹99/mo</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 relative z-10">
                                    <div 
                                        onClick={(e) => toggleExpand('billing', e)}
                                        className="p-1 hover:bg-white/10 rounded-full transition-colors"
                                    >
                                        <ChevronRight className={`w-4 h-4 transition-transform ${expandedEmployee === 'billing' ? 'rotate-90' : ''}`} />
                                    </div>
                                    {billing && <CheckCircle2 className="w-5 h-5 text-brand-saffron" />}
                                </div>
                            </button>
                            <AnimatePresence>
                                {expandedEmployee === 'billing' && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="px-4 pb-4 text-xs text-white/60 border-t border-white/5 pt-3"
                                    >
                                        <p className="mb-3 leading-relaxed">
                                          {getEmployeeDetails("billing", businessType).desc}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                          {getEmployeeDetails("billing", businessType).integrations.map((tool, i) => {
                                            const iconPath = getIntegrationIcon(tool);
                                            return (
                                              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-white/50">
                                                {iconPath ? (
                                                  <Image src={iconPath} alt={tool} width={12} height={12} className="w-3 h-3 object-contain" />
                                                ) : (
                                                  <Plug className="w-3 h-3" />
                                                )}
                                                {tool}
                                              </span>
                                            );
                                          })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Social Media Manager */}
                        <div className={`rounded-xl border transition-all overflow-hidden ${socialMedia ? 'border-brand-saffron/50 bg-brand-saffron/10 text-white shadow-[0_0_15px_rgba(255,153,51,0.2)]' : 'border-white/10 hover:border-white/20 text-white/70'}`}>
                            <button onClick={() => setSocialMedia(!socialMedia)} className="w-full px-4 py-3 text-sm font-medium text-left flex items-center justify-between h-20 relative">
                                <div className="flex items-center gap-2 relative z-10">
                                    <Share2 className={`w-5 h-5 ${socialMedia ? 'text-brand-saffron' : 'text-white/40'}`} /> 
                                    <div className="flex flex-col">
                                        <span>Social Media</span>
                                        <span className="text-xs opacity-60 font-normal">₹99/mo</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 relative z-10">
                                    <div 
                                        onClick={(e) => toggleExpand('social', e)}
                                        className="p-1 hover:bg-white/10 rounded-full transition-colors"
                                    >
                                        <ChevronRight className={`w-4 h-4 transition-transform ${expandedEmployee === 'social' ? 'rotate-90' : ''}`} />
                                    </div>
                                    {socialMedia && <CheckCircle2 className="w-5 h-5 text-brand-saffron" />}
                                </div>
                            </button>
                            <AnimatePresence>
                                {expandedEmployee === 'social' && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="px-4 pb-4 text-xs text-white/60 border-t border-white/5 pt-3"
                                    >
                                        <p className="mb-3 leading-relaxed">
                                          {getEmployeeDetails("social", businessType).desc}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                          {getEmployeeDetails("social", businessType).integrations.map((tool, i) => {
                                            const iconPath = getIntegrationIcon(tool);
                                            return (
                                              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-white/50">
                                                {iconPath ? (
                                                  <Image src={iconPath} alt={tool} width={12} height={12} className="w-3 h-3 object-contain" />
                                                ) : (
                                                  <Plug className="w-3 h-3" />
                                                )}
                                                {tool}
                                              </span>
                                            );
                                          })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                  </div>

                  {/* Manager Level */}
                  <div className="space-y-4 pt-6 border-t border-dashed border-white/10">
                    <label className="font-medium text-white/70 flex items-center gap-2 mb-4">
                       <Crown className="w-4 h-4" /> Role
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: "manager", label: "Kaisa Manager", price: "₹299", icon: UserCheck, desc: "Handles daily tasks & ops" },
                        { id: "cofounder", label: "Kaisa Co-founder", price: "₹999", icon: Crown, desc: "Strategy, growth & decisions" },
                      ].map((level) => (
                        <button
                          key={level.id}
                          onClick={() => setManagerType(managerType === level.id ? "none" : level.id as any)}
                          className={`flex flex-col items-start justify-center gap-2 p-4 rounded-xl border transition-all relative overflow-hidden h-28 ${
                            managerType === level.id
                              ? "bg-brand-saffron/10 border-brand-saffron text-white shadow-[0_0_15px_rgba(255,153,51,0.2)]"
                              : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <div className="flex justify-between w-full">
                             <level.icon className={`w-5 h-5 ${managerType === level.id ? 'text-brand-saffron' : 'text-white/40'}`} />
                             <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded-md">{level.price}</span>
                          </div>
                          <div className="text-left">
                            <span className="text-sm font-bold block mb-1">{level.label}</span>
                            <span className="text-xs text-white/40 leading-tight">{level.desc}</span>
                          </div>
                          {managerType === level.id && (
                            <div className="absolute top-2 right-2">
                              <CheckCircle2 className="w-4 h-4 text-brand-saffron" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
             </div>

             {/* Summary Panel */}
             <div className="p-8 md:p-12 lg:w-96 flex flex-col justify-between relative overflow-hidden shrink-0 border-l border-white/10 bg-white/5">
                <div className="absolute inset-0 bg-brand-saffron/5 opacity-20"></div>
                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-6">
                      <div className="w-12 h-12 glass-dark rounded-xl flex items-center justify-center mb-6 relative">
                         <Bot className="w-6 h-6 text-brand-saffron" />
                      </div>
                      
                      {/* Subscription Cost */}
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-white/60 mb-1">Monthly Subscription</h3>
                        <div className="flex items-baseline gap-1">
                           <span className="text-4xl font-bold tracking-tight text-white">
                             ₹{totalPrice}
                           </span>
                           <span className="text-white/60">/mo</span>
                        </div>
                      </div>

                      {/* Wage Balance Top-up */}
                      <div>
                        <h3 className="text-sm font-medium text-white/60 mb-1 flex items-center gap-2">
                           <Coins className="w-3 h-3 text-brand-saffron" /> Initial Wage Top-up
                        </h3>
                        <div className="flex items-baseline gap-1">
                           <span className="text-2xl font-bold tracking-tight text-brand-saffron">
                             ₹{wageBalance}
                           </span>
                           <span className="text-brand-saffron/60 text-sm">one-time</span>
                        </div>
                      </div>
                  </div>

                  {/* Config List */}
                  <div className="flex-1 overflow-y-auto min-h-[200px] mb-6 space-y-2 pr-2 custom-scrollbar">
                     <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                        <Coins className="w-4 h-4 text-brand-saffron" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-white">₹{wageBalance} Credit</span>
                          <span className="text-xs text-white/50">One-time Top-up</span>
                        </div>
                     </div>
                     
                     {frontdesk && (
                       <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                          <CalendarDays className="w-4 h-4 text-white" />
                          <span className="text-sm text-white">Frontdesk</span>
                       </div>
                     )}
                     {billing && (
                       <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                          <Receipt className="w-4 h-4 text-white" />
                          <span className="text-sm text-white">Billing</span>
                       </div>
                     )}
                     {socialMedia && (
                       <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                          <Share2 className="w-4 h-4 text-white" />
                          <span className="text-sm text-white">Social Media</span>
                       </div>
                     )}

                     {managerType !== "none" && (
                       <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                          {managerType === "manager" ? <UserCheck className="w-4 h-4 text-white" /> : <Crown className="w-4 h-4 text-brand-saffron" />}
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-white capitalize">{managerType === "manager" ? "Kaisa Manager" : "Kaisa Co-founder"}</span>
                          </div>
                       </div>
                     )}
                  </div>

                  <div className="relative z-10 mt-auto">
                     <button className="w-full py-4 bg-brand-saffron text-black hover:bg-brand-saffron/90 font-bold rounded-xl transition-all shadow-lg shadow-brand-saffron/20 flex items-center justify-center gap-2 mb-4">
                       Hire Kaisa <ArrowRight className="w-4 h-4" />
                     </button>
                     <p className="text-xs text-center text-white/40">7-day free trial. No credit card required.</p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 bg-black relative">
        <div className="container mx-auto px-6">
           <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-white">Why Hire Kaisa?</h2>
              <div className="glass-card rounded-3xl overflow-hidden">
                  <div className="grid grid-cols-3 bg-white/5 p-5 font-bold text-sm md:text-base border-b border-white/10 text-white">
                      <div className="pl-4">Feature</div>
                      <div className="text-center text-brand-saffron">Kaisa AI</div>
                      <div className="text-center text-white/50">Human Manager</div>
                  </div>
                  <div className="divide-y divide-white/10 text-white/80 text-sm">
                      {[
                          { f: "Availability", u: "24/7/365", o: "9 AM - 6 PM" },
                          { f: "Response Time", u: "Instant (< 1s)", o: "Minutes / Hours" },
                          { f: "Multilingual", u: "12+ Indian Languages", o: "1 - 2 Languages" },
                          { f: "Memory", u: "Perfect Recall", o: "Forgets Details" },
                          { f: "Scaling", u: "Infinite Concurrent Chats", o: "1 Chat at a time" },
                          { f: "Cost", u: "Starts ₹999/mo", o: "₹15,000+/mo" },
                          { f: "Training", u: "Pre-trained", o: "Weeks of training" },
                      ].map((row, i) => (
                          <div key={i} className="grid grid-cols-3 p-5 hover:bg-white/10 transition-colors">
                              <div className="pl-4 font-medium text-white">{row.f}</div>
                              <div className="text-center text-brand-saffron font-bold">{row.u}</div>
                              <div className="text-center text-white/40">{row.o}</div>
                          </div>
                      ))}
                  </div>
              </div>
           </div>
        </div>
      </section>

      {/* Capabilities / Specs */}
      <section className="py-24 bg-black relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
            <h2 className="text-3xl font-bold text-center mb-12 text-white">Core Capabilities</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {[
                    { icon: Mic, title: "Voice Native", desc: "Understands Hinglish, Tamil, Telugu voice notes perfectly." },
                    { icon: ShieldCheck, title: "Secure Guard", desc: "Enterprise-grade encryption for all customer data." },
                    { icon: Zap, title: "Action Engine", desc: "Can actually click buttons and fill forms for you." },
                    { icon: BrainCircuit, title: "Context Aware", desc: "Remembers customer preferences from months ago." },
                ].map((spec, i) => (
                    <motion.div 
                        key={i}
                        variants={fadeInUp}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true, delay: i * 0.1 }}
                        className="p-6 rounded-2xl glass-card hover:bg-white/10 transition-colors"
                    >
                        <div className="w-10 h-10 bg-brand-saffron/10 border border-brand-saffron/20 rounded-lg flex items-center justify-center mb-4 text-brand-saffron">
                            <spec.icon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-white mb-2">{spec.title}</h3>
                        <p className="text-sm text-white/60">{spec.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>

    </div>
  );
}
