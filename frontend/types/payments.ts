export type PaymentMethodType = "khqr" | "cod" | "counter_cash" | "card";

export type SettlementStatus = "verified" | "pending_review" | "flagged" | "refunded";

export interface TransactionRecord {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  gateway: "ABA KHQR" | "Wing KHQR" | "Canadia KHQR" | "COD Courier" | "Counter POS";
  method: PaymentMethodType;
  amountUsd: number;
  amountKhr: number;
  status: SettlementStatus;
  txnRef: string;
  proofImageUrl?: string;
  timestamp: string;
  dateLabel: string;
  dateIso: string; // YYYY-MM-DD format
}

export interface PaymentSummaryMetrics {
  totalSettledUsd: number;
  totalSettledKhr: number;
  khqrSharePercentage: number;
  pendingVerificationCount: number;
  pendingVerificationAmountUsd: number;
  codOnHandUsd: number;
  cancelledCount: number;
  cancelledAmountUsd: number;
}
