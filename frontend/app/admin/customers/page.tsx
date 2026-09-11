"use client";

import React, { useState, useEffect } from "react";
import { CustomerRecord, CustomerTag } from "@/types/customers";
import { CustomerSubHeader } from "@/components/admin/customers/CustomerSubHeader";
import { CustomerDirectoryTable } from "@/components/admin/customers/CustomerDirectoryTable";
import { CustomerInspector } from "@/components/admin/customers/CustomerInspector";
import { AddCustomerModal } from "@/components/admin/customers/AddCustomerModal";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { InfiniteScrollSentinel } from "@/components/ui/InfiniteScrollSentinel";
import { Api } from "@/lib/api";


export default function CustomersPage() {
  const [filterTag, setFilterTag] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState(false);

  const {
    items: customers,
    setItems: setCustomers,
    loading,
    pagination,
    counts,
    sentinelRef,
    refresh,
  } = useInfiniteScroll<CustomerRecord>("/customers.php", {
    limit: 20,
    params: {
      tag: filterTag,
      search: searchQuery,
    },
  });

  // Keep first customer selected if no selection made
  useEffect(() => {
    if (customers.length > 0 && !selectedCustomerId) {
      setSelectedCustomerId(customers[0].id);
    }
  }, [customers, selectedCustomerId]);

  const selectedCustomer =
    customers.find((c) => c.id === selectedCustomerId) || customers[0] || null;

  const handleAddCustomer = async (newCustomer: CustomerRecord) => {
    try {
      const res = await Api.post("/customers.php", newCustomer);
      if (res.success) {
        setShowAddModal(false);
        refresh();
      }
    } catch (err) {
      console.error("Failed to add customer", err);
    }
  };

  const handleUpdateTag = async (customerId: string, newTag: CustomerTag) => {
    // Optimistic UI update
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, tag: newTag } : c))
    );

    try {
      await Api.put(`/customers.php?id=${customerId}`, {
        id: customerId,
        tag: newTag,
      });
      refresh();
    } catch (err) {
      console.error("Failed to update customer tag", err);
      refresh();
    }
  };

  const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpend || 0), 0);
  const vipCount = counts?.vip ?? customers.filter((c) => c.tag === "VIP").length;
  const totalCustomersCount = counts?.all ?? pagination?.total ?? customers.length;
  const khqrCount = customers.filter(
    (c) => c.paymentPreference === "KHQR" || String(c.paymentPreference).toUpperCase().includes("KHQR")
  ).length;
  const khqrRatio = totalCustomersCount > 0 ? Math.round((khqrCount / Math.max(1, customers.length)) * 100) : 0;

  return (
    <div className="flex flex-col w-full min-h-screen pb-space-2xl gap-space-lg">
      <CustomerSubHeader
        totalCustomers={totalCustomersCount}
        vipCount={vipCount}
        totalRevenue={totalRevenue}
        khqrRatio={khqrRatio}
        onAddCustomerClick={() => setShowAddModal(true)}
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start relative">
        <div className="xl:col-span-7 min-w-0 flex flex-col gap-4">
          <CustomerDirectoryTable
            customers={customers}
            allCustomersCount={totalCustomersCount}
            selectedCustomerId={selectedCustomerId}
            onSelectCustomer={setSelectedCustomerId}
            filterTag={filterTag}
            onFilterTagChange={setFilterTag}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
          />

          <InfiniteScrollSentinel
            sentinelRef={sentinelRef}
            loading={loading}
            pagination={pagination}
            itemsCount={customers.length}
            unitLabel="customers"
          />
        </div>

        {selectedCustomer && (
          <div className="xl:col-span-5 sticky top-20 self-start w-full">
            <CustomerInspector
              customer={selectedCustomer}
              onUpdateTag={handleUpdateTag}
            />
          </div>
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
