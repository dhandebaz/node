import { PricingService } from "@/lib/services/pricingService";
import PricingRulesForm from "./PricingRulesForm";

export default async function AdminPricingRulesPage() {
  const rules = await PricingService.getRules();

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">System Pricing Configuration</h1>
        <p className="mb-8 text-gray-600">
          Configure the base cost per token and multipliers for different actions and personas.
          These settings affect credit consumption for all tenants immediately.
        </p>
        <PricingRulesForm initialRules={rules} />
      </div>
    </div>
  );
}
