"use client";

import React, { useState, useEffect } from "react";
import { KdsTicket, KdsOrderItem } from "@/types/kds";
import { KdsSubHeader } from "@/components/admin/kds/KdsSubHeader";
import { KdsKanbanColumn } from "@/components/admin/kds/KdsKanbanColumn";
import { useApi, Api } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function LiveOrderBoardPage() {
  const [filter, setFilter] = useState<"all" | "delivery" | "pickup" | "rejected">("all");

  const { data, loading, refetch } = useApi<any>("/orders.php", {
    limit: 50,
  });

  // Fetch Settings Config for Refresh Rate and Audio Chime
  const { data: settingsRes } = useApi<any>("/settings.php");
  const settings = settingsRes?.data || settingsRes || {};

  // Parse dynamic refresh interval from Settings (default: 5s = 5000ms)
  const refreshRateStr = settings.auto_refresh_seconds || settings.autoRefreshSeconds || "5s";
  const refreshMs = (parseInt(refreshRateStr, 10) || 5) * 1000;

  // Real-Time Dynamic Auto-Polling based on Settings Configuration
  useEffect(() => {
    const interval = setInterval(() => {
      refetch(true);
    }, refreshMs);
    return () => clearInterval(interval);
  }, [refetch, refreshMs]);

  const rawOrders: any[] = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);

  // Audio chime alert for new incoming orders
  const prevPendingCountRef = React.useRef(0);
  const currentPendingCount = rawOrders.filter((o: any) => String(o.status || "").toLowerCase() === "pending").length;
  const enableChime = settings.enable_audio_chimes ?? settings.enableAudioChimes ?? true;

  useEffect(() => {
    if (enableChime && currentPendingCount > prevPendingCountRef.current && prevPendingCountRef.current > 0) {
      try {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
        audio.play().catch(() => {});
      } catch (e) {}
    }
    prevPendingCountRef.current = currentPendingCount;
  }, [currentPendingCount, enableChime]);

  const mapOrderToTicket = (o: any): KdsTicket => {
    const rawSt = String(o.status || "pending").toLowerCase();
    let kdsStatus: KdsTicket["status"] = "pending";
    if (rawSt === "pending") kdsStatus = "pending";
    else if (rawSt === "accepted") kdsStatus = "accepted";
    else if (rawSt === "preparing") kdsStatus = "preparing";
    else if (rawSt === "ready_for_pickup" || rawSt === "ready_for_delivery" || rawSt === "ready") kdsStatus = "ready";
    else if (rawSt === "cancelled" || rawSt === "rejected") kdsStatus = "rejected";
    else kdsStatus = "preparing";

    const payStatus = String(o.payment_status || "pending").toLowerCase();
    const isPaid = payStatus === "paid" || payStatus === "verified";
    const payMethod = String(o.payment_method || "khqr").toUpperCase();
    const payBadge = isPaid ? `PAID (${payMethod})` : `UNPAID (${payMethod})`;

    const createdTs = new Date(o.created_at || Date.now()).getTime();
    const diffMins = Math.max(1, Math.floor((Date.now() - createdTs) / 60000));
    const timerLabel = diffMins < 60 ? `${diffMins}m ago` : `${Math.floor(diffMins / 60)}h ago`;

    const items: KdsOrderItem[] = (o.items || []).map((it: any) => ({
      name: it.food_name || it.name || "Menu Item",
      price: Number(it.price || 0),
      quantity: Number(it.quantity || 1),
      modifiers: it.notes ? [{ text: it.notes, isAlert: true }] : undefined,
    }));

    const cleanNumber = o.order_number ? `#${String(o.order_number).replace(/^#/, "")}` : `#${o.id}`;

    return {
      id: cleanNumber,
      channel: o.fulfillment_type === "pickup" ? "pickup" : "delivery",
      status: kdsStatus,
      timerLabel,
      isUrgent: diffMins > 15,
      customerName: o.customer_name || "Customer",
      locationOrNote: o.notes || undefined,
      paymentBadge: payBadge,
      paymentIsPaid: isPaid,
      proofImageUrl: o.payment_proof_url || undefined,
      totalPrice: Number(o.total_amount || 0),
      assignStation: o.fulfillment_type === "delivery" ? "Hearth 1" : "Pass / Counter",
      prepProgress: kdsStatus === "preparing" ? 65 : undefined,
      items: items.length > 0 ? items : [{ name: "Chef Special Order", price: Number(o.total_amount || 0), quantity: 1 }],
      readySubtype: o.fulfillment_type === "pickup" ? "pickup" : "delivery",
      shelfOrBag: o.fulfillment_type === "pickup" ? "Pickup Shelf A" : "Delivery Bag #01",
      readyTimeAgo: kdsStatus === "ready" ? `${diffMins}m ago` : undefined,
      rejectReason: o.notes || undefined,
    };
  };

  const tickets: KdsTicket[] = rawOrders.map(mapOrderToTicket);

  const handleAction = async (action: string, ticketId: string, reason?: string) => {
    let apiAction = action;
    if (action === "reject") apiAction = "cancel";

    try {
      const res = await Api.post("/orders.php", {
        action: apiAction,
        order_id: ticketId,
        cancel_reason: reason || "Kitchen rejected order",
      });
      if (res.success) {
        refetch(true);
      } else {
        alert("Action failed: " + (res.error || "Operation failed"));
      }
    } catch (err: any) {
      alert("Failed: " + err.message);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (filter === "delivery") return t.channel === "delivery" && t.status !== "rejected";
    if (filter === "pickup") return t.channel === "pickup" && t.status !== "rejected";
    if (filter === "rejected") return t.status === "rejected";
    return true;
  });

  const pendingTickets = filteredTickets.filter((t) => t.status === "pending");
  const acceptedTickets = filteredTickets.filter((t) => t.status === "accepted");
  const preparingTickets = filteredTickets.filter((t) => t.status === "preparing");
  const readyTickets = filteredTickets.filter((t) => t.status === "ready");
  const rejectedTickets = tickets.filter((t) => t.status === "rejected");

  const activeCount = tickets.filter((t) => t.status !== "rejected").length;
  const deliveryCount = tickets.filter((t) => t.channel === "delivery" && t.status !== "rejected").length;
  const pickupCount = tickets.filter((t) => t.channel === "pickup" && t.status !== "rejected").length;
  const rejectedCount = rejectedTickets.length;

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* KDS Sub-Header & Live Expediter Controls */}
      <KdsSubHeader
        activeCount={activeCount}
        deliveryCount={deliveryCount}
        pickupCount={pickupCount}
        rejectedCount={rejectedCount}
        readyCount={readyTickets.length}
        currentFilter={filter}
        onFilterChange={setFilter}
      />

      {loading && tickets.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl shadow-xs border border-border/40 p-12 flex flex-col items-center justify-center gap-3 text-on-surface-variant min-h-[400px]">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="font-label-md text-sm font-bold">Connecting to Live Kitchen KDS API...</span>
        </div>
      ) : (
        /* 3-Column or 4-Column Expediter Workflow Kanban Grid */
        filter === "rejected" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md items-start">
            <KdsKanbanColumn
              title="REJECTED / CANCELLED ORDERS"
              stepNumber={0}
              status="rejected"
              count={rejectedTickets.length}
              sublabel="Audit Log"
              dotColorClass="bg-error font-bold"
              badgeClass="bg-error-container text-on-error-container"
              containerClass="bg-error-container/10 border-error/20"
              tickets={rejectedTickets}
              onAction={handleAction}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-space-md items-start">
            {/* Column 1: Pending */}
            <KdsKanbanColumn
              title="PENDING"
              stepNumber={1}
              status="pending"
              count={pendingTickets.length}
              sublabel="Action Req."
              dotColorClass="bg-error animate-pulse"
              badgeClass="bg-error-container text-on-error-container"
              tickets={pendingTickets}
              onAction={handleAction}
            />

            {/* Column 2: Accepted */}
            <KdsKanbanColumn
              title="ACCEPTED"
              stepNumber={2}
              status="accepted"
              count={acceptedTickets.length}
              sublabel="Queue"
              dotColorClass="bg-secondary-container"
              badgeClass="bg-surface-container-high text-on-surface"
              tickets={acceptedTickets}
              onAction={handleAction}
            />

            {/* Column 3: Preparing */}
            <KdsKanbanColumn
              title="PREPARING"
              stepNumber={3}
              status="preparing"
              count={preparingTickets.length}
              sublabel="Hearth Active"
              dotColorClass="bg-primary animate-pulse"
              badgeClass="bg-primary-fixed text-on-primary-fixed"
              tickets={preparingTickets}
              onAction={handleAction}
            />
          </div>
        )
      )}
    </div>
  );
}
