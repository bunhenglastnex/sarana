"use client";

import React from "react";
import {
  Phone,
  Mail,
  MapPin,
  FileText,
  Crown,
  Star,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { CustomerRecord, CustomerTag } from "@/types/customers";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CustomerInspectorProps {
  customer: CustomerRecord;
  onUpdateTag?: (customerId: string, newTag: CustomerTag) => void;
}

export const CustomerInspector: React.FC<CustomerInspectorProps> = ({
  customer,
  onUpdateTag,
}) => {
  const getTagBadge = (tag: CustomerTag) => {
    switch (tag) {
      case "VIP":
        return (
          <Badge variant="warning" className="gap-1 font-bold shadow-xs cursor-pointer hover:opacity-90">
            <Crown className="w-3 h-3 text-amber-600" />
            VIP DINER
            <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
          </Badge>
        );
      case "High Spend":
        return (
          <Badge variant="secondary" className="gap-1 bg-purple-500/15 text-purple-600 border-purple-500/30 font-bold shadow-xs cursor-pointer hover:opacity-90">
            <Sparkles className="w-3 h-3 text-purple-600" />
            HIGH SPEND
            <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
          </Badge>
        );
      case "Regular":
        return (
          <Badge variant="secondary" className="gap-1 font-bold cursor-pointer hover:opacity-90">
            <Star className="w-3 h-3 text-secondary" />
            REGULAR
            <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
          </Badge>
        );
      case "New":
        return (
          <Badge variant="default" className="gap-1 font-bold cursor-pointer hover:opacity-90">
            NEW GUEST
            <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
          </Badge>
        );
    }
  };

  return (
    <div className="xl:col-span-5 flex flex-col bg-surface-container-lowest rounded-2xl shadow-xl border border-border/40 overflow-hidden min-h-[600px]">
      {/* Inspector Header */}
      <div className="p-space-md bg-surface-container-low border-b border-border/30 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm shadow-xs ring-2 ring-surface-container-lowest">
              {customer.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline-sm text-base font-extrabold text-on-surface tracking-tight">
                  {customer.name}
                </h2>

                {/* Shadcn UI DropdownMenu for changing Customer Tag */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type="button" className="outline-none focus:ring-1 focus:ring-primary rounded-full">
                      {getTagBadge(customer.tag)}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuLabel className="text-xs font-bold">
                      Change Customer Tag
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onUpdateTag && onUpdateTag(customer.id, "VIP")}
                      className="gap-2 cursor-pointer font-bold text-xs"
                    >
                      <Crown className="w-3.5 h-3.5 text-amber-500" />
                      <span>VIP DINER</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onUpdateTag && onUpdateTag(customer.id, "High Spend")}
                      className="gap-2 cursor-pointer font-bold text-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                      <span>HIGH SPEND</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onUpdateTag && onUpdateTag(customer.id, "Regular")}
                      className="gap-2 cursor-pointer font-bold text-xs"
                    >
                      <Star className="w-3.5 h-3.5 text-secondary" />
                      <span>REGULAR</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onUpdateTag && onUpdateTag(customer.id, "New")}
                      className="gap-2 cursor-pointer font-bold text-xs"
                    >
                      <span>NEW GUEST</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="font-body-sm text-xs text-on-surface-variant flex items-center gap-2 mt-0.5">
                <span>ID: {customer.id}</span>
                <span>•</span>
                <span>{customer.paymentPreference} Preferred</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => alert(`Calling customer ${customer.phone}...`)}
            className="flex-1 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-primary font-label-sm text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs border border-border/20 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call {customer.phone}</span>
          </button>
          <button
            onClick={() => alert(`Sending email to ${customer.email}...`)}
            className="flex-1 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant font-label-sm text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs border border-border/20 transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Send Email</span>
          </button>
        </div>
      </div>

      {/* Scrollable Customer Details Body */}
      <div className="p-space-md flex flex-col gap-space-md overflow-y-auto max-h-[calc(100vh-280px)] custom-scrollbar">
        {/* Financial Metrics Card */}
        <div className="grid grid-cols-2 gap-space-sm bg-surface-container-low p-space-sm rounded-xl border border-border/20">
          <div className="bg-surface-container-lowest p-2.5 rounded-lg border border-border/20">
            <div className="font-label-sm text-[10px] uppercase text-on-surface-variant font-bold">
              Lifetime Spend
            </div>
            <div className="font-display-lg text-lg font-extrabold text-emerald-700 mt-0.5">
              ${customer.totalSpend.toFixed(2)}
            </div>
          </div>

          <div className="bg-surface-container-lowest p-2.5 rounded-lg border border-border/20">
            <div className="font-label-sm text-[10px] uppercase text-on-surface-variant font-bold">
              Total Completed Orders
            </div>
            <div className="font-display-lg text-lg font-extrabold text-primary mt-0.5">
              {customer.totalOrders} Orders
            </div>
          </div>
        </div>

        {/* Delivery Address & Contact Info Box */}
        <div className="bg-surface-container-low p-space-sm rounded-xl flex flex-col gap-2 border border-border/20">
          <div className="font-label-sm text-xs uppercase tracking-wider text-on-surface-variant font-bold">
            Primary Saved Address &amp; Notes
          </div>

          {customer.address ? (
            <div className="bg-surface-container-lowest p-2.5 rounded-lg flex items-start gap-2 border border-border/20">
              <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="font-label-md text-xs font-bold text-on-surface">
                  {customer.address}
                </div>
                {customer.notes && (
                  <div className="mt-1.5 p-1.5 rounded bg-surface-container-high/60 flex items-center gap-1 text-[11px] text-on-surface-variant italic">
                    <FileText className="w-3 h-3 text-secondary shrink-0" />
                    <span>“{customer.notes}”</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs text-on-surface-variant italic">
              No primary delivery address saved.
            </div>
          )}
        </div>

        {/* Customer Order History Timeline */}
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-headline-sm text-sm font-bold text-on-surface">
              Recent Order History ({customer.orders.length})
            </span>
            <span className="font-label-sm text-xs text-primary font-bold">
              KHQR Verified
            </span>
          </div>

          <div className="space-y-space-xs">
            {customer.orders.map((order) => (
              <div
                key={order.id}
                className="bg-surface-container-low p-space-sm rounded-xl flex flex-col gap-1.5 border border-border/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-sm text-xs font-bold text-on-surface">
                      {order.id}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-surface-container-high font-label-sm text-[10px] text-on-surface-variant font-bold">
                      {order.channel.toUpperCase()}
                    </span>
                  </div>

                  <span className="font-price-lg text-xs font-bold text-emerald-700">
                    ${order.totalPrice.toFixed(2)}
                  </span>
                </div>

                <div className="font-body-sm text-xs text-on-surface truncate">
                  {order.itemsSummary}
                </div>

                <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-1 border-t border-border/10">
                  <span>{order.dateLabel}</span>
                  <span
                    className={`font-label-sm text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      order.paymentIsPaid
                        ? "bg-secondary-fixed text-on-secondary-fixed"
                        : "bg-error-container text-on-error-container"
                    }`}
                  >
                    {order.paymentBadge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
