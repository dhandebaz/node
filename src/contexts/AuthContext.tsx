"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { SessionExpiredOverlay } from "@/components/auth/SessionExpiredOverlay";
import { TenantErrorOverlay } from "@/components/auth/TenantErrorOverlay";
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js";

type UserRole = "customer" | "business" | "admin" | "superadmin";
type SessionStatus = "loading" | "authenticated" | "unauthenticated" | "expired" | "tenant_error";

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  tenantId: string | null;
  sessionStatus: SessionStatus;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("loading");
  const sessionStatusRef = useRef<SessionStatus>(sessionStatus);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = getSupabaseBrowser();
  const tenantResolveTimeoutMs = 4500;
  const sessionResolveTimeoutMs = 4500;

  useEffect(() => {
    sessionStatusRef.current = sessionStatus;
  }, [sessionStatus]);

  const setTenantCookie = (id: string) => {
    const isHttps = typeof window !== "undefined" && window.location?.protocol === "https:";
    const secure = isHttps ? "; secure" : "";
    document.cookie = `nodebase-tenant-id=${id}; path=/${secure}; samesite=strict; max-age=31536000`;
  };

  const clearTenantCookie = () => {
    const isHttps = typeof window !== "undefined" && window.location?.protocol === "https:";
    const secure = isHttps ? "; secure" : "";
    document.cookie = `nodebase-tenant-id=; path=/${secure}; samesite=strict; max-age=0`;
  };

  const resolveTenant = useCallback(async (userId: string) => {
    try {
      // Fetch user's tenants
      const queryPromise = supabase
        .from('tenant_users')
        .select('tenant_id')
        .eq('user_id', userId)
        .limit(1);
      const res = await Promise.race([
        queryPromise,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), tenantResolveTimeoutMs)),
      ]);

      if (res === null) {
        console.warn("Tenant resolution timed out");
        return null;
      }

      const { data, error } = res;

      if (error) {
        console.error("Tenant resolution error:", error);
        return null;
      }

      if (data && data.length > 0) {
        return data[0].tenant_id;
      }
      return null;
    } catch (e) {
      console.error("Tenant fetch exception:", e);
      return null;
    }
  }, [supabase, tenantResolveTimeoutMs]);

  const getSessionSafely = useCallback(async () => {
    const res = await Promise.race([
      supabase.auth.getSession(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), sessionResolveTimeoutMs)),
    ]);

    if (res === null) {
      return { session: null, error: new Error("Session resolution timed out"), timedOut: true };
    }

    return { session: res.data.session, error: res.error, timedOut: false };
  }, [supabase, sessionResolveTimeoutMs]);

  const applySession = useCallback(async (session: Session | null) => {
    if (!session) {
      setSessionStatus("unauthenticated");
      return;
    }

    const user = session.user;
    setUser(user);
    const userRole = (user.user_metadata?.role as UserRole) || "customer";
    setRole(userRole);

    const tId = await resolveTenant(user.id);
    if (tId) {
      setTenantId(tId);
      setTenantCookie(tId);
      setSessionStatus("authenticated");
      return;
    }

    if (userRole === 'admin' || userRole === 'superadmin') {
      setTenantId(null);
      setSessionStatus("authenticated");
      return;
    }

    setSessionStatus("tenant_error");
  }, [resolveTenant]);

  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error || !data.session) {
        setSessionStatus("expired");
      } else {
        await applySession(data.session);
      }
    } catch {
      setSessionStatus("expired");
    }
  }, [applySession, supabase]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setTenantId(null);
    clearTenantCookie();
    setSessionStatus("unauthenticated");
    router.push("/login");
  }, [supabase, router]);

  // Initial Check & Listener
  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      // Safety timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        if (!mounted) return;
        if (sessionStatusRef.current !== "loading") return;

        (async () => {
          try {
            const { session } = await getSessionSafely();
            if (!mounted) return;
            await applySession(session);
            if (!mounted) return;

            if (session) return;

            const currentPath = window.location?.pathname || pathname || "";
            if (currentPath.startsWith("/dashboard") || currentPath.startsWith("/admin")) {
              try {
                const ts = Date.now();
                window.location.replace(`/login?ts=${ts}`);
              } catch {}
            }
          } catch {
            if (!mounted) return;
            setSessionStatus("unauthenticated");
          }
        })();
      }, 6000);

      try {
        const { session, error, timedOut } = await getSessionSafely();
        
        if (!mounted) return;

        if (timedOut) {
          setSessionStatus("unauthenticated");
          return;
        }

        if (error) {
            console.error("Session error:", error);
            setSessionStatus("unauthenticated");
            return;
        }

        await applySession(session);
      } catch (err) {
        console.error("Auth init error:", err);
        if (mounted) setSessionStatus("unauthenticated");
      } finally {
        clearTimeout(timeoutId);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return;

        if (event === 'SIGNED_OUT') {
            setUser(null);
            setRole(null);
            setTenantId(null);
            clearTenantCookie();
            setSessionStatus("unauthenticated");
        } else if (session) {
            const user = session.user;
            setUser(user);
            const userRole = (user.user_metadata?.role as UserRole) || "customer";
            setRole(userRole);
            
            // Re-resolve tenant on change to be safe
            const tId = await resolveTenant(user.id);
            
            if (!mounted) return;

            if (tId) {
                setTenantId(tId);
                setTenantCookie(tId);
                setSessionStatus("authenticated");
            } else {
                 if (userRole === 'admin' || userRole === 'superadmin') {
                     setSessionStatus("authenticated");
                 } else {
                     setSessionStatus("tenant_error");
                 }
            }
        }
      }
    );

    // Listen for custom 401 events from API client
    const handleExpired = () => {
        if (mounted) setSessionStatus("expired");
    };
    window.addEventListener("auth:session-expired", handleExpired);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener("auth:session-expired", handleExpired);
    };
  }, [applySession, getSessionSafely, pathname, supabase, resolveTenant]);

  // Prevent flash of protected content
  if (sessionStatus === "loading") {
    if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin")) {
        return (
          <div className="min-h-screen bg-black text-white flex items-center justify-center">
             <div className="animate-pulse flex flex-col items-center">
                <div className="h-8 w-8 bg-white/20 rounded-full mb-4"></div>
                <div className="text-sm text-white/50">Securing environment...</div>
             </div>
          </div>
        );
    }
  }

  if (sessionStatus === "expired") {
    return <SessionExpiredOverlay />;
  }

  if (sessionStatus === "tenant_error") {
      return <TenantErrorOverlay />;
  }

  return (
    <AuthContext.Provider value={{ user, role, tenantId, sessionStatus, refreshSession, logout }}>
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
