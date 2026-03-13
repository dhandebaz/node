import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const tenantId = formData.get("tenantId") as string;

    if (!file || !tenantId) {
      return NextResponse.json({ error: "File and Tenant ID required" }, { status: 400 });
    }

    // Mock Upload Logic
    // In real implementation: 
    // const buffer = await file.arrayBuffer();
    // await s3.putObject(...)
    const filePath = `/kyc/${tenantId}/${file.name}`;

    // Mock Vision API Call
    // const extracted = await visionService.extract(buffer);
    const mockExtractedData = {
      name: user.user_metadata?.full_name || "John Doe",
      dob: "1990-01-01",
      document_number: "ABC1234567",
      face_image_url: "https://via.placeholder.com/150" // Mock URL
    };

    return NextResponse.json({ 
      success: true, 
      filePath, 
      extractedData: mockExtractedData 
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
