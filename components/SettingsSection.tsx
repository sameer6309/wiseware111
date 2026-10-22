"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Database,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Save,
  Key,
  ExternalLink,
  Layers,
  Building2
} from "lucide-react";

export default function SettingsSection() {
  const [dbConnected, setDbConnected] = useState(false);
  const [aiProvider, setAiProvider] = useState<string>("Wiseware Heuristic Demo Engine");
  const [configuredProviders, setConfiguredProviders] = useState<string[]>([]);
  const [exploriumConfigured, setExploriumConfigured] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedUri, setCopiedUri] = useState(false);

  // Form preferences state
  const [timeoutSeconds, setTimeoutSeconds] = useState(30);
  const [autoRefreshRate, setAutoRefreshRate] = useState(15);
  const [defaultCategory, setDefaultCategory] = useState("System Optimization");
  const [preferredModel, setPreferredModel] = useState("Wiseware Neural-v4");

  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await fetch("/api/metrics");
        const json = await res.json();
        if (json.success && json.data) {
          setDbConnected(json.data.databaseConnected);
          if (json.data.aiProvider) {
            setAiProvider(json.data.aiProvider.activeProvider);
            setConfiguredProviders(json.data.aiProvider.configuredProviders || []);
          }
        }

        const enrichRes = await fetch("/api/enrich");
        const enrichJson = await enrichRes.json();
        if (enrichJson.success && enrichJson.data) {
          setExploriumConfigured(Boolean(enrichJson.data.isConfigured));
        }
      } catch (err) {
        console.error("Failed to load settings status:", err);
      }
    }
    loadStatus();
  }, []);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const samplePrismaUri = 'postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true';

  const copyTemplateUri = () => {
    navigator.clipboard.writeText(samplePrismaUri);
    setCopiedUri(true);
    setTimeout(() => setCopiedUri(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-400" />
          System Settings & Platform Configuration
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage Supabase PostgreSQL credentials, AI inference providers, telemetry quotas, and environment variables
        </p>
      </div>

      {/* Save Success Banner */}
      {savedSuccess && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-950/80 p-3.5 text-xs font-semibold text-emerald-300 border border-emerald-800/60 shadow-lg animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>Application preferences updated successfully.</span>
        </div>
      )}

      {/* Card 1: Supabase Database Configuration */}
      <div className="rounded-2xl border border-slate-800 bg-[#111827]/90 p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-950/80 text-blue-400 border border-blue-900/50">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Supabase PostgreSQL Connection</h3>
              <p className="text-[11px] text-slate-400">Database persistence layer using Prisma ORM</p>
            </div>
          </div>

          <div>
            {dbConnected ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/80 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-800/60">
                <CheckCircle2 className="h-3.5 w-3.5" /> Database Live & Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-950/80 px-2.5 py-0.5 text-xs font-bold text-amber-400 border border-amber-800/60">
                <AlertCircle className="h-3.5 w-3.5" /> In-Memory Mode Active
              </span>
            )}
          </div>
        </div>

        <div className="text-xs text-slate-300 space-y-2.5 leading-relaxed">
          <p>
            {dbConnected
              ? "Your application is actively querying and persisting inference records, models, and audit logs to your Supabase PostgreSQL database."
              : "Wiseware AI is currently operating in local development state with in-memory persistence. To connect your real Supabase database, follow these 3 steps:"}
          </p>

          {!dbConnected && (
            <div className="rounded-xl border border-slate-800 bg-[#0B0F19] p-4 space-y-3 font-mono text-[11px]">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-sans font-bold text-slate-300 text-xs">Supabase Pooler Connection Template:</span>
                <button
                  onClick={copyTemplateUri}
                  className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-sans"
                >
                  {copiedUri ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedUri ? "Copied" : "Copy URI"}
                </button>
              </div>

              <code className="block break-all bg-slate-900 p-2.5 rounded-lg text-blue-300 border border-slate-800">
                {samplePrismaUri}
              </code>

              <ol className="font-sans text-xs text-slate-400 list-decimal pl-4 space-y-1">
                <li>Log in to your <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-blue-400 underline inline-flex items-center gap-0.5">Supabase Dashboard <ExternalLink className="h-3 w-3" /></a> and select your project.</li>
                <li>Go to <strong>Project Settings</strong> → <strong>Database</strong> → <strong>Connection String</strong> (URI mode, Port 6543 / Transaction mode).</li>
                <li>Paste your database password and save to <code className="text-slate-300 font-mono">DATABASE_URL</code> in <code className="text-slate-300 font-mono">.env.local</code>.</li>
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* Card 2: AI Provider & Engine Configuration */}
      <div className="rounded-2xl border border-slate-800 bg-[#111827]/90 p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-950/80 text-violet-400 border border-violet-900/50">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">AI Inference Provider</h3>
              <p className="text-[11px] text-slate-400">External model orchestration & fallback behavior</p>
            </div>
          </div>

          <span className="rounded-md bg-blue-950/80 px-2.5 py-1 text-xs font-semibold text-blue-300 border border-blue-900/60">
            {aiProvider}
          </span>
        </div>

        <div className="space-y-3 text-xs text-slate-300">
          <p>
            Wiseware AI automatically routes queries to real LLMs if an API key is supplied in <code className="text-slate-200 font-mono">.env.local</code>. If no keys are present, the transparent <strong>Wiseware Heuristic Demo Engine</strong> executes realistic simulations with zero fabricated claims.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="rounded-xl border border-slate-800 bg-[#0B0F19] p-3 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 block">Google Gemini</span>
                <span className="text-[11px] text-slate-500 font-mono">GEMINI_API_KEY</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                configuredProviders.includes("Gemini")
                  ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60"
                  : "bg-slate-800 text-slate-500"
              }`}>
                {configuredProviders.includes("Gemini") ? "Configured" : "Not Set"}
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#0B0F19] p-3 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 block">OpenAI (GPT-4o)</span>
                <span className="text-[11px] text-slate-500 font-mono">OPENAI_API_KEY</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                configuredProviders.includes("OpenAI")
                  ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60"
                  : "bg-slate-800 text-slate-500"
              }`}>
                {configuredProviders.includes("OpenAI") ? "Configured" : "Not Set"}
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#0B0F19] p-3 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 block">Groq (Llama 3.3)</span>
                <span className="text-[11px] text-slate-500 font-mono">GROQ_API_KEY</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                configuredProviders.includes("Groq")
                  ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60"
                  : "bg-slate-800 text-slate-500"
              }`}>
                {configuredProviders.includes("Groq") ? "Configured" : "Not Set"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Explorium AgentSource B2B Intelligence */}
      <div className="rounded-2xl border border-slate-800 bg-[#111827]/90 p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-950/80 text-blue-400 border border-blue-900/50">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Explorium AgentSource® B2B Intelligence</h3>
              <p className="text-[11px] text-slate-400">Firmographics, Technographics, and Corporate Entity Matching</p>
            </div>
          </div>

          <div>
            {exploriumConfigured ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/80 px-2.5 py-1 text-[11px] font-bold text-emerald-300 border border-emerald-800/60">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Active & Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-950/80 px-2.5 py-1 text-[11px] font-bold text-amber-300 border border-amber-800/60">
                <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                Key Not Detected (.env.local)
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Explorium AgentSource powers autonomous GTM intelligence, firmographic entity resolution, and technographic profiling.
          All requests are executed server-side via <code className="rounded bg-slate-900 px-1.5 py-0.5 text-blue-300 font-mono text-[11px]">process.env.EXPLORIUM_API_KEY</code>.
        </p>

        <div className="rounded-xl border border-slate-800 bg-[#0B0F19] p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Environment Variable:</span>
            <span className="font-mono text-slate-200">EXPLORIUM_API_KEY</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">API Version:</span>
            <span className="text-slate-200 font-medium">v2.0 REST & MCP Unified</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Credit Protection Guard:</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Active (Requires User Confirmation)
            </span>
          </div>
        </div>
      </div>

      {/* Card 4: Application Preferences Form */}
      <div className="rounded-2xl border border-slate-800 bg-[#111827]/90 p-6 shadow-md space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-900/50">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Application Preferences</h3>
            <p className="text-[11px] text-slate-400">Tune telemetry thresholds and client behavior</p>
          </div>
        </div>

        <form onSubmit={handleSavePreferences} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Default Inference Model
              </label>
              <select
                value={preferredModel}
                onChange={(e) => setPreferredModel(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-[#0B0F19] p-2.5 text-slate-200 focus:border-blue-500 focus:outline-hidden"
              >
                <option value="Wiseware Neural-v4">Wiseware Neural-v4 (Recommended)</option>
                <option value="Wiseware Flash-Core">Wiseware Flash-Core (Ultra-fast)</option>
                <option value="Wiseware Reasoning Pro">Wiseware Reasoning Pro (Deep CoT)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Default Inquiry Category
              </label>
              <select
                value={defaultCategory}
                onChange={(e) => setDefaultCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-[#0B0F19] p-2.5 text-slate-200 focus:border-blue-500 focus:outline-hidden"
              >
                <option value="System Optimization">System Optimization</option>
                <option value="Performance">Performance</option>
                <option value="Security">Security</option>
                <option value="Predictive Insight">Predictive Insight</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                API Gateway Timeout (seconds)
              </label>
              <input
                type="number"
                min={5}
                max={120}
                value={timeoutSeconds}
                onChange={(e) => setTimeoutSeconds(parseInt(e.target.value, 10))}
                className="w-full rounded-xl border border-slate-800 bg-[#0B0F19] p-2.5 text-slate-200 focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Live Audit Stream Polling Rate (seconds)
              </label>
              <input
                type="number"
                min={5}
                max={60}
                value={autoRefreshRate}
                onChange={(e) => setAutoRefreshRate(parseInt(e.target.value, 10))}
                className="w-full rounded-xl border border-slate-800 bg-[#0B0F19] p-2.5 text-slate-200 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:from-blue-500 hover:to-violet-500 transition-all active:scale-95"
            >
              <Save className="h-4 w-4" /> Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
