"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { SessionExpiredOverlay } from "@/components/auth/SessionExpiredOverlay";
import { TenantErrorOverlay } from "@/components/auth/TenantErrorOverlay";
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js";

type UserRole = "customer" | "admin";
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
  const router = useRouter();
  const pathname = usePathname();
  const supabase = getSupabaseBrowser();

  const setTenantCookie = (id: string) => {
    document.cookie = `nodebase-tenant-id=${id}; path=/; secure; samesite=strict; max-age=31536000`;
  };

  const clearTenantCookie = () => {
    document.cookie = `nodebase-tenant-id=; path=/; secure; samesite=strict; max-age=0`;
  };

  const resolveTenant = async (userId: string) => {
    try {
      // Fetch user's tenants
      const { data, error } = await supabase
        .from('tenant_users')
        .select('tenant_id')
        .eq('user_id', userId)
        .limit(1); // For now, strict 1-to-1 or take first.

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
  };

  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error || !data.session) {
        setSessionStatus("expired");
      } else {
        const user = data.user;
        setUser(user);
        const userRole = (user.user_metadata?.role as UserRole) || "customer";
        setRole(userRole);
        
        // Resolve Tenant
        const tId = await resolveTenant(user.id);
        if (tId) {
            setTenantId(tId);
            setTenantCookie(tId);
            setSessionStatus("authenticated");
        } else {
            // Admin users might not need a tenant in some models, but requirement says "Strict Multi-tenancy".
            // If admin needs to view tenants, they might have a different flow. 
            // For now, assuming even admins belong to an 'Admin Tenant' or we strictly fail if no tenant.
            // BUT, if I am admin, maybe I don't enforce tenant_users check the same way? 
            // Requirement: "Admins can access data explicitly and safely". 
            // "View as tenant" mode is explicit.
            // So admins might not have a tenant_id in tenant_users for *every* tenant.
            // But they should probably have a 'home' tenant.
            if (userRole === 'admin') {
                // Admins might bypass tenant check for their own dashboard, 
                // OR we assign them a system tenant. 
                // Let's assume strict fail for now to be safe, unless explicit admin override.
                // Actually, let's allow admin without tenant_id to access /admin, 
                // but blocking /dashboard.
                setTenantId(null); 
                setSessionStatus("authenticated"); 
            } else {
                setSessionStatus("tenant_error");
            }
        }
      }
    } catch {
      setSessionStatus("expired");
    }
  }, [supabase]);

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
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error("Session error:", error);
            setSessionStatus("unauthenticated");
            return;
        }

        if (session) {
          const user = session.user;
          setUser(user);
          const userRole = (user.user_metadata?.role as UserRole) || "customer";
          setRole(userRole);

          const tId = await resolveTenant(user.id);
          if (tId) {
            setTenantId(tId);
            setTenantCookie(tId);
            setSessionStatus("authenticated");
          } else {
             if (userRole === 'admin') {
                 setSessionStatus("authenticated");
             } else {
                 setSessionStatus("tenant_error");
             }
          }
        } else {
          setSessionStatus("unauthenticated");
        }
      } catch (err) {
        console.error("Auth init error:", err);
        setSessionStatus("unauthenticated");
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
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
            if (tId) {
                setTenantId(tId);
                setTenantCookie(tId);
                setSessionStatus("authenticated");
            } else {
                 if (userRole === 'admin') {
                     setSessionStatus("authenticated");
                 } else {
                     setSessionStatus("tenant_error");
                 }
            }
        }
      }
    );

    // Listen for custom 401 events from API client
    const handleExpired = () => setSessionStatus("expired");
    window.addEventListener("auth:session-expired", handleExpired);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("auth:session-expired", handleExpired);
    };
  }, [supabase]);

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
