"use client";

import React, { useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  LayoutGrid,
  List,
  Flame,
  Award,
  Star,
  CheckCircle2,
  XCircle,
  Utensils,
  Layers,
  Clock,
  Eye,
  ExternalLink,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MenuItemRecord, CATEGORY_OPTIONS } from "@/types/menu";
import Link from "next/link";

interface MenuGridProps {
  items: MenuItemRecord[];
  onOpenAddModal: () => void;
  onOpenEditModal: (item: MenuItemRecord) => void;
  onOpenDeleteModal: (item: MenuItemRecord) => void;
  onToggleAvailable: (itemId: string) => void;
}

export const MenuGrid: React.FC<MenuGridProps> = ({
  items,
  onOpenAddModal,
  onOpenEditModal,
  onOpenDeleteModal,
  onToggleAvailable,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "topseller" | "available" | "soldout">("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const filteredItems = items.filter((item) => {
    // Category filter
    if (selectedCategory !== "all" && item.category !== selectedCategory) {
      return false;
    }
    // Status filter
    if (statusFilter === "topseller" && !item.isTopSeller && item.badge?.type !== "chef") {
      return false;
    }
    if (statusFilter === "available" && (!item.isAvailable || item.stockQuantity <= 0)) return false;
    if (statusFilter === "soldout" && (item.isAvailable && item.stockQuantity > 0)) return false;

    // Search query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalAvailable = items.filter((i) => i.isAvailable && i.stockQuantity > 0).length;
  const totalTopSellers = items.filter((i) => i.isTopSeller || i.badge?.type === "chef").length;
  const totalOptionsGroups = items.reduce(
    (sum, i) => sum + (i.options?.length || 0),
    0
  );
  const avgPrice =
    items.length > 0
      ? (items.reduce((sum, i) => sum + i.price, 0) / items.length).toFixed(2)
      : "0.00";

  const renderBadgeIcon = (type?: "chef" | "fire" | "award") => {
    switch (type) {
      case "fire":
        return <Flame className="w-3.5 h-3.5 text-primary" />;
      case "award":
        return <Award className="w-3.5 h-3.5 text-secondary" />;
      case "chef":
      default:
        return <Star className="w-3.5 h-3.5 text-secondary fill-secondary" />;
    }
  };

  return (
    <div className="flex flex-col gap-space-lg">
      {/* Menu Catalog Sub-Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-2xl shadow-xs border border-border/40">
        <div>
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-xs uppercase tracking-wider mb-1">
            <span>Bistro Operational Catalog</span>
            <span>/</span>
            <span className="text-primary font-bold">Menu Dishes</span>
          </div>
          <div className="flex items-center gap-space-sm">
            <h1 className="font-headline-lg text-2xl font-bold text-on-surface tracking-tight">
              Menu Items Management
            </h1>
            <span className="inline-flex items-center px-space-xs py-0.5 rounded-full font-label-sm text-xs bg-primary-fixed text-on-primary-fixed font-bold">
              {items.length} Dishes
            </span>
          </div>
        </div>

        {/* Quick Stats Micro-Bar */}
        <div className="flex items-center gap-space-xs overflow-x-auto pb-1 lg:pb-0 custom-scrollbar">
          <div className="bg-surface-container-low px-space-md py-2 rounded-xl flex items-center gap-space-sm shrink-0 shadow-xs border border-border/30">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="font-label-sm text-[11px] text-on-surface-variant">
                In Stock Availability
              </div>
              <div className="font-headline-sm text-sm text-on-surface font-bold">
                {totalAvailable} Active / {items.length} Total
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low px-space-md py-2 rounded-xl flex items-center gap-space-sm shrink-0 shadow-xs border border-border/30">
            <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="font-label-sm text-[11px] text-on-surface-variant">
                Customizations Linked
              </div>
              <div className="font-headline-sm text-sm text-on-surface font-bold">
                {totalOptionsGroups} Option Groups
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low px-space-md py-2 rounded-xl flex items-center gap-space-sm shrink-0 shadow-xs border border-border/30">
            <div className="w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed font-bold">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <div className="font-label-sm text-[11px] text-on-surface-variant">
                Average Price
              </div>
              <div className="font-headline-sm text-sm text-on-surface font-bold">
                ${avgPrice}
              </div>
            </div>
          </div>

          {/* Add Dish Trigger Button */}
          <button
            onClick={onOpenAddModal}
            className="px-space-md py-2.5 rounded-xl bg-primary text-on-primary font-label-sm text-xs font-bold flex items-center gap-1.5 shadow-md hover:bg-primary-container transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Dish</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-xs border border-border/40 flex flex-wrap items-center justify-between gap-space-sm">
        {/* Search */}
        <div className="flex items-center gap-space-xs flex-1 min-w-[240px]">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dish title, ingredient, category..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-xs outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary border border-transparent focus:border-border/40 transition-all"
            />
          </div>
        </div>

        {/* Category & Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-space-xs">
          {/* Category Dropdown (Shadcn UI Select) */}
          <Select
            value={selectedCategory}
            onValueChange={(val) => setSelectedCategory(val)}
          >
            <SelectTrigger className="w-[180px] h-8 rounded-lg bg-surface-container text-on-surface font-label-sm text-xs border border-border/30 font-medium">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-surface-container-lowest border border-border/40 shadow-xl z-[100]">
              <SelectItem value="all" className="text-xs font-medium cursor-pointer">
                ✨ All Categories
              </SelectItem>
              {CATEGORY_OPTIONS.map((cat) => (
                <SelectItem
                  key={cat.value}
                  value={cat.value}
                  className="text-xs font-medium cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Stock & Top Seller Filter Pills */}
          <div className="flex items-center bg-surface-container p-1 rounded-lg border border-border/30">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-space-sm py-1 rounded-md font-label-sm text-xs transition-colors ${
                statusFilter === "all"
                  ? "bg-inverse-surface text-inverse-on-surface font-bold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface font-medium"
              }`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setStatusFilter("topseller")}
              className={`px-space-sm py-1 rounded-md font-label-sm text-xs transition-colors flex items-center gap-1 ${
                statusFilter === "topseller"
                  ? "bg-amber-500 text-white font-bold shadow-xs"
                  : "text-amber-700 hover:text-amber-800 font-medium"
              }`}
            >
              <Flame className="w-3 h-3 fill-current" />
              <span>Top Sellers ({totalTopSellers})</span>
            </button>
            <button
              onClick={() => setStatusFilter("available")}
              className={`px-space-sm py-1 rounded-md font-label-sm text-xs transition-colors ${
                statusFilter === "available"
                  ? "bg-inverse-surface text-inverse-on-surface font-bold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface font-medium"
              }`}
            >
              In Stock ({totalAvailable})
            </button>
            <button
              onClick={() => setStatusFilter("soldout")}
              className={`px-space-sm py-1 rounded-md font-label-sm text-xs transition-colors ${
                statusFilter === "soldout"
                  ? "bg-inverse-surface text-inverse-on-surface font-bold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface font-medium"
              }`}
            >
              Sold Out ({items.length - totalAvailable})
            </button>
          </div>

          <div className="h-5 w-px bg-surface-container-high hidden sm:block" />

          {/* View Mode Toggle */}
          <div className="flex items-center bg-surface-container p-1 rounded-lg border border-border/30">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-inverse-surface text-inverse-on-surface shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "table"
                  ? "bg-inverse-surface text-inverse-on-surface shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View Rendering */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-space-md items-stretch">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-surface-container-lowest rounded-2xl shadow-xs border transition-all flex flex-col justify-between overflow-hidden group ${
                item.isAvailable
                  ? "border-border/40 hover:border-primary/50 hover:shadow-md"
                  : "border-border/20 opacity-75 bg-surface-container-low/30"
              }`}
            >
              {/* Product Hero Image Header */}
              <div className="relative w-full h-44 bg-surface-container overflow-hidden shrink-0">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-black/20 pointer-events-none" />

                {/* Badge Overlay */}
                <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                  {item.isTopSeller && (
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md border border-amber-300">
                      <Flame className="w-3.5 h-3.5 fill-white" />
                      <span className="font-extrabold text-[10px] uppercase tracking-wider">
                        Top Seller
                      </span>
                    </div>
                  )}
                  {item.badge && (
                    <div className="bg-surface-bright/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs border border-border/20">
                      {renderBadgeIcon(item.badge.type)}
                      <span className="font-bold text-[11px] text-on-surface">
                        {item.badge.text}
                      </span>
                    </div>
                  )}
                </div>

                {/* Availability & Stock Overlay */}
                <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                  <button
                    type="button"
                    onClick={() => onToggleAvailable(item.id)}
                    className={`px-2.5 py-1 rounded-full font-label-sm text-[10px] font-bold backdrop-blur-md shadow-xs border transition-all ${
                      item.isAvailable && item.stockQuantity > 0
                        ? "bg-emerald-500/90 text-white border-emerald-400"
                        : "bg-surface-container-highest/90 text-on-surface-variant border-border/40"
                    }`}
                  >
                    {item.isAvailable && item.stockQuantity > 0 ? "IN STOCK" : "SOLD OUT"}
                  </button>
                  {item.stockQuantity <= 5 && item.stockQuantity > 0 ? (
                    <span className="px-2 py-0.5 rounded-full font-label-sm text-[9px] font-bold bg-amber-500 text-white backdrop-blur-md shadow-xs">
                      ⚠️ {item.stockQuantity} left
                    </span>
                  ) : item.stockQuantity > 5 ? (
                    <span className="px-2 py-0.5 rounded-full font-label-sm text-[9px] font-bold bg-black/60 text-white backdrop-blur-md">
                      {item.stockQuantity} left
                    </span>
                  ) : null}
                </div>

                {/* Customer View Link */}
                <Link
                  href={`/items-detail/${item.slug}`}
                  target="_blank"
                  className="absolute bottom-2.5 right-2.5 w-7 h-7 rounded-full bg-surface-bright/80 backdrop-blur-md flex items-center justify-center text-on-surface hover:bg-white transition-colors shadow-xs"
                  title="Preview Customer Item Detail Page"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Product Body */}
              <div className="p-space-md flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-headline-sm text-base font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                    <div className="font-extrabold text-base text-primary shrink-0">
                      ${item.price.toFixed(2)}
                    </div>
                  </div>

                  {/* Culinary Description Preview */}
                  <p className="font-body-sm text-xs text-on-surface-variant line-clamp-2 leading-relaxed mb-3">
                    {item.description}
                  </p>
                </div>

                {/* Customization Options & Stock Summary */}
                <div className="space-y-2 pt-2 border-t border-border/20">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-[10px] text-on-surface-variant uppercase font-bold">
                      {item.category}
                    </span>
                    {item.options && item.options.length > 0 && (
                      <span className="px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-label-sm text-[10px] font-bold flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        <span>{item.options.length} Option Groups</span>
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded font-label-sm text-[10px] font-bold ${
                      item.stockQuantity <= 0
                        ? "bg-error-container text-error"
                        : item.stockQuantity <= 5
                        ? "bg-amber-100 text-amber-800"
                        : "bg-surface-container-high text-on-surface-variant"
                    }`}>
                      Stock: {item.stockQuantity} pcs
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="font-mono text-[11px] text-on-surface-variant">
                      /{item.slug}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenEditModal(item)}
                        className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-xs font-bold transition-colors border border-border/20 flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3 text-primary" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => onOpenDeleteModal(item)}
                        className="p-1.5 rounded-lg bg-error-container/30 hover:bg-error-container text-error transition-colors border border-error/20"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View Alternate Rendering */
        <div className="bg-surface-container-lowest rounded-2xl shadow-xs border border-border/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-sm text-xs">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-[11px] uppercase tracking-wider border-b border-border/30">
                  <th className="py-3 px-space-md">Dish &amp; Image</th>
                  <th className="py-3 px-space-md">Category</th>
                  <th className="py-3 px-space-md">Price</th>
                  <th className="py-3 px-space-md">Inventory Stock</th>
                  <th className="py-3 px-space-md">Options</th>
                  <th className="py-3 px-space-md">Visibility</th>
                  <th className="py-3 px-space-md text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-surface-container-low/70 transition-colors"
                  >
                    <td className="py-3 px-space-md">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-surface-container overflow-hidden border border-border/30 shrink-0">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-label-lg text-xs font-bold text-on-surface flex items-center gap-1.5">
                            <span>{item.name}</span>
                            {item.badge && (
                              <span className="px-1.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-[9px] font-bold">
                                {item.badge.text}
                              </span>
                            )}
                          </div>
                          <div className="font-mono text-[11px] text-on-surface-variant">
                            /{item.slug}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-space-md uppercase font-bold text-on-surface-variant">
                      {item.category}
                    </td>

                    <td className="py-3 px-space-md font-extrabold text-primary text-sm">
                      ${item.price.toFixed(2)}
                    </td>

                    <td className="py-3 px-space-md">
                      {item.stockQuantity <= 0 ? (
                        <span className="px-2 py-0.5 rounded font-label-sm text-[10px] font-bold bg-error-container text-error">
                          ❌ 0 pcs (Sold Out)
                        </span>
                      ) : item.stockQuantity <= 5 ? (
                        <span className="px-2 py-0.5 rounded font-label-sm text-[10px] font-bold bg-amber-100 text-amber-800">
                          ⚠️ {item.stockQuantity} pcs left
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded font-label-sm text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          ✅ {item.stockQuantity} pcs
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-space-md">
                      {item.options && item.options.length > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-surface-container-high font-label-sm text-[10px] font-bold text-on-surface">
                          {item.options.length} Groups
                        </span>
                      ) : (
                        <span className="text-on-surface-variant text-[11px]">
                          None
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-space-md">
                      <button
                        onClick={() => onToggleAvailable(item.id)}
                        className={`px-2.5 py-0.5 rounded-full font-label-sm text-[10px] font-bold ${
                          item.isAvailable && item.stockQuantity > 0
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-surface-container-high text-on-surface-variant"
                        }`}
                      >
                        {item.isAvailable && item.stockQuantity > 0 ? "IN STOCK" : "SOLD OUT"}
                      </button>
                    </td>

                    <td className="py-3 px-space-md text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/items-detail/${item.slug}`}
                          target="_blank"
                          className="p-1 rounded text-on-surface-variant hover:text-primary transition-colors"
                          title="Preview Item Detail Page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => onOpenEditModal(item)}
                          className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-xs font-bold transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onOpenDeleteModal(item)}
                          className="p-1 rounded text-error hover:bg-error-container transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
