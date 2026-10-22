"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  CheckCircle2,
  Clock,
  Target,
  Layers,
  Sparkles,
  RefreshCw,
  Star
} from "lucide-react";
import type { ModelRecord } from "@/lib/types";

export default function ModelsSection() {
  const [models, setModels] = useState<ModelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [defaultId, setDefaultId] = useState<string>("mod-1");
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/models");
      const json = await res.json();
      if (json.success && json.data) {
        setModels(json.data);
        const def = json.data.find((m: ModelRecord) => m.isDefault);
        if (def) setDefaultId(def.id);
      }
    } catch (err) {
      console.error("Failed to fetch models:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleSetDefault = (id: string, name: string) => {
    setDefaultId(id);
    setFeedback(`'${name}' is now active as primary inference model.`);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-950/80 p-3.5 text-xs font-semibold text-emerald-300 border border-emerald-800/60 shadow-lg animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Cpu className="h-5 w-5 text-blue-400" />
            AI Model Registry & Benchmarks
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Active neural weights, parameter context windows, benchmark latency, and precision ratings
          </p>
        </div>

        <button
          onClick={fetchModels}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-[#111827] px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Grid of Model Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400 space-y-3">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            <p>Loading model registry...</p>
          </div>
        ) : (
          models.map((model) => {
            const isSelected = model.id === defaultId;
            return (
              <div
                key={model.id}
                className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border p-6 shadow-md transition-all ${
                  isSelected
                    ? "border-blue-500/80 bg-gradient-to-b from-blue-950/30 via-[#111827] to-[#111827] shadow-blue-500/10"
                    : "border-slate-800 bg-[#111827]/90 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/70 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800/60">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {model.status}
                    </span>

                    <span className="rounded-md bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400">
                      v{model.version}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white tracking-tight">{model.name}</h3>
                    {isSelected && (
                      <span className="rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 text-[10px] font-bold">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{model.provider}</p>
                  <p className="text-xs text-slate-300 mt-3 leading-relaxed">{model.description}</p>
                </div>

                {/* Metrics Breakdown */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-[#0B0F19] p-2 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">Context</span>
                      <span className="text-xs font-bold text-white">
                        {(model.contextWindow / 1000).toFixed(0)}k
                      </span>
                    </div>

                    <div className="rounded-xl bg-[#0B0F19] p-2 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">Latency</span>
                      <span className="text-xs font-bold text-emerald-400">
                        {model.avgLatencyMs}ms
                      </span>
                    </div>

                    <div className="rounded-xl bg-[#0B0F19] p-2 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">Accuracy</span>
                      <span className="text-xs font-bold text-blue-400">
                        {model.accuracyRate}%
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSetDefault(model.id, model.name)}
                    disabled={isSelected}
                    className={`w-full flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-blue-600/20 text-blue-300 border border-blue-500/30 cursor-default"
                        : "border border-slate-800 bg-[#0B0F19] text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Star className={`h-3.5 w-3.5 ${isSelected ? "fill-blue-400 text-blue-400" : ""}`} />
                    {isSelected ? "Active Default Model" : "Set as Default"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
