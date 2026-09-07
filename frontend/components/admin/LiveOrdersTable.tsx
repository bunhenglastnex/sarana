"use client";

import React, { useState } from "react";
import { formatProofUrl } from "@/lib/utils";
import {
  ListOrdered,
  Bike,
  ShoppingBag,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  MapPin,
  Receipt as ReceiptIcon,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  X,
  XCircle,
} from "lucide-react";

export interface LiveOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  channel: "delivery" | "pickup";
  itemsSummary: string;
  note?: string;
  totalPrice: number;
  paymentBadge: string;
  paymentIsPaid: boolean;
  paymentMethod: "khqr" | "cod" | "counter" | "card";
  proofImageUrl?: string;
  status: "pending" | "preparing" | "delivery" | "ready" | "completed" | "rejected";
  rejectReason?: string;
  elapsedTime: string;
}

const initialOrders: LiveOrder[] = [
  {
    id: "#1031",
    customerName: "Marcus Brody",
    customerPhone: "+1 (555) 392-8812",
    channel: "delivery",
    itemsSummary: "2x Smoked Truffle Burger, 1x Russet Fries",
    note: "Extra garlic aioli on side",
    totalPrice: 34.5,
    paymentBadge: "PAID (KHQR)",
    paymentIsPaid: true,
    paymentMethod: "khqr",
    proofImageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTW_nSl8ar5rgvxpgYec8c80SO7FC8JTpLhfNGATJtMEA&s=10",
    status: "pending",
    elapsedTime: "3m ago",
  },
  {
    id: "#1030",
    customerName: "Elena Vance",
    customerPhone: "+1 (555) 714-2209",
    channel: "pickup",
    itemsSummary: "1x Woodfired Burrata Pizza, 1x House Red",
    totalPrice: 28.0,
    paymentBadge: "PAID (COUNTER)",
    paymentIsPaid: true,
    paymentMethod: "counter",
    status: "preparing",
    elapsedTime: "9m ago",
  },
  {
    id: "#1029",
    customerName: "David K.",
    customerPhone: "+1 (555) 902-1430",
    channel: "delivery",
    itemsSummary: "3x Ember Woodfired Wings, 2x Charred Brioche",
    totalPrice: 45.0,
    paymentBadge: "UNPAID (COD)",
    paymentIsPaid: false,
    paymentMethod: "cod",
    status: "delivery",
    elapsedTime: "18m ago",
  },
  {
    id: "#1028",
    customerName: "Nadia S.",
    customerPhone: "+1 (555) 604-3319",
    channel: "delivery",
    itemsSummary: "1x Hearth-Smoked Angus Burger, 1x Citrus Lemonade",
    totalPrice: 23.0,
    paymentBadge: "PAID (KHQR)",
    paymentIsPaid: true,
    paymentMethod: "khqr",
    proofImageUrl:
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500&auto=format&fit=crop",
    status: "pending",
    elapsedTime: "1m ago",
  },
  {
    id: "#1027",
    customerName: "Sofia Thorne",
    customerPhone: "+1 (555) 441-9877",
    channel: "pickup",
    itemsSummary: "1x Smoked Truffle Burger, 1x Craft Cider",
    totalPrice: 22.5,
    paymentBadge: "PAID (KHQR)",
    paymentIsPaid: true,
    paymentMethod: "khqr",
    proofImageUrl:
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop",
    status: "ready",
    elapsedTime: "24m ago",
  },
  {
    id: "#1024",
    customerName: "Arthur Pendelton",
    customerPhone: "+1 (555) 120-9931",
    channel: "delivery",
    itemsSummary: "2x Burrata Pizzas, 2x Truffle Fries, 1x Tiramisu",
    totalPrice: 56.0,
    paymentBadge: "PAID (KHQR)",
    paymentIsPaid: true,
    paymentMethod: "khqr",
    proofImageUrl:
      "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=500&auto=format&fit=crop",
    status: "completed",
    elapsedTime: "42m ago",
  },
];

interface LiveOrdersTableProps {
  initialOrders?: LiveOrder[];
  onAction?: (action: string, orderId: string, payload?: any) => void;
  onRefresh?: () => void;
}

export const LiveOrdersTable: React.FC<LiveOrdersTableProps> = ({
  initialOrders: externalOrders,
  onAction,
  onRefresh,
}) => {
  const [orders, setOrders] = useState<LiveOrder[]>(externalOrders && externalOrders.length > 0 ? externalOrders : initialOrders);
  const [filter, setFilter] = useState<"all" | "pending" | "preparing" | "delivery">("all");

  React.useEffect(() => {
    if (externalOrders && externalOrders.length > 0) {
      setOrders(externalOrders);
    }
  }, [externalOrders]);
  
  // Modals state
  const [selectedOrderForProof, setSelectedOrderForProof] = useState<LiveOrder | null>(null);
  const [selectedOrderForReject, setSelectedOrderForReject] = useState<LiveOrder | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleAccept = (order: LiveOrder) => {
    if (order.paymentMethod === "khqr" || order.paymentBadge.includes("KHQR")) {
      // Auto preview KHQR slip first matching live-order-board logic
      setSelectedOrderForProof(order);
    } else {
      // Direct accept for non-KHQR orders
      confirmAcceptOrder(order.id);
    }
  };

  const confirmAcceptOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "preparing" } : o))
    );
    setSelectedOrderForProof(null);
    if (onAction) onAction("accept", orderId);
  };

  const handleRejectSubmit = () => {
    if (!selectedOrderForReject || !rejectReason.trim()) return;
    const orderId = selectedOrderForReject.id;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: "rejected", rejectReason: rejectReason.trim() }
          : o
      )
    );
    if (onAction) onAction("cancel", orderId, { cancel_reason: rejectReason.trim() });
    setSelectedOrderForReject(null);
    setRejectReason("");
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === "pending") return o.status === "pending";
    if (filter === "preparing") return o.status === "preparing";
    if (filter === "delivery") return o.status === "delivery";
    return true;
  });

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const preparingCount = orders.filter((o) => o.status === "preparing").length;
  const deliveryCount = orders.filter((o) => o.status === "delivery").length;

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-border/40 overflow-hidden">
      {/* Table Header & Controls */}
      <div className="p-space-lg flex flex-col sm:flex-row sm:items-center justify-between gap-space-md bg-surface-container-lowest border-b border-border/30">
        <div className="flex items-center gap-space-sm">
          <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
            <ListOrdered className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface">
              Recent Live Orders
            </h2>
            <span className="font-body-sm text-xs text-on-surface-variant">
              Real-time dispatch, preparation stage, and settlement status
            </span>
          </div>
        </div>

        {/* Table Filter Chips */}
        <div className="flex flex-wrap items-center gap-space-xs">
          <button
            onClick={() => setFilter("all")}
            className={`px-space-sm py-1 rounded-full font-label-sm text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors ${
              filter === "all"
                ? "bg-inverse-surface text-inverse-on-surface"
                : "bg-surface-container text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
            <span>All ({orders.length})</span>
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-space-sm py-1 rounded-full font-label-sm text-xs font-medium transition-colors ${
              filter === "pending"
                ? "bg-inverse-surface text-inverse-on-surface"
                : "bg-surface-container text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter("preparing")}
            className={`px-space-sm py-1 rounded-full font-label-sm text-xs font-medium transition-colors ${
              filter === "preparing"
                ? "bg-inverse-surface text-inverse-on-surface"
                : "bg-surface-container text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Preparing ({preparingCount})
          </button>
          <button
            onClick={() => setFilter("delivery")}
            className={`px-space-sm py-1 rounded-full font-label-sm text-xs font-medium transition-colors ${
              filter === "delivery"
                ? "bg-inverse-surface text-inverse-on-surface"
                : "bg-surface-container text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Out for Delivery ({deliveryCount})
          </button>
          <div className="h-5 w-px bg-surface-container-high mx-1"></div>
          <button
            title="Filter"
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4" />
          </button>
          <button
            title="Export Orders"
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-body-sm text-xs text-on-surface">
          <thead className="bg-surface-container-low font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider border-b border-border/30">
            <tr>
              <th className="py-space-sm px-space-lg">Order ID</th>
              <th className="py-space-sm px-space-md">Customer &amp; Contact</th>
              <th className="py-space-sm px-space-md">Channel</th>
              <th className="py-space-sm px-space-md">Items Ordered</th>
              <th className="py-space-sm px-space-md">Total</th>
              <th className="py-space-sm px-space-md">Payment</th>
              <th className="py-space-sm px-space-md">Kitchen Status</th>
              <th className="py-space-sm px-space-md">Elapsed</th>
              <th className="py-space-sm px-space-lg text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-on-surface-variant">
                  No live orders matching this status filter.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const isPending = order.status === "pending";
                const isPreparing = order.status === "preparing";
                const isDelivery = order.status === "delivery";
                const isReady = order.status === "ready";
                const isCompleted = order.status === "completed";
                const isRejected = order.status === "rejected";
                const isKhqr =
                  order.paymentMethod === "khqr" ||
                  order.paymentBadge.includes("KHQR");

                return (
                  <tr
                    key={order.id}
                    className={`hover:bg-surface-container-low/70 transition-colors ${
                      isRejected ? "opacity-60 bg-surface-container-low/30" : ""
                    }`}
                  >
                    {/* Order ID */}
                    <td className="py-space-md px-space-lg font-bold text-primary">
                      <div className="flex items-center gap-1.5">
                        {isPending && (
                          <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                        )}
                        <span>{order.id}</span>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-space-md px-space-md">
                      <div className="flex flex-col">
                        <span className="font-label-md text-xs font-bold text-on-surface">
                          {order.customerName}
                        </span>
                        <span className="font-body-sm text-[11px] text-on-surface-variant">
                          {order.customerPhone}
                        </span>
                      </div>
                    </td>

                    {/* Channel */}
                    <td className="py-space-md px-space-md">
                      {order.channel === "delivery" ? (
                        <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-[11px] font-semibold">
                          <Bike className="w-3 h-3 text-primary" /> Delivery
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-[11px] font-semibold">
                          <ShoppingBag className="w-3 h-3 text-secondary" /> Pickup
                        </span>
                      )}
                    </td>

                    {/* Items */}
                    <td className="py-space-md px-space-md max-w-xs">
                      <span className="font-medium text-on-surface block truncate">
                        {order.itemsSummary}
                      </span>
                      {order.note && (
                        <span className="block text-primary font-label-sm text-[11px] font-semibold truncate">
                          Note: {order.note}
                        </span>
                      )}
                    </td>

                    {/* Total Price */}
                    <td className="py-space-md px-space-md font-bold text-on-surface text-xs">
                      ${order.totalPrice.toFixed(2)}
                    </td>

                    {/* Payment Badge & KHQR Preview */}
                    <td className="py-space-md px-space-md">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-[10px] font-bold ${
                            order.paymentIsPaid
                              ? "bg-primary-fixed text-on-primary-fixed-variant"
                              : "bg-error-container text-on-error-container"
                          }`}
                        >
                          {order.paymentBadge}
                        </span>
                        {isKhqr && (
                          <button
                            type="button"
                            onClick={() => setSelectedOrderForProof(order)}
                            className="p-1 rounded bg-surface-container hover:bg-surface-container-high text-primary transition-colors"
                            title="Preview KHQR Payment Slip"
                          >
                            <ZoomIn className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Kitchen Status */}
                    <td className="py-space-md px-space-md">
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-[11px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-error"></span> Pending Acceptance
                        </span>
                      )}
                      {isPreparing && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-secondary font-label-sm text-[11px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> In the Oven
                        </span>
                      )}
                      {isDelivery && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-highest text-on-surface font-label-sm text-[11px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary-container"></span> Out for Delivery
                        </span>
                      )}
                      {isReady && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-highest text-on-surface font-label-sm text-[11px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-on-surface"></span> Ready at Pass
                        </span>
                      )}
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-[11px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-outline"></span> Delivered &amp; Closed
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-error/10 text-error font-label-sm text-[11px] font-bold">
                          <XCircle className="w-3 h-3 text-error" /> Rejected
                        </span>
                      )}
                    </td>

                    {/* Elapsed Time */}
                    <td className="py-space-md px-space-md text-primary font-semibold text-xs">
                      {order.elapsedTime}
                    </td>

                    {/* Actions */}
                    <td className="py-space-md px-space-lg text-right">
                      {isPending && (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleAccept(order)}
                            className="px-space-sm py-1 bg-primary text-on-primary rounded-md font-label-sm text-xs font-bold hover:bg-primary-container shadow-xs transition-all flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOrderForReject(order);
                              setRejectReason("");
                            }}
                            className="px-space-sm py-1 bg-surface-container text-error rounded-md font-label-sm text-xs font-semibold hover:bg-error-container transition-colors flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}

                      {isPreparing && (
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => {
                              setOrders((prev) =>
                                prev.map((o) =>
                                  o.id === order.id ? { ...o, status: "ready" } : o
                                )
                              );
                              if (onAction) onAction("mark_ready", order.id);
                            }}
                            className="px-space-sm py-1 bg-surface-container text-on-surface rounded-md font-label-sm text-xs font-semibold hover:bg-surface-container-high transition-colors"
                          >
                            Mark Ready
                          </button>
                        </div>
                      )}

                      {isDelivery && (
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => {
                              setOrders((prev) =>
                                prev.map((o) =>
                                  o.id === order.id ? { ...o, status: "completed" } : o
                                )
                              );
                              if (onAction) onAction("complete", order.id);
                            }}
                            className="px-space-sm py-1 bg-primary text-on-primary rounded-md font-label-sm text-xs font-bold hover:bg-primary-container shadow-xs transition-all flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                          </button>
                        </div>
                      )}

                      {isReady && (
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => {
                              setOrders((prev) =>
                                prev.map((o) =>
                                  o.id === order.id ? { ...o, status: "completed" } : o
                                )
                              );
                              if (onAction) onAction("complete", order.id);
                            }}
                            className="px-space-sm py-1 bg-primary text-on-primary rounded-md font-label-sm text-xs font-bold hover:bg-primary-container shadow-xs transition-all flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                          </button>
                        </div>
                      )}

                      {(isCompleted || isRejected) && (
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => alert(`Viewing archived receipt for ${order.id}`)}
                            className="p-1 text-on-surface-variant hover:text-on-surface rounded transition-colors"
                            title="Print Receipt"
                          >
                            <ReceiptIcon className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination & Capacity Footer */}
      <div className="p-space-md bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-sm border-t border-border/30">
        <div className="flex items-center gap-space-sm text-xs">
          <span className="font-body-sm text-on-surface-variant">
            Showing {filteredOrders.length} of {orders.length} Live Shifts Orders
          </span>
          <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
          <span className="font-label-sm text-secondary font-semibold">
            Hearth Capacity: 78%
          </span>
        </div>
        <div className="flex items-center gap-space-xs">
          <button
            disabled
            className="p-1 rounded-md text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2.5 py-0.5 rounded bg-primary text-on-primary font-label-sm text-xs font-bold">
            1
          </span>
          <button className="p-1 rounded-md text-on-surface-variant hover:bg-surface-container-high transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KHQR Payment Proof Slip Preview Modal */}
      {selectedOrderForProof && (
        <div
          onClick={() => setSelectedOrderForProof(null)}
          className="fixed inset-0 bg-on-surface/60 backdrop-blur-xs z-[100] flex items-center justify-center p-space-md animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-space-md shadow-2xl space-y-space-sm border border-border/40"
          >
            <div className="flex items-center justify-between border-b border-border/30 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-sm font-bold text-on-surface">
                  KHQR Payment Slip ({selectedOrderForProof.id})
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-label-sm text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  VERIFIED PAID
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForProof(null)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="w-full h-80 rounded-xl overflow-hidden bg-black/90 border border-border/20 relative flex items-center justify-center">
              <img
                src={
                  formatProofUrl(selectedOrderForProof.proofImageUrl) ||
                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTW_nSl8ar5rgvxpgYec8c80SO7FC8JTpLhfNGATJtMEA&s=10"
                }
                alt="Full KHQR Payment Slip"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-on-surface-variant bg-surface-container-low p-2.5 rounded-xl border border-border/20">
              <div>
                <div className="font-bold text-on-surface">
                  {selectedOrderForProof.customerName}
                </div>
                <div className="text-[11px]">KHQR Instant Transfer</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-emerald-700 text-sm">
                  ${selectedOrderForProof.totalPrice.toFixed(2)}
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold">
                  Transaction Success
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSelectedOrderForProof(null)}
                className="w-1/3 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant font-label-md text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              {selectedOrderForProof.status === "pending" ? (
                <button
                  type="button"
                  onClick={() => confirmAcceptOrder(selectedOrderForProof.id)}
                  className="w-2/3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-label-lg text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accept &amp; Confirm Order</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedOrderForProof(null)}
                  className="w-2/3 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified &amp; Close</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Order Reason Modal */}
      {selectedOrderForReject && (
        <div
          onClick={() => {
            setSelectedOrderForReject(null);
            setRejectReason("");
          }}
          className="fixed inset-0 bg-on-surface/60 backdrop-blur-xs z-[100] flex items-center justify-center p-space-md animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-space-md shadow-2xl space-y-space-md border border-border/40"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/30 pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-error" />
                <span className="font-headline-sm text-sm font-bold text-on-surface">
                  Reject Order {selectedOrderForReject.id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedOrderForReject(null);
                  setRejectReason("");
                }}
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Order Brief */}
            <div className="bg-error-container/20 p-2.5 rounded-xl border border-error/20 text-xs">
              <div className="font-bold text-on-surface">
                Customer: {selectedOrderForReject.customerName}
              </div>
              <div className="text-on-surface-variant text-[11px] mt-0.5">
                Total Amount: ${selectedOrderForReject.totalPrice.toFixed(2)} • {selectedOrderForReject.itemsSummary}
              </div>
            </div>

            {/* Quick Reason Suggestions */}
            <div className="space-y-1.5">
              <label className="font-label-sm text-xs font-bold text-on-surface block">
                Select Rejection Reason:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Out of stock / Sold out",
                  "Invalid KHQR payment slip",
                  "Kitchen over capacity",
                  "Outside delivery zone",
                  "Store closing soon",
                ].map((reasonText) => (
                  <button
                    key={reasonText}
                    type="button"
                    onClick={() => setRejectReason(reasonText)}
                    className={`px-2.5 py-1 rounded-lg font-label-sm text-[11px] transition-all border ${
                      rejectReason === reasonText
                        ? "bg-error text-on-error font-bold border-error shadow-xs"
                        : "bg-surface-container-low hover:bg-surface-container text-on-surface border-border/30"
                    }`}
                  >
                    {reasonText}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Reason Text Input Area */}
            <div className="space-y-1">
              <label className="font-label-sm text-xs font-bold text-on-surface block">
                Reason to send to Customer:
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Type rejection reason for customer notification..."
                className="w-full p-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-sm text-xs outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-error/40 border border-border/40 transition-all resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedOrderForReject(null);
                  setRejectReason("");
                }}
                className="w-1/3 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant font-label-md text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!rejectReason.trim()}
                onClick={handleRejectSubmit}
                className="w-2/3 py-2 rounded-xl bg-error hover:bg-error/90 disabled:opacity-50 disabled:cursor-not-allowed text-on-error font-label-lg text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Confirm &amp; Reject</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

