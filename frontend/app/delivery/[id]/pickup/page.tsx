"use client";

import React from "react";
import { useParams } from "next/navigation";
import { RestaurantPickupView } from "@/components/delivery/RestaurantPickupView";

export default function RestaurantPickupPage() {
  const params = useParams();
  const orderId = typeof params?.id === "string" ? params.id : "1";

  return <RestaurantPickupView orderId={orderId} />;
}
