import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Stethoscope,
  Store,
  ShoppingBag,
  Home,
  Users,
  Calendar,
  MessageSquare,
  CreditCard,
  ShieldCheck,
  Bot,
  Phone,
  CheckCircle2,
  GraduationCap,
  Dumbbell,
  Car,
  Scale,
  Scissors,
  UtensilsCrossed,
} from "lucide-react";

export type Industry = {
  id: string;
  name: string;
  slug: string;
  icon: LucideIcon;
  tagline: string;
  description: string;
  targetCustomer: string;
  painPoints: string[];
  features: {
    title: string;
    description: string;
    icon: LucideIcon;
  }[];
  caseStudy?: {
    business: string;
    type: string;
    result: string;
    metric: string;
  };
  aiAgent: {
    name: string;
    description: string;
    capabilities: string[];
  };
  competitors: string[];
};

export const industries: Industry[] = [
  {
    id: "hospitality",
    name: "Premium Services",
    slug: "hospitality",
    icon: Building2,
    tagline: "For high-fidelity service firms and operation networks",
    description: "NodeBase transforms professional services with AI that handles client communication, deployment management, and compliance orchestration.",
    targetCustomer: "Service agencies, property operators, professional firms, and high-volume service networks",
    painPoints: [
      "24/7 client communication overhead",
      "Deployment coordination across channels",
      "Manual identity verification",
      "Payment collection and follow-ups",
      "Regulatory compliance tracking",
      "Resource allocation bottlenecks",
    ],
    features: [
      {
        title: "Omnichannel Deployment",
        description: "AI handles client inquiries, scheduling, and confirmation across WhatsApp, Instagram, and direct channels.",
        icon: Calendar,
      },
      {
        title: "Smart Client Communication",
        description: "Instant responses to common queries about service levels, pricing, project status, and policies.",
        icon: MessageSquare,
      },
      {
        title: "Identity Authorization",
        description: "Automated document verification with Nodebase Eyes OCR. Sensitive data automatically masked for institutional security.",
        icon: ShieldCheck,
      },
      {
        title: "Secure Payment Collection",
        description: "Generate Stripe/Razorpay payment links for deposits and balances. AI follows up on pending settlements.",
        icon: CreditCard,
      },
      {
        title: "Compliance Management",
        description: "AI generates legally binding records and ensures all client interactions stay within documented operating boundaries.",
        icon: Bot,
      },
      {
        title: "Voice Operations",
        description: "Nodebase Voice handles phone inquiries natively. Never miss an operational lead or client request.",
        icon: Phone,
      },
    ],
    caseStudy: {
      business: "Apex Operations",
      type: "Service Firm - 12 Regional Zones",
      result: "85% reduction in manual intake time",
      metric: "From 4 hours to 35 minutes average verification",
    },
    aiAgent: {
      name: "Omni AI",
      description: "Premium operations agent that handles client communication, deployment coordination, and compliance automation.",
      capabilities: [
        "Answers client questions instantly",
        "Sends deployment confirmations",
        "Collects secure payments",
        "Coordinates identity verification",
        "Manages compliance records",
        "Escalates complex exceptions",
      ],
    },
    competitors: ["Kommo", "Pipedrive", "Salesforce"],
  },
  {
    id: "healthcare",
    name: "Healthcare",
    slug: "healthcare",
    icon: Stethoscope,
    tagline: "For clinics, doctors, and healthcare providers",
    description: "NodeBase brings AI-powered patient intake and appointment management to healthcare, ensuring no call goes unanswered and patient data is handled securely.",
    targetCustomer: "Doctor clinics, diagnostic centers, dental practices, physiotherapy centers, specialty hospitals",
    painPoints: [
      "Missed appointment calls",
      "Manual appointment scheduling",
      "Patient intake paperwork",
      "Prescription follow-ups",
      "Insurance verification",
      "Emergency escalation",
    ],
    features: [
      {
        title: "AI Appointment Booking",
        description: "Patients book via WhatsApp or voice. AI checks doctor availability and confirms appointments instantly.",
        icon: Calendar,
      },
      {
        title: "Voice Intake & Triage",
        description: "Nodebase Voice handles patient calls, collects symptoms, and routes urgent cases appropriately.",
        icon: Phone,
      },
      {
        title: "Prescription OCR",
        description: "Patients send prescription photos. Nodebase Eyes extracts key details for pre-visit preparation.",
        icon: ShieldCheck,
      },
      {
        title: "Appointment Reminders",
        description: "Automated WhatsApp reminders reduce no-shows by up to 40%. Includes pre-visit instructions.",
        icon: MessageSquare,
      },
      {
        title: "Patient Consent Forms",
        description: "Digital consent collection with audit trails. HIPAA/GDPR compliant data handling.",
        icon: ShieldCheck,
      },
      {
        title: "Follow-up Automation",
        description: "AI sends post-visit messages, collects feedback, and schedules follow-up appointments.",
        icon: Bot,
      },
    ],
    caseStudy: {
      business: "Wellness Clinic",
      type: "Multi-specialty - 5 Doctors",
      result: "45% increase in bookings",
      metric: "From 40 to 58 appointments per day",
    },
    aiAgent: {
      name: "Nurse AI",
      description: "Medical intake specialist that handles patient calls, appointment booking, and prescription processing.",
      capabilities: [
        "Handles appointment calls 24/7",
        "Collects patient symptoms",
        "Books appropriate slots",
        "Sends prescription reminders",
        "Triages urgent cases",
        "Collects consent forms",
      ],
    },
    competitors: ["Practo", "Lybrate", "Qure.ai"],
  },
  {
    id: "retail",
    name: "Retail",
    slug: "retail",
    icon: Store,
    tagline: "For kirana stores, shops, and retail businesses",
    description: "NodeBase powers retail operations with WhatsApp ordering, inventory queries, and automated delivery coordination.",
    targetCustomer: "Kirana stores, apparel shops, electronics stores, grocery stores, specialty retailers",
    painPoints: [
      "WhatsApp order management",
      "Inventory query responses",
      "Price and availability questions",
      "Delivery coordination",
      "Customer follow-ups",
      "Festival sale handling",
    ],
    features: [
      {
        title: "WhatsApp Ordering",
        description: "Customers send product photos or names. AI checks inventory and sends availability with prices.",
        icon: MessageSquare,
      },
      {
        title: "Smart Inventory Queries",
        description: "AI answers stock queries instantly. Shows alternatives when items are unavailable.",
        icon: Store,
      },
      {
        title: "Payment Collection",
        description: "Generate UPI payment links. AI confirms payments and updates order status.",
        icon: CreditCard,
      },
      {
        title: "Delivery Coordination",
        description: "AI shares delivery timelines and tracks orders. Sends updates to customers automatically.",
        icon: Bot,
      },
      {
        title: "Repeat Order Reminders",
        description: "AI identifies frequent customers and sends personalized restock reminders.",
        icon: Calendar,
      },
      {
        title: "Multi-store Support",
        description: "Manage multiple retail locations with unified WhatsApp number. AI routes to correct store.",
        icon: Users,
      },
    ],
    caseStudy: {
      business: "Kirana Direct",
      type: "Grocery - 3 Locations",
      result: "3x increase in WhatsApp orders",
      metric: "From 15 to 45 orders per day via WhatsApp",
    },
    aiAgent: {
      name: "Dukan AI",
      description: "Retail operations AI that handles WhatsApp orders, inventory queries, and delivery coordination.",
      capabilities: [
        "Answers product queries instantly",
        "Processes WhatsApp orders",
        "Shares payment links",
        "Updates delivery status",
        "Handles exchange requests",
        "Manages loyalty points",
      ],
    },
    competitors: ["Dotpe", "StoreHippo", "Paytm"],
  },
  {
    id: "social-commerce",
    name: "Social Commerce",
    slug: "social-commerce",
    icon: ShoppingBag,
    tagline: "For Instagram sellers and DM-first businesses",
    description: "NodeBase automates Instagram DM selling with visual product identification, inventory checks, and Razorpay checkout flows.",
    targetCustomer: "Instagram sellers, Facebook marketplace sellers, WhatsApp catalog businesses, thrift stores",
    painPoints: [
      "DM overload from Instagram",
      "Manual product lookup",
      "Price negotiation in DMs",
      "Payment link generation",
      "Order tracking updates",
      "Visual product matching",
    ],
    features: [
      {
        title: "Instagram DM Automation",
        description: "AI responds to Instagram DMs instantly. Handles product queries, pricing, and availability.",
        icon: MessageSquare,
      },
      {
        title: "Visual Product Lookup",
        description: "Customers send screenshots. Nodebase Eyes identifies products and checks stock.",
        icon: ShoppingBag,
      },
      {
        title: "Smart Inventory",
        description: "AI maintains real-time inventory awareness. Shows alternatives when items are sold out.",
        icon: Store,
      },
      {
        title: "Razorpay Checkout",
        description: "One-click payment links generated in DMs. AI confirms payments and updates orders.",
        icon: CreditCard,
      },
      {
        title: "Order Tracking",
        description: "AI sends shipping updates, delivery confirmation, and feedback requests.",
        icon: Bot,
      },
      {
        title: "Catalog Management",
        description: "Sync Instagram catalog with your inventory. AI keeps prices and availability updated.",
        icon: Calendar,
      },
    ],
    caseStudy: {
      business: "ThriftHub",
      type: "Instagram Seller - 2000+ Products",
      result: "5x faster DM response",
      metric: "From 30 min to 5 min average response time",
    },
    aiAgent: {
      name: "Thrift AI",
      description: "Social commerce AI that handles Instagram DMs, visual product matching, and DM sales.",
      capabilities: [
        "Responds to Instagram DMs",
        "Identifies products from screenshots",
        "Checks real-time inventory",
        "Generates payment links",
        "Updates order status",
        "Handles exchange requests",
      ],
    },
    competitors: ["ManyChat", "Chatfuel", "MobileMonkey"],
  },
  {
    id: "real-estate",
    name: "Real Estate",
    slug: "real-estate",
    icon: Home,
    tagline: "For agents, brokers, and property managers",
    description: "NodeBase automates real estate inquiries, property viewings, and lead qualification with specialized AI.",
    targetCustomer: "Real estate agents, property brokers, property management companies, real estate developers",
    painPoints: [
      "High volume of inquiry calls",
      "Property details repetition",
      "Site visit scheduling",
      "Lead qualification",
      "Follow-up management",
      "Availability updates",
    ],
    features: [
      {
        title: "Voice Property Inquiries",
        description: "Nodebase Voice answers property calls 24/7. Shares details, takes messages, and schedules visits.",
        icon: Phone,
      },
      {
        title: "WhatsApp Property Updates",
        description: "AI sends property details, floor plans, and pricing via WhatsApp based on buyer preferences.",
        icon: MessageSquare,
      },
      {
        title: "Automated Site Visits",
        description: "AI schedules property viewings based on availability. Sends reminders and directions.",
        icon: Calendar,
      },
      {
        title: "Lead Qualification",
        description: "AI qualifies leads via WhatsApp questions. Focus your time on serious buyers only.",
        icon: Bot,
      },
      {
        title: "Document Sharing",
        description: "Share brochures, agreements, and legal documents securely via AI-managed channels.",
        icon: ShieldCheck,
      },
      {
        title: "Follow-up Automation",
        description: "AI follows up with leads at optimal times. Never let a prospect go cold.",
        icon: Users,
      },
    ],
    aiAgent: {
      name: "Realtor AI",
      description: "Real estate AI that handles inquiries, schedules viewings, and qualifies leads automatically.",
      capabilities: [
        "Answers property questions",
        "Schedules site visits",
        "Qualifies buyer leads",
        "Shares property details",
        "Sends follow-up messages",
        "Tracks buyer interest",
      ],
    },
    competitors: ["Vasili", "Rupty", "PropAce"],
  },
  {
    id: "education",
    name: "Education",
    slug: "education",
    icon: GraduationCap,
    tagline: "For coaching centers, tuition, and online courses",
    description: "NodeBase automates student inquiries, enrollment, and follow-ups for educational institutions with specialized AI.",
    targetCustomer: "Coaching centers, tuition centers, online course creators, educational consultants, skill training institutes",
    painPoints: [
      "High volume of admission inquiries",
      "Demo class scheduling",
      "Fee follow-ups",
      "Batch allocation",
      "Student attendance tracking",
      "Course recommendation",
    ],
    features: [
      {
        title: "AI Admission Counselor",
        description: "AI handles course inquiries, explains curricula, and guides students to the right programs.",
        icon: Bot,
      },
      {
        title: "Demo Class Booking",
        description: "Students book demo classes via WhatsApp. AI checks availability and sends confirmations.",
        icon: Calendar,
      },
      {
        title: "Fee Collection",
        description: "Generate Razorpay payment links for fees. AI sends reminders for pending installments.",
        icon: CreditCard,
      },
      {
        title: "Batch Management",
        description: "AI helps allocate students to batches based on preferences, schedules, and availability.",
        icon: Users,
      },
      {
        title: "Attendance Updates",
        description: "Parents receive WhatsApp updates about student attendance and class schedules.",
        icon: MessageSquare,
      },
      {
        title: "Lead Follow-up",
        description: "AI follows up with inquiry leads at optimal times. Never lose a prospective student.",
        icon: Phone,
      },
    ],
    caseStudy: {
      business: "BrightMinds Academy",
      type: "JEE/NEET Coaching - 500 Students",
      result: "60% reduction in inquiry handling time",
      metric: "From 3 hours to 1 hour daily",
    },
    aiAgent: {
      name: "Tutor AI",
      description: "Educational AI that handles admissions, answers course queries, and manages student communications.",
      capabilities: [
        "Answers course questions",
        "Books demo classes",
        "Shares fee structures",
        "Allocates batches",
        "Sends attendance updates",
        "Follows up on inquiries",
      ],
    },
    competitors: ["Practically", "Unacademy", "Viable"],
  },
  {
    id: "fitness",
    name: "Fitness",
    slug: "fitness",
    icon: Dumbbell,
    tagline: "For gyms, trainers, and fitness studios",
    description: "NodeBase automates member inquiries, class bookings, and renewals for fitness businesses.",
    targetCustomer: "Gyms, fitness studios, personal trainers, yoga centers, sports academies",
    painPoints: [
      "Membership inquiries",
      "Class scheduling",
      "Personal training bookings",
      "Renewal reminders",
      "Lead qualification",
      "Diet/plan queries",
    ],
    features: [
      {
        title: "WhatsApp Class Booking",
        description: "Members book gym classes, PT sessions, and yoga slots via WhatsApp. AI confirms instantly.",
        icon: Calendar,
      },
      {
        title: "Membership Inquiries",
        description: "AI answers questions about membership plans, pricing, facilities, and trial sessions.",
        icon: MessageSquare,
      },
      {
        title: "Renewal Automation",
        description: "AI sends renewal reminders 30, 15, and 7 days before expiration. Tracks pending renewals.",
        icon: Bot,
      },
      {
        title: "Lead Qualification",
        description: "AI qualifies leads with questions about fitness goals, preferred timings, and budget.",
        icon: Users,
      },
      {
        title: "Payment Links",
        description: "Generate payment links for memberships, personal training packages, and supplements.",
        icon: CreditCard,
      },
      {
        title: "Post-Workout Follow-up",
        description: "AI sends personalized fitness tips and class recommendations based on member preferences.",
        icon: ShieldCheck,
      },
    ],
    caseStudy: {
      business: "FitLife Gym",
      type: "Premium Gym - 800 Members",
      result: "45% increase in membership renewals",
      metric: "From 65% to 95% renewal rate",
    },
    aiAgent: {
      name: "Coach AI",
      description: "Fitness AI that handles bookings, answers membership queries, and manages renewals.",
      capabilities: [
        "Books classes and PT sessions",
        "Answers membership questions",
        "Sends renewal reminders",
        "Qualifies new leads",
        "Shares diet tips",
        "Handles complaints",
      ],
    },
    competitors: ["Fitternity", "Gympik", "HealthifyMe"],
  },
  {
    id: "automotive",
    name: "Automotive",
    slug: "automotive",
    icon: Car,
    tagline: "For car dealers, service centers, and showrooms",
    description: "NodeBase automates vehicle inquiries, service bookings, and test drive scheduling for automotive businesses.",
    targetCustomer: "Car dealers, two-wheeler showrooms, automotive service centers, spare parts shops, car rental companies",
    painPoints: [
      "Test drive scheduling",
      "Service booking management",
      "Vehicle inquiry handling",
      "EMI/financing queries",
      "Service status updates",
      "Parts availability",
    ],
    features: [
      {
        title: "Vehicle Inquiry AI",
        description: "AI answers questions about car variants, colors, features, and on-road prices.",
        icon: MessageSquare,
      },
      {
        title: "Test Drive Booking",
        description: "Customers book test drives via WhatsApp. AI checks availability and sends confirmations.",
        icon: Calendar,
      },
      {
        title: "Service Scheduling",
        description: "Vehicle owners book service appointments. AI reminds about upcoming services.",
        icon: Bot,
      },
      {
        title: "Service Status Updates",
        description: "AI sends WhatsApp updates about service progress, estimated completion, and delivery.",
        icon: Phone,
      },
      {
        title: "EMI/Financing Queries",
        description: "AI answers questions about loan eligibility, EMI calculators, and financing options.",
        icon: CreditCard,
      },
      {
        title: "Parts Availability",
        description: "Customers check spare parts availability via WhatsApp. AI provides pricing and delivery times.",
        icon: Store,
      },
    ],
    caseStudy: {
      business: "AutoCare Services",
      type: "Multi-brand Service Center - 200 Cars/Month",
      result: "35% reduction in missed appointments",
      metric: "From 15 to 10 missed bookings monthly",
    },
    aiAgent: {
      name: "Mechanic AI",
      description: "Automotive AI that handles inquiries, books test drives, and manages service schedules.",
      capabilities: [
        "Answers vehicle questions",
        "Books test drives",
        "Schedules services",
        "Updates service status",
        "Handles financing queries",
        "Checks parts availability",
      ],
    },
    competitors: ["CarDekho", "Spinny", "GoMechanic"],
  },
  {
    id: "legal",
    name: "Legal",
    slug: "legal",
    icon: Scale,
    tagline: "For lawyers, law firms, and legal consultants",
    description: "NodeBase automates client intake, appointment scheduling, and case updates for legal practices.",
    targetCustomer: "Lawyers, law firms, legal consultants, notary services, trademark attorneys",
    painPoints: [
      "Initial case screening",
      "Consultation scheduling",
      "Document collection",
      "Fee estimation",
      "Client follow-ups",
      "Appointment reminders",
    ],
    features: [
      {
        title: "Client Intake AI",
        description: "AI screens new clients via WhatsApp, collects case details, and routes to appropriate lawyer.",
        icon: Bot,
      },
      {
        title: "Consultation Booking",
        description: "Clients book legal consultations via WhatsApp. AI checks lawyer availability and confirms.",
        icon: Calendar,
      },
      {
        title: "Document Collection",
        description: "AI requests and receives documents via WhatsApp. Nodebase Eyes OCR extracts key details.",
        icon: ShieldCheck,
      },
      {
        title: "Fee Estimates",
        description: "AI provides preliminary fee estimates based on case type. Shares payment links for retainers.",
        icon: CreditCard,
      },
      {
        title: "Case Updates",
        description: "AI sends clients WhatsApp updates about case status, next hearing dates, and requirements.",
        icon: MessageSquare,
      },
      {
        title: "Compliance Logging",
        description: "All client communications logged for compliance. Audit trails for case management.",
        icon: CheckCircle2,
      },
    ],
    caseStudy: {
      business: "LexCorp Legal",
      type: "Corporate Law Firm - 12 Attorneys",
      result: "50% reduction in intake time",
      metric: "From 45 min to 20 min per client",
    },
    aiAgent: {
      name: "Counsel AI",
      description: "Legal AI that handles client intake, consultation booking, and document collection.",
      capabilities: [
        "Screens new clients",
        "Collects case details",
        "Books consultations",
        "Sends case updates",
        "Shares fee estimates",
        "Collects documents",
      ],
    },
    competitors: ["LawRato", "CivilFirst", "MyAdvo"],
  },
  {
    id: "beauty",
    name: "Beauty & Wellness",
    slug: "beauty",
    icon: Scissors,
    tagline: "For salons, spas, and beauty parlors",
    description: "NodeBase automates appointments, product inquiries, and loyalty programs for beauty businesses.",
    targetCustomer: "Salons, spas, beauty parlors, nail art studios, grooming centers, aesthetic clinics",
    painPoints: [
      "Appointment booking management",
      "Service availability queries",
      "Product recommendations",
      "Package promotions",
      "Client loyalty tracking",
      " stylist availability",
    ],
    features: [
      {
        title: "WhatsApp Appointments",
        description: "Clients book services via WhatsApp. AI checks stylist availability and confirms slots.",
        icon: Calendar,
      },
      {
        title: "Service Queries",
        description: "AI answers questions about services, pricing, duration, and available time slots.",
        icon: MessageSquare,
      },
      {
        title: "Product Recommendations",
        description: "AI recommends products based on client queries about hair, skin, or beauty concerns.",
        icon: Bot,
      },
      {
        title: "Package Upsells",
        description: "AI suggests relevant packages and promotions during booking conversations.",
        icon: CreditCard,
      },
      {
        title: "Loyalty Program",
        description: "Track client visits and points. AI informs about rewards and upcoming promotions.",
        icon: Users,
      },
      {
        title: "Pre-Treatment Instructions",
        description: "AI sends pre-treatment care instructions and preparation tips before appointments.",
        icon: ShieldCheck,
      },
    ],
    caseStudy: {
      business: "Glow Studio",
      type: "Premium Salon Chain - 4 Locations",
      result: "40% increase in advance bookings",
      metric: "From 20 to 35 same-day bookings converted",
    },
    aiAgent: {
      name: "Style AI",
      description: "Beauty AI that handles bookings, answers service questions, and manages client loyalty.",
      capabilities: [
        "Books appointments",
        "Answers service questions",
        "Recommends products",
        "Suggests packages",
        "Tracks loyalty points",
        "Sends reminders",
      ],
    },
    competitors: ["Blowfin", "Vyana", "UrbanClap Pro"],
  },
  {
    id: "food",
    name: "Food & Delivery",
    slug: "food",
    icon: UtensilsCrossed,
    tagline: "For restaurants, cloud kitchens, and food delivery",
    description: "NodeBase automates orders, delivery coordination, and customer support for food businesses.",
    targetCustomer: "Restaurants, cloud kitchens, food delivery brands, bakeries, meal prep services, pizza shops",
    painPoints: [
      "Multi-platform order management",
      "Delivery status updates",
      "Customization requests",
      "Complaint handling",
      "Repeat order reminders",
      "Menu queries",
    ],
    features: [
      {
        title: "Unified Order Management",
        description: "AI receives orders from WhatsApp, Instagram, and website in one place. No more tab-switching.",
        icon: MessageSquare,
      },
      {
        title: "Delivery Tracking",
        description: "AI sends automated delivery status updates via WhatsApp. Tracks order from kitchen to doorstep.",
        icon: Bot,
      },
      {
        title: "Custom Order Handling",
        description: "AI handles customizations, dietary requirements, and special requests in natural language.",
        icon: UtensilsCrossed,
      },
      {
        title: "Payment Collection",
        description: "Generate UPI/payment links in WhatsApp. AI confirms payments and updates order status.",
        icon: CreditCard,
      },
      {
        title: "Repeat Order Campaigns",
        description: "AI identifies frequent customers and sends personalized deals on their favorite items.",
        icon: Calendar,
      },
      {
        title: "Complaint Resolution",
        description: "AI handles refund requests, missing items, and delivery complaints with empathy.",
        icon: ShieldCheck,
      },
    ],
    caseStudy: {
      business: "FreshBite Kitchen",
      type: "Cloud Kitchen - 5 Brands",
      result: "25% increase in repeat orders",
      metric: "From 30% to 55% repeat rate",
    },
    aiAgent: {
      name: "Chef AI",
      description: "Food business AI that handles orders, tracks deliveries, and manages customer support.",
      capabilities: [
        "Takes WhatsApp orders",
        "Tracks delivery status",
        "Handles customizations",
        "Processes refunds",
        "Sends repeat deals",
        "Answers menu questions",
      ],
    },
    competitors: ["Dotpe", "Zomato", "Swiggy"],
  },
];

export const getIndustryContent = (slug: string) => {
  return industries.find((i) => i.slug === slug) || null;
};

export { CheckCircle2 };
