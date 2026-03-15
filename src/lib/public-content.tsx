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
    label: "AI Employees",
    href: "/employees",
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
      { label: "AI Employees", href: "/employees" },
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
  eyebrow: "AI Employees",
  title: "Specialized AI employees with one job to own.",
  summary:
    "Each Nodebase employee comes with a role, default workflows, connected tools, and operating guardrails. You hire by business outcome, not by model configuration.",
  metrics: [
    { label: "Setup time", value: "< 2 hours" },
    { label: "Channels", value: "WhatsApp, web, inbox" },
    { label: "Regions", value: "Built for India-first ops" },
  ],
  cards: [
    {
      title: "Host AI",
      description:
        "Handles guest replies, pre-arrival nudges, payment follow-up, and verification workflows for short stays.",
      href: "/employees/host-ai",
      icon: Building2,
      eyebrow: "Hospitality",
      stat: "Stays & bookings",
      ctaLabel: "View Host AI",
    },
    {
      title: "Nurse AI",
      description:
        "Manages intake, appointment reminders, follow-ups, and queue hygiene for clinics and diagnostic centers.",
      href: "/employees/nurse-ai",
      icon: Stethoscope,
      eyebrow: "Healthcare",
      stat: "Appointments",
      ctaLabel: "View Nurse AI",
    },
    {
      title: "Dukan AI",
      description:
        "Automates catalogue questions, order status, pickup coordination, and repeat purchase nudges for local commerce.",
      href: "/employees/dukan-ai",
      icon: Store,
      eyebrow: "Retail",
      stat: "Orders & DMs",
      ctaLabel: "View Dukan AI",
    },
    {
      title: "Thrift AI",
      description:
        "Runs Instagram-style selling workflows across inquiry, reservation, payment, and fulfillment follow-up.",
      href: "/employees/thrift-ai",
      icon: ShoppingBag,
      eyebrow: "Social commerce",
      stat: "DM selling",
      ctaLabel: "View Thrift AI",
    },
  ],
  sections: [
    {
      title: "What changes with the new workflow",
      cards: [
        {
          title: "Role-first setup",
          description:
            "You start by selecting the business role and channels. Nodebase ships the prompt stack, tools, and escalation rules.",
          icon: BriefcaseBusiness,
        },
        {
          title: "Operational memory",
          description:
            "Employees keep context about listings, clinic hours, stock policies, and payment expectations without manual copy-paste.",
          icon: BrainCircuit,
        },
        {
          title: "Guardrailed execution",
          description:
            "Every employee has action boundaries, approval thresholds, and ledgered events for auditability.",
          icon: ShieldCheck,
        },
      ],
      columns: 3,
    },
  ],
  cta: {
    title: "Pick the employee that matches your operational bottleneck.",
    description:
      "If the fit is unclear, start with a guided consult and we will map the role to your exact workflow.",
    primary: { label: "Book a workflow review", href: "/company/contact" },
    secondary: { label: "See pricing", href: "/pricing" },
  },
};

export const employeePages: Record<string, PublicArticlePageData> = {
  "host-ai": {
    eyebrow: "Hospitality employee",
    title:
      "Host AI keeps guest communication, payment nudges, and compliance in one lane.",
    summary:
      "Designed for homestays, vacation rentals, and multi-property operators who need fast guest replies without turning every WhatsApp thread into founder work.",
    metrics: [
      { label: "Best for", value: "Short-stay operators" },
      { label: "Response loop", value: "Inbox to arrival" },
      { label: "Escalation", value: "Owner or property staff" },
    ],
    sections: [
      {
        title: "Primary responsibilities",
        cards: [
          {
            title: "Reservation coordination",
            description:
              "Handles availability clarifications, booking confirmations, reminder flows, and post-booking FAQs.",
            icon: CalendarClock,
          },
          {
            title: "Payment follow-up",
            description:
              "Sends structured nudges around deposit, check-in, and settlement timing without sounding robotic.",
            icon: CreditCard,
          },
          {
            title: "Guest verification readiness",
            description:
              "Guides guests through verification links, arrival details, and the data required before handoff.",
            icon: FileCheck2,
          },
        ],
        columns: 3,
      },
      {
        title: "Default workflow",
        bullets: [
          "Reads the listing context, check-in notes, pricing guardrails, and cancellation policy before replying.",
          "Answers common booking and stay questions with listing-aware context instead of generic support copy.",
          "Pushes owner-facing escalation only when the message crosses policy, pricing, or exception thresholds.",
          "Logs the important event trail so operations can audit payment and verification milestones later.",
        ],
      },
      {
        title: "Connected tools",
        cards: [
          {
            title: "WhatsApp and inbox",
            description:
              "Host AI can work in the channel where the guest already is instead of forcing a new portal.",
            icon: MessagesSquare,
          },
          {
            title: "Listings and calendars",
            description:
              "Availability context and operating notes are used directly in replies and follow-up sequences.",
            icon: Layers3,
          },
          {
            title: "Payment links and KYC",
            description:
              "Payment reminders and verification requests stay attached to the same operating workflow.",
            icon: WalletCards,
          },
        ],
        columns: 3,
      },
    ],
    cta: {
      title: "Host AI is for operators who want speed without losing control.",
      description:
        "If your bottleneck is pre-arrival support and conversion follow-up, this is the fastest employee to deploy.",
      primary: { label: "Deploy Host AI", href: "/login" },
      secondary: { label: "View pricing", href: "/pricing" },
    },
  },
  "nurse-ai": {
    eyebrow: "Healthcare employee",
    title:
      "Nurse AI keeps patient messaging clean, timely, and operationally safe.",
    summary:
      "Built for clinics and healthcare teams that need dependable intake, scheduling follow-up, and structured communication without turning medical staff into inbox managers.",
    metrics: [
      { label: "Best for", value: "Clinics & diagnostics" },
      { label: "Core loop", value: "Inquiry to appointment" },
      { label: "Guardrails", value: "Non-diagnostic by design" },
    ],
    sections: [
      {
        title: "Primary responsibilities",
        cards: [
          {
            title: "Patient intake triage",
            description:
              "Collects structured basics, reason for visit, and preferred slot without asking clinical questions it should not handle.",
            icon: ClipboardList,
          },
          {
            title: "Schedule hygiene",
            description:
              "Reduces no-shows with reminder loops, reschedule capture, and appointment confirmations tied to calendar logic.",
            icon: CalendarClock,
          },
          {
            title: "Follow-up messaging",
            description:
              "Runs care-adjacent follow-up, document reminders, and front-desk communication after visits.",
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
      title:
        "Use Nurse AI to compress front-desk effort without compromising safety.",
      description:
        "It is optimized for operational communication, not clinical substitution.",
      primary: { label: "Start a healthcare setup", href: "/login" },
      secondary: { label: "Talk to the team", href: "/company/contact" },
    },
  },
  "dukan-ai": {
    eyebrow: "Retail employee",
    title:
      "Dukan AI turns repetitive catalogue questions and order follow-up into a managed retail loop.",
    summary:
      "For local stores and modern merchants selling over WhatsApp, DMs, and repeat customer channels with small teams and high message volume.",
    metrics: [
      { label: "Best for", value: "Kirana & local retail" },
      { label: "Core loop", value: "Question to order" },
      { label: "Typical channel", value: "WhatsApp-first" },
    ],
    sections: [
      {
        title: "Primary responsibilities",
        cards: [
          {
            title: "Catalogue answers",
            description:
              "Responds to pricing, sizes, availability, and delivery logic using the merchant’s own catalogue and policy rules.",
            icon: Store,
          },
          {
            title: "Order follow-through",
            description:
              "Captures intent, confirms pickup or delivery expectations, and closes the loop on status updates.",
            icon: TimerReset,
          },
          {
            title: "Repeat purchase prompts",
            description:
              "Runs lightweight reminders and reorder suggestions based on prior purchases and timing windows.",
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
      title:
        "Deploy Dukan AI where message volume already hurts your order quality.",
      description:
        "It is built to reduce missed replies and speed up order confirmation without forcing an app migration.",
      primary: { label: "Deploy Dukan AI", href: "/login" },
      secondary: { label: "See partner options", href: "/company/partners" },
    },
  },
  "thrift-ai": {
    eyebrow: "Social commerce employee",
    title:
      "Thrift AI manages Instagram-style inquiry, reservation, and payment follow-up with resale discipline.",
    summary:
      "For businesses where conversion happens in DMs, stock turns quickly, and every missed follow-up costs a sale.",
    metrics: [
      { label: "Best for", value: "DM-led selling" },
      { label: "Core loop", value: "Inquiry to paid reservation" },
      { label: "Strength", value: "Speed with tone control" },
    ],
    sections: [
      {
        title: "Primary responsibilities",
        cards: [
          {
            title: "Inquiry triage",
            description:
              "Sorts serious buyers, handles size and condition questions, and keeps first response times low.",
            icon: ShoppingBag,
          },
          {
            title: "Reservation workflow",
            description:
              "Creates urgency and holds inventory windows without losing clarity on payment expectations.",
            icon: Rocket,
          },
          {
            title: "Fulfillment follow-up",
            description:
              "Confirms payment, shipping, and customer reassurance after the sale closes.",
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
      title:
        "Thrift AI is for teams that sell in conversation, not in a traditional cart.",
      description:
        "Use it when speed-to-reply and reservation discipline matter more than a storefront theme.",
      primary: { label: "Deploy Thrift AI", href: "/login" },
      secondary: { label: "Talk to sales", href: "/company/contact" },
    },
  },
};

export const companyDirectoryPage: PublicDirectoryPageData = {
  eyebrow: "Company",
  title:
    "Nodebase is building an operating system for AI employees, not just another chatbot layer.",
  summary:
    "The public site, product posture, and partner motion all moved up-market. This section explains the company, the partner model, and how we are shipping infrastructure around practical business workflows.",
  metrics: [
    { label: "HQ", value: "India" },
    { label: "Focus", value: "Operational AI systems" },
    { label: "Motion", value: "Operator-led deployment" },
  ],
  cards: [
    {
      title: "Careers",
      description:
        "How the team operates, what we hire for, and where we need product-minded engineers next.",
      href: "/company/careers",
      icon: BriefcaseBusiness,
      eyebrow: "Open roles",
      ctaLabel: "See careers",
    },
    {
      title: "Partners",
      description:
        "Technology partners, system integrators, and operators who want to build Nodebase into delivery.",
      href: "/company/partners",
      icon: Handshake,
      eyebrow: "Ecosystem",
      ctaLabel: "See partner tracks",
    },
    {
      title: "Trust & legal",
      description:
        "Security posture, data boundaries, and the operating commitments behind the platform.",
      href: "/trust",
      icon: ShieldCheck,
      eyebrow: "Trust",
      ctaLabel: "Visit trust center",
    },
    {
      title: "Contact",
      description:
        "Talk to the team about pilots, deployment support, or partner opportunities.",
      href: "/company/contact",
      icon: Mail,
      eyebrow: "Reach us",
      ctaLabel: "Open contact page",
    },
  ],
  sections: [
    {
      title: "How the company has changed",
      cards: [
        {
          title: "From chatbot branding to AI employees",
          description:
            "The language now maps directly to operational roles, which makes onboarding and sales sharper.",
          icon: Bot,
        },
        {
          title: "From features to workflow outcomes",
          description:
            "Pages now organize around what the system does for hospitality, healthcare, retail, and partner delivery.",
          icon: Activity,
        },
        {
          title: "From generic SaaS design to tactile system UI",
          description:
            "The visual system uses depth, pressure, and motion as affordances rather than decoration.",
          icon: Layers3,
        },
      ],
      columns: 3,
    },
  ],
  cta: {
    title: "If you deploy operational systems, we should probably talk.",
    description:
      "Nodebase is opinionated about delivery, escalation, and auditability. That is a feature, not a limitation.",
    primary: { label: "Contact Nodebase", href: "/company/contact" },
    secondary: { label: "Review partner tracks", href: "/company/partners" },
  },
};

export const careersPage: PublicArticlePageData = {
  eyebrow: "Careers",
  title:
    "We hire people who can make a workflow sharper, not just ship an interface.",
  summary:
    "Nodebase is small by design. Roles are scoped around product judgment, systems thinking, and shipping discipline across engineering, infrastructure, and go-to-market delivery.",
  metrics: [
    { label: "Team model", value: "Small & senior" },
    { label: "Work style", value: "High ownership" },
    { label: "Hiring lens", value: "Product + systems" },
  ],
  sections: [
    {
      title: "What we optimize for",
      cards: [
        {
          title: "Operational taste",
          description:
            "You know how software lands in a real business workflow and can cut the unnecessary layers out of it.",
          icon: Activity,
        },
        {
          title: "Systems clarity",
          description:
            "You can reason from customer behavior through architecture, tooling, and maintenance burden.",
          icon: Waypoints,
        },
        {
          title: "Shipping judgement",
          description:
            "You know the difference between quick work and sloppy work, and you can defend the distinction.",
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
    title:
      "If you can improve a business workflow with software and taste, reach out.",
    description:
      "We would rather read a sharp note and one strong artifact than a polished but generic application pack.",
    primary: { label: "Email the team", href: "/company/contact" },
    secondary: { label: "Review company overview", href: "/company" },
  },
};

export const partnersDirectoryPage: PublicDirectoryPageData = {
  eyebrow: "Partners",
  title:
    "Nodebase partners are the multiplier between product capability and field execution.",
  summary:
    "We work with technology companies, integrators, and delivery operators who want structured automation that survives contact with real businesses.",
  metrics: [
    { label: "Tracks", value: "Technology + integrators" },
    { label: "Delivery focus", value: "Implementation quality" },
    { label: "Primary market", value: "India-led operations" },
  ],
  cards: [
    {
      title: "Technology partners",
      description:
        "Messaging, payment, scheduling, and infrastructure partners that extend what employees can do in production.",
      href: "/company/partners/technology",
      icon: Globe2,
      eyebrow: "Platform",
      ctaLabel: "View technology track",
    },
    {
      title: "System integrators",
      description:
        "Operators who implement Nodebase into client environments and own rollout, training, and escalation design.",
      href: "/company/partners/system-integrators",
      icon: Building2,
      eyebrow: "Delivery",
      ctaLabel: "View SI track",
    },
  ],
  sections: [
    {
      title: "What we look for in partners",
      bullets: [
        "A bias toward deployment quality over lead volume.",
        "Comfort with operational design, escalation, and compliance-sensitive workflows.",
        "The ability to shape repeatable implementation patterns instead of one-off custom chaos.",
      ],
    },
  ],
  cta: {
    title:
      "Good partners tighten the system instead of turning it into services sprawl.",
    description:
      "If that matches how you work, there is room to build together.",
    primary: { label: "Contact partner team", href: "/company/contact" },
    secondary: { label: "See trust posture", href: "/trust" },
  },
};

export const partnerTrackPages: Record<string, PublicArticlePageData> = {
  "system-integrators": {
    eyebrow: "System integrators",
    title:
      "The SI track is built for teams that can own implementation without breaking operational clarity.",
    summary:
      "This track is for delivery organizations that want a productized system with room for disciplined implementation, not endless customization.",
    metrics: [
      { label: "Partner role", value: "Delivery & rollout" },
      { label: "Best fit", value: "Ops-led integrators" },
      { label: "Engagement", value: "Structured implementation" },
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
      title: "The SI track is meant for partners who like rigor.",
      description:
        "If your default instinct is to turn everything into bespoke consulting, this is probably not the right motion.",
      primary: { label: "Apply as a partner", href: "/company/contact" },
      secondary: {
        label: "View technology track",
        href: "/company/partners/technology",
      },
    },
  },
  technology: {
    eyebrow: "Technology partners",
    title:
      "Technology partnerships should remove friction from deployment, not add another integration tax.",
    summary:
      "We work with partners whose products improve messaging, scheduling, payments, observability, and infrastructure around AI employee workflows.",
    metrics: [
      { label: "Partner role", value: "Product extension" },
      { label: "Best fit", value: "Workflow infrastructure" },
      { label: "Evaluation", value: "Reliability first" },
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
      title:
        "If your product strengthens workflow execution, it is probably relevant.",
      description:
        "The easiest way to start is a clear note on the integration problem you solve.",
      primary: { label: "Talk to partnerships", href: "/company/contact" },
      secondary: { label: "Read docs", href: "/docs" },
    },
  },
};

export const docsDirectoryPage: PublicDirectoryPageData = {
  eyebrow: "Documentation",
  title:
    "The docs are now organized around deployment, control surfaces, and workflow execution.",
  summary:
    "Use the docs to understand how employees are configured, where actions are logged, and how deployment stays predictable across messaging-heavy operations.",
  metrics: [
    { label: "Audience", value: "Operators and builders" },
    { label: "Coverage", value: "Setup, control, integrations" },
    { label: "Style", value: "Practical over abstract" },
  ],
  cards: [
    {
      title: "Getting Started",
      description:
        "What Nodebase is, how the system is structured, and where to begin when setting up the first workflow.",
      href: "/docs/getting-started",
      icon: BookOpenText,
      eyebrow: "Start here",
      ctaLabel: "Read the overview",
    },
    {
      title: "Quickstart",
      description:
        "A short deployment path from account access to the first workflow being production-ready.",
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
  ],
  cta: {
    title:
      "Start with the quickstart if you want the shortest path to a live workflow.",
    description:
      "If you need deeper architecture context first, begin with the Kaisa overview instead.",
    primary: {
      label: "Open quickstart",
      href: "/docs/getting-started/quickstart",
    },
    secondary: { label: "Read Kaisa overview", href: "/docs/kaisa" },
  },
};

export const docsPages: Record<string, PublicArticlePageData> = {
  "getting-started": {
    eyebrow: "Documentation",
    title:
      "Nodebase is built around role-based AI employees and the systems that keep them accountable.",
    summary:
      "This overview is the shortest way to understand how Nodebase thinks about workflows, operational memory, and human override.",
    metrics: [
      { label: "Model", value: "Role-first" },
      { label: "Control", value: "Guardrailed actions" },
      { label: "Auditability", value: "Event-driven logs" },
    ],
    sections: [
      {
        title: "The product model",
        cards: [
          {
            title: "Employees, not chat widgets",
            description:
              "The system is packaged around business roles so operators can reason about it using existing mental models.",
            icon: Bot,
          },
          {
            title: "Workflow state matters",
            description:
              "Every message and action sits inside a larger operational loop that the employee should understand.",
            icon: Activity,
          },
          {
            title: "Humans stay in control",
            description:
              "Approvals, escalation paths, and event logs make override practical instead of ceremonial.",
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
      title:
        "When you are ready, use the quickstart to stand up the first workflow.",
      description:
        "That is the fastest path from concept to an employee that can actually operate.",
      primary: {
        label: "Open quickstart",
        href: "/docs/getting-started/quickstart",
      },
      secondary: {
        label: "Jump to integrations",
        href: "/docs/kaisa/integrations",
      },
    },
  },
  quickstart: {
    eyebrow: "Quickstart",
    title:
      "Stand up a production-ready Nodebase workflow in four practical steps.",
    summary:
      "This is the shortest path to a working employee with channel access, operating context, and clear human fallback.",
    metrics: [
      { label: "Outcome", value: "First live workflow" },
      { label: "Assumption", value: "You know the target use case" },
      { label: "Output", value: "Runnable employee" },
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
channel: whatsapp
autonomy: mixed
approvals:
  refund: human
  pricing_exception: human
  reminder_follow_up: automatic
log_mode: event_stream`,
        },
        note: "Launch only after one real conversation path, one edge case, and one human override have been reviewed end to end.",
      },
    ],
    cta: {
      title:
        "After quickstart, move to the API or integrations docs based on how you plan to operate.",
      description:
        "Most teams go to integrations next. Teams building control surfaces usually go to the API.",
      primary: { label: "Open integrations", href: "/docs/kaisa/integrations" },
      secondary: {
        label: "Read the Agents API",
        href: "/docs/kaisa/agents-api",
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
          label: "Run request",
          value: `POST /v1/agents/{agent_id}/run
{
  "input": "Guest asked for an early check-in option.",
  "context": {
    "listing_id": "lst_1024",
    "booking_reference": "NB-4107"
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
  integrations: {
    eyebrow: "Integrations",
    title:
      "Integrations are structured around workflow reliability, not logo count.",
    summary:
      "Nodebase integrates with the rails that matter for real operations: messaging, payments, schedules, and the records systems that keep them coherent.",
    metrics: [
      { label: "Primary channel", value: "Messaging-first" },
      { label: "Key rails", value: "Payments and calendars" },
      { label: "Deployment style", value: "Audit-friendly" },
    ],
    sections: [
      {
        title: "Messaging",
        cards: [
          {
            title: "WhatsApp and inbox channels",
            description:
              "Employees are strongest when they work where the customer already is, with safe handoff back to the team.",
            icon: MessagesSquare,
          },
          {
            title: "Email follow-up",
            description:
              "Useful for structured support and post-conversation summaries where asynchronous communication matters.",
            icon: Mail,
          },
        ],
        columns: 2,
      },
      {
        title: "Commerce and operations",
        cards: [
          {
            title: "Payments",
            description:
              "Send links, confirm collection, and keep that event inside the same workflow state.",
            icon: CreditCard,
          },
          {
            title: "Scheduling",
            description:
              "Employees can reason against calendars and availability rather than guessing around them.",
            icon: CalendarClock,
          },
          {
            title: "Business records",
            description:
              "Use business context from listings, clinic rules, or merchant policy to keep replies grounded.",
            icon: ServerCog,
          },
        ],
        columns: 3,
      },
      {
        title: "Integration design rules",
        bullets: [
          "Prefer integrations that preserve traceability for every action the employee takes.",
          "Define retries and human fallback before launch, not after the first operational miss.",
          "Keep the number of first-phase integrations low enough that the team can actually observe system behavior.",
        ],
      },
    ],
    cta: {
      title:
        "If the integration increases operational reliability, it belongs in the stack.",
      description: "If it only adds complexity and logos, it does not.",
      primary: { label: "Return to docs", href: "/docs" },
      secondary: { label: "Talk to Nodebase", href: "/company/contact" },
    },
  },
};

export const trustPage: PublicArticlePageData = {
  eyebrow: "Trust center",
  title:
    "The trust posture is built around operator control, bounded data use, and action traceability.",
  summary:
    "Nodebase is meant for workflows where communication, payments, and verification data cannot be handled casually. The trust layer is part of the product, not a marketing appendix.",
  metrics: [
    { label: "Design stance", value: "Least surprise" },
    { label: "Records", value: "Event-level logging" },
    { label: "Data posture", value: "Context-bounded use" },
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
        "Human override remains part of the normal operating model.",
        "Sensitive workflows should be configured with explicit approval or escalation points.",
        "Trust posture is reflected in legal terms, product defaults, and implementation guidance together.",
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
    title: "Trust only matters if it survives deployment.",
    description:
      "If you need to evaluate the platform for a compliance-sensitive workflow, start a review with the team.",
    primary: { label: "Contact Nodebase", href: "/company/contact" },
    secondary: { label: "Read the docs", href: "/docs" },
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
        title: "Use restrictions",
        bullets: [
          "You may not use Nodebase to violate applicable law, impersonate regulated professionals, or deploy deceptive or harmful messaging.",
          "You may not attempt to reverse engineer, extract model artifacts, bypass controls, or abuse rate limits or workflow protections.",
          "You may not misrepresent Nodebase as assuming legal or professional liability for your operational decisions.",
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
        title: "Retention and disclosure",
        bullets: [
          "We retain data for as long as reasonably necessary to provide the service, meet contractual obligations, resolve disputes, and comply with law.",
          "We may disclose information to service providers, partners, or authorities where necessary to operate the service, prevent abuse, or comply with legal process.",
          "Where a workflow involves regulated or sensitive information, additional customer-side configuration and operational controls may be required.",
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
          "Unless a commercial agreement states otherwise, subscriptions are billed in advance and usage balances are intended for service consumption rather than withdrawal.",
          "Refunds are assessed case by case where there is duplicate billing, unauthorized charge, material service failure, or another legally required basis.",
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
        title: "Model and workflow risk",
        bullets: [
          "AI systems can generate incomplete, inaccurate, or contextually poor outputs.",
          "A correct-looking response may still be operationally wrong if the source context is outdated or incomplete.",
          "Customers should test the workflow with real edge cases before treating it as trusted automation.",
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
