'use client';

import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Send,
  Share2,
  ExternalLink,
  QrCode,
  Sparkles,
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  url?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  imageUrl,
  price,
  url,
}) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== 'undefined' ? (url || window.location.href) : '';
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(`Check out ${title} on Amber Bistro! 🍽️✨`);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Failed to copy link:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Check out ${title} on Amber Bistro!`,
          url: shareUrl,
        });
      } catch {
        // User cancelled share
      }
    }
  };

  const socialPlatforms = [
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-[#24A1DE] hover:bg-[#1f8ec4] text-white shadow-sky-500/20',
      shareUrl: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    },
    {
      name: 'WhatsApp',
      icon: Send,
      color: 'bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-emerald-500/20',
      shareUrl: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
    },
    {
      name: 'Facebook',
      icon: ExternalLink,
      color: 'bg-[#1877F2] hover:bg-[#1466d4] text-white shadow-blue-500/20',
      shareUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-surface rounded-t-3xl sm:rounded-3xl p-6 flex flex-col gap-5 shadow-2xl animate-in slide-in-from-bottom duration-300 border border-surface-container relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Header Accent */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">
                SHARE ITEM
              </span>
              <h3 className="font-extrabold text-base text-on-surface leading-tight">
                Share with Friends &amp; Family
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close share modal"
            className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface hover:bg-surface-container transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Item Preview Card */}
        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs z-10">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-16 h-16 rounded-xl object-cover border border-surface-container flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl flex-shrink-0">
              🍽️
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-sm text-on-surface truncate">{title}</h4>
            {description && (
              <p className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">
                {description}
              </p>
            )}
            {price !== undefined && (
              <span className="inline-block mt-1 font-extrabold text-xs text-primary">
                ${price.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Quick Social Share Buttons */}
        <div className="space-y-2 z-10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block">
            Direct Share via
          </span>
          <div className="grid grid-cols-3 gap-2.5">
            {socialPlatforms.map((platform) => (
              <a
                key={platform.name}
                href={platform.shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl font-bold text-xs shadow-md transition-all active:scale-95 ${platform.color}`}
              >
                <platform.icon className="w-4 h-4" />
                <span>{platform.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Copy Link Input Field */}
        <div className="space-y-2 z-10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block">
            Copy Page Link
          </span>
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-surface-container-lowest border border-surface-container">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent px-3 py-1.5 text-xs text-on-surface focus:outline-none truncate font-mono select-all"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 flex-shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-primary text-on-primary hover:bg-primary/90'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Web Native Share Mobile Fallback */}
        {typeof window !== 'undefined' && 'share' in navigator && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="w-full py-2.5 px-4 rounded-full border border-dashed border-outline hover:border-primary text-on-surface-variant hover:text-primary font-bold text-xs flex items-center justify-center gap-2 transition-all z-10"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span>More Sharing Options (System Menu)</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ShareModal;
