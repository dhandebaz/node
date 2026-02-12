
"use server";

import { geminiService } from "@/lib/services/geminiService";
import { userService } from "@/lib/services/userService";
import { KYCDocument } from "@/types/user";
import { getSession } from "@/lib/auth/session";

export async function verifyAndUploadDocumentAction(
  _userId: string | null, // Kept for signature compatibility but ignored, or better removed if client updated
  formData: FormData,
  documentType: "PAN" | "AADHAAR"
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      throw new Error("Unauthorized");
    }
    const userId = session.userId;

    const file = formData.get("file") as File;
    if (!file) {
      throw new Error("No file uploaded");
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const mimeType = file.type;

    // Verify with Gemini
    const verificationResult = await geminiService.verifyDocument(base64, mimeType);

    // If verified (even with low confidence, we store the result), create document record
    const kycDoc: KYCDocument = {
      type: documentType,
      fileUrl: `mock_url/${file.name}`, // In a real app, upload to S3/Blob storage first
      verified: verificationResult.isValid && verificationResult.confidence > 0.7,
      verifiedAt: new Date().toISOString(),
      verificationDetails: {
        name: verificationResult.details?.name,
        idNumber: verificationResult.details?.idNumber,
        dob: verificationResult.details?.dob,
        address: verificationResult.details?.address,
        confidence: verificationResult.confidence,
        reason: verificationResult.reason
      }
    };

    // Update user profile with this document
    await userService.addKYCDocument(userId, kycDoc);

    return {
      success: true,
      data: kycDoc,
      verification: verificationResult
    };

  } catch (error) {
    console.error("KYC Verification Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}
