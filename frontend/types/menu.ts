export interface CustomizationOptionChoice {
  label: string;
  priceExtra: number;
}

export interface CustomizationOptionGroup {
  name: string;
  required?: boolean;
  choices: CustomizationOptionChoice[];
}

export interface MenuItemRecord {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  description: string;
  imageUrl: string;
  badge?: {
    text: string;
    type?: "chef" | "fire" | "award";
  };
  options?: CustomizationOptionGroup[];
  isAvailable: boolean;
  stockQuantity: number; // Current inventory quantity count
  isTopSeller?: boolean; // Flag for top seller / bestseller dish
  totalSold?: number; // Total units sold count
  prepTimeMinutes?: number;
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
}

export const CATEGORY_OPTIONS = [
  { value: "burgers", label: "Smoked Burgers", icon: "🍔" },
  { value: "pizza", label: "Woodfired Pizza", icon: "🍕" },
  { value: "chicken", label: "Crispy Chicken", icon: "🍗" },
  { value: "salads", label: "Cold Larder & Salads", icon: "🥗" },
  { value: "desserts", label: "Craft Desserts", icon: "🍨" },
  { value: "drinks", label: "Beverages & Cellar", icon: "🍹" },
  { value: "starters", label: "Starters & Appetizers", icon: "🍟" },
];
