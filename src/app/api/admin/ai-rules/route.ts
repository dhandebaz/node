import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await getSupabaseServer();
    const { error: authError } = await supabase.auth.getUser();

    if (authError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rules = [
      {
        ruleId: "rule-max-messages",
        scope: "global",
        action: "Max messages per conversation per day",
        limit: "15"
      },
      {
        ruleId: "rule-max-payments",
        scope: "global",
        action: "Max payment link sends per day",
        limit: "4"
      },
      {
        ruleId: "rule-max-calendar-blocks",
        scope: "role",
        action: "Host AI calendar blocks per day",
        limit: "8"
      },
      {
        ruleId: "rule-restricted-keywords",
        scope: "global",
        action: "Restricted keywords",
        limit: "discount, refund, chargeback"
      },
      {
        ruleId: "rule-forced-escalation",
        scope: "global",
        action: "Forced escalation triggers",
        limit: "payment_failed, id_rejected, high_risk"
      }
    ];

    const impact = {
      affectedManagers: [
        {
          slug: "host-ai",
          name: "Host AI",
          impactedRules: ["Max messages per conversation per day", "Host AI calendar blocks per day"]
        },
        {
          slug: "nurse-ai",
          name: "Nurse AI",
          impactedRules: ["Max messages per conversation per day"]
        },
        {
          slug: "dukan-ai",
          name: "Dukan AI",
          impactedRules: ["Max payment link sends per day"]
        }
      ],
      blockedActions: [
        {
          action: "Send payment link",
          reason: "Daily payment link cap reached"
        },
        {
          action: "Block calendar dates",
          reason: "Daily calendar block limit reached"
        }
      ],
      preventedLogs: [
        {
          id: "log-101",
          manager: "Host AI",
          action: "Block calendar dates",
          reason: "Limit reached",
          timestamp: new Date(Date.now() - 1000 * 60 * 80).toISOString()
        },
        {
          id: "log-102",
          manager: "Dukan AI",
          action: "Send payment link",
          reason: "Daily cap reached",
          timestamp: new Date(Date.now() - 1000 * 60 * 160).toISOString()
        }
      ]
    };

    return NextResponse.json({ rules, impact });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to load AI rules" }, { status: 500 });
  }
}
