"use client";

import React, { useState } from "react";
import { MenuItemRecord } from "@/types/menu";
import { MenuGrid } from "@/components/admin/menu/MenuGrid";
import { MenuItemFormDialog } from "@/components/admin/menu/MenuItemFormDialog";
import { MenuItemDeleteDialog } from "@/components/admin/menu/MenuItemDeleteDialog";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { InfiniteScrollSentinel } from "@/components/ui/InfiniteScrollSentinel";
import { Api } from "@/lib/api";

export default function MenuManagementPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "topseller" | "available" | "soldout">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const {
    items,
    setItems,
    loading,
    pagination,
    counts,
    extraData,
    sentinelRef,
    refresh,
  } = useInfiniteScroll<MenuItemRecord>("/foods.php", {
    limit: 12,
    params: {
      all: 1,
      category: selectedCategory,
      filter: statusFilter,
      search: searchQuery,
    },
  });

  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<MenuItemRecord | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItemRecord | null>(null);

  const handleOpenAddModal = () => {
    setItemToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (item: MenuItemRecord) => {
    setItemToEdit(item);
    setIsFormOpen(true);
  };

  const handleOpenDeleteModal = (item: MenuItemRecord) => {
    setItemToDelete(item);
    setIsDeleteOpen(true);
  };

  const handleToggleAvailable = async (itemId: string) => {
    const target = items.find((i) => String(i.id) === String(itemId));
    if (!target) return;

    const updatedStatus = !target.isAvailable;

    // Optimistic UI Update
    setItems((prev) =>
      prev.map((i) =>
        String(i.id) === String(itemId)
          ? {
              ...i,
              isAvailable: updatedStatus,
              stockQuantity: !updatedStatus && i.stockQuantity === 0 ? 15 : i.stockQuantity,
            }
          : i
      )
    );

    try {
      await Api.put(`/foods.php?id=${itemId}`, {
        id: itemId,
        isAvailable: updatedStatus,
      });
    } catch (err) {
      console.error("Failed to toggle availability", err);
      refresh();
    }
  };

  const handleSaveItem = async (itemData: Partial<MenuItemRecord>) => {
    try {
      if (itemData.id) {
        // Edit Existing Item
        const res = await Api.put(`/foods.php?id=${itemData.id}`, itemData);
        if (res.success) {
          refresh();
        }
      } else {
        // Add New Item
        const res = await Api.post("/foods.php", {
          ...itemData,
          status: "public",
        });
        if (res.success) {
          refresh();
        }
      }
    } catch (err) {
      console.error("Failed to save menu item", err);
    }
  };

  const handleConfirmDelete = async (itemId: string) => {
    try {
      const res = await Api.delete(`/foods.php?id=${itemId}`);
      if (res.success) {
        setItems((prev) => prev.filter((i) => String(i.id) !== String(itemId)));
      }
    } catch (err) {
      console.error("Failed to delete menu item", err);
      refresh();
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen pb-space-2xl">
      {/* Menu Catalog Grid View */}
      <MenuGrid
        items={items}
        loading={loading}
        pagination={pagination}
        counts={counts}
        categoriesList={extraData?.categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onOpenAddModal={handleOpenAddModal}
        onOpenEditModal={handleOpenEditModal}
        onOpenDeleteModal={handleOpenDeleteModal}
        onToggleAvailable={handleToggleAvailable}
      />

      {/* Reusable Infinite Scroll Sentinel */}
      <InfiniteScrollSentinel
        sentinelRef={sentinelRef}
        loading={loading}
        pagination={pagination}
        itemsCount={items.length}
        unitLabel="dishes"
      />

      {/* Shadcn UI Add / Edit Menu Item Dialog */}
      <MenuItemFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        itemToEdit={itemToEdit}
        onSave={handleSaveItem}
      />

      {/* Shadcn UI Delete Confirmation Dialog */}
      <MenuItemDeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        itemToDelete={itemToDelete}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}
