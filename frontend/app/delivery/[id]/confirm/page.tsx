"use client";

import React from "react";
import { useParams } from "next/navigation";
import { DeliveryConfirmContainer } from "@/components/delivery/DeliveryConfirmContainer";

export default function DeliveryConfirmPage() {
  const params = useParams();
  const orderId = typeof params?.id === "string" ? params.id : "1";

  return <DeliveryConfirmContainer orderId={orderId} />;
}
