"use client";

import React, { useState } from "react";
import { KdsTicket } from "@/types/kds";
import { KdsSubHeader } from "@/components/admin/kds/KdsSubHeader";
import { KdsKanbanColumn } from "@/components/admin/kds/KdsKanbanColumn";

const initialTickets: KdsTicket[] = [
  // COLUMN 1: PENDING
  {
    id: "#1084",
    channel: "delivery",
    status: "pending",
    timerLabel: "2m 15s",
    isUrgent: true,
    customerName: "Marcus Vance",
    locationOrNote: "Table/Flat 4B",
    paymentBadge: "KHQR PAID",
    paymentIsPaid: true,
    proofImageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTW_nSl8ar5rgvxpgYec8c80SO7FC8JTpLhfNGATJtMEA&s=10",
    totalPrice: 23.0,
    items: [
      {
        name: "Hearth-Smoked Angus Burger",
        price: 16.5,
        quantity: 1,
        modifiers: [
          { text: "Medium-Rare" },
          { text: "EXTRA ROASTED AIOLI", isAlert: true },
          { text: "Brioche Bun" },
        ],
      },
      {
        name: "Truffle Parmesan Fries",
        price: 6.5,
        quantity: 1,
        modifiers: [{ text: "Extra Rosemary Salt" }],
      },
    ],
  },
  {
    id: "#1085",
    channel: "pickup",
    status: "pending",
    timerLabel: "Just now",
    customerName: "Nadia S.",
    paymentBadge: "COD $19.50",
    paymentIsPaid: false,
    totalPrice: 19.5,
    items: [
      {
        name: "Woodfired Crispy Chicken Strips",
        price: 14.5,
        quantity: 1,
        modifiers: [
          { text: "SPICY CHIPOTLE DIP", isPrimary: true },
          { text: "Honey Mustard side" },
        ],
      },
      {
        name: "Charred Citrus Lemonade",
        price: 5.0,
        quantity: 1,
      },
    ],
  },

  // COLUMN 2: ACCEPTED
  {
    id: "#1082",
    channel: "delivery",
    status: "accepted",
    timerLabel: "Accepted 4m ago",
    customerName: "David Chen",
    paymentBadge: "PAID (CARD)",
    paymentIsPaid: true,
    totalPrice: 41.5,
    assignStation: "Hearth 1",
    items: [
      {
        name: "Ember Double Smash Cheeseburger",
        price: 16.0,
        quantity: 2,
        modifiers: [
          { text: "NO PICKLES (ALLERGY)", isAlert: true },
          { text: "Well Done" },
        ],
      },
      {
        name: "Smoked Pork Belly Bites",
        price: 9.5,
        quantity: 1,
      },
    ],
  },
  {
    id: "#1083",
    channel: "pickup",
    status: "accepted",
    timerLabel: "Accepted 2m ago",
    customerName: "Tariq J.",
    paymentBadge: "PAID KHQR",
    paymentIsPaid: true,
    proofImageUrl:
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500&auto=format&fit=crop",
    totalPrice: 15.0,
    assignStation: "Cold Larder",
    items: [
      {
        name: "Woodfire Burrata Salad",
        price: 15.0,
        quantity: 1,
        modifiers: [{ text: "Dressing on side" }],
      },
    ],
  },

  // COLUMN 3: PREPARING
  {
    id: "#1080",
    channel: "delivery",
    status: "preparing",
    timerLabel: "14m / 18m",
    prepProgress: 78,
    customerName: "Alex Rivera",
    assignStation: "Hearth Station 1",
    paymentBadge: "PAID (KHQR)",
    paymentIsPaid: true,
    proofImageUrl:
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop",
    totalPrice: 23.5,
    items: [
      {
        name: "Amber Signature Smoked Burger",
        price: 18.5,
        quantity: 1,
        modifiers: [
          { text: "GLUTEN-FREE BUN", isAlert: true },
          { text: "Medium" },
        ],
      },
      {
        name: "Hand-Cut Salted Chips",
        price: 5.0,
        quantity: 1,
      },
    ],
  },
  {
    id: "#1081",
    channel: "pickup",
    status: "preparing",
    timerLabel: "06m / 15m",
    prepProgress: 40,
    customerName: "Clara Oswald",
    assignStation: "Fryer & Sides",
    paymentBadge: "PAID (COUNTER)",
    paymentIsPaid: true,
    totalPrice: 28.0,
    items: [
      {
        name: "Woodfire Crispy Chicken Platter",
        price: 14.0,
        quantity: 2,
        modifiers: [{ text: "Side of Tartar & Slaw" }],
      },
    ],
  },

  // COLUMN 4: READY
  {
    id: "#1078",
    channel: "pickup",
    status: "ready",
    readySubtype: "pickup",
    shelfOrBag: "Pickup Shelf A2",
    readyTimeAgo: "Ready 3m ago",
    customerName: "Julian Thorne",
    paymentBadge: "PAID (KHQR)",
    paymentIsPaid: true,
    proofImageUrl:
      "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=500&auto=format&fit=crop",
    totalPrice: 27.0,
    items: [
      {
        name: "Charred Ribeye Slices",
        price: 20.0,
        quantity: 1,
      },
      {
        name: "Roasted Squash Purée",
        price: 7.0,
        quantity: 1,
      },
    ],
  },
  {
    id: "#1079",
    channel: "delivery",
    status: "ready",
    readySubtype: "delivery",
    shelfOrBag: "Delivery Bag #04",
    readyTimeAgo: "Ready 5m ago",
    customerName: "Sophia Lin",
    paymentBadge: "Awaiting Rider",
    paymentIsPaid: false,
    totalPrice: 31.0,
    items: [
      {
        name: "Hearth Bacon Burger",
        price: 18.0,
        quantity: 1,
      },
      {
        name: "Sweet Potato Chips",
        price: 6.0,
        quantity: 1,
      },
      {
        name: "Aioli",
        price: 7.0,
        quantity: 1,
      },
    ],
  },
];

export default function LiveOrderBoardPage() {
  const [tickets, setTickets] = useState<KdsTicket[]>(initialTickets);
  const [filter, setFilter] = useState<"all" | "delivery" | "pickup">("all");
  const [isPassStationOpen, setIsPassStationOpen] = useState(false);

  const handleAction = (action: string, ticketId: string, reason?: string) => {
    if (action === "reject") {
      setTickets((prev) => prev.filter((t) => t.id !== ticketId));
      if (reason) {
        alert(`Ticket ${ticketId} rejected.\nRejection reason sent to customer: "${reason}"`);
      }
      return;
    }
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        if (action === "accept") return { ...t, status: "accepted" };
        if (action === "start_prep")
          return {
            ...t,
            status: "preparing",
            prepProgress: 15,
            timerLabel: "02m / 15m",
          };
        if (action === "mark_ready")
          return {
            ...t,
            status: "ready",
            readySubtype: t.channel,
            readyTimeAgo: "Just ready",
          };
        return t;
      }),
    );
  };

  const filteredTickets = tickets.filter((t) => {
    if (filter === "delivery") return t.channel === "delivery";
    if (filter === "pickup") return t.channel === "pickup";
    return true;
  });

  const pendingTickets = filteredTickets.filter((t) => t.status === "pending");
  const acceptedTickets = filteredTickets.filter(
    (t) => t.status === "accepted",
  );
  const preparingTickets = filteredTickets.filter(
    (t) => t.status === "preparing",
  );
  const readyTickets = filteredTickets.filter((t) => t.status === "ready");

  const activeCount = tickets.length;
  const deliveryCount = tickets.filter((t) => t.channel === "delivery").length;
  const pickupCount = tickets.filter((t) => t.channel === "pickup").length;

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* KDS Sub-Header & Live Expediter Controls */}
      <KdsSubHeader
        activeCount={activeCount}
        deliveryCount={deliveryCount}
        pickupCount={pickupCount}
        readyCount={readyTickets.length}
        currentFilter={filter}
        onFilterChange={setFilter}
      />

      {/* 3-Column Expediter Workflow Kanban Grid */}
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
    </div>
  );
}
