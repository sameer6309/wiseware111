"use client";

import React, { useState } from "react";
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  CheckCircle2,
  X,
  Sun,
  Moon,
  CreditCard
} from "lucide-react";
import { useTheme } from "@/lib/theme";

interface NavbarProps {
  onMenuToggle: () => void;
  onNewAnalysisClick: () => void;
  activeTab?: string;
  onSearchSubmit?: (query: string) => void;
  creditsBalance?: number | null;
  onOpenCreditsModal?: () => void;
}

export default function Navbar({
  onMenuToggle,
  onNewAnalysisClick,
  activeTab = "dashboard",
  onSearchSubmit,
  creditsBalance,
  onOpenCreditsModal,
}: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Model weights synchronized",
      description: "Wiseware Neural-v4 latency updated to 48ms.",
      read: false,
    },
    {
      id: 2,
      title: "Weekly token report ready",
      description: "12% optimization achieved across endpoints.",
      read: false,
    },
  ]);
  const [searchQuery, setSearchQuery] = useState("");

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: "AI Command Center",
      subtitle: "Real-time inference telemetry and automated predictive reasoning",
    },
    analysis: {
      title: "AI Analysis Studio",
      subtitle: "Interactive prompt testing and model synthesis engine",
    },
    enrichment: {
      title: "B2B Entity Enrichment",
      subtitle: "Explorium AgentSource firmographics, technographics, and verified company intelligence",
    },
    history: {
      title: "Inference History",
      subtitle: "Searchable audit repository of historical queries and outputs",
    },
    workflows: {
      title: "Automated Workflows",
      subtitle: "Autonomous event triggers and scheduled pipeline orchestrations",
    },
    models: {
      title: "Model Registry",
      subtitle: "Benchmark latency, context windows, and operational states",
    },
    metrics: {
      title: "Usage Metrics",
      subtitle: "Token throughput, quotas, and response time distributions",
    },
    logs: {
      title: "Activity Logs",
      subtitle: "System-wide diagnostic audit stream and exception tracking",
    },
    settings: {
      title: "Platform Settings",
      subtitle: "Configure Supabase PostgreSQL, provider keys, and system parameters",
    },
  };

  const currentTabInfo = tabTitles[activeTab] || tabTitles.dashboard;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleClearNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearchSubmit && searchQuery.trim()) {
      onSearchSubmit(searchQuery.trim());
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full shrink-0 items-center justify-between border-b border-slate-800 bg-[#0D1322]/90 px-4 sm:px-8 backdrop-blur-md text-slate-100 transition-colors">
      {/* Left section: Hamburger button & page title */}
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white truncate">
              {currentTabInfo.title}
            </h1>
            <span className="hidden sm:inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-950/70 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-800/60">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Engine
            </span>
          </div>
          <p className="hidden sm:block text-xs text-slate-400 truncate">
            {currentTabInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right section: Search bar, Notifications & Action CTA */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Search input bar */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search records, models, logs..."
            className="h-10 w-64 rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-9 text-xs font-medium text-slate-200 placeholder-slate-500 transition-all focus:border-blue-500 focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 shadow-2xs">
            ↵
          </kbd>
        </div>

        {/* Theme Mode Toggle */}
        <button
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white transition-all active:scale-95"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400 transition-transform hover:rotate-45" />
          ) : (
            <Moon className="h-4 w-4 text-indigo-400 transition-transform hover:-rotate-12" />
          )}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            title="Notifications"
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-800 bg-[#0D1322] p-4 shadow-2xl z-50 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-xs font-bold text-white">System Alerts</span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleClearNotifications}
                      className="text-[10px] text-blue-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  <span className="rounded-md bg-blue-950 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-900/50">
                    {unreadCount} New
                  </span>
                </div>
              </div>

              <div className="mt-3 space-y-2.5">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-2.5 rounded-lg p-2 hover:bg-slate-800/50 transition-colors"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{n.title}</p>
                      <p className="text-[11px] text-slate-400">{n.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Credit Balance Pill Button */}
        <button
          type="button"
          onClick={onOpenCreditsModal}
          title="Open Credits Management & Ledger"
          className="flex items-center gap-1.5 rounded-xl border border-blue-900/60 bg-blue-950/40 px-3 py-2 text-xs font-semibold text-blue-300 hover:border-blue-600 hover:bg-blue-900/50 hover:text-white transition-all active:scale-95 shadow-xs shrink-0 cursor-pointer"
        >
          <CreditCard className="h-3.5 w-3.5 text-blue-400" />
          <span className="font-bold text-white">
            {creditsBalance !== null && creditsBalance !== undefined
              ? creditsBalance.toLocaleString()
              : "2,500"}
          </span>
          <span className="hidden sm:inline text-[10px] text-blue-300 font-medium">Credits</span>
        </button>

        {/* Primary Action Button */}
        <button
          onClick={onNewAnalysisClick}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-600/30 transition-all hover:from-blue-500 hover:to-violet-500 hover:shadow-lg active:scale-95 shrink-0"
        >
          <Sparkles className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">Start AI Analysis</span>
          <span className="sm:hidden">Analyze</span>
        </button>
      </div>
    </header>
  );
}
