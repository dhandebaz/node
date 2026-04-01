import { log } from "@/lib/logger";

export interface MetaAdCampaign {
  id?: string;
  name: string;
  objective: string;
  status: "PAUSED" | "ACTIVE" | "ARCHIVED";
  special_ad_categories: string[];
}

export interface MetaAdSet {
  id?: string;
  name: string;
  campaign_id: string;
  billing_event: string;
  optimization_goal: string;
  bid_amount?: number;
  daily_budget?: number;
  lifetime_budget?: number;
  targeting: any;
  status: "PAUSED" | "ACTIVE" | "ARCHIVED";
}

export interface MetaAd {
  id?: string;
  name: string;
  adset_id: string;
  creative: { creative_id: string } | { ad_format: string; body: string; image_hash: string };
  status: "PAUSED" | "ACTIVE" | "ARCHIVED";
}

export interface MetaLead {
  id: string;
  created_time: string;
  ad_id: string;
  form_id: string;
  field_data: Array<{ name: string; values: string[] }>;
}

const GRAPH_API_VERSION = "v21.0";

export class MetaMarketingService {
  /**
   * Create a new Ad Campaign
   */
  static async createCampaign(adAccountId: string, accessToken: string, campaign: MetaAdCampaign) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/act_${adAccountId}/campaigns`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(campaign),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Failed to create campaign");
      
      log.info("[MetaMarketing] Campaign created", { id: data.id });
      return { success: true, id: data.id };
    } catch (e) {
      log.error("[MetaMarketing] Create campaign failed", { error: e });
      return { success: false, error: (e as Error).message };
    }
  }

  /**
   * Create a new Ad Set
   */
  static async createAdSet(adAccountId: string, accessToken: string, adSet: MetaAdSet) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/act_${adAccountId}/adsets`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(adSet),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Failed to create ad set");

      return { success: true, id: data.id };
    } catch (e) {
      log.error("[MetaMarketing] Create ad set failed", { error: e });
      return { success: false, error: (e as Error).message };
    }
  }

  /**
   * Create a new Ad
   */
  static async createAd(adAccountId: string, accessToken: string, ad: MetaAd) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/act_${adAccountId}/ads`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ad),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Failed to create ad");

      return { success: true, id: data.id };
    } catch (e) {
      log.error("[MetaMarketing] Create ad failed", { error: e });
      return { success: false, error: (e as Error).message };
    }
  }

  /**
   * Get Ad Insights (Performance measurement)
   */
  static async getInsights(id: string, accessToken: string, fields: string[] = ["reach", "impressions", "clicks", "spend"]) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${id}/insights?` + 
        new URLSearchParams({
          fields: fields.join(","),
          access_token: accessToken
        })
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Failed to fetch insights");

      return { success: true, data: data.data };
    } catch (e) {
      log.error("[MetaMarketing] Get insights failed", { error: e });
      return { success: false, error: (e as Error).message };
    }
  }

  /**
   * Fetch leads from a Lead Gen Form
   */
  static async getLeads(formId: string, accessToken: string): Promise<{ success: boolean; leads?: MetaLead[]; error?: string }> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${formId}/leads?` + 
        new URLSearchParams({ access_token: accessToken })
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Failed to fetch leads");

      return { success: true, leads: data.data };
    } catch (e) {
      log.error("[MetaMarketing] Get leads failed", { error: e });
      return { success: false, error: (e as Error).message };
    }
  }

  /**
   * Fetch campaigns for an Ad Account
   */
  static async getCampaigns(adAccountId: string, accessToken: string) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/act_${adAccountId}/campaigns?` +
        new URLSearchParams({
          fields: "id,name,objective,status,start_time,stop_time",
          access_token: accessToken
        })
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Failed to fetch campaigns");

      return { success: true, data: data.data };
    } catch (e) {
      log.error("[MetaMarketing] Get campaigns failed", { error: e });
      return { success: false, error: (e as Error).message };
    }
  }

  /**
   * Toggle Campaign Status (ACTIVE/PAUSED)
   */
  static async updateCampaignStatus(campaignId: string, accessToken: string, status: "ACTIVE" | "PAUSED") {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${campaignId}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Failed to update status");

      return { success: true };
    } catch (e) {
      log.error("[MetaMarketing] Update status failed", { error: e });
      return { success: false, error: (e as Error).message };
    }
  }
}
