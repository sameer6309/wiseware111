"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Filter,
  RefreshCw,
  AlertTriangle,
  Info,
  AlertCircle,
  Bug,
  ChevronDown,
  ChevronRight,
  Clock
} from "lucide-react";
import type { SystemLogRecord } from "@/lib/types";

export default function ActivityLogsSection() {
  const [logs, setLogs] = useState<SystemLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState("ALL");
  const [source, setSource] = useState("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (level !== "ALL") params.set("level", level);
      if (source !== "ALL") params.set("source", source);
      params.set("limit", "50");

      const res = await fetch(`/api/logs?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setLogs(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoading(false);
    }
  }, [level, source]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getLevelBadge = (lvl: SystemLogRecord["level"]) => {
    switch (lvl) {
      case "ERROR":
        return {
          icon: AlertCircle,
          className: "bg-rose-950/70 text-rose-400 border border-rose-800/60",
        };
      case "WARN":
        return {
          icon: AlertTriangle,
          className: "bg-amber-950/70 text-amber-400 border border-amber-800/60",
        };
      case "DEBUG":
        return {
          icon: Bug,
          className: "bg-purple-950/70 text-purple-400 border border-purple-800/60",
        };
      default:
        return {
          icon: Info,
          className: "bg-blue-950/70 text-blue-400 border border-blue-800/60",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-400" />
            Audit & System Activity Logs
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time audit stream of engine dispatches, database connections, and scheduler runs
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-[#111827] px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Stream
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800 bg-[#111827]/90 p-4 shadow-md text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Filter className="h-3.5 w-3.5" />
          <span>Severity:</span>
        </div>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="rounded-xl border border-slate-800 bg-[#0B0F19] px-3 py-1.5 font-semibold text-slate-200 focus:border-blue-500 focus:outline-hidden"
        >
          <option value="ALL">All Severities</option>
          <option value="INFO">INFO</option>
          <option value="WARN">WARN</option>
          <option value="ERROR">ERROR</option>
          <option value="DEBUG">DEBUG</option>
        </select>

        <div className="flex items-center gap-1.5 text-slate-400 ml-2">
          <span>Component:</span>
        </div>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="rounded-xl border border-slate-800 bg-[#0B0F19] px-3 py-1.5 font-semibold text-slate-200 focus:border-blue-500 focus:outline-hidden"
        >
          <option value="ALL">All Components</option>
          <option value="Engine">Engine</option>
          <option value="API">API Gateway</option>
          <option value="Database">Database</option>
          <option value="Scheduler">Scheduler</option>
          <option value="Auth">Auth Layer</option>
        </select>

        <span className="ml-auto text-slate-500">
          Showing {logs.length} logged events
        </span>
      </div>

      {/* Logs Container */}
      <div className="rounded-2xl border border-slate-800 bg-[#111827]/90 p-6 shadow-md overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 space-y-3">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            <p>Fetching audit stream...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Info className="mx-auto h-7 w-7 text-slate-600" />
            <p className="text-sm font-semibold text-slate-300">No logs found matching filter</p>
            <p className="text-xs text-slate-500">Clear filters to view all recorded operational events.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {logs.map((log) => {
              const badge = getLevelBadge(log.level);
              const Icon = badge.icon;
              const isExpanded = expandedId === log.id;
              const hasMetadata = log.metadata && Object.keys(log.metadata).length > 0;

              return (
                <div key={log.id} className="py-3.5 hover:bg-slate-800/30 transition-colors px-2 rounded-xl">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold shrink-0 mt-0.5 ${badge.className}`}>
                        <Icon className="h-3 w-3" />
                        {log.level}
                      </span>

                      <span className="rounded-md bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-400 shrink-0 mt-0.5">
                        {log.source}
                      </span>

                      <p className="text-xs text-slate-200 font-medium leading-relaxed">
                        {log.message}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-500" />
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>

                      {hasMetadata && (
                        <button
                          onClick={() => toggleExpand(log.id)}
                          className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                          title="Toggle JSON payload"
                        >
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Metadata JSON */}
                  {isExpanded && hasMetadata && (
                    <div className="mt-2.5 ml-9 rounded-xl border border-slate-800 bg-[#0B0F19] p-3 text-[11px] font-mono text-slate-300 overflow-x-auto">
                      <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
