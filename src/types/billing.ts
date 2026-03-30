
export type PaymentProvider = 'razorpay' | 'stripe';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type BillingInterval = 'month' | 'year' | 'one_time';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing' | 'paused';

import { Json } from './supabase';

export interface BillingPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string | null;
  interval: string | null;
  product: string | null;
  features: Json | null;
  type: string | null;
  created_at: string | null;
}

export interface Subscription {
  id: string;
  userId: string | null;
  planId: string | null;
  status: SubscriptionStatus | string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean | null;
  providerSubscriptionId?: string | null;
  metadata?: any | null;
}

export interface Invoice {
  id: string;
  userId: string | null;
  subscriptionId?: string | null;
  amount: number;
  currency: string | null;
  status: PaymentStatus | string | null;
  date: string | null;
  pdfUrl?: string | null;
  items: any | null;
  billingDetails: {
    name: string | null;
    address?: string | null;
    taxId?: string | null;
  };
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'netbanking' | string | null;
  last4?: string | null;
  brand?: string | null;
  isDefault: boolean | null;
}

export interface Transaction {
    id: string;
    userId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    type: 'payment' | 'refund' | 'credit';
    description: string | null;
    createdAt: string;
}
