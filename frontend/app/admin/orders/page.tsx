"use client";

import React, { useState } from "react";
import { OrderRecord } from "@/types/orders";
import { OrderSubHeader } from "@/components/admin/orders/OrderSubHeader";
import { OrderDirectory } from "@/components/admin/orders/OrderDirectory";
import { OrderInspector } from "@/components/admin/orders/OrderInspector";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { Api } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function OrdersPage() {
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const {
    items: orders,
    setItems: setOrders,
    loading,
    pagination,
    counts,
    extraData,
    sentinelRef,
    refresh,
  } = useInfiniteScroll<OrderRecord>("/orders.php", {
    limit: 10,
    params: {
      status: statusFilter,
      search: searchQuery,
    },
  });

  const metrics = extraData?.metrics || {
    activeCount: counts?.all || orders.length,
    prepCount: counts?.preparing || 0,
    dispatchCount: counts?.delivery || 0,
    codPendingTotal: 0,
  };

  const selectedOrder =
    orders.find((o) => o.id === selectedOrderId) || orders[0];

  const handleAction = async (action: string, orderId: string) => {
    try {
      let payload: any = { action, order_id: orderId };
      if (action === "cancel") {
        const reason =
          prompt(
            "Enter cancellation reason for customer:",
            "Out of stock / Kitchen reject"
          ) || "Cancelled by expediter";
        payload.cancel_reason = reason;
      }

      // Optimistically remove completed/cancelled order from UI table list & clear inspector selection
      if (
        action === "complete" ||
        action === "mark_picked_up" ||
        action === "mark_delivered" ||
        action === "cancel" ||
        action === "process_refund"
      ) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        if (selectedOrderId === orderId) {
          setSelectedOrderId("");
        }
      }

      const res = await Api.post("/orders.php", payload);
      if (res.success) {
        refresh();
      } else {
        alert("Failed: " + (res.error || "Operation failed"));
        refresh();
      }
    } catch (err: any) {
      alert("Failed to perform order action: " + err.message);
      refresh();
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen pb-space-2xl">
      {/* Sub-Header / Operational Control Strip */}
      <OrderSubHeader
        activeCount={metrics.activeCount}
        prepCount={metrics.prepCount}
        dispatchCount={metrics.dispatchCount}
        codPendingTotal={metrics.codPendingTotal}
      />

      {/* Loading Skeleton or Workspace */}
      {loading && orders.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl shadow-xs border border-border/40 p-12 flex flex-col items-center justify-center gap-3 text-on-surface-variant min-h-[400px]">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="font-label-md text-sm font-bold">Fetching live kitchen orders...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
          {/* LEFT COLUMN: Order Directory & Filtering */}
          <div className="xl:col-span-8">
            <OrderDirectory
              orders={orders}
              counts={counts}
              pagination={pagination}
              loading={loading}
              sentinelRef={sentinelRef}
              selectedOrderId={selectedOrderId || selectedOrder?.id || ""}
              onSelectOrder={setSelectedOrderId}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              onRefresh={refresh}
            />
          </div>

          {/* RIGHT COLUMN: Open Order Slide-Over Inspector */}
          {selectedOrder ? (
            <OrderInspector
              key={selectedOrder.id}
              order={selectedOrder}
              onClose={() => setSelectedOrderId("")}
              onAction={handleAction}
            />
          ) : (
            <div className="xl:col-span-4 bg-surface-container-lowest rounded-2xl border border-border/40 p-8 text-center text-on-surface-variant font-label-md text-xs font-medium">
              Select an order from the directory to inspect details.
            </div>
          )}
        </div>
      )}
    </div>
  );
}


