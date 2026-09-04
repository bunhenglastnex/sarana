'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, RotateCw, ExternalLink, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Single image URL or array of image URLs
   */
  images: string | string[];
  initialIndex?: number;
  title?: string;
}

export function ImageViewerModal({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  title = 'Image Preview',
}: ImageViewerModalProps) {
  const imageList = Array.isArray(images) ? images.filter(Boolean) : images ? [images] : [];
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoomLevel(1);
    setRotation(0);
  }, [initialIndex, isOpen]);

  // Handle keyboard ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoomLevel(1);
    setRotation(0);
  };

  if (!isOpen || imageList.length === 0) return null;

  const currentImg = imageList[currentIndex] || imageList[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          {/* Animated Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-5xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/95">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">{title}</h3>
                  <p className="text-xs text-muted-foreground">
                    Image {currentIndex + 1} of {imageList.length}
                  </p>
                </div>
              </div>

              {/* Toolbar Controls */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  className="p-2 rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>

                <button
                  onClick={handleReset}
                  className="px-2.5 py-1 text-xs font-mono font-semibold rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>

                <button
                  onClick={handleZoomIn}
                  title="Zoom In"
                  className="p-2 rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                <button
                  onClick={handleRotate}
                  title="Rotate 90°"
                  className="p-2 rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                {currentImg && (
                  <a
                    href={currentImg}
                    target="_blank"
                    rel="noreferrer"
                    title="Open Full Image"
                    className="p-2 rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                <div className="w-px h-6 bg-border mx-1" />

                <button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-muted hover:bg-destructive hover:text-white text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Viewport Content */}
            <div className="relative flex-1 bg-black/5 flex items-center justify-center min-h-[350px] sm:min-h-[500px] p-4 overflow-hidden">
              {imageList.length > 1 ? (
                /* Swiper Carousel for Multi-image */
                <Swiper
                  modules={[Navigation, Pagination, Keyboard]}
                  navigation
                  pagination={{ clickable: true }}
                  keyboard={{ enabled: true }}
                  initialSlide={initialIndex}
                  onSlideChange={(swiper) => {
                    setCurrentIndex(swiper.activeIndex);
                    handleReset();
                  }}
                  className="w-full h-full flex items-center justify-center text-center"
                >
                  {imageList.map((imgUrl, idx) => (
                    <SwiperSlide key={idx} className="flex items-center justify-center p-4">
                      <div className="w-full h-full flex items-center justify-center">
                        {/* Animated Zoomable Image */}
                        <motion.img
                          src={imgUrl}
                          alt={`${title} #${idx + 1}`}
                          animate={{ scale: zoomLevel, rotate: rotation }}
                          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                          className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-md cursor-grab active:cursor-grabbing select-none"
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                /* Single Animated Image Display */
                <div className="w-full h-full flex items-center justify-center">
                  <motion.img
                    key={currentImg}
                    src={currentImg}
                    alt={title}
                    animate={{ scale: zoomLevel, rotate: rotation }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className="max-h-[65vh] max-w-full object-contain rounded-lg shadow-md cursor-grab active:cursor-grabbing select-none"
                  />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ImageViewerModal;
