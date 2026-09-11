"use client";

import React, { useState, useEffect } from "react";
import { StaffRecord, StaffStatus } from "@/types/staff";
import { StaffHeader } from "@/components/admin/staff/StaffHeader";
import { StaffFilterBar } from "@/components/admin/staff/StaffFilterBar";
import { StaffMemberCard } from "@/components/admin/staff/StaffMemberCard";
import { StaffDetailModal } from "@/components/admin/staff/StaffDetailModal";
import { CreateStaffModal } from "@/components/admin/staff/CreateStaffModal";
import { Api } from "@/lib/api";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { UserCheck } from "lucide-react";

export default function StaffPage() {
  const { role } = useAuthStore();
  const [staffList, setStaffList] = useState<StaffRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StaffStatus>("all");
  const [selectedStaff, setSelectedStaff] = useState<StaffRecord | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (role !== "super_admin") {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center p-space-xl animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4 border border-amber-500/20">
          <UserCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-on-surface mb-2">
          Super Admin Access Required
        </h2>
        <p className="text-sm text-on-surface-variant max-w-md leading-relaxed">
          Platform staff management and global delivery fleet administration are restricted to <strong className="text-on-surface">Super Platform Administrators</strong>.
        </p>
      </div>
    );
  }

  const fetchDrivers = async () => {
    setIsLoading(true);
    try {
      const [resUsers, resRadar] = await Promise.all([
        Api.get("/users.php", { role: "delivery" }, { forceRefresh: true }),
        Api.get("/delivery.php", { action: "fleet_radar" }, { forceRefresh: true }),
      ]);

      if (resUsers.success && Array.isArray(resUsers.data)) {
        const radarCouriers =
          resRadar.success && resRadar.data?.couriers ? resRadar.data.couriers : [];
        const radarMap = new Map(
          radarCouriers.map((c: any) => [
            String(c.id).replace("AE-DRV-", "").replace("DRV-", ""),
            c,
          ]),
        );

        const mappedStaff: StaffRecord[] = resUsers.data.map((user: any) => {
          const userIdStr = String(user.id);
          const radarInfo: any = radarMap.get(userIdStr);

          const rawStatus =
            user.courier_status ||
            user.status ||
            (radarInfo ? radarInfo.statusText : "offline");
          const isOffline = rawStatus === "offline";
          const isOnDelivery =
            rawStatus === "on_delivery" ||
            (radarInfo && radarInfo.orderId && radarInfo.orderId !== "#NONE");

          const finalStatus: StaffStatus = isOffline
            ? "offline"
            : isOnDelivery
            ? "on_delivery"
            : "available";

          return {
            id: userIdStr,
            code: `DRV-${user.id}`,
            name: user.name,
            phone: user.phone,
            email: user.email || undefined,
            avatarUrl:
              user.avatar_url ||
              radarInfo?.avatarUrl ||
              `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
            role: "delivery",
            roleLabel: "Delivery Driver",
            status: finalStatus,
            statusLabel:
              finalStatus === "available"
                ? "ONLINE (AVAILABLE)"
                : finalStatus === "on_delivery"
                ? "ON DELIVERY"
                : "OFFLINE (PAUSED)",
            vehicleType: user.vehicle_type || radarInfo?.vehicleType || "motorbike",
            vehicleLabel:
              user.vehicle_label || radarInfo?.vehicleLabel || "Honda Click (Motorbike)",
            deliveriesToday: radarInfo?.deliveriesToday || 0,
            codCashCollected: radarInfo?.amount || 0,
            tipsToday: 0,
            rating: 4.95,
            joinedDate: user.created_at
              ? new Date(user.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Recently",
          };
        });
        setStaffList(mappedStaff);
      }
    } catch (err) {
      console.error("Failed to load delivery staff:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

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
        onRefresh={fetchDrivers}
      />

      {/* Main Delivery Driver Roster Grid (Responsive: 1 col on mobile, 2 on md, 3 on xl, 4 on 2xl) */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-space-md">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-48 bg-surface-container-lowest animate-pulse rounded-2xl border border-border/30"
            />
          ))}
        </div>
      ) : (
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
      )}

      {!isLoading && filteredStaff.length === 0 && (
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
