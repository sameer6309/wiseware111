"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Globe,
  Search,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
  TrendingUp,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Layers,
  ArrowRight
} from "lucide-react";
import type { BusinessEnrichmentData, ExploriumStatus } from "@/lib/types";

interface BusinessEnrichmentSectionProps {
  onSendToAIStudio?: (prompt: string, category: string) => void;
}

export default function BusinessEnrichmentSection({
  onSendToAIStudio,
}: BusinessEnrichmentSectionProps) {
  const [domain, setDomain] = useState("");
  const [name, setName] = useState("");
  const [enrichmentType, setEnrichmentType] = useState<"firmographics" | "technographics" | "comprehensive">("comprehensive");
  const [authorizeCredit, setAuthorizeCredit] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BusinessEnrichmentData | null>(null);
  const [creditsUsed, setCreditsUsed] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  const [status, setStatus] = useState<ExploriumStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Fetch Explorium AgentSource public status on mount
  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/enrich");
        const json = await res.json();
        if (json.success && json.data) {
          setStatus(json.data);
        }
      } catch (err) {
        console.warn("Could not retrieve AgentSource status:", err);
      } finally {
        setLoadingStatus(false);
      }
    }
    checkStatus();
  }, []);

  const sampleCompanies = [
    { name: "Stripe", domain: "stripe.com" },
    { name: "Snowflake", domain: "snowflake.com" },
    { name: "Datadog", domain: "datadoghq.com" },
    { name: "Shopify", domain: "shopify.com" },
  ];

  const handleSelectSample = (sample: { name: string; domain: string }) => {
    setName(sample.name);
    setDomain(sample.domain);
    setError(null);
  };

  const handleEnrich = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!domain.trim() && !name.trim()) {
      setError("Please specify a company domain (e.g. 'stripe.com') or company name.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: domain.trim(),
          name: name.trim() || undefined,
          enrichmentType,
          authorizeCreditUsage: authorizeCredit,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Business enrichment failed.");
      }

      setResult(json.data);
      setCreditsUsed(Boolean(json.creditsUsed));
      if (json.message) {
        setMessage(json.message);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyBusinessId = () => {
    if (!result?.businessId) return;
    navigator.clipboard.writeText(result.businessId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyJson = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleSendToAI = () => {
    if (!result || !onSendToAIStudio) return;
    const aiPrompt = `Conduct a comprehensive enterprise intelligence and strategic risk assessment for ${result.matchedName} (${result.domain}).
Industry: ${result.industry || "Technology"} (${result.subIndustry || "Software"})
Company Size: ${result.companySize || "N/A"} (${result.employeeCount} employees)
Revenue Range: ${result.revenueRange || result.revenue || "N/A"}
Headquarters: ${result.headquartersLocation || "N/A"}
Tech Stack: ${(result.technologies || []).slice(0, 6).join(", ") || "Cloud Native"}
Description: ${result.description || "Enterprise technology solution provider."}`;

    onSendToAIStudio(aiPrompt, "Competitive Intelligence");
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-400" />
              B2B Business Data Enrichment
            </h2>
            <span className="rounded-md bg-blue-950/80 px-2 py-0.5 text-[11px] font-semibold text-blue-300 border border-blue-800/60">
              Explorium AgentSource® v2
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Resolve corporate entities, extract firmographics, analyze headcount and revenue, and enrich technographic signals.
          </p>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {loadingStatus ? (
            <div className="h-7 w-28 animate-pulse rounded-lg bg-slate-800" />
          ) : status?.isConfigured ? (
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-950/80 px-3 py-1.5 text-xs font-semibold text-emerald-300 border border-emerald-800/50 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>EXPLORIUM_API_KEY Active</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-amber-950/80 px-3 py-1.5 text-xs font-semibold text-amber-300 border border-amber-800/50 shadow-sm">
              <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
              <span>Key Pending (.env.local)</span>
            </div>
          )}

          <div className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900/90 px-3 py-1.5 text-xs font-medium text-slate-300 border border-slate-800">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
            <span>Zero-Credit Guard Active</span>
          </div>
        </div>
      </div>

      {/* Input Form Card */}
      <div className="rounded-2xl border border-slate-800 bg-[#111827]/90 p-5 sm:p-6 shadow-md space-y-5">
        <form onSubmit={handleEnrich} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Domain input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-blue-400" />
                Target Company Domain <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. stripe.com, snowflake.com, apple.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full rounded-xl border border-slate-700/80 bg-[#0D1322] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Company Name input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-violet-400" />
                Company Legal or Brand Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Stripe Inc, Snowflake Cloud"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-700/80 bg-[#0D1322] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-hidden focus:ring-1 focus:ring-violet-500 transition-all"
              />
            </div>
          </div>

          {/* Sample quick selectors */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-semibold text-slate-400">Quick Test Samples:</span>
            {sampleCompanies.map((c) => (
              <button
                key={c.domain}
                type="button"
                onClick={() => handleSelectSample(c)}
                className="rounded-lg bg-slate-800/90 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-all active:scale-95 border border-slate-700/60"
              >
                {c.name} ({c.domain})
              </button>
            ))}
          </div>

          {/* Enrichment Scope & Credit Protection Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
            {/* Scope selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Enrichment Signals Scope
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "comprehensive", label: "Full Suite" },
                  { id: "firmographics", label: "Firmographics" },
                  { id: "technographics", label: "Tech Stack" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setEnrichmentType(opt.id as any)}
                    className={`rounded-xl px-2.5 py-2 text-xs font-medium border text-center transition-all ${
                      enrichmentType === opt.id
                        ? "bg-blue-600/30 border-blue-500 text-blue-200 font-semibold"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Credit Guard Checkbox */}
            <div className="rounded-xl border border-slate-800/90 bg-[#0D1322] p-3 flex flex-col justify-between">
              <div className="flex items-start gap-2.5">
                <input
                  id="credit-auth"
                  type="checkbox"
                  checked={authorizeCredit}
                  onChange={(e) => setAuthorizeCredit(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="credit-auth" className="text-xs text-slate-300 leading-tight cursor-pointer">
                  <span className="font-semibold text-white block">
                    Authorize Explorium Live Credit Usage
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Unchecked = Zero-Credit Preview Mode (Validates inputs and schemas with 0 credit cost). Checked = Live Verification (Deducts 100 account credits).
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                setDomain("");
                setName("");
                setResult(null);
                setError(null);
                setMessage(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all active:scale-95 ${
                loading
                  ? "bg-blue-800 cursor-not-allowed opacity-75"
                  : "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-blue-600/30"
              }`}
            >
              {loading ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Enriching via AgentSource...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>{authorizeCredit ? "Run Live Enrichment" : "Preview & Validate (0 Credits)"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Status / Notice Messages */}
      {message && (
        <div className="rounded-xl bg-blue-950/60 p-3.5 text-xs text-blue-200 border border-blue-800/60 flex items-start gap-2.5 animate-fadeIn">
          <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="rounded-xl bg-rose-950/80 p-4 text-xs text-rose-200 border border-rose-800/80 space-y-2 animate-fadeIn">
          <div className="flex items-center gap-2 font-semibold text-rose-300">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>Enrichment Request Notice</span>
          </div>
          <p className="text-slate-300">{error}</p>
          {error.includes("EXPLORIUM_API_KEY") && (
            <div className="rounded-lg bg-black/40 p-2.5 text-[11px] font-mono text-slate-300 border border-rose-900/40">
              EXPLORIUM_API_KEY="your_api_key_from_admin.explorium.ai"
            </div>
          )}
        </div>
      )}

      {/* Results View */}
      {result && (
        <div className="space-y-5 animate-fadeIn">
          {/* Main Entity Card */}
          <div className="rounded-2xl border border-slate-800 bg-[#111827]/90 p-6 shadow-xl space-y-5">
            {/* Top Row: Brand & Identifiers */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-base shadow-md">
                  {result.matchedName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-white tracking-tight truncate">
                      {result.matchedName}
                    </h3>
                    {result.isMockPreview ? (
                      <span className="rounded-full bg-blue-950/90 px-2.5 py-0.5 text-[10px] font-bold text-blue-300 border border-blue-800/60">
                        Zero-Credit Safe Preview
                      </span>
                    ) : creditsUsed ? (
                      <span className="rounded-full bg-emerald-950/90 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-800/60">
                        Verified Live Entity (1 Credit Used)
                      </span>
                    ) : (
                      <span className="rounded-full bg-indigo-950/90 px-2.5 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-800/60">
                        Cached Verified Entity (0 Credits)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span className="font-medium text-slate-300">{result.domain}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">
                      {Math.round(result.matchConfidence * 100)}% Match Confidence
                    </span>
                  </div>
                </div>
              </div>

              {/* Business ID Pill */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                {result.businessId && (
                  <button
                    type="button"
                    onClick={handleCopyBusinessId}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900/90 px-3 py-1.5 text-xs text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <span className="font-mono text-[11px] text-slate-400">
                      ID: {result.businessId.substring(0, 12)}...
                    </span>
                    {copiedId ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3 text-slate-400" />
                    )}
                  </button>
                )}

                {result.websiteUrl && (
                  <a
                    href={result.websiteUrl.startsWith("http") ? result.websiteUrl : `https://${result.websiteUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-800/80 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Description Banner */}
            {result.description && (
              <div className="rounded-xl bg-[#0D1322]/80 p-3.5 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <span className="font-semibold text-slate-200">Executive Summary: </span>
                {result.description}
              </div>
            )}

            {/* Firmographic 4-Metric Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Card 1: Industry */}
              <div className="rounded-xl border border-slate-800/80 bg-[#0D1322] p-4 space-y-1">
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <Layers className="h-4 w-4 text-blue-400" />
                  <span>Industry & Sector</span>
                </div>
                <p className="text-sm font-bold text-white truncate">
                  {result.industry || "Information Technology"}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {result.subIndustry || "Enterprise Software"}
                </p>
              </div>

              {/* Card 2: Employees */}
              <div className="rounded-xl border border-slate-800/80 bg-[#0D1322] p-4 space-y-1">
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <Users className="h-4 w-4 text-violet-400" />
                  <span>Headcount & Scale</span>
                </div>
                <p className="text-sm font-bold text-white">
                  {typeof result.employeeCount === "number" ? result.employeeCount.toLocaleString() : result.employeeCount}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {result.companySize || "Growth Stage"}
                </p>
              </div>

              {/* Card 3: Revenue */}
              <div className="rounded-xl border border-slate-800/80 bg-[#0D1322] p-4 space-y-1">
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <DollarSign className="h-4 w-4 text-emerald-400" />
                  <span>Revenue Bracket</span>
                </div>
                <p className="text-sm font-bold text-white truncate">
                  {result.revenueRange || String(result.revenue)}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {result.companyType || "Private"}
                </p>
              </div>

              {/* Card 4: Location */}
              <div className="rounded-xl border border-slate-800/80 bg-[#0D1322] p-4 space-y-1">
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <MapPin className="h-4 w-4 text-rose-400" />
                  <span>Headquarters</span>
                </div>
                <p className="text-sm font-bold text-white truncate">
                  {result.headquartersLocation || `${result.city || ""}, ${result.country || ""}`.trim() || "N/A"}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  Founded: {result.foundedYear || "N/A"}
                </p>
              </div>
            </div>

            {/* Technographics Tech Stack */}
            {result.technologies && result.technologies.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <Cpu className="h-3.5 w-3.5 text-blue-400" />
                  <span>Detected Technographics Stack ({result.technologies.length} platforms)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-lg bg-blue-950/60 px-2.5 py-1 text-[11px] font-medium text-blue-300 border border-blue-800/40"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  {copiedJson ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedJson ? "Copied" : "Copy JSON"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowRawJson(!showRawJson)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  {showRawJson ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  <span>Raw Payload</span>
                </button>
              </div>

              {onSendToAIStudio && (
                <button
                  type="button"
                  onClick={handleSendToAI}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:from-blue-500 hover:to-violet-500 transition-all active:scale-95 shadow-blue-600/30"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Synthesize in AI Studio</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Raw JSON Drawer */}
            {showRawJson && (
              <div className="rounded-xl bg-[#080B11] p-4 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-80 animate-fadeIn">
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
