export const AI_PROVIDER_LABELS = {
  google: "Google Gemini",
  mistral: "Mistral",
} as const;

export type AIProvider = keyof typeof AI_PROVIDER_LABELS;
export type AITone = "friendly" | "professional" | "concise" | "humorous";

export const AI_MODEL_CATALOG = {
  google: [
    {
      id: "google/gemini-2.5-flash",
      label: "Gemini 2.5 Flash",
      description: "Balanced default for fast replies",
    },
    {
      id: "google/gemini-2.5-pro",
      label: "Gemini 2.5 Pro",
      description: "Deeper reasoning for harder requests",
    },
  ],
  mistral: [
    {
      id: "mistral/mistral-small",
      label: "Mistral Small",
      description: "Cheap general-purpose messaging model",
    },
    {
      id: "mistral/ministral-8b",
      label: "Ministral 8B",
      description: "Lower-cost option for short transactional replies",
    },
  ],
} as const;

export type AIModel =
  (typeof AI_MODEL_CATALOG)[AIProvider][number]["id"];

export interface StoredAISettings {
  provider?: string | null;
  model?: string | null;
  apiKey?: string | null;
  customInstructions?: string | null;
  tone?: AITone | null;
}

const LEGACY_MODEL_ALIASES: Record<string, AIModel> = {
  "gemini-1.5-flash": "google/gemini-2.5-flash",
  "gemini-1.5-pro": "google/gemini-2.5-pro",
  "claude-3-haiku-20240307": "google/gemini-2.5-flash",
  "claude-3-sonnet-20240229": "google/gemini-2.5-flash",
  "claude-3-opus-20240229": "google/gemini-2.5-pro",
};

export const DEFAULT_AI_PROVIDER: AIProvider = "google";
export const DEFAULT_AI_MODEL: AIModel = AI_MODEL_CATALOG.google[0].id;

export function normalizeAIProvider(provider?: string | null): AIProvider {
  return provider === "mistral" || provider === "google"
    ? provider
    : DEFAULT_AI_PROVIDER;
}

export function normalizeAIModel(
  provider: AIProvider,
  model?: string | null,
): AIModel {
  const normalizedModel = (model && LEGACY_MODEL_ALIASES[model]) || model;
  const supportedModels = AI_MODEL_CATALOG[provider];
  const matchedModel = supportedModels.find(
    ({ id }) => id === normalizedModel,
  );

  return (matchedModel?.id || supportedModels[0].id) as AIModel;
}

export function resolveAISettings(settings?: StoredAISettings | null) {
  const provider = normalizeAIProvider(settings?.provider);

  return {
    provider,
    model: normalizeAIModel(provider, settings?.model),
    apiKey: settings?.apiKey?.trim() || undefined,
    customInstructions: settings?.customInstructions?.trim() || undefined,
    tone: settings?.tone || undefined,
  };
}

export function getAIModelOptions(provider: AIProvider) {
  return AI_MODEL_CATALOG[provider];
}

export function getProviderApiKeyPlaceholder(provider: AIProvider) {
  return provider === "mistral"
    ? "Optional Mistral API key override..."
    : "Optional Google Gemini API key override...";
}

export function getToneInstruction(tone?: AITone | null) {
  switch (tone) {
    case "professional":
      return "Keep the tone professional, calm, and crisp.";
    case "concise":
      return "Keep replies concise and direct.";
    case "humorous":
      return "Keep the tone lightly playful without sounding unprofessional.";
    case "friendly":
      return "Keep the tone warm, welcoming, and human.";
    default:
      return "";
  }
}

export function getGatewayProviderOptions(
  provider: AIProvider,
  apiKey?: string,
) {
  if (!apiKey) {
    return undefined;
  }

  return {
    gateway: {
      byok: {
        [provider]: [{ apiKey }],
      },
    },
  };
}
