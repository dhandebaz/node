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
  async verifyDocument(
    fileBase64: string,
    mimeType: string,
  ): Promise<VerificationResult> {
    try {
      const settings = await settingsService.getSettings();
      // Allow an override via environment for deployments where the key is provided
      // via an env var (e.g., CI, Vercel, Docker). Prefer settings -> env.
      const apiKey = settings.api.geminiApiKey || process.env.GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error(
          "Gemini API key is not configured. Set it in System Settings (Admin > API) or provide GEMINI_API_KEY as an environment variable.",
        );
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

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const settings = await settingsService.getSettings();
      // Fallback to environment variable if not set in settings
      const apiKey = settings.api.geminiApiKey || process.env.GEMINI_API_KEY;
      if (!apiKey)
        throw new Error(
          "Gemini API key is not configured. Provide GEMINI_API_KEY or set it in the app settings.",
        );

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "embedding-004" });
      const result = await model.embedContent(text);
      return Array.from(result.embedding.values);
    } catch (error: any) {
      console.error("Gemini Embedding Error:", error);
      throw error;
    }
  },

  async analyzeSentiment(text: string): Promise<{
    sentiment: "positive" | "neutral" | "negative" | "angry";
    score: number;
  }> {
    try {
      const settings = await settingsService.getSettings();
      // Allow deployments to use an env var as a fallback
      const apiKey = settings.api.geminiApiKey || process.env.GEMINI_API_KEY;
      if (!apiKey)
        throw new Error(
          "Gemini API key is not configured. Provide GEMINI_API_KEY or set it in the app settings.",
        );

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        Analyze the sentiment of the following text from a guest to a business owner.
        Classify it as one of: positive, neutral, negative, angry.
        Also provide a confidence score between 0 and 1.

        Text: "${text}"

        Return ONLY a JSON object: { "sentiment": "...", "score": 0.0 }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const json = JSON.parse(
        response
          .text()
          .replace(/```json|```/g, "")
          .trim(),
      );

      return {
        sentiment: json.sentiment,
        score: json.score,
      };
    } catch (error) {
      console.error("Sentiment analysis failed", error);
      return { sentiment: "neutral", score: 0.5 };
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
    knowledgeContext?: string; // NEW: Context from RAG
  }): Promise<{ content: string; usage: { totalTokens: number } }> {
    try {
      const settings = await settingsService.getSettings();
      // Prefer configured settings, but accept an environment override for quick deploys
      const apiKey = settings.api.geminiApiKey || process.env.GEMINI_API_KEY;
      if (!apiKey)
        throw new Error(
          "Gemini API key is not configured. Provide GEMINI_API_KEY or set it in the app settings.",
        );

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const role = context.role || "AI assistant";
      const systemPrompt = `
        You are ${role} for "${context.listingName}" in ${context.city}.
        ${context.instructions ? `\nCustom Instructions: ${context.instructions}` : ""}
        ${context.knowledgeContext ? `\n\nSpecific Knowledge (RAG): ${context.knowledgeContext}` : ""}

        Use the specific knowledge provided to answer guest questions accurately.
        If the information is not in the knowledge context or calendar, politely state that you'll check with the host.

        CRITICAL: If the user is asking to book, or seems ready to book, mention that you can generate a secure Direct Booking link for them to confirm dates and pay instantly.
      `;

      const prompt = `
        ${systemPrompt}

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
      const usage = result.response.usageMetadata || { totalTokenCount: 0 };

      return {
        content: response.text(),
        usage: {
          totalTokens: usage.totalTokenCount || 0,
        },
      };
    } catch (error) {
      console.error("Gemini Reply Error:", error);
      return {
        content:
          "I apologize, but I'm having trouble checking my calendar right now. Please try again in a moment.",
        usage: { totalTokens: 0 },
      };
    }
  },

  async generateText(
    prompt: string,
  ): Promise<{ text: string; usage: { totalTokens: number } }> {
    const settings = await settingsService.getSettings();
    // Support fallback to the GEMINI_API_KEY environment variable
    const apiKey = settings.api.geminiApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey)
      throw new Error(
        "Gemini API key is not configured. Provide GEMINI_API_KEY or set it in the app settings.",
      );

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const usage = result.response.usageMetadata || { totalTokenCount: 0 };

    return {
      text: response.text(),
      usage: { totalTokens: usage.totalTokenCount || 0 },
    };
  },
};
