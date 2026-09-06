"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ActiveNavigationContainer } from "@/components/delivery/ActiveNavigationContainer";

export default function ActiveNavigationPage() {
  const params = useParams();
  const orderId = typeof params?.id === "string" ? params.id : "1";

  return <ActiveNavigationContainer orderId={orderId} />;
}
