
import { BusinessType } from "@/types";

export type SubscriptionPlan = "starter" | "pro" | "business";

export const PLAN_LIMITS = {
  starter: {
    listings: 1,
    integrations: 1,
    bookings_per_month: 10,
    ai_replies_per_day: 20
  },
  pro: {
    listings: 5,
    integrations: 3,
    bookings_per_month: 100,
    ai_replies_per_day: 100
  },
  business: {
    listings: 50,
    integrations: 10,
    bookings_per_month: 1000,
    ai_replies_per_day: 1000
  }
};

export const PLAN_PRICING = {
  starter: {
    amount: 0,
    currency: "INR",
    name: "Nodebase Starter",
    credits_per_month: 500
  },
  pro: {
    amount: 999, // INR
    currency: "INR",
    name: "Nodebase Pro",
    credits_per_month: 5000 // 10x value
  },
  business: {
    amount: 4999, // INR
    currency: "INR",
    name: "Nodebase Business",
    credits_per_month: 30000 // 60x value
  }
};

export const BOOKING_MULTIPLIERS: Record<BusinessType, number> = {
  airbnb_host: 1,
  kirana_store: 10,   // 100 orders/month (Starter)
  doctor_clinic: 5,   // 50 appts/month (Starter)
  thrift_store: 5     // 50 orders/month (Starter)
};
