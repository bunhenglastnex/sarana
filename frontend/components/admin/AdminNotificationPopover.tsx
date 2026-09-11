"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  CookingPot,
  Bike,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  CheckCheck,
  Receipt,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useApi } from "@/lib/api";

interface NotificationItem {
  id: string;
  type: "order" | "delivery" | "system";
  title: string;
  message: string;
  time: string;
  isUnread: boolean;
  link?: string;
}

export const AdminNotificationPopover: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // Fetch recent orders for live notification data
  const { data } = useApi<any>("/orders.php", { limit: 8 });
  
  const ordersList: any[] = Array.isArray(data?.data?.orders)
    ? data.data.orders
    : Array.isArray(data?.orders)
    ? data.orders
    : Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
    ? data
    : [];

  // Generate dynamic notification items from live API data
  const liveOrderNotifications: NotificationItem[] = ordersList.map(
    (order: any) => {
      const orderNum = order.id || (order.order_number ? `#${order.order_number}` : `#${order.dbId}`);
      const isDelivery = order.channel === "delivery" || order.fulfillment_type === "delivery";
      const status = String(order.status || "").toLowerCase();
      const isCompleted = ["completed", "delivered", "picked_up"].includes(status);
      const isPreparing = status === "preparing";
      const isInTransit = status === "in_transit" || status === "on_the_way";

      let type: "order" | "delivery" | "system" = "order";
      if (isDelivery) type = "delivery";

      let title = `New Order ${orderNum}`;
      if (isPreparing) {
        title = `Kitchen Preparing ${orderNum}`;
      } else if (isInTransit) {
        title = `Out for Delivery ${orderNum}`;
      } else if (isCompleted) {
        title = `Completed Order ${orderNum}`;
      }

      const customer = order.customerName || order.customer_name || "Guest Customer";
      const amount = Number(order.totalPrice ?? order.total_amount ?? 0).toFixed(2);
      const badge = order.paymentBadgeLabel || order.payment_method || "COD";
      const message = `${customer} · $${amount} (${badge})`;

      const timeAgo = order.timeAgoLabel || (order.created_at
        ? new Date(order.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Just now");

      const notificationId = `order-${order.dbId || order.id}`;

      return {
        id: notificationId,
        type,
        title,
        message,
        time: timeAgo,
        isUnread: !readIds.has(notificationId),
        link: "/admin/orders",
      };
    }
  );

  // Fallback system notifications if order list is empty
  const systemNotifications: NotificationItem[] = [
    {
      id: "sys-1",
      type: "system",
      title: "Kitchen Broadcast Online",
      message: "Realtime SSE & Telegram alerts operational",
      time: "Active",
      isUnread: !readIds.has("sys-1"),
    },
    {
      id: "sys-2",
      type: "delivery",
      title: "Fleet GPS Radar Active",
      message: "Telemetry sync interval set to 5s",
      time: "Active",
      isUnread: !readIds.has("sys-2"),
    },
  ];

  const allNotifications =
    liveOrderNotifications.length > 0
      ? liveOrderNotifications
      : systemNotifications;

  const unreadCount = allNotifications.filter((n) => n.isUnread).length;

  const handleMarkAllRead = () => {
    const allIds = new Set(allNotifications.map((n) => n.id));
    setReadIds(allIds);
  };

  const getItemIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "delivery":
        return <Bike className="w-4 h-4 text-primary" />;
      case "order":
        return <CookingPot className="w-4 h-4 text-amber-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Notifications"
          className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors focus:outline-none"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-surface animate-pulse" />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 p-0 rounded-2xl bg-surface border border-border/40 shadow-2xl overflow-hidden selection:bg-primary/20"
      >
        {/* Popover Header */}
        <div className="p-space-md border-b border-border/40 bg-surface-container-low flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-headline-sm text-sm font-bold text-on-surface flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-primary" />
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="font-label-sm text-[10px] font-extrabold bg-primary-fixed text-on-primary-fixed px-2 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark read
            </button>
          )}
        </div>

        {/* Notification Scrollable Area */}
        <div className="max-h-80 overflow-y-auto custom-scrollbar divide-y divide-border/20">
          {allNotifications.map((item) => (
            <div
              key={item.id}
              className={`p-3 transition-colors flex items-start gap-3 ${
                item.isUnread
                  ? "bg-primary-container/10 hover:bg-primary-container/20"
                  : "hover:bg-surface-container-low"
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 mt-0.5 shadow-xs border border-border/30">
                {getItemIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className="font-label-md text-xs font-bold text-on-surface truncate">
                    {item.title}
                  </p>
                  <span className="font-label-sm text-[10px] text-on-surface-variant shrink-0 font-medium">
                    {item.time}
                  </span>
                </div>
                <p className="font-body-sm text-[11px] text-on-surface-variant truncate mt-0.5">
                  {item.message}
                </p>
              </div>
              {item.isUnread && (
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 self-center" />
              )}
            </div>
          ))}
        </div>

        {/* Popover Footer Link */}
        <div className="p-2 border-t border-border/40 bg-surface-container-lowest text-center">
          <Link
            href="/admin/orders"
            onClick={() => setIsOpen(false)}
            className="w-full py-1.5 px-3 rounded-xl font-label-sm text-xs font-bold text-primary hover:bg-primary-fixed/40 transition-all flex items-center justify-center gap-1.5"
          >
            <span>View All Orders</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AdminNotificationPopover;
