"use client";

import React, { useState } from "react";
import { CategoryRecord } from "@/types/categories";
import { CategoryGrid } from "@/components/admin/categories/CategoryGrid";
import { CategoryFormDialog } from "@/components/admin/categories/CategoryFormDialog";
import { CategoryDeleteDialog } from "@/components/admin/categories/CategoryDeleteDialog";

const initialCategories: CategoryRecord[] = [
  {
    id: "cat-1",
    name: "Starters & Appetizers",
    icon: "🍔",
    itemCount: 8,
    displayOrder: 1,
    isActive: true,
  },
  {
    id: "cat-2",
    name: "Smoked Mains & Steaks",
    icon: "🥩",
    itemCount: 12,
    displayOrder: 2,
    isActive: true,
  },
  {
    id: "cat-3",
    name: "Woodfired Sourdough Pizza",
    icon: "🍕",
    itemCount: 10,
    displayOrder: 3,
    isActive: true,
  },
  {
    id: "cat-4",
    name: "Cold Larder & Salads",
    icon: "🥗",
    itemCount: 6,
    displayOrder: 4,
    isActive: true,
  },
  {
    id: "cat-5",
    name: "Craft Desserts",
    icon: "🍨",
    itemCount: 4,
    displayOrder: 5,
    isActive: true,
  },
  {
    id: "cat-6",
    name: "Wine & Cellar Selection",
    icon: "🍷",
    itemCount: 5,
    displayOrder: 6,
    isActive: true,
  },
  {
    id: "cat-7",
    name: "Cold Drinks & Mocktails",
    icon: "🍹",
    itemCount: 7,
    displayOrder: 7,
    isActive: true,
  },
  {
    id: "cat-8",
    name: "Sides & Dip Sauces",
    icon: "🍟",
    itemCount: 6,
    displayOrder: 8,
    isActive: false,
  },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryRecord[]>(initialCategories);

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

  const handleToggleActive = (categoryId: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const handleSaveCategory = (categoryData: Partial<CategoryRecord>) => {
    if (categoryData.id) {
      // Edit Existing
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryData.id
            ? ({ ...c, ...categoryData } as CategoryRecord)
            : c
        )
      );
    } else {
      // Add New Category
      const newCategory: CategoryRecord = {
        id: `cat-${Date.now()}`,
        name: categoryData.name || "New Category",
        icon: categoryData.icon || "🍔",
        itemCount: 0,
        displayOrder: categoryData.displayOrder || categories.length + 1,
        isActive: categoryData.isActive ?? true,
      };
      setCategories((prev) => [...prev, newCategory]);
    }
  };

  const handleConfirmDelete = (categoryId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
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
