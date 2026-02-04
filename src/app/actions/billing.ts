
"use server";

import { billingService } from "@/lib/services/billingService";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

async function getCurrentUser() {
    const session = await getSession();
    // Default to USR-001 for dev if no session
    return { id: session?.userId || "USR-001" }; 
}

export async function getBillingOverview() {
    const user = await getCurrentUser();
    
    const [subscriptions, paymentMethods, invoices] = await Promise.all([
        billingService.getUserSubscriptions(user.id),
        billingService.getUserPaymentMethods(user.id),
        billingService.getUserInvoices(user.id)
    ]);

    // Enrich subscriptions with plan details
    const enrichedSubscriptions = await Promise.all(subscriptions.map(async (sub) => {
        const plan = await billingService.getPlanById(sub.planId);
        return { ...sub, plan };
    }));

    return {
        subscriptions: enrichedSubscriptions,
        paymentMethods,
        recentInvoices: invoices.slice(0, 3) // First 3
    };
}

export async function getBillingHistory() {
    const user = await getCurrentUser();
    return billingService.getUserInvoices(user.id);
}

export async function getAvailablePlans(product: 'kaisa' | 'space') {
    return billingService.getPlans(product);
}

export async function cancelSubscriptionAction(subscriptionId: string) {
    const user = await getCurrentUser();
    await billingService.cancelSubscription(user.id, subscriptionId);
    revalidatePath("/dashboard/billing");
}

export async function resumeSubscriptionAction(subscriptionId: string) {
    const user = await getCurrentUser();
    await billingService.resumeSubscription(user.id, subscriptionId);
    revalidatePath("/dashboard/billing");
}

export async function upgradeSubscriptionAction(subscriptionId: string, newPlanId: string) {
    const user = await getCurrentUser();
    await billingService.upgradeSubscription(user.id, subscriptionId, newPlanId);
    revalidatePath("/dashboard/billing");
}
