"use client";

import React, { useState } from "react";
import { StaffRecord, StaffStatus } from "@/types/staff";
import { mockStaffMembers } from "@/components/admin/staff/mockStaff";
import { StaffHeader } from "@/components/admin/staff/StaffHeader";
import { StaffFilterBar } from "@/components/admin/staff/StaffFilterBar";
import { StaffMemberCard } from "@/components/admin/staff/StaffMemberCard";
import { StaffDetailModal } from "@/components/admin/staff/StaffDetailModal";
import { CreateStaffModal } from "@/components/admin/staff/CreateStaffModal";

export default function StaffPage() {
  const [staffList, setStaffList] = useState<StaffRecord[]>(mockStaffMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StaffStatus>("all");
  const [selectedStaff, setSelectedStaff] = useState<StaffRecord | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Compute Drivers KPI Statistics
  const totalDriverCount = staffList.length;
  const onDeliveryCount = staffList.filter(
    (s) => s.status === "on_delivery",
  ).length;
  const availableCount = staffList.filter(
    (s) => s.status === "available",
  ).length;
  const totalCodCollected = staffList.reduce(
    (sum, s) => sum + (s.codCashCollected || 0),
    0,
  );
  const totalTipsToday = staffList.reduce(
    (sum, s) => sum + (s.tipsToday || 0),
    0,
  );

  // Driver Filtering Logic
  const filteredStaff = staffList.filter((staff) => {
    // Status filter
    if (statusFilter !== "all" && staff.status !== statusFilter) {
      return false;
    }
    // Search query (matches name, phone, code, vehicle)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = staff.name.toLowerCase().includes(q);
      const matchPhone = staff.phone.includes(q);
      const matchCode = staff.code.toLowerCase().includes(q);
      const matchVehicle = staff.vehicleLabel?.toLowerCase().includes(q);
      return matchName || matchPhone || matchCode || matchVehicle;
    }

    return true;
  });

  const handleAddStaff = (newStaff: StaffRecord) => {
    setStaffList((prev) => [newStaff, ...prev]);
  };

  const handleCallStaff = (name: string, phone: string) => {
    alert(`Initiating phone call to driver ${name} (${phone})...`);
  };

  const handleReconcileCash = (staffId: string) => {
    setStaffList((prev) =>
      prev.map((staff) => {
        if (staff.id === staffId) {
          return {
            ...staff,
            codCashCollected: 0.0,
            tipsToday: 0.0,
          };
        }
        return staff;
      }),
    );

    if (selectedStaff && selectedStaff.id === staffId) {
      setSelectedStaff((prev) =>
        prev ? { ...prev, codCashCollected: 0.0, tipsToday: 0.0 } : null,
      );
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen pb-space-2xl space-y-space-lg">
      {/* Driver Fleet KPI Telemetry Header */}
      <StaffHeader
        totalDriverCount={totalDriverCount}
        onDeliveryCount={onDeliveryCount}
        availableCount={availableCount}
        totalCodCollected={totalCodCollected}
        totalTipsToday={totalTipsToday}
        onOpenCreateStaff={() => setIsCreateModalOpen(true)}
      />

      {/* Filter Bar & Search */}
      <StaffFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onRefresh={() => setStaffList([...mockStaffMembers])}
      />

      {/* Main Delivery Driver Roster Grid (Responsive: 1 col on mobile, 2 on md, 3 on xl, 4 on 2xl) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-space-md">
        {filteredStaff.map((staff) => (
          <StaffMemberCard
            key={staff.id}
            staff={staff}
            onSelect={(s) => setSelectedStaff(s)}
            onCall={handleCallStaff}
          />
        ))}
      </div>

      {filteredStaff.length === 0 && (
        <div className="bg-surface-container-lowest p-space-2xl rounded-2xl border border-border/40 text-center space-y-2">
          <p className="font-headline-sm text-base font-bold text-on-surface">
            No delivery drivers found matching your filter
          </p>
          <p className="font-body-sm text-xs text-on-surface-variant">
            Try adjusting your search query or courier status selection.
          </p>
        </div>
      )}

      {/* Staff Detail Modal */}
      <StaffDetailModal
        staff={selectedStaff}
        isOpen={Boolean(selectedStaff)}
        onClose={() => setSelectedStaff(null)}
        onReconcileCash={handleReconcileCash}
      />

      {/* Create New Staff Modal */}
      <CreateStaffModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onAddStaff={handleAddStaff}
      />
    </div>
  );
}
