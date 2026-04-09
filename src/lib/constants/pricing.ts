
import { BusinessType } from "@/types";
import { PricingService } from "@/lib/services/pricingService";

export type SubscriptionPlan = "starter" | "pro" | "business";

export const PLAN_LIMITS = {
  starter: {
    integrations: 1,
    bookings_per_month: 10,
    ai_replies_per_day: 20,
    listings: 1
  },
  pro: {
    integrations: 3,
    bookings_per_month: 100,
    ai_replies_per_day: 100,
    listings: 5
  },
  business: {
    integrations: 10,
    bookings_per_month: 1000,
    ai_replies_per_day: 1000,
    listings: 20
  }
};

// Helper to fetch dynamic price, fallback to static if server side call fails or for client side static refs
// Note: Constants are usually static. If we need dynamic, we should use the service.
// We will modify this object to use getters or placeholders, but for now, 
// let's export a function or keep the structure and rely on the Service where needed.

export const PLAN_PRICING = {
  starter: {
    amount: 0,
    currency: "INR",
    name: "Nodebase Starter",
    credits_per_month: 500
  },
  pro: {
    amount: 1999, // Default fallback
    currency: "INR",
    name: "Nodebase Pro",
    credits_per_month: 5000 
  },
  business: {
    amount: 4999, 
    currency: "INR",
    name: "Nodebase Business",
    credits_per_month: 30000 
  }
};

export const BOOKING_MULTIPLIERS: Record<BusinessType, number> = {
  airbnb_host: 1,
  kirana_store: 10,   
  doctor_clinic: 5,   
  thrift_store: 5,
  service_business: 1
};
