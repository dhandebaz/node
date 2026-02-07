import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

const modeOptions = [
  {
    id: "assistive",
    name: "Assistive",
    description: "AI drafts replies. You approve before anything is sent."
  },
  {
    id: "semi_autonomous",
    name: "Semi-Autonomous",
    description: "AI replies to common queries and escalates edge cases."
  },
  {
    id: "autonomous",
    name: "Autonomous",
    description: "AI replies and acts within defined limits. You are notified.",
    warning: "Use only when you trust the rules. All actions are logged."
  }
];

const actionOptionsByRole: Record<string, any[]> = {
  "host-ai": [
    {
      id: "reply_to_guests",
      label: "Reply to guests",
      description: "Respond to routine guest questions.",
      example: "If a guest asks about check-in, Host AI replies with the policy."
    },
    {
      id: "send_pricing",
      label: "Send pricing",
      description: "Share nightly or package prices when asked.",
      example: "If a guest asks about rates, Host AI sends the current price."
    },
    {
      id: "send_payment_links",
      label: "Send payment links",
      description: "Issue payment links for confirmed bookings.",
      example: "If a guest confirms dates, Host AI shares the payment link.",
      dangerous: true
    },
    {
      id: "block_calendar_dates",
      label: "Block calendar dates",
      description: "Reserve dates after a booking is confirmed.",
      example: "After payment, Host AI blocks the dates on the calendar.",
      dangerous: true
    },
    {
      id: "request_id_documents",
      label: "Request ID documents",
      description: "Ask for ID documents when required.",
      example: "If ID is missing, Host AI requests verification documents."
    }
  ],
  "nurse-ai": [
    {
      id: "reply_to_patients",
      label: "Reply to patients",
      description: "Answer standard patient questions.",
      example: "If a patient asks for timing, Nurse AI confirms the slot."
    },
    {
      id: "schedule_appointments",
      label: "Schedule appointments",
      description: "Offer and confirm appointment slots.",
      example: "If a slot is free, Nurse AI schedules the appointment.",
      dangerous: true
    },
    {
      id: "send_reminders",
      label: "Send reminders",
      description: "Notify patients about upcoming visits.",
      example: "Nurse AI sends a reminder 24 hours before the visit."
    },
    {
      id: "escalate_to_staff",
      label: "Escalate to staff",
      description: "Forward urgent cases to staff.",
      example: "If symptoms are critical, Nurse AI escalates to staff."
    }
  ],
  "dukan-ai": [
    {
      id: "reply_to_customers",
      label: "Reply to customers",
      description: "Respond to common order questions.",
      example: "If a customer asks about delivery, Dukan AI replies with ETA."
    },
    {
      id: "send_payment_links",
      label: "Send payment links",
      description: "Share payment links for pending orders.",
      example: "If payment is due, Dukan AI sends the payment link.",
      dangerous: true
    },
    {
      id: "send_tracking",
      label: "Send tracking updates",
      description: "Share order tracking status.",
      example: "If order ships, Dukan AI sends tracking info."
    },
    {
      id: "request_feedback",
      label: "Request feedback",
      description: "Ask for feedback after delivery.",
      example: "After delivery, Dukan AI asks for a review."
    }
  ]
};

const escalationOptionsByRole: Record<string, any[]> = {
  "host-ai": [
    {
      id: "payment_overdue",
      label: "Payment not completed after 6 hours",
      description: "Escalate if the payment link is ignored."
    },
    {
      id: "discount_request",
      label: "Guest asks for a discount",
      description: "Escalate all discount negotiations."
    },
    {
      id: "id_failed",
      label: "ID verification failed",
      description: "Escalate if ID documents are rejected."
    }
  ],
  "nurse-ai": [
    {
      id: "appointment_conflict",
      label: "Appointment conflict detected",
      description: "Escalate if slots overlap or are unavailable."
    },
    {
      id: "symptom_alert",
      label: "Critical symptom reported",
      description: "Escalate to staff immediately."
    },
    {
      id: "followup_missed",
      label: "Follow-up not confirmed",
      description: "Escalate if patient does not respond."
    }
  ],
  "dukan-ai": [
    {
      id: "payment_overdue",
      label: "Payment not completed after 4 hours",
      description: "Escalate if payment is pending."
    },
    {
      id: "refund_request",
      label: "Refund request",
      description: "Escalate refund or cancellation requests."
    }
  ]
};

export async function GET() {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: account } = await supabase
      .from("kaisa_accounts")
      .select("ai_manager_slug")
      .eq("user_id", user.id)
      .single();

    const aiManagerType = account?.ai_manager_slug || "host-ai";
    const actionOptions = actionOptionsByRole[aiManagerType] || actionOptionsByRole["host-ai"];
    const escalationOptions = escalationOptionsByRole[aiManagerType] || escalationOptionsByRole["host-ai"];

    const settings = {
      userId: user.id,
      aiManagerType,
      mode: "assistive",
      allowedActions: actionOptions.slice(0, 3).map((action) => action.id),
      escalationRules: escalationOptions.slice(0, 2).map((rule) => rule.id),
      quietHours: {
        timezone: "Asia/Kolkata",
        businessHours: { start: "09:00", end: "20:00" },
        quietHours: { start: "21:00", end: "08:00" },
        days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      },
      lockedActions: ["block_calendar_dates"]
    };

    return NextResponse.json({
      settings,
      modeOptions,
      actionOptions,
      escalationOptions
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to load AI settings" }, { status: 500 });
  }
}
