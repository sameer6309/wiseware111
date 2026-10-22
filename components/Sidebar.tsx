"use client";

import React from "react";
import {
  LayoutDashboard,
  Sparkles,
  Cpu,
  BarChart3,
  Layers,
  Settings,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  X,
  History,
  FileText,
  Building2,
  CreditCard,
  PlusCircle,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  creditsBalance?: number | null;
  onOpenCreditsModal?: () => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  creditsBalance,
  onOpenCreditsModal,
}: SidebarProps) {
  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "analysis", label: "AI Analysis Studio", icon: Sparkles, badge: "Live" },
    { id: "enrichment", label: "Business Enrichment", icon: Building2, badge: "AgentSource" },
    { id: "history", label: "Analysis History", icon: History },
    { id: "workflows", label: "Automated Workflows", icon: Layers },
    { id: "models", label: "Model Registry", icon: Cpu },
    { id: "metrics", label: "Usage Metrics", icon: BarChart3 },
    { id: "logs", label: "Activity Logs", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col border-r border-slate-800 bg-[#0D1322] text-slate-200 backdrop-blur-md transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-20 shrink-0 items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-violet-600 shadow-md shadow-blue-500/30">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-blue-100 to-violet-200 bg-clip-text text-transparent truncate">
                  Wiseware AI
                </span>
                <span className="shrink-0 rounded-md bg-blue-950/80 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-800/60">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                Enterprise Intelligence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Main Platform
          </div>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md shadow-blue-600/30 font-semibold"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-105 ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge ? (
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-emerald-950/70 text-emerald-400 border border-emerald-800/50"
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : (
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 ${
                      isActive ? "opacity-100 text-white/80" : "text-slate-500"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Credits / Quota Card */}
        <div className="p-4 shrink-0 border-t border-slate-800 space-y-3">
          <button
            type="button"
            onClick={onOpenCreditsModal}
            className="w-full text-left rounded-xl border border-blue-900/50 bg-[#111827] p-3.5 hover:border-blue-700/80 hover:bg-[#161f33] transition-all group cursor-pointer shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-blue-300 flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-blue-400 group-hover:scale-110 transition-transform" />
                Credits Balance
              </span>
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                <PlusCircle className="h-3 w-3" />
                Top-Up
              </span>
            </div>

            <div className="flex items-baseline justify-between mb-2">
              <span className="text-lg font-extrabold text-white tracking-tight">
                {creditsBalance !== null && creditsBalance !== undefined
                  ? creditsBalance.toLocaleString()
                  : "2,500"}
              </span>
              <span className="text-[10px] uppercase font-mono text-blue-300">
                Enterprise
              </span>
            </div>

            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      10,
                      ((creditsBalance ?? 2500) / 10000) * 100
                    )
                  )}%`,
                }}
              />
            </div>
            <p className="mt-2 text-[11px] text-slate-400 group-hover:text-blue-200 transition-colors flex items-center justify-between">
              <span>View ledger & add credits</span>
              <span className="text-blue-400 font-bold">→</span>
            </p>
          </button>

          {/* User profile capsule */}
          <div className="flex items-center justify-between rounded-xl p-2 bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-700 to-violet-700 text-white font-bold text-xs shadow-sm">
                WA
              </div>
              <div className="min-w-0 text-left">
                <p className="text-xs font-semibold text-slate-200 truncate">
                  Wiseware Workspace
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  admin@wiseware.ai
                </p>
              </div>
            </div>
            <HelpCircle className="h-4 w-4 shrink-0 text-slate-500 hover:text-slate-300 cursor-pointer" />
          </div>
        </div>
      </aside>
    </>
  );
}
