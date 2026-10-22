"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Plus,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  X,
  Loader2,
  RefreshCw
} from "lucide-react";
import type { WorkflowRecord } from "@/lib/types";

export default function WorkflowsSection() {
  const [workflows, setWorkflows] = useState<WorkflowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // New Workflow form state
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTriggerType, setNewTriggerType] = useState<WorkflowRecord["triggerType"]>("EVENT");
  const [newSchedule, setNewSchedule] = useState("Real-time Event Stream");
  const [newStepsCount, setNewStepsCount] = useState(3);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/workflows");
      const json = await res.json();
      if (json.success && json.data) {
        setWorkflows(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch workflows:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const handleToggleStatus = async (wf: WorkflowRecord) => {
    const nextStatus = wf.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    try {
      const res = await fetch(`/api/workflows/${wf.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setWorkflows((prev) =>
          prev.map((w) => (w.id === wf.id ? { ...w, status: nextStatus } : w))
        );
        showToast(`Workflow '${wf.name}' status changed to ${nextStatus}.`);
      }
    } catch (err) {
      console.error("Failed to toggle workflow status:", err);
    }
  };

  const handleTriggerRun = async (wf: WorkflowRecord) => {
    try {
      const res = await fetch(`/api/workflows/${wf.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trigger" }),
      });
      const json = await res.json();
      if (json.success) {
        const now = new Date().toISOString();
        setWorkflows((prev) =>
          prev.map((w) =>
            w.id === wf.id ? { ...w, lastRunAt: now, lastStatus: "SUCCESS" } : w
          )
        );
        showToast(`Workflow '${wf.name}' execution triggered successfully.`);
      }
    } catch (err) {
      console.error("Failed to trigger workflow run:", err);
    }
  };

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setFormError("Workflow name is required.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDescription.trim() || undefined,
          triggerType: newTriggerType,
          schedule: newSchedule,
          stepsCount: Number(newStepsCount),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create workflow.");
      }

      setWorkflows((prev) => [json.data, ...prev]);
      setIsModalOpen(false);
      setNewName("");
      setNewDescription("");
      showToast(`Workflow '${json.data.name}' created and activated.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create workflow.";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const showToast = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Action Notification Toast */}
      {actionSuccessMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-950/80 p-3.5 text-xs font-semibold text-emerald-300 border border-emerald-800/60 shadow-lg animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-400" />
            Automated AI Workflows
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Orchestrate scheduled evaluations, reactive latency alerts, and autonomous key rotation pipelines
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchWorkflows}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-[#111827] px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:from-blue-500 hover:to-violet-500 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Create Workflow
          </button>
        </div>
      </div>

      {/* Main List */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400 space-y-3">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            <p>Loading workflows...</p>
          </div>
        ) : workflows.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-slate-800 bg-[#111827]/90 p-12 text-center space-y-3">
            <AlertCircle className="mx-auto h-8 w-8 text-slate-600" />
            <p className="text-sm font-semibold text-slate-300">No active workflows defined</p>
            <p className="text-xs text-slate-500">
              Create your first automated workflow to orchestrate recurring model tasks.
            </p>
          </div>
        ) : (
          workflows.map((wf) => (
            <div
              key={wf.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#111827]/90 p-6 shadow-md transition-all hover:border-slate-700"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      wf.status === "ACTIVE"
                        ? "bg-emerald-950/70 text-emerald-400 border border-emerald-800/60"
                        : "bg-amber-950/70 text-amber-400 border border-amber-800/60"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        wf.status === "ACTIVE" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                      }`}
                    />
                    {wf.status}
                  </span>

                  <span className="rounded-md bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400">
                    {wf.triggerType}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white tracking-tight">{wf.name}</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{wf.description}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-500" />
                    {wf.schedule}
                  </span>
                  <span>{wf.stepsCount} steps sequence</span>
                </div>

                {wf.lastRunAt && (
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Last executed: {new Date(wf.lastRunAt).toLocaleTimeString()}</span>
                    <span className="text-emerald-400 font-semibold">{wf.lastStatus}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => handleToggleStatus(wf)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-[#0B0F19] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    {wf.status === "ACTIVE" ? (
                      <>
                        <Pause className="h-3.5 w-3.5 text-amber-400" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 text-emerald-400" /> Activate
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleTriggerRun(wf)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600/20 text-blue-300 border border-blue-500/30 px-3 py-1.5 text-xs font-semibold hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                  >
                    <Play className="h-3.5 w-3.5" /> Run Now
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Workflow Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0D1322] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-400" />
                Configure New Workflow
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkflow} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Workflow Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Model Latency Spike Auto-Remediation"
                  className="w-full rounded-xl border border-slate-800 bg-[#0B0F19] p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Outline purpose, trigger condition, and corrective action..."
                  className="w-full rounded-xl border border-slate-800 bg-[#0B0F19] p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-hidden resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Trigger Type
                  </label>
                  <select
                    value={newTriggerType}
                    onChange={(e) => setNewTriggerType(e.target.value as WorkflowRecord["triggerType"])}
                    className="w-full rounded-xl border border-slate-800 bg-[#0B0F19] p-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="EVENT">Event Stream</option>
                    <option value="SCHEDULE">Scheduled Cron</option>
                    <option value="MANUAL">Manual Trigger</option>
                    <option value="WEBHOOK">Inbound Webhook</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Steps Count
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newStepsCount}
                    onChange={(e) => setNewStepsCount(parseInt(e.target.value, 10))}
                    className="w-full rounded-xl border border-slate-800 bg-[#0B0F19] p-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Schedule / Condition
                </label>
                <input
                  type="text"
                  value={newSchedule}
                  onChange={(e) => setNewSchedule(e.target.value)}
                  placeholder="e.g. Every 12 hours or When P99 Latency > 200ms"
                  className="w-full rounded-xl border border-slate-800 bg-[#0B0F19] p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {formError && (
                <div className="rounded-xl bg-rose-950/40 p-2.5 text-xs text-rose-300 border border-rose-900/50">
                  {formError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:from-blue-500 hover:to-violet-500 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Deploy Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
