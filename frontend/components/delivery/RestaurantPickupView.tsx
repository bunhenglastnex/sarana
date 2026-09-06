"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDeliveryStore } from "@/lib/store/useDeliveryStore";
import { Api } from "@/lib/api";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { PickupHeroCard } from "./pickup/PickupHeroCard";
import { PickupRestaurantCard } from "./pickup/PickupRestaurantCard";
import { PickupChecklistCard, ChecklistItem } from "./pickup/PickupChecklistCard";
import { PickupActionBar } from "./pickup/PickupActionBar";
import {
  ArrowLeft,
  UtensilsCrossed,
  Bike,
  Info,
  Banknote,
} from "lucide-react";

interface RestaurantPickupViewProps {
  orderId?: string;
}

export const RestaurantPickupView: React.FC<RestaurantPickupViewProps> = ({
  orderId = "1024",
}) => {
  const router = useRouter();
  const { getOrderById, updateDeliveryStage, showToast, fetchLiveOrders } = useDeliveryStore();

  React.useEffect(() => {
    fetchLiveOrders();
  }, [fetchLiveOrders]);

  const order = getOrderById(orderId) || getOrderById("1024")!;

  const [statusState, setStatusState] = useState<
    "READY_FOR_DELIVERY" | "OUT_FOR_DELIVERY"
  >(order.deliveryStage === "picked_up" ? "OUT_FOR_DELIVERY" : "READY_FOR_DELIVERY");

  const [isConfirmed, setIsConfirmed] = useState(order.deliveryStage === "picked_up");

  // Checklist items
  const checklistItems: ChecklistItem[] = [
    {
      id: "chk-1",
      title: "2x Smoked Bacon Truffle Burger",
      category: "Main",
      note: "Brioche Bun • Extra Aged Cheddar",
    },
    {
      id: "chk-2",
      title: "1x Artisan Fries",
      category: "Side",
      note: "Rosemary Garlic Aioli Included",
    },
    {
      id: "chk-3",
      title: "2x Cold Craft Kola & Napkin Pack",
      category: "Beverage",
      note: "Chilled Cup Sleeve with Eco Straws",
    },
    {
      id: "chk-4",
      title: `Receipt ${order.orderNumber} • Thermal Seal`,
      category: "Security",
      note: "Tamper-evident heat sticker confirmed intact",
    },
  ];

  // Checked state map
  const [checkedState, setCheckedState] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    if (order.deliveryStage === "picked_up") {
      checklistItems.forEach((item) => (init[item.id] = true));
    }
    return init;
  });

  const handleToggle = (id: string) => {
    setCheckedState((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleToggleAll = () => {
    const allChecked = checklistItems.every((item) => checkedState[item.id]);
    const newState: Record<string, boolean> = {};
    checklistItems.forEach((item) => (newState[item.id] = !allChecked));
    setCheckedState(newState);
  };

  const allChecked = checklistItems.every((item) => checkedState[item.id]);
  const checkedCount = checklistItems.filter((item) => checkedState[item.id]).length;
  const remainingCount = checklistItems.length - checkedCount;

  const handleConfirmPickup = async () => {
    if (isConfirmed) {
      router.push(`/delivery/${order.id}/navigate`);
      return;
    }
    if (!allChecked) return;

    setIsConfirmed(true);
    setStatusState("OUT_FOR_DELIVERY");
    updateDeliveryStage(order.id, "picked_up");
    showToast(`Confirmed Pickup! Order ${order.orderNumber} is now Out for Delivery.`);

    try {
      const authUserId = useAuthStore.getState().userId;
      await Api.post("/delivery.php", {
        action: "pickup_from_kitchen",
        order_id: Number(order.id),
        staff_id: authUserId ? Number(authUserId) : undefined,
      });
    } catch (err) {
      console.error("Failed to record kitchen pickup on server:", err);
    }

    if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(100);
    }

    setTimeout(() => {
      router.push(`/delivery/${order.id}/navigate`);
    }, 1000);
  };

  return (
    <div className="flex flex-col relative w-full bg-surface min-h-screen text-on-surface">
      {/* Top Navigation Header */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-screen-edge-padding flex items-center justify-between gap-space-xs max-w-md mx-auto">
          <div className="flex items-center gap-space-xs min-w-0 flex-1">
            <button
              aria-label="Go back"
              type="button"
              onClick={() => router.back()}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-on-surface -ml-2 rounded-full hover:bg-surface-container-high transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <img
              alt="Amber & Ember Logo"
              className="h-8 w-8 rounded-md object-cover shrink-0 border border-outline-variant/40 shadow-xs"
              src="/logo.jpg"
            />
            <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight truncate leading-tight">
              Bistro Pickup Dispatch
            </h1>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-primary/20">
              <img
                alt="Courier Profile"
                className="w-8 h-8 rounded-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFgSCPH_D_P89baxhACYIj6Q2wbutJp62w19yulHEwoZj5uLw76X4auNlAQwC8QilaCC7ZLj8lg9-ds-zz6T47rTJ4pvLNsLVPjiItTdbl9mP6acLkdxcLMMIaLmJVi5XnnJ-J7Tk_h5KKbA1v3WW4xKpKXVsqigU8wcQTFIr37DBLz_ayvnYjOXC3Z9qpsw4ABYD21JrhKAmJ_4qduv1qd2qJIzLO0Bg-EoEkquOYxLGiPTrgQqDx"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Scroll Area */}
      <div className="flex flex-col w-full pt-16 pb-[100px] max-w-md mx-auto">
        {/* Visual Status Pill & Notice Header */}
        <div className="px-screen-edge-padding pt-space-xs pb-space-sm flex items-center justify-between">
          <div className="flex items-center gap-space-2xs">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-secondary-container animate-pulse"></span>
            <span className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase font-semibold">
              Bistro Pickup Dispatch
            </span>
          </div>
          <div
            className={`px-3 py-1 rounded-full flex items-center gap-1.5 transition-colors duration-300 ${
              statusState === "OUT_FOR_DELIVERY"
                ? "bg-primary text-on-primary font-bold shadow-xs"
                : "bg-secondary-container/20 text-on-secondary-fixed-variant font-bold"
            }`}
          >
            {statusState === "OUT_FOR_DELIVERY" ? (
              <Bike className="w-4 h-4 text-on-primary" />
            ) : (
              <UtensilsCrossed className="w-4 h-4 text-secondary" />
            )}
            <span className="font-label-sm text-label-sm uppercase tracking-wide">
              {statusState}
            </span>
          </div>
        </div>

        {/* Hero Order Identifier Card */}
        <PickupHeroCard order={order} />

        {/* Dispatch Verification Alert Banner */}
        <div className="px-screen-edge-padding mb-space-md">
          <div className="bg-primary-fixed/40 rounded-xl p-space-sm flex items-start gap-space-xs shadow-sm">
            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="font-body-sm text-body-sm text-on-surface leading-snug">
              Confirm that you have received the complete order from the restaurant expediter before departing.
            </p>
          </div>
        </div>

        {/* Restaurant Information Bento Card */}
        <PickupRestaurantCard order={order} />

        {/* Cash on Delivery Notice Card */}
        {order.paymentType === "cod" && (
          <div className="px-screen-edge-padding mb-space-md">
            <div className="bg-surface-container-low rounded-xl p-card-inner-padding shadow-sm flex items-center gap-space-sm">
              <div className="w-12 h-12 rounded-xl bg-secondary-container/30 text-secondary flex items-center justify-center shrink-0">
                <Banknote className="w-6 h-6 text-secondary" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="font-label-sm text-label-sm uppercase font-bold text-secondary tracking-wider">
                    Payment Protocol
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface font-medium leading-snug">
                  Order is Cash on Delivery — Remember to collect{" "}
                  <strong className="font-bold text-primary font-headline-sm text-headline-sm align-baseline">
                    ${(order.codAmount || order.totalPrice).toFixed(2)}
                  </strong>{" "}
                  at door
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Order Package Verification Checklist */}
        <PickupChecklistCard
          items={checklistItems}
          checkedState={checkedState}
          onToggle={handleToggle}
          onToggleAll={handleToggleAll}
          isConfirmed={isConfirmed}
        />
      </div>

      {/* Sticky Departure Confirmation Action Bar */}
      <PickupActionBar
        allChecked={allChecked}
        remainingCount={remainingCount}
        isConfirmed={isConfirmed}
        onConfirm={handleConfirmPickup}
      />
    </div>
  );
};
