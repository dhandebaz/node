import type { LucideIcon } from "lucide-react";
import {
  Bot,
  MessageSquare,
  Mic,
  Eye,
  ShieldCheck,
  CreditCard,
  Phone,
  Calendar,
  Users,
  Zap,
  Globe,
  BarChart3,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";

export type ComparisonTool = {
  id: string;
  name: string;
  slug: string;
  logo: string;
  tagline: string;
  website: string;
  pricing: {
    starting: string;
    model: string;
    perUser: boolean;
  };
  rating: number;
  reviewCount: number;
  category: "crm" | "chatbot" | "omnichannel" | "industry";
  description: string;
};

export type ComparisonFeature = {
  name: string;
  nodebase: boolean | string;
  competitor: boolean | string;
  note?: string;
};

export type ComparisonCategory = {
  name: string;
  icon: LucideIcon;
  features: ComparisonFeature[];
};

export const comparisonTools: ComparisonTool[] = [
  {
    id: "kommo",
    name: "Kommo",
    slug: "kommo",
    logo: "/logos/kommo.svg",
    tagline: "The world's first Messenger-based CRM",
    website: "https://kommo.com",
    pricing: {
      starting: "$15-45",
      model: "per user/month",
      perUser: true,
    },
    rating: 4.5,
    reviewCount: 2847,
    category: "crm",
    description: "Conversational CRM that helps businesses manage client communications and sales through messaging apps.",
  },
  {
    id: "respondio",
    name: "Respond.io",
    slug: "respondio",
    logo: "/logos/respondio.svg",
    tagline: "AI-powered Customer Conversation Management",
    website: "https://respond.io",
    pricing: {
      starting: "$79-349",
      model: "per month",
      perUser: true,
    },
    rating: 4.8,
    reviewCount: 1243,
    category: "omnichannel",
    description: "Unifies messaging channels with AI agents for sales and support teams.",
  },
  {
    id: "wati",
    name: "Wati",
    slug: "wati",
    logo: "/logos/wati.svg",
    tagline: "WhatsApp Business API Solution for Sales & Support",
    website: "https://wati.io",
    pricing: {
      starting: "$49-299",
      model: "per month",
      perUser: false,
    },
    rating: 4.6,
    reviewCount: 892,
    category: "chatbot",
    description: "WhatsApp Business API solution focused on Indian market with no-code chatbots.",
  },
  {
    id: "interakt",
    name: "Interakt",
    slug: "interakt",
    logo: "/logos/interakt.svg",
    tagline: "Drive Revenue with WhatsApp Business API",
    website: "https://interakt.ai",
    pricing: {
      starting: "$39-199",
      model: "per month",
      perUser: false,
    },
    rating: 4.4,
    reviewCount: 567,
    category: "chatbot",
    description: "WhatsApp-first business messaging platform for customer engagement.",
  },
  {
    id: "intercom",
    name: "Intercom",
    slug: "intercom",
    logo: "/logos/intercom.svg",
    tagline: "The Business Messaging Platform",
    website: "https://intercom.com",
    pricing: {
      starting: "$74-137",
      model: "per month",
      perUser: true,
    },
    rating: 4.5,
    reviewCount: 4521,
    category: "omnichannel",
    description: "Customer messaging platform for sales, support, and marketing with AI-powered bots.",
  },
  {
    id: "zendesk",
    name: "Zendesk",
    slug: "zendesk",
    logo: "/logos/zendesk.svg",
    tagline: "Customer Service Software & Sales CRM",
    website: "https://zendesk.com",
    pricing: {
      starting: "$55-155",
      model: "per agent/month",
      perUser: true,
    },
    rating: 4.3,
    reviewCount: 6234,
    category: "omnichannel",
    description: "Enterprise customer service and engagement platform with ticketing and CRM features.",
  },
  {
    id: "freshdesk",
    name: "Freshdesk",
    slug: "freshdesk",
    logo: "/logos/freshdesk.svg",
    tagline: "Delight Your Customers with Great Service",
    website: "https://freshdesk.com",
    pricing: {
      starting: "$15-79",
      model: "per agent/month",
      perUser: true,
    },
    rating: 4.4,
    reviewCount: 3892,
    category: "omnichannel",
    description: "SMB-focused customer support software with omnichannel ticketing and automation.",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    slug: "hubspot",
    logo: "/logos/hubspot.svg",
    tagline: "CRM Platform for Scaling Companies",
    website: "https://hubspot.com",
    pricing: {
      starting: "$50-5000",
      model: "per month",
      perUser: true,
    },
    rating: 4.4,
    reviewCount: 8921,
    category: "crm",
    description: "Inbound marketing, sales, and service software with integrated CRM and chat capabilities.",
  },
  {
    id: "drift",
    name: "Drift",
    slug: "drift",
    logo: "/logos/drift.svg",
    tagline: "Revenue Acceleration Platform",
    website: "https://drift.com",
    pricing: {
      starting: "$2000",
      model: "per month",
      perUser: false,
    },
    rating: 4.2,
    reviewCount: 1245,
    category: "chatbot",
    description: "Conversational marketing and sales platform focused on lead qualification and meetings.",
  },
  {
    id: "livechat",
    name: "LiveChat",
    slug: "livechat",
    logo: "/logos/livechat.svg",
    tagline: "Customer Service Software for Real-Time Support",
    website: "https://livechat.com",
    pricing: {
      starting: "$20-59",
      model: "per agent/month",
      perUser: true,
    },
    rating: 4.5,
    reviewCount: 2156,
    category: "chatbot",
    description: "Live chat software with AI-powered bots, co-browsing, and customer analytics.",
  },
  {
    id: "botpress",
    name: "Botpress",
    slug: "botpress",
    logo: "/logos/botpress.svg",
    tagline: "The Autonomous AI Agents Platform",
    website: "https://botpress.com",
    pricing: {
      starting: "$49-499",
      model: "per month",
      perUser: false,
    },
    rating: 4.6,
    reviewCount: 987,
    category: "chatbot",
    description: "Open-source conversational AI platform with customizable chatbots and enterprise features.",
  },
];

export const comparisonCategories: Record<string, ComparisonCategory> = {
  ai: {
    name: "AI Capabilities",
    icon: Bot,
    features: [
      { name: "Domain-Specific AI Agents", nodebase: true, competitor: false, note: "Host AI, Nurse AI, Dukan AI, Thrift AI" },
      { name: "Generic Chatbot Only", nodebase: false, competitor: true },
      { name: "AI Memory & Context", nodebase: true, competitor: false, note: "Kaisa AI memory layer" },
      { name: "AI Response Suggestions", nodebase: true, competitor: true },
      { name: "AI Training on Business Rules", nodebase: true, competitor: false },
      { name: "Custom AI Personality", nodebase: true, competitor: false },
    ],
  },
  voice: {
    name: "Voice & Telephony",
    icon: Mic,
    features: [
      { name: "Voice Calls (Telephony)", nodebase: true, competitor: false, note: "Twilio integration included" },
      { name: "IVR System", nodebase: true, competitor: false },
      { name: "Voice Recording", nodebase: true, competitor: "Partial" },
      { name: "Call Routing", nodebase: true, competitor: false },
      { name: "Voicemail to Text", nodebase: true, competitor: false },
    ],
  },
  vision: {
    name: "Vision & OCR",
    icon: Eye,
    features: [
      { name: "Vision/OCR Capabilities", nodebase: true, competitor: false, note: "Nodebase Eyes" },
      { name: "Document Scanning", nodebase: true, competitor: false },
      { name: "ID Verification (KYC)", nodebase: true, competitor: false },
      { name: "Aadhaar Masking", nodebase: true, competitor: false },
      { name: "Receipt Scanning", nodebase: true, competitor: false },
    ],
  },
  compliance: {
    name: "Compliance & Security",
    icon: ShieldCheck,
    features: [
      { name: "Automated KYC", nodebase: true, competitor: false },
      { name: "Consent Management", nodebase: true, competitor: false },
      { name: "PII Masking", nodebase: true, competitor: false },
      { name: "Audit Trails", nodebase: true, competitor: true },
      { name: "GDPR Compliance", nodebase: true, competitor: true },
      { name: "Data Encryption", nodebase: true, competitor: true },
    ],
  },
  messaging: {
    name: "Messaging Channels",
    icon: MessageSquare,
    features: [
      { name: "WhatsApp", nodebase: true, competitor: true },
      { name: "Instagram", nodebase: true, competitor: true },
      { name: "Facebook Messenger", nodebase: true, competitor: true },
      { name: "Airbnb Integration", nodebase: true, competitor: false },
      { name: "Booking.com Integration", nodebase: true, competitor: false },
      { name: "Google Business Messages", nodebase: true, competitor: false },
      { name: "Telegram", nodebase: true, competitor: true },
    ],
  },
  integrations: {
    name: "Integrations",
    icon: Globe,
    features: [
      { name: "Razorpay Payments", nodebase: true, competitor: false },
      { name: "Stripe Payments", nodebase: true, competitor: true },
      { name: "Google Calendar", nodebase: true, competitor: false },
      { name: "Calendar Sync", nodebase: true, competitor: false },
      { name: "Zapier/Make", nodebase: true, competitor: true },
      { name: "API Access", nodebase: true, competitor: true },
    ],
  },
  pricing: {
    name: "Pricing & Value",
    icon: CreditCard,
    features: [
      { name: "Starting Price (USD)", nodebase: "$12/mo", competitor: "$79-349/mo" },
      { name: "Unlimited Users", nodebase: true, competitor: false },
      { name: "No Per-User Fees", nodebase: true, competitor: false },
      { name: "Flat Pricing", nodebase: true, competitor: false },
      { name: "Voice Included", nodebase: true, competitor: false, note: "Extra $200+/mo elsewhere" },
      { name: "Vision Included", nodebase: true, competitor: false },
    ],
  },
  business: {
    name: "Business Model",
    icon: Users,
    features: [
      { name: "Domain-Specific Solutions", nodebase: true, competitor: false },
      { name: "Multi-tenant Architecture", nodebase: true, competitor: false },
      { name: "Team Management", nodebase: true, competitor: true },
      { name: "Role-based Permissions", nodebase: true, competitor: true },
      { name: "Custom Workflows", nodebase: true, competitor: true },
    ],
  },
};

export const getComparisonContent = (slug: string) => {
  const tool = comparisonTools.find((t) => t.slug === slug);
  if (!tool) return null;

  const contents: Record<string, { sections: { title: string; content: string }[]; pros: string[]; cons: string[] }> = {
    kommo: {
      sections: [
        {
          title: "What is Kommo?",
          content: "Kommo (formerly Elomart) is a Messenger-based CRM designed for small and medium businesses. It combines customer messaging with sales pipeline management, offering AI-powered features for automation.",
        },
        {
          title: "Kommo's Strengths",
          content: "Kommo excels in visual sales pipelines and lead tracking. Their AI features include conversation summaries and smart reply suggestions. The platform has a strong presence in real estate, travel, and retail sectors.",
        },
        {
          title: "Where NodeBase Wins",
          content: "NodeBase offers domain-specific AI agents that understand your business from day one, whereas Kommo provides generic chatbot capabilities. NodeBase includes Voice and Vision features that Kommo doesn't offer, all at a fraction of the cost.",
        },
        {
          title: "Pricing Comparison",
          content: "Kommo charges $15-45 per user per month, which can escalate quickly for growing teams. NodeBase offers a flat ₹999/month (~$12) with unlimited users, voice, vision, and KYC included.",
        },
      ],
      pros: [
        "Visual sales pipeline management",
        "Strong lead tracking features",
        "Multi-channel inbox",
        "Automation templates",
        "Mobile apps available",
      ],
      cons: [
        "Per-user pricing model",
        "Basic AI only",
        "No voice capabilities",
        "No vision/OCR",
        "No built-in KYC",
        "Can be expensive at scale",
      ],
    },
    respondio: {
      sections: [
        {
          title: "What is Respond.io?",
          content: "Respond.io is an AI-powered customer conversation management platform that unifies WhatsApp, Instagram, Facebook, and other channels. It positions itself as a 'all-in-one' solution for sales and support teams.",
        },
        {
          title: "Respond.io's Strengths",
          content: "Respond.io has strong integration capabilities and a solid API. Their AI agents can handle routine queries and route conversations. They offer good reporting and analytics dashboards.",
        },
        {
          title: "Where NodeBase Wins",
          content: "While Respond.io offers AI agents, they're generic and require extensive setup. NodeBase provides domain-specific AI agents (Host AI, Nurse AI, Dukan AI, Thrift AI) that understand your industry immediately. Plus, NodeBase includes Voice and Vision at no extra cost.",
        },
        {
          title: "Cost Reality Check",
          content: "Respond.io's 'Growth' plan starts at $159/month, but that's before user fees ($12/5 users), AI add-ons, and WhatsApp API charges. For a 10-person team, expect $300-500/month easily. NodeBase is a flat ₹999/month with everything included.",
        },
      ],
      pros: [
        "Multi-channel unification",
        "Good API documentation",
        "Workflow automation",
        "Mobile apps",
        "Strong analytics",
      ],
      cons: [
        "Expensive at scale",
        "Voice requires $279+ tier",
        "Generic AI agents",
        "No vision capabilities",
        "AI add-ons cost extra",
        "Per-user fees stack up",
      ],
    },
    wati: {
      sections: [
        {
          title: "What is Wati?",
          content: "Wati is a WhatsApp Business API solution focused on the Indian market. It offers no-code chatbots, broadcast messaging, and team inbox features primarily for WhatsApp-focused operations.",
        },
        {
          title: "Wati's Strengths",
          content: "Wati has strong WhatsApp integration and is popular in India for its simple setup. They offer broadcast campaigns, contact management, and basic automation without technical expertise.",
        },
        {
          title: "Where NodeBase Wins",
          content: "Wati is essentially a WhatsApp tool with chatbot capabilities. NodeBase is a complete AI workforce platform that handles WhatsApp, Instagram, Airbnb, Booking.com, voice calls, document scanning, and KYC - all in one unified system.",
        },
        {
          title: "Beyond WhatsApp",
          content: "If your business relies solely on WhatsApp, Wati might work. But modern businesses operate across multiple channels. NodeBase unifies all channels with intelligent routing and domain-specific AI that works across platforms.",
        },
      ],
      pros: [
        "Simple WhatsApp setup",
        "Popular in India",
        "No-code chatbot builder",
        "Broadcast campaigns",
        "Affordable for basic needs",
      ],
      cons: [
        "WhatsApp-focused only",
        "No voice capabilities",
        "No vision/OCR",
        "Basic AI features",
        "Limited integrations",
        "Not enterprise-ready",
      ],
    },
    interakt: {
      sections: [
        {
          title: "What is Interakt?",
          content: "Interakt is a WhatsApp Business API solution similar to Wati, focused on helping businesses in India engage customers through WhatsApp with messaging, automation, and analytics.",
        },
        {
          title: "Interakt's Strengths",
          content: "Interakt offers WhatsApp-focused messaging, basic chatbot capabilities, and campaign management. It's positioned as an affordable alternative for small businesses in India.",
        },
        {
          title: "Where NodeBase Wins",
          content: "Interakt, like Wati, is essentially a WhatsApp marketing tool. NodeBase is a comprehensive AI workforce platform designed for businesses that need more than just WhatsApp messaging.",
        },
        {
          title: "The Complete Solution",
          content: "NodeBase replaces multiple tools: WhatsApp marketing, scheduling software, payment links, KYC verification, and customer support - all with AI that understands your specific business context.",
        },
      ],
      pros: [
        "WhatsApp Business API",
        "Simple interface",
        "Campaign broadcasting",
        "Affordable pricing",
        "Good for startups",
      ],
      cons: [
        "Single-channel focus",
        "No voice integration",
        "No document handling",
        "Generic automation",
        "Limited AI capabilities",
        "Not multi-channel",
      ],
    },
    intercom: {
      sections: [
        {
          title: "What is Intercom?",
          content: "Intercom is a customer messaging platform that combines chat, email, and product tours for sales and support teams. They offer Fin AI for automated responses and extensive customization options.",
        },
        {
          title: "Intercom's Strengths",
          content: "Intercom excels in product-led growth strategies with targeted messages and onboarding flows. Their Fin AI agent handles support queries well, and the platform integrates deeply with popular CRMs.",
        },
        {
          title: "Where NodeBase Wins",
          content: "Intercom is excellent for product companies but lacks domain expertise. NodeBase provides industry-specific AI agents that understand hospitality, healthcare, retail, and more from day one.",
        },
        {
          title: "The Real Cost",
          content: "Intercom's 'Advanced' plan is $137/agent/month. For a 10-person support team, that's $1,370/month plus add-ons. NodeBase is ₹999/month flat with unlimited users, voice, vision, and KYC included.",
        },
      ],
      pros: [
        "Excellent product tours",
        "Targeted messaging",
        "Strong mobile SDK",
        "Good analytics",
        "Extensive integrations",
      ],
      cons: [
        "Per-agent pricing",
        "Expensive at scale",
        "No voice capabilities",
        "Generic AI agents",
        "No KYC/verification",
        "Complex setup required",
      ],
    },
    zendesk: {
      sections: [
        {
          title: "What is Zendesk?",
          content: "Zendesk is an enterprise customer service platform with ticketing, live chat, and AI capabilities. It's known for its scalability and extensive API ecosystem.",
        },
        {
          title: "Zendesk's Strengths",
          content: "Zendesk excels in large enterprise environments with complex support needs. Their AI features have improved with Answer Bot and Intelligent Triage, and they offer deep customization.",
        },
        {
          title: "Where NodeBase Wins",
          content: "Zendesk is overkill for most SMBs and priced accordingly. NodeBase is built for growing businesses that need powerful AI without enterprise complexity or cost.",
        },
        {
          title: "Modern vs Legacy",
          content: "Zendesk's interface can feel dated, and setup requires significant IT resources. NodeBase offers modern, intuitive design with AI-powered workflows that work out of the box.",
        },
      ],
      pros: [
        "Enterprise-grade reliability",
        "Extensive customization",
        "Strong API ecosystem",
        "Omnichannel support",
        "Advanced analytics",
      ],
      cons: [
        "Expensive enterprise pricing",
        "Complex implementation",
        "Per-agent costs",
        "Dated UI",
        "No domain-specific AI",
        "Voice costs extra",
      ],
    },
    freshdesk: {
      sections: [
        {
          title: "What is Freshdesk?",
          content: "Freshdesk is an SMB-focused customer support platform with ticketing, live chat, and automation. It's known for being affordable and easy to set up compared to enterprise solutions.",
        },
        {
          title: "Freshdesk's Strengths",
          content: "Freshdesk offers good value for startups and SMBs with its free tier and affordable pricing. The platform includes basic automation and integrates with popular tools.",
        },
        {
          title: "Where NodeBase Wins",
          content: "Freshdesk's AI capabilities are basic at best. NodeBase provides domain-specific AI that actually understands your business context, not just keyword matching.",
        },
        {
          title: "Beyond Support",
          content: "Freshdesk is support-focused. NodeBase combines customer support with sales automation, bookings, payments, and KYC - all unified in one platform.",
        },
      ],
      pros: [
        "Affordable pricing",
        "Easy setup",
        "Good free tier",
        "Mobile apps",
        "SMB-friendly",
      ],
      cons: [
        "Basic AI features",
        "Limited domain expertise",
        "No voice/phone",
        "No vision capabilities",
        "Fragmented tool feel",
        "Per-agent limits",
      ],
    },
    hubspot: {
      sections: [
        {
          title: "What is HubSpot?",
          content: "HubSpot is an inbound marketing and CRM platform with chat, email, and service hub features. They offer a comprehensive suite but at premium pricing.",
        },
        {
          title: "HubSpot's Strengths",
          content: "HubSpot excels in inbound marketing and lead capture. Their CRM integration provides unified customer views, and the platform scales well for growing businesses.",
        },
        {
          title: "Where NodeBase Wins",
          content: "HubSpot's chat features are secondary to their marketing focus. NodeBase is purpose-built for conversational AI with domain expertise that HubSpot simply doesn't offer.",
        },
        {
          title: "The HubSpot Tax",
          content: "HubSpot's Starter is $50/month but quickly escalates. Professional is $890/month and Enterprise is $5,000+/month. NodeBase is ₹999/month with everything included.",
        },
      ],
      pros: [
        "Strong CRM integration",
        "Inbound marketing focus",
        "Comprehensive suite",
        "Good for lead gen",
        "Extensive ecosystem",
      ],
      cons: [
        "Premium pricing",
        "Complex platform",
        "Per-user costs",
        "AI requires paid tiers",
        "No domain expertise",
        "Expensive at scale",
      ],
    },
    drift: {
      sections: [
        {
          title: "What is Drift?",
          content: "Drift is a conversational marketing platform focused on revenue acceleration. They specialize in AI-powered chatbots for lead qualification and meeting scheduling.",
        },
        {
          title: "Drift's Strengths",
          content: "Drift excels at qualifying leads and booking meetings. Their AI conversational flows are well-designed for B2B sales, and they integrate tightly with popular CRMs.",
        },
        {
          title: "Where NodeBase Wins",
          content: "Drift is B2B focused with $2,000+/month pricing. NodeBase serves all business types with domain-specific AI at a fraction of the cost.",
        },
        {
          title: "Value vs Feature",
          content: "Drift's core value is meeting booking. NodeBase does that and much more - voice calls, document scanning, KYC verification, and payments - all in one platform.",
        },
      ],
      pros: [
        "Meeting automation",
        "Lead qualification",
        "B2B focused",
        "CRM integration",
        "Conversation routing",
      ],
      cons: [
        "Very expensive",
        "B2B only",
        "No voice",
        "No KYC",
        "Limited channels",
        "Complex pricing",
      ],
    },
    livechat: {
      sections: [
        {
          title: "What is LiveChat?",
          content: "LiveChat is a live chat platform with AI-powered bots, co-browsing, and customer analytics. It's popular for website chat with good automation capabilities.",
        },
        {
          title: "LiveChat's Strengths",
          content: "LiveChat offers solid live chat for websites with good bot builder and analytics. Their Team Chat product complements the offering for internal communication.",
        },
        {
          title: "Where NodeBase Wins",
          content: "LiveChat is website chat-focused. NodeBase is a complete customer communication platform with WhatsApp, Instagram, voice, and AI that works across all channels.",
        },
        {
          title: "Beyond Website Chat",
          content: "Modern customers communicate where they already are - WhatsApp, Instagram, Airbnb. NodeBase meets customers on their preferred channels with AI that understands context.",
        },
      ],
      pros: [
        "Great website chat",
        "Good bot builder",
        "Mobile apps",
        "Team Chat included",
        "Affordable pricing",
      ],
      cons: [
        "Website-focused only",
        "No WhatsApp/Instagram",
        "No voice capabilities",
        "No domain expertise",
        "Limited KYC",
        "Per-agent pricing",
      ],
    },
    botpress: {
      sections: [
        {
          title: "What is Botpress?",
          content: "Botpress is an open-source conversational AI platform with customizable chatbots, visual flow builder, and enterprise deployment options.",
        },
        {
          title: "Botpress's Strengths",
          content: "Botpress offers extensive customization with open-source flexibility. Their visual flow builder is powerful, and deployment options range from cloud to self-hosted.",
        },
        {
          title: "Where NodeBase Wins",
          content: "Botpress requires technical expertise to deploy effectively. NodeBase provides ready-to-use domain-specific AI that works out of the box without developer resources.",
        },
        {
          title: "Build vs Buy",
          content: "Botpress means building your own AI solution. NodeBase gives you pre-built AI agents trained for hospitality, healthcare, retail, and more - go live in days, not months.",
        },
      ],
      pros: [
        "Open-source flexibility",
        "Highly customizable",
        "Visual flow builder",
        "Self-hosting option",
        "Active community",
      ],
      cons: [
        "Requires technical skills",
        "No pre-built expertise",
        "DIY implementation",
        "Hosting costs extra",
        "No voice/phone",
        "No KYC built-in",
      ],
    },
  };

  return {
    tool,
    content: contents[slug] || {
      sections: [],
      pros: [],
      cons: [],
    },
  };
};

export { CheckCircle2, XCircle, ArrowRight };
