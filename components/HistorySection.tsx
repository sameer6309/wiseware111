"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Tag,
  ShieldCheck,
  Lightbulb
} from "lucide-react";
import type { InferenceRecord } from "@/lib/types";

export default function HistorySection() {
  const [items, setItems] = useState<InferenceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState<InferenceRecord | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category !== "All") params.set("category", category);
      if (status !== "All") params.set("status", status);
      params.set("page", page.toString());
      params.set("limit", "8");

      const res = await fetch(`/api/history?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setItems(json.data.items);
        setTotalPages(json.data.totalPages);
        setTotalCount(json.data.total);
      }
    } catch (err) {
      console.error("Failed to fetch inference history:", err);
    } finally {
      setLoading(false);
    }
  }, [search, category, status, page]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleCopyRecord = (record: InferenceRecord) => {
    navigator.clipboard.writeText(JSON.stringify(record, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-400" />
            Analysis History & Audit Records
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full searchable log of all synthesized model inferences, confidence scores, and telemetry
          </p>
        </div>

        <button
          onClick={fetchHistory}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-[#111827] px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-800 bg-[#111827]/90 p-4 shadow-md">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by prompt keywords, ID, or model..."
            className="w-full rounded-xl border border-slate-800 bg-[#0B0F19] pl-10 pr-4 py-2 text-xs font-medium text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="h-3.5 w-3.5 text-slate-500" />
            <span>Category:</span>
          </div>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-800 bg-[#0B0F19] px-3 py-2 text-xs font-semibold text-slate-200 focus:border-blue-500 focus:outline-hidden"
          >
            <option value="All">All Categories</option>
            <option value="Performance">Performance</option>
            <option value="Security">Security</option>
            <option value="Predictive Insight">Predictive Insight</option>
            <option value="System Optimization">System Optimization</option>
          </select>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-800 bg-[#0B0F19] px-3 py-2 text-xs font-semibold text-slate-200 focus:border-blue-500 focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Main Records Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#111827]/90 p-6 shadow-md overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs text-slate-400">
          <span>Showing {items.length} of {totalCount} records</span>
          <span>Page {page} of {totalPages}</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 space-y-3">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            <p>Loading historical records...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <AlertCircle className="mx-auto h-8 w-8 text-slate-600" />
            <p className="text-sm font-semibold text-slate-300">No inference records found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No analyses match your current search or category filters. Try resetting the filters or run a new inquiry from the AI Studio.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 pl-1">Inference ID</th>
                  <th className="py-3">Model</th>
                  <th className="py-3">Prompt / Summary</th>
                  <th className="py-3">Latency</th>
                  <th className="py-3">Tokens</th>
                  <th className="py-3">Confidence</th>
                  <th className="py-3">Sentiment</th>
                  <th className="py-3 pr-1 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="py-3.5 pl-1 font-mono font-bold text-blue-400 whitespace-nowrap">
                      {item.code}
                    </td>
                    <td className="py-3.5 font-medium text-slate-200 whitespace-nowrap">
                      {item.modelName}
                    </td>
                    <td className="py-3.5 max-w-sm truncate text-slate-300">
                      {item.summary || item.prompt}
                    </td>
                    <td className="py-3.5 font-mono text-slate-400 whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-500" />
                        {item.latencyMs}ms
                      </span>
                    </td>
                    <td className="py-3.5 font-mono text-slate-400 whitespace-nowrap">
                      {item.tokensUsed}
                    </td>
                    <td className="py-3.5 font-semibold text-white whitespace-nowrap">
                      {item.confidenceScore}%
                    </td>
                    <td className="py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          item.sentiment === "Positive"
                            ? "bg-emerald-950/70 text-emerald-400 border border-emerald-800/50"
                            : item.sentiment === "Critical"
                            ? "bg-rose-950/70 text-rose-400 border border-rose-800/50"
                            : "bg-amber-950/70 text-amber-400 border border-amber-800/50"
                        }`}
                      >
                        {item.sentiment}
                      </span>
                    </td>
                    <td className="py-3.5 pr-1 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedRecord(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-800/60 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-blue-600 hover:text-white transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-[#0B0F19] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Previous
            </button>

            <span className="text-xs text-slate-400">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-[#0B0F19] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Record Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#0D1322] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-blue-950/80 px-2 py-0.5 font-mono text-xs font-bold text-blue-300 border border-blue-800/60">
                  {selectedRecord.code}
                </span>
                <span className="text-xs text-slate-400">
                  {selectedRecord.modelName} • {selectedRecord.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyRecord(selectedRecord)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                  title="Copy JSON Payload"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Prompt Section */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Inquiry Prompt</span>
              <p className="mt-1 rounded-xl border border-slate-800/90 bg-[#0B0F19] p-3 text-xs text-slate-200 font-mono leading-relaxed">
                {selectedRecord.prompt}
              </p>
            </div>

            {/* Metrics Capsule */}
            <div className="grid grid-cols-3 gap-3 rounded-xl border border-slate-800 bg-[#111827] p-3 text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Latency</span>
                <span className="text-sm font-bold text-white">{selectedRecord.latencyMs}ms</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Tokens Billed</span>
                <span className="text-sm font-bold text-blue-400">{selectedRecord.tokensUsed}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Confidence</span>
                <span className="text-sm font-bold text-emerald-400">{selectedRecord.confidenceScore}%</span>
              </div>
            </div>

            {/* Summary */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Synthesized Summary</span>
              <p className="mt-1 text-xs text-slate-200 leading-relaxed font-medium">
                {selectedRecord.summary}
              </p>
            </div>

            {/* Key Insights */}
            {selectedRecord.keyInsights && selectedRecord.keyInsights.length > 0 && (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Key Insights
                </span>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-300">
                  {selectedRecord.keyInsights.map((insight, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-400 font-bold">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {selectedRecord.recommendations && selectedRecord.recommendations.length > 0 && (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-400" /> Actionable Recommendations
                </span>
                <div className="mt-2 space-y-1.5">
                  {selectedRecord.recommendations.map((rec, idx) => (
                    <div key={idx} className="rounded-lg bg-blue-950/20 p-2 text-xs text-slate-200 border border-blue-900/40">
                      {idx + 1}. {rec}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {selectedRecord.extractedEntities && selectedRecord.extractedEntities.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800">
                <Tag className="h-3.5 w-3.5 text-slate-500" />
                {selectedRecord.extractedEntities.map((tag, idx) => (
                  <span key={idx} className="rounded-md bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedRecord(null)}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
