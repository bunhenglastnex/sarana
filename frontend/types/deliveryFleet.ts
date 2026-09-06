export interface CourierRecord {
  id: string;
  code: string;
  name: string;
  avatarUrl: string;
  vehicleType: string;
  vehicleLabel: string;
  orderId: string;
  customerName: string;
  destinationAddress: string;
  speedKmH: number;
  tempCelsius: number;
  remainingKm: number;
  remainingMinutes: number;
  etaLabel: string;
  statusText: string;
  paymentMethod: "cod" | "khqr" | "paid";
  paymentBadgeLabel: string;
  amount: number;
  isFocused?: boolean;
  coordinates: { x: number; y: number };
  lat: number;
  lng: number;
  destLat: number;
  destLng: number;
  destName?: string;
}

export interface StoreConfig {
  name: string;
  subtitle: string;
  address: string;
  lat: number;
  lng: number;
}


