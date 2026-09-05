"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { MenuItemRecord } from "@/types/menu";
import { AlertTriangle, Trash2 } from "lucide-react";

interface MenuItemDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  itemToDelete?: MenuItemRecord | null;
  onConfirmDelete: (itemId: string) => void;
}

export const MenuItemDeleteDialog: React.FC<MenuItemDeleteDialogProps> = ({
  isOpen,
  onClose,
  itemToDelete,
  onConfirmDelete,
}) => {
  if (!itemToDelete) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm bg-surface-container-lowest border-border/40 p-space-lg rounded-2xl shadow-2xl">
        <DialogHeader className="space-y-2 text-left">
          <div className="w-10 h-10 rounded-xl bg-error-container/40 flex items-center justify-center text-error">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <DialogTitle className="font-headline-lg text-lg font-bold text-on-surface">
            Delete Menu Item?
          </DialogTitle>
          <DialogDescription className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
            Are you sure you want to remove{" "}
            <strong className="text-on-surface font-bold">
              {itemToDelete.name}
            </strong>{" "}
            from your bistro menu catalog? This action will hide it from online customer ordering.
          </DialogDescription>
        </DialogHeader>

        <div className="my-2 p-3 bg-error-container/20 rounded-xl border border-error/20 text-xs space-y-1">
          <div className="font-bold text-error flex items-center gap-1">
            <Trash2 className="w-3.5 h-3.5" />
            <span>Removal Warning</span>
          </div>
          <p className="text-on-surface-variant">
            Price: ${itemToDelete.price.toFixed(2)} • {itemToDelete.options?.length || 0} Customization Option Groups linked.
          </p>
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
            type="button"
            onClick={() => {
              onConfirmDelete(itemToDelete.id);
              onClose();
            }}
            className="px-space-md py-2 rounded-lg bg-error hover:bg-error/90 text-on-error font-label-sm text-xs font-bold transition-colors shadow-xs flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Item</span>
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
