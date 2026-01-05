'use client';

import React, { useState, useRef } from 'react';
import { MoveHorizontal } from 'lucide-react';

interface ImageComparisonSliderProps {
  original: string;
  optimized: string;
}

export function ImageComparisonSlider({ original, optimized }: ImageComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const pos = ((x - rect.left) / rect.width) * 100;
      setSliderPosition(Math.min(Math.max(pos, 0), 100));
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[500px] cursor-col-resize"
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
        className="absolute inset-0 overflow-hidden pointer-events-none select-none border-r-2 border-white shadow-[0_0_20px_rgba(0,0,0,0.5)]"
        style={{ width: `${sliderPosition}%` }}
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
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center shadow-lg"
          style={{ left: `${sliderPosition}%` }}
      >
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-xl transform -translate-x-0.5">
            <MoveHorizontal className="w-4 h-4 text-zinc-900" />
          </div>
      </div>

      <div className="absolute top-4 left-4 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-md">Original</div>
      <div className="absolute top-4 right-4 bg-green-600/80 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-md">Optimized</div>
    </div>
  );
}
