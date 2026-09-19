"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MenuItemRecord,
  CATEGORY_OPTIONS,
  CustomizationOptionGroup,
} from "@/types/menu";
import {
  Sparkles,
  Plus,
  Trash2,
  Image as ImageIcon,
  Flame,
  Award,
  ThumbsUp,
  Layers,
  ChevronDown,
  ChevronUp,
  Upload,
  UploadCloud,
  FileImage,
  Check,
  Star,
} from "lucide-react";

interface MenuItemFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: MenuItemRecord | null;
  onSave: (itemData: Partial<MenuItemRecord>) => void;
}

export const MenuItemFormDialog: React.FC<MenuItemFormDialogProps> = ({
  isOpen,
  onClose,
  itemToEdit,
  onSave,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");

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
  const [category, setCategory] = useState("burgers");
  const [price, setPrice] = useState<number | "">(14.5);
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [badgeText, setBadgeText] = useState("");
  const [badgeType, setBadgeType] = useState<"chef" | "fire" | "award">("chef");
  const [isAvailable, setIsAvailable] = useState(true);
  const [stockQuantity, setStockQuantity] = useState(25);
  const [isTopSeller, setIsTopSeller] = useState(false);
  const [totalSold, setTotalSold] = useState(120);
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(15);
  const [rating, setRating] = useState<number>(4.9);
  const [reviewCount, setReviewCount] = useState<number>(248);
  const [options, setOptions] = useState<CustomizationOptionGroup[]>([]);

  const displayImageUrl = useMemo(() => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://") || imageUrl.startsWith("data:")) {
      return imageUrl;
    }
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return imageUrl.startsWith("/") ? `${apiBase}${imageUrl}` : `${apiBase}/${imageUrl}`;
  }, [imageUrl]);

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name || "");
      setCategory(itemToEdit.category || "burgers");
      setPrice(itemToEdit.price ?? 14.5);
      setDescription(itemToEdit.description || "");
      setImageUrl(itemToEdit.imageUrl || (itemToEdit as any).image_url || "");
      setBadgeText(itemToEdit.badge?.text || "");
      setBadgeType(itemToEdit.badge?.type || "chef");
      setIsAvailable(itemToEdit.isAvailable ?? true);
      setStockQuantity(itemToEdit.stockQuantity ?? 25);
      setIsTopSeller(itemToEdit.isTopSeller ?? false);
      setTotalSold(itemToEdit.totalSold ?? 120);
      setPrepTimeMinutes(itemToEdit.prepTimeMinutes || 15);
      setRating(itemToEdit.rating ?? 4.9);
      setReviewCount(itemToEdit.reviewCount ?? 248);
      setOptions(
        itemToEdit.options
          ? JSON.parse(JSON.stringify(itemToEdit.options))
          : [],
      );
    } else {
      setName("");
      setCategory("burgers");
      setPrice(14.5);
      setDescription("");
      setImageUrl("");
      setBadgeText("Chef's Pick");
      setBadgeType("chef");
      setIsAvailable(true);
      setStockQuantity(25);
      setIsTopSeller(true);
      setTotalSold(150);
      setPrepTimeMinutes(15);
      setRating(4.9);
      setReviewCount(120);
      setOptions([]);
    }
  }, [itemToEdit, isOpen]);

  // Option Groups Logic
  const handleAddOptionGroup = () => {
    setOptions((prev) => [
      ...prev,
      {
        name: "",
        required: false,
        choices: [{ label: "", priceExtra: 0 }],
      },
    ]);
  };

  const handleRemoveOptionGroup = (groupIndex: number) => {
    setOptions((prev) => prev.filter((_, idx) => idx !== groupIndex));
  };

  const handleUpdateGroupTitle = (groupIndex: number, newName: string) => {
    setOptions((prev) =>
      prev.map((g, idx) => (idx === groupIndex ? { ...g, name: newName } : g)),
    );
  };

  const handleToggleGroupRequired = (groupIndex: number) => {
    setOptions((prev) =>
      prev.map((g, idx) =>
        idx === groupIndex ? { ...g, required: !g.required } : g,
      ),
    );
  };

  const handleAddChoice = (groupIndex: number) => {
    setOptions((prev) =>
      prev.map((g, idx) =>
        idx === groupIndex
          ? {
              ...g,
              choices: [
                ...g.choices,
                { label: "", priceExtra: 0 },
              ],
            }
          : g,
      ),
    );
  };

  const handleRemoveChoice = (groupIndex: number, choiceIndex: number) => {
    setOptions((prev) =>
      prev.map((g, idx) =>
        idx === groupIndex
          ? {
              ...g,
              choices: g.choices.filter((_, cIdx) => cIdx !== choiceIndex),
            }
          : g,
      ),
    );
  };

  const handleUpdateChoiceLabel = (
    groupIndex: number,
    choiceIndex: number,
    label: string,
  ) => {
    setOptions((prev) =>
      prev.map((g, idx) =>
        idx === groupIndex
          ? {
              ...g,
              choices: g.choices.map((c, cIdx) =>
                cIdx === choiceIndex ? { ...c, label } : c,
              ),
            }
          : g,
      ),
    );
  };

  const handleUpdateChoicePrice = (
    groupIndex: number,
    choiceIndex: number,
    priceExtra: number,
  ) => {
    setOptions((prev) =>
      prev.map((g, idx) =>
        idx === groupIndex
          ? {
              ...g,
              choices: g.choices.map((c, cIdx) =>
                cIdx === choiceIndex ? { ...c, priceExtra } : c,
              ),
            }
          : g,
      ),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const slug = itemToEdit
      ? itemToEdit.slug
      : name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

    const finalStock =
      typeof stockQuantity === "number"
        ? stockQuantity
        : Number(stockQuantity) || 0;
    const finalAvailable = finalStock > 0 ? isAvailable : false;

    onSave({
      id: itemToEdit ? itemToEdit.id : undefined,
      name,
      slug,
      category,
      price: typeof price === "number" ? price : Number(price) || 0,
      description,
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
      badge: badgeText.trim()
        ? { text: badgeText.trim(), type: badgeType }
        : undefined,
      options: options.filter((g) => g.choices.length > 0),
      isAvailable: finalAvailable,
      stockQuantity: finalStock,
      isTopSeller,
      totalSold: Number(totalSold) || 0,
      prepTimeMinutes,
      rating: typeof rating === "number" ? rating : parseFloat(rating) || 4.9,
      reviewCount: typeof reviewCount === "number" ? reviewCount : parseInt(reviewCount, 10) || 0,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-surface-container-lowest border-border/40 p-space-lg rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
              <Sparkles className="w-4 h-4" />
            </div>
            <DialogTitle className="font-headline-lg text-lg font-bold text-on-surface">
              {itemToEdit ? "Edit Menu Dish" : "Create New Menu Item"}
            </DialogTitle>
          </div>
          <DialogDescription className="font-body-sm text-xs text-on-surface-variant">
            {itemToEdit
              ? "Update dish details, pricing, badge tag, and customer customization choices."
              : "Add a new dish to your bistro menu catalog for online customer ordering."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Main Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            {/* Dish Name */}
            <div className="sm:col-span-2">
              <label className="font-label-sm text-xs font-bold text-on-surface mb-1 block">
                Dish Title / Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Smoked Bacon Truffle Burger"
                className="w-full px-3 py-2 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-xs outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary border border-border/20 transition-all font-semibold"
              />
            </div>

            {/* Category Dropdown (Shadcn UI Select Component) */}
            <div>
              <label className="font-label-sm text-xs font-bold text-on-surface mb-1 block">
                Menu Category *
              </label>
              <Select
                value={category}
                onValueChange={(val) => setCategory(val)}
              >
                <SelectTrigger className="w-full h-9 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-xs border border-border/20 focus:ring-1 focus:ring-primary font-medium">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="bg-surface-container-lowest border border-border/40 shadow-xl z-[100]">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <SelectItem
                      key={cat.value}
                      value={cat.value}
                      className="text-xs font-medium cursor-pointer focus:bg-surface-container-low"
                    >
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Base Price */}
            <div>
              <label className="font-label-sm text-xs font-bold text-on-surface mb-1 block">
                Base Price ($) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-primary">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={price}
                  onChange={(e) =>
                    setPrice(
                      e.target.value === "" ? "" : parseFloat(e.target.value),
                    )
                  }
                  placeholder="14.50"
                  className="w-full pl-7 pr-3 py-2 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-xs outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary border border-border/20 transition-all font-bold text-base"
                />
              </div>
            </div>
          </div>

          {/* Dish Hero Image Upload Section (File Upload Only) */}
          <div className="p-3.5 bg-surface-container-low/60 rounded-xl border border-border/30 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-label-sm text-xs font-bold text-on-surface flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-primary" />
                <span>Dish Hero Image Upload *</span>
              </label>
              <span className="text-[11px] text-on-surface-variant font-medium">
                Upload image file from device
              </span>
            </div>

            {/* Live Hero Image Banner Preview */}
            <div className="relative w-full h-36 rounded-xl overflow-hidden bg-surface-container border border-border/40 group shadow-xs">
              {displayImageUrl ? (
                <>
                  <img
                    key={displayImageUrl}
                    src={displayImageUrl}
                    alt="Dish Preview"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-between p-3 text-white">
                    <div>
                      <div className="font-label-sm text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                        Active Image Preview
                      </div>
                      <div className="font-headline-sm text-sm font-bold truncate max-w-xs">
                        {name || "Untitled Culinary Dish"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded bg-primary hover:bg-primary-container text-on-primary text-[11px] font-bold shadow-xs flex items-center gap-1 transition-all active:scale-95"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Change File</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant gap-1.5 p-4 text-center">
                  <ImageIcon className="w-8 h-8 opacity-40 text-primary" />
                  <span className="text-xs font-bold text-on-surface">No Image File Selected</span>
                  <span className="text-[11px] text-on-surface-variant">Click below to upload a dish image from your device</span>
                </div>
              )}
            </div>

            {/* Native File Upload Input (Hidden) */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Click to Upload File Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-4 bg-surface-container-lowest rounded-xl border-2 border-dashed border-primary/40 hover:border-primary flex items-center justify-center gap-3 cursor-pointer transition-all hover:bg-surface-container-low group shadow-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-label-sm text-xs font-bold text-on-surface">
                  Choose Image File from Device
                </div>
                <div className="font-body-sm text-[11px] text-on-surface-variant">
                  Select image file (PNG, JPG, WEBP) to upload
                </div>
              </div>
            </div>
          </div>

          {/* Badge Tag Config */}
          <div className="p-3 bg-surface-container-low rounded-xl border border-border/30 space-y-2">
            <div className="font-label-sm text-xs font-bold text-on-surface flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-secondary" />
              <span>Highlights &amp; Badge Tag (Optional)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  placeholder="e.g. Chef's Pick, Wood-fired, Bestseller..."
                  className="w-full px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-xs outline-none focus:ring-1 focus:ring-primary border border-border/20"
                />
              </div>
              <div>
                <Select
                  value={badgeType}
                  onValueChange={(val) =>
                    setBadgeType(val as "chef" | "fire" | "award")
                  }
                >
                  <SelectTrigger className="w-full h-8 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-xs border border-border/20 font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-container-lowest border border-border/40 shadow-xl z-[100]">
                    <SelectItem value="chef" className="text-xs">
                      ⭐ Chef Special
                    </SelectItem>
                    <SelectItem value="fire" className="text-xs">
                      🔥 Wood-Fired
                    </SelectItem>
                    <SelectItem value="award" className="text-xs">
                      🏆 Award Winning
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <label className="font-label-sm text-xs font-bold text-on-surface mb-1 block">
              Detailed Culinary Description *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe ingredients, cooking technique, cut of meat, hearth smoke style..."
              className="w-full p-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-xs outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary border border-border/20 leading-relaxed"
            />
          </div>

          {/* Inventory Stock Count & Availability Controls */}
          <div className="p-3.5 bg-surface-container-low/70 rounded-xl border border-border/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-label-md text-xs font-bold text-on-surface flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-primary" />
                <span>Inventory Stock Count &amp; Order Protection</span>
              </div>
              {stockQuantity <= 0 ? (
                <span className="px-2 py-0.5 rounded font-label-sm text-[10px] font-bold bg-error-container text-error">
                  ❌ SOLD OUT (0 in Stock)
                </span>
              ) : stockQuantity <= 5 ? (
                <span className="px-2 py-0.5 rounded font-label-sm text-[10px] font-bold bg-amber-100 text-amber-800">
                  ⚠️ LOW STOCK ({stockQuantity} Remaining)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded font-label-sm text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  ✅ IN STOCK ({stockQuantity} Units)
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm items-center">
              {/* Stock Quantity Input */}
              <div>
                <label className="font-label-sm text-[11px] font-bold text-on-surface mb-1 block">
                  Available Quantity Count *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stockQuantity}
                  onChange={(e) => {
                    const q = Number(e.target.value);
                    setStockQuantity(q);
                    if (q > 0 && !isAvailable) setIsAvailable(true);
                    if (q <= 0 && isAvailable) setIsAvailable(false);
                  }}
                  className="w-full px-3 py-1.5 rounded-lg bg-surface-container-lowest font-bold text-sm text-on-surface outline-none border border-border/20 focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Quick Presets */}
              <div className="sm:col-span-2">
                <label className="font-label-sm text-[11px] font-bold text-on-surface-variant mb-1 block">
                  Quick Stock Presets
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setStockQuantity(10);
                      setIsAvailable(true);
                    }}
                    className="px-2.5 py-1 rounded bg-surface-container-lowest hover:bg-surface-container font-label-sm text-[11px] font-bold border border-border/20 text-on-surface"
                  >
                    +10 Units
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStockQuantity(25);
                      setIsAvailable(true);
                    }}
                    className="px-2.5 py-1 rounded bg-surface-container-lowest hover:bg-surface-container font-label-sm text-[11px] font-bold border border-border/20 text-on-surface"
                  >
                    +25 Units
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStockQuantity(50);
                      setIsAvailable(true);
                    }}
                    className="px-2.5 py-1 rounded bg-surface-container-lowest hover:bg-surface-container font-label-sm text-[11px] font-bold border border-border/20 text-on-surface"
                  >
                    +50 Units
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStockQuantity(0);
                      setIsAvailable(false);
                    }}
                    className="px-2.5 py-1 rounded bg-error-container/40 hover:bg-error-container font-label-sm text-[11px] font-bold border border-error/20 text-error"
                  >
                    Set 0 (Sold Out)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Availability Status, Top Seller & Prep Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
            {/* Online Menu Visibility */}
            <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-border/20">
              <div>
                <div className="font-label-md text-xs font-bold text-on-surface">
                  Menu Visibility
                </div>
                <div className="font-body-sm text-[11px] text-on-surface-variant">
                  {isAvailable && stockQuantity > 0 ? "Visible" : "Hidden"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAvailable(!isAvailable)}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                  isAvailable && stockQuantity > 0
                    ? "bg-primary"
                    : "bg-surface-container-highest"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform ${
                    isAvailable && stockQuantity > 0
                      ? "translate-x-5"
                      : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Top Seller Switch */}
            <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-xl border border-amber-500/30">
              <div>
                <div className="font-label-md text-xs font-bold text-amber-900 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>Top Seller 🔥</span>
                </div>
                <div className="font-body-sm text-[11px] text-amber-700 font-medium">
                  {isTopSeller ? "Bestseller Dish" : "Normal Item"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTopSeller(!isTopSeller)}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                  isTopSeller ? "bg-amber-500" : "bg-surface-container-highest"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform ${
                    isTopSeller ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Est Prep Time */}
            <div className="p-3 bg-surface-container-low rounded-xl border border-border/20 flex items-center justify-between">
              <div>
                <div className="font-label-md text-xs font-bold text-on-surface">
                  Est. Prep Time
                </div>
                <div className="font-body-sm text-[11px] text-on-surface-variant">
                  Kitchen speed
                </div>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  value={prepTimeMinutes}
                  onChange={(e) => setPrepTimeMinutes(Number(e.target.value))}
                  className="w-16 px-2 py-1 rounded bg-surface-container-lowest text-center font-bold text-xs outline-none border border-border/30"
                />
                <span className="font-label-sm text-xs text-on-surface-variant">
                  min
                </span>
              </div>
            </div>
          </div>

          {/* Customization Options Builder Section */}
          <div className="p-3.5 bg-surface-container-low/60 rounded-xl border border-border/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <span className="font-label-md text-xs font-bold text-on-surface">
                  Customization Option Groups ({options.length})
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddOptionGroup}
                className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-label-sm text-xs font-bold transition-colors border border-primary/20 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Customization Group</span>
              </button>
            </div>

            {options.length === 0 ? (
              <div className="text-center py-4 bg-surface-container-lowest rounded-lg border border-dashed border-border/30 text-xs text-on-surface-variant">
                No customization option groups configured. Click &quot;Add
                Customization Group&quot; to add choices like Bun choice, Cheese
                selection, or Extra toppings.
              </div>
            ) : (
              <div className="space-y-3">
                {options.map((group, groupIdx) => (
                  <div
                    key={groupIdx}
                    className="p-3 bg-surface-container-lowest rounded-xl border border-border/30 space-y-2.5 shadow-xs"
                  >
                    {/* Option Group Header */}
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={group.name}
                        onChange={(e) =>
                          handleUpdateGroupTitle(groupIdx, e.target.value)
                        }
                        placeholder="Option Group Title (e.g. Choice of Bun)"
                        className="flex-1 px-2.5 py-1 rounded bg-surface-container-low font-label-md text-xs font-bold text-on-surface outline-none border border-border/20 focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
                      />

                      <label className="flex items-center gap-1.5 cursor-pointer text-xs shrink-0">
                        <input
                          type="checkbox"
                          checked={group.required ?? false}
                          onChange={() => handleToggleGroupRequired(groupIdx)}
                          className="rounded border-border/40 text-primary focus:ring-primary w-3.5 h-3.5"
                        />
                        <span className="font-label-sm text-[11px] font-bold text-primary">
                          Required Selection
                        </span>
                      </label>

                      <button
                        type="button"
                        onClick={() => handleRemoveOptionGroup(groupIdx)}
                        className="p-1 rounded text-error hover:bg-error-container transition-colors shrink-0"
                        title="Remove Option Group"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Choice Items List */}
                    <div className="space-y-1.5 pl-2 border-l-2 border-primary/30">
                      {group.choices.map((choice, choiceIdx) => (
                        <div
                          key={choiceIdx}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="text"
                            value={choice.label}
                            onChange={(e) =>
                              handleUpdateChoiceLabel(
                                groupIdx,
                                choiceIdx,
                                e.target.value,
                              )
                            }
                            placeholder="Choice Label (e.g. Gluten-Free Bun)"
                            className="flex-1 px-2.5 py-1 rounded bg-surface-container-low text-xs text-on-surface outline-none border border-border/20"
                          />
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[11px] text-on-surface-variant font-bold">
                              +$
                            </span>
                            <input
                              type="number"
                              step="0.25"
                              min="0"
                              value={choice.priceExtra}
                              onChange={(e) =>
                                handleUpdateChoicePrice(
                                  groupIdx,
                                  choiceIdx,
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              className="w-16 px-2 py-1 rounded bg-surface-container-low text-xs font-bold text-on-surface outline-none border border-border/20"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveChoice(groupIdx, choiceIdx)
                            }
                            className="p-1 text-on-surface-variant hover:text-error transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => handleAddChoice(groupIdx)}
                        className="mt-1 font-label-sm text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Option Choice</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              {itemToEdit ? "Save Dish Changes" : "Create Menu Item"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
