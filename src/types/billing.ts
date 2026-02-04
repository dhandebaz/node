
export type PaymentProvider = 'razorpay' | 'stripe';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type BillingInterval = 'month' | 'year' | 'one_time';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing' | 'paused';

export interface BillingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: BillingInterval;
  product: 'kaisa' | 'space';
  features: string[];
  type: 'subscription' | 'addon' | 'credits';
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  providerSubscriptionId?: string; // Razorpay subscription ID
  metadata?: Record<string, any>;
}

export interface Invoice {
  id: string;
  userId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  date: string;
  pdfUrl?: string;
  items: {
    description: string;
    amount: number;
  }[];
  billingDetails: {
    name: string;
    address?: string;
    taxId?: string; // GST
  };
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'netbanking';
  last4?: string;
  brand?: string; // Visa, Mastercard, or UPI handle
  isDefault: boolean;
}

export interface Transaction {
    id: string;
    userId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    type: 'payment' | 'refund' | 'credit';
    description: string;
    createdAt: string;
}
