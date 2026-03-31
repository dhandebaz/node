import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export function withValidation<T extends z.ZodType>(
  schema: T,
  handler: (
    req: NextRequest,
    data: z.infer<T>
  ) => Promise<NextResponse> | NextResponse
) {
  return async (req: NextRequest) => {
    try {
      const contentType = req.headers.get("content-type");
      
      let data: unknown;
      
      if (contentType?.includes("application/json")) {
        data = await req.json();
      } else if (contentType?.includes("multipart/form-data")) {
        const formData = await req.formData();
        data = Object.fromEntries(formData.entries());
      } else {
        const url = new URL(req.url);
        data = Object.fromEntries(url.searchParams);
      }

      const result = schema.safeParse(data);
      
      if (!result.success) {
        const firstError = result.error.issues[0];
        return NextResponse.json(
          { 
            error: "Validation Error",
            field: firstError?.path.join("."),
            message: firstError?.message 
          },
          { status: 400 }
        );
      }

      return handler(req, result.data);
    } catch (error) {
      console.error("Validation middleware error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

export function validateBody<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const firstError = result.error.issues[0];
    return {
      success: false,
      error: `${firstError?.path.join(".")} - ${firstError?.message}`,
    };
  }
  
  return { success: true, data: result.data };
}
