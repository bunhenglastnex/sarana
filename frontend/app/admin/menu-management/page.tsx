"use client";

import React, { useState } from "react";
import { MenuItemRecord } from "@/types/menu";
import { MenuGrid } from "@/components/admin/menu/MenuGrid";
import { MenuItemFormDialog } from "@/components/admin/menu/MenuItemFormDialog";
import { MenuItemDeleteDialog } from "@/components/admin/menu/MenuItemDeleteDialog";

const initialMenuItems: MenuItemRecord[] = [
  {
    id: "food-1",
    slug: "smoked-bacon-truffle-burger",
    name: "Smoked Bacon Truffle Burger",
    category: "burgers",
    price: 14.5,
    description:
      "Crafted with an 8oz prime black angus beef patty grilled over oak embers, topped with thick-cut smoked applewood bacon, black truffle aioli, 18-month aged sharp white cheddar, and crisp wild arugula on a toasted artisanal brioche bun.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAls_8yd9WMO6M-1b39ScZJ3_O2nl_fNajJJlFCyeHNRbU-muCFVAlmqK3486SZJ2YfsJEvjvOztm389AsKdx6NG6YNEKVNFbRcfbLVppFLxUne_bqDsRpSK3l2AMI0JQBo_C17szpKlAQjRDrm3nnTIGqP6KGSssq7YCwimEAyJLy0CFe1OAhtWRFTSOzsLM8aFGH81iIHgYrOGDJZJmekiXCquwKA7kAm9YwaaSHLWJy2kCNMaDAi",
    badge: { text: "Chef's Pick", type: "chef" },
    isAvailable: true,
    stockQuantity: 18,
    isTopSeller: true,
    totalSold: 342,
    prepTimeMinutes: 15,
    rating: 4.9,
    reviewCount: 248,
    options: [
      {
        name: "Choice of Bun",
        required: true,
        choices: [
          { label: "Artisanal Brioche Bun", priceExtra: 0 },
          { label: "Gluten-Free Seeded Bun", priceExtra: 1.5 },
          { label: "Sesame Potato Bun", priceExtra: 0 },
        ],
      },
      {
        name: "Cheese Selection",
        required: true,
        choices: [
          { label: "Aged White Cheddar (Default)", priceExtra: 0 },
          { label: "Double Melted Swiss", priceExtra: 1.0 },
          { label: "Smoked Gouda", priceExtra: 1.25 },
        ],
      },
      {
        name: "Extra Toppings",
        required: false,
        choices: [
          { label: "Caramelized Balsamic Onions", priceExtra: 1.0 },
          { label: "Fried Free-Range Egg", priceExtra: 1.5 },
          { label: "Extra Applewood Bacon", priceExtra: 2.5 },
        ],
      },
    ],
  },
  {
    id: "food-2",
    slug: "wood-fired-burrata-prosciutto-pizza",
    name: "Wood-fired Burrata Prosciutto Pizza",
    category: "pizza",
    price: 18.0,
    description:
      "Hand-stretched Neapolitan dough baked in our 900°F oak-fired stone oven. Topped with DOP San Marzano tomatoes, fresh creamy Puglia burrata, 24-month Prosciutto di Parma added post-bake, fresh organic basil, and extra virgin olive oil drizzle.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBFN2QU32fKv_PeY6OJ6-_mQhNxcdfWBPa62PtLNx6iXX7JDMAzDMZ-d0CMe0nIG8jQKnqT0u3l7VOE3p0nJFZ9h8a_Y3Tc2gdgc-a3zrvN4vV2oCSbu2WoBg7ZxZFmOGlvDbSPFm1Y42TsacD8aQ5amuGIBaPXZdI8rgBYTDf2xx4tLL8ZMEp8byjuZTOEedY7Bi1oqUZIl4RV44g-yyLr-CoRm1FAFnkdStuZbGidFWj7VOnUaidt",
    badge: { text: "Wood-fired", type: "fire" },
    isAvailable: true,
    stockQuantity: 12,
    isTopSeller: true,
    totalSold: 215,
    prepTimeMinutes: 12,
    rating: 4.8,
    reviewCount: 184,
    options: [
      {
        name: "Crust Style",
        required: true,
        choices: [
          { label: "Traditional Neapolitan", priceExtra: 0 },
          { label: "Roasted Garlic Infused Crust", priceExtra: 1.0 },
          { label: "Gluten-Friendly Crust", priceExtra: 2.5 },
        ],
      },
    ],
  },
  {
    id: "food-3",
    slug: "buttermilk-crispy-chicken-tenders",
    name: "Buttermilk Crispy Chicken Tenders",
    category: "chicken",
    price: 12.99,
    description:
      "24-hour buttermilk marinated free-range chicken tenders, double hand-dredged in artisan spiced flour and fried to golden crisp perfection. Served with signature house honey mustard, house pickles, and seasoned hearth fries.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDpHYxdathMDXR-8YTjm7xrvZUohMnaz-i6GUBxpFNy4Vhcm_HGqnI1mRA-aTkHiWeI9npx4BY9DZ3GarKa0b7xiZ2lOmCa_y_3JW8lioG4Bw-LjsM15ACl0eey0c62Tx9pkAseso-6lA6QXqPXWlqG72P2dYo2u5cHk_RD-KeICBArZQR8Z4uUqiFaYDfKVCdOa04wuoYam1PFtmYPk7W3E8IBBszsbMUKqonaUWuUhZUJwwmSEOlt",
    badge: { text: "House Dip", type: "award" },
    isAvailable: true,
    stockQuantity: 4,
    prepTimeMinutes: 10,
    rating: 4.7,
    reviewCount: 156,
    options: [
      {
        name: "Signature Dipping Sauce",
        required: true,
        choices: [
          { label: "Artisan Honey Mustard", priceExtra: 0 },
          { label: "Smoked Black Garlic Aioli", priceExtra: 0.5 },
          { label: "Firebird Spicy Habanero", priceExtra: 0.5 },
        ],
      },
    ],
  },
  {
    id: "food-4",
    slug: "craft-artisanal-mint-lemonade",
    name: "Craft Artisanal Mint Lemonade",
    category: "drinks",
    price: 4.5,
    description:
      "Cold pressed California Meyer lemons, organic raw cane sugar syrup, and muddled wild garden mint leaves served over crushed ice.",
    imageUrl:
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
    stockQuantity: 35,
    prepTimeMinutes: 5,
    rating: 4.9,
    reviewCount: 92,
    options: [
      {
        name: "Ice Level",
        required: true,
        choices: [
          { label: "Regular Ice", priceExtra: 0 },
          { label: "Less Ice", priceExtra: 0 },
          { label: "No Ice", priceExtra: 0 },
        ],
      },
    ],
  },
  {
    id: "food-5",
    slug: "warm-valrhona-chocolate-lava-cake",
    name: "Warm Valrhona Chocolate Lava Cake",
    category: "desserts",
    price: 8.5,
    description:
      "Decadent 70% Valrhona dark chocolate cake with a molten warm chocolate core, served with fresh raspberry reduction and Madagascar vanilla bean gelato.",
    imageUrl:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
    badge: { text: "Chef Special", type: "chef" },
    isAvailable: false,
    stockQuantity: 0,
    prepTimeMinutes: 8,
    rating: 4.95,
    reviewCount: 310,
  },
];

export default function MenuManagementPage() {
  const [items, setItems] = useState<MenuItemRecord[]>(initialMenuItems);

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

  const handleToggleAvailable = (itemId: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              isAvailable: !i.isAvailable,
              stockQuantity: !i.isAvailable && i.stockQuantity === 0 ? 15 : i.stockQuantity,
            }
          : i
      )
    );
  };

  const handleSaveItem = (itemData: Partial<MenuItemRecord>) => {
    if (itemData.id) {
      // Edit Existing
      setItems((prev) =>
        prev.map((i) =>
          i.id === itemData.id ? ({ ...i, ...itemData } as MenuItemRecord) : i
        )
      );
    } else {
      // Add New Item
      const newItem: MenuItemRecord = {
        id: `food-${Date.now()}`,
        name: itemData.name || "New Dish",
        slug: itemData.slug || "new-dish",
        category: itemData.category || "burgers",
        price: itemData.price || 12.0,
        description: itemData.description || "",
        imageUrl: itemData.imageUrl || "",
        badge: itemData.badge,
        options: itemData.options || [],
        isAvailable: itemData.isAvailable ?? true,
        stockQuantity: itemData.stockQuantity ?? 25,
        prepTimeMinutes: itemData.prepTimeMinutes || 15,
      };
      setItems((prev) => [...prev, newItem]);
    }
  };

  const handleConfirmDelete = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  return (
    <div className="flex flex-col w-full min-h-screen pb-space-2xl">
      {/* Menu Catalog Grid View */}
      <MenuGrid
        items={items}
        onOpenAddModal={handleOpenAddModal}
        onOpenEditModal={handleOpenEditModal}
        onOpenDeleteModal={handleOpenDeleteModal}
        onToggleAvailable={handleToggleAvailable}
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
