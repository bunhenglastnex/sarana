"use client";

import React, { useState, useEffect } from "react";
import { CustomerRecord, CustomerTag } from "@/types/customers";
import { CustomerSubHeader } from "@/components/admin/customers/CustomerSubHeader";
import { CustomerDirectoryTable } from "@/components/admin/customers/CustomerDirectoryTable";
import { CustomerInspector } from "@/components/admin/customers/CustomerInspector";
import { AddCustomerModal } from "@/components/admin/customers/AddCustomerModal";

const initialCustomers: CustomerRecord[] = [
  {
    id: "CUST-101",
    name: "David Chen",
    phone: "+1 (555) 234-9912",
    email: "david.chen@example.com",
    tag: "VIP",
    totalOrders: 18,
    totalSpend: 542.5,
    preferredChannel: "delivery",
    paymentPreference: "KHQR",
    lastOrderDate: "Today, 19:22",
    address: "520 N Michigan Ave, Apt 14F, Chicago, IL 60611",
    notes: "Ring buzzer 14F on arrival. Prefers extra roasted aioli.",
    orders: [
      {
        id: "#1082",
        dateLabel: "Today, 19:22",
        itemsSummary: "2x Smoked Angus Burger, 1x Truffle Fries",
        totalPrice: 41.5,
        channel: "delivery",
        paymentBadge: "KHQR PAID",
        paymentIsPaid: true,
        proofImageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTW_nSl8ar5rgvxpgYec8c80SO7FC8JTpLhfNGATJtMEA&s=10",
      },
      {
        id: "#1026",
        dateLabel: "Yesterday",
        itemsSummary: "1x Smoked Ribs Platter, 1x Kola",
        totalPrice: 29.5,
        channel: "delivery",
        paymentBadge: "KHQR PAID",
        paymentIsPaid: true,
        proofImageUrl:
          "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500&auto=format&fit=crop",
      },
      {
        id: "#0998",
        dateLabel: "3 days ago",
        itemsSummary: "3x Ember Smash Sliders",
        totalPrice: 38.0,
        channel: "delivery",
        paymentBadge: "PAID (CARD)",
        paymentIsPaid: true,
      },
    ],
  },
  {
    id: "CUST-102",
    name: "Clara Oswald",
    phone: "+1 (555) 604-3382",
    email: "clara.oswald@example.com",
    tag: "Regular",
    totalOrders: 12,
    totalSpend: 328.0,
    preferredChannel: "pickup",
    paymentPreference: "KHQR / Cash",
    lastOrderDate: "Today, 19:18",
    address: "182 W Superior St, Chicago, IL 60654",
    notes: "Dressing on side for salads. Prefers express pickup.",
    orders: [
      {
        id: "#1081",
        dateLabel: "Today, 19:18",
        itemsSummary: "2x Woodfire Crispy Chicken Platter",
        totalPrice: 28.0,
        channel: "pickup",
        paymentBadge: "PAID (COUNTER)",
        paymentIsPaid: true,
      },
      {
        id: "#1025",
        dateLabel: "Oct 22, 2026",
        itemsSummary: "1x Woodfire Burrata Salad",
        totalPrice: 15.0,
        channel: "pickup",
        paymentBadge: "Unpaid Counter",
        paymentIsPaid: false,
      },
    ],
  },
  {
    id: "CUST-103",
    name: "Marcus Vance",
    phone: "+1 (555) 891-2240",
    email: "marcus.vance@example.com",
    tag: "High Spend",
    totalOrders: 9,
    totalSpend: 412.2,
    preferredChannel: "delivery",
    paymentPreference: "KHQR",
    lastOrderDate: "Today, 18:55",
    address: "128 W Huron St, Suite 500, Chicago, IL 60654",
    notes: "Leave at front desk with security guard.",
    orders: [
      {
        id: "#1084",
        dateLabel: "Today, 18:55",
        itemsSummary: "1x Hearth Angus Burger, 1x Truffle Fries",
        totalPrice: 23.0,
        channel: "delivery",
        paymentBadge: "KHQR PAID",
        paymentIsPaid: true,
        proofImageUrl:
          "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop",
      },
      {
        id: "#1022",
        dateLabel: "Oct 20, 2026",
        itemsSummary: "3x Ember Smash Sliders",
        totalPrice: 41.2,
        channel: "delivery",
        paymentBadge: "PAID (CARD)",
        paymentIsPaid: true,
      },
    ],
  },
  {
    id: "CUST-104",
    name: "Sophia Lin",
    phone: "+1 (555) 492-1084",
    email: "sophia.lin@example.com",
    tag: "New",
    totalOrders: 3,
    totalSpend: 87.0,
    preferredChannel: "pickup",
    paymentPreference: "KHQR",
    lastOrderDate: "Today, 19:08",
    address: "742 Evergreen Terr, Apt 3B, Chicago, IL 60654",
    notes: "Allergic to peanuts.",
    orders: [
      {
        id: "#1079",
        dateLabel: "Today, 19:08",
        itemsSummary: "1x Hearth Bacon Burger, 1x Sweet Potato Chips",
        totalPrice: 31.0,
        channel: "delivery",
        paymentBadge: "Awaiting Rider",
        paymentIsPaid: false,
      },
      {
        id: "#1023",
        dateLabel: "Oct 18, 2026",
        itemsSummary: "1x Woodfire Smoked Ribs Platter",
        totalPrice: 28.0,
        channel: "pickup",
        paymentBadge: "Paid • Apple",
        paymentIsPaid: true,
      },
    ],
  },
  {
    id: "CUST-105",
    name: "Alex Rivera",
    phone: "+1 (555) 382-9012",
    email: "alex.rivera@example.com",
    tag: "Regular",
    totalOrders: 14,
    totalSpend: 395.0,
    preferredChannel: "delivery",
    paymentPreference: "KHQR",
    lastOrderDate: "Today, 18:40",
    address: "401 N Wabash Ave, Apt 18A, Chicago, IL 60611",
    notes: "Extra spicy sauce on all burgers.",
    orders: [
      {
        id: "#1080",
        dateLabel: "Today, 18:40",
        itemsSummary: "1x Amber Signature Smoked Burger",
        totalPrice: 23.5,
        channel: "delivery",
        paymentBadge: "PAID (KHQR)",
        paymentIsPaid: true,
        proofImageUrl:
          "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=500&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "CUST-106",
    name: "Julian Thorne",
    phone: "+1 (555) 773-4019",
    email: "julian.thorne@example.com",
    tag: "VIP",
    totalOrders: 22,
    totalSpend: 684.0,
    preferredChannel: "pickup",
    paymentPreference: "KHQR",
    lastOrderDate: "Today, 18:30",
    address: "333 N Dearborn St, Chicago, IL 60654",
    notes: "Prefers well-done steak / ribeye slices.",
    orders: [
      {
        id: "#1078",
        dateLabel: "Today, 18:30",
        itemsSummary: "1x Charred Ribeye Slices",
        totalPrice: 27.0,
        channel: "pickup",
        paymentBadge: "PAID (KHQR)",
        paymentIsPaid: true,
        proofImageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTW_nSl8ar5rgvxpgYec8c80SO7FC8JTpLhfNGATJtMEA&s=10",
      },
    ],
  },
];

export default function CustomersPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [customers, setCustomers] = useState<CustomerRecord[]>(initialCustomers);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("CUST-101");
  const [filterTag, setFilterTag] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const selectedCustomer =
    customers.find((c) => c.id === selectedCustomerId) || customers[0];

  const handleAddCustomer = (newCustomer: CustomerRecord) => {
    setCustomers((prev) => [newCustomer, ...prev]);
    setSelectedCustomerId(newCustomer.id);
    setShowAddModal(false);
  };

  const handleUpdateTag = (customerId: string, newTag: CustomerTag) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, tag: newTag } : c))
    );
  };

  const filteredCustomers = customers.filter((c) => {
    if (filterTag === "vip") return c.tag === "VIP";
    if (filterTag === "regular") return c.tag === "Regular";
    if (filterTag === "high_spend") return c.tag === "High Spend";
    if (filterTag === "new") return c.tag === "New";

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.address && c.address.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpend, 0);
  const vipCount = customers.filter((c) => c.tag === "VIP").length;

  return (
    <div className="flex flex-col w-full min-h-screen pb-space-2xl gap-space-lg">
      <CustomerSubHeader
        totalCustomers={customers.length}
        vipCount={vipCount}
        totalRevenue={totalRevenue}
        onAddCustomerClick={() => setShowAddModal(true)}
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
        <div className="xl:col-span-7 min-w-0">
          <CustomerDirectoryTable
            customers={filteredCustomers}
            allCustomersCount={customers.length}
            selectedCustomerId={selectedCustomerId}
            onSelectCustomer={setSelectedCustomerId}
            filterTag={filterTag}
            onFilterTagChange={setFilterTag}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
          />
        </div>

        {selectedCustomer && (
          <CustomerInspector
            customer={selectedCustomer}
            onUpdateTag={handleUpdateTag}
          />
        )}
      </div>

      {showAddModal && (
        <AddCustomerModal
          onClose={() => setShowAddModal(false)}
          onAddCustomer={handleAddCustomer}
        />
      )}
    </div>
  );
}
