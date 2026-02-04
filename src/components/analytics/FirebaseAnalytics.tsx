"use client";

import { useEffect } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

interface FirebaseAnalyticsProps {
  configString: string;
  enabled: boolean;
}

export function FirebaseAnalytics({ configString, enabled }: FirebaseAnalyticsProps) {
  useEffect(() => {
    // 1. Check if enabled
    if (!enabled || !configString) return;

    // 2. Check domain (nodebase.space only)
    // In dev, we might want to test, but user explicitly asked for "live on nodebase.space domain"
    if (window.location.hostname !== "nodebase.space") {
        // Uncomment for debugging if needed:
        // console.log("Analytics skipped: Not on nodebase.space domain (" + window.location.hostname + ")");
        return;
    }

    // 3. Check if already initialized
    if (getApps().length > 0) return;

    // 4. Parse config
    try {
        const config = extractConfig(configString);
        if (!config) {
            console.warn("Analytics: Could not parse configuration");
            return;
        }

        // 5. Initialize
        const app = initializeApp(config);
        
        // 6. Analytics
        isSupported().then(supported => {
            if (supported) {
                getAnalytics(app);
                console.log("Analytics initialized");
            }
        }).catch(err => {
             console.error("Analytics support check failed", err);
        });

    } catch (e) {
        console.error("Analytics init failed:", e);
    }

  }, [configString, enabled]);

  return null;
}

function extractConfig(str: string) {
    // Basic extraction for known keys
    const keys = [
        "apiKey",
        "authDomain",
        "projectId",
        "storageBucket",
        "messagingSenderId",
        "appId",
        "measurementId"
    ];

    const config: Record<string, string> = {};
    let found = false;

    keys.forEach(key => {
        // Match key: "value" or key: 'value', handling potential whitespace
        const regex = new RegExp(`${key}\\s*:\\s*["']([^"']+)["']`);
        const match = str.match(regex);
        if (match && match[1]) {
            config[key] = match[1];
            found = true;
        }
    });

    return found ? config : null;
}
