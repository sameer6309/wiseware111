"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import OverviewCards from "@/components/OverviewCards";
import AIAnalysisSection from "@/components/AIAnalysisSection";
import RecentActivity from "@/components/RecentActivity";
import HistorySection from "@/components/HistorySection";
import WorkflowsSection from "@/components/WorkflowsSection";
import ModelsSection from "@/components/ModelsSection";
import UsageMetricsSection from "@/components/UsageMetricsSection";
import ActivityLogsSection from "@/components/ActivityLogsSection";
import SettingsSection from "@/components/SettingsSection";
import BusinessEnrichmentSection from "@/components/BusinessEnrichmentSection";
import CreditsModal from "@/components/CreditsModal";
import type { AnalysisResponse } from "@/app/api/analyze/route";
import { Sparkles, ArrowRight, ShieldCheck, CreditCard } from "lucide-react";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisResponse[]>([]);
  const [aiStudioPrompt, setAiStudioPrompt] = useState("");
  const [aiStudioCategory, setAiStudioCategory] = useState("System Optimization");
  const [creditsModalOpen, setCreditsModalOpen] = useState(false);
  const [creditsBalance, setCreditsBalance] = useState<number | null>(null);

  const fetchCreditsBalance = async () => {
    try {
      const res = await fetch("/api/credits");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.account) {
          setCreditsBalance(json.data.account.balance);
        }
      }
    } catch (err) {
      console.error("[Dashboard] Error fetching credit balance:", err);
    }
  };

  React.useEffect(() => {
    fetchCreditsBalance();
  }, []);

  const handleAnalysisComplete = (newResult: AnalysisResponse) => {
    setRecentAnalyses((prev) => [newResult, ...prev]);
    if (newResult.creditsRemaining !== undefined) {
      setCreditsBalance(newResult.creditsRemaining);
    } else {
      fetchCreditsBalance();
    }
  };

  const handleSendToAIStudio = (prompt: string, category: string) => {
    setAiStudioPrompt(prompt);
    setAiStudioCategory(category);
    setActiveTab("analysis");
  };

  return (
    <div className="flex min-h-screen bg-[#0B0F19] font-sans text-slate-100 antialiased">
      {/* Responsive Left Navigation Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        creditsBalance={creditsBalance}
        onOpenCreditsModal={() => setCreditsModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-x-hidden min-w-0">
        {/* Top Header Navbar */}
        <Navbar
          onMenuToggle={() => setSidebarOpen(true)}
          onNewAnalysisClick={() => setActiveTab("analysis")}
          activeTab={activeTab}
          onSearchSubmit={() => setActiveTab("history")}
          creditsBalance={creditsBalance}
          onOpenCreditsModal={() => setCreditsModalOpen(true)}
        />

        {/* Dashboard Main Scrollable Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl w-full mx-auto">
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-fadeIn">
              {/* Welcome Hero Banner */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-violet-950 p-6 sm:p-8 text-white shadow-xl border border-blue-500/20">
                <div className="relative z-10 max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-3 border border-white/10">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
                    <span>Wiseware AI Operational Suite</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Welcome back to your AI Intelligence Hub
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
                    Monitor real-time inferences, benchmark model latency, and run predictive semantic analyses powered by our full-stack App Router engine and Supabase PostgreSQL.
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setActiveTab("analysis")}
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-indigo-900 shadow-sm hover:bg-indigo-50 transition-all active:scale-95"
                    >
                      Launch Analysis Studio
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setCreditsModalOpen(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-950/80 border border-indigo-400/30 px-3.5 py-2 text-xs font-bold text-indigo-100 hover:bg-indigo-900/90 transition-all active:scale-95 cursor-pointer"
                    >
                      <CreditCard className="h-3.5 w-3.5 text-indigo-300" />
                      <span>Credits: {creditsBalance !== null && creditsBalance !== undefined ? creditsBalance.toLocaleString() : "2,500"}</span>
                    </button>
                    <div className="flex items-center gap-2 text-xs text-indigo-200">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      <span>Next.js 16 • Supabase PostgreSQL • Prisma ORM</span>
                    </div>
                  </div>
                </div>

                {/* Decorative background vectors */}
                <div className="absolute right-0 top-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
                <div className="absolute right-24 bottom-0 -mb-16 h-48 w-48 rounded-full bg-violet-400/20 blur-2xl pointer-events-none" />
              </div>

              {/* Section 1: Overview Metric Cards */}
              <section aria-label="Key Performance Indicators">
                <OverviewCards onNavigateTab={(tab) => setActiveTab(tab)} />
              </section>

              {/* Section 2: AI Analysis Interactive Playground */}
              <section aria-label="Interactive AI Analysis">
                <AIAnalysisSection onAnalysisComplete={handleAnalysisComplete} />
              </section>

              {/* Section 3: Recent Activity & Audit Logs */}
              <section aria-label="Recent Inference Logs">
                <RecentActivity
                  recentItems={recentAnalyses}
                  onViewAll={() => setActiveTab("history")}
                />
              </section>
            </div>
          )}

          {/* TAB 2: AI ANALYSIS STUDIO */}
          {activeTab === "analysis" && (
            <div className="space-y-6 animate-fadeIn">
              <AIAnalysisSection
                onAnalysisComplete={handleAnalysisComplete}
                initialPrompt={aiStudioPrompt}
                initialCategory={aiStudioCategory}
              />
            </div>
          )}

          {/* TAB: B2B BUSINESS ENRICHMENT (EXPLORIUM AGENTSOURCE) */}
          {activeTab === "enrichment" && (
            <div className="space-y-6 animate-fadeIn">
              <BusinessEnrichmentSection onSendToAIStudio={handleSendToAIStudio} />
            </div>
          )}

          {/* TAB 3: ANALYSIS HISTORY */}
          {activeTab === "history" && (
            <div className="space-y-6 animate-fadeIn">
              <HistorySection />
            </div>
          )}

          {/* TAB 4: AUTOMATED WORKFLOWS */}
          {activeTab === "workflows" && (
            <div className="space-y-6 animate-fadeIn">
              <WorkflowsSection />
            </div>
          )}

          {/* TAB 5: MODEL REGISTRY */}
          {activeTab === "models" && (
            <div className="space-y-6 animate-fadeIn">
              <ModelsSection />
            </div>
          )}

          {/* TAB 6: USAGE METRICS */}
          {activeTab === "metrics" && (
            <div className="space-y-6 animate-fadeIn">
              <UsageMetricsSection />
            </div>
          )}

          {/* TAB 7: ACTIVITY LOGS */}
          {activeTab === "logs" && (
            <div className="space-y-6 animate-fadeIn">
              <ActivityLogsSection />
            </div>
          )}

          {/* TAB 8: SETTINGS */}
          {activeTab === "settings" && (
            <div className="space-y-6 animate-fadeIn">
              <SettingsSection />
            </div>
          )}
        </main>

        {/* Dashboard Footer */}
        <footer className="mt-auto border-t border-slate-800 bg-[#0D1322]/80 px-6 py-4 text-center text-xs text-slate-400">
          <p>© 2026 Wiseware AI. Full-Stack Enterprise Platform built with Next.js 16, TypeScript, Supabase PostgreSQL, and Prisma ORM.</p>
        </footer>
      </div>

      {/* Credit Management & Transaction Ledger Modal */}
      <CreditsModal
        isOpen={creditsModalOpen}
        onClose={() => setCreditsModalOpen(false)}
        onCreditsUpdated={(newBal) => setCreditsBalance(newBal)}
      />
    </div>
  );
}
