"use client";

import { Terminal } from "lucide-react";

export default function GettingStartedPage() {
  return (
    <div className="prose prose-invert prose-lg max-w-none">
      <h1>Getting Started with Nodebase</h1>
      <p className="lead">
        Nodebase is the first cloud platform designed specifically for India's digital sovereignty. 
        Whether you are deploying a simple static site or a complex AI agent swarm, we have the tools you need.
      </p>

      <h2>Prerequisites</h2>
      <ul>
        <li>A Nodebase account (Sign up at <a href="https://console.nodebase.space" className="text-brand-saffron">console.nodebase.space</a>)</li>
        <li>Node.js 18+ installed on your local machine</li>
        <li>Git installed</li>
      </ul>

      <h2>Installation</h2>
      <p>
        The most efficient way to interact with Nodebase is through our CLI. It allows you to manage resources directly from your terminal.
      </p>

      <div className="bg-black/50 border border-white/10 rounded-xl p-4 my-6 font-mono text-sm">
        <div className="flex items-center justify-between text-white/40 text-xs mb-2 select-none">
           <span>Terminal</span>
           <Terminal className="w-3 h-3" />
        </div>
        <div className="text-green-400">
          $ npm install -g nodebase-cli
        </div>
      </div>

      <h2>Authentication</h2>
      <p>
        Once installed, authenticate with your account:
      </p>
      <div className="bg-black/50 border border-white/10 rounded-xl p-4 my-6 font-mono text-sm">
        <div className="text-green-400">
          $ nb login
        </div>
        <div className="text-white/60 mt-2">
          &gt; Opening browser for authentication...<br/>
          &gt; Success! Logged in as user@example.com
        </div>
      </div>

      <h2>Your First Deployment</h2>
      <p>
        Navigate to your project directory and run the deploy command. We automatically detect your framework (Next.js, React, Vue, etc.).
      </p>
      <div className="bg-black/50 border border-white/10 rounded-xl p-4 my-6 font-mono text-sm">
        <div className="text-green-400">
          $ nb deploy .
        </div>
        <div className="text-white/60 mt-2">
          &gt; Inspecting project... detected Next.js<br/>
          &gt; Uploading build assets... (12.4 MB)<br/>
          &gt; Deployment complete! <br/>
          &gt; https://my-app.nodebase.app
        </div>
      </div>

      <h2>Next Steps</h2>
      <ul>
        <li>Explore <a href="/docs/space" className="text-brand-blue">Space Hosting</a> for advanced configurations.</li>
        <li>Check out <a href="/docs/kaisa" className="text-brand-saffron">kaisa AI</a> to add intelligence to your app.</li>
      </ul>
    </div>
  );
}
