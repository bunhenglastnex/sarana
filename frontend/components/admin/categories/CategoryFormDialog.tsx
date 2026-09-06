"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CategoryRecord } from "@/types/categories";
import { Sparkles, Image as ImageIcon, UploadCloud, Upload, X } from "lucide-react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🍔");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setIcon(categoryToEdit.icon || "🍔");
      const img = categoryToEdit.image_url || categoryToEdit.imageUrl || "";
      // If relative image path from backend (e.g. /uploads/categories/img_xxx.jpg), prepend backend server host if needed for preview
      if (img && img.startsWith("/")) {
        const backendHost = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "") : "http://localhost:8000";
        setImageUrl(`${backendHost}${img}`);
      } else {
        setImageUrl(img);
      }
      setDescription(categoryToEdit.description || "");
      setDisplayOrder(categoryToEdit.displayOrder || 1);
      setIsActive(categoryToEdit.isActive);
    } else {
      setName("");
      setIcon("🍔");
      setImageUrl("");
      setDescription("");
      setDisplayOrder(1);
      setIsActive(true);
    }
  }, [categoryToEdit, isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: categoryToEdit ? categoryToEdit.id : undefined,
      name,
      icon,
      image_url: imageUrl || null,
      imageUrl: imageUrl || null,
      description,
      displayOrder: Number(displayOrder),
      isActive,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-surface-container-lowest border-border/40 p-space-lg rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
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
              ? "Update category details, category banner image, badge icon, and display sequence."
              : "Add a new culinary category to organize your menu items for customer ordering."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-space-md py-2">
          {/* Category Banner Image Upload */}
          <div className="p-3 bg-surface-container-low/70 rounded-xl border border-border/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-label-sm text-xs font-bold text-on-surface flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-primary" />
                <span>Category Image (image_url)</span>
              </label>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="text-[11px] font-bold text-error hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  <span>Remove Image</span>
                </button>
              )}
            </div>

            {/* Live Banner Image Preview */}
            <div className="relative w-full h-32 rounded-xl overflow-hidden bg-surface-container border border-border/40 group shadow-xs">
              {imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt="Category Preview"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-between p-2.5 text-white">
                    <div>
                      <div className="font-label-sm text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                        Active Category Banner
                      </div>
                      <div className="font-headline-sm text-xs font-bold truncate max-w-[200px]">
                        {name || "Category Image"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2 py-1 rounded bg-primary hover:bg-primary-container text-on-primary text-[10px] font-bold shadow-xs flex items-center gap-1 transition-all active:scale-95"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Change</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant gap-1 p-3 text-center">
                  <ImageIcon className="w-6 h-6 opacity-40 text-primary" />
                  <span className="text-xs font-bold text-on-surface">No Image Uploaded</span>
                  <span className="text-[10px] text-on-surface-variant">Upload an image file or fallback to emoji icon</span>
                </div>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Click to Upload Button */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-surface-container-lowest rounded-xl border border-dashed border-primary/40 hover:border-primary flex items-center justify-center gap-2.5 cursor-pointer transition-all hover:bg-surface-container-low group shadow-xs"
            >
              <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                <UploadCloud className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-label-sm text-xs font-bold text-on-surface">
                  Upload Category Image File
                </div>
                <div className="font-body-sm text-[10px] text-on-surface-variant">
                  Select PNG, JPG, WEBP from computer
                </div>
              </div>
            </div>
          </div>

          {/* Category Icon Picker */}
          <div>
            <label className="font-label-sm text-xs font-bold text-on-surface mb-1.5 block">
              Fallback Badge Icon / Emoji
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
                className="w-full px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-xs outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary border border-border/20 transition-all font-semibold"
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

          {/* Description */}
          <div>
            <label className="font-label-sm text-xs font-bold text-on-surface mb-1 block">
              Category Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Refreshing iced teas, freshly squeezed lemonades, sodas..."
              className="w-full p-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-xs outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary border border-border/20 leading-relaxed"
            />
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

