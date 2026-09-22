"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SearchBar } from "@/components/customer/SearchBar";
import { CategoryScroll, Category } from "@/components/customer/CategoryScroll";
import { FloatingCartBar } from "@/components/customer/FloatingCartBar";
import {
  UtensilsCrossed,
  Flame,
  QrCode,
  Truck,
  CheckCircle2,
  Banknote,
  RotateCcw,
  Headphones,
  ArrowRight,
  ChevronRight,
  Clock,
  Store,
  XCircle,
  ShieldCheck,
  Receipt,
  X,
  Loader2,
  Calendar,
  DollarSign,
  Heart,
  Plus,
  Check,
  Search,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useCartStore } from "@/lib/store/useCartStore";
import { useApi } from "@/lib/api";

const ORDER_STATUS_CATEGORIES: Category[] = [
  { id: "all", name: "All Orders", icon: "🍽️" },
  { id: "active", name: "Active In-Progress", icon: "🔥" },
  { id: "preparing", name: "Preparing Food", icon: "🍳" },
  { id: "on_the_way", name: "Out for Delivery", icon: "🛵" },
  { id: "delivered", name: "Delivered", icon: "✅" },
  { id: "cancelled", name: "Cancelled", icon: "❌" },
];

const getStatusInfo = (status: string) => {
  const st = (status || "pending").toLowerCase();
  switch (st) {
    case "pending":
      return {
        label: "Order Received",
        step: "Step 1 of 4",
        percent: 25,
        color: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30",
        badgeType: "fire" as const,
      };
    case "accepted":
      return {
        label: "Accepted by Kitchen",
        step: "Step 2 of 4",
        percent: 45,
        color: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30",
        badgeType: "fire" as const,
      };
    case "preparing":
      return {
        label: "Preparing Food",
        step: "Step 2 of 4",
        percent: 65,
        color: "bg-secondary-fixed text-on-secondary-fixed-variant border border-secondary/30",
        badgeType: "fire" as const,
      };
    case "ready_for_pickup":
    case "ready_for_delivery":
      return {
        label: "Ready for Dispatch",
        step: "Step 3 of 4",
        percent: 85,
        color: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30",
        badgeType: "fire" as const,
      };
    case "on_the_way":
      return {
        label: "Out for Delivery",
        step: "Step 3 of 4",
        percent: 90,
        color: "bg-primary/10 text-primary font-bold border border-primary/30",
        badgeType: "fire" as const,
      };
    case "completed":
    case "delivered":
      return {
        label: "Delivered",
        step: "Completed",
        percent: 100,
        color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30",
        badgeType: "award" as const,
      };
    case "cancelled":
      return {
        label: "Cancelled",
        step: "Cancelled",
        percent: 0,
        color: "bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/30",
        badgeType: "fire" as const,
      };
    case "refunded":
      return {
        label: "Refunded",
        step: "Refunded",
        percent: 0,
        color: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30",
        badgeType: "fire" as const,
      };
    default:
      return {
        label: status,
        step: "In Progress",
        percent: 50,
        color: "bg-primary/10 text-primary border border-primary/20",
        badgeType: "fire" as const,
      };
  }
};

const getPaymentLabel = (method: string) => {
  const m = (method || "").toLowerCase();
  if (m === "khqr") return "Paid (KHQR)";
  if (m === "cash_on_delivery" || m === "cod") return "Cash on Delivery";
  if (m === "cash_at_counter" || m === "counter") return "Pay at Counter";
  return method || "Pending";
};

export const OrdersView: React.FC = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleReorder = (order: any) => {
    const items = Array.isArray(order.items) ? order.items : [];
    if (items.length === 0) return;

    const { clearCart, addItem, setFulfillmentType } = useCartStore.getState();

    // Clear existing cart and populate order items
    clearCart();

    if (order.fulfillment_type) {
      setFulfillmentType(order.fulfillment_type as any);
    }

    const restoId = Number(order.restaurant_id || order.restaurant?.id || 1);
    const restoName = order.restaurant_name || order.restaurant?.name || "Restaurant";

    items.forEach((it: any) => {
      const foodObj: any = {
        id: Number(it.food_id || it.id),
        name: it.food_name || it.name || "Menu Item",
        price: typeof it.price === "string" ? parseFloat(it.price) : Number(it.price || 0),
        image_url: it.image_url || it.image || "",
        restaurant_id: restoId,
        restaurant_name: restoName,
      };
      addItem(foodObj, Number(it.quantity || 1), {}, it.notes || "");
    });

    triggerToast(`✓ Reordered! ${items.length} item(s) added to cart.`);
    setTimeout(() => {
      router.push("/cart");
    }, 600);
  };

  const router = useRouter();
  const { token, userId, phone, email, _hasHydrated } = useAuthStore();
  const { customerPhone: cartPhone } = useCartStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    if (_hasHydrated) {
      if (!token && !userId && !phone && !cartPhone) {
        setShowLoginPrompt(true);
      } else {
        setShowLoginPrompt(false);
      }
    }
  }, [_hasHydrated, token, userId, phone, cartPhone]);

  const targetPhone = phone || cartPhone || email || "";
  const endpoint =
    targetPhone || userId
      ? `/customer-orders.php?phone=${encodeURIComponent(targetPhone)}${
          userId ? `&user_id=${userId}` : ""
        }`
      : `/customer-orders.php`;

  const {
    data: fetchedOrders,
    loading,
    error,
  } = useApi<any[]>(endpoint);

  const rawOrders = Array.isArray(fetchedOrders) ? fetchedOrders : [];

  const isCompletedOrEnded = (status: string) => {
    const st = (status || "").toLowerCase();
    return (
      st === "delivered" ||
      st === "completed" ||
      st === "cancelled" ||
      st === "refunded"
    );
  };

  // Filtered orders list matching search and category pills
  const filteredOrders = useMemo(() => {
    return rawOrders.filter((order) => {
      const orderNum = String(order.order_number || order.id || "").toLowerCase();
      const restoName = String(order.restaurant_name || "").toLowerCase();
      const status = String(order.status || "").toLowerCase();
      const itemsStr = Array.isArray(order.items)
        ? order.items.map((it: any) => String(it.food_name || it.name || "").toLowerCase()).join(" ")
        : "";

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        orderNum.includes(query) ||
        restoName.includes(query) ||
        status.includes(query) ||
        itemsStr.includes(query);

      let matchesCategory = true;
      if (selectedCategory === "active") {
        matchesCategory = !isCompletedOrEnded(order.status);
      } else if (selectedCategory === "preparing") {
        matchesCategory = status === "preparing" || status === "accepted" || status === "pending";
      } else if (selectedCategory === "on_the_way") {
        matchesCategory = status === "on_the_way" || status === "ready_for_delivery" || status === "ready_for_pickup";
      } else if (selectedCategory === "delivered") {
        matchesCategory = status === "delivered" || status === "completed";
      } else if (selectedCategory === "cancelled") {
        matchesCategory = status === "cancelled" || status === "refunded";
      }

      return matchesSearch && matchesCategory;
    });
  }, [rawOrders, searchQuery, selectedCategory]);

  const activeCount = useMemo(
    () => rawOrders.filter((o) => !isCompletedOrEnded(o.status)).length,
    [rawOrders],
  );

  return (
    <main className="flex flex-col relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-28 bg-surface min-h-screen">
      <div className="flex flex-col w-full">
        {/* Search Bar matching Home Page */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search orders by order ID, dish, or restaurant..."
        />

        {/* Category Scroll Filter Pills matching Home Page */}
        <CategoryScroll
          categories={ORDER_STATUS_CATEGORIES}
          activeCategoryId={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Orders Feed Header */}
        <section className="flex items-center justify-between mb-space-sm">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-xl text-on-surface">
              {selectedCategory === "all"
                ? "All Customer Orders"
                : ORDER_STATUS_CATEGORIES.find((c) => c.id === selectedCategory)?.name || "Orders"}
            </h3>
            {activeCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-xs border border-primary/20 animate-pulse">
                <Flame className="w-3.5 h-3.5 fill-primary" />
                <span>{activeCount} Active</span>
              </div>
            )}
          </div>
          <span className="text-xs font-bold text-on-surface-variant">
            {filteredOrders.length} {filteredOrders.length === 1 ? "Order" : "Orders"}
          </span>
        </section>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="font-bold text-xs text-on-surface-variant">
              Loading customer orders feed...
            </span>
          </div>
        ) : filteredOrders.length > 0 ? (
          /* Responsive Food Card Grid Layout (Matching Home Page: 1 col mobile -> 2 sm -> 3 md -> 4 lg) */
          <section className="mb-space-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredOrders.map((order: any) => {
                const statusInfo = getStatusInfo(order.status);
                const totalAmount =
                  typeof order.total_amount === "string"
                    ? parseFloat(order.total_amount)
                    : Number(order.total_amount || 0);
                const items = Array.isArray(order.items) ? order.items : [];
                const itemCount = items.reduce(
                  (acc: number, it: any) => acc + (Number(it.quantity) || 1),
                  0,
                );
                const isActive = !isCompletedOrEnded(order.status);
                const firstItemImg =
                  items[0]?.image_url ||
                  items[0]?.food?.image_url ||
                  order.restaurant_logo ||
                  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80";

                return (
                  <article
                    key={order.id || order.order_number}
                    onClick={() =>
                      router.push(
                        `/order-success?order_id=${encodeURIComponent(
                          order.order_number || order.id,
                        )}`,
                      )
                    }
                    className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between transition-all hover:shadow-md border border-surface-container/60 cursor-pointer group relative"
                  >
                    {/* Top Accent Gradient */}
                    <div
                      className={`h-1.5 w-full ${
                        isActive
                          ? "bg-gradient-to-r from-primary via-secondary to-primary"
                          : "bg-surface-container-high"
                      }`}
                    />

                    {/* Card Header Product Banner Image matching Home Page FoodCard */}
                    <div className="relative w-full h-44 bg-surface-container overflow-hidden">
                      <img
                        src={firstItemImg}
                        alt={order.order_number || "Order Image"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

                      {/* Top Left Status Badge Overlay */}
                      <div className="absolute top-3 left-3 bg-surface-bright/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-surface-container/60">
                        {statusInfo.badgeType === "award" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Flame className="w-3.5 h-3.5 text-primary fill-primary/20" />
                        )}
                        <span className="font-extrabold text-xs text-on-surface">
                          {statusInfo.label}
                        </span>
                      </div>

                      {/* Top Right Order Number Tag */}
                      <div className="absolute top-3 right-3 bg-inverse-surface/80 text-inverse-on-surface backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-extrabold shadow-sm">
                        #{order.order_number || `ORD-${order.id}`}
                      </div>

                      {/* Bottom Banner Info: Outlet & Fulfillment Pill */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                        <span className="font-bold truncate max-w-[170px] drop-shadow-sm">
                          {order.restaurant?.name || order.restaurant_name || "Amber & Ember Woodfired Bistro"}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs font-semibold text-[10px] uppercase tracking-wider">
                          {order.fulfillment_type === "pickup" ? "Pickup" : "Delivery"}
                        </span>
                      </div>
                    </div>

                    {/* Product Information & Dishes List */}
                    <div className="p-4 flex flex-col justify-between flex-1 gap-3">
                      <div>
                        {/* Dishes Thumbnails Row & Description */}
                        <div className="flex items-center gap-2.5 bg-surface-container-low p-2 rounded-xl border border-surface-container/60 mb-2">
                          <div className="relative flex -space-x-2 overflow-hidden shrink-0">
                            {items.slice(0, 3).map((it: any, idx: number) => (
                              <img
                                key={idx}
                                src={
                                  it.image_url ||
                                  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
                                }
                                alt={it.food_name || it.name}
                                className="w-8 h-8 rounded-lg object-cover border border-surface-container-lowest"
                              />
                            ))}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-extrabold text-xs text-on-surface block truncate">
                              {itemCount} {itemCount === 1 ? "item" : "items"}
                            </span>
                            <p className="text-[11px] text-on-surface-variant truncate">
                              {items
                                .map((it: any) => `${it.quantity}x ${it.food_name || it.name}`)
                                .join(", ")}
                            </p>
                          </div>
                        </div>

                        {/* Payment & Date Details */}
                        <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1">
                          <span className="font-medium text-[11px]">
                            {getPaymentLabel(order.payment_method)}
                          </span>
                          <span className="text-[11px] font-semibold text-outline">
                            {order.created_at
                              ? new Date(order.created_at).toLocaleDateString()
                              : "Recent"}
                          </span>
                        </div>

                        {/* Live Progress Bar for Active Orders */}
                        {isActive && (
                          <div className="mt-3 pt-2 border-t border-surface-container/60 space-y-1">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-on-surface-variant font-medium">
                                {statusInfo.step}
                              </span>
                              <span className="text-primary font-bold">
                                {statusInfo.percent}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all duration-500"
                                style={{ width: `${statusInfo.percent}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Footer: Price & Quick Action Button matching Home Page */}
                      <div className="flex items-center justify-between pt-3 border-t border-surface-container/60 mt-auto">
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-xs text-primary font-bold">$</span>
                          <span className="font-extrabold text-lg text-on-surface">
                            {totalAmount.toFixed(2)}
                          </span>
                        </div>

                        {isActive ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(
                                `/order-success?order_id=${encodeURIComponent(
                                  order.order_number || order.id,
                                )}`,
                              );
                            }}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary text-on-primary text-xs font-bold shadow-sm hover:bg-primary-container active:scale-95 transition-all"
                          >
                            <span>Track Live</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReorder(order);
                            }}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary/10 hover:bg-primary hover:text-on-primary text-primary text-xs font-bold shadow-xs active:scale-95 transition-all border border-primary/30"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reorder</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : (
          /* Empty Search & Orders State */
          <div className="text-center py-16 bg-surface-container-lowest rounded-3xl p-8 border border-surface-container max-w-md mx-auto my-8 shadow-sm">
            <UtensilsCrossed className="w-14 h-14 text-outline mx-auto mb-3 opacity-40" />
            <p className="font-extrabold text-on-surface text-lg">
              No orders found
            </p>
            <p className="text-xs text-on-surface-variant mt-1 mb-6">
              {searchQuery
                ? `No orders matching "${searchQuery}". Try adjusting your search query.`
                : "Your customer orders will show up here with real-time status tracking."}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                router.push("/");
              }}
              className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold text-xs hover:bg-primary-container transition-all shadow-md active:scale-95"
            >
              Browse Menu
            </button>
          </div>
        )}
      </div>

      {/* Floating Cart Bar integration matching Home Page */}
      <FloatingCartBar />

      {/* Guest Sign In Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface-container-lowest border border-surface-container-high rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Receipt className="w-7 h-7 text-primary" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-on-surface">
                Sign In Required
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Please sign in or register an account to view your active order status and order history.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md hover:bg-primary-container transition-all"
              >
                Sign In / Register
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-inverse-on-surface px-5 py-3 rounded-full font-bold text-xs shadow-xl border border-white/10 animate-in fade-in slide-in-from-bottom-3 duration-200 flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </main>
  );
};
