"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { 
  Cloud, 
  Server, 
  Cpu, 
  HardDrive, 
  Network, 
  Terminal, 
  Monitor, 
  BrainCircuit, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Database, 
  Bot, 
  LayoutDashboard, 
  Globe, 
  Code2,
  Lock,
  Wifi,
  Mail,
  AppWindow,
  FileCode,
  Layers,
  ShoppingBag,
  Store,
  ShoppingCart,
  Plus,
  ChevronDown,
  Github,
  Gitlab,
  Box,
  Container,
  Flag
} from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";
import { NetworkBackground } from "@/components/ui/NetworkBackground";
import { LightsaberSlider } from "@/components/ui/LightsaberSlider";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { X, Search, Edit2 } from "lucide-react";

// Logo components
const Logos = () => (
  <div className="flex gap-16 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
     <span className="text-2xl font-bold tracking-tight text-white/80">OpenAI</span>
     <span className="text-2xl font-bold tracking-tight text-white/80">DeepSeek</span>
     <span className="text-2xl font-bold tracking-tight text-white/80">Mistral</span>
     <span className="text-2xl font-bold tracking-tight text-white/80">Gemini</span>
     <span className="text-2xl font-bold tracking-tight text-white/80">Claude</span>
     <span className="text-2xl font-bold tracking-tight text-white/80">Llama</span>
     <span className="text-2xl font-bold tracking-tight text-white/80">Anthropic</span>
  </div>
);

export default function NodebaseSpacePage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"shared" | "dedicated">("shared");
  const [showMigratePopup, setShowMigratePopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [migrationDomain, setMigrationDomain] = useState("");
  const [activeMigration, setActiveMigration] = useState<{ provider: string, domain: string } | null>(null);

  const hostingProviders = [
    "GoDaddy", "Bluehost", "HostGator", "SiteGround", "Hostinger", "BigRock", "Namecheap", "AWS", "DigitalOcean", "Linode", "Vultr", "Google Cloud", "Azure", "Heroku", "Hetzner"
  ].filter(p => p.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleTabChange = (tab: "shared" | "dedicated") => {
    setActiveTab(tab);
  };

  // --- SHARED STATE ---
  const [sharedStorage, setSharedStorage] = useState(10); // GB
  const [sharedBandwidth, setSharedBandwidth] = useState(100); // GB
  const [websites, setWebsites] = useState(1);
  const [computeBoost, setComputeBoost] = useState(false);
  const [addonIp, setAddonIp] = useState(false);
  const [addonBackup, setAddonBackup] = useState(false);
  const [addonEmail, setAddonEmail] = useState(false);
  const [addonSSL, setAddonSSL] = useState(false);
  const [sslType, setSslType] = useState<"free" | "comodo" | "digicert">("free");
  const [sslDropdownOpen, setSslDropdownOpen] = useState(false);
  const [addonCDN, setAddonCDN] = useState(false);
  const [addonImunify, setAddonImunify] = useState(false);
  const [sharedTotalPrice, setSharedTotalPrice] = useState(0);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  // --- DEDICATED STATE ---
  const [vcpu, setVcpu] = useState(2);
  const [ram, setRam] = useState(4);
  const [dedicatedStorage, setDedicatedStorage] = useState(100);
  const [dedicatedBandwidth, setDedicatedBandwidth] = useState(1);
  const [dediManaged, setDediManaged] = useState(false);
  const [dediSecurity, setDediSecurity] = useState(false);
  const [dediBackup, setDediBackup] = useState(false);
  const [dedicatedTotalPrice, setDedicatedTotalPrice] = useState(0);
  const [dedicatedOS, setDedicatedOS] = useState<"nodebase" | "linux" | "windows">("nodebase");

  // --- PRICING LOGIC --- CLI ANIMATION STATE ---
  const [cliLines, setCliLines] = useState([
    { text: "$ nb init my-app", color: "text-green-400" },
    { text: "Initializing project...", color: "text-white/50" }
  ]);

  // --- PRICING LOGIC: SHARED ---
  useEffect(() => {
    const basePrice = 99;
    const storagePrice = 5;
    const bandwidthPrice = 1;
    const websitePrice = 99;
    const computeBoostPrice = 299;
    const addonIpPrice = 499;
    const addonBackupPrice = 99;
    const addonEmailPrice = 149;
    const addonSSLPrice = sslType === "free" ? 0 : sslType === "comodo" ? 499 : 999;
    const addonCDNPrice = 49;
    const addonImunifyPrice = 199;

    let price = basePrice;
    price += (sharedStorage - 10) * storagePrice;
    price += (sharedBandwidth - 100) * bandwidthPrice;
    price += (websites - 1) * websitePrice;
    if (computeBoost) price += computeBoostPrice;
    if (addonIp) price += addonIpPrice;
    if (addonBackup) price += addonBackupPrice;
    if (addonEmail) price += addonEmailPrice;
    if (addonCDN) price += addonCDNPrice;
    if (addonImunify) price += addonImunifyPrice;
    if (addonSSL) price += addonSSLPrice;
    
    setSharedTotalPrice(Math.round(price));

    // Suggestions
    if (websites > 20) {
      setSuggestion(t("Consider 'Dedicated' for better isolation with 20+ sites."));
    } else if (sharedBandwidth > 800) {
      setSuggestion(t("High traffic detected. Enable 'Compute Boost'."));
      if (!computeBoost) setComputeBoost(true);
    } else {
      setSuggestion(null);
    }
  }, [sharedStorage, sharedBandwidth, websites, computeBoost, addonIp, addonBackup, addonEmail, addonSSL, sslType, addonCDN, addonImunify, t]);

  // --- PRICING LOGIC: DEDICATED ---
  useEffect(() => {
    const basePrice = 1499;
    const vcpuPrice = 400;
    const ramPrice = 200;
    const storagePrice = 3;
    const bandwidthPrice = 100;
    const managedPrice = 1999;
    const securityPrice = 499;
    const backupPrice = 499;

    let price = basePrice;
    price += (vcpu - 2) * vcpuPrice;
    price += (ram - 4) * ramPrice;
    price += (dedicatedStorage - 100) * storagePrice;
    price += (dedicatedBandwidth - 1) * bandwidthPrice;
    if (dediManaged) price += managedPrice;
    if (dediSecurity) price += securityPrice;
    if (dediBackup) price += backupPrice;
    
    setDedicatedTotalPrice(Math.round(price));
  }, [vcpu, ram, dedicatedStorage, dedicatedBandwidth, dediManaged, dediSecurity, dediBackup]);

  // --- CLI ANIMATION EFFECT ---
  useEffect(() => {
    const commands = [
      [
        { text: "$ nb init my-app", color: "text-brand-green" },
        { text: "Initializing project...", color: "text-white/50" },
        { text: "$ nb deploy .", color: "text-brand-green" },
        { text: "Deploying to Mumbai-1...", color: "text-white/50" },
        { text: "✓ Deployed: https://app.nodebase.space", color: "text-brand-green" }
      ],
      [
        { text: "$ nb scale web=5", color: "text-brand-green" },
        { text: "Scaling web dynos...", color: "text-white/50" },
        { text: "✓ Scaled to 5 instances", color: "text-brand-green" }
      ],
      [
        { text: "$ nb logs -f", color: "text-brand-green" },
        { text: "Starting log stream...", color: "text-white/50" },
        { text: "2024-02-04 10:00:01 [INFO] Request received", color: "text-brand-blue" },
        { text: "2024-02-04 10:00:02 [INFO] Processing...", color: "text-brand-blue" }
      ]
    ];
    let currentCmdIndex = 0;
    const interval = setInterval(() => {
      currentCmdIndex = (currentCmdIndex + 1) % commands.length;
      setCliLines(commands[currentCmdIndex]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stagger = {
    animate: { transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-brand-saffron/30 overflow-x-hidden">
      
      <AnimatePresence>
        {showMigratePopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMigratePopup(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Cloud className="w-8 h-6 text-brand-saffron" />
                    <h3 className="text-xl font-bold text-white">Ghar Wapsi</h3>
                  </div>
                  <p className="text-sm text-white/60">Free automated migration to India</p>
                </div>
                <button 
                  onClick={() => setShowMigratePopup(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

                {/* Content */}
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">Website Domain</label>
                    <div className="relative group">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-brand-saffron transition-colors" />
                      <input 
                        type="text"
                        placeholder="your-website.com"
                        value={migrationDomain}
                        onChange={(e) => setMigrationDomain(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand-saffron/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">Current Provider</label>
                    <div className="relative group">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-brand-saffron transition-colors" />
                      <input 
                        type="text"
                        placeholder="Search provider (e.g. GoDaddy)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand-saffron/50 transition-all"
                      />
                    </div>
                    
                    {/* Dropdown List */}
                    <div className="max-h-48 overflow-y-auto custom-scrollbar border border-white/5 rounded-xl bg-white/5 mt-2">
                      {hostingProviders.map((provider) => (
                        <button
                          key={provider}
                          onClick={() => {
                            setSelectedProvider(provider);
                            setSearchQuery(provider);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${selectedProvider === provider ? 'bg-brand-saffron/20 text-brand-saffron' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
                        >
                          {provider}
                          {selectedProvider === provider && <CheckCircle2 className="w-4 h-4" />}
                        </button>
                      ))}
                      {hostingProviders.length === 0 && (
                        <div className="px-4 py-3 text-sm text-white/30 text-center">No providers found</div>
                      )}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    if (selectedProvider && migrationDomain) {
                      setActiveMigration({ provider: selectedProvider, domain: migrationDomain });
                      setShowMigratePopup(false);
                    }
                  }}
                  className="w-full py-3 bg-brand-saffron text-black font-bold rounded-xl hover:bg-brand-saffron/90 transition-all shadow-[0_0_20px_rgba(255,153,51,0.3)] disabled:opacity-50 disabled:cursor-not-allowed" 
                  disabled={!selectedProvider || !migrationDomain}
                >
                  Start Free Migration
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--color-brand-blue)_0%,_transparent_15%)] opacity-20"></div>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-[1px]"></div>
        <NetworkBackground />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={stagger}
            className="max-w-5xl mx-auto text-center"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark text-white text-sm font-medium mb-8 border border-brand-blue/20">
              <Cloud className="w-4 h-4" />
              <span>Sovereign Cloud Infrastructure</span>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-8 leading-tight"
            >
              {t("space.hero.title")}
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              {t("space.hero.desc")}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Main Switcher & Configurator Section */}
      <section className="py-12 relative z-10" id="configurator">
        <div className="container mx-auto px-6">
          
          {/* Pill Switcher */}
          <div className="flex justify-center mb-16">
            <div className="glass-dark p-1.5 rounded-full border border-white/10 flex items-center gap-1 relative">
              {/* Active Pill Background */}
              <motion.div 
                className="absolute top-1.5 bottom-1.5 rounded-full bg-white"
                initial={false}
                animate={{ 
                  left: activeTab === "shared" ? "6px" : "50%", 
                  x: activeTab === "shared" ? 0 : 0,
                  width: activeTab === "shared" ? "calc(50% - 6px)" : "calc(50% - 6px)"
                }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
              
              <button 
                onClick={() => handleTabChange("shared")}
                className={`relative z-10 px-8 py-3 rounded-full text-sm font-bold transition-colors duration-300 w-40 flex items-center justify-center gap-2 ${activeTab === "shared" ? "text-black" : "text-white/60 hover:text-white"}`}
              >
                <Cloud className="w-4 h-4" />
                Shared
              </button>
              <button 
                onClick={() => handleTabChange("dedicated")}
                className={`relative z-10 px-8 py-3 rounded-full text-sm font-bold transition-colors duration-300 w-40 flex items-center justify-center gap-2 ${activeTab === "dedicated" ? "text-black" : "text-white/60 hover:text-white"}`}
              >
                <Server className="w-4 h-4" />
                Dedicated
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "shared" ? (
              <motion.div
                key="shared-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {/* SHARED CONFIGURATOR */}
                <div className="max-w-6xl mx-auto glass-card rounded-3xl overflow-hidden flex flex-col lg:flex-row shadow-2xl shadow-brand-blue/5 backdrop-blur-xl">
                   <div className="p-8 md:p-12 flex-1 space-y-10">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white">{t("space.shared.pricing.title")}</h2>
                            {suggestion && (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="hidden md:flex items-center gap-2 text-xs font-medium text-amber-400 bg-amber-950/30 px-3 py-1 rounded-full border border-amber-500/30"
                                >
                                    <Zap className="w-3 h-3" />
                                    {suggestion}
                                </motion.div>
                            )}
                        </div>
                        
                        {/* Shared Controls */}
                        <div className="space-y-8">
                           {/* Storage */}
                           <div className="space-y-4">
                             <div className="flex justify-between items-center">
                               <label className="font-medium text-white/70 flex items-center gap-2">
                                 <HardDrive className="w-4 h-4" /> Storage
                               </label>
                               <span className="font-bold text-lg text-white"><AnimatedCounter value={sharedStorage} suffix=" GB" /></span>
                             </div>
                             <LightsaberSlider 
                               min={10} 
                               max={100} 
                               step={10} 
                               value={sharedStorage} 
                               onChange={(v) => setSharedStorage(v)} 
                               color="blue"
                             />
                           </div>
                           {/* Bandwidth */}
                           <div className="space-y-4">
                             <div className="flex justify-between items-center">
                               <label className="font-medium text-white/70 flex items-center gap-2">
                                 <Globe className="w-4 h-4" /> Bandwidth
                               </label>
                               <span className="font-bold text-lg text-white"><AnimatedCounter value={sharedBandwidth} suffix=" GB" /></span>
                             </div>
                             <LightsaberSlider 
                               min={100} 
                               max={1000} 
                               step={100} 
                               value={sharedBandwidth} 
                               onChange={(v) => setSharedBandwidth(v)} 
                               color="blue"
                             />
                           </div>
                           {/* Websites */}
                           <div className="space-y-4">
                             <div className="flex justify-between items-center">
                               <label className="font-medium text-white/70 flex items-center gap-2">
                                 <LayoutDashboard className="w-4 h-4" /> Websites
                               </label>
                               <span className="font-bold text-lg text-white"><AnimatedCounter value={websites} /></span>
                             </div>
                             <LightsaberSlider 
                               min={1} 
                               max={50} 
                               step={1} 
                               value={websites} 
                               onChange={(v) => setWebsites(v)} 
                               color="blue"
                             />
                           </div>
                        </div>

                        {/* Compute Boost */}
                        <div className="pt-6 border-t border-dashed border-white/10">
                           <div className="flex items-start gap-4 mb-4">
                              <button onClick={() => setComputeBoost(!computeBoost)} className={`relative w-12 h-6 rounded-full transition-colors ${computeBoost ? 'bg-brand-saffron' : 'bg-white/20'}`}>
                                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${computeBoost ? 'translate-x-6' : 'translate-x-0'}`} />
                              </button>
                              <div>
                                <motion.h4 
                                  animate={computeBoost ? { x: [0, -1, 1, -1, 1, 0] } : { x: 0 }}
                                  transition={{ repeat: Infinity, duration: 0.1 }}
                                  className={`font-bold flex items-center gap-2 transition-colors duration-300 ${computeBoost ? 'text-brand-saffron drop-shadow-[0_0_15px_rgba(255,153,51,0.6)]' : 'text-white'}`}
                                >
                                  Compute Boost
                                </motion.h4>
                                <p className="text-sm text-white/60 mt-1">Dedicated resources for high-traffic sites.</p>
                              </div>
                           </div>
                           
                           <AnimatePresence>
                             {computeBoost && (
                               <motion.div 
                                 initial={{ opacity: 0, height: 0 }}
                                 animate={{ opacity: 1, height: "auto" }}
                                 exit={{ opacity: 0, height: 0 }}
                                 className="grid grid-cols-2 gap-3 pl-16 text-xs text-white/70 overflow-hidden"
                               >
                                  <div className="flex items-center gap-2"><Zap className="w-3 h-3 text-brand-saffron" /> 2x CPU Power</div>
                                  <div className="flex items-center gap-2"><Network className="w-3 h-3 text-brand-saffron" /> Priority I/O</div>
                                  <div className="flex items-center gap-2"><ShieldCheck className="w-3 h-3 text-brand-saffron" /> Isolated Worker</div>
                                  <div className="flex items-center gap-2"><Database className="w-3 h-3 text-brand-saffron" /> Enhanced Caching</div>
                               </motion.div>
                             )}
                           </AnimatePresence>
                        </div>

                        {/* Add-ons */}
                        <div className="space-y-3 pt-6 border-t border-dashed border-white/10">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {[
                                    { state: addonIp, set: setAddonIp, label: "Dedicated IP", price: "₹499", icon: Network },
                                    { state: addonBackup, set: setAddonBackup, label: "Auto Backup", price: "₹99", icon: Database },
                                    { state: addonEmail, set: setAddonEmail, label: "Pro Email", price: "₹149", icon: Mail },
                                    { 
                                        state: addonSSL, 
                                        set: setAddonSSL, 
                                        label: addonSSL ? (sslType === "free" ? "SSL: Let's Encrypt" : sslType === "comodo" ? "SSL: Comodo" : "SSL: DigiCert") : "SSL Certificate", 
                                        price: sslType === "free" ? "Free" : sslType === "comodo" ? "₹499" : "₹999", 
                                        icon: Lock,
                                        hasDropdown: true
                                    },
                                    { state: addonCDN, set: setAddonCDN, label: "Global CDN", price: "₹49", icon: Wifi },
                                    { state: addonImunify, set: setAddonImunify, label: "Imunify360", price: "₹199", icon: ShieldCheck }
                                ].map((addon, i) => (
                                    <div key={i} className="relative group/addon z-10">
                                        <button 
                                            onClick={() => {
                                                if (addon.hasDropdown) {
                                                    if (!addon.state) {
                                                        addon.set(true);
                                                        setSslDropdownOpen(true);
                                                    } else {
                                                        // If active, clicking main area toggles dropdown
                                                        setSslDropdownOpen(!sslDropdownOpen);
                                                    }
                                                } else {
                                                    addon.set(!addon.state);
                                                }
                                            }}
                                            className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left flex flex-col justify-between h-20 relative ${addon.state ? 'border-white bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'border-white/10 hover:border-white/20 text-white/70'}`}
                                        >
                                            {addon.state && <div className="absolute inset-0 bg-white/5 animate-pulse pointer-events-none" />}
                                            <div className="flex justify-between w-full relative z-10">
                                                <span className="flex items-center gap-2">
                                                  <addon.icon className={`w-4 h-4 ${addon.state ? 'text-white' : 'text-white/40 group-hover:text-white/60'}`} />
                                                  {addon.label}
                                                </span>
                                                {addon.state && (
                                                    addon.hasDropdown ? (
                                                        <ChevronDown className={`w-4 h-4 text-white transition-transform ${sslDropdownOpen ? "rotate-180" : ""}`} />
                                                    ) : (
                                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                                    )
                                                )}
                                            </div>
                                            <span className="text-xs opacity-60 ml-6 relative z-10">{addon.price}/mo</span>
                                        </button>
                                        
                                        {/* SSL Dropdown */}
                                        {addon.hasDropdown && addon.state && sslDropdownOpen && (
                                            <div className="absolute top-full left-0 right-0 mt-2 p-2 glass-dark border border-white/10 rounded-xl z-50 shadow-xl bg-black/90 backdrop-blur-xl">
                                                {[
                                                    { id: "free", label: "Let's Encrypt", price: "Free" },
                                                    { id: "comodo", label: "Comodo PositiveSSL", price: "₹499/mo" },
                                                    { id: "digicert", label: "DigiCert Standard", price: "₹999/mo" }
                                                ].map((opt) => (
                                                    <button
                                                        key={opt.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSslType(opt.id as any);
                                                            setSslDropdownOpen(false);
                                                        }}
                                                        className={`w-full text-left px-3 py-2 rounded-lg text-xs flex justify-between items-center transition-colors ${sslType === opt.id ? "bg-white/10 text-white font-medium" : "text-white/60 hover:bg-white/10 hover:text-white"}`}
                                                    >
                                                        <span>{opt.label}</span>
                                                        <span>{opt.price}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                      </div>
                   </div>

                   {/* Shared Summary */}
                   <div className="p-8 md:p-12 lg:w-96 flex flex-col justify-between relative overflow-hidden shrink-0 border-l border-white/10 bg-white/5">
                      <div className="absolute inset-0 bg-brand-blue/5 opacity-20"></div>
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="mb-6">
                            <div className="w-12 h-12 glass-dark rounded-xl flex items-center justify-center mb-6 relative">
                               <Cloud className="w-6 h-6 text-white" />
                               {activeMigration ? (
                                 <motion.div 
                                   initial={{ opacity: 0, scale: 0.9 }}
                                   animate={{ opacity: 1, scale: 1 }}
                                   className="absolute left-full ml-4 whitespace-nowrap px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30 text-xs font-bold text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)] flex items-center gap-3 pr-2"
                                 >
                                   <motion.div 
                                     animate={{ rotate: [0, 10, -10, 0] }}
                                     transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                     className="flex-shrink-0"
                                   >
                                     <Flag className="w-5 h-3.5 rounded-sm shadow-sm" />
                                   </motion.div>
                                   <div className="flex flex-col leading-none gap-0.5">
                                     <span className="text-[10px] opacity-70 font-normal">Migrating {activeMigration.domain}</span>
                                     <span>from {activeMigration.provider}</span>
                                   </div>
                                   <button 
                                     onClick={() => setShowMigratePopup(true)}
                                     className="ml-1 p-1 rounded-full hover:bg-green-500/20 transition-colors"
                                   >
                                     <Edit2 className="w-3 h-3 text-green-400" />
                                   </button>
                                 </motion.div>
                               ) : (
                                 <motion.button 
                                   onClick={() => setShowMigratePopup(true)}
                                   initial={{ opacity: 0, x: -10 }}
                                   animate={{ opacity: 1, x: 0 }}
                                   className="absolute left-full ml-4 whitespace-nowrap px-3 py-1 rounded-full bg-brand-saffron/20 border border-brand-saffron/30 text-xs font-bold text-brand-saffron shadow-[0_0_15px_rgba(255,153,51,0.3)] flex items-center gap-1 hover:bg-brand-saffron/30 transition-colors cursor-pointer group/pill"
                                 >
                                   <motion.div 
                                     animate={{ opacity: [1, 0.5, 1] }} 
                                     transition={{ duration: 1.5, repeat: Infinity }} 
                                     className="w-1.5 h-1.5 rounded-full bg-brand-saffron group-hover/pill:scale-125 transition-transform" 
                                   />
                                   <Flag className="w-4 h-2.5 rounded-[1px] mr-1" />
                                   Migrate to India
                                 </motion.button>
                               )}
                            </div>
                            <h3 className="text-xl font-medium text-white/80 mb-2">Estimated Cost</h3>
                            <div className="flex items-baseline gap-1">
                               <span className="text-5xl font-bold tracking-tight text-white">
                                 {t("space.common.currency")}{sharedTotalPrice}
                               </span>
                               <span className="text-white/60">/mo</span>
                            </div>
                        </div>

                        {/* Configuration List */}
                        <div className="flex-1 overflow-y-auto min-h-[200px] mb-6 space-y-2 pr-2 custom-scrollbar">
                           <AnimatePresence mode="popLayout">
                               <motion.div 
                                 layout
                                 initial={{ opacity: 0, x: -10 }} 
                                 animate={{ opacity: 1, x: 0 }} 
                                 exit={{ opacity: 0, x: -10 }}
                                 className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                               >
                                  <Monitor className="w-4 h-4 text-white" />
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium text-white capitalize">
                                      {dedicatedOS === "nodebase" ? "Nodebase OS" : dedicatedOS}
                                    </span>
                                    <span className="text-xs text-white/50">Operating System</span>
                                  </div>
                               </motion.div>

                               <motion.div 
                                 layout
                                 initial={{ opacity: 0, x: -10 }} 
                                 animate={{ opacity: 1, x: 0 }} 
                                 exit={{ opacity: 0, x: -10 }}
                                 className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                               >
                                  <HardDrive className="w-4 h-4 text-white" />
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium text-white">{sharedStorage} GB</span>
                                    <span className="text-xs text-white/50">NVMe Storage {sharedStorage > 10 && `(+ ₹${(sharedStorage - 10) * 5})`}</span>
                                  </div>
                               </motion.div>
                               
                               <motion.div 
                                 layout
                                 initial={{ opacity: 0, x: -10 }} 
                                 animate={{ opacity: 1, x: 0 }} 
                                 exit={{ opacity: 0, x: -10 }}
                                 className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5"
                               >
                                  <Globe className="w-4 h-4 text-white" />
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium text-white">{sharedBandwidth} GB</span>
                                    <span className="text-xs text-white/50">Bandwidth {sharedBandwidth > 100 && `(+ ₹${(sharedBandwidth - 100) * 1})`}</span>
                                  </div>
                               </motion.div>

                               <motion.div 
                                 layout
                                 initial={{ opacity: 0, x: -10 }} 
                                 animate={{ opacity: 1, x: 0 }} 
                                 exit={{ opacity: 0, x: -10 }}
                                 className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5"
                               >
                                  <LayoutDashboard className="w-4 h-4 text-white" />
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium text-white">{websites} Website{websites > 1 ? 's' : ''}</span>
                                    <span className="text-xs text-white/50">Host Limit {websites > 1 && `(+ ₹${(websites - 1) * 99})`}</span>
                                  </div>
                               </motion.div>

                               {computeBoost && (
                                   <motion.div 
                                     layout
                                     initial={{ opacity: 0, scale: 0.8 }} 
                                     animate={{ opacity: 1, scale: 1 }} 
                                     exit={{ opacity: 0, scale: 0.8 }}
                                     className="flex items-center gap-3 p-3 rounded-lg bg-brand-saffron/10 border border-brand-saffron/20"
                                   >
                                      <Zap className="w-4 h-4 text-brand-saffron" />
                                      <div className="flex flex-col">
                                        <span className="text-sm font-medium text-white">Compute Boost</span>
                                        <span className="text-xs text-white/50">2x Performance</span>
                                      </div>
                                   </motion.div>
                               )}

                               {addonIp && (
                                   <motion.div key="addonIp" layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                                      <Network className="w-4 h-4 text-white" />
                                      <span className="text-sm text-white">Dedicated IP</span>
                                   </motion.div>
                               )}
                               {addonBackup && (
                                   <motion.div key="addonBackup" layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                                      <Database className="w-4 h-4 text-white" />
                                      <span className="text-sm text-white">Auto Backups</span>
                                   </motion.div>
                               )}
                               {addonEmail && (
                                   <motion.div key="addonEmail" layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                                      <Mail className="w-4 h-4 text-white" />
                                      <span className="text-sm text-white">Pro Email</span>
                                   </motion.div>
                               )}
                               {addonCDN && (
                                   <motion.div key="addonCDN" layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                                      <Wifi className="w-4 h-4 text-white" />
                                      <span className="text-sm text-white">Global CDN</span>
                                   </motion.div>
                               )}
                               {addonImunify && (
                                   <motion.div key="addonImunify" layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                                      <ShieldCheck className="w-4 h-4 text-white" />
                                      <span className="text-sm text-white">Imunify360</span>
                                   </motion.div>
                               )}
                               {addonSSL && (
                                   <motion.div key="addonSSL" layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                                      <Lock className="w-4 h-4 text-white" />
                                      <span className="text-sm text-white">Premium SSL</span>
                                   </motion.div>
                               )}
                           </AnimatePresence>
                        </div>

                        <div className="relative z-10 mt-auto">
                           <button className="w-full py-4 bg-white text-black hover:bg-gray-200 font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mb-6">
                             Deploy Shared <ArrowRight className="w-4 h-4" />
                           </button>

                           {/* 1-Click Apps */}
                           <div className="pt-6 border-t border-white/10">
                              <p className="text-xs text-white/40 mb-3 uppercase tracking-wider font-semibold">1-Click Apps</p>
                              <div className="flex flex-wrap items-center justify-between gap-y-4 gap-x-2 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                                 {/* WordPress */}
                                 <div className="flex flex-col items-center gap-1 group">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-blue-500/50 transition-colors">
                                      <AppWindow className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <span className="text-[9px] text-white/60">WordPress</span>
                                 </div>
                                 {/* Joomla */}
                                 <div className="flex flex-col items-center gap-1 group">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-orange-500/50 transition-colors">
                                      <Layers className="w-5 h-5 text-orange-400" />
                                    </div>
                                    <span className="text-[9px] text-white/60">Joomla</span>
                                 </div>
                                 {/* Drupal */}
                                 <div className="flex flex-col items-center gap-1 group">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-cyan-500/50 transition-colors">
                                      <FileCode className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <span className="text-[9px] text-white/60">Drupal</span>
                                 </div>
                                 {/* PrestaShop */}
                                 <div className="flex flex-col items-center gap-1 group">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-pink-500/50 transition-colors">
                                      <Store className="w-5 h-5 text-pink-400" />
                                    </div>
                                    <span className="text-[9px] text-white/60">PrestaShop</span>
                                 </div>

                                 {/* 100+ More Badge */}
                                 <div className="flex flex-col items-center gap-1 group">
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-colors">
                                      <Plus className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-[9px] font-bold text-white">100+ More</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                      </div>
                   </div>
                </div>

                {/* Shared Tech Specs */}
                <div className="mt-20 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { icon: Cpu, title: "Optimized Stack", desc: "CloudLinux OS + Litespeed Web Server" },
                        { icon: Zap, title: "Litespeed Cache", desc: "Built-in server-level caching" },
                        { icon: Database, title: "MariaDB / MySQL", desc: "High performance database clusters" },
                        { icon: Bot, title: "PHP Selector", desc: "Support for PHP 7.4 through 8.3" },
                        { icon: ShieldCheck, title: "Imunify360", desc: "AI-Powered Malware Protection" },
                        { icon: Code2, title: "Node.js & Python", desc: "Run modern apps alongside PHP" },
                        { icon: Layers, title: "JetBackup", desc: "7-day rolling offsite backups" },
                        { icon: Lock, title: "Auto SSL", desc: "Free certificates for all domains" },
                    ].map((spec, i) => (
                        <motion.div 
                            key={i}
                            variants={fadeInUp}
                            initial="initial"
                            whileInView="animate"
                            viewport={{ once: true, delay: i * 0.1 }}
                            className="p-6 rounded-2xl glass-card hover:bg-white/10 transition-colors"
                        >
                            <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center mb-4 text-white">
                                <spec.icon className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-white mb-2">{spec.title}</h3>
                            <p className="text-sm text-white/60">{spec.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Shared Comparison */}
                <div className="mt-20 max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold text-center mb-10 text-white">Why Nodebase Shared?</h3>
                    <div className="glass-card rounded-3xl overflow-hidden">
                        <div className="grid grid-cols-3 bg-white/5 p-4 font-bold text-sm md:text-base border-b border-white/10 text-white">
                            <div className="pl-4">Feature</div>
                            <div className="text-center text-white">Nodebase</div>
                            <div className="text-center text-white/50">Others</div>
                        </div>
                        <div className="divide-y divide-white/10 text-white/80 text-sm">
                            {[
                                { f: "Websites", u: `${websites} Isolated Site${websites > 1 ? 's' : ''}`, o: "Shared App Pool" },
                                { f: "Storage", u: `${sharedStorage} GB NVMe`, o: "SATA / HDD" },
                                { f: "Bandwidth", u: `${sharedBandwidth} GB Premium`, o: "Metered Traffic" },
                                { f: "Performance", u: "Litespeed Enterprise", o: "Apache / Nginx" },
                                { f: "Isolation", u: "CageFS (Per User)", o: "Shared Kernel" },
                                { f: "Security", u: "Imunify360 AI", o: "Basic Firewall" },
                                { f: "Control Panel", u: "Nodebase Cloud", o: "cPanel / Plesk" },
                                { f: "SSL", u: "Auto-Install (Free)", o: "Manual / Paid" },
                                { f: "Migration", u: "Free Automated", o: "Manual / Paid" },
                                { f: "Backups", u: "Daily Offsite", o: "Weekly / Paid" },
                                { f: "Uptime", u: "99.9% SLA", o: "No Guarantee" },
                                { f: "SSH Access", u: "Full Shell", o: "Restricted" },
                                { f: "File Limit", u: "Unlimited Inodes", o: "600k Limit" },
                                { f: "FTP Users", u: "Unlimited", o: "Limited" },
                            ].map((row, i) => (
                                <div key={i} className="grid grid-cols-3 p-4 hover:bg-white/10 transition-colors">
                                    <div className="pl-4 font-medium text-white">{row.f}</div>
                                    <div className="text-center text-white font-bold">{row.u}</div>
                                    <div className="text-center text-white/40">{row.o}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Built for Creators (Shared Features) */}
                <section className="py-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-brand-blue/5 opacity-20"></div>
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-4xl font-bold mb-6 text-white">Built for Creators</h2>
                            <p className="text-xl text-white/60 mb-8 leading-relaxed">
                                Everything you need to launch, grow, and scale your digital presence without the technical headaches.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="p-8 rounded-3xl glass-card hover:border-brand-blue/30 transition-all group">
                                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Zap className="w-7 h-7 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Blazing Fast Speed</h3>
                                <p className="text-white/60 leading-relaxed">
                                    Litespeed Enterprise web server with LSCache ensures your WordPress sites load up to <span className="text-white font-medium">80x faster</span> than standard Apache hosting.
                                </p>
                            </div>

                            <div className="p-8 rounded-3xl glass-card hover:border-green-500/30 transition-all group">
                                <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <ShieldCheck className="w-7 h-7 text-green-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Fortified Security</h3>
                                <p className="text-white/60 leading-relaxed">
                                    Imunify360 provides real-time malware scanning, WAF, and proactive defense. We patch vulnerabilities before they can be exploited.
                                </p>
                            </div>

                            <div className="p-8 rounded-3xl glass-card hover:border-purple-500/30 transition-all group">
                                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Database className="w-7 h-7 text-purple-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Data Safety</h3>
                                <p className="text-white/60 leading-relaxed">
                                    We take data seriously. JetBackup automatically snapshots your account daily to an offsite location. Restore files or databases in one click.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
                {/* Dedicated Tech Specs & Comparison moved to Dedicated tab */}
              </motion.div>
            ) : (
              <motion.div
                key="dedicated-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {/* DEDICATED CONFIGURATOR */}
                <div className="max-w-6xl mx-auto glass-card rounded-3xl overflow-hidden flex flex-col lg:flex-row shadow-2xl shadow-brand-blue/5 backdrop-blur-xl">
                   <div className="p-8 md:p-12 flex-1 space-y-10">
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white">{t("space.dedicated.config.title")}</h2>
                        
                        {/* Dedicated Controls */}
                        <div className="space-y-8">
                           {/* Operating System */}
                           <div className="space-y-4">
                             <div className="flex justify-between items-center">
                               <label className="font-medium text-white/70 flex items-center gap-2">
                                 <Monitor className="w-4 h-4" /> Operating System
                               </label>
                             </div>
                             <div className="grid grid-cols-3 gap-2">
                               {[
                                 { id: "nodebase", label: "Nodebase OS", icon: Cloud },
                                 { id: "linux", label: "Linux", icon: Terminal },
                                 { id: "windows", label: "Windows", icon: AppWindow },
                               ].map((os) => (
                                 <button
                                   key={os.id}
                                   onClick={() => setDedicatedOS(os.id as any)}
                                   className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all relative overflow-hidden ${
                                     dedicatedOS === os.id
                                       ? "bg-white/10 border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                                       : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                                   }`}
                                 >
                                   {dedicatedOS === os.id && <div className="absolute inset-0 bg-white/5 animate-pulse" />}
                                   <os.icon className="w-5 h-5 relative z-10" />
                                   <span className="text-xs font-medium relative z-10">{os.label}</span>
                                 </button>
                               ))}
                             </div>
                           </div>

                           {/* vCPU */}
                           <div className="space-y-4">
                             <div className="flex justify-between items-center">
                               <label className="font-medium text-white/70 flex items-center gap-2">
                                 <Cpu className="w-4 h-4" /> vCPU Cores
                               </label>
                               <span className="font-bold text-lg text-white"><AnimatedCounter value={vcpu} suffix=" Cores" /></span>
                             </div>
                             <LightsaberSlider 
                               min={2} 
                               max={32} 
                               step={2} 
                               value={vcpu} 
                               onChange={(v) => setVcpu(v)} 
                               color="saffron"
                             />
                           </div>
                           {/* RAM */}
                           <div className="space-y-4">
                             <div className="flex justify-between items-center">
                               <label className="font-medium text-white/70 flex items-center gap-2">
                                 <Server className="w-4 h-4" /> RAM
                               </label>
                               <span className="font-bold text-lg text-white"><AnimatedCounter value={ram} suffix=" GB" /></span>
                             </div>
                             <LightsaberSlider 
                               min={4} 
                               max={128} 
                               step={4} 
                               value={ram} 
                               onChange={(v) => setRam(v)} 
                               color="saffron"
                             />
                           </div>
                           {/* Storage */}
                           <div className="space-y-4">
                             <div className="flex justify-between items-center">
                               <label className="font-medium text-white/70 flex items-center gap-2">
                                 <HardDrive className="w-4 h-4" /> NVMe Storage
                               </label>
                               <span className="font-bold text-lg text-white"><AnimatedCounter value={dedicatedStorage} suffix=" GB" /></span>
                             </div>
                             <LightsaberSlider 
                               min={100} 
                               max={4000} 
                               step={100} 
                               value={dedicatedStorage} 
                               onChange={(v) => setDedicatedStorage(v)} 
                               color="saffron"
                             />
                           </div>
                        </div>

                        {/* Dedicated Add-ons */}
                        <div className="space-y-3 pt-6 border-t border-dashed border-white/10">
                            <h3 className="font-semibold text-sm uppercase tracking-wider text-white/60">Infrastructure Add-ons</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[
                                    { state: dediManaged, set: setDediManaged, label: "Fully Managed", price: "₹1999" },
                                    { state: dediSecurity, set: setDediSecurity, label: "Adv. Security", price: "₹499" },
                                    { state: dediBackup, set: setDediBackup, label: "Daily Snapshots", price: "₹499" }
                                ].map((addon, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => addon.set(!addon.state)}
                                        className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left flex flex-col justify-between h-20 relative overflow-hidden ${addon.state ? 'border-white bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'border-white/10 hover:border-white/20 text-white/70'}`}
                                    >
                                        {addon.state && <div className="absolute inset-0 bg-white/5 animate-pulse" />}
                                        <div className="flex justify-between w-full relative z-10">
                                            <span>{addon.label}</span>
                                            {addon.state && <CheckCircle2 className="w-4 h-4 text-white" />}
                                        </div>
                                        <span className="text-xs opacity-60 relative z-10">{addon.price}/mo</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                      </div>
                   </div>

                   {/* Dedicated Summary */}
                   <div className="p-8 md:p-12 lg:w-96 flex flex-col justify-between relative overflow-hidden shrink-0 border-l border-white/10 bg-white/5">
                      <div className="absolute inset-0 bg-brand-blue/5 opacity-20"></div>
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="mb-6">
                            <div className="w-12 h-12 glass-dark rounded-xl flex items-center justify-center mb-6 relative">
                               <Server className="w-6 h-6 text-white" />
                               {activeMigration ? (
                                 <motion.div 
                                   initial={{ opacity: 0, scale: 0.9 }}
                                   animate={{ opacity: 1, scale: 1 }}
                                   className="absolute left-full ml-4 whitespace-nowrap px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30 text-xs font-bold text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)] flex items-center gap-3 pr-2"
                                 >
                                   <motion.div 
                                     animate={{ rotate: [0, 10, -10, 0] }}
                                     transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                     className="flex-shrink-0"
                                   >
                                     <Flag className="w-5 h-3.5 rounded-sm shadow-sm" />
                                   </motion.div>
                                   <div className="flex flex-col leading-none gap-0.5">
                                     <span className="text-[10px] opacity-70 font-normal">Migrating {activeMigration.domain}</span>
                                     <span>from {activeMigration.provider}</span>
                                   </div>
                                   <button 
                                     onClick={() => setShowMigratePopup(true)}
                                     className="ml-1 p-1 rounded-full hover:bg-green-500/20 transition-colors"
                                   >
                                     <Edit2 className="w-3 h-3 text-green-400" />
                                   </button>
                                 </motion.div>
                               ) : (
                                 <motion.button 
                                   onClick={() => setShowMigratePopup(true)}
                                   initial={{ opacity: 0, x: -10 }}
                                   animate={{ opacity: 1, x: 0 }}
                                   className="absolute left-full ml-4 whitespace-nowrap px-3 py-1 rounded-full bg-brand-saffron/20 border border-brand-saffron/30 text-xs font-bold text-brand-saffron shadow-[0_0_15px_rgba(255,153,51,0.3)] flex items-center gap-1 hover:bg-brand-saffron/30 transition-colors cursor-pointer group/pill"
                                 >
                                   <motion.div 
                                     animate={{ opacity: [1, 0.5, 1] }} 
                                     transition={{ duration: 1.5, repeat: Infinity }} 
                                     className="w-1.5 h-1.5 rounded-full bg-brand-saffron group-hover/pill:scale-125 transition-transform" 
                                   />
                                   <Flag className="w-4 h-2.5 rounded-[1px] mr-1" />
                                   Migrate to India
                                 </motion.button>
                               )}
                            </div>
                            <h3 className="text-xl font-medium text-white/80 mb-2">Estimated Cost</h3>
                            <div className="flex items-baseline gap-1">
                               <span className="text-5xl font-bold tracking-tight text-white">
                                 {t("space.common.currency")}{dedicatedTotalPrice}
                               </span>
                               <span className="text-white/60">/mo</span>
                            </div>
                        </div>

                        {/* Configuration List */}
                        <div className="flex-1 overflow-y-auto min-h-[200px] mb-6 space-y-2 pr-2 custom-scrollbar">
                           <AnimatePresence mode="popLayout">
                               <motion.div 
                                 key="dediCpu"
                                 layout
                                 initial={{ opacity: 0, x: -10 }} 
                                 animate={{ opacity: 1, x: 0 }} 
                                 exit={{ opacity: 0, x: -10 }}
                                 className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5"
                               >
                                  <Cpu className="w-4 h-4 text-white" />
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium text-white">{vcpu} vCPU</span>
                                    <span className="text-xs text-white/50">Dedicated Cores {vcpu > 2 && `(+ ₹${(vcpu - 2) * 400})`}</span>
                                  </div>
                               </motion.div>
                               
                               <motion.div 
                                 key="dediRam"
                                 layout
                                 initial={{ opacity: 0, x: -10 }} 
                                 animate={{ opacity: 1, x: 0 }} 
                                 exit={{ opacity: 0, x: -10 }}
                                 className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5"
                               >
                                  <Server className="w-4 h-4 text-white" />
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium text-white">{ram} GB RAM</span>
                                    <span className="text-xs text-white/50">ECC Memory {ram > 4 && `(+ ₹${(ram - 4) * 200})`}</span>
                                  </div>
                               </motion.div>

                               <motion.div 
                                 key="dediStorage"
                                 layout
                                 initial={{ opacity: 0, x: -10 }} 
                                 animate={{ opacity: 1, x: 0 }} 
                                 exit={{ opacity: 0, x: -10 }}
                                 className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5"
                               >
                                  <HardDrive className="w-4 h-4 text-white" />
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium text-white">{dedicatedStorage} GB</span>
                                    <span className="text-xs text-white/50">NVMe Storage {dedicatedStorage > 100 && `(+ ₹${(dedicatedStorage - 100) * 3})`}</span>
                                  </div>
                               </motion.div>

                               {dediManaged && (
                                   <motion.div key="dediManaged" layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                                      <Terminal className="w-4 h-4 text-white" />
                                      <span className="text-sm text-white">Fully Managed</span>
                                   </motion.div>
                               )}
                               {dediSecurity && (
                                   <motion.div key="dediSecurity" layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                                      <ShieldCheck className="w-4 h-4 text-white" />
                                      <span className="text-sm text-white">Adv. Security</span>
                                   </motion.div>
                               )}
                               {dediBackup && (
                                   <motion.div key="dediBackup" layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                                      <Database className="w-4 h-4 text-white" />
                                      <span className="text-sm text-white">Daily Snapshots</span>
                                   </motion.div>
                               )}
                           </AnimatePresence>
                        </div>

                        <div className="relative z-10 mt-auto">
                           <button className="w-full py-4 bg-white text-black hover:bg-gray-200 font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mb-6">
                             Deploy Dedicated <ArrowRight className="w-4 h-4" />
                           </button>

                           {/* 1-Click Deploy */}
                           <div className="pt-6 border-t border-white/10">
                              <p className="text-xs text-white/40 mb-3 uppercase tracking-wider font-semibold">1-Click Deploy</p>
                              <div className="flex flex-wrap items-center justify-between gap-y-4 gap-x-2 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                                 {/* GitHub */}
                                 <div className="flex flex-col items-center gap-1 group">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-white/50 transition-colors">
                                      <Github className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-[9px] text-white/60">GitHub</span>
                                 </div>
                                 {/* GitLab */}
                                 <div className="flex flex-col items-center gap-1 group">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-orange-500/50 transition-colors">
                                      <Gitlab className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <span className="text-[9px] text-white/60">GitLab</span>
                                 </div>
                                 {/* Docker */}
                                 <div className="flex flex-col items-center gap-1 group">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-blue-500/50 transition-colors">
                                      <Container className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <span className="text-[9px] text-white/60">Docker</span>
                                 </div>
                                 {/* Kubernetes */}
                                 <div className="flex flex-col items-center gap-1 group">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-blue-400/50 transition-colors">
                                      <Box className="w-5 h-5 text-blue-300" />
                                    </div>
                                    <span className="text-[9px] text-white/60">Kubernetes</span>
                                 </div>

                                 {/* 100+ More Badge */}
                                 <div className="flex flex-col items-center gap-1 group">
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-colors">
                                      <Plus className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-[9px] font-bold text-white">100+ More</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                      </div>
                   </div>
                </div>

                {/* Dedicated Tech Specs */}
                <div className="mt-20 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { icon: Terminal, title: "Root Access", desc: "Full control over your environment" },
                        { icon: Monitor, title: "Custom OS", desc: "Ubuntu, Debian, CentOS, AlmaLinux" },
                        { icon: BrainCircuit, title: "AI Ready", desc: "Optimized for LLM inference & training" },
                        { icon: ShieldCheck, title: "DDoS Shield", desc: "Enterprise-grade protection included" },
                        { icon: Network, title: "Private VLAN", desc: "Isolated 10Gbps internal network" },
                        { icon: Layers, title: "Hardware RAID", desc: "Redundant NVMe storage arrays" },
                        { icon: Lock, title: "IPMI / KVM", desc: "Secure out-of-band management" },
                        { icon: Globe, title: "Global Fabric", desc: "Low-latency Anycast routing" },
                    ].map((spec, i) => (
                        <motion.div 
                            key={i}
                            variants={fadeInUp}
                            initial="initial"
                            whileInView="animate"
                            viewport={{ once: true, delay: i * 0.1 }}
                            className="p-6 rounded-2xl glass-card hover:bg-white/10 transition-colors"
                        >
                            <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center mb-4 text-white">
                                <spec.icon className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-white mb-2">{spec.title}</h3>
                            <p className="text-sm text-white/60">{spec.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Dedicated Comparison */}
                <div className="mt-20 max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold text-center mb-10 text-white">Why Nodebase Dedicated?</h3>
                    <div className="glass-card rounded-3xl overflow-hidden">
                        <div className="grid grid-cols-3 bg-white/5 p-4 font-bold text-sm md:text-base border-b border-white/10 text-white">
                            <div className="pl-4">Feature</div>
                            <div className="text-center text-white">Nodebase</div>
                            <div className="text-center text-white/50">Others</div>
                        </div>
                        <div className="divide-y divide-white/10 text-white/80 text-sm">
                            {[
                                { f: "vCPU Cores", u: `${vcpu} Dedicated Cores`, o: "Shared vCPU" },
                                { f: "RAM", u: `${ram} GB DDR4 ECC`, o: "Non-ECC" },
                                { f: "Storage", u: `${dedicatedStorage} GB NVMe`, o: "SSD / HDD" },
                                { f: "Resources", u: "100% Dedicated", o: "Noisy Neighbors" },
                                { f: "Network", u: `${dedicatedBandwidth} Gbps Unmetered`, o: "1 Gbps / Metered" },
                                { f: "Uplink", u: "Tier-1 Premium", o: "Budget Mix" },
                                { f: "Anti-DDoS", u: "Path.net + Corero", o: "Basic / None" },
                                { f: "Setup", u: "Instant (< 60s)", o: "24-48 Hours" },
                                { f: "Root Access", u: "Full Root", o: "Restricted" },
                                { f: "Virtualization", u: "KVM (Kernel-based)", o: "Container / OpenVZ" },
                                { f: "Hardware", u: "AMD EPYC / Intel Xeon", o: "Older Gen" },
                                { f: "Snapshots", u: "Instant & Daily", o: "Manual / Paid" },
                                { f: "VNC / IPMI", u: "Included", o: "Paid Addon" },
                                { f: "Sovereignty", u: "Data Stays in India", o: "Uncertain" },
                            ].map((row, i) => (
                                <div key={i} className="grid grid-cols-3 p-4 hover:bg-white/10 transition-colors">
                                    <div className="pl-4 font-medium text-white">{row.f}</div>
                                    <div className="text-center text-white font-bold">{row.u}</div>
                                    <div className="text-center text-white/40">{row.o}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

      {/* Sovereign Intelligence (MCP & LLM) */}
      <section className="py-24 bg-black overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-saffron/5 rounded-full blur-3xl opacity-50"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark text-brand-saffron text-sm font-medium mb-6 border border-brand-saffron/20">
                <Code2 className="w-4 h-4" />
                <span>Model Context Protocol</span>
              </div>
              <h2 className="text-4xl font-bold mb-6 text-white">{t("space.mcp.title")}</h2>
              <p className="text-xl text-white/60 mb-8 leading-relaxed">
                {t("space.mcp.desc")}
              </p>
          </div>

          {/* Logo Marquee */}
          <div className="w-full overflow-hidden mb-20 relative">
             <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black to-transparent z-10"></div>
             <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black to-transparent z-10"></div>
             <div className="flex whitespace-nowrap animate-scroll gap-16">
                <Logos />
                <Logos />
                <Logos />
                <Logos />
             </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
             {/* MCP Details */}
             <div className="space-y-6">
                <div className="flex gap-4 p-6 rounded-xl glass-card hover:bg-white/10 transition-colors">
                  <div className="w-12 h-12 bg-white/10 rounded-xl shadow-sm border border-white/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-6 h-6 text-brand-saffron" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1 text-white">AI Agent Native</h3>
                    <p className="text-white/60">Standardized context for Kaisa and other agents.</p>
                  </div>
                </div>
                <div className="flex gap-4 p-6 rounded-xl glass-card hover:bg-white/10 transition-colors">
                  <div className="w-12 h-12 bg-white/10 rounded-xl shadow-sm border border-white/10 flex items-center justify-center flex-shrink-0">
                    <Database className="w-6 h-6 text-brand-saffron" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1 text-white">{t("space.llm.title")}</h3>
                    <p className="text-white/60">{t("space.llm.desc")}</p>
                  </div>
                </div>
             </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-brand-saffron/20 blur-3xl rounded-full opacity-20"></div>
              <div className="glass-dark rounded-2xl shadow-xl p-8 relative z-10">
                <div className="font-mono text-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-white/50 ml-2">mcp.config.json</span>
                  </div>
                  <div className="text-blue-400">
                    <span className="text-purple-400">"model"</span>: <span className="text-green-400">"llama-3-70b-instruct"</span>,
                  </div>
                  <div className="text-blue-400">
                    <span className="text-purple-400">"region"</span>: <span className="text-green-400">"ind-mum-1"</span>,
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Experience (CLI) */}
      <section className="py-24 glass-dark text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-brand-blue/20 opacity-20"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-16 max-w-6xl mx-auto">
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center gap-2 text-brand-saffron font-medium">
                <Terminal className="w-5 h-5" />
                <span>Developer First</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white">{t("space.dev.title")}</h2>
              <p className="text-xl text-white/70 leading-relaxed">
                {t("space.dev.desc")}
              </p>
            </div>
            <div className="flex-1 w-full">
              <div className="bg-black/80 rounded-xl border border-white/10 p-6 font-mono text-sm md:text-base shadow-2xl backdrop-blur-sm">
                <div className="flex gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="space-y-2 text-white/90">
                  {cliLines.map((line, i) => (
                    <p key={i} className={line.color}>{line.text}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

    </div>
  );
}
