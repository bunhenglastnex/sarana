"use client";

import React, { useState } from "react";
import { OrderRecord } from "@/types/orders";
import { OrderSubHeader } from "@/components/admin/orders/OrderSubHeader";
import { OrderDirectory } from "@/components/admin/orders/OrderDirectory";
import { OrderInspector } from "@/components/admin/orders/OrderInspector";

const mockOrders: OrderRecord[] = [
  {
    id: "#1026",
    customerName: "David Chen",
    customerPhone: "+1 (555) 234-9912",
    customerTag: "First Order",
    channel: "delivery",
    channelLabel: "Direct Delivery",
    placedTimeLabel: "19:22",
    timeAgoLabel: "3m ago",
    status: "pending",
    statusLabel: "PENDING",
    itemsSummary: "2x Smoked Angus Burger, 1x Truffle Fries",
    totalItemsCount: 3,
    totalPrice: 29.5,
    subtotal: 29.5,
    deliveryFee: 0,
    discount: 0,
    tax: 2.5,
    paymentMethod: "khqr",
    paymentBadgeLabel: "PAID (KHQR)",
    paymentIsPaid: true,
    deliveryAddress: "520 N Michigan Ave, Apt 14F",
    deliveryAddressCity: "Chicago, IL 60611",
    deliveryNote: "Ring buzzer 14F on arrival",
    kitchenStation: "Main Hearth",
    estimatedPrepMinutes: 15,
    lifecycleStep: 1,
    items: [
      {
        id: "item-26a",
        name: "Smoked Angus Burger",
        price: 23.0,
        quantity: 2,
        basePrice: 11.5,
        modifiers: [{ text: "Medium-Rare" }, { text: "Brioche Bun" }],
      },
      {
        id: "item-26b",
        name: "Truffle Parmesan Fries",
        price: 6.5,
        quantity: 1,
      },
    ],
  },
  {
    id: "#1025",
    customerName: "Clara Oswald",
    customerPhone: "+1 (555) 604-3382",
    customerTag: "Regular Guest",
    channel: "pickup",
    channelLabel: "Express Pickup",
    placedTimeLabel: "19:18",
    timeAgoLabel: "7m ago",
    status: "pending",
    statusLabel: "PENDING",
    itemsSummary: "1x Woodfire Burrata Salad",
    totalItemsCount: 1,
    totalPrice: 15.0,
    subtotal: 15.0,
    deliveryFee: 0,
    discount: 0,
    tax: 1.27,
    paymentMethod: "cash",
    paymentBadgeLabel: "Unpaid Counter",
    paymentIsPaid: false,
    kitchenStation: "Cold Larder",
    estimatedPrepMinutes: 10,
    lifecycleStep: 1,
    items: [
      {
        id: "item-25a",
        name: "Woodfire Burrata Salad",
        price: 15.0,
        quantity: 1,
        modifiers: [{ text: "Dressing on Side" }],
      },
    ],
  },
  {
    id: "#1024",
    customerName: "John Smith",
    customerPhone: "+1 (555) 382-9012",
    customerTag: "14th Order (VIP)",
    channel: "delivery",
    channelLabel: "Direct Delivery",
    placedTimeLabel: "19:15",
    timeAgoLabel: "12m ago",
    status: "preparing",
    statusLabel: "PREPARING",
    itemsSummary: "2x Truffle Burger, 1x Fries...",
    totalItemsCount: 5,
    totalPrice: 34.5,
    subtotal: 34.5,
    deliveryFee: 0,
    discount: 2.5,
    tax: 2.92,
    paymentMethod: "cod",
    paymentBadgeLabel: "COD Unpaid",
    paymentIsPaid: false,
    deliveryAddress: "742 Evergreen Terr, Apt 3B, River North",
    deliveryAddressCity: "Chicago, IL 60654 (Building entry buzzer: #0392)",
    deliveryNote: "Leave at front door, ring bell twice.",
    kitchenStation: "Grill & Fryer",
    estimatedPrepMinutes: 8,
    lifecycleStep: 3,
    items: [
      {
        id: "item-1",
        name: "Smoked Bacon Truffle Burger",
        price: 22.5,
        quantity: 2,
        basePrice: 11.25,
        imageUrl:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop",
        modifiers: [
          { text: "Brioche Bun" },
          { text: "Extra Aged Cheddar" },
          { text: "Med-Well Done", isAlert: true },
        ],
      },
      {
        id: "item-2",
        name: "Artisan Rosemary Fries",
        price: 6.0,
        quantity: 1,
        unitDescription: "Large Basket",
        modifiers: [
          { text: "Rosemary Sea Salt" },
          { text: "Truffle Mayo Dip" },
        ],
      },
      {
        id: "item-3",
        name: "Cold Craft Kola (Glass Bottles)",
        price: 6.0,
        quantity: 2,
        basePrice: 3.0,
        unitDescription: "Chilled 330ml bottles",
        modifiers: [{ text: "Cane Sugar Recipe" }],
      },
    ],
  },
  {
    id: "#1023",
    customerName: "Sophia Lin",
    customerPhone: "+1 (555) 492-1084",
    channel: "pickup",
    channelLabel: "Express Pickup",
    placedTimeLabel: "19:08",
    timeAgoLabel: "19m ago",
    status: "ready",
    statusLabel: "READY (STAGE)",
    itemsSummary: "1x Woodfire Smoked Ribs",
    totalItemsCount: 2,
    totalPrice: 28.0,
    subtotal: 28.0,
    deliveryFee: 0,
    discount: 0,
    tax: 2.37,
    paymentMethod: "apple_pay",
    paymentBadgeLabel: "Paid • Apple",
    paymentIsPaid: true,
    kitchenStation: "Hearth Smoker",
    estimatedPrepMinutes: 0,
    lifecycleStep: 4,
    items: [
      {
        id: "item-4",
        name: "Woodfire Smoked Ribs Platter",
        price: 28.0,
        quantity: 1,
        modifiers: [{ text: "House BBQ Sauce" }, { text: "Extra Slaw" }],
      },
    ],
  },
  {
    id: "#1022",
    customerName: "Marcus Vance",
    customerPhone: "+1 (555) 891-2240",
    channel: "delivery",
    channelLabel: "Courier Assigned",
    placedTimeLabel: "18:55",
    timeAgoLabel: "32m ago",
    status: "in_transit",
    statusLabel: "IN TRANSIT",
    itemsSummary: "3x Ember Smash Sliders",
    totalItemsCount: 4,
    totalPrice: 41.2,
    subtotal: 41.2,
    deliveryFee: 3.0,
    discount: 0,
    tax: 3.5,
    paymentMethod: "card",
    paymentBadgeLabel: "Paid • Card",
    paymentIsPaid: true,
    deliveryAddress: "128 W Huron St, Suite 500",
    deliveryAddressCity: "Chicago, IL 60654",
    kitchenStation: "Sliders Line",
    estimatedPrepMinutes: 0,
    lifecycleStep: 5,
    items: [
      {
        id: "item-5",
        name: "Ember Smash Sliders",
        price: 33.0,
        quantity: 3,
        basePrice: 11.0,
        modifiers: [{ text: "Grilled Onions" }, { text: "Special Sauce" }],
      },
      {
        id: "item-6",
        name: "Sweet Potato Chips",
        price: 8.2,
        quantity: 1,
      },
    ],
  },
  {
    id: "#1021",
    customerName: "Amina Patel",
    customerPhone: "+1 (555) 773-4019",
    channel: "delivery",
    channelLabel: "Direct Delivery",
    placedTimeLabel: "18:42",
    timeAgoLabel: "45m ago",
    status: "delivered",
    statusLabel: "DELIVERED",
    itemsSummary: "2x Charred Ember Wings",
    totalItemsCount: 2,
    totalPrice: 24.0,
    subtotal: 24.0,
    deliveryFee: 0,
    discount: 0,
    tax: 2.04,
    paymentMethod: "card",
    paymentBadgeLabel: "Paid • Card",
    paymentIsPaid: true,
    deliveryAddress: "401 N Wabash Ave, Apt 18A",
    deliveryAddressCity: "Chicago, IL 60611",
    kitchenStation: "Fryer 2",
    estimatedPrepMinutes: 0,
    lifecycleStep: 6,
    items: [
      {
        id: "item-7",
        name: "Charred Ember Wings",
        price: 24.0,
        quantity: 2,
        basePrice: 12.0,
        modifiers: [{ text: "Chipotle Glaze" }, { text: "Blue Cheese Dip" }],
      },
    ],
  },
  {
    id: "#1019",
    customerName: "Elena Vance",
    customerPhone: "+1 (555) 301-4490",
    channel: "delivery",
    channelLabel: "Direct Delivery",
    placedTimeLabel: "18:15",
    timeAgoLabel: "1h 12m ago",
    status: "cancelled",
    statusLabel: "CANCELLED",
    cancelReason: "Customer requested cancellation due to address change & item sold out.",
    itemsSummary: "1x Hearth-Smoked Angus Ribs, 1x Truffle Fries",
    totalItemsCount: 2,
    totalPrice: 38.5,
    subtotal: 38.5,
    deliveryFee: 0,
    discount: 0,
    tax: 3.12,
    paymentMethod: "khqr",
    paymentBadgeLabel: "REFUNDED KHQR",
    paymentIsPaid: false,
    kitchenStation: "Hearth Smoker",
    estimatedPrepMinutes: 0,
    lifecycleStep: 1,
    items: [
      {
        id: "item-19a",
        name: "Hearth-Smoked Angus Ribs",
        price: 32.0,
        quantity: 1,
      },
      {
        id: "item-19b",
        name: "Truffle Parmesan Fries",
        price: 6.5,
        quantity: 1,
      },
    ],
  },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>(mockOrders);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("#1026");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const selectedOrder =
    orders.find((o) => o.id === selectedOrderId) || orders[0];

  const handleAction = (action: string, orderId: string) => {
    if (action === "mark_ready") {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: "ready",
                statusLabel: "READY (STAGE)",
                lifecycleStep: 4,
              }
            : o
        )
      );
    } else if (action === "cancel") {
      const reason = prompt("Enter cancellation reason for customer:", "Out of stock / Kitchen reject") || "Cancelled by expediter";
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: "cancelled",
                statusLabel: "CANCELLED",
                cancelReason: reason,
                paymentBadgeLabel: "REFUNDED / CANCELLED",
                paymentIsPaid: false,
              }
            : o
        )
      );
    } else if (action === "verify_admin") {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                isAdminVerified: true,
                paymentIsPaid: true,
                paymentBadgeLabel: "COD Paid (Admin Verified)",
              }
            : o
        )
      );
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }

    if (statusFilter === "all") return true;
    if (statusFilter === "pending") return o.status === "pending";
    if (statusFilter === "preparing") return o.status === "preparing";
    if (statusFilter === "ready") return o.status === "ready";
    if (statusFilter === "delivery") return o.channel === "delivery";
    if (statusFilter === "pickup") return o.channel === "pickup";
    if (statusFilter === "completed")
      return o.status === "delivered" || o.status === "picked_up";
    if (statusFilter === "cancelled") return o.status === "cancelled";

    return true;
  });

  const prepCount = orders.filter((o) => o.status === "preparing").length;
  const dispatchCount = orders.filter(
    (o) => o.status === "in_transit" || o.channel === "delivery"
  ).length;
  const codPendingTotal = orders
    .filter((o) => !o.paymentIsPaid && o.paymentMethod === "cod")
    .reduce((sum, o) => sum + o.totalPrice, 0);

  return (
    <div className="flex flex-col w-full min-h-screen pb-space-2xl">
      {/* Sub-Header / Operational Control Strip */}
      <OrderSubHeader
        activeCount={orders.length}
        prepCount={prepCount}
        dispatchCount={dispatchCount}
        codPendingTotal={codPendingTotal}
      />

      {/* Main 2-Column Split Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
        {/* LEFT COLUMN: Order Directory & Filtering (8 cols on XL) */}
        <div className="xl:col-span-8">
          <OrderDirectory
            orders={filteredOrders}
            allOrders={orders}
            selectedOrderId={selectedOrderId}
            onSelectOrder={setSelectedOrderId}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onRefresh={() => setOrders([...mockOrders])}
          />
        </div>

        {/* RIGHT COLUMN: Open Order Slide-Over Inspector (#1024 default) (5 cols on XL) */}
        {selectedOrder && (
          <OrderInspector
            key={selectedOrder.id}
            order={selectedOrder}
            onClose={() => setSelectedOrderId("")}
            onAction={handleAction}
          />
        )}
      </div>
    </div>
  );
}
