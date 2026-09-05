"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { DeliveryOrder } from "@/lib/store/useDeliveryStore";
import { Check, ArrowRight } from "lucide-react";

interface DeliverySuccessModalProps {
  order: DeliveryOrder;
  isOpen: boolean;
  onClose: () => void;
}

export const DeliverySuccessModal: React.FC<DeliverySuccessModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handleNextDelivery = () => {
    onClose();
    router.push("/delivery");
  };

  const handleBackHome = () => {
    onClose();
    router.push("/delivery");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-screen-edge-padding bg-inverse-surface/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-surface-container-lowest w-full max-w-sm rounded-2xl p-space-xl text-center space-y-space-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 border border-outline-variant/30">
        {/* Decorative Confetti Layer */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-2 left-8 w-3 h-3 rounded-full bg-primary animate-ping"></div>
          <div className="absolute top-6 right-10 w-2.5 h-2.5 rounded bg-secondary-container rotate-12"></div>
          <div className="absolute top-16 left-4 w-2 h-4 rounded-sm bg-secondary rotate-45"></div>
          <div className="absolute top-12 right-6 w-3 h-2 rounded-full bg-primary-fixed"></div>
        </div>

        {/* Green Checkmark Circle with Radiant Aura */}
        <div className="mx-auto relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-pulse"></div>
          <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg relative z-10">
            <Check className="w-10 h-10 text-white font-bold stroke-[3]" />
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="font-headline-lg text-headline-lg text-on-surface font-extrabold">
            Delivery Completed!
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Order {order.orderNumber} has been successfully closed and logged to the ledger.
          </p>
        </div>

        {/* Quick Earnings & Cash Pill */}
        <div className="bg-surface-container-low p-space-sm rounded-xl flex items-center justify-around text-left border border-outline-variant/20">
          <div>
            <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase font-semibold">
              COD Deposited
            </span>
            <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
              ${(order.codAmount || order.totalPrice).toFixed(2)}
            </span>
          </div>
          <div className="w-px h-8 bg-surface-container-highest"></div>
          <div>
            <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase font-semibold">
              Payout Added
            </span>
            <span className="font-headline-sm text-headline-sm text-primary font-bold">
              +$6.80
            </span>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={handleNextDelivery}
            className="w-full h-12 bg-primary text-on-primary font-label-lg text-label-lg font-bold rounded-xl flex items-center justify-center gap-2 active:scale-98 transition-transform shadow-md hover:bg-primary-container"
          >
            <span>View Next Delivery</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleBackHome}
            className="w-full h-12 bg-surface-container-high text-on-surface font-label-lg text-label-lg font-semibold rounded-xl flex items-center justify-center active:scale-98 transition-transform hover:bg-surface-container-highest"
          >
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
