"use client";

import React, { useState, useEffect } from "react";
import { ShiftSummaryCard } from "./history/ShiftSummaryCard";
import { HistoryFilterPills, HistoryPeriod } from "./history/HistoryFilterPills";
import { PastDropoffCard, PastDropoffItem } from "./history/PastDropoffCard";
import { RemittanceStickyBar } from "./history/RemittanceStickyBar";
import { RemittanceModal } from "./history/RemittanceModal";
import { useDeliveryStore } from "@/lib/store/useDeliveryStore";

export const DeliveryHistoryView: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<HistoryPeriod>("today");
  const [isRemitModalOpen, setIsRemitModalOpen] = useState(false);
  const { fetchLiveOrders, myDeliveries, availableOrders } = useDeliveryStore();

  useEffect(() => {
    fetchLiveOrders();
  }, [fetchLiveOrders]);

  const allOrders = [...myDeliveries, ...availableOrders];
  const completedOrders = allOrders.filter((o) => o.deliveryStage === "completed");

  const completedDropoffs: PastDropoffItem[] = completedOrders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    timeStr: "Today",
    statusText: "DELIVERED",
    address: o.address,
    distance: o.distance || "1.5 km",
    totalPrice: o.totalPrice,
    paymentType: o.paymentType,
    codCollectedAmount: o.paymentType === "cod" ? o.totalPrice : undefined,
    itemsSummary: o.itemsSummary,
    tipAmount: o.tipAmount || 0,
  }));

  const cashCollectedTotal = completedOrders
    .filter((o) => o.paymentType === "cod")
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const tipsTotal = completedOrders.reduce((sum, o) => sum + (o.tipAmount || 0), 0);

  return (
    <div className="flex flex-col relative w-full pt-2 pb-24 bg-surface min-h-screen max-w-md mx-auto">
      {/* 1. Shift Summary Metrics Card */}
      <ShiftSummaryCard
        completedOrdersCount={completedOrders.length}
        tipsTotal={tipsTotal}
        cashCollectedTotal={cashCollectedTotal}
      />

      {/* 2. Filter Pills Carousel */}
      <HistoryFilterPills
        selectedPeriod={selectedPeriod}
        onSelectPeriod={setSelectedPeriod}
      />

      {/* 3. Deliveries Completed Header */}
      <section className="px-screen-edge-padding pt-space-sm pb-space-xs flex items-center justify-between">
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
          Past Drop-offs
        </h2>
        <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
          {completedDropoffs.length} Completed
        </span>
      </section>

      {/* 4. Scannable Deliveries List */}
      <section className="px-screen-edge-padding flex flex-col gap-space-sm pb-6">
        {completedDropoffs.length > 0 ? (
          completedDropoffs.map((dropoff) => (
            <PastDropoffCard key={dropoff.id} dropoff={dropoff} />
          ))
        ) : (
          <div className="py-12 text-center text-on-surface-variant font-body-sm">
            No completed deliveries recorded in this shift yet.
          </div>
        )}

        {/* End of Feed Divider */}
        <div className="flex flex-col items-center justify-center py-space-sm gap-1">
          <div className="w-8 h-1 rounded-full bg-surface-container-high"></div>
          <span className="font-label-sm text-label-sm text-on-surface-variant/70">
            Earlier deliveries archived in shift ledger
          </span>
        </div>
      </section>

      {/* 5. Floating Remittance Action Bar */}
      <RemittanceStickyBar
        remittanceDueAmount={cashCollectedTotal}
        onOpenModal={() => setIsRemitModalOpen(true)}
      />

      {/* 6. Remittance QR Modal Overlay */}
      <RemittanceModal
        isOpen={isRemitModalOpen}
        onClose={() => setIsRemitModalOpen(false)}
        remittanceAmount={cashCollectedTotal}
        referenceCode={`REF: REM-${new Date().toISOString().slice(0, 10)}`}
      />
    </div>
  );
};
