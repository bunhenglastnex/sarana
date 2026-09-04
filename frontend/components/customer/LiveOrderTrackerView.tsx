'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Navigation,
  Bike,
  CheckCircle2,
  Phone,
  MessageSquare,
  MapPin,
  DoorOpen,
  ChevronDown,
  ChevronUp,
  Headphones,
  Flame,
  Star,
  Receipt,
  Sparkles,
} from 'lucide-react';

interface LiveOrderTrackerViewProps {
  orderRef?: string;
}

export const LiveOrderTrackerView: React.FC<LiveOrderTrackerViewProps> = ({
  orderRef = '#AE-89422',
}) => {
  const router = useRouter();
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const triggerNotice = (msg: string) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 3000);
  };

  return (
    <div className="bg-surface text-on-surface font-sans text-sm min-h-screen flex flex-col items-center selection:bg-primary/20 selection:text-primary pb-20">
      {/* Sticky Top Header */}
      <header className="sticky top-0 w-full max-w-md mx-auto z-40 pt-safe bg-surface/90 backdrop-blur-xl border-b border-surface-container/40 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-space-lg flex items-center justify-between gap-space-xs">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => router.push('/')}
              aria-label="Go back"
              className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <img
              src="/logo.jpg"
              alt="Amber & Ember Bistro Logo"
              className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-primary/20"
            />
            <h1 className="font-bold text-base text-on-surface truncate">
              Live Order Tracker
            </h1>
          </div>

          <button
            type="button"
            onClick={() => router.push('/customer-profile')}
            aria-label="User Profile"
            className="w-10 h-10 flex items-center justify-center rounded-full p-0.5 hover:ring-2 hover:ring-primary/40 transition-all flex-shrink-0 overflow-hidden border border-outline-variant/50"
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAiE9xKCdnv_bglgxg_2LERQbUBlAt1FErmCjJlM_VLK5dW_V-8xiETqMbrDniEM2ZCbQDo_2QKUNG1OinMh1B4XXpwt9n7cccMS_56WCxtMvDwQxsI8pYloDdLducI9tPkTmY9k1J9DgWvY0tNX2DVDPQwP05xPeK0_ZTRvRRrm17jeMPPglgidJwtV3vvobKKha1REpz9pb_kGucgUkNYqPL8qWHCW-ebONnap7f-tdnyxqvtE7Q9"
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex flex-col relative w-full max-w-md px-space-lg pt-4 min-h-screen bg-surface">
        <div className="flex flex-col w-full pb-8 gap-4">
          {/* Live Map Card Container with Floating Courier Badge */}
          <div className="relative w-full rounded-2xl overflow-hidden shadow-md bg-surface-container-high h-64 border border-surface-container-high">
            {/* SVG Map Canvas Graphic */}
            <svg
              aria-label="Interactive delivery tracking map"
              className="w-full h-full object-cover"
              viewBox="0 0 400 280"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="mapBg" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#f5f2eb" />
                  <stop offset="100%" stopColor="#ebe6dc" />
                </linearGradient>
                <linearGradient id="routeGradient" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#a43700" />
                  <stop offset="60%" stopColor="#fea047" />
                  <stop offset="100%" stopColor="#c64e1b" />
                </linearGradient>
                <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fea047" stopOpacity="0.6" />
                  <stop offset="60%" stopColor="#a43700" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#a43700" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Map Blocks / Street Canvas */}
              <rect fill="url(#mapBg)" height="280" width="400" />
              <rect fill="#e2ded5" height="60" opacity="0.8" rx="8" width="80" x="20" y="25" />
              <rect fill="#dfdad0" height="50" opacity="0.7" rx="8" width="130" x="120" y="20" />
              <rect fill="#e4dfd6" height="75" opacity="0.8" rx="8" width="110" x="270" y="30" />
              <rect fill="#ded9cf" height="110" opacity="0.65" rx="8" width="75" x="25" y="115" />
              <rect fill="#e0dad0" height="65" opacity="0.8" rx="8" width="115" x="130" y="195" />
              <rect fill="#ded8ce" height="115" opacity="0.75" rx="8" width="115" x="265" y="145" />

              {/* Secondary Roads */}
              <path d="M 0,85 L 400,85" stroke="#ffffff" strokeLinecap="round" strokeWidth="9" />
              <path d="M 115,0 L 115,280" stroke="#ffffff" strokeLinecap="round" strokeWidth="11" />
              <path d="M 255,0 L 255,280" stroke="#ffffff" strokeLinecap="round" strokeWidth="10" />
              <path d="M 0,185 L 400,185" stroke="#ffffff" strokeLinecap="round" strokeWidth="12" />

              {/* Delivery Route Path */}
              <path
                d="M 55,85 L 115,85 L 115,185 L 315,185"
                fill="none"
                stroke="#fed8bf"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="6"
              />
              {/* Traveled Path Section */}
              <path
                d="M 55,85 L 115,85 L 115,185 L 210,185"
                fill="none"
                stroke="url(#routeGradient)"
                strokeDasharray="4 3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="5"
              />

              {/* Restaurant Pin (Origin) */}
              <circle cx="55" cy="85" fill="#31312d" r="14" />
              <circle cx="55" cy="85" fill="#fcf9f3" r="5" />
              <g transform="translate(25, 48)">
                <rect fill="#31312d" height="20" rx="10" width="66" />
                <text
                  fill="#ffffff"
                  fontFamily="Plus Jakarta Sans, sans-serif"
                  fontSize="9"
                  fontWeight="700"
                  textAnchor="middle"
                  x="33"
                  y="14"
                >
                  BISTRO
                </text>
              </g>

              {/* Destination Pin (Oak St) */}
              <circle cx="315" cy="185" fill="#a43700" fillOpacity="0.2" r="16" />
              <circle cx="315" cy="185" fill="#a43700" r="10" />
              <circle cx="315" cy="185" fill="#ffffff" r="4" />
              <g transform="translate(275, 208)">
                <rect
                  fill="#ffffff"
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                  height="22"
                  rx="6"
                  width="80"
                />
                <text
                  fill="#1c1c18"
                  fontFamily="Plus Jakarta Sans, sans-serif"
                  fontSize="10"
                  fontWeight="700"
                  textAnchor="middle"
                  x="40"
                  y="15"
                >
                  244 Oak St
                </text>
              </g>

              {/* Pulsing Radar Around Rider */}
              <circle cx="210" cy="185" fill="url(#radarGlow)" r="28">
                <animate attributeName="r" dur="2.2s" repeatCount="indefinite" values="18;36;18" />
                <animate attributeName="opacity" dur="2.2s" repeatCount="indefinite" values="0.8;0.1;0.8" />
              </circle>

              {/* Live Courier Vehicle Pin */}
              <g transform="translate(195, 170)">
                <circle cx="15" cy="15" fill="#ffffff" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.18))" r="15" />
                <circle cx="15" cy="15" fill="#c64e1b" r="12" />
                <path
                  d="M10 17 A2 2 0 0 1 12 19 A2 2 0 0 1 10 21 A2 2 0 0 1 8 19 A2 2 0 0 1 10 17 M19 17 A2 2 0 0 1 21 19 A2 2 0 0 1 19 21 A2 2 0 0 1 17 19 A2 2 0 0 1 19 17 M10 18 L13 18 L16 14 L18 14 M14 13 L12 11"
                  fill="none"
                  stroke="#ffffff"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.6"
                />
              </g>
            </svg>

            {/* Top Floating Status Pill overlay */}
            <div className="absolute top-3 left-3 bg-surface/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-surface-container/60">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
              </span>
              <span className="text-xs font-semibold text-on-surface tracking-tight">
                GPS Signal Active
              </span>
            </div>

            {/* Recenter Map Control */}
            <button
              type="button"
              aria-label="Recenter Map"
              onClick={() => triggerNotice('Map recentered to live courier position')}
              className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-surface-container-lowest shadow-md flex items-center justify-center text-on-surface active:scale-95 transition-all hover:bg-surface-container"
            >
              <Navigation className="w-5 h-5 text-primary" />
            </button>
          </div>

          {/* Status & Timing Highlight Card */}
          <div className="w-full bg-surface-container-lowest rounded-2xl p-4 shadow-sm flex flex-col gap-3 border border-surface-container/80">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-primary font-bold">
                  Estimated Arrival
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-extrabold text-2xl text-on-surface">7:42 PM</span>
                  <span className="text-xs text-on-surface-variant font-semibold">
                    (in 18 mins)
                  </span>
                </div>
              </div>
              <div className="bg-primary-fixed text-on-primary-fixed-variant px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm font-bold text-xs">
                <Bike className="w-4 h-4" />
                <span>On the Way</span>
              </div>
            </div>

            {/* Animated Smooth Linear Progress Gauge */}
            <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden mt-1">
              <div className="bg-primary h-full rounded-full transition-all duration-700 ease-out w-[78%]" />
            </div>

            <div className="flex items-center gap-2 text-on-surface-variant pt-0.5">
              <Flame className="w-4 h-4 text-primary flex-shrink-0 fill-primary/20" />
              <p className="text-xs leading-tight">
                <strong className="text-on-surface font-semibold">David Chen</strong> has
                picked up your hearth-baked meal and is cruising along Oak Street.
              </p>
            </div>
          </div>

          {/* Status Badges Bar */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <div className="bg-surface-container-lowest rounded-xl p-3 shadow-sm flex items-center gap-2.5 border border-surface-container/80">
              <div className="w-8 h-8 rounded-full bg-secondary-container/30 flex items-center justify-center text-primary flex-shrink-0">
                <Bike className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-on-surface-variant uppercase font-medium">
                  Order Status
                </span>
                <span className="text-xs text-on-surface truncate font-semibold">
                  Out for Delivery
                </span>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-3 shadow-sm flex items-center gap-2.5 border border-surface-container/80">
              <div className="w-8 h-8 rounded-full bg-primary-fixed/40 flex items-center justify-center text-primary flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-[#2E6F40]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-on-surface-variant uppercase font-medium">
                  Payment
                </span>
                <span className="text-xs text-on-surface truncate font-semibold">
                  Paid (KHQR)
                </span>
              </div>
            </div>
          </div>

          {/* Courier Profile Action Card */}
          <div className="w-full bg-surface-container-lowest rounded-2xl p-3.5 shadow-sm flex flex-col gap-3 border border-surface-container/80">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative flex-shrink-0">
                  <img
                    className="w-12 h-12 rounded-full object-cover border border-primary/20"
                    alt="Courier David Chen"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRxKzFWwFQQo_jWeyWj13xphbwH_fWOtbqKszr8o64cljdXy3mEqabIuPAh7ThLQweqhgklcszES4QO3VGBrNiz38T4tHlFg8LSNYPdKdHbOemakG9-Lq6kYF4F151KdPc4l2yC3vkvnhOANGgIKxuHe3mkVNBXvMcz9m9YQten55-NDD2n7YfylgXaEx8z0U68SPWK_WwhaN6Q0iVYz64pLsxoAbN7gYVfVAS02NcglA_dJJYyL7k"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-surface-container-lowest rounded-full p-0.5 shadow-sm border border-surface-container">
                    <Bike className="w-3.5 h-3.5 text-primary" />
                  </div>
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-bold text-sm text-on-surface truncate">
                      David Chen
                    </h2>
                    <div className="flex items-center text-secondary font-bold text-[11px] bg-secondary-fixed/50 px-1.5 py-0.2 rounded-full">
                      <Star className="w-3 h-3 text-secondary fill-secondary mr-0.5" />
                      4.9
                    </div>
                  </div>
                  <span className="text-xs text-on-surface-variant truncate">
                    Honda PCX • Plate 2B-8910
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  aria-label="Chat with courier"
                  onClick={() => triggerNotice('Connecting live chat with David...')}
                  className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-variant active:scale-95 transition-all shadow-sm"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  aria-label="Call courier"
                  onClick={() => triggerNotice('Routing masked call to (855) 012-981...')}
                  className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container active:scale-95 transition-all shadow-sm"
                >
                  <Phone className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Delivery Address Card */}
          <div className="w-full bg-surface-container-lowest rounded-2xl p-3.5 shadow-sm flex items-start gap-3 border border-surface-container/80">
            <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
              <MapPin className="w-5 h-5 fill-primary text-primary" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
                Delivery Destination
              </span>
              <p className="font-bold text-xs text-on-surface">
                244 Oak Street, Apt 4B
              </p>
              <div className="inline-flex items-center gap-1 mt-1 text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-md text-[11px]">
                <DoorOpen className="w-3.5 h-3.5" />
                <span className="italic">Note: Leave at front door</span>
              </div>
            </div>
          </div>

          {/* Vertical Progress Stepper */}
          <div className="w-full bg-surface-container-lowest rounded-2xl p-4 shadow-sm flex flex-col gap-3 border border-surface-container/80">
            <h3 className="font-bold text-sm text-on-surface">Timeline</h3>
            <div className="relative flex flex-col gap-4 ml-1">
              {/* Line */}
              <div className="absolute top-3 bottom-4 left-3 w-0.5 bg-surface-variant -translate-x-1/2" />
              <div
                className="absolute top-3 left-3 w-0.5 bg-primary -translate-x-1/2"
                style={{ height: '72%' }}
              />

              {/* Step 1 */}
              <div className="relative flex items-start gap-3">
                <div className="relative z-10 w-6 h-6 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 flex justify-between items-baseline min-w-0 pt-0.5">
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-xs text-on-surface">
                      Order Confirmed
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      Bistro received ticket
                    </span>
                  </div>
                  <span className="text-[10px] text-on-surface-variant">19:15</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex items-start gap-3">
                <div className="relative z-10 w-6 h-6 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 flex justify-between items-baseline min-w-0 pt-0.5">
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-xs text-on-surface">
                      Preparing Food in Kitchen
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      In wood-fire hearth
                    </span>
                  </div>
                  <span className="text-[10px] text-on-surface-variant">19:20</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex items-start gap-3">
                <div className="relative z-10 w-6 h-6 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 flex justify-between items-baseline min-w-0 pt-0.5">
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-xs text-on-surface">
                      Ready for Delivery
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      Packed in thermal pouch
                    </span>
                  </div>
                  <span className="text-[10px] text-on-surface-variant">19:32</span>
                </div>
              </div>

              {/* Step 4: Active */}
              <div className="relative flex items-start gap-3">
                <div className="relative z-10 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-md">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                  <Bike className="w-3.5 h-3.5 text-on-primary" />
                </div>
                <div className="flex-1 flex flex-col min-w-0 pt-0.5 bg-surface-container-low p-2.5 rounded-xl border border-primary/20">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-xs text-primary">
                      Out for Delivery
                    </span>
                    <span className="text-[10px] text-primary font-bold">19:35</span>
                  </div>
                  <p className="text-[11px] text-on-surface mt-0.5">
                    Courier is on the way to your door!
                  </p>
                </div>
              </div>

              {/* Step 5: Delivered */}
              <div className="relative flex items-start gap-3 opacity-60">
                <div className="relative z-10 w-6 h-6 rounded-full bg-surface-variant flex items-center justify-center text-tertiary shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-tertiary" />
                </div>
                <div className="flex-1 flex justify-between items-baseline min-w-0 pt-0.5">
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-xs text-on-surface">
                      Delivered
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      Estimated arrival 7:42 PM
                    </span>
                  </div>
                  <span className="text-[10px] text-on-surface-variant">--:--</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ordered Items Collapsible Accordion */}
          <div className="w-full bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden border border-surface-container/80">
            <button
              type="button"
              onClick={() => setIsAccordionOpen((prev) => !prev)}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-surface-container-low transition-colors"
            >
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary" />
                <span className="font-bold text-xs text-on-surface">
                  Order Summary (2 items)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-primary">$37.70</span>
                {isAccordionOpen ? (
                  <ChevronUp className="w-4 h-4 text-on-surface-variant" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-on-surface-variant" />
                )}
              </div>
            </button>

            {isAccordionOpen && (
              <div className="px-3.5 pb-3.5 flex flex-col gap-2 border-t border-surface-container pt-2 text-xs">
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded bg-surface-container flex items-center justify-center font-bold text-[11px] text-on-surface">
                      1×
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-on-surface truncate">
                        Smoked Bacon Truffle Burger
                      </span>
                      <span className="text-[10px] text-on-surface-variant">
                        Brioche, Emmental, Medium Rare
                      </span>
                    </div>
                  </div>
                  <span className="font-semibold text-on-surface">$18.50</span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded bg-surface-container flex items-center justify-center font-bold text-[11px] text-on-surface">
                      1×
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-on-surface truncate">
                        Wood-fired Burrata Prosciutto Pizza
                      </span>
                      <span className="text-[10px] text-on-surface-variant">
                        San Marzano, Hot Honey drizzle
                      </span>
                    </div>
                  </div>
                  <span className="font-semibold text-on-surface">$16.00</span>
                </div>

                <div className="flex items-center justify-between pt-1 text-on-surface-variant text-[11px]">
                  <span>Delivery Fee & Packaging</span>
                  <span>$3.20</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-surface-container font-bold text-on-surface">
                  <span>Total Amount Paid</span>
                  <span className="text-primary text-sm font-extrabold">$37.70</span>
                </div>
              </div>
            )}
          </div>

          {/* Support Link */}
          <div className="w-full flex flex-col items-center justify-center py-2 gap-1 text-center">
            <button
              type="button"
              onClick={() => triggerNotice('Calling Amber & Ember Bistro Front Desk...')}
              className="flex items-center gap-1.5 text-primary hover:text-primary-container active:scale-98 transition-all px-4 py-2 rounded-full bg-surface-container-low hover:bg-surface-container text-xs font-semibold"
            >
              <Headphones className="w-4 h-4" />
              <span>Need help with this order? Contact Bistro Counter</span>
            </button>
            <span className="text-[10px] text-on-surface-variant">
              Order {orderRef} • Amber & Ember Woodfire Bistro
            </span>
          </div>
        </div>
      </main>

      {/* Floating Notice Toast */}
      {noticeMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 max-w-xs w-full px-4 py-2.5 bg-inverse-surface text-inverse-on-surface rounded-full shadow-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all z-50 animate-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-4 h-4 text-secondary-fixed" />
          <span>{noticeMessage}</span>
        </div>
      )}
    </div>
  );
};
