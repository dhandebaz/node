
import { BillingPlan, Subscription, Invoice, PaymentMethod, Transaction } from "@/types/billing";

// Mock Data
const PLANS: BillingPlan[] = [
  {
    id: "plan_kaisa_manager",
    name: "Kaisa Manager",
    description: "For individual managers",
    price: 299,
    currency: "INR",
    interval: "month",
    product: "kaisa",
    features: ["Task Management", "Basic Modules", "Standard Support"],
    type: "subscription"
  },
  {
    id: "plan_kaisa_founder",
    name: "Kaisa Co-founder",
    description: "For growing businesses",
    price: 999,
    currency: "INR",
    interval: "month",
    product: "kaisa",
    features: ["All Modules", "Priority Support", "Advanced Analytics", "Multi-user"],
    type: "subscription"
  },
  {
    id: "plan_space_shared",
    name: "Shared Hosting",
    description: "Reliable web hosting",
    price: 199,
    currency: "INR",
    interval: "month",
    product: "space",
    features: ["1 Website", "10GB Storage", "Free SSL"],
    type: "subscription"
  },
  {
    id: "credit_kaisa_100",
    name: "100 Credits",
    description: "Top-up for AI tasks",
    price: 100,
    currency: "INR",
    interval: "one_time",
    product: "kaisa",
    features: ["100 Task Credits"],
    type: "credits"
  }
];

// Mock State
let MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "sub_k_001",
    userId: "USR-001",
    planId: "plan_kaisa_manager",
    status: "active",
    currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days left
    cancelAtPeriodEnd: false,
  },
  {
    id: "sub_s_001",
    userId: "USR-001",
    planId: "plan_space_shared",
    status: "active",
    currentPeriodStart: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    currentPeriodEnd: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    cancelAtPeriodEnd: false,
  }
];

let MOCK_INVOICES: Invoice[] = [
  {
    id: "inv_001",
    userId: "USR-001",
    subscriptionId: "sub_k_001",
    amount: 299,
    currency: "INR",
    status: "completed",
    date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    items: [{ description: "Kaisa Manager - Monthly", amount: 299 }],
    billingDetails: { name: "Aditya Sharma" }
  },
  {
    id: "inv_002",
    userId: "USR-001",
    subscriptionId: "sub_k_001",
    amount: 299,
    currency: "INR",
    status: "completed",
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    items: [{ description: "Kaisa Manager - Monthly", amount: 299 }],
    billingDetails: { name: "Aditya Sharma" }
  },
  {
    id: "inv_003",
    userId: "USR-001",
    subscriptionId: "sub_s_001",
    amount: 199,
    currency: "INR",
    status: "completed",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    items: [{ description: "Shared Hosting - Monthly", amount: 199 }],
    billingDetails: { name: "Aditya Sharma" }
  }
];

let MOCK_PAYMENT_METHODS: PaymentMethod[] = [
    {
        id: "pm_001",
        type: "card",
        last4: "4242",
        brand: "Visa",
        isDefault: true
    },
    {
        id: "pm_002",
        type: "upi",
        brand: "upi",
        last4: "sharma@okicici",
        isDefault: false
    }
];

export const billingService = {
  async getPlans(product?: 'kaisa' | 'space'): Promise<BillingPlan[]> {
    if (product) return PLANS.filter(p => p.product === product);
    return PLANS;
  },

  async getPlanById(planId: string): Promise<BillingPlan | undefined> {
    return PLANS.find(p => p.id === planId);
  },

  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    return MOCK_SUBSCRIPTIONS.filter(s => s.userId === userId);
  },

  async getUserInvoices(userId: string): Promise<Invoice[]> {
    return MOCK_INVOICES.filter(i => i.userId === userId).sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },
  
  async getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
      // In real app, fetch from Razorpay/Stripe customer
      return MOCK_PAYMENT_METHODS;
  },

  // Actions
  async upgradeSubscription(userId: string, subscriptionId: string, newPlanId: string): Promise<Subscription> {
    const subIndex = MOCK_SUBSCRIPTIONS.findIndex(s => s.id === subscriptionId && s.userId === userId);
    if (subIndex === -1) throw new Error("Subscription not found");

    const newPlan = PLANS.find(p => p.id === newPlanId);
    if (!newPlan) throw new Error("Plan not found");

    // Logic: Prorate, charge difference (mocked)
    const updatedSub = {
        ...MOCK_SUBSCRIPTIONS[subIndex],
        planId: newPlanId,
        // In reality, this might reset period or just change plan
    };
    MOCK_SUBSCRIPTIONS[subIndex] = updatedSub;
    
    // Create invoice for upgrade
    MOCK_INVOICES.unshift({
        id: `inv_${Date.now()}`,
        userId,
        subscriptionId,
        amount: newPlan.price, // Simplified
        currency: newPlan.currency,
        status: "completed",
        date: new Date().toISOString(),
        items: [{ description: `Upgrade to ${newPlan.name}`, amount: newPlan.price }],
        billingDetails: { name: "User" }
    });

    return updatedSub;
  },

  async cancelSubscription(userId: string, subscriptionId: string): Promise<Subscription> {
    const subIndex = MOCK_SUBSCRIPTIONS.findIndex(s => s.id === subscriptionId && s.userId === userId);
    if (subIndex === -1) throw new Error("Subscription not found");

    const updatedSub = {
        ...MOCK_SUBSCRIPTIONS[subIndex],
        cancelAtPeriodEnd: true
    };
    MOCK_SUBSCRIPTIONS[subIndex] = updatedSub;
    return updatedSub;
  },
  
  async resumeSubscription(userId: string, subscriptionId: string): Promise<Subscription> {
    const subIndex = MOCK_SUBSCRIPTIONS.findIndex(s => s.id === subscriptionId && s.userId === userId);
    if (subIndex === -1) throw new Error("Subscription not found");

    const updatedSub = {
        ...MOCK_SUBSCRIPTIONS[subIndex],
        cancelAtPeriodEnd: false
    };
    MOCK_SUBSCRIPTIONS[subIndex] = updatedSub;
    return updatedSub;
  }
};
