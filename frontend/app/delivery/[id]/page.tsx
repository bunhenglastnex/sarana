"use client";

import React from "react";
import { useParams } from "next/navigation";
import { DeliveryOrderDetailView } from "@/components/delivery/DeliveryOrderDetailView";

export default function DeliveryOrderDetailPage() {
  const params = useParams();
  const orderId = typeof params?.id === "string" ? params.id : "1024";

  return <DeliveryOrderDetailView orderId={orderId} />;
}
