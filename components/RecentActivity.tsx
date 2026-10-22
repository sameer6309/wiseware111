"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import type { AnalysisResponse } from "@/app/api/analyze/route";
import type { InferenceRecord } from "@/lib/types";

interface RecentActivityProps {
  recentItems?: AnalysisResponse[];
  onViewAll?: () => void;
}

export default function RecentActivity({ recentItems = [], onViewAll }: RecentActivityProps) {
  const [historyItems, setHistoryItems] = useState<InferenceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecentHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/history?limit=5");
      const json = await res.json();
      if (json.success && json.data?.items) {
        setHistoryItems(json.data.items);
      }
    } catch (err) {
      console.warn("Failed to fetch /api/history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentHistory();
  }, []);

  // Merge live items created in the current session on top
  const combinedItems = [
    ...recentItems.map((item) => ({
      id: item.id,
      code: item.id,
      prompt: item.summary,
      modelName: item.model,
      category: item.category,
      latencyMs: item.latencyMs,
      tokensUsed: item.tokensUsed,
      confidenceScore: item.confidenceScore,
      sentiment: item.sentiment,
      summary: item.summary,
      keyInsights: item.keyInsights,
      extractedEntities: item.extractedEntities,
      recommendations: item.recommendations,
      status: "Completed" as const,
      isRealAI: Boolean(item.isRealAI),
      createdAt: item.timestamp,
    })),
    ...historyItems,
  ].slice(0, 5);

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#111827]/90 p-6 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-950/70 text-emerald-400 border border-emerald-800/50">
            <Activity className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white truncate">
              Recent Inference Activity
            </h3>
            <p className="text-[11px] text-slate-400 truncate">
              Live audit stream of automated model queries and execution health
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchRecentHistory}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>

          {onViewAll && (
            <button
              onClick={onViewAll}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-blue-400 hover:bg-slate-800 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-left border-collapse min-w-[680px]">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="pb-3 pl-1 whitespace-nowrap">Inference ID</th>
              <th className="pb-3 whitespace-nowrap">Model</th>
              <th className="pb-3">Scenario Synthesis</th>
              <th className="pb-3 whitespace-nowrap">Latency</th>
              <th className="pb-3 whitespace-nowrap">Confidence</th>
              <th className="pb-3 whitespace-nowrap">Status</th>
              <th className="pb-3 pr-1 text-right whitespace-nowrap">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-xs">
            {combinedItems.map((item, idx) => (
              <tr
                key={item.id || idx}
                className="group hover:bg-slate-800/40 transition-colors"
              >
                <td className="py-3.5 pl-1 font-mono font-bold text-blue-400 whitespace-nowrap">
                  {item.code}
                </td>
                <td className="py-3.5 font-medium text-slate-200 whitespace-nowrap">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    {item.modelName}
                  </span>
                </td>
                <td className="py-3.5 max-w-xs truncate text-slate-300">
                  {item.summary}
                </td>
                <td className="py-3.5 font-mono text-slate-400 whitespace-nowrap">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-500 shrink-0" />
                    {item.latencyMs}ms
                  </span>
                </td>
                <td className="py-3.5 font-semibold text-white whitespace-nowrap">
                  {item.confidenceScore}%
                </td>
                <td className="py-3.5 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      item.status === "Completed"
                        ? "bg-emerald-950/70 text-emerald-400 border border-emerald-800/50"
                        : "bg-rose-950/70 text-rose-400 border border-rose-800/50"
                    }`}
                  >
                    <CheckCircle className="h-3 w-3" />
                    {item.status}
                  </span>
                </td>
                <td className="py-3.5 pr-1 text-right text-slate-400 text-[11px] whitespace-nowrap">
                  {item.createdAt.includes("T")
                    ? new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : item.createdAt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
