"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Tags,
  Flame,
  LayoutGrid,
  List,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  CheckCircle2,
  Utensils,
} from "lucide-react";
import { CategoryRecord } from "@/types/categories";

interface CategoryGridProps {
  categories: CategoryRecord[];
  onOpenAddModal: () => void;
  onOpenEditModal: (category: CategoryRecord) => void;
  onOpenDeleteModal: (category: CategoryRecord) => void;
  onToggleActive: (categoryId: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  onOpenAddModal,
  onOpenEditModal,
  onOpenDeleteModal,
  onToggleActive,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "hidden">("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const filteredCategories = categories.filter((cat) => {
    if (filterStatus === "active" && !cat.isActive) return false;
    if (filterStatus === "hidden" && cat.isActive) return false;

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return cat.name.toLowerCase().includes(q);
    }
    return true;
  });

  const totalActive = categories.filter((c) => c.isActive).length;
  const totalItemsCount = categories.reduce((sum, c) => sum + c.itemCount, 0);

  return (
    <div className="flex flex-col gap-space-lg">
      {/* Category Management Sub-Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-2xl shadow-xs border border-border/40">
        <div>
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-xs uppercase tracking-wider mb-1">
            <span>Culinary Taxonomy</span>
            <span>/</span>
            <span className="text-primary font-bold">Categories Directory</span>
          </div>
          <div className="flex items-center gap-space-sm">
            <h1 className="font-headline-lg text-2xl font-bold text-on-surface tracking-tight">
              Menu Categories
            </h1>
            <span className="inline-flex items-center px-space-xs py-0.5 rounded-full font-label-sm text-xs bg-primary-fixed text-on-primary-fixed font-bold">
              {categories.length} Categories
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
              <div className="font-label-sm text-[11px] text-on-surface-variant">Active Visibility</div>
              <div className="font-headline-sm text-sm text-on-surface font-bold">
                {totalActive} Active / {categories.length} Total
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low px-space-md py-2 rounded-xl flex items-center gap-space-sm shrink-0 shadow-xs border border-border/30">
            <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary font-bold">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <div className="font-label-sm text-[11px] text-on-surface-variant">Total Menu Dishes</div>
              <div className="font-headline-sm text-sm text-on-surface font-bold">
                {totalItemsCount} Dishes Linked
              </div>
            </div>
          </div>

          {/* Add Category Trigger Button */}
          <button
            onClick={onOpenAddModal}
            className="px-space-md py-2.5 rounded-xl bg-primary text-on-primary font-label-sm text-xs font-bold flex items-center gap-1.5 shadow-md hover:bg-primary-container transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Category</span>
          </button>
        </div>
      </div>

      {/* Filter & View Switch Utility Bar */}
      <div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-xs border border-border/40 flex flex-wrap items-center justify-between gap-space-sm">
        {/* Search */}
        <div className="flex items-center gap-space-xs flex-1 min-w-[240px]">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category name..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-xs outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary border border-transparent focus:border-border/40 transition-all"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-space-xs">
          <div className="flex items-center bg-surface-container p-1 rounded-lg border border-border/30">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-space-sm py-1 rounded-md font-label-sm text-xs transition-colors ${
                filterStatus === "all"
                  ? "bg-inverse-surface text-inverse-on-surface font-bold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface font-medium"
              }`}
            >
              All ({categories.length})
            </button>
            <button
              onClick={() => setFilterStatus("active")}
              className={`px-space-sm py-1 rounded-md font-label-sm text-xs transition-colors ${
                filterStatus === "active"
                  ? "bg-inverse-surface text-inverse-on-surface font-bold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface font-medium"
              }`}
            >
              Active ({totalActive})
            </button>
            <button
              onClick={() => setFilterStatus("hidden")}
              className={`px-space-sm py-1 rounded-md font-label-sm text-xs transition-colors ${
                filterStatus === "hidden"
                  ? "bg-inverse-surface text-inverse-on-surface font-bold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface font-medium"
              }`}
            >
              Hidden ({categories.length - totalActive})
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md items-stretch">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className={`bg-surface-container-lowest rounded-2xl shadow-xs border transition-all flex flex-col justify-between p-space-md relative ${
                cat.isActive
                  ? "border-border/40 hover:border-primary/50 hover:shadow-md"
                  : "border-border/20 opacity-70 bg-surface-container-low/40"
              }`}
            >
              <div>
                {/* Top Row: Emoji Icon + Title + Active Toggle */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-low border border-border/30 flex items-center justify-center text-xl shadow-xs shrink-0">
                      {cat.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-headline-sm text-base font-bold text-on-surface truncate">
                        {cat.name}
                      </h3>
                    </div>
                  </div>

                  {/* Quick Visibility Switch */}
                  <button
                    onClick={() => onToggleActive(cat.id)}
                    title={cat.isActive ? "Hide Category" : "Show Category"}
                    className={`p-1.5 rounded-lg transition-colors border shrink-0 ${
                      cat.isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                        : "bg-surface-container text-on-surface-variant border-border/30 hover:bg-surface-container-high"
                    }`}
                  >
                    {cat.isActive ? (
                      <Eye className="w-3.5 h-3.5" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Metadata Badges */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  <span className="px-2 py-0.5 rounded-md bg-secondary-fixed text-on-secondary-fixed font-label-sm text-[10px] font-bold">
                    {cat.itemCount} Dishes
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-surface-container font-label-sm text-[10px] text-on-surface-variant font-mono">
                    Order #{cat.displayOrder}
                  </span>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-3 border-t border-border/20 flex items-center justify-between gap-space-xs mt-auto">
                <span className="font-label-sm text-[10px] text-on-surface-variant font-semibold">
                  {cat.isActive ? "Status: Active" : "Status: Hidden"}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenEditModal(cat)}
                    className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-xs font-bold transition-colors border border-border/20 flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3 text-primary" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => onOpenDeleteModal(cat)}
                    className="p-1.5 rounded-lg bg-error-container/30 hover:bg-error-container text-error transition-colors border border-error/20"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
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
                  <th className="py-3 px-space-md">Category &amp; Icon</th>
                  <th className="py-3 px-space-md">Items Linked</th>
                  <th className="py-3 px-space-md">Display Order</th>
                  <th className="py-3 px-space-md">Visibility</th>
                  <th className="py-3 px-space-md text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {filteredCategories.map((cat) => (
                  <tr
                    key={cat.id}
                    className="hover:bg-surface-container-low/70 transition-colors"
                  >
                    <td className="py-3.5 px-space-md">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{cat.icon}</span>
                        <div className="font-label-lg text-xs font-bold text-on-surface">
                          {cat.name}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-space-md font-bold text-on-surface">
                      {cat.itemCount} items
                    </td>

                    <td className="py-3.5 px-space-md font-mono text-on-surface-variant">
                      #{cat.displayOrder}
                    </td>

                    <td className="py-3.5 px-space-md">
                      <button
                        onClick={() => onToggleActive(cat.id)}
                        className={`px-2 py-0.5 rounded-full font-label-sm text-[10px] font-bold ${
                          cat.isActive
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-surface-container-high text-on-surface-variant"
                        }`}
                      >
                        {cat.isActive ? "ACTIVE" : "HIDDEN"}
                      </button>
                    </td>

                    <td className="py-3.5 px-space-md text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onOpenEditModal(cat)}
                          className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-xs font-bold transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onOpenDeleteModal(cat)}
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
