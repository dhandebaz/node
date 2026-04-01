import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";

const PREDEFINED_JOBS = [
  {
    id: "sync-calendars",
    name: "Sync Calendars",
    description: "Sync Airbnb/Booking.com calendars",
    schedule: "Every 15 minutes",
    category: "integrations",
  },
  {
    id: "cleanup-sessions",
    name: "Cleanup Sessions",
    description: "Clean expired sessions and cache",
    schedule: "Daily at 2 AM",
    category: "maintenance",
  },
  {
    id: "process-queue",
    name: "Process Queue",
    description: "Process pending message queue",
    schedule: "Every 5 minutes",
    category: "messaging",
  },
  {
    id: "daily-stats",
    name: "Daily Statistics",
    description: "Calculate daily usage statistics",
    schedule: "Daily at midnight",
    category: "analytics",
  },
  {
    id: "kyc-webhook",
    name: "KYC Webhooks",
    description: "Process KYC webhook callbacks",
    schedule: "Every 10 minutes",
    category: "kyc",
  },
  {
    id: "sync-whatsapp",
    name: "WhatsApp Sync",
    description: "Sync WhatsApp business messages",
    schedule: "Every 5 minutes",
    category: "messaging",
  },
  {
    id: "sync-meta",
    name: "Meta Sync",
    description: "Sync Instagram/Messenger messages",
    schedule: "Every 5 minutes",
    category: "messaging",
  },
  {
    id: "retry-failures",
    name: "Retry Failures",
    description: "Retry failed operations",
    schedule: "Every 30 minutes",
    category: "maintenance",
  },
];

const jobStatuses: Record<string, { status: string; lastRun: string | null; nextRun: string | null }> = {};

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const jobs = PREDEFINED_JOBS.map((job) => {
      const status = jobStatuses[job.id] || { status: "idle", lastRun: null, nextRun: null };
      
      let nextRun: string | null = null;
      if (job.schedule.includes("Every")) {
        const minutes = parseInt(job.schedule.match(/\d+/)?.[0] || "15");
        const nextDate = new Date();
        nextDate.setMinutes(nextDate.getMinutes() + minutes);
        nextRun = nextDate.toISOString();
      } else if (job.schedule.includes("Daily")) {
        const nextDate = new Date();
        const [time] = job.schedule.match(/\d+\s*(AM|PM)/i)?.[0]?.split(" ") || ["2 AM"];
        const [hour, period] = time.split(" ");
        let hourNum = parseInt(hour);
        if (period?.toUpperCase() === "PM" && hourNum !== 12) hourNum += 12;
        if (period?.toUpperCase() === "AM" && hourNum === 12) hourNum = 0;
        nextDate.setHours(hourNum, 0, 0, 0);
        if (nextDate <= new Date()) {
          nextDate.setDate(nextDate.getDate() + 1);
        }
        nextRun = nextDate.toISOString();
      }

      return {
        ...job,
        status: status.status,
        last_run: status.lastRun,
        next_run: nextRun,
      };
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { job_id } = body;

    if (!job_id) {
      return NextResponse.json(
        { error: "job_id is required" },
        { status: 400 }
      );
    }

    const job = PREDEFINED_JOBS.find((j) => j.id === job_id);
    if (!job) {
      return NextResponse.json(
        { error: `Job '${job_id}' not found` },
        { status: 404 }
      );
    }

    jobStatuses[job_id] = {
      status: "running",
      lastRun: new Date().toISOString(),
      nextRun: null,
    };

    return NextResponse.json({
      success: true,
      job_id,
      message: `Job '${job.name}' triggered`,
      run_id: `run_${Date.now()}`,
    });
  } catch (error) {
    console.error("Error triggering job:", error);
    return NextResponse.json(
      { error: "Failed to trigger job" },
      { status: 500 }
    );
  }
}
