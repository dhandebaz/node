import { describe, it, expect, vi, beforeEach } from "vitest";
import { proxy } from "./proxy";
import { NextRequest } from "next/server";

const mockGetUser = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

vi.mock("next/server", () => {
  return {
    NextRequest: class MockNextRequest {
      nextUrl: any;
      headers = new Map();
      cookies = {
        getAll: () => [],
        set: vi.fn(),
      };
      url: string;
      constructor(url: string, init: any = {}) {
        this.url = url;
        this.nextUrl = new URL(url);
      }
    },
    NextResponse: {
      next: vi.fn(() => ({
        cookies: { set: vi.fn() },
      })),
      redirect: vi.fn((url: URL) => ({
        status: 302,
        url: url.toString()
      })),
    },
  };
});

describe("proxy middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect unauthenticated users to login for dashboard routes", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const { NextRequest } = await import("next/server");
    const req = new NextRequest("http://localhost:3000/dashboard");
    
    const res = await proxy(req as unknown as NextRequest);
    expect((res as any).url).toContain("/login");
  });

  it("should block non-admins from admin routes", async () => {
    mockGetUser.mockResolvedValue({ 
      data: { user: { id: "1", user_metadata: { role: "owner" } } }, 
      error: null 
    });
    const { NextRequest } = await import("next/server");
    const req = new NextRequest("http://localhost:3000/admin/dashboard");
    
    const res = await proxy(req as unknown as NextRequest);
    expect((res as any).url).toContain("/dashboard");
  });

  it("should allow admins to access admin routes", async () => {
    mockGetUser.mockResolvedValue({ 
      data: { user: { id: "1", user_metadata: { role: "admin" } } }, 
      error: null 
    });
    const { NextRequest, NextResponse } = await import("next/server");
    const req = new NextRequest("http://localhost:3000/admin/dashboard");
    
    await proxy(req as unknown as NextRequest);
    expect(NextResponse.next).toHaveBeenCalled();
  });
});
