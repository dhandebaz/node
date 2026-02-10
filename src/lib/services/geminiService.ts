
import { GoogleGenerativeAI } from "@google/generative-ai";
import { settingsService } from "./settingsService";

export interface VerificationResult {
  isValid: boolean;
  documentType: "PAN" | "AADHAAR" | "UNKNOWN";
  details?: {
    name?: string;
    idNumber?: string;
    dob?: string;
    address?: string;
  };
  confidence: number;
  reason?: string;
}

export const geminiService = {
  async verifyDocument(fileBase64: string, mimeType: string): Promise<VerificationResult> {
    try {
      const settings = await settingsService.getSettings();
      const apiKey = settings.api.geminiApiKey;

      if (!apiKey) {
        throw new Error("Gemini API key is not configured");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        Analyze this image to verify if it is a valid Indian identity document (PAN Card or Aadhaar Card).
        
        Return a JSON object with the following structure:
        {
          "isValid": boolean,
          "documentType": "PAN" | "AADHAAR" | "UNKNOWN",
          "details": {
            "name": "Extracted Name",
            "idNumber": "Extracted ID Number",
            "dob": "Date of Birth if available",
            "address": "Address if available (for Aadhaar)"
          },
          "confidence": number (0-1),
          "reason": "Explanation of verification result"
        }
        
        Strictly output only the JSON object. Do not include markdown formatting.
      `;

      const imagePart = {
        inlineData: {
          data: fileBase64,
          mimeType: mimeType,
        },
      };

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();
      
      // Clean up markdown code blocks if present
      const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
      
      return JSON.parse(jsonStr) as VerificationResult;
    } catch (error: any) {
      console.error("Gemini Verification Error:", error);
      
      const isConfigError = error.message?.includes("API key");
      const reason = isConfigError 
        ? "System Configuration Error: Gemini API Key missing or invalid." 
        : "Verification process failed due to technical error.";

      return {
        isValid: false,
        documentType: "UNKNOWN",
        confidence: 0,
        reason,
      };
    }
  },

  async generateReply(context: {
    message: string;
    listingName: string;
    city: string;
    calendar: { startDate: string; endDate: string; status: string }[];
    guestName: string;
    previousMessages?: { role: string; content: string }[];
    role?: string;
    instructions?: string;
  }): Promise<{ content: string; usage: { totalTokens: number } }> {
    try {
      const settings = await settingsService.getSettings();
      const apiKey = settings.api.geminiApiKey;
      if (!apiKey) throw new Error("Gemini API key is not configured");

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const role = context.role || "AI assistant";
      const customInstructions = context.instructions || "Your goal is to be helpful, professional, and concise.";

      const prompt = `
        You are Kaisa, an ${role} for "${context.listingName}" in ${context.city}.
        ${customInstructions}
        
        Context:
        - Guest Name: ${context.guestName}
        - Current Message: "${context.message}"
        - Calendar Availability: ${JSON.stringify(context.calendar)}
        
        Instructions:
        1. Answer availability questions based ONLY on the calendar provided.
        2. If dates are blocked, suggest alternative dates if possible (from the calendar).
        3. Do not confirm bookings without payment.
        4. Keep replies under 3 sentences unless complex.
        
        Reply text only.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const usage = result.response.usageMetadata || { totalTokenCount: 0 }; // Fallback
      
      return {
        content: response.text(),
        usage: {
          totalTokens: usage.totalTokenCount || 0
        }
      };
    } catch (error) {
      console.error("Gemini Reply Error:", error);
      return {
        content: "I apologize, but I'm having trouble checking my calendar right now. Please try again in a moment.",
        usage: { totalTokens: 0 }
      };
    }
  }
};
