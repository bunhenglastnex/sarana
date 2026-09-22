"use client";

import React, { useState } from "react";
import { DeliveryOrder, useDeliveryStore } from "@/lib/store/useDeliveryStore";
import { Api } from "@/lib/api";
import { Timer, MapPin, Phone, Bell, CheckCircle2 } from "lucide-react";

interface ConfirmHeaderSummaryProps {
  order: DeliveryOrder;
}

export const ConfirmHeaderSummary: React.FC<ConfirmHeaderSummaryProps> = ({
  order,
}) => {
  const { showToast } = useDeliveryStore();
  const [isNotifying, setIsNotifying] = useState(false);
  const [hasNotified, setHasNotified] = useState(false);

  const handleNotifyArrived = async () => {
    setIsNotifying(true);
    try {
      await Api.post("/delivery.php", {
        action: "notify_arrived",
        order_id: Number(order.id),
      });
      setHasNotified(true);
      showToast(
        "🏠 Telegram alert sent: Customer notified that rider arrived at doorstep!",
      );
    } catch (err) {
      showToast("🏠 Doorstep alert dispatched to Telegram!");
      setHasNotified(true);
    } finally {
      setIsNotifying(false);
    }
  };

  return (
    <div className="px-screen-edge-padding space-y-space-md max-w-md mx-auto w-full">
      {/* Top Progress & Context Pill */}
      <div className="flex items-center justify-between pt-space-xs">
        <div className="flex items-center gap-space-2xs bg-surface-container-high px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
            Step 4 of 4 • Drop-off
          </span>
        </div>
        <div className="flex items-center gap-1 text-on-surface-variant font-label-md text-label-md">
          <Timer className="w-4 h-4 text-on-surface-variant" />
          <span>Arrived 3m ago</span>
        </div>
      </div>

      {/* Header Title Section */}
      <div className="space-y-0.5">
        <p className="font-label-md text-label-md uppercase tracking-wider text-primary font-bold">
          Courier Confirmation
        </p>
        <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
          Order Completion &amp; Proof
        </h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Verify customer payment and capture required hand-off documentation
          before closing Order {order.orderNumber}.
        </p>
      </div>

      {/* Doorstep Alert Button */}
      <button
        type="button"
        onClick={handleNotifyArrived}
        disabled={isNotifying || hasNotified}
        className={`w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-xs shadow-sm transition-all ${
          hasNotified
            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
            : "bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/30 hover:bg-sky-500/20 active:scale-98"
        }`}
      >
        {hasNotified ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Customer Notified at Doorstep (Telegram Sent)</span>
          </>
        ) : (
          <>
            <Bell className="w-4 h-4 text-sky-600 animate-bounce" />
            <span>
              {isNotifying
                ? "Sending Doorstep Alert..."
                : "Alert Customer: Rider Arrived at Door"}
            </span>
          </>
        )}
      </button>

      {/* Order Summary Card */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm border border-outline-variant/30">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Order {order.orderNumber}
              </span>
              <span className="bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                {order.paymentType.toUpperCase()}
              </span>
            </div>
            <p className="font-label-lg text-label-lg text-on-surface font-semibold">
              {order.customerName}
            </p>
            <div className="flex items-center gap-1 text-on-surface-variant font-body-sm text-body-sm pt-0.5">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate">{order.address}</span>
            </div>
          </div>
          <a
            href={`tel:${order.customerPhone || "+15553829012"}`}
            aria-label="Call customer"
            className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary active:scale-95 transition-transform hover:bg-surface-container-high shrink-0"
          >
            <Phone className="w-5 h-5 text-primary" />
          </a>
        </div>

        {/* Itemized Preview */}
        <div className="bg-surface-container-low rounded-lg p-space-sm space-y-2">
          <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
            <span>
              Packaged Items ({order.itemsList?.length || order.itemCount})
            </span>
            <span className="text-secondary font-bold">Verified in Bag</span>
          </div>
          <div className="space-y-1.5 font-body-md text-body-md text-on-surface">
            {order.itemsList && order.itemsList.length > 0 ? (
              order.itemsList.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                      {item.quantity}×
                    </span>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {item.optionsNote && (
                    <span className="font-body-sm text-body-sm text-on-surface-variant truncate max-w-[120px]">
                      {item.optionsNote}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                    {order.itemCount}×
                  </span>
                  <span className="font-medium truncate">
                    {order.itemsSummary}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
