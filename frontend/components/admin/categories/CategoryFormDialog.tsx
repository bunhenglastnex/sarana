"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CategoryRecord } from "@/types/categories";
import { Sparkles } from "lucide-react";

interface CategoryFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: CategoryRecord | null;
  onSave: (categoryData: Partial<CategoryRecord>) => void;
}

const iconOptions = ["🍔", "🥩", "🍕", "🥗", "🍨", "🍷", "🍹", "🍟", "🥖", "🔥"];

export const CategoryFormDialog: React.FC<CategoryFormDialogProps> = ({
  isOpen,
  onClose,
  categoryToEdit,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🍔");
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setIcon(categoryToEdit.icon || "🍔");
      setDisplayOrder(categoryToEdit.displayOrder || 1);
      setIsActive(categoryToEdit.isActive);
    } else {
      setName("");
      setIcon("🍔");
      setDisplayOrder(1);
      setIsActive(true);
    }
  }, [categoryToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: categoryToEdit ? categoryToEdit.id : undefined,
      name,
      icon,
      displayOrder: Number(displayOrder),
      isActive,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-surface-container-lowest border-border/40 p-space-lg rounded-2xl shadow-2xl">
        <DialogHeader className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
              <Sparkles className="w-4 h-4" />
            </div>
            <DialogTitle className="font-headline-lg text-lg font-bold text-on-surface">
              {categoryToEdit ? "Edit Category" : "Create New Category"}
            </DialogTitle>
          </div>
          <DialogDescription className="font-body-sm text-xs text-on-surface-variant">
            {categoryToEdit
              ? "Update category details, badge icon, and display sequence."
              : "Add a new culinary category to organize your menu items for customer ordering."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-space-md py-2">
          {/* Category Icon Picker */}
          <div>
            <label className="font-label-sm text-xs font-bold text-on-surface mb-1.5 block">
              Category Badge Icon / Emoji
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-surface-container-low rounded-xl border border-border/30">
              {iconOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-transform active:scale-95 ${
                    icon === emoji
                      ? "bg-surface-container-lowest ring-2 ring-primary shadow-xs font-bold scale-105"
                      : "hover:bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Name & Display Order */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
            <div className="sm:col-span-2">
              <label className="font-label-sm text-xs font-bold text-on-surface mb-1 block">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Woodfired Pizza"
                className="w-full px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-xs outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary border border-border/20 transition-all"
              />
            </div>

            <div>
              <label className="font-label-sm text-xs font-bold text-on-surface mb-1 block">
                Display Order
              </label>
              <input
                type="number"
                min="1"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-xs outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary border border-border/20 transition-all font-bold"
              />
            </div>
          </div>

          {/* Status Toggle Switch */}
          <div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded-xl border border-border/20">
            <div>
              <div className="font-label-md text-xs font-bold text-on-surface">
                Category Visibility Status
              </div>
              <div className="font-body-sm text-[11px] text-on-surface-variant">
                {isActive
                  ? "Active — Visible on customer menu & ordering app"
                  : "Hidden — Hidden from online customer catalog"}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                isActive ? "bg-primary" : "bg-surface-container-highest"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform ${
                  isActive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <DialogFooter className="pt-2 gap-space-xs sm:gap-0">
            <button
              type="button"
              onClick={onClose}
              className="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-xs font-bold transition-colors border border-border/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-space-md py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-sm text-xs font-bold transition-colors shadow-xs"
            >
              {categoryToEdit ? "Save Changes" : "Create Category"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
