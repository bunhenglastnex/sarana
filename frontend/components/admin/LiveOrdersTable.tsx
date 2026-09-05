"use client";

import React, { useState } from "react";
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
} from "lucide-react";

export const LiveOrdersTable: React.FC = () => {
  const [filter, setFilter] = useState<"all" | "pending" | "preparing" | "delivery">("all");

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
            <span>All (24)</span>
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-space-sm py-1 rounded-full font-label-sm text-xs font-medium transition-colors ${
              filter === "pending"
                ? "bg-inverse-surface text-inverse-on-surface"
                : "bg-surface-container text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Pending (5)
          </button>
          <button
            onClick={() => setFilter("preparing")}
            className={`px-space-sm py-1 rounded-full font-label-sm text-xs font-medium transition-colors ${
              filter === "preparing"
                ? "bg-inverse-surface text-inverse-on-surface"
                : "bg-surface-container text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Preparing (4)
          </button>
          <button
            onClick={() => setFilter("delivery")}
            className={`px-space-sm py-1 rounded-full font-label-sm text-xs font-medium transition-colors ${
              filter === "delivery"
                ? "bg-inverse-surface text-inverse-on-surface"
                : "bg-surface-container text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Out for Delivery (3)
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
              <th className="py-space-sm px-space-md">Customer & Contact</th>
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
            {/* Row 1: #1031 */}
            <tr className="hover:bg-surface-container-low/70 transition-colors">
              <td className="py-space-md px-space-lg font-bold text-primary">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                  <span>#1031</span>
                </div>
              </td>
              <td className="py-space-md px-space-md">
                <div className="flex flex-col">
                  <span className="font-label-md text-xs font-bold text-on-surface">
                    Marcus Brody
                  </span>
                  <span className="font-body-sm text-[11px] text-on-surface-variant">
                    +1 (555) 392-8812
                  </span>
                </div>
              </td>
              <td className="py-space-md px-space-md">
                <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-[11px] font-semibold">
                  <Bike className="w-3 h-3 text-primary" /> Delivery
                </span>
              </td>
              <td className="py-space-md px-space-md max-w-xs">
                <span className="font-medium text-on-surface block truncate">
                  2x Smoked Truffle Burger, 1x Russet Fries
                </span>
                <span className="block text-primary font-label-sm text-[11px] font-semibold truncate">
                  Note: Extra garlic aioli on side
                </span>
              </td>
              <td className="py-space-md px-space-md font-bold text-on-surface text-xs">
                $34.50
              </td>
              <td className="py-space-md px-space-md">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-[10px] font-bold">
                  PAID (KHQR)
                </span>
              </td>
              <td className="py-space-md px-space-md">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-error"></span> Pending Acceptance
                </span>
              </td>
              <td className="py-space-md px-space-md text-primary font-semibold text-xs">
                3m ago
              </td>
              <td className="py-space-md px-space-lg text-right">
                <div className="inline-flex items-center gap-1.5">
                  <button
                    onClick={() => alert("Accepted Order #1031")}
                    className="px-space-sm py-1 bg-primary text-on-primary rounded-md font-label-sm text-xs font-bold hover:bg-primary-container shadow-xs transition-all"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => alert("Rejected Order #1031")}
                    className="px-space-sm py-1 bg-surface-container text-error rounded-md font-label-sm text-xs font-semibold hover:bg-error-container transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>

            {/* Row 2: #1030 */}
            <tr className="hover:bg-surface-container-low/70 transition-colors">
              <td className="py-space-md px-space-lg font-bold text-on-surface">
                #1030
              </td>
              <td className="py-space-md px-space-md">
                <div className="flex flex-col">
                  <span className="font-label-md text-xs font-bold text-on-surface">
                    Elena Vance
                  </span>
                  <span className="font-body-sm text-[11px] text-on-surface-variant">
                    +1 (555) 714-2209
                  </span>
                </div>
              </td>
              <td className="py-space-md px-space-md">
                <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-[11px] font-semibold">
                  <ShoppingBag className="w-3 h-3 text-secondary" /> Pickup
                </span>
              </td>
              <td className="py-space-md px-space-md max-w-xs">
                <span className="font-medium text-on-surface block truncate">
                  1x Woodfired Burrata Pizza, 1x House Red
                </span>
              </td>
              <td className="py-space-md px-space-md font-bold text-on-surface text-xs">
                $28.00
              </td>
              <td className="py-space-md px-space-md">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-[10px] font-bold">
                  PAID (COUNTER)
                </span>
              </td>
              <td className="py-space-md px-space-md">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-secondary font-label-sm text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> In the Oven
                </span>
              </td>
              <td className="py-space-md px-space-md text-on-surface-variant text-xs">
                9m ago
              </td>
              <td className="py-space-md px-space-lg text-right">
                <div className="inline-flex items-center gap-1">
                  <button
                    onClick={() => alert("Marked Order #1030 as Ready")}
                    className="px-space-sm py-1 bg-surface-container text-on-surface rounded-md font-label-sm text-xs font-semibold hover:bg-surface-container-high transition-colors"
                  >
                    Ready
                  </button>
                  <button className="p-1 text-on-surface-variant hover:text-on-surface rounded transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>

            {/* Row 3: #1029 */}
            <tr className="hover:bg-surface-container-low/70 transition-colors">
              <td className="py-space-md px-space-lg font-bold text-on-surface">
                #1029
              </td>
              <td className="py-space-md px-space-md">
                <div className="flex flex-col">
                  <span className="font-label-md text-xs font-bold text-on-surface">
                    David K.
                  </span>
                  <span className="font-body-sm text-[11px] text-on-surface-variant">
                    +1 (555) 902-1430
                  </span>
                </div>
              </td>
              <td className="py-space-md px-space-md">
                <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-[11px] font-semibold">
                  <Bike className="w-3 h-3 text-primary" /> Delivery
                </span>
              </td>
              <td className="py-space-md px-space-md max-w-xs">
                <span className="font-medium text-on-surface block truncate">
                  3x Ember Woodfired Wings, 2x Charred Brioche
                </span>
              </td>
              <td className="py-space-md px-space-md font-bold text-on-surface text-xs">
                $45.00
              </td>
              <td className="py-space-md px-space-md">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-[10px] font-bold">
                  UNPAID (COD)
                </span>
              </td>
              <td className="py-space-md px-space-md">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-highest text-on-surface font-label-sm text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-container"></span> Out for Delivery
                </span>
              </td>
              <td className="py-space-md px-space-md text-on-surface-variant text-xs">
                18m ago
              </td>
              <td className="py-space-md px-space-lg text-right">
                <div className="inline-flex items-center gap-1">
                  <button
                    onClick={() => alert("Tracking delivery courier for #1029")}
                    className="px-space-sm py-1 bg-surface-container text-on-surface rounded-md font-label-sm text-xs font-semibold hover:bg-surface-container-high transition-colors flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3 text-primary" /> Track
                  </button>
                  <button className="p-1 text-on-surface-variant hover:text-on-surface rounded transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>

            {/* Row 4: #1027 */}
            <tr className="hover:bg-surface-container-low/70 transition-colors">
              <td className="py-space-md px-space-lg font-bold text-on-surface">
                #1027
              </td>
              <td className="py-space-md px-space-md">
                <div className="flex flex-col">
                  <span className="font-label-md text-xs font-bold text-on-surface">
                    Sofia Thorne
                  </span>
                  <span className="font-body-sm text-[11px] text-on-surface-variant">
                    +1 (555) 441-9877
                  </span>
                </div>
              </td>
              <td className="py-space-md px-space-md">
                <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-[11px] font-semibold">
                  <ShoppingBag className="w-3 h-3 text-secondary" /> Pickup
                </span>
              </td>
              <td className="py-space-md px-space-md max-w-xs">
                <span className="font-medium text-on-surface block truncate">
                  1x Smoked Truffle Burger, 1x Craft Cider
                </span>
              </td>
              <td className="py-space-md px-space-md font-bold text-on-surface text-xs">
                $22.50
              </td>
              <td className="py-space-md px-space-md">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-[10px] font-bold">
                  PAID (KHQR)
                </span>
              </td>
              <td className="py-space-md px-space-md">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-highest text-on-surface font-label-sm text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-on-surface"></span> Ready at Pass
                </span>
              </td>
              <td className="py-space-md px-space-md text-on-surface-variant text-xs">
                24m ago
              </td>
              <td className="py-space-md px-space-lg text-right">
                <div className="inline-flex items-center gap-1">
                  <button
                    onClick={() => alert("Order #1027 Completed")}
                    className="px-space-sm py-1 bg-surface-container text-on-surface rounded-md font-label-sm text-xs font-semibold hover:bg-surface-container-high transition-colors"
                  >
                    Complete
                  </button>
                  <button className="p-1 text-on-surface-variant hover:text-on-surface rounded transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>

            {/* Row 5: #1024 */}
            <tr className="hover:bg-surface-container-low/70 transition-colors opacity-80">
              <td className="py-space-md px-space-lg font-bold text-on-surface-variant">
                #1024
              </td>
              <td className="py-space-md px-space-md">
                <div className="flex flex-col">
                  <span className="font-label-md text-xs font-bold text-on-surface">
                    Arthur Pendelton
                  </span>
                  <span className="font-body-sm text-[11px] text-on-surface-variant">
                    +1 (555) 120-9931
                  </span>
                </div>
              </td>
              <td className="py-space-md px-space-md">
                <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-[11px] font-semibold">
                  <Bike className="w-3 h-3 text-primary" /> Delivery
                </span>
              </td>
              <td className="py-space-md px-space-md max-w-xs">
                <span className="font-medium text-on-surface block truncate">
                  2x Burrata Pizzas, 2x Truffle Fries, 1x Tiramisu
                </span>
              </td>
              <td className="py-space-md px-space-md font-bold text-on-surface text-xs">
                $56.00
              </td>
              <td className="py-space-md px-space-md">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-[10px] font-bold">
                  PAID (KHQR)
                </span>
              </td>
              <td className="py-space-md px-space-md">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-outline"></span> Delivered & Closed
                </span>
              </td>
              <td className="py-space-md px-space-md text-on-surface-variant text-xs">
                42m ago
              </td>
              <td className="py-space-md px-space-lg text-right">
                <div className="inline-flex items-center gap-1">
                  <button
                    onClick={() => alert("Viewing details for #1024")}
                    className="px-space-sm py-1 bg-surface-container text-on-surface-variant rounded-md font-label-sm text-xs font-medium hover:text-on-surface transition-colors"
                  >
                    Details
                  </button>
                  <button
                    title="Print Receipt"
                    className="p-1 text-on-surface-variant hover:text-on-surface rounded transition-colors"
                  >
                    <ReceiptIcon className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Table Pagination & Capacity Footer */}
      <div className="p-space-md bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-sm border-t border-border/30">
        <div className="flex items-center gap-space-sm text-xs">
          <span className="font-body-sm text-on-surface-variant">
            Showing 5 of 24 Live Shifts Orders
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
          <button className="px-2.5 py-0.5 rounded text-on-surface-variant hover:bg-surface-container-high font-label-sm text-xs transition-colors">
            2
          </button>
          <button className="px-2.5 py-0.5 rounded text-on-surface-variant hover:bg-surface-container-high font-label-sm text-xs transition-colors">
            3
          </button>
          <button className="p-1 rounded-md text-on-surface-variant hover:bg-surface-container-high transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
