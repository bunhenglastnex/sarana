"use client";

import React, { useState, useEffect } from "react";
import { TransactionRecord, PaymentSummaryMetrics } from "@/types/payments";
import { PaymentSubHeader } from "@/components/admin/payments/PaymentSubHeader";
import { PaymentTable } from "@/components/admin/payments/PaymentTable";
import { PaymentSlipModal } from "@/components/admin/payments/PaymentSlipModal";

const initialTransactions: TransactionRecord[] = [
  {
    id: "TXN-901",
    orderId: "#1082",
    customerName: "David Chen",
    customerPhone: "+1 (555) 234-9912",
    gateway: "ABA KHQR",
    method: "khqr",
    amountUsd: 41.5,
    amountKhr: 166000,
    status: "verified",
    txnRef: "KHQR-889102",
    proofImageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTW_nSl8ar5rgvxpgYec8c80SO7FC8JTpLhfNGATJtMEA&s=10",
    timestamp: "19:22:15",
    dateLabel: "Today, 19:22",
    dateIso: "2026-09-05",
  },
  {
    id: "TXN-902",
    orderId: "#1084",
    customerName: "Marcus Vance",
    customerPhone: "+1 (555) 891-2240",
    gateway: "Wing KHQR",
    method: "khqr",
    amountUsd: 23.0,
    amountKhr: 92000,
    status: "pending_review",
    txnRef: "KHQR-889105",
    proofImageUrl:
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop",
    timestamp: "18:55:04",
    dateLabel: "Today, 18:55",
    dateIso: "2026-09-05",
  },
  {
    id: "TXN-903",
    orderId: "#1081",
    customerName: "Clara Oswald",
    customerPhone: "+1 (555) 604-3382",
    gateway: "Counter POS",
    method: "counter_cash",
    amountUsd: 28.0,
    amountKhr: 112000,
    status: "verified",
    txnRef: "POS-440192",
    timestamp: "19:18:10",
    dateLabel: "Today, 19:18",
    dateIso: "2026-09-05",
  },
  {
    id: "TXN-904",
    orderId: "#1080",
    customerName: "Alex Rivera",
    customerPhone: "+1 (555) 382-9012",
    gateway: "Canadia KHQR",
    method: "khqr",
    amountUsd: 23.5,
    amountKhr: 94000,
    status: "pending_review",
    txnRef: "KHQR-889108",
    proofImageUrl:
      "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=500&auto=format&fit=crop",
    timestamp: "18:40:22",
    dateLabel: "Today, 18:40",
    dateIso: "2026-09-05",
  },
  {
    id: "TXN-905",
    orderId: "#1079",
    customerName: "Sophia Lin",
    customerPhone: "+1 (555) 492-1084",
    gateway: "COD Courier",
    method: "cod",
    amountUsd: 31.0,
    amountKhr: 124000,
    status: "verified",
    txnRef: "COD-DRIVER-4",
    timestamp: "19:08:40",
    dateLabel: "Today, 19:08",
    dateIso: "2026-09-05",
  },
  {
    id: "TXN-906",
    orderId: "#1078",
    customerName: "Julian Thorne",
    customerPhone: "+1 (555) 773-4019",
    gateway: "ABA KHQR",
    method: "khqr",
    amountUsd: 27.0,
    amountKhr: 108000,
    status: "verified",
    txnRef: "KHQR-889090",
    proofImageUrl:
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500&auto=format&fit=crop",
    timestamp: "18:30:12",
    dateLabel: "Today, 18:30",
    dateIso: "2026-09-05",
  },
  {
    id: "TXN-907",
    orderId: "#1026",
    customerName: "David Chen",
    customerPhone: "+1 (555) 234-9912",
    gateway: "Wing KHQR",
    method: "khqr",
    amountUsd: 29.5,
    amountKhr: 118000,
    status: "verified",
    txnRef: "KHQR-888900",
    proofImageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTW_nSl8ar5rgvxpgYec8c80SO7FC8JTpLhfNGATJtMEA&s=10",
    timestamp: "20:15:00",
    dateLabel: "Yesterday",
    dateIso: "2026-09-04",
  },
  {
    id: "TXN-908",
    orderId: "#1018",
    customerName: "Elena Vance",
    customerPhone: "+1 (555) 714-2209",
    gateway: "ABA KHQR",
    method: "khqr",
    amountUsd: 54.0,
    amountKhr: 216000,
    status: "verified",
    txnRef: "KHQR-888710",
    proofImageUrl:
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop",
    timestamp: "14:20:10",
    dateLabel: "Sep 03, 2026",
    dateIso: "2026-09-03",
  },
  {
    id: "TXN-909",
    orderId: "#1012",
    customerName: "Marcus Brody",
    customerPhone: "+1 (555) 392-8812",
    gateway: "COD Courier",
    method: "cod",
    amountUsd: 48.5,
    amountKhr: 194000,
    status: "verified",
    txnRef: "COD-DRIVER-2",
    timestamp: "11:05:30",
    dateLabel: "Sep 01, 2026",
    dateIso: "2026-09-01",
  },
  {
    id: "TXN-910",
    orderId: "#0995",
    customerName: "Arthur Pendelton",
    customerPhone: "+1 (555) 120-9931",
    gateway: "ABA KHQR",
    method: "khqr",
    amountUsd: 82.0,
    amountKhr: 328000,
    status: "verified",
    txnRef: "KHQR-888420",
    proofImageUrl:
      "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=500&auto=format&fit=crop",
    timestamp: "19:45:10",
    dateLabel: "Aug 28, 2026",
    dateIso: "2026-08-28",
  },
];

export default function PaymentsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [transactions, setTransactions] = useState<TransactionRecord[]>(initialTransactions);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [datePreset, setDatePreset] = useState<"today" | "week" | "month" | "all" | "custom">("today");
  const [dateFrom, setDateFrom] = useState("2026-09-05");
  const [dateTo, setDateTo] = useState("2026-09-05");
  const [selectedTxnForProof, setSelectedTxnForProof] = useState<TransactionRecord | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const handleVerifyTransaction = (txnId: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txnId ? { ...t, status: "verified" } : t))
    );
  };

  const handleFlagTransaction = (txnId: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txnId ? { ...t, status: "flagged" } : t))
    );
  };

  const handleExportCsv = () => {
    alert(`Exporting financial reconciliation report (CSV) for ${datePreset} period...`);
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

  // Date filtering logic
  const isDateInRange = (tDateIso: string) => {
    if (datePreset === "today") {
      return tDateIso === "2026-09-05";
    }
    if (datePreset === "week") {
      return tDateIso >= "2026-08-30" && tDateIso <= "2026-09-05";
    }
    if (datePreset === "month") {
      return tDateIso >= "2026-09-01" && tDateIso <= "2026-09-30";
    }
    if (datePreset === "custom") {
      if (dateFrom && tDateIso < dateFrom) return false;
      if (dateTo && tDateIso > dateTo) return false;
      return true;
    }
    return true; // "all"
  };

  const filteredTransactions = transactions.filter((t) => {
    // 1. Date filter
    if (!isDateInRange(t.dateIso)) return false;

    // 2. Method & Status Filter
    if (selectedFilter === "khqr" && t.method !== "khqr") return false;
    if (selectedFilter === "pending_audit" && t.status !== "pending_review") return false;
    if (selectedFilter === "cod" && t.method !== "cod") return false;
    if (selectedFilter === "counter" && t.method !== "counter_cash") return false;
    if (selectedFilter === "cancelled" && t.status !== "refunded" && t.status !== "flagged") return false;

    // 3. Search query filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return (
        t.txnRef.toLowerCase().includes(q) ||
        t.orderId.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.customerPhone.toLowerCase().includes(q) ||
        t.gateway.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate metrics for current date selection
  const dateFilteredOnly = transactions.filter((t) => isDateInRange(t.dateIso));

  const verifiedKhqrUsd = dateFilteredOnly
    .filter((t) => t.method === "khqr" && t.status === "verified")
    .reduce((sum, t) => sum + t.amountUsd, 0);

  const totalUsd = dateFilteredOnly
    .filter((t) => t.status === "verified")
    .reduce((sum, t) => sum + t.amountUsd, 0);

  const pendingKhqrList = dateFilteredOnly.filter((t) => t.status === "pending_review");
  const pendingAmountUsd = pendingKhqrList.reduce((sum, t) => sum + t.amountUsd, 0);

  const codOnHandUsd = dateFilteredOnly
    .filter((t) => t.method === "cod" && t.status === "verified")
    .reduce((sum, t) => sum + t.amountUsd, 0);

  const cancelledList = dateFilteredOnly.filter(
    (t) => t.status === "refunded" || t.status === "flagged"
  );
  const cancelledAmountUsd = cancelledList.reduce((sum, t) => sum + t.amountUsd, 0);

  const metrics: PaymentSummaryMetrics = {
    totalSettledUsd: totalUsd,
    totalSettledKhr: totalUsd * 4000,
    khqrSharePercentage: Math.round((verifiedKhqrUsd / (totalUsd || 1)) * 100),
    pendingVerificationCount: pendingKhqrList.length,
    pendingVerificationAmountUsd: pendingAmountUsd,
    codOnHandUsd: codOnHandUsd,
    cancelledCount: cancelledList.length,
    cancelledAmountUsd: cancelledAmountUsd,
  };

  return (
    <div className="flex flex-col w-full min-h-screen pb-space-2xl gap-space-lg">
      {/* SubHeader & Financial Metrics Cards */}
      <PaymentSubHeader metrics={metrics} onExportCsv={handleExportCsv} />

      {/* Transactions Audit Table */}
      <PaymentTable
        transactions={filteredTransactions}
        totalRecordsCount={transactions.length}
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

