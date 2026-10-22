"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CreditCard,
  PlusCircle,
  RefreshCw,
  History,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  Zap,
  Sparkles,
  Search,
  CheckCircle2,
  Building2,
  Cpu,
} from "lucide-react";
import type { CreditAccount, CreditTransactionRecord } from "@/lib/types";

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreditsUpdated?: (newBalance: number) => void;
}

export default function CreditsModal({
  isOpen,
  onClose,
  onCreditsUpdated,
}: CreditsModalProps) {
  const [account, setAccount] = useState<CreditAccount | null>(null);
  const [transactions, setTransactions] = useState<CreditTransactionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [recharging, setRecharging] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<number>(5000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const bundles = [
    {
      amount: 1000,
      label: "Starter Bundle",
      description: "Ideal for light inference & testing",
      badge: "Popular",
      testPrice: "$10 (Simulated)",
    },
    {
      amount: 5000,
      label: "Growth Bundle",
      description: "Best for active teams & enrichment",
      badge: "Best Value",
      testPrice: "$45 (Simulated)",
    },
    {
      amount: 25000,
      label: "Enterprise Pack",
      description: "High-volume pipelines & batch jobs",
      badge: "Scale",
      testPrice: "$190 (Simulated)",
    },
  ];

  const fetchCredits = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/credits");
      if (!res.ok) throw new Error("Failed to load credits");
      const json = await res.json();
      if (json.success && json.data) {
        setAccount(json.data.account);
        setTransactions(json.data.transactions || []);
        if (onCreditsUpdated && json.data.account?.balance !== undefined) {
          onCreditsUpdated(json.data.account.balance);
        }
      }
    } catch (err: unknown) {
      console.error("[CreditsModal] Error fetching credit status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCredits();
    }
  }, [isOpen]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRecharge = async (amountToRecharge: number) => {
    if (amountToRecharge <= 0) {
      showToast("Please select or enter a valid positive credit amount.", "error");
      return;
    }

    try {
      setRecharging(true);
      const idempotencyKey = `topup-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const res = await fetch("/api/credits/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountToRecharge,
          category: "TEST_PURCHASE",
          description: `Test Mode Credit Top-Up (+${amountToRecharge.toLocaleString()})`,
          idempotencyKey,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to process recharge");
      }

      setAccount(json.data.account);
      if (json.data.transaction) {
        setTransactions((prev) => [json.data.transaction, ...prev]);
      }
      if (onCreditsUpdated && json.data.account?.balance !== undefined) {
        onCreditsUpdated(json.data.account.balance);
      }

      showToast(`Successfully added +${amountToRecharge.toLocaleString()} credits in test mode!`, "success");
      setCustomAmount("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Recharge error";
      showToast(msg, "error");
    } finally {
      setRecharging(false);
    }
  };

  if (!isOpen) return null;

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === "ADD" && tx.type !== "ADD") return false;
    if (filterType === "DEDUCT" && tx.type !== "DEDUCT") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDesc = tx.description.toLowerCase().includes(q);
      const matchCat = tx.category.toLowerCase().includes(q);
      const matchId = tx.id.toLowerCase().includes(q);
      return matchDesc || matchCat || matchId;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl rounded-3xl border border-slate-800 bg-[#0D1322] text-slate-100 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-violet-600 shadow-md shadow-blue-500/20">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Wiseware Credit Management & Ledger
                </h2>
                <span className="rounded-full bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800/60">
                  Test Mode Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Monitor balance, audit transactions, and recharge test credits safely
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Toast Alert */}
          {toastMessage && (
            <div
              className={`flex items-center justify-between rounded-xl p-3.5 text-xs font-semibold shadow-lg transition-all ${
                toastType === "success"
                  ? "bg-emerald-950/90 text-emerald-300 border border-emerald-800"
                  : "bg-rose-950/90 text-rose-300 border border-rose-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {toastType === "success" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
                )}
                <span>{toastMessage}</span>
              </div>
              <button
                onClick={() => setToastMessage(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>
          )}

          {/* Balance Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* Primary Balance */}
            <div className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-950/60 via-indigo-950/40 to-slate-900/80 p-4 shadow-lg sm:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-300 flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-amber-400" />
                  Available Credit Balance
                </span>
                <button
                  onClick={fetchCredits}
                  disabled={loading}
                  title="Refresh balance"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-blue-400" : ""}`} />
                </button>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {account ? account.balance.toLocaleString() : "..."}
                </span>
                <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                  Credits
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                1 Credit = 1 Token compute unit. Inferences cost 25 credits, live enrichment costs 100 credits.
              </p>
            </div>

            {/* Total Recharged */}
            <div className="rounded-2xl border border-slate-800 bg-[#111827] p-4 shadow-sm">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" />
                Total Recharged
              </span>
              <div className="mt-3 text-2xl font-bold text-slate-100">
                {account ? account.totalAdded.toLocaleString() : "..."}
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Cumulative test-mode grants</p>
            </div>

            {/* Total Consumed */}
            <div className="rounded-2xl border border-slate-800 bg-[#111827] p-4 shadow-sm">
              <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                <TrendingDown className="h-4 w-4" />
                Total Used
              </span>
              <div className="mt-3 text-2xl font-bold text-slate-100">
                {account ? account.totalUsed.toLocaleString() : "..."}
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Inference & enrichment jobs</p>
            </div>
          </div>

          {/* Test Mode Top-Up Section */}
          <div className="rounded-2xl border border-slate-800 bg-[#111827]/70 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  Instant Test-Mode Recharge
                </h3>
                <p className="text-xs text-slate-400">
                  Simulates safe atomic transactions without charging real payment cards or consuming paid credits.
                </p>
              </div>
              <span className="self-start sm:self-auto rounded-lg bg-blue-950/60 px-2.5 py-1 text-[11px] font-semibold text-blue-300 border border-blue-800/40">
                Idempotency Protected
              </span>
            </div>

            {/* Bundles Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {bundles.map((bundle) => {
                const isSelected = selectedBundle === bundle.amount && !customAmount;
                return (
                  <button
                    key={bundle.amount}
                    type="button"
                    onClick={() => {
                      setSelectedBundle(bundle.amount);
                      setCustomAmount("");
                    }}
                    className={`relative flex flex-col items-start rounded-xl p-3.5 text-left border transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-950/40 text-white shadow-md shadow-blue-500/10 ring-1 ring-blue-500"
                        : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{bundle.label}</span>
                      <span className="rounded-md bg-blue-900/60 px-1.5 py-0.5 text-[9px] font-bold text-blue-300">
                        {bundle.badge}
                      </span>
                    </div>
                    <div className="text-lg font-extrabold text-blue-400">
                      +{bundle.amount.toLocaleString()}{" "}
                      <span className="text-xs font-normal text-slate-400">credits</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">{bundle.description}</p>
                    <span className="mt-2 text-[10px] font-mono text-emerald-400 font-semibold">
                      {bundle.testPrice}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Actions: Custom Amount & Recharge Button */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <div className="relative flex-1 w-full">
                <input
                  type="number"
                  min="100"
                  max="100000"
                  step="100"
                  placeholder="Or enter custom credits (e.g. 2500)..."
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                type="button"
                disabled={recharging}
                onClick={() => {
                  const amt = customAmount ? parseInt(customAmount, 10) : selectedBundle;
                  handleRecharge(amt);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:from-blue-500 hover:to-violet-500 active:scale-95 transition-all disabled:opacity-50 shrink-0"
              >
                {recharging ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Processing Top-Up...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4" />
                    <span>
                      Add{" "}
                      {customAmount
                        ? `${parseInt(customAmount || "0", 10).toLocaleString()} Credits`
                        : `${selectedBundle.toLocaleString()} Credits`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Transaction Ledger Table Section */}
          <div className="rounded-2xl border border-slate-800 bg-[#111827] overflow-hidden">
            {/* Table Filter Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 p-4">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-blue-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Transaction Audit Trail
                </h3>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                  {filteredTransactions.length} records
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 w-36 sm:w-48 rounded-lg border border-slate-800 bg-slate-900 pl-8 pr-2 text-[11px] text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                {/* Filter pill buttons */}
                <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-0.5">
                  <button
                    onClick={() => setFilterType("ALL")}
                    className={`rounded-md px-2 py-1 text-[10px] font-semibold transition-colors ${
                      filterType === "ALL"
                        ? "bg-blue-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterType("ADD")}
                    className={`rounded-md px-2 py-1 text-[10px] font-semibold transition-colors ${
                      filterType === "ADD"
                        ? "bg-emerald-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Credits
                  </button>
                  <button
                    onClick={() => setFilterType("DEDUCT")}
                    className={`rounded-md px-2 py-1 text-[10px] font-semibold transition-colors ${
                      filterType === "DEDUCT"
                        ? "bg-rose-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Usage
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800/80 bg-slate-900/60 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-2.5 px-4">Timestamp</th>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4">Description</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                    <th className="py-2.5 px-4 text-right">Balance After</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No transactions recorded matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => {
                      const isAddition = tx.type === "ADD";
                      const isEnrichment = tx.category === "B2B_ENRICHMENT";
                      const isInference = tx.category === "AI_INFERENCE";

                      return (
                        <tr
                          key={tx.id}
                          className="hover:bg-slate-800/30 transition-colors font-mono text-[11px]"
                        >
                          <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap">
                            {new Date(tx.createdAt).toLocaleString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-2.5 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                                isEnrichment
                                  ? "bg-indigo-950/70 text-indigo-300 border border-indigo-800/50"
                                  : isInference
                                  ? "bg-blue-950/70 text-blue-300 border border-blue-800/50"
                                  : isAddition
                                  ? "bg-emerald-950/70 text-emerald-300 border border-emerald-800/50"
                                  : "bg-slate-800 text-slate-300"
                              }`}
                            >
                              {isEnrichment ? (
                                <Building2 className="h-3 w-3" />
                              ) : isInference ? (
                                <Cpu className="h-3 w-3" />
                              ) : null}
                              {tx.category.replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-200 font-sans max-w-xs truncate">
                            {tx.description}
                          </td>
                          <td
                            className={`py-2.5 px-4 text-right font-bold whitespace-nowrap ${
                              isAddition ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {isAddition ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-4 text-right text-slate-400 whitespace-nowrap">
                            {tx.balanceAfter.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-[#0B0F19] px-6 py-4">
          <p className="text-[11px] text-slate-400">
            Current Tier: <span className="font-bold text-slate-200">{account?.tier || "Enterprise"}</span> •
            Safe test accounting ledger active.
          </p>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
