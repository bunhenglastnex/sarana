"use client";

import React, { useState } from "react";
import { ShiftSummaryCard } from "./history/ShiftSummaryCard";
import { HistoryFilterPills, HistoryPeriod } from "./history/HistoryFilterPills";
import { PastDropoffCard, PastDropoffItem } from "./history/PastDropoffCard";
import { RemittanceStickyBar } from "./history/RemittanceStickyBar";
import { RemittanceModal } from "./history/RemittanceModal";

const MOCK_DROPOFFS: PastDropoffItem[] = [
  {
    id: "1021",
    orderNumber: "#1021",
    customerName: "Michael Chang",
    timeStr: "Today, 6:45 PM",
    statusText: "DELIVERED",
    address: "88 Belmont Ave, Apt 4B",
    distance: "1.8 km",
    totalPrice: 28.5,
    paymentType: "khqr",
    itemsSummary: "Woodfired Ribeye & Fries",
    tipAmount: 4.5,
  },
  {
    id: "1018",
    orderNumber: "#1018",
    customerName: "Robert Taylor",
    timeStr: "Today, 5:30 PM",
    statusText: "DELIVERED",
    address: "12 Lakeview Dr, House #2",
    distance: "3.4 km",
    totalPrice: 45.0,
    paymentType: "cod",
    codCollectedAmount: 45.0,
    itemsSummary: "2x Ember Bacon Burgers, Ale",
    tipAmount: 6.0,
  },
  {
    id: "1014",
    orderNumber: "#1014",
    customerName: "Chloe Dupont",
    timeStr: "Today, 4:15 PM",
    statusText: "DELIVERED",
    address: "330 River Road, Suite 101",
    distance: "0.9 km",
    totalPrice: 19.0,
    paymentType: "khqr",
    itemsSummary: "Wood-Smoked Salad Bowl",
    tipAmount: 3.5,
  },
];

export const DeliveryHistoryView: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<HistoryPeriod>("today");
  const [isRemitModalOpen, setIsRemitModalOpen] = useState(false);

  return (
    <div className="flex flex-col relative w-full pt-2 pb-24 bg-surface min-h-screen max-w-md mx-auto">
      {/* 1. Shift Summary Metrics Card */}
      <ShiftSummaryCard
        completedOrdersCount={8}
        tipsTotal={42.0}
        cashCollectedTotal={138.5}
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
          {MOCK_DROPOFFS.length} Completed
        </span>
      </section>

      {/* 4. Scannable Deliveries List */}
      <section className="px-screen-edge-padding flex flex-col gap-space-sm pb-6">
        {MOCK_DROPOFFS.map((dropoff) => (
          <PastDropoffCard key={dropoff.id} dropoff={dropoff} />
        ))}

        {/* Subtle End of Loaded Feed Divider with Bistro Warmth */}
        <div className="flex flex-col items-center justify-center py-space-sm gap-1">
          <div className="w-8 h-1 rounded-full bg-surface-container-high"></div>
          <span className="font-label-sm text-label-sm text-on-surface-variant/70">
            Earlier deliveries archived in shift ledger
          </span>
        </div>
      </section>

      {/* 5. Floating Remittance Action Bar */}
      <RemittanceStickyBar
        remittanceDueAmount={79.5}
        onOpenModal={() => setIsRemitModalOpen(true)}
      />

      {/* 6. Remittance QR Modal Overlay */}
      <RemittanceModal
        isOpen={isRemitModalOpen}
        onClose={() => setIsRemitModalOpen(false)}
        remittanceAmount={79.5}
        referenceCode="REF: REM-2023-1021-08"
      />
    </div>
  );
};
