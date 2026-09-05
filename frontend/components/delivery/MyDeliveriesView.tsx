"use client";

import React, { useState } from "react";
import { ShiftStatusWidget } from "./my-deliveries/ShiftStatusWidget";
import { SegmentedDeliveryTabs, DeliveryTabMode } from "./my-deliveries/SegmentedDeliveryTabs";
import { ActiveDeliveryCard } from "./my-deliveries/ActiveDeliveryCard";
import { SecondaryDeliveryCard } from "./my-deliveries/SecondaryDeliveryCard";
import { CompletedDeliveryList } from "./my-deliveries/CompletedDeliveryList";
import { CourierSupportRibbon } from "./my-deliveries/CourierSupportRibbon";
import { CourierActionSheet, SheetType } from "./my-deliveries/CourierActionSheet";

export const MyDeliveriesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DeliveryTabMode>("in-progress");
  const [sheetType, setSheetType] = useState<SheetType>(null);

  return (
    <div className="flex flex-col w-full px-screen-edge-padding pb-space-2xl space-y-space-md max-w-md mx-auto pt-2">
      {/* 1. Driver Shift Status Widget */}
      <ShiftStatusWidget
        activeTaskCount={2}
        districtName="Woodfire District • On Road"
        acceptanceRate="100% Rate"
      />

      {/* 2. Segmented Filter Tabs */}
      <SegmentedDeliveryTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        inProgressCount={2}
        completedCount={6}
      />

      {/* 3. In Progress Tab Content */}
      {activeTab === "in-progress" && (
        <div className="flex flex-col space-y-space-md" id="active-tab-content">
          {/* Card #1: High Priority Active Delivery */}
          <ActiveDeliveryCard
            orderId="1024"
            orderNumber="Order #1024"
            customerName="John Smith"
            customerPhone="5550192"
            targetEtaTime="7:35 PM"
            timeLeftStr="~8 mins left"
            address="742 Evergreen Terr, Apt 3B"
            deliveryNotes="Gate Code: #4820 • Leave at door mat"
            routeInfo="Route optimized • Smooth traffic"
            distanceStr="0.9 mi"
            codAmount={34.5}
            onOpenSheet={(type) => setSheetType(type as SheetType)}
          />

          {/* Card #2: Secondary Assigned Delivery (Next in Queue) */}
          <SecondaryDeliveryCard
            orderId="1027"
            orderNumber="Order #1026"
            restaurantName="Bistro Hearth"
            customerName="Sarah Jenkins"
            distanceStr="2.1 mi"
            estimatedTime="Estimated ~14m"
            pickupAddress="Bistro Hearth Woodfire"
            dropoffAddress="150 Oakwood Blvd"
            paymentType="khqr"
            totalPrice={22.0}
          />
        </div>
      )}

      {/* 4. Completed Tab Content */}
      {activeTab === "completed" && <CompletedDeliveryList />}

      {/* 5. Quick Courier Support Ribbon */}
      <CourierSupportRibbon
        onOpenSheet={(type) => setSheetType(type)}
      />

      {/* 6. Courier Bottom Action Drawer Modal */}
      <CourierActionSheet
        sheetType={sheetType}
        onClose={() => setSheetType(null)}
        orderNumber="#1024"
      />
    </div>
  );
};
