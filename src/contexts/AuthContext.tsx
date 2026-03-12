"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { SessionExpiredOverlay } from "@/components/auth/SessionExpiredOverlay";
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js";

type UserRole = "customer" | "business" | "admin" | "superadmin";
type SessionStatus = "loading" | "authenticated" | "unauthenticated" | "expired";

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  sessionStatus: SessionStatus;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("loading");
  const router = useRouter();
  const supabase = getSupabaseBrowser();

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    // Clear the tenant cookie via server route
    try {
      await fetch("/api/auth/tenant-cookie/clear", { method: "POST" });
    } catch {}
    
    setSessionStatus("unauthenticated");
    router.push("/login");
  }, [supabase, router]);

  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error || !data.session) {
        setSessionStatus("expired");
      } else {
        const user = data.session.user;
        setUser(user);
        setRole((user.user_metadata?.role as UserRole) || "customer");
        setSessionStatus("authenticated");
      }
    } catch {
      setSessionStatus("expired");
    }
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
            console.error("Session error:", error);
            setSessionStatus("unauthenticated");
            return;
        }

        if (session?.user) {
            setUser(session.user);
            setRole((session.user.user_metadata?.role as UserRole) || "customer");
            setSessionStatus("authenticated");
        } else {
            setSessionStatus("unauthenticated");
        }
      } catch (err) {
        console.error("Auth init error:", err);
        if (mounted) setSessionStatus("unauthenticated");
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return;

        if (event === 'SIGNED_OUT') {
            setUser(null);
            setRole(null);
            setSessionStatus("unauthenticated");
        } else if (session?.user) {
            setUser(session.user);
            setRole((session.user.user_metadata?.role as UserRole) || "customer");
            setSessionStatus("authenticated");
        } else if (!session) {
            setSessionStatus("unauthenticated");
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Loading UI:
  // We can show a global loader here if we want to block the entire app until we know auth state.
  // However, for better UX, we usually let the page load and let Middleware handle protection.
  // But to avoid "flash of unauthenticated content" in client components that use `useAuth`,
  // we can block children rendering until loading is done.
  // Given the middleware protects routes, we can be lenient here.
  
  if (sessionStatus === "expired") {
    return <SessionExpiredOverlay />;
  }

  return (
    <AuthContext.Provider value={{ user, role, sessionStatus, refreshSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
