"use client";

import React, { useState } from "react";
import { CategoryRecord } from "@/types/categories";
import { CategoryGrid } from "@/components/admin/categories/CategoryGrid";
import { CategoryFormDialog } from "@/components/admin/categories/CategoryFormDialog";
import { CategoryDeleteDialog } from "@/components/admin/categories/CategoryDeleteDialog";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { InfiniteScrollSentinel } from "@/components/ui/InfiniteScrollSentinel";
import { Api } from "@/lib/api";

export default function CategoriesPage() {
  const {
    items: categories,
    setItems: setCategories,
    loading,
    pagination,
    sentinelRef,
    refresh,
  } = useInfiniteScroll<CategoryRecord>("/categories.php", { limit: 12 });

  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<CategoryRecord | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryRecord | null>(null);

  const handleOpenAddModal = () => {
    setCategoryToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (category: CategoryRecord) => {
    setCategoryToEdit(category);
    setIsFormOpen(true);
  };

  const handleOpenDeleteModal = (category: CategoryRecord) => {
    setCategoryToDelete(category);
    setIsDeleteOpen(true);
  };

  const handleToggleActive = async (categoryId: string) => {
    const target = categories.find((c) => String(c.id) === String(categoryId));
    if (!target) return;

    // Optimistic UI Update
    setCategories((prev) =>
      prev.map((c) => (String(c.id) === String(categoryId) ? { ...c, isActive: !c.isActive } : c))
    );

    try {
      await Api.put(`/categories.php?id=${categoryId}`, {
        id: categoryId,
        name: target.name,
        icon: target.icon,
        image_url: target.image_url || target.imageUrl,
        description: target.description,
        displayOrder: target.displayOrder,
      });
    } catch (err) {
      console.error("Failed to toggle category active status", err);
      refresh();
    }
  };

  const handleSaveCategory = async (categoryData: Partial<CategoryRecord>) => {
    try {
      if (categoryData.id) {
        // Edit Existing Category
        const res = await Api.put(`/categories.php?id=${categoryData.id}`, categoryData);
        if (res.success) {
          refresh();
        }
      } else {
        // Add New Category
        const res = await Api.post("/categories.php", categoryData);
        if (res.success) {
          refresh();
        }
      }
    } catch (err) {
      console.error("Failed to save category", err);
    }
  };

  const handleConfirmDelete = async (categoryId: string) => {
    try {
      const res = await Api.delete(`/categories.php?id=${categoryId}`);
      if (res.success) {
        setCategories((prev) => prev.filter((c) => String(c.id) !== String(categoryId)));
      }
    } catch (err) {
      console.error("Failed to delete category", err);
      refresh();
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen pb-space-2xl">
      {/* Category Directory & Grid View */}
      <CategoryGrid
        categories={categories}
        onOpenAddModal={handleOpenAddModal}
        onOpenEditModal={handleOpenEditModal}
        onOpenDeleteModal={handleOpenDeleteModal}
        onToggleActive={handleToggleActive}
      />

      {/* Infinite Scroll Observer & Progress Bar */}
      <InfiniteScrollSentinel
        sentinelRef={sentinelRef}
        loading={loading}
        pagination={pagination}
        itemsCount={categories.length}
        unitLabel="categories"
      />

      {/* Shadcn UI Add / Edit Category Dialog Component */}
      <CategoryFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        categoryToEdit={categoryToEdit}
        onSave={handleSaveCategory}
      />

      {/* Shadcn UI Delete Confirmation Dialog Component */}
      <CategoryDeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        categoryToDelete={categoryToDelete}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}
