"use client";

import React, { useState, useEffect } from "react";
import { ShiftSummaryCard } from "./history/ShiftSummaryCard";
import { HistoryFilterPills, HistoryPeriod } from "./history/HistoryFilterPills";
import { PastDropoffCard, PastDropoffItem } from "./history/PastDropoffCard";
import { RemittanceStickyBar } from "./history/RemittanceStickyBar";
import { RemittanceModal } from "./history/RemittanceModal";
import { Api } from "@/lib/api";
import { Loader2 } from "lucide-react";

export const DeliveryHistoryView: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<HistoryPeriod>("today");
  const [isRemitModalOpen, setIsRemitModalOpen] = useState(false);
  const [completedDropoffs, setCompletedDropoffs] = useState<PastDropoffItem[]>([]);
  const [cashCollectedTotal, setCashCollectedTotal] = useState<number>(0);
  const [tipsTotal, setTipsTotal] = useState<number>(0);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await Api.get(
        "/delivery-history.php",
        { period: selectedPeriod },
        { forceRefresh: true },
      );
      if (res.success && res.data) {
        setCashCollectedTotal(res.data.cash_collected_total || 0);
        setTipsTotal(res.data.tips_total || 0);

        if (Array.isArray(res.data.orders)) {
          const mapped: PastDropoffItem[] = res.data.orders.map((o: any) => {
            const isCod =
              o.payment_method === "cod" || o.payment_method === "cash_on_delivery";
            const items = Array.isArray(o.items)
              ? o.items.map((i: any) => `${i.quantity || 1}x ${i.food_name || "Item"}`).join(", ")
              : "Order Ticket";

            return {
              id: String(o.id),
              orderNumber: o.order_number
                ? o.order_number.startsWith("#")
                  ? o.order_number
                  : `#${o.order_number}`
                : `#${o.id}`,
              customerName: o.customer_name || "Customer",
              timeStr: o.created_at
                ? new Date(o.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "Today",
              statusText: "DELIVERED",
              address: o.delivery_address || "Customer Address",
              distance: "1.5 km",
              totalPrice: Number(o.total_amount || 0),
              paymentType: isCod ? "cod" : "khqr",
              codCollectedAmount: isCod ? Number(o.total_amount || 0) : undefined,
              itemsSummary: items,
              tipAmount: 0,
            };
          });
          setCompletedDropoffs(mapped);
        } else {
          setCompletedDropoffs([]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch delivery history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedPeriod]);

  return (
    <div className="flex flex-col relative w-full pt-2 pb-24 bg-surface min-h-screen max-w-md mx-auto">
      {/* 1. Shift Summary Metrics Card */}
      <ShiftSummaryCard
        completedOrdersCount={completedDropoffs.length}
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
        {isLoadingHistory ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-on-surface-variant">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <span className="font-label-md text-xs font-bold">Loading ledger history...</span>
          </div>
        ) : completedDropoffs.length > 0 ? (
          completedDropoffs.map((dropoff) => (
            <PastDropoffCard key={dropoff.id} dropoff={dropoff} />
          ))
        ) : (
          <div className="py-12 text-center text-on-surface-variant font-body-sm">
            No completed deliveries recorded for this filter period ({selectedPeriod}).
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
