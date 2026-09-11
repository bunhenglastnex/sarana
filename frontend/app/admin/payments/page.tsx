"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Api } from "@/lib/api";
import { TransactionRecord, PaymentSummaryMetrics } from "@/types/payments";
import { PaymentSubHeader } from "@/components/admin/payments/PaymentSubHeader";
import { PaymentTable } from "@/components/admin/payments/PaymentTable";
import { PaymentSlipModal } from "@/components/admin/payments/PaymentSlipModal";
import { Loader2, RefreshCw } from "lucide-react";

const initialMetrics: PaymentSummaryMetrics = {
  totalSettledUsd: 0,
  totalSettledKhr: 0,
  khqrSharePercentage: 0,
  pendingVerificationCount: 0,
  pendingVerificationAmountUsd: 0,
  codOnHandUsd: 0,
  cancelledCount: 0,
  cancelledAmountUsd: 0,
};

export default function PaymentsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [totalRecordsCount, setTotalRecordsCount] = useState(0);
  const [metrics, setMetrics] = useState<PaymentSummaryMetrics>(initialMetrics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [datePreset, setDatePreset] = useState<"today" | "week" | "month" | "all" | "custom">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedTxnForProof, setSelectedTxnForProof] = useState<TransactionRecord | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch payments from backend API
  const fetchPayments = useCallback(async (isRefresh = false) => {
    if (!isRefresh && loading === false) {
      setLoading(true);
    }
    setError(null);

    const res = await Api.get<{
      data: TransactionRecord[];
      totalRecordsCount: number;
      metrics: PaymentSummaryMetrics;
    }>("/payments.php", {
      filter: selectedFilter,
      search: searchQuery,
      date_preset: datePreset,
      date_from: dateFrom,
      date_to: dateTo,
    }, { forceRefresh: isRefresh });

    if (res.success && res.data) {
      const responseData = res.data as any;
      setTransactions(responseData.data || []);
      setTotalRecordsCount(responseData.totalRecordsCount || 0);
      if (responseData.metrics) {
        setMetrics(responseData.metrics);
      }
    } else {
      setError(res.error || "Failed to fetch payments");
    }
    setLoading(false);
  }, [selectedFilter, searchQuery, datePreset, dateFrom, dateTo]);

  useEffect(() => {
    if (isMounted) {
      fetchPayments(true);
    }
  }, [isMounted, fetchPayments]);

  if (!isMounted) {
    return null;
  }

  const handleVerifyTransaction = async (txnId: string) => {
    // Optimistic UI update
    setTransactions((prev) =>
      prev.map((t) => (t.id === txnId ? { ...t, status: "verified" } : t))
    );

    const res = await Api.post("/payments.php", {
      action: "verify",
      txn_id: txnId,
    });

    if (res.success) {
      fetchPayments(true);
    } else {
      alert(`Failed to verify transaction: ${res.error}`);
      fetchPayments(true);
    }
  };

  const handleFlagTransaction = async (txnId: string) => {
    // Optimistic UI update
    setTransactions((prev) =>
      prev.map((t) => (t.id === txnId ? { ...t, status: "flagged" } : t))
    );

    const res = await Api.post("/payments.php", {
      action: "flag",
      txn_id: txnId,
    });

    if (res.success) {
      fetchPayments(true);
    } else {
      alert(`Failed to flag transaction: ${res.error}`);
      fetchPayments(true);
    }
  };

  const handleExportCsv = () => {
    if (transactions.length === 0) {
      alert("No transaction records available to export for the selected filters.");
      return;
    }

    const headers = [
      "Txn Ref",
      "Order ID",
      "Customer Name",
      "Customer Phone",
      "Gateway",
      "Method",
      "Amount (USD)",
      "Amount (KHR)",
      "Status",
      "Date",
      "Time",
    ];

    const rows = transactions.map((t) => [
      `"${t.txnRef}"`,
      `"${t.orderId}"`,
      `"${t.customerName.replace(/"/g, '""')}"`,
      `"${t.customerPhone}"`,
      `"${t.gateway}"`,
      `"${t.method}"`,
      t.amountUsd.toFixed(2),
      t.amountKhr,
      `"${t.status}"`,
      `"${t.dateLabel}"`,
      `"${t.timestamp}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `financial_reconciliation_${datePreset}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedFilter("all");
    setDatePreset("all");
    setDateFrom("");
    setDateTo("");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedFilter !== "all" ||
    datePreset !== "all" ||
    dateFrom !== "" ||
    dateTo !== "";

  return (
    <div className="flex flex-col w-full min-h-screen pb-space-2xl gap-space-lg">
      {/* SubHeader & Financial Metrics Cards */}
      <PaymentSubHeader metrics={metrics} onExportCsv={handleExportCsv} />

      {/* Error alert if backend call failed */}
      {error && (
        <div className="bg-error-container/20 border border-error/30 p-space-md rounded-2xl flex items-center justify-between text-error text-xs font-bold">
          <span>Backend API Error: {error}</span>
          <button
            type="button"
            onClick={() => fetchPayments(true)}
            className="px-3 py-1 bg-error text-white rounded-lg hover:bg-error/80 flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton Indicator */}
      {loading && transactions.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl shadow-xs border border-border/40 p-12 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="font-label-md text-sm font-bold">Loading live payment transactions...</span>
        </div>
      ) : (
        /* Transactions Audit Table */
        <PaymentTable
          transactions={transactions}
          totalRecordsCount={totalRecordsCount}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          datePreset={datePreset}
          onDatePresetChange={setDatePreset}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
          onSelectTransactionForProof={setSelectedTxnForProof}
          onVerifyTransaction={handleVerifyTransaction}
        />
      )}

      {/* KHQR Proof Slip Viewer Modal */}
      {selectedTxnForProof && (
        <PaymentSlipModal
          transaction={selectedTxnForProof}
          onClose={() => setSelectedTxnForProof(null)}
          onVerify={handleVerifyTransaction}
          onFlag={handleFlagTransaction}
        />
      )}
    </div>
  );
}


