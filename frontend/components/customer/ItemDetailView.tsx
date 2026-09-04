'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  Clock,
  Flame,
  Award,
  Minus,
  Plus,
  ShoppingBag,
  Check,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { FoodItem } from './FoodCard';
import { BottomNav } from './BottomNav';

const MOCK_ITEMS_MAP: Record<string, FoodItem> = {
  'smoked-bacon-truffle-burger': {
    id: 'food-1',
    name: 'Smoked Bacon Truffle Burger',
    category: 'burgers',
    price: 14.5,
    description:
      'Crafted with an 8oz prime black angus beef patty grilled over oak embers, topped with thick-cut smoked applewood bacon, black truffle aioli, 18-month aged sharp white cheddar, and crisp wild arugula on a toasted artisanal brioche bun.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAls_8yd9WMO6M-1b39ScZJ3_O2nl_fNajJJlFCyeHNRbU-muCFVAlmqK3486SZJ2YfsJEvjvOztm389AsKdx6NG6YNEKVNFbRcfbLVppFLxUne_bqDsRpSK3l2AMI0JQBo_C17szpKlAQjRDrm3nnTIGqP6KGSssq7YCwimEAyJLy0CFe1OAhtWRFTSOzsLM8aFGH81iIHgYrOGDJZJmekiXCquwKA7kAm9YwaaSHLWJy2kCNMaDAi',
    badge: { text: "Chef's Pick", type: 'chef' },
    options: [
      {
        name: 'Choice of Bun',
        choices: [
          { label: 'Artisanal Brioche Bun', priceExtra: 0 },
          { label: 'Gluten-Free Seeded Bun', priceExtra: 1.5 },
          { label: 'Sesame Potato Bun', priceExtra: 0 },
        ],
      },
      {
        name: 'Cheese Selection',
        choices: [
          { label: 'Aged White Cheddar (Default)', priceExtra: 0 },
          { label: 'Double Melted Swiss', priceExtra: 1.0 },
          { label: 'Smoked Gouda', priceExtra: 1.25 },
        ],
      },
      {
        name: 'Extra Toppings',
        choices: [
          { label: 'Caramelized Balsamic Onions', priceExtra: 1.0 },
          { label: 'Fried Free-Range Egg', priceExtra: 1.5 },
          { label: 'Extra Applewood Bacon', priceExtra: 2.5 },
        ],
      },
    ],
  },
  'wood-fired-burrata-prosciutto-pizza': {
    id: 'food-2',
    name: 'Wood-fired Burrata Prosciutto Pizza',
    category: 'pizza',
    price: 18.0,
    description:
      'Hand-stretched Neapolitan dough baked in our 900°F oak-fired stone oven. Topped with DOP San Marzano tomatoes, fresh creamy Puglia burrata, 24-month Prosciutto di Parma added post-bake, fresh organic basil, and extra virgin olive oil drizzle.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBFN2QU32fKv_PeY6OJ6-_mQhNxcdfWBPa62PtLNx6iXX7JDMAzDMZ-d0CMe0nIG8jQKnqT0u3l7VOE3p0nJFZ9h8a_Y3Tc2gdgc-a3zrvN4vV2oCSbu2WoBg7ZxZFmOGlvDbSPFm1Y42TsacD8aQ5amuGIBaPXZdI8rgBYTDf2xx4tLL8ZMEp8byjuZTOEedY7Bi1oqUZIl4RV44g-yyLr-CoRm1FAFnkdStuZbGidFWj7VOnUaidt',
    badge: { text: 'Wood-fired', type: 'fire' },
    options: [
      {
        name: 'Crust Style',
        choices: [
          { label: 'Traditional Neapolitan', priceExtra: 0 },
          { label: 'Roasted Garlic Infused Crust', priceExtra: 1.0 },
          { label: 'Gluten-Friendly Crust', priceExtra: 2.5 },
        ],
      },
    ],
  },
  'buttermilk-crispy-chicken-tenders': {
    id: 'food-3',
    name: 'Buttermilk Crispy Chicken Tenders',
    category: 'chicken',
    price: 12.99,
    description:
      '24-hour buttermilk marinated free-range chicken tenders, double hand-dredged in artisan spiced flour and fried to golden crisp perfection. Served with signature house honey mustard, house pickles, and seasoned hearth fries.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDpHYxdathMDXR-8YTjm7xrvZUohMnaz-i6GUBxpFNy4Vhcm_HGqnI1mRA-aTkHiWeI9npx4BY9DZ3GarKa0b7xiZ2lOmCa_y_3JW8lioG4Bw-LjsM15ACl0eey0c62Tx9pkAseso-6lA6QXqPXWlqG72P2dYo2u5cHk_RD-KeICBArZQR8Z4uUqiFaYDfKVCdOa04wuoYam1PFtmYPk7W3E8IBBszsbMUKqonaUWuUhZUJwwmSEOlt',
    badge: { text: 'House Dip', type: 'award' },
    options: [
      {
        name: 'Signature Dipping Sauce',
        choices: [
          { label: 'Artisan Honey Mustard', priceExtra: 0 },
          { label: 'Smoked Black Garlic Aioli', priceExtra: 0.5 },
          { label: 'Firebird Spicy Habanero', priceExtra: 0.5 },
        ],
      },
    ],
  },
  'craft-artisanal-mint-lemonade': {
    id: 'food-4',
    name: 'Craft Artisanal Mint Lemonade',
    category: 'drinks',
    price: 4.5,
    description:
      'Cold pressed California Meyer lemons, organic raw cane sugar syrup, and muddled wild garden mint leaves served over crushed ice.',
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
  'warm-valrhona-chocolate-lava-cake': {
    id: 'food-5',
    name: 'Warm Valrhona Chocolate Lava Cake',
    category: 'dessert',
    price: 8.5,
    description: 'Decadent 70% Valrhona dark chocolate cake with a molten warm chocolate core, served with fresh raspberry reduction and Madagascar vanilla bean gelato.',
    imageUrl:
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
    badge: { text: 'Chef Special', type: 'chef' },
  },
};

interface ItemDetailViewProps {
  slug: string;
}

export const ItemDetailView: React.FC<ItemDetailViewProps> = ({ slug }) => {
  const router = useRouter();

  // Retrieve item by slug or fallback to default burger item
  const itemKey = slug.toLowerCase();
  const item: FoodItem =
    MOCK_ITEMS_MAP[itemKey] ||
    MOCK_ITEMS_MAP['smoked-bacon-truffle-burger'];

  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [added, setAdded] = useState(false);

  const calculateTotal = () => {
    let extra = 0;
    if (item.options) {
      item.options.forEach((group) => {
        const chosen = selectedOptions[group.name];
        if (chosen) {
          const match = group.choices.find((c) => c.label === chosen);
          if (match) extra += match.priceExtra;
        }
      });
    }
    return (item.price + extra) * quantity;
  };

  const handleOptionSelect = (groupName: string, choiceLabel: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupName]: choiceLabel,
    }));
  };

  const handleAddToCart = () => {
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      router.push('/');
    }, 1200);
  };

  const totalPrice = calculateTotal();

  return (
    <div className="bg-surface text-on-surface font-sans text-sm min-h-screen flex flex-col items-center selection:bg-primary/20 selection:text-primary pb-32">
      {/* Top Floating Back & Action Bar */}
      <div className="fixed top-0 w-full max-w-md mx-auto z-40 pt-safe px-space-lg h-16 flex items-center justify-between pointer-events-none">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back to home"
          className="w-10 h-10 rounded-full bg-surface-bright/80 backdrop-blur-md text-on-surface flex items-center justify-center shadow-md hover:bg-white active:scale-90 transition-all pointer-events-auto border border-surface-container"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={() => alert('Item link copied!')}
            aria-label="Share item"
            className="w-10 h-10 rounded-full bg-surface-bright/80 backdrop-blur-md text-on-surface flex items-center justify-center shadow-md hover:bg-white active:scale-90 transition-all border border-surface-container"
          >
            <Share2 className="w-5 h-5 text-on-surface-variant" />
          </button>

          <button
            type="button"
            onClick={() => setIsFavorite(!isFavorite)}
            aria-label="Toggle favorite"
            className={`w-10 h-10 rounded-full bg-surface-bright/80 backdrop-blur-md flex items-center justify-center shadow-md active:scale-90 transition-all border border-surface-container ${
              isFavorite ? 'text-red-500 fill-red-500' : 'text-on-surface-variant'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Container Frame */}
      <main className="flex flex-col relative w-full max-w-md min-h-screen bg-surface">
        {/* Full Width Hero Image */}
        <div className="relative w-full h-72 bg-surface-container overflow-hidden">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-black/30 pointer-events-none" />

          {/* Badge Overlay */}
          {item.badge && (
            <div className="absolute bottom-4 left-space-lg bg-surface-bright/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
              {item.badge.type === 'fire' ? (
                <Flame className="w-4 h-4 text-primary" />
              ) : item.badge.type === 'award' ? (
                <Award className="w-4 h-4 text-secondary" />
              ) : (
                <Star className="w-4 h-4 text-secondary fill-secondary" />
              )}
              <span className="font-bold text-xs text-on-surface">
                {item.badge.text}
              </span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="px-space-lg pt-2 pb-6 flex flex-col gap-5 -mt-4 relative z-10">
          {/* Header Identity Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container/60">
            <div className="flex items-start justify-between gap-3">
              <h1 className="font-extrabold text-xl text-on-surface leading-tight">
                {item.name}
              </h1>
              <span className="font-extrabold text-xl text-primary flex-shrink-0">
                ${item.price.toFixed(2)}
              </span>
            </div>

            {/* Metrics pills */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-surface-container text-xs text-on-surface-variant">
              <div className="flex items-center gap-1 font-semibold text-on-surface">
                <Star className="w-4 h-4 fill-secondary text-secondary" />
                <span>4.9</span>
                <span className="text-on-surface-variant font-normal">(248)</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-outline-variant" />
              <div className="flex items-center gap-1 font-semibold">
                <Clock className="w-4 h-4 text-primary" />
                <span>15-20 mins</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-outline-variant" />
              <div className="flex items-center gap-1 font-semibold text-secondary">
                <ShieldCheck className="w-4 h-4" />
                <span>Artisanal</span>
              </div>
            </div>

            {/* Detailed Culinary Description */}
            <p className="text-xs text-on-surface-variant mt-3 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Customization Options */}
          {item.options && item.options.length > 0 && (
            <div className="space-y-4">
              {item.options.map((optGroup) => (
                <div
                  key={optGroup.name}
                  className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container/60 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-on-surface">
                      {optGroup.name}
                    </span>
                    <span className="text-[11px] font-semibold text-primary">Required</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {optGroup.choices.map((choice) => {
                      const isSelected = selectedOptions[optGroup.name] === choice.label;
                      return (
                        <button
                          key={choice.label}
                          type="button"
                          onClick={() => handleOptionSelect(optGroup.name, choice.label)}
                          className={`flex items-center justify-between p-3.5 rounded-xl border text-xs font-semibold transition-all active:scale-[0.99] ${
                            isSelected
                              ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                              : 'border-surface-container-high bg-surface-container-lowest text-on-surface hover:border-outline'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected ? 'border-primary bg-primary text-white' : 'border-outline'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span>{choice.label}</span>
                          </div>
                          {choice.priceExtra > 0 && (
                            <span className="text-on-surface-variant font-medium">
                              +${choice.priceExtra.toFixed(2)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Special Instructions Note */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container/60 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface">
              Special Kitchen Note
            </label>
            <textarea
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Extra truffle aioli on side, light salt..."
              className="w-full p-3 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>
      </main>

      {/* Floating Bottom Add-To-Cart Action Dock */}
      <aside className="fixed bottom-16 z-40 w-full max-w-md mx-auto px-space-lg pointer-events-auto">
        <div className="bg-surface-container-lowest border border-surface-container/80 p-3 rounded-2xl shadow-xl flex items-center gap-3 backdrop-blur-md">
          {/* Quantity Stepper */}
          <div className="flex items-center bg-surface-container-high rounded-full p-1 border border-surface-container-highest flex-shrink-0">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              aria-label="Decrease quantity"
              className="w-9 h-9 rounded-full bg-surface-bright flex items-center justify-center text-on-surface hover:bg-surface-container active:scale-90 transition-all"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-bold text-sm text-on-surface">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              aria-label="Increase quantity"
              className="w-9 h-9 rounded-full bg-surface-bright flex items-center justify-center text-on-surface hover:bg-surface-container active:scale-90 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            className={`flex-1 py-3 px-4 rounded-full font-extrabold text-sm flex items-center justify-between shadow-md active:scale-95 transition-all ${
              added
                ? 'bg-secondary text-on-secondary'
                : 'bg-primary text-on-primary hover:bg-primary-container'
            }`}
          >
            <div className="flex items-center gap-2">
              {added ? <Check className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
              <span>{added ? 'Added to Order!' : 'Add to Order'}</span>
            </div>
            <span>${totalPrice.toFixed(2)}</span>
          </button>
        </div>
      </aside>

      {/* Bottom Nav Navigation Bar */}
      <BottomNav
        activeTab="home"
        onTabChange={(tab) => {
          if (tab === 'home') router.push('/');
          else if (tab === 'profile') router.push('/customer-profile');
        }}
        cartBadgeCount={2}
      />
    </div>
  );
};
