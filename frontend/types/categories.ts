export interface CategoryRecord {
  id: string;
  name: string;
  slug?: string | null;
  icon?: string; // Emoji or Lucide icon name
  image_url?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  itemCount: number;
  displayOrder: number;
  isActive: boolean;
  colorClass?: string;
  createdAt?: string;
}

