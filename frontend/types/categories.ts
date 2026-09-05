export interface CategoryRecord {
  id: string;
  name: string;
  icon: string; // Emoji or Lucide icon name
  itemCount: number;
  displayOrder: number;
  isActive: boolean;
  colorClass?: string;
  createdAt?: string;
}
