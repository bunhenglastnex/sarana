export type StaffRole = "all" | "delivery" | "kitchen" | "management" | "service";

export type StaffStatus = "all" | "on_delivery" | "available" | "logout";

export interface StaffRecord {
  id: string;
  code: string;
  name: string;
  phone: string;
  email?: string;
  avatarUrl: string;
  role: StaffRole;
  roleLabel: string;
  status: StaffStatus;
  statusLabel: string;
  vehicleType?: "motorbike" | "e_scooter" | "car" | "bicycle";
  vehicleLabel?: string;
  vehiclePlate?: string;
  activeOrderId?: string;
  activeCustomerName?: string;
  activeDestination?: string;
  deliveriesToday?: number;
  avgDeliveryMinutes?: number;
  codCashCollected?: number;
  tipsToday?: number;
  shiftStartTime?: string;
  rating?: number;
  joinedDate?: string;
}
