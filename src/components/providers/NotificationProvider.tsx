"use client";

import { useEffect, useCallback, useRef, ReactNode, createContext, useContext, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

interface Notification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
  timestamp: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (n: Omit<Notification, "id" | "timestamp">) => void;
  dismissNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  addNotification: () => {},
  dismissNotification: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

// Toast auto-dismiss duration
const AUTO_DISMISS_MS = 5000;

/**
 * Real-time notification provider using Supabase Realtime.
 * Subscribes to `audit_events` and `failures` tables for the current tenant.
 */
export function NotificationProvider({
  children,
  tenantId,
}: {
  children: ReactNode;
  tenantId?: string;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const channelRef = useRef<ReturnType<ReturnType<typeof getSupabaseBrowser>['channel']> | null>(null);

  const addNotification = useCallback(
    (n: Omit<Notification, "id" | "timestamp">) => {
      const notification: Notification = {
        ...n,
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: Date.now(),
      };
      setNotifications((prev) => [notification, ...prev].slice(0, 10));

      // Auto-dismiss
      setTimeout(() => {
        setNotifications((prev) => prev.filter((p) => p.id !== notification.id));
      }, AUTO_DISMISS_MS);
    },
    []
  );

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  useEffect(() => {
    if (!tenantId) return;

    const supabase = getSupabaseBrowser();

    // Subscribe to failures (payment failures, integration errors, etc.)
    const channel = supabase
      .channel(`tenant-notifications-${tenantId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "failures",
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload: Record<string, unknown>) => {
          const failure = payload.new as { severity?: string; message?: string; source?: string };
          addNotification({
            type: failure.severity === "critical" ? "error" : "warning",
            title: `Issue: ${failure.source || "System"}`,
            message: failure.message || "A failure has been detected.",
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "audit_events",
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload: Record<string, unknown>) => {
          const event = payload.new as { event_type?: string; metadata?: Record<string, unknown> };
          // Only show important events as notifications
          const notifiableEvents = [
            "payment.captured",
            "subscription.charged",
            "payment.failed",
            "engagement.started",
          ];
          if (event.event_type && notifiableEvents.includes(event.event_type)) {
            addNotification({
              type: event.event_type.includes("failed") ? "error" : "success",
              title: formatEventTitle(event.event_type),
              message: formatEventMessage(event.event_type, event.metadata),
            });
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [tenantId, addNotification]);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, dismissNotification }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {notifications.map((n) => (
          <Toast key={n.id} notification={n} onDismiss={() => dismissNotification(n.id)} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

function Toast({ notification, onDismiss }: { notification: Notification; onDismiss: () => void }) {
  const colors = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  return (
    <div
      className={`rounded-lg border p-4 shadow-lg backdrop-blur-sm animate-in slide-in-from-right duration-300 ${colors[notification.type]}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg">{icons[notification.type]}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{notification.title}</p>
          {notification.message && (
            <p className="text-xs opacity-80 mt-0.5 truncate">{notification.message}</p>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="text-current opacity-50 hover:opacity-100 transition-opacity"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// Helpers
function formatEventTitle(eventType: string): string {
  const map: Record<string, string> = {
    "payment.captured": "Payment Received",
    "subscription.charged": "Subscription Renewed",
    "payment.failed": "Payment Failed",
    "engagement.started": "Engagement Started",
  };
  return map[eventType] || eventType;
}

function formatEventMessage(eventType: string, metadata?: Record<string, unknown>): string {
  if (eventType === "payment.captured" && metadata?.amount) {
    return `₹${metadata.amount} has been credited to your wallet.`;
  }
  if (eventType === "payment.failed" && metadata?.reason) {
    return String(metadata.reason);
  }
  if (eventType === "engagement.started") {
    return "A new service engagement has been initiated.";
  }
  return "";
}
