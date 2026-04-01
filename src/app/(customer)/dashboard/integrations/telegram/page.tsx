"use client";

import { useState, useEffect } from "react";
import { Bot, Check, X, ExternalLink, RefreshCw, Copy, CheckCircle, AlertCircle } from "lucide-react";

type TelegramIntegration = {
  connected: boolean;
  bot_username?: string;
  webhook_url?: string;
};

export default function TelegramSetupPage() {
  const [integration, setIntegration] = useState<TelegramIntegration>({
    connected: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [botToken, setBotToken] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchIntegration();
  }, []);

  const fetchIntegration = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/integrations/telegram");
      const data = await response.json();
      setIntegration(data);
      if (data.bot_token) {
        setBotToken(data.bot_token);
      }
    } catch (error) {
      console.error("Failed to fetch integration:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveIntegration = async () => {
    if (!botToken.trim()) {
      setError("Please enter your Telegram Bot Token");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/integrations/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bot_token: botToken.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save integration");
        return;
      }

      setSuccess("Telegram bot connected successfully!");
      setIntegration({
        connected: true,
        bot_username: data.bot_username,
        webhook_url: data.webhook_url,
      });
    } catch (error) {
      setError("Failed to save integration");
    } finally {
      setSaving(false);
    }
  };

  const disconnectIntegration = async () => {
    try {
      setSaving(true);
      const response = await fetch("/api/integrations/telegram", {
        method: "DELETE",
      });

      if (response.ok) {
        setIntegration({ connected: false });
        setBotToken("");
        setSuccess("Telegram bot disconnected");
      }
    } catch (error) {
      setError("Failed to disconnect");
    } finally {
      setSaving(false);
    }
  };

  const copyWebhookUrl = () => {
    if (integration.webhook_url) {
      navigator.clipboard.writeText(integration.webhook_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const webhookUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/api/integrations/webhook/telegram`
    : "";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <Bot className="h-7 w-7" />
          Telegram Integration
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Connect a Telegram bot to receive and respond to messages via Telegram
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-500">{success}</p>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        {!integration.connected ? (
          <>
            <div className="space-y-4">
              <div>
                <h2 className="font-semibold text-foreground">Setup Instructions</h2>
                <ol className="mt-3 space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Open Telegram and search for <span className="font-mono bg-muted px-1 rounded">@BotFather</span></li>
                  <li>Send <span className="font-mono bg-muted px-1 rounded">/newbot</span> to create a new bot</li>
                  <li>Copy the bot token provided by BotFather</li>
                  <li>Paste the token below and click Connect</li>
                </ol>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Bot Token
                </label>
                <input
                  type="password"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Your bot token is securely stored and never exposed
                </p>
              </div>
            </div>

            <button
              onClick={saveIntegration}
              disabled={saving}
              className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4" />
                  Connect Telegram Bot
                </>
              )}
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-semibold text-foreground">
                  {integration.bot_username ? `@${integration.bot_username}` : "Telegram Bot Connected"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your bot is ready to receive messages
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Webhook URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={webhookUrl}
                    readOnly
                    className="flex-1 px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground font-mono text-sm"
                  />
                  <button
                    onClick={copyWebhookUrl}
                    className="px-4 py-2.5 bg-muted border border-border rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Configure this URL in your bot settings or use the API to set it
                </p>
              </div>

              <div className="bg-muted rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-foreground text-sm">Next Steps:</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Set the webhook URL in your bot using our API or manually</li>
                  <li>Start a conversation with your bot on Telegram</li>
                  <li>Messages will appear in your inbox</li>
                </ol>
              </div>
            </div>

            <button
              onClick={disconnectIntegration}
              disabled={saving}
              className="w-full px-4 py-2.5 bg-red-500/10 text-red-500 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <X className="h-4 w-4" />
              Disconnect Bot
            </button>
          </>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-semibold text-foreground mb-4">Features</h2>
        <ul className="space-y-3">
          {[
            "Unified customer profiles across channels",
            "AI-powered auto-replies",
            "Visual flow automation",
            "Cross-channel notification system",
            "Guest booking and payment support",
          ].map((feature, idx) => (
            <li key={idx} className="flex items-center gap-3 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
