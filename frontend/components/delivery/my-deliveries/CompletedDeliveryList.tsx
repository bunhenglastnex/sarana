"use client";

import React from "react";

export interface CompletedDeliveryItem {
  id: string;
  orderNumber: string;
  deliveredTimeStr: string;
  customerName: string;
  addressAndPaymentStr: string;
  tipStr: string;
}

const DEFAULT_COMPLETED_ITEMS: CompletedDeliveryItem[] = [
  {
    id: "1019",
    orderNumber: "Order #1019",
    deliveredTimeStr: "Delivered 6:45 PM",
    customerName: "Marcus Vance",
    addressAndPaymentStr: "424 Elm St • $42.00 KHQR",
    tipStr: "+$4.50 Tip",
  },
  {
    id: "1015",
    orderNumber: "Order #1015",
    deliveredTimeStr: "Delivered 5:50 PM",
    customerName: "Elena Rostova",
    addressAndPaymentStr: "88 Pine Rd • $19.20 Card",
    tipStr: "+$3.00 Tip",
  },
];

interface CompletedDeliveryListProps {
  items?: CompletedDeliveryItem[];
}

export const CompletedDeliveryList: React.FC<CompletedDeliveryListProps> = ({
  items = DEFAULT_COMPLETED_ITEMS,
}) => {
  return (
    <div className="flex flex-col space-y-space-sm" id="completed-tab-content">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-xs border border-outline-variant/20"
        >
          <div className="flex justify-between items-center">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {item.orderNumber} • {item.deliveredTimeStr}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-label-sm text-label-sm font-bold">
              Completed
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-headline-sm text-headline-sm font-bold text-on-surface">
                {item.customerName}
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {item.addressAndPaymentStr}
              </p>
            </div>
            <span className="font-label-md text-label-md text-emerald-700 font-bold">
              {item.tipStr}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
