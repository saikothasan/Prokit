'use client';

import React, { useRef, useCallback, memo } from 'react';
import { MoveHorizontal } from 'lucide-react';

interface ImageComparisonSliderProps {
  original: string;
  optimized: string;
}

export const ImageComparisonSlider = memo(function ImageComparisonSlider({ original, optimized }: ImageComparisonSliderProps) {
  // ⚡ Bolt Optimization: Use refs for direct DOM manipulation.
  // This prevents React re-renders on every mouse move (60+ times/sec),
  // which is expensive for image-heavy components.
  const containerRef = useRef<HTMLDivElement>(null);
  const clipperRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  // Track animation frame to avoid stacking updates
  const rafRef = useRef<number | null>(null);

  const handleDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current || !clipperRef.current || !handleRef.current) return;

    // Get coordinates
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;

    // Calculate percentage and clamp between 0 and 100
    const pos = Math.min(Math.max(((clientX - rect.left) / rect.width) * 100, 0), 100);

    // Use requestAnimationFrame for smooth updates without React render cycle overhead
    if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
        if (clipperRef.current) {
            clipperRef.current.style.width = `${pos}%`;
        }
        if (handleRef.current) {
            handleRef.current.style.left = `${pos}%`;
        }
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[500px] cursor-col-resize touch-none"
      onMouseMove={handleDrag}
      onTouchMove={handleDrag}
      onClick={handleDrag}
    >
      {/* Optimized Image (Background) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={optimized}
        alt="Optimized"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
      />

      {/* Original Image (Foreground) - Clipped */}
      <div
        ref={clipperRef}
        className="absolute inset-0 overflow-hidden pointer-events-none select-none border-r-2 border-white shadow-[0_0_20px_rgba(0,0,0,0.5)]"
        style={{ width: '50%' }}
      >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={original}
            alt="Original"
            className="absolute inset-0 w-full h-full object-contain max-w-none"
            style={{ width: '100%', height: '100%' }}
          />
      </div>

      {/* Slider Handle */}
      <div
          ref={handleRef}
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center shadow-lg"
          style={{ left: '50%' }}
      >
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-xl transform -translate-x-0.5">
            <MoveHorizontal className="w-4 h-4 text-zinc-900" />
          </div>
      </div>

      <div className="absolute top-4 left-4 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-md">Original</div>
      <div className="absolute top-4 right-4 bg-green-600/80 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-md">Optimized</div>
    </div>
  );
});
