"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Tag,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Cpu
} from "lucide-react";
import type { AnalysisResponse } from "@/app/api/analyze/route";

interface AIAnalysisSectionProps {
  onAnalysisComplete?: (result: AnalysisResponse) => void;
  initialPrompt?: string;
  initialCategory?: string;
}

export default function AIAnalysisSection({
  onAnalysisComplete,
  initialPrompt,
  initialCategory,
}: AIAnalysisSectionProps) {
  const [prompt, setPrompt] = useState(initialPrompt || "");
  const [model, setModel] = useState("Wiseware Neural-v4");
  const [category, setCategory] = useState(initialCategory || "System Optimization");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
    if (initialCategory) {
      setCategory(initialCategory);
    }
  }, [initialPrompt, initialCategory]);

  const samplePrompts = [
    {
      label: "API Latency Optimization",
      category: "Performance",
      text: "Investigate database query execution plan bottlenecks under 10k concurrent requests and recommend caching strategies.",
    },
    {
      label: "Customer Churn Risk",
      category: "Predictive Insight",
      text: "Analyze enterprise customer behavioral drop-offs during onboarding and identify early retention warning signs.",
    },
    {
      label: "Zero-Trust Security Audit",
      category: "Security",
      text: "Perform a security assessment of JWT token expiration, automated key rotation, and OAuth2 scopes across microservices.",
    },
  ];

  const handleRunAnalysis = async (customPrompt?: string) => {
    const textToAnalyze = customPrompt || prompt;
    if (!textToAnalyze.trim()) {
      setError("Please enter a prompt or select a sample analysis topic.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToAnalyze,
          model,
          category,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to execute AI analysis.");
      }

      setResult(data.data);
      if (onAnalysisComplete) {
        onAnalysisComplete(data.data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="ai-analysis-section" className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-950/80 text-blue-400 border border-blue-800/50">
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-white">
              Wiseware AI Analysis Engine
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Submit production queries, code, or metrics for real-time model synthesis
          </p>
        </div>

        {/* Quick Model Selector */}
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <Cpu className="h-4 w-4 text-slate-400" />
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="rounded-xl border border-slate-800 bg-[#111827] px-3 py-1.5 text-xs font-semibold text-slate-200 shadow-sm focus:border-blue-500 focus:outline-hidden"
          >
            <option value="Wiseware Neural-v4">Wiseware Neural-v4 (Balanced)</option>
            <option value="Wiseware Flash-Core">Wiseware Flash-Core (Ultra-Fast)</option>
            <option value="Wiseware Reasoning Pro">Wiseware Reasoning Pro (Deep)</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Input Form vs Output Display */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Input Box & Controls */}
        <div className="flex flex-col rounded-2xl border border-slate-800 bg-[#111827]/90 p-6 shadow-md lg:col-span-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-blue-400" />
              Inference Prompt
            </label>
            <span className="text-[11px] text-slate-500">
              {prompt.length} characters
            </span>
          </div>

          {/* Text Area */}
          <textarea
            rows={5}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe a scenario, architecture challenge, or metric to evaluate... e.g., 'Examine our microservices data ingestion pipeline for latency spikes during peak load.'"
            className="w-full rounded-xl border border-slate-800 bg-[#0B0F19] p-3.5 text-xs font-medium text-slate-100 placeholder-slate-500 transition-all focus:border-blue-500 focus:bg-[#0B0F19] focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 resize-none"
          />

          {/* Sample Prompts Pills */}
          <div className="mt-4">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2">
              Try a sample scenario:
            </span>
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setPrompt(s.text);
                    setCategory(s.category);
                    handleRunAnalysis(s.text);
                  }}
                  className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-300 transition-all hover:border-blue-700/60 hover:bg-blue-950/60 hover:text-blue-300"
                >
                  ⚡ {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-950/40 p-3 text-xs font-medium text-rose-300 border border-rose-900/50">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Footer */}
          <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={() => {
                setPrompt("");
                setResult(null);
                setError(null);
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleRunAnalysis()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-600/30 transition-all hover:from-blue-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Execute Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Analysis Result Panel */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#111827]/90 p-6 shadow-md lg:col-span-6">
          {result ? (
            <div className="space-y-4 animate-fadeIn">
              {/* Result Meta Bar */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-blue-950/80 px-2 py-0.5 font-mono text-[11px] font-bold text-blue-300 border border-blue-800/60">
                    {result.id}
                  </span>
                  <span className="text-xs text-slate-400">
                    {result.timestamp} • {result.latencyMs}ms
                  </span>
                  {result.creditsUsed && (
                    <span className="rounded-md bg-indigo-950/80 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-800/60">
                      ⚡ -{result.creditsUsed} credits
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      result.sentiment === "Positive"
                        ? "bg-emerald-950/70 text-emerald-400 border border-emerald-800/50"
                        : result.sentiment === "Constructive"
                        ? "bg-amber-950/70 text-amber-400 border border-amber-800/50"
                        : "bg-rose-950/70 text-rose-400 border border-rose-800/50"
                    }`}
                  >
                    {result.sentiment} Trajectory
                  </span>
                  <button
                    onClick={handleCopyResult}
                    title="Copy response JSON"
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confidence Meter */}
              <div className="rounded-xl bg-[#0B0F19] p-3.5 border border-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-300">
                    Model Confidence Score
                  </span>
                  <span className="font-bold text-blue-400">
                    {result.confidenceScore}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-500"
                    style={{ width: `${result.confidenceScore}%` }}
                  />
                </div>
              </div>

              {/* Summary */}
              <p className="text-xs leading-relaxed text-slate-200 font-medium">
                {result.summary}
              </p>

              {/* Key Insights List */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Key Synthesized Findings
                </h3>
                <div className="space-y-1.5">
                  {result.keyInsights.map((insight, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-xs text-slate-300"
                    >
                      <span className="text-blue-400 font-bold">•</span>
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                  Recommended Actions
                </h3>
                <div className="space-y-1.5">
                  {result.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg bg-blue-950/20 p-2 text-xs font-medium text-slate-200 border border-blue-900/40"
                    >
                      {idx + 1}. {rec}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags & Entities */}
              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-slate-500" />
                {result.extractedEntities.map((tag, idx) => (
                  <span
                    key={idx}
                    className="rounded-md bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            /* Empty placeholder state */
            <div className="flex h-full min-h-[340px] flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-800 rounded-xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-950/50 text-blue-400 mb-3 border border-blue-900/40 shadow-xs">
                <Sparkles className="h-7 w-7" />
              </div>
              <h3 className="text-sm font-bold text-white">
                Awaiting Analysis Trigger
              </h3>
              <p className="mt-1 max-w-sm text-xs text-slate-400">
                Type an inquiry or pick one of the sample scenarios on the left and click{" "}
                <span className="font-semibold text-blue-400">
                  Execute Analysis
                </span>{" "}
                to observe real-time intelligence output.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
