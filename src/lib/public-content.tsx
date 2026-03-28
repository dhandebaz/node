import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BookOpenText,
  Bot,
  BrainCircuit,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  ChartColumnIncreasing,
  ClipboardList,
  Code2,
  CreditCard,
  FileCheck2,
  Globe2,
  Handshake,
  HeartHandshake,
  Layers3,
  LifeBuoy,
  LockKeyhole,
  Mail,
  MessageSquareShare,
  MessagesSquare,
  ReceiptText,
  Rocket,
  Scale,
  ServerCog,
  ShieldCheck,
  ShoppingBag,
  Stethoscope,
  Store,
  TerminalSquare,
  TimerReset,
  WalletCards,
  Waypoints,
} from "lucide-react";

export type PublicMetric = {
  label: string;
  value: string;
};

export type PublicAction = {
  label: string;
  href: string;
};

export type PublicCardItem = {
  title: string;
  description: string;
  href?: string;
  icon?: LucideIcon;
  eyebrow?: string;
  stat?: string;
  ctaLabel?: string;
};

export type PublicSection = {
  title: string;
  intro?: string;
  paragraphs?: string[];
  bullets?: string[];
  cards?: PublicCardItem[];
  code?: {
    label: string;
    value: string;
  };
  note?: string;
  columns?: 2 | 3;
};

export type PublicCallToAction = {
  title: string;
  description: string;
  primary: PublicAction;
  secondary?: PublicAction;
};

export type PublicArticlePageData = {
  eyebrow: string;
  title: string;
  summary: string;
  metrics?: PublicMetric[];
  sections: PublicSection[];
  cta?: PublicCallToAction;
};

export type PublicDirectoryPageData = {
  eyebrow: string;
  title: string;
  summary: string;
  metrics?: PublicMetric[];
  cards: PublicCardItem[];
  sections?: PublicSection[];
  cta?: PublicCallToAction;
};

export const publicNavLinks = [
  {
    label: "AI Assistants",
    href: "/employees",
  },
  {
    label: "Integrations",
    href: "/integrations",
  },
  {
    label: "Pricing",
    href: "/pricing",
  },
  {
    label: "Trust",
    href: "/trust",
  },
  {
    label: "Docs",
    href: "/docs",
  },
  {
    label: "Company",
    href: "/company",
  },
];

export const footerLinkGroups = [
  {
    title: "Product",
    links: [
      { label: "AI Assistants", href: "/employees" },
      { label: "Pricing", href: "/pricing" },
      { label: "Trust Center", href: "/trust" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Quickstart", href: "/docs/getting-started/quickstart" },
      { label: "Agents API", href: "/docs/kaisa/agents-api" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Nodebase", href: "/company" },
      { label: "Partners", href: "/company/partners" },
      { label: "Careers", href: "/company/careers" },
      { label: "Contact", href: "/company/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "/legal/terms" },
      { label: "Privacy", href: "/legal/privacy" },
      { label: "Cookies", href: "/legal/cookies" },
      { label: "Refunds", href: "/legal/refund" },
      { label: "Risk", href: "/legal/risk" },
      { label: "SLA", href: "/legal/sla" },
      { label: "AUP", href: "/legal/aup" },
    ],
  },
];

export const docsNavigation = [
  {
    title: "Start",
    items: [
      { label: "Docs Home", href: "/docs" },
      { label: "Getting Started", href: "/docs/getting-started" },
      { label: "Quickstart", href: "/docs/getting-started/quickstart" },
    ],
  },
  {
    title: "Kaisa",
    items: [
      { label: "Overview", href: "/docs/kaisa" },
      { label: "Agents API", href: "/docs/kaisa/agents-api" },
      { label: "Integrations", href: "/docs/kaisa/integrations" },
    ],
  },
];

export const employeeDirectoryPage: PublicDirectoryPageData = {
  eyebrow: "The AI Workforce",
  title: "Meet the autonomous agents built for your domain.",
  summary:
    "Deploy specialized AI employees for your specific business vertical. Our agents process live Voice calls, ingest Vision data, and orchestrate secure transactional workflows from day one.",
  metrics: [
    { label: "Deployment", value: "Instant" },
    { label: "Multimodal", value: "Voice, Vision & Text" },
    { label: "Availability", value: "24/7/365 SLA" },
  ],
  cards: [
    {
      title: "Host AI",
      description:
        "Premium hospitality agent. Answers guest questions, orchestrates check-ins, and collects secure deposits autonomously.",
      href: "/employees/host-ai",
      icon: Building2,
      eyebrow: "Hospitality",
      stat: "Stays & bookings",
      ctaLabel: "View Host AI",
    },
    {
      title: "Nurse AI",
      description:
        "Medical intake specialist. Fields live Twilio calls, ingests prescriptions via Nodebase Eyes, and books appointments.",
      href: "/employees/nurse-ai",
      icon: Stethoscope,
      eyebrow: "Healthcare",
      stat: "Appointments",
      ctaLabel: "View Nurse AI",
    },
    {
      title: "Dukan AI",
      description:
        "Omnichannel retail manager. Takes WhatsApp orders, handles live inventory calls, and confirms secure deliveries.",
      href: "/employees/dukan-ai",
      icon: Store,
      eyebrow: "Retail",
      stat: "Orders & support",
      ctaLabel: "View Dukan AI",
    },
    {
      title: "Thrift AI",
      description:
        "Social commerce closer. Uses Nodebase Eyes to identify visual stock requests and drives Razorpay checkouts via DM.",
      href: "/employees/thrift-ai",
      icon: ShoppingBag,
      eyebrow: "Social commerce",
      stat: "DM selling",
      ctaLabel: "View Thrift AI",
    },
  ],
  sections: [
    {
      title: "Why deploy a domain-specific agent?",
      cards: [
        {
          title: "Multimodal Processing",
          description:
            "From Twilio Voice calls to Nodebase Eyes image ingestion, our agents natively handle complex unstructured inputs.",
          icon: BriefcaseBusiness,
        },
        {
          title: "Intelligent State Machine",
          description:
            "Your agent dynamically executes pricing rules, operational SLAs, and live calendar logic with zero latency.",
          icon: BrainCircuit,
        },
        {
          title: "Enterprise Trust",
          description:
            "Compliant by default. Seamlessly run ID validations via KYC OCR and process secure payments automatically.",
          icon: ShieldCheck,
        },
      ],
      columns: 3,
    },
  ],
  cta: {
    title: "Ready to upgrade your operating system?",
    description:
      "Join the enterprises scaling their operations with the Nodebase autonomous workforce.",
    primary: { label: "Scope a deployment", href: "/signup" },
    secondary: { label: "Review pricing", href: "/pricing" },
  },
};

export const employeePages: Record<string, PublicArticlePageData> = {
  "host-ai": {
    eyebrow: "Hospitality Operations Agent",
    title:
      "Host AI runs your property operations autonomously. Zero latency, full compliance.",
    summary:
      "Engineered for premium homestays and vacation networks. Host AI orchestrates omnichannel bookings, manages live guest phone calls via Twilio, and enforces secure KYC verifications.",
    metrics: [
      { label: "Target", value: "Premium Hospitality" },
      { label: "Capability", value: "Voice & Vision AI" },
      { label: "Compliance", value: "Automated KYC OCR" },
    ],
    sections: [
      {
        title: "What Host AI can do for you",
        cards: [
          {
            title: "Answers questions & calls",
            description:
              "Guests hate waiting. Host AI replies instantly on WhatsApp and fields live phone calls via Twilio Voice with accurate check-in details.",
            icon: CalendarClock,
          },
          {
            title: "Collects payments",
            description:
              "Generates secure Stripe/Razorpay payment links and politely follows up if a guest forgets to pay their deposit.",
            icon: CreditCard,
          },
          {
            title: "Automated KYC Verification",
            description:
              "Uses Nodebase Eyes OCR to instantly verify government IDs before check-in, keeping your property secure without manual review.",
            icon: FileCheck2,
          },
        ],
        columns: 3,
      },
      {
        title: "How it executes in production",
        bullets: [
          "Ingests your complex operating policies, dynamic pricing matrices, and real-time availability via APIs.",
          "Resolves common and complex guest queries with enterprise-grade accuracy, elevating brand perception.",
          "Instantly escalates bespoke requests or multi-property booking exceptions for human override.",
          "Aggregates all omnichannel interactions logically within the centralized operator portal.",
        ],
      },
      {
        title: "Seamless connections",
        cards: [
          {
            title: "WhatsApp & Instagram",
            description:
              "Host AI talks to your guests on the apps they already use every day.",
            icon: MessagesSquare,
          },
          {
            title: "Calendar Sync",
            description:
              "Syncs with Airbnb and Booking.com so you never get double-booked.",
            icon: Layers3,
          },
          {
            title: "Integrated Payments",
            description:
              "Creates Razorpay payment links so money goes straight into your bank account.",
            icon: WalletCards,
          },
        ],
        columns: 3,
      },
    ],
    cta: {
      title: "Ready to scale your hospitality operations?",
      description:
        "Deploy Host AI in minutes and secure your transactional workflow with enterprise capabilities.",
      primary: { label: "Scope a deployment", href: "/signup" },
      secondary: { label: "Review pricing architecture", href: "/pricing" },
    },
  },
  "nurse-ai": {
    eyebrow: "Healthcare Operations Agent",
    title:
      "Nurse AI drives clinical intake and schedule hygiene securely.",
    summary:
      "Engineered for modern clinics and diagnostic hubs. Nurse AI intercepts inbound Twilio calls, accurately resolves patient triage queries, and secures appointments via WhatsApp.",
    metrics: [
      { label: "Target", value: "Enterprise Clinics" },
      { label: "Capability", value: "Twilio Voice & Triage" },
      { label: "Compliance", value: "Secure KYC Consent" },
    ],
    sections: [
      {
        title: "Primary responsibilities",
        cards: [
          {
            title: "Patient intake triage",
            description:
              "Collects structured basics via WhatsApp or Voice, captures KYC consent forms, and books preferred slots autonomously.",
            icon: ClipboardList,
          },
          {
            title: "Schedule hygiene",
            description:
              "Reduces no-shows with reminder loops via Twilio and WhatsApp, syncing instantly to your calendar.",
            icon: CalendarClock,
          },
          {
            title: "Prescription ingestion",
            description:
              "Uses Nodebase Eyes to securely ingest images of previous prescriptions or reports before the appointment.",
            icon: HeartHandshake,
          },
        ],
        columns: 3,
      },
      {
        title: "Safety model",
        bullets: [
          "Never presents itself as a clinician or offers diagnostic advice.",
          "Escalates immediately on emergency, medication, or diagnosis-adjacent language.",
          "Stays anchored to approved clinic messaging templates and operating policies.",
        ],
      },
      {
        title: "Connected tools",
        cards: [
          {
            title: "Calendar systems",
            description:
              "Works against available slots and clinic working hours.",
            icon: Waypoints,
          },
          {
            title: "WhatsApp front desk",
            description:
              "Maintains the clinic’s existing communication channel.",
            icon: MessageSquareShare,
          },
          {
            title: "Payment and reminders",
            description:
              "Supports prepaid consultations, deposits, and intake reminders.",
            icon: ReceiptText,
          },
        ],
        columns: 3,
      },
    ],
    cta: {
      title: "Deploy reliable clinical infrastructure.",
      description:
        "Execute the Nurse AI configuration workflow to secure your intake process.",
      primary: { label: "Scope a deployment", href: "/signup" },
      secondary: { label: "Talk to partners", href: "/company/contact" },
    },
  },
  "dukan-ai": {
    eyebrow: "Omnichannel Retail Agent",
    title:
      "Dukan AI orchestrates your retail volume across Voice and Text grids.",
    summary:
      "Engineered for high-volume local merchants. Dukan AI effortlessly resolves live Twilio stock queries, drives WhatsApp checkout, and confirms secure deliveries.",
    metrics: [
      { label: "Best for", value: "Local stores" },
      { label: "Goal", value: "More sales 24/7" },
      { label: "Channel", value: "Omnichannel Voice & Text" },
    ],
    sections: [
      {
        title: "Primary responsibilities",
        cards: [
          {
            title: "Catalogue answers",
            description:
              "Responds to pricing, sizes, availability, and delivery logic using the merchant’s catalogue via live Voice or Text.",
            icon: Store,
          },
          {
            title: "Order follow-through",
            description:
              "Generates instant Razorpay/Stripe checkout links and confirms delivery expectations without human touch.",
            icon: TimerReset,
          },
          {
            title: "Automated billing",
            description:
              "Scale operations starting exactly at the base ₹999/mo tier securely.",
            icon: ChartColumnIncreasing,
          },
        ],
        columns: 3,
      },
      {
        title: "Why merchants use it",
        bullets: [
          "It keeps fast-moving message channels from depending on one operator being online at the right minute.",
          "It preserves margin by avoiding unnecessary discounts or ad hoc pricing answers.",
          "It helps small stores look consistent across every customer conversation.",
        ],
      },
      {
        title: "Connected tools",
        cards: [
          {
            title: "Payments",
            description:
              "Supports payment links and confirmation nudges with Indian payment rails.",
            icon: WalletCards,
          },
          {
            title: "Store policies",
            description:
              "Returns, substitutions, and delivery windows stay inside the reply logic.",
            icon: Scale,
          },
          {
            title: "Shared inbox",
            description:
              "Team members can take over exceptions without losing the message trail.",
            icon: LifeBuoy,
          },
        ],
        columns: 3,
      },
    ],
    cta: {
      title: "Scale your retail throughput infinitely.",
      description:
        "Deploy Dukan AI to handle your omnichannel ordering so you can focus on supply chain.",
      primary: { label: "Scope a deployment", href: "/signup" },
      secondary: { label: "See partner options", href: "/company/partners" },
    },
  },
  "thrift-ai": {
    eyebrow: "Social Commerce Operations Agent",
    title: "Thrift AI drives zero-latency visual sales in the DMs.",
    summary:
      "Engineered for scale on Instagram. Thrift AI processes inbound images via Nodebase Eyes to identify precise SKU requests, marshals inventory logic, and executes secure Razorpay checkouts.",
    metrics: [
      { label: "Best for", value: "Instagram Sellers" },
      { label: "Goal", value: "Convert followers to buyers" },
      { label: "Strength", value: "Instant visual discovery" },
    ],
    sections: [
      {
        title: "Primary responsibilities",
        cards: [
          {
            title: "Visual Inquiry triage",
            description:
              "Uses Nodebase Eyes to analyze customer-uploaded screenshots from your feed and instantly identify stock.",
            icon: ShoppingBag,
          },
          {
            title: "Reservation workflow",
            description:
              "Creates urgency by holding inventory windows and demanding secure Razorpay checkout to confirm orders.",
            icon: Rocket,
          },
          {
            title: "Fulfillment follow-up",
            description:
              "Confirms payment, ships logistics updates, and requests automated feedback after the sale closes.",
            icon: ReceiptText,
          },
        ],
        columns: 3,
      },
      {
        title: "Tone and operating style",
        bullets: [
          "Can be configured to sound premium, fast-moving, warm, or bluntly efficient depending on brand voice.",
          "Protects stock integrity by avoiding accidental double-commitments and undocumented holds.",
          "Moves the team from scattered DM selling to an auditable operational loop.",
        ],
      },
      {
        title: "Connected tools",
        cards: [
          {
            title: "Social inbox surfaces",
            description:
              "Designed for channels where speed and continuity decide conversion.",
            icon: Globe2,
          },
          {
            title: "Payment links",
            description:
              "Turns a buyer signal into a clean payment request without manual link generation.",
            icon: CreditCard,
          },
          {
            title: "Order records",
            description:
              "Keeps the handoff to ops clean when multiple sellers work in the same queue.",
            icon: ServerCog,
          },
        ],
        columns: 3,
      },
    ],
    cta: {
      title: "Convert inbound DMs into an autonomous revenue stream.",
      description:
        "Deploy Thrift AI to execute zero-latency visual discovery and secure checkouts automatically.",
      primary: { label: "Scope a deployment", href: "/signup" },
      secondary: { label: "Talk to sales", href: "/company/contact" },
    },
  },
};

export const companyDirectoryPage: PublicDirectoryPageData = {
  eyebrow: "Company",
  title:
    "Nodebase makes AI accessible for local businesses, not just giant tech companies.",
  summary:
    "We believe small businesses deserve the same powerful automation as the big players. This section explains who we are, our partner network, and how we build tools for real-world business owners.",
  metrics: [
    { label: "HQ", value: "India" },
    { label: "Focus", value: "Small Business AI" },
    { label: "Goal", value: "Make your life easier" },
  ],
  cards: [
    {
      title: "Careers",
      description:
        "Join our team of builders who want to help small businesses thrive with easy-to-use AI.",
      href: "/company/careers",
      icon: BriefcaseBusiness,
      eyebrow: "Open roles",
      ctaLabel: "See careers",
    },
    {
      title: "Partners",
      description:
        "Agencies, consultants, and tech partners who want to bring easy automation to their clients.",
      href: "/company/partners",
      icon: Handshake,
      eyebrow: "Ecosystem",
      ctaLabel: "See partner tracks",
    },
    {
      title: "Trust & legal",
      description:
        "Learn how we keep your business data private, secure, and completely under your control.",
      href: "/trust",
      icon: ShieldCheck,
      eyebrow: "Trust",
      ctaLabel: "Visit trust center",
    },
    {
      title: "Contact",
      description:
        "Talk to our team if you need help getting started or want to partner with us.",
      href: "/company/contact",
      icon: Mail,
      eyebrow: "Reach us",
      ctaLabel: "Open contact page",
    },
  ],
  sections: [
    {
      title: "Our Mission",
      cards: [
        {
          title: "Built for real people",
          description:
            "We design our software for store owners, clinic managers, and hosts—not for IT departments.",
          icon: Bot,
        },
        {
          title: "Focus on results",
          description:
            "We don't sell hype. We sell software that answers messages, takes bookings, and saves you time.",
          icon: Activity,
        },
        {
          title: "Extremely easy to use",
          description:
            "You shouldn't need a manual to run your business. Our dashboard is simple, fast, and works on your phone.",
          icon: Layers3,
        },
      ],
      columns: 3,
    },
  ],
  cta: {
    title: "Ready to put your business on autopilot?",
    description:
      "Join the businesses saving hours every day with Nodebase AI assistants.",
    primary: { label: "Get Started Free", href: "/signup" },
    secondary: { label: "Talk to Sales", href: "/company/contact" },
  },
};

export const careersPage: PublicArticlePageData = {
  eyebrow: "Careers",
  title: "Join us in building AI that actually helps small businesses grow.",
  summary:
    "Nodebase is a small, focused team. We care about making products that are incredibly easy to use for shop owners, homestay hosts, and clinic managers.",
  metrics: [
    { label: "Team model", value: "Small & fast" },
    { label: "Focus", value: "Real-world impact" },
    { label: "Hiring", value: "Passionate builders" },
  ],
  sections: [
    {
      title: "What we value",
      cards: [
        {
          title: "Empathy for the user",
          description:
            "You understand that our customers are busy business owners who need simple, reliable tools.",
          icon: Activity,
        },
        {
          title: "Clarity over complexity",
          description:
            "You prefer simple, elegant solutions over over-engineered, confusing architecture.",
          icon: Waypoints,
        },
        {
          title: "Shipping fast & learning",
          description:
            "You know how to build a great V1, get it into users' hands, and improve it based on feedback.",
          icon: Rocket,
        },
      ],
      columns: 3,
    },
    {
      title: "Current hiring focus",
      cards: [
        {
          title: "Frontend systems engineer",
          description:
            "Owns the public system, dashboards, and the interaction layer between AI workflows and human operators.",
          icon: Code2,
        },
        {
          title: "Workflow infrastructure engineer",
          description:
            "Works on messaging rails, event logging, policy controls, and deployment reliability.",
          icon: ServerCog,
        },
        {
          title: "Partner solutions lead",
          description:
            "Turns product capability into repeatable implementation patterns for operators and integrators.",
          icon: Handshake,
        },
      ],
      columns: 3,
    },
    {
      title: "How to approach us",
      bullets: [
        "Send evidence of shipped systems, not just portfolios and abstract statements.",
        "Explain one difficult product tradeoff you made and why it was the correct compromise.",
        "If you are applying for engineering, include a code sample or shipped repo that reflects your actual standards.",
      ],
    },
  ],
  cta: {
    title: "Want to build products that help real businesses?",
    description:
      "Send us an email with a link to something you've built that you're proud of.",
    primary: { label: "Email the team", href: "/company/contact" },
    secondary: { label: "Learn about us", href: "/company" },
  },
};

export const partnersDirectoryPage: PublicDirectoryPageData = {
  eyebrow: "Partners",
  title: "Partner with Nodebase to help businesses automate their operations.",
  summary:
    "We work with agencies, consultants, and tech companies who want to bring easy-to-use AI to their clients.",
  metrics: [
    { label: "Tracks", value: "Agencies & Tech" },
    { label: "Focus", value: "Customer success" },
    { label: "Market", value: "Local businesses" },
  ],
  cards: [
    {
      title: "Technology Partners",
      description:
        "Connect your software to our AI assistants to give your users magical new features.",
      href: "/company/partners/technology",
      icon: Globe2,
      eyebrow: "Platform",
      ctaLabel: "View tech partners",
    },
    {
      title: "Agency Partners",
      description:
        "Help your clients set up their AI assistants, train their rules, and transform their customer service.",
      href: "/company/partners/system-integrators",
      icon: Building2,
      eyebrow: "Agencies",
      ctaLabel: "View agency track",
    },
  ],
  sections: [
    {
      title: "Why partner with us?",
      bullets: [
        "Provide immense value to your clients by solving their biggest pain point: customer communication.",
        "Earn revenue shares and get priority access to our support team.",
        "Use a simple, reliable platform that just works, making you look great to your clients.",
      ],
    },
  ],
  cta: {
    title: "If you love helping businesses grow, let's work together.",
    description:
      "Reach out to our partner team to learn more about our programs.",
    primary: { label: "Contact Partners Team", href: "/company/contact" },
    secondary: { label: "View Pricing", href: "/pricing" },
  },
};

export const partnerTrackPages: Record<string, PublicArticlePageData> = {
  "system-integrators": {
    eyebrow: "Agency Partners",
    title:
      "Help your clients set up their AI assistants and transform their customer service.",
    summary:
      "This track is for agencies, consultants, and freelancers who want to offer AI automation as a service to their small business clients.",
    metrics: [
      { label: "Role", value: "Setup & Training" },
      { label: "Best fit", value: "Digital Agencies" },
      { label: "Goal", value: "Client Success" },
    ],
    sections: [
      {
        title: "Typical responsibilities",
        cards: [
          {
            title: "Workflow mapping",
            description:
              "Translate the client’s current operating flow into a deployment plan with escalation and approval design.",
            icon: ClipboardList,
          },
          {
            title: "Implementation and launch",
            description:
              "Set up channels, policies, integrations, and team operating expectations before go-live.",
            icon: Rocket,
          },
          {
            title: "Operational review",
            description:
              "Use event trails and inbox behavior to improve the system after launch, not just before it.",
            icon: ChartColumnIncreasing,
          },
        ],
        columns: 3,
      },
      {
        title: "What makes a strong SI partner",
        bullets: [
          "You understand how to standardize 80% of delivery and isolate the client-specific 20%.",
          "You can operate inside messaging, payments, scheduling, and compliance-sensitive flows without improvising policies.",
          "You treat documentation and handoff as part of delivery quality, not afterthoughts.",
        ],
      },
    ],
    cta: {
      title: "Ready to offer AI to your clients?",
      description:
        "Join our agency program to get priority support and revenue share.",
      primary: { label: "Apply as a Partner", href: "/company/contact" },
      secondary: {
        label: "View Tech Track",
        href: "/company/partners/technology",
      },
    },
  },
  technology: {
    eyebrow: "Technology Partners",
    title:
      "Connect your software to Nodebase and give your users magical AI features.",
    summary:
      "We work with SaaS platforms, payment gateways, and scheduling tools to make our AI assistants even smarter for mutual customers.",
    metrics: [
      { label: "Role", value: "Integration" },
      { label: "Best fit", value: "B2B SaaS" },
      { label: "Goal", value: "Seamless sync" },
    ],
    sections: [
      {
        title: "Where partnerships matter most",
        cards: [
          {
            title: "Messaging rails",
            description:
              "Stable message ingestion, sending, and recovery behavior are core to the value of every employee.",
            icon: MessagesSquare,
          },
          {
            title: "Payment and billing",
            description:
              "Clean payment handoff and confirmation are central to hospitality and commerce workflows.",
            icon: CreditCard,
          },
          {
            title: "Scheduling and records",
            description:
              "Calendar and structured record systems reduce manual reconciliation across teams.",
            icon: CalendarClock,
          },
        ],
        columns: 3,
      },
      {
        title: "What we prioritize",
        bullets: [
          "Good documentation and stable operational behavior.",
          "Integration primitives that are friendly to audit, retries, and fallback behavior.",
          "Commercial terms that work for repeatable productized deployment rather than custom enterprise-only motion.",
        ],
      },
    ],
    cta: {
      title: "Want to integrate your software with Nodebase?",
      description:
        "Reach out to our team to discuss API access and co-marketing opportunities.",
      primary: { label: "Talk to Partnerships", href: "/company/contact" },
      secondary: { label: "Read the Docs", href: "/docs" },
    },
  },
};

export const docsDirectoryPage: PublicDirectoryPageData = {
  eyebrow: "Documentation",
  title: "Architect your Enterprise AI Workforce.",
  summary:
    "Read our guides to learn how to deploy omnichannel operators, configure your operational rules, and let Nodebase execute your high-volume workflows.",
  metrics: [
    { label: "Audience", value: "Enterprise Operators" },
    { label: "Coverage", value: "Deployment Guides" },
    { label: "Standard", value: "Compliance-First" },
  ],
  cards: [
    {
      title: "Getting Started",
      description:
        "Learn what Nodebase is and how it can save you hours of customer support every day.",
      href: "/docs/getting-started",
      icon: BookOpenText,
      eyebrow: "Start here",
      ctaLabel: "Read the overview",
    },
    {
      title: "Quickstart",
      description:
        "A step-by-step guide to getting your AI assistant running in under 5 minutes.",
      href: "/docs/getting-started/quickstart",
      icon: Rocket,
      eyebrow: "Hands-on",
      ctaLabel: "Open quickstart",
    },
    {
      title: "Kaisa overview",
      description:
        "Understand how Nodebase models AI employees, role prompts, escalation, and action boundaries.",
      href: "/docs/kaisa",
      icon: BrainCircuit,
      eyebrow: "Concepts",
      ctaLabel: "Read the overview",
    },
    {
      title: "Agents API",
      description:
        "Programmatic controls for employee state, run history, and workflow events.",
      href: "/docs/kaisa/agents-api",
      icon: Code2,
      eyebrow: "Reference",
      ctaLabel: "Review the API",
    },
    {
      title: "Integrations",
      description:
        "Where messaging, scheduling, and payments connect into employee execution.",
      href: "/docs/kaisa/integrations",
      icon: Globe2,
      eyebrow: "Connections",
      ctaLabel: "Review integrations",
    },
    {
      title: "Nodebase Voice",
      description:
        "AI Telephony Agent for your business — integrated natively into the omnichannel inbox.",
      href: "/docs/nodebase-voice",
      icon: TerminalSquare,
      eyebrow: "Infrastructure",
      ctaLabel: "Deploy Voice",
    },
    {
      title: "Nodebase Eyes",
      description:
        "Enterprise Vision Intelligence to parse OCR, IDs, and visual context securely.",
      href: "/docs/nodebase-eyes",
      icon: ServerCog,
      eyebrow: "Infrastructure",
      ctaLabel: "Deploy Eyes",
    },
  ],
  cta: {
    title: "Ready to deploy your AI workforce?",
    description:
      "Start with our 5-minute quickstart guide to launch your first AI operator.",
    primary: {
      label: "Open Quickstart",
      href: "/docs/getting-started/quickstart",
    },
    secondary: { label: "View Integrations", href: "/docs/kaisa/integrations" },
  },
};

export const docsPages: Record<string, PublicArticlePageData> = {
  "getting-started": {
    eyebrow: "Documentation",
    title:
      "Nodebase is built around specialized AI operators that execute your enterprise workflow.",
    summary:
      "This guide explains how Nodebase ingests your policies, resolves complex customer intent, and knows exactly when to escalate to human oversight.",
    metrics: [
      { label: "Focus", value: "Easy Setup" },
      { label: "Control", value: "You are the boss" },
      { label: "Visibility", value: "See every chat" },
    ],
    sections: [
      {
        title: "The product model",
        cards: [
          {
            title: "Autonomous Employees",
            description:
              "Deploy specialized agents natively equipped with omnichannel messaging, Voice telephony, and Eyes OCR capabilities.",
            icon: Bot,
          },
          {
            title: "Workflow logic rules",
            description:
              "Every message, call, and scanned document sits inside a larger operational loop with strict enterprise compliance boundaries.",
            icon: Activity,
          },
          {
            title: "Total Human Oversight",
            description:
              "KYC approvals, dynamic pricing scaling, and clear event logs make human override seamless and auditable.",
            icon: ShieldCheck,
          },
        ],
        columns: 3,
      },
      {
        title: "What a first setup usually includes",
        bullets: [
          "Picking the employee role and the primary operating channel.",
          "Defining what information the employee can act on directly.",
          "Setting approval thresholds for pricing, refunds, or policy exceptions.",
          "Testing a real business conversation and reviewing the event trail before launch.",
        ],
      },
    ],
    cta: {
      title: "Ready to set up your AI assistant?",
      description:
        "Follow our simple quickstart guide to get up and running in minutes.",
      primary: {
        label: "Open Quickstart",
        href: "/docs/getting-started/quickstart",
      },
      secondary: {
        label: "View Integrations",
        href: "/docs/kaisa/integrations",
      },
    },
  },
  quickstart: {
    eyebrow: "Quickstart",
    title: "Deploy your AI workforce in minutes.",
    summary:
      "Follow these four operational steps to connect your enterprise channels, deploy your compliance logic, and start executing scale.",
    metrics: [
      { label: "Time", value: "5 minutes" },
      { label: "Required", value: "Operating Policies" },
      { label: "Result", value: "Autonomous Operations" },
    ],
    sections: [
      {
        title: "1. Define the job and the inbox",
        bullets: [
          "Choose the employee role that maps to the real business bottleneck.",
          "Decide which channel will be authoritative for first rollout.",
          "List the business rules the employee must not violate.",
        ],
      },
      {
        title: "2. Attach operational context",
        bullets: [
          "Load the policies, inventory, schedules, or listing notes the employee needs to reason correctly.",
          "Keep the initial context tight. Overfeeding noise makes testing slower and worse.",
        ],
      },
      {
        title: "3. Configure action boundaries",
        bullets: [
          "Set what can be done automatically versus what must require human confirmation.",
          "Define escalation contacts and the exact conditions that trigger handoff.",
        ],
      },
      {
        title: "4. Test a real conversation",
        code: {
          label: "First-run checklist",
          value: `role: host-ai
channels: [whatsapp, twilio_voice]
capabilities: [vision_ocr, link_generation]
autonomy: mixed
approvals:
  refund: human
  pricing_exception: human
  kyc_verification: automatic
log_mode: enterprise_audit`,
        },
        note: "Launch only after one real conversation path, one telephony test, and one human override have been reviewed end to end.",
      },
    ],
    cta: {
      title: "Your AI is ready to work!",
      description:
        "Next, check out our integrations guide to connect your Instagram or calendar.",
      primary: { label: "View Integrations", href: "/docs/kaisa/integrations" },
      secondary: {
        label: "Go to Dashboard",
        href: "/login",
      },
    },
  },
  kaisa: {
    eyebrow: "Kaisa",
    title: "Kaisa is the control model behind every Nodebase AI employee.",
    summary:
      "It packages prompts, tools, memory, escalation, and policy into an employee that can operate coherently in production.",
    metrics: [
      { label: "Abstraction", value: "Role-based employee" },
      { label: "Execution", value: "Context + tools + guardrails" },
      { label: "Observability", value: "Event stream" },
    ],
    sections: [
      {
        title: "Why the model exists",
        paragraphs: [
          "Businesses do not want to manage prompts as a primary interface. They want a dependable operator that understands the task lane, the boundaries, and when to escalate.",
          "Kaisa exists to turn LLM capability into a role with responsibility, memory, and operating posture.",
        ],
      },
      {
        title: "Core components",
        cards: [
          {
            title: "Role prompt stack",
            description:
              "Defines the employee’s objective, tone, and risk boundaries.",
            icon: MessagesSquare,
          },
          {
            title: "Context layer",
            description:
              "Injects business records and state needed to make a correct operational decision.",
            icon: Layers3,
          },
          {
            title: "Action guardrails",
            description:
              "Controls what may be executed automatically versus what must wait for approval.",
            icon: LockKeyhole,
          },
        ],
        columns: 3,
      },
    ],
    cta: {
      title:
        "Go to the API if you need programmatic controls, or integrations if you are wiring channels next.",
      description:
        "Those two docs define most implementation detail after the overview.",
      primary: { label: "Read Agents API", href: "/docs/kaisa/agents-api" },
      secondary: {
        label: "Read integrations",
        href: "/docs/kaisa/integrations",
      },
    },
  },
  "agents-api": {
    eyebrow: "API reference",
    title:
      "The Agents API exposes the control surfaces you actually need in operations.",
    summary:
      "Use the API to inspect employee state, trigger runs, review history, and layer Nodebase into your own systems or dashboards.",
    metrics: [
      { label: "Style", value: "Operational API" },
      { label: "Focus", value: "Control and observability" },
      { label: "Typical use", value: "Dashboards and orchestration" },
    ],
    sections: [
      {
        title: "Common operations",
        cards: [
          {
            title: "List employees",
            description:
              "Enumerate available employees and their runtime state for a tenant or workspace.",
            icon: Bot,
          },
          {
            title: "Trigger a run",
            description:
              "Kick off a task with explicit input and business context when a system event occurs.",
            icon: Waypoints,
          },
          {
            title: "Inspect history",
            description:
              "Read event and conversation history for audit, debugging, or reporting surfaces.",
            icon: Activity,
          },
        ],
        columns: 3,
      },
      {
        title: "Example request shape",
        code: {
          label: "Multimodal run request",
          value: `POST /v1/agents/{agent_id}/run
{
  "input": "Guest uploaded an ID document.",
  "attachments": [{ "type": "image", "url": "https://..." }],
  "context": {
    "booking_reference": "NB-4107",
    "require_kyc": true
  },
  "mode": "policy_enforced"
}`,
        },
      },
      {
        title: "Implementation notes",
        bullets: [
          "Treat the API as a control surface, not as a replacement for good workflow configuration.",
          "Use event history to build support tooling and audit trails rather than scraping UI behavior.",
          "Always model approval-sensitive actions explicitly in your consuming system.",
        ],
      },
    ],
    cta: {
      title:
        "Use the API when you need your own controls around employee execution.",
      description:
        "If you are wiring channels, scheduling, or payments directly, read the integrations guide next.",
      primary: { label: "Open integrations", href: "/docs/kaisa/integrations" },
      secondary: { label: "Return to docs", href: "/docs" },
    },
  },
  "nodebase-voice": {
    eyebrow: "Enterprise Infrastructure",
    title: "Nodebase Voice: Full-duplex conversational telephony.",
    summary:
      "Voice is no longer a separate silo. Our AI employees can handle inbound and outbound calls natively integrated with Twilio.",
    metrics: [
      { label: "Status", value: "Enterprise Launch" },
      { label: "Latency", value: "< 500ms bounds" },
      { label: "Capabilities", value: "Interruptible IVR" },
    ],
    sections: [
      {
        title: "Technical Architecture",
        paragraphs: [
          "Nodebase Voice utilizes a low-latency WebRTC pipeline connecting directly to Twilio's Media Streams. The agent maintains conversational state precisely parallel to text.",
          "It features native barge-in (interruption handling), dynamic TTS voice cloning (optional), and compliance-grade recording logs."
        ],
      },
      {
        title: "Integration path",
        bullets: [
          "Provision a Twilio phone number.",
          "Point the Twilio Voice webhook to your environment's Nodebase SIP ingress.",
          "Agents adopt the same operating policies established for text channels."
        ],
      }
    ],
    cta: {
      title: "Deploy Nodebase Voice.",
      description: "Scale your telephone intake natively within the base ¥999 architecture.",
      primary: { label: "Scope a deployment", href: "/signup" },
      secondary: { label: "Back to Docs", href: "/docs" },
    }
  },
  "nodebase-eyes": {
    eyebrow: "Enterprise Infrastructure",
    title: "Nodebase Eyes: Vision intelligence for enterprise reality.",
    summary:
      "Ingest images securely to perform zero-shot OCR, document verification, and visual Q&A without human labeling.",
    metrics: [
      { label: "Status", value: "Enterprise Launch" },
      { label: "Compliance", value: "PII masking built-in" },
      { label: "Use case", value: "KYC & Operations" },
    ],
    sections: [
      {
        title: "How Nodebase Eyes works",
        paragraphs: [
          "When a customer uploads an image (like an ID card or a broken product), Nodebase Eyes converts visual pixels into structured semantic context the agent can query.",
          "We offer specialized sub-models for KYC extraction (parsing licenses securely) and Retail Triage (reading serial numbers and damage signs)."
        ],
      },
      {
        title: "Safety & Privacy limits",
        bullets: [
          "Images parsed for KYC are systematically wiped from edge caches after extraction triggers.",
          "Explicit PII masking prevents sensitive ID text from spilling into general event logs.",
          "Nodebase Eyes explicitly rejects explicit or prohibited image vectors at the ingress layer."
        ],
      }
    ],
    cta: {
      title: "Automate your visual compliance workflows.",
      description: "Activate Nodebase Eyes OCR capabilities across your omnichannel inbox.",
      primary: { label: "Scope a deployment", href: "/signup" },
      secondary: { label: "Back to Docs", href: "/docs" },
    }
  },
  integrations: {
    eyebrow: "Enterprise Integrations",
    title:
      "Mission-critical integrations engineered for compliance and reliability.",
    summary:
      "Nodebase natively orchestrates the rails that power enterprise operations: WhatsApp, Twilio (Voice), Razorpay/Stripe, and real-time Calendar syncs.",
    metrics: [
      { label: "Primary channel", value: "Omnichannel setup" },
      { label: "Key rails", value: "Twilio & Stripe" },
      { label: "Deployment style", value: "Audit-friendly OCR" },
    ],
    sections: [
      {
        title: "Messaging & Voice",
        cards: [
          {
            title: "WhatsApp & Instagram",
            description:
              "Employees are strongest when they work casually over social DMs, instantly handling rich multimedia context via Nodebase Eyes.",
            icon: MessagesSquare,
          },
          {
            title: "Twilio Telephony",
            description:
              "Let Nodebase Voice securely field live inbound calls using our programmable IVR and conversational agents.",
            icon: Mail,
          },
        ],
        columns: 2,
      },
      {
        title: "Commerce and operations",
        cards: [
          {
            title: "Razorpay & Stripe",
            description:
              "Send links natively in chat, confirm collection, and keep that billing event inside the same unified workflow.",
            icon: CreditCard,
          },
          {
            title: "Calendar Syncs",
            description:
              "Employees reason against live Google Calendar and Outlook availability rather than guessing around them.",
            icon: CalendarClock,
          },
          {
            title: "KYC & Compliance",
            description:
              "Use Nodebase Eyes OCR to process IDs and automatically generate legally binding consent forms.",
            icon: ServerCog,
          },
        ],
        columns: 3,
      },
      {
        title: "Integration design rules",
        bullets: [
          "Prefer integrations that preserve traceability for every call recording and chat log.",
          "Define retries and human fallback before launch, not after the first operational miss.",
          "Keep the number of first-phase integrations low enough that the team can actually observe system behavior.",
        ],
      },
    ],
    cta: {
      title:
        "If the integration increases operational reliability, it belongs in the stack.",
      description:
        "Start connecting Twilio, Stripe, and your Calendars today on the base ₹999 plan.",
      primary: { label: "Return to docs", href: "/docs" },
      secondary: { label: "Talk to Nodebase", href: "/company/contact" },
    },
  },
};

export const trustPage: PublicArticlePageData = {
  eyebrow: "Trust center",
  title: "Enterprise trust, strict data boundaries, and complete orchestration control.",
  summary:
    "We know your customer operations and payments are highly sensitive. Nodebase is designed from the ground up to prevent data bleed, enforce strict AI guardrails, and keep you in total command of your workforce.",
  metrics: [
    { label: "Design", value: "Privacy First" },
    { label: "Records", value: "Secure Logs" },
    { label: "Control", value: "You are the boss" },
  ],
  sections: [
    {
      title: "What the platform optimizes for",
      cards: [
        {
          title: "Control before autonomy",
          description:
            "Employees should be able to act, but only inside explicitly designed action boundaries.",
          icon: ShieldCheck,
        },
        {
          title: "Traceability before convenience",
          description:
            "Critical events should be observable after the fact without reconstructing them from memory.",
          icon: FileCheck2,
        },
        {
          title: "Context-limited access",
          description:
            "Employees should see the business context they need, not broad access by default.",
          icon: LockKeyhole,
        },
      ],
      columns: 3,
    },
    {
      title: "Operational commitments",
      bullets: [
        "We offer a 99.9% uptime SLA for all Enterprise base Nodebase Voice and Text integrations on our ₹999/mo platform architecture.",
        "Nodebase mitigates AI hallucinations via strict deterministic bounds: our employees cannot invent operational policies outside of provided SOPs.",
        "Nodebase Eyes OCR parses sensitive KYC data directly into memory and systematically purges imagery after verification.",
        "Human override remains a core part of the operating model, ensuring seamless escalation rather than uncontrolled loops.",
      ],
    },
    {
      title: "Where to go next",
      cards: [
        {
          title: "Privacy policy",
          description:
            "Read how Nodebase handles data, retention, and access boundaries.",
          href: "/legal/privacy",
          icon: Scale,
          ctaLabel: "Read privacy policy",
        },
        {
          title: "Terms of service",
          description:
            "Review the commercial and platform terms that govern usage.",
          href: "/legal/terms",
          icon: ReceiptText,
          ctaLabel: "Read terms",
        },
        {
          title: "Risk disclosure",
          description:
            "See where human review is still necessary in production use.",
          href: "/legal/risk",
          icon: ShieldCheck,
          ctaLabel: "Read risk disclosure",
        },
      ],
      columns: 3,
    },
  ],
  cta: {
    title: "We take your business seriously.",
    description:
      "If you have any questions about how we handle data or payments, our team is happy to chat.",
    primary: { label: "Contact Us", href: "/company/contact" },
    secondary: { label: "Read the Docs", href: "/docs" },
  },
};

export const legalPages: Record<string, PublicArticlePageData> = {
  terms: {
    eyebrow: "Legal",
    title: "Terms of Service",
    summary:
      "Last updated March 15, 2026. These terms govern access to Nodebase products, AI employees, related services, and operational tooling.",
    sections: [
      {
        title: "Scope and acceptance",
        paragraphs: [
          "By creating an account, purchasing a subscription, or using the platform, you agree to these Terms and the related legal documents linked from this site.",
          "If you use Nodebase on behalf of a business, you represent that you have authority to bind that business to these Terms.",
        ],
      },
      {
        title: "Service model",
        bullets: [
          "Nodebase provides software, workflow tooling, and AI employee systems.",
          "Nodebase does not become the operator of your business or assume your regulatory obligations.",
          "The customer remains responsible for business decisions, final approvals where required, and correctness of uploaded records and policies.",
        ],
      },
      {
        title: "Billing and credits",
        bullets: [
          "Subscriptions, usage pricing, credits, and payment requirements are defined on the pricing page or in an executed commercial order form.",
          "Unless otherwise stated, prepaid balances and consumed credits are non-refundable except where required by law or a specific written policy.",
          "Taxes, including GST where applicable, are the customer’s responsibility unless explicitly included.",
        ],
      },
      {
        title: "SLA & Use restrictions",
        bullets: [
          "Nodebase Enterprise deployments (including the ₹999/mo base license) are backed by a 99.9% uptime SLA. Misses result in prorated service credits.",
          "You may not use Nodebase to violate applicable law, impersonate regulated professionals, or deploy deceptive messaging.",
          "You may not attempt to reverse engineer, extract model artifacts, bypass controls, or abuse rate limits.",
        ],
      },
      {
        title: "Liability and changes",
        paragraphs: [
          "To the maximum extent permitted by applicable law, Nodebase is not liable for indirect, incidental, special, or consequential damages. Direct liability is limited to the fees paid for the affected services in the three months preceding the claim.",
          "Nodebase may update these Terms as the product evolves. Material changes will be reflected by an updated date and, where appropriate, additional notice.",
        ],
      },
    ],
    cta: {
      title: "Need commercial or legal clarification before rollout?",
      description: "Use the contact page and we will route it appropriately.",
      primary: { label: "Contact Nodebase", href: "/company/contact" },
      secondary: { label: "Read privacy policy", href: "/legal/privacy" },
    },
  },
  privacy: {
    eyebrow: "Legal",
    title: "Privacy Policy",
    summary:
      "Last updated March 15, 2026. This policy explains how Nodebase collects, uses, stores, and discloses personal and business data across the platform.",
    sections: [
      {
        title: "What we collect",
        bullets: [
          "Account information such as name, email, phone, billing details, and authentication records.",
          "Business configuration data such as listings, schedules, catalogues, templates, and workflow rules.",
          "Operational records such as conversation logs, action events, approvals, payment interactions, and uploaded verification assets where the customer enables those workflows.",
        ],
      },
      {
        title: "How we use information",
        bullets: [
          "To provide, secure, and improve Nodebase services.",
          "To operate AI employee workflows using the business context required for those workflows.",
          "To support onboarding, billing, abuse prevention, debugging, analytics, and lawful requests.",
        ],
      },
      {
        title: "Data boundaries",
        paragraphs: [
          "Nodebase is designed so that customer business context is used to operate the relevant workflow rather than as unrestricted training material for unrelated public systems.",
          "Access to stored information is restricted by role, system need, and legal obligation. Customers are responsible for configuring appropriate workflow boundaries in their own deployment.",
        ],
      },
      {
        title: "Retention and KYC handling",
        bullets: [
          "All imagery processed by Nodebase Eyes for KYC purposes is maintained securely in ephemeral storage and automatically wiped after identity extraction. We never train public models on your sensitive documents.",
          "We retain non-sensitive operational data for as long as reasonably necessary to provide the service and meet contractual obligations.",
          "We may disclose information to service providers where necessary to operate the service or comply with legal process.",
        ],
      },
    ],
    cta: {
      title:
        "If your rollout has privacy-sensitive requirements, involve us early.",
      description:
        "The best time to design privacy boundaries is before the workflow is live.",
      primary: { label: "Contact Nodebase", href: "/company/contact" },
      secondary: { label: "Read cookies policy", href: "/legal/cookies" },
    },
  },
  cookies: {
    eyebrow: "Legal",
    title: "Cookies Policy",
    summary:
      "Last updated March 15, 2026. This policy explains how Nodebase uses cookies, local storage, and similar technologies on public and authenticated surfaces.",
    sections: [
      {
        title: "Why we use cookies",
        bullets: [
          "To keep authenticated sessions working securely.",
          "To remember language, layout, or workflow preferences where relevant.",
          "To monitor reliability, performance, and abuse patterns.",
        ],
      },
      {
        title: "Types of storage",
        bullets: [
          "Strictly necessary cookies used for login and session handling.",
          "Preference storage used to maintain user-selected settings.",
          "Operational analytics or diagnostic storage used to understand performance and improve the service.",
        ],
      },
      {
        title: "Your options",
        paragraphs: [
          "You can modify browser settings to block or delete cookies, but doing so may break sign-in, tenant context, or other parts of the service.",
          "If a future cookie consent surface is required for a specific deployment context, Nodebase may introduce one without changing the core purpose of this policy.",
        ],
      },
    ],
    cta: {
      title: "Questions about storage or tracking behavior?",
      description:
        "Reach out before deploying Nodebase into an environment with custom consent requirements.",
      primary: { label: "Contact Nodebase", href: "/company/contact" },
      secondary: { label: "Read privacy policy", href: "/legal/privacy" },
    },
  },
  refund: {
    eyebrow: "Legal",
    title: "Refund Policy",
    summary:
      "Last updated March 15, 2026. This policy explains when refunds may be available for subscriptions, usage balances, and related charges.",
    sections: [
      {
        title: "General policy",
        paragraphs: [
          "Unless a commercial agreement states otherwise, the ₹999/mo base license is billed in advance and usage balances (compute) are intended for service consumption rather than withdrawal.",
          "Refunds are assessed case by case where there is an unauthorized charge, material service SLA failure, or another legally required basis.",
        ],
      },
      {
        title: "When refunds are usually not available",
        bullets: [
          "Used credits or already-consumed usage.",
          "Change of mind after a service has been provisioned or a period has begun.",
          "Configuration mistakes or operational misuse by the customer where the platform behaved as designed.",
        ],
      },
      {
        title: "Review process",
        bullets: [
          "Requests should include the account identifier, payment details, and the reason for the request.",
          "Nodebase may request evidence or logs to evaluate the claim.",
          "Approved refunds are returned to the original payment method where practical.",
        ],
      },
    ],
    cta: {
      title:
        "For billing disputes, include enough operational detail to let us investigate quickly.",
      description:
        "That usually shortens resolution time more than escalation language does.",
      primary: { label: "Contact billing", href: "/company/contact" },
      secondary: { label: "View pricing", href: "/pricing" },
    },
  },
  risk: {
    eyebrow: "Legal",
    title: "Risk Disclosure",
    summary:
      "Last updated March 15, 2026. AI employees improve operational speed, but they do not remove business, legal, or workflow risk. This page outlines the major risk categories customers should understand.",
    sections: [
      {
        title: "Model and hallucination risk",
        bullets: [
          "Nodebase explicitly bounds LLM capability through Retrieval-Augmented Generation (RAG) and strict semantic grounding.",
          "However, AI systems can still generate inaccurate or contextually poor outputs if the provided operating policies or reference materials are outdated.",
          "Customers must rigorously test the workflow with real operational edge cases before granting autonomous execution.",
        ],
      },
      {
        title: "Operational risk",
        bullets: [
          "Poor escalation design can allow messages or actions to cross the wrong threshold.",
          "Incomplete policy documentation can cause the employee to make inconsistent decisions.",
          "External systems such as messaging rails, calendars, and payment providers may fail or behave unpredictably.",
        ],
      },
      {
        title: "Human responsibility",
        paragraphs: [
          "Customers remain responsible for setting policies, reviewing approval-sensitive actions, and ensuring that regulated or high-risk activities stay under human control where appropriate.",
          "Nodebase recommends a staged rollout with event review, override testing, and clear ownership of exceptions.",
        ],
      },
    ],
    cta: {
      title:
        "If the workflow is sensitive, configure for caution first and autonomy later.",
      description: "That is usually the correct operational sequence.",
      primary: { label: "Review docs", href: "/docs" },
      secondary: { label: "Contact Nodebase", href: "/company/contact" },
    },
  },
  sla: {
    eyebrow: "Legal",
    title: "Service Level Addendum",
    summary:
      "Last updated March 15, 2026. This page describes the baseline service expectations for hosted Nodebase services unless a separate enterprise agreement states otherwise.",
    sections: [
      {
        title: "Service expectations",
        bullets: [
          "Nodebase aims to provide commercially reasonable availability for hosted application surfaces, dashboards, and supporting APIs.",
          "Maintenance windows, upstream provider incidents, force majeure events, and customer-caused incidents may affect service without constituting SLA breach.",
        ],
      },
      {
        title: "Support and response",
        bullets: [
          "Severity and response timing depend on the customer plan or executed commercial agreement.",
          "Customers should report incidents with account context, timestamps, and the impacted workflow or route.",
        ],
      },
      {
        title: "Exclusions",
        paragraphs: [
          "Any stated SLA excludes failures caused by customer misconfiguration, unsupported integrations, external channel outages, or unauthorized changes to deployed systems.",
          "Credits or remedies, where available, will be limited to those expressly stated in the applicable order form or service agreement.",
        ],
      },
    ],
    cta: {
      title:
        "If you need specific response commitments, handle that at the commercial layer.",
      description: "The baseline addendum is intentionally general.",
      primary: { label: "Contact Nodebase", href: "/company/contact" },
      secondary: { label: "Read terms", href: "/legal/terms" },
    },
  },
  aup: {
    eyebrow: "Legal",
    title: "Acceptable Use Policy",
    summary:
      "Last updated March 15, 2026. This policy describes prohibited use of Nodebase services and the conditions under which Nodebase may suspend or terminate access.",
    sections: [
      {
        title: "Prohibited activities",
        bullets: [
          "Illegal conduct, fraud, harassment, or deceptive practices.",
          "Use of Nodebase to impersonate regulated professionals or misstate the capabilities or status of an AI employee.",
          "Attempts to disrupt the platform, evade controls, abuse rate limits, or interfere with other users.",
        ],
      },
      {
        title: "Sensitive workflow obligations",
        bullets: [
          "Customers must not use the platform to automate activities that require licensed human judgement unless the workflow is configured to preserve that legal requirement.",
          "Verification, payments, and compliance-heavy flows should be designed with the correct human approvals and disclosures.",
        ],
      },
      {
        title: "Enforcement",
        paragraphs: [
          "Nodebase may investigate suspected misuse, request clarification, limit features, suspend accounts, or terminate service where misuse, abuse, or unlawful operation is reasonably suspected.",
          "Where practical, Nodebase may provide notice before enforcement, but immediate action may be taken for security or legal reasons.",
        ],
      },
    ],
    cta: {
      title: "Use the system like an operator, not like an exploit surface.",
      description:
        "That sounds obvious, but it covers more edge cases than most policy pages admit.",
      primary: { label: "Contact Nodebase", href: "/company/contact" },
      secondary: { label: "Read risk disclosure", href: "/legal/risk" },
    },
  },
};
