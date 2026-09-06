"use client";

import React, { useState, useEffect } from "react";
import { ShiftStatusWidget } from "./my-deliveries/ShiftStatusWidget";
import { SegmentedDeliveryTabs, DeliveryTabMode } from "./my-deliveries/SegmentedDeliveryTabs";
import { ActiveDeliveryCard } from "./my-deliveries/ActiveDeliveryCard";
import { SecondaryDeliveryCard } from "./my-deliveries/SecondaryDeliveryCard";
import { CompletedDeliveryList, CompletedDeliveryItem } from "./my-deliveries/CompletedDeliveryList";
import { CourierSupportRibbon } from "./my-deliveries/CourierSupportRibbon";
import { CourierActionSheet, SheetType } from "./my-deliveries/CourierActionSheet";
import { useDeliveryStore } from "@/lib/store/useDeliveryStore";
import { Loader2, Bike } from "lucide-react";

export const MyDeliveriesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DeliveryTabMode>("in-progress");
  const [sheetType, setSheetType] = useState<SheetType>(null);
  const { myDeliveries, availableOrders, fetchLiveOrders, isLoading } = useDeliveryStore();

  useEffect(() => {
    fetchLiveOrders();
  }, [fetchLiveOrders]);

  const activeTasks = myDeliveries.filter((o) => o.deliveryStage !== "completed");
  const completedOrders = [...myDeliveries, ...availableOrders].filter(
    (o) => o.deliveryStage === "completed"
  );

  const completedItems: CompletedDeliveryItem[] = completedOrders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    deliveredTimeStr: "Delivered Today",
    customerName: o.customerName,
    addressAndPaymentStr: `${o.address} • $${o.totalPrice.toFixed(2)} ${o.paymentType.toUpperCase()}`,
    tipStr: o.tipAmount ? `+$${o.tipAmount.toFixed(2)} Tip` : "Completed",
  }));

  const primaryOrder = activeTasks[0];
  const secondaryOrders = activeTasks.slice(1);

  return (
    <div className="flex flex-col w-full px-screen-edge-padding pb-space-2xl space-y-space-md max-w-md mx-auto pt-2">
      {/* 1. Driver Shift Status Widget */}
      <ShiftStatusWidget
        activeTaskCount={activeTasks.length}
        districtName="Downtown Central • On Road"
        acceptanceRate="100% Rate"
      />

      {/* 2. Segmented Filter Tabs */}
      <SegmentedDeliveryTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        inProgressCount={activeTasks.length}
        completedCount={completedOrders.length}
      />

      {/* Loading Skeleton Indicator */}
      {isLoading && activeTasks.length === 0 && (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-on-surface-variant">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <span className="font-label-md text-xs font-bold">Syncing active deliveries...</span>
        </div>
      )}

      {/* 3. In Progress Tab Content */}
      {activeTab === "in-progress" && (
        <div className="flex flex-col space-y-space-md" id="active-tab-content">
          {primaryOrder ? (
            <>
              {/* Card #1: High Priority Active Delivery */}
              <ActiveDeliveryCard
                orderId={primaryOrder.id}
                orderNumber={primaryOrder.orderNumber}
                customerName={primaryOrder.customerName}
                customerPhone={primaryOrder.customerPhone || "5550192"}
                targetEtaTime={primaryOrder.eta}
                timeLeftStr="~10 mins left"
                address={primaryOrder.address}
                deliveryNotes={primaryOrder.dropOffInstruction || "Ring bell upon arrival."}
                routeInfo="Route optimized • Smooth traffic"
                distanceStr={primaryOrder.distance}
                codAmount={primaryOrder.paymentType === "cod" ? primaryOrder.codAmount || primaryOrder.totalPrice : undefined}
                onOpenSheet={(type) => setSheetType(type as SheetType)}
              />

              {/* Card #2+: Secondary Assigned Deliveries (Next in Queue) */}
              {secondaryOrders.map((order) => (
                <SecondaryDeliveryCard
                  key={order.id}
                  orderId={order.id}
                  orderNumber={order.orderNumber}
                  restaurantName="Bistro Kitchen HQ"
                  customerName={order.customerName}
                  distanceStr={order.distance}
                  estimatedTime={`Estimated ~${order.eta}`}
                  pickupAddress="Bistro Kitchen HQ"
                  dropoffAddress={order.address}
                  paymentType={order.paymentType}
                  totalPrice={order.totalPrice}
                />
              ))}
            </>
          ) : (
            !isLoading && (
              <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/30 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Bike className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">No Active Deliveries</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Accept new tickets from the Kitchen Dispatch feed.
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* 4. Completed Tab Content */}
      {activeTab === "completed" && <CompletedDeliveryList items={completedItems} />}

      {/* 5. Quick Courier Support Ribbon */}
      <CourierSupportRibbon onOpenSheet={(type) => setSheetType(type)} />

      {/* 6. Courier Bottom Action Drawer Modal */}
      <CourierActionSheet
        sheetType={sheetType}
        onClose={() => setSheetType(null)}
        orderNumber={primaryOrder?.orderNumber || "#1024"}
      />
    </div>
  );
};
