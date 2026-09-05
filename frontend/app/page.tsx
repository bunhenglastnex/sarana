'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerHeader } from '@/components/customer/CustomerHeader';
import { BistroInfoCard } from '@/components/customer/BistroInfoCard';
import { SearchBar } from '@/components/customer/SearchBar';
import { PromoBanner } from '@/components/customer/PromoBanner';
import { CategoryScroll } from '@/components/customer/CategoryScroll';
import { FoodCard, FoodItem } from '@/components/customer/FoodCard';
import { AddProductPopup } from '@/components/customer/AddProductPopup';
import { FloatingCartBar } from '@/components/customer/FloatingCartBar';
import { BottomNav, NavTab } from '@/components/customer/BottomNav';
import { ProfileModal } from '@/components/customer/ProfileModal';
import { LocationModal } from '@/components/customer/LocationModal';
import { Flame, ChevronRight } from 'lucide-react';


const MOCK_FOOD_ITEMS: FoodItem[] = [
  {
    id: 'food-1',
    slug: 'smoked-bacon-truffle-burger',
    name: 'Smoked Bacon Truffle Burger',
    category: 'burgers',
    price: 14.5,
    description:
      'Brioche bun, smoked bacon, black truffle aioli, aged cheddar, crisp wild arugula',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAls_8yd9WMO6M-1b39ScZJ3_O2nl_fNajJJlFCyeHNRbU-muCFVAlmqK3486SZJ2YfsJEvjvOztm389AsKdx6NG6YNEKVNFbRcfbLVppFLxUne_bqDsRpSK3l2AMI0JQBo_C17szpKlAQjRDrm3nnTIGqP6KGSssq7YCwimEAyJLy0CFe1OAhtWRFTSOzsLM8aFGH81iIHgYrOGDJZJmekiXCquwKA7kAm9YwaaSHLWJy2kCNMaDAi',
    badge: { text: "Chef's Pick", type: 'chef' },
    options: [
      {
        name: 'Choice of Bun',
        choices: [
          { label: 'Artisanal Brioche Bun', priceExtra: 0 },
          { label: 'Gluten-Free Bun', priceExtra: 1.5 },
        ],
      },
      {
        name: 'Extra Cheese',
        choices: [
          { label: 'No Extra Cheese', priceExtra: 0 },
          { label: 'Double Aged Cheddar', priceExtra: 1.0 },
          { label: 'Melted Swiss', priceExtra: 1.0 },
        ],
      },
    ],
  },
  {
    id: 'food-2',
    slug: 'wood-fired-burrata-prosciutto-pizza',
    name: 'Wood-fired Burrata Prosciutto Pizza',
    category: 'pizza',
    price: 18.0,
    description:
      'San Marzano tomatoes, fresh creamy burrata, 24-mo prosciutto di Parma, basil',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBFN2QU32fKv_PeY6OJ6-_mQhNxcdfWBPa62PtLNx6iXX7JDMAzDMZ-d0CMe0nIG8jQKnqT0u3l7VOE3p0nJFZ9h8a_Y3Tc2gdgc-a3zrvN4vV2oCSbu2WoBg7ZxZFmOGlvDbSPFm1Y42TsacD8aQ5amuGIBaPXZdI8rgBYTDf2xx4tLL8ZMEp8byjuZTOEedY7Bi1oqUZIl4RV44g-yyLr-CoRm1FAFnkdStuZbGidFWj7VOnUaidt',
    badge: { text: 'Wood-fired', type: 'fire' },
    options: [
      {
        name: 'Crust Type',
        choices: [
          { label: 'Traditional Neapolitan (Classic)', priceExtra: 0 },
          { label: 'Garlic Crust Infusion', priceExtra: 1.0 },
        ],
      },
    ],
  },
  {
    id: 'food-3',
    slug: 'buttermilk-crispy-chicken-tenders',
    name: 'Buttermilk Crispy Chicken Tenders',
    category: 'chicken',
    price: 12.99,
    description:
      'Golden spiced tenders, artisan house honey mustard dipping sauce, seasoned fries',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDpHYxdathMDXR-8YTjm7xrvZUohMnaz-i6GUBxpFNy4Vhcm_HGqnI1mRA-aTkHiWeI9npx4BY9DZ3GarKa0b7xiZ2lOmCa_y_3JW8lioG4Bw-LjsM15ACl0eey0c62Tx9pkAseso-6lA6QXqPXWlqG72P2dYo2u5cHk_RD-KeICBArZQR8Z4uUqiFaYDfKVCdOa04wuoYam1PFtmYPk7W3E8IBBszsbMUKqonaUWuUhZUJwwmSEOlt',
    badge: { text: 'House Dip', type: 'award' },
    options: [
      {
        name: 'Dipping Sauce',
        choices: [
          { label: 'Artisan Honey Mustard', priceExtra: 0 },
          { label: 'Smoked Garlic Aioli', priceExtra: 0 },
          { label: 'Spicy Firebird Sauce', priceExtra: 0.5 },
        ],
      },
    ],
  },
  {
    id: 'food-4',
    slug: 'craft-artisanal-mint-lemonade',
    name: 'Craft Artisanal Mint Lemonade',
    category: 'drinks',
    price: 4.5,
    description: 'Fresh pressed Meyer lemons, organic cane sugar, crushed wild mint leaves',
    imageUrl:
      'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    options: [
      {
        name: 'Ice Level',
        choices: [
          { label: 'Regular Ice', priceExtra: 0 },
          { label: 'Less Ice', priceExtra: 0 },
          { label: 'No Ice', priceExtra: 0 },
        ],
      },
    ],
  },
  {
    id: 'food-5',
    slug: 'warm-valrhona-chocolate-lava-cake',
    name: 'Warm Valrhona Chocolate Lava Cake',
    category: 'dessert',
    price: 8.5,
    description: 'Molten dark chocolate core, served with Madagascar vanilla bean gelato',
    imageUrl:
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
    badge: { text: 'Chef Special', type: 'chef' },
  },
];

interface CartLineItem {
  id: string;
  item: FoodItem;
  quantity: number;
  selectedOptions: Record<string, string>;
  specialInstructions: string;
  totalPrice: number;
}

export default function CustomerPageLayout() {
  const router = useRouter();
  const [currentAddress, setCurrentAddress] = useState('244 Oak Street, Apt 4B');
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modals state
  const [selectedItemForPopup, setSelectedItemForPopup] = useState<FoodItem | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  // Cart state
  const [cartItems, setCartItems] = useState<CartLineItem[]>([
    {
      id: 'initial-1',
      item: MOCK_FOOD_ITEMS[0],
      quantity: 1,
      selectedOptions: {},
      specialInstructions: '',
      totalPrice: 14.5,
    },
    {
      id: 'initial-2',
      item: MOCK_FOOD_ITEMS[1],
      quantity: 1,
      selectedOptions: {},
      specialInstructions: '',
      totalPrice: 18.0,
    },
  ]);

  // Derived cart calculations
  const totalCartCount = useMemo(
    () => cartItems.reduce((acc, curr) => acc + curr.quantity, 0),
    [cartItems]
  );

  const totalCartPrice = useMemo(
    () => cartItems.reduce((acc, curr) => acc + curr.totalPrice, 0),
    [cartItems]
  );

  // Filter food items based on search and category
  const filteredFoodItems = useMemo(() => {
    return MOCK_FOOD_ITEMS.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleAddToCart = (newItem: {
    item: FoodItem;
    quantity: number;
    selectedOptions: Record<string, string>;
    specialInstructions: string;
    totalPrice: number;
  }) => {
    const lineItem: CartLineItem = {
      id: `cart-${Date.now()}`,
      ...newItem,
    };
    setCartItems((prev) => [...prev, lineItem]);
  };

  const handleQuickAdd = (foodItem: FoodItem) => {
    const lineItem: CartLineItem = {
      id: `cart-quick-${Date.now()}`,
      item: foodItem,
      quantity: 1,
      selectedOptions: {},
      specialInstructions: '',
      totalPrice: foodItem.price,
    };
    setCartItems((prev) => [...prev, lineItem]);
  };

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    if (tab === 'profile') {
      router.push('/customer-profile');
    } else if (tab === 'cart') {
      router.push('/cart');
    } else if (tab === 'orders') {
      router.push('/orders');
    } else if (tab === 'favorites') {
      router.push('/favorites');
    }
  };

  return (
    <div className="bg-surface text-on-surface font-sans text-sm min-h-screen flex flex-col items-center selection:bg-primary/20 selection:text-primary pb-28">
      {/* Fixed Sticky Header */}
      <CustomerHeader
        currentAddress={currentAddress}
        onOpenLocation={() => setIsLocationOpen(true)}
        onOpenProfile={() => router.push('/customer-profile')}
        onOpenNotifications={() => alert('You have 2 new order status updates!')}
      />

      {/* Main Content Area Container (Centered mobile view max-w-md) */}
      <main className="flex flex-col relative w-full max-w-md px-space-lg pt-4 min-h-screen bg-surface">
        <div className="flex flex-col w-full">
          {/* Restaurant Bistro Micro-Info Card */}
          <BistroInfoCard />

          {/* Search & Quick Filter Bar */}
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onFilterClick={() =>
              alert('Filter options: Sort by Popularity, Delivery Time, Price')
            }
          />

          {/* Promotional Hero Banner */}
          <PromoBanner
            onClaim={() => alert('Coupon AMBER20 applied to your next order!')}
          />

          {/* Horizontal Scroll Categories */}
          <CategoryScroll
            activeCategoryId={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Popular Items Section Header */}
          <section className="flex items-center justify-between mb-space-sm">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-lg text-on-surface">Popular Items</h3>
              <Flame className="w-5 h-5 text-primary fill-primary/20" />
            </div>
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className="text-xs font-bold text-primary hover:text-primary-container transition-colors flex items-center gap-0.5"
            >
              <span>View all</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </section>

          {/* Food Item Cards Feed */}
          <section className="flex flex-col gap-space-md mb-space-xl">
            {filteredFoodItems.length > 0 ? (
              filteredFoodItems.map((food) => (
                <FoodCard
                  key={food.id}
                  item={food}
                  onSelect={(item) => {
                    const itemSlug = item.slug || item.id;
                    router.push(`/items-detail/${itemSlug}`);
                  }}
                  onQuickAdd={(item) => handleQuickAdd(item)}
                />
              ))
            ) : (
              <div className="text-center py-12 bg-surface-container-lowest rounded-xl p-6 border border-surface-container">
                <p className="font-bold text-on-surface text-base">No items found</p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Try adjusting your search query or category filter.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Floating Cart Preview Bar (Anchored above bottom navigation) */}
        <FloatingCartBar
          itemCount={totalCartCount}
          totalPrice={totalCartPrice}
          onViewCart={() => router.push('/cart')}
        />
      </main>

      {/* Fixed Bottom Mobile Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        cartBadgeCount={totalCartCount}
      />

      {/* Add Product Customization Popup Modal */}
      <AddProductPopup
        item={selectedItemForPopup}
        isOpen={Boolean(selectedItemForPopup)}
        onClose={() => setSelectedItemForPopup(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Delivery Location Selector Modal */}
      <LocationModal
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
        currentAddress={currentAddress}
        onSelectAddress={setCurrentAddress}
      />

      {/* User Profile Slide-over Sheet */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
}
