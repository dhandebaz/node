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

/**
 * Helper: search for a Gemini API key in several possible locations.
 * Priority: app settings (DB) -> common env vars used across deployments.
 */
function findGeminiApiKey(settingsKey?: string) {
  const candidates = [
    settingsKey,
    process.env.GEMINI_API_KEY,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    process.env.VERCEL_GEMINI_API_KEY,
    process.env.GOOGLE_API_KEY,
    process.env.GOOGLE_GEMINI_API_KEY,
    process.env.GCP_GEMINI_KEY,
  ];

  for (const key of candidates) {
    if (key && typeof key === "string" && key.trim().length > 0) {
      return key.trim();
    }
  }

  return null;
}

function resolvedKeySource(settingsKey?: string) {
  if (settingsKey) return "settings";
  if (process.env.GEMINI_API_KEY) return "env:GEMINI_API_KEY";
  if (process.env.NEXT_PUBLIC_GEMINI_API_KEY)
    return "env:NEXT_PUBLIC_GEMINI_API_KEY";
  if (process.env.VERCEL_GEMINI_API_KEY) return "env:VERCEL_GEMINI_API_KEY";
  if (process.env.GOOGLE_API_KEY) return "env:GOOGLE_API_KEY";
  if (process.env.GOOGLE_GEMINI_API_KEY) return "env:GOOGLE_GEMINI_API_KEY";
  if (process.env.GCP_GEMINI_KEY) return "env:GCP_GEMINI_KEY";
  return "none";
}

export const geminiService = {
  async verifyDocument(
    fileBase64: string,
    mimeType: string,
  ): Promise<VerificationResult> {
    try {
      const settings = await settingsService.getSettings();
      const apiKey = findGeminiApiKey(settings.api.geminiApiKey);
      const source = resolvedKeySource(settings.api.geminiApiKey);

      // Log resolved source so operators can confirm where the key came from
      console.info("geminiService: resolved API key source:", source);

      if (!apiKey) {
        throw new Error(
          "Gemini API key is not configured. Set it in System Settings (Admin > API) or provide GEMINI_API_KEY (or NEXT_PUBLIC_GEMINI_API_KEY / VERCEL_GEMINI_API_KEY) as an environment variable.",
        );
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      // Use configured runtime model when available (fallback to gemini-1.5-flash for compatibility)
      const modelName = settings.api?.kaisaModel || "gemini-2.5-flash-lite";
      console.info("geminiService: using generative model:", modelName);
      const model = genAI.getGenerativeModel({ model: modelName });

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

      // Attempt generation. If the configured model is not available (404),
      // try to call ListModels and pick a vision-capable fallback and retry once.
      try {
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();

        return JSON.parse(jsonStr) as VerificationResult;
      } catch (innerErr: any) {
        // Detect a model-not-found style error for retry logic
        const innerMsg = String(
          innerErr?.message || innerErr?.toString() || "",
        ).toLowerCase();
        const innerStatus =
          innerErr?.status ||
          innerErr?.statusCode ||
          innerErr?.response?.status;
        const isInnerModelNotFound =
          innerStatus === 404 ||
          innerMsg.includes("not found for api version") ||
          (innerMsg.includes("models/") && innerMsg.includes("not found")) ||
          (innerMsg.includes("model") && innerMsg.includes("not found"));

        if (!isInnerModelNotFound) {
          // Re-throw if this isn't a recoverable model-not-found issue
          throw innerErr;
        }

        console.warn(
          "geminiService: model not found; attempting ListModels fallback and retry",
        );

        try {
          // List models via public Generative Language REST endpoint using the same API key
          // (we use the API key here because the service authenticated successfully earlier)
          const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
          const listResp = await fetch(listUrl, { method: "GET" });
          if (!listResp.ok) {
            throw new Error(`ListModels failed with status ${listResp.status}`);
          }
          const listJson = await listResp.json();
          const models = listJson.models || [];

          // Heuristic: prefer models whose name/displayName suggests vision/image/multimodal capability
          let candidate = models.find((m: any) =>
            /vision|image|multimodal|vision-bison|image-bison/i.test(
              m.name || m.displayName || "",
            ),
          );

          // If none found, prefer any model that declares support for generateContent (if available)
          if (!candidate) {
            candidate = models.find(
              (m: any) =>
                Array.isArray(m.supportedMethods) &&
                m.supportedMethods.includes("generateContent"),
            );
          }

          // Fallback to first model available if nothing else matched
          if (!candidate && models.length > 0) candidate = models[0];

          if (candidate && (candidate.name || candidate.model)) {
            const candidateName = candidate.name || candidate.model;
            console.info(
              "geminiService: ListModels selected fallback model:",
              candidateName,
            );

            // Retry the call using the selected fallback model
            const fallbackModel = genAI.getGenerativeModel({
              model: candidateName,
            });
            const retryResult = await fallbackModel.generateContent([
              prompt,
              imagePart,
            ]);
            const retryResponse = await retryResult.response;
            const retryText = retryResponse.text();
            const retryJsonStr = retryText
              .replace(/```json\n?|\n?```/g, "")
              .trim();
            return JSON.parse(retryJsonStr) as VerificationResult;
          } else {
            throw new Error("No suitable fallback model found from ListModels");
          }
        } catch (listErr) {
          // Log the fallback failure and rethrow the original inner error so the existing
          // error handling path remains consistent (it will convert to a user-facing reason).
          console.error("geminiService: ListModels fallback failed:", listErr);
          throw innerErr;
        }
      }
    } catch (error: any) {
      console.error("Gemini Verification Error:", error);

      // Normalize message and status for detection
      const msg = String(error?.message || error?.toString() || "");
      const statusCode =
        error?.status || error?.statusCode || error?.response?.status;

      // Detect common config errors (missing/invalid key)
      const isConfigError =
        msg.toLowerCase().includes("api key") ||
        msg.toLowerCase().includes("configured");

      // Detect model-not-found errors returned by the Google Generative API
      const isModelNotFound =
        statusCode === 404 ||
        /models\/.*not found/i.test(msg) ||
        /not found for api version/i.test(msg) ||
        /model .* is not found/i.test(msg);

      let reason: string;
      if (isModelNotFound) {
        // Provide a clear remediation path for operators
        reason =
          "Model not found: the configured model is not available for the current API/version. " +
          "Check Admin → Settings → API and update the `kaisaModel` to a supported model name, or remove the custom model to use the default. " +
          "You can also call ListModels on the Google Generative API to see supported models for your project.";
      } else if (isConfigError) {
        reason =
          "System Configuration Error: Gemini API Key missing or invalid. Ensure the key is set in system settings (Admin > Settings) or as an environment variable (GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY).";
      } else {
        reason = "Verification process failed due to a technical error.";
      }

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
      const apiKey = findGeminiApiKey(settings.api.geminiApiKey);
      const source = resolvedKeySource(settings.api.geminiApiKey);
      console.info("geminiService: resolved API key source:", source);

      if (!apiKey)
        throw new Error(
          "Gemini API key is not configured. Provide GEMINI_API_KEY or set it in the app settings.",
        );

      const genAI = new GoogleGenerativeAI(apiKey);
      // Make embedding model configurable via settings.api.embeddingModel (fallback to embedding-004)
      const embeddingModel =
        (settings.api as any)?.embeddingModel || "embedding-004";
      console.info("geminiService: using embedding model:", embeddingModel);
      const model = genAI.getGenerativeModel({ model: embeddingModel });
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
      const apiKey = findGeminiApiKey(settings.api.geminiApiKey);
      const source = resolvedKeySource(settings.api.geminiApiKey);
      console.info("geminiService: resolved API key source:", source);

      if (!apiKey)
        throw new Error(
          "Gemini API key is not configured. Provide GEMINI_API_KEY or set it in the app settings.",
        );

      const genAI = new GoogleGenerativeAI(apiKey);
      // Use configured runtime model for sentiment analysis as well
      const sentimentModel = settings.api?.kaisaModel || "gemini-1.5-flash";
      console.info(
        "geminiService: using generative model for sentiment:",
        sentimentModel,
      );
      const model = genAI.getGenerativeModel({ model: sentimentModel });

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
      const apiKey = findGeminiApiKey(settings.api.geminiApiKey);
      const source = resolvedKeySource(settings.api.geminiApiKey);
      console.info("geminiService: resolved API key source:", source);

      if (!apiKey)
        throw new Error(
          "Gemini API key is not configured. Provide GEMINI_API_KEY or set it in the app settings.",
        );

      const genAI = new GoogleGenerativeAI(apiKey);
      // Respect configured Kaisa runtime model for reply generation
      const replyModel = settings.api?.kaisaModel || "gemini-1.5-flash";
      console.info(
        "geminiService: using generative model for reply:",
        replyModel,
      );
      const model = genAI.getGenerativeModel({ model: replyModel });

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
    const apiKey = findGeminiApiKey(settings.api.geminiApiKey);
    const source = resolvedKeySource(settings.api.geminiApiKey);
    console.info("geminiService: resolved API key source:", source);

    if (!apiKey)
      throw new Error(
        "Gemini API key is not configured. Provide GEMINI_API_KEY or set it in the app settings.",
      );

    const genAI = new GoogleGenerativeAI(apiKey);
    // Use configured model for text generation (fall back to gemini-1.5-flash)
    const textModel = settings.api?.kaisaModel || "gemini-1.5-flash";
    console.info("geminiService: using generative model for text:", textModel);
    const model = genAI.getGenerativeModel({ model: textModel });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const usage = result.response.usageMetadata || { totalTokenCount: 0 };

    return {
      text: response.text(),
      usage: { totalTokens: usage.totalTokenCount || 0 },
    };
  },
};
