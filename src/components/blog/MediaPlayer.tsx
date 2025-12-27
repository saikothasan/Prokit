'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming you have a utils file, otherwise usage is inline

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

interface MediaPlayerProps {
  src: string;
  type: 'audio' | 'video';
  poster?: string; // For video
}

export function MediaPlayer({ src, type, poster }: MediaPlayerProps) {
  const mediaRef = useRef<HTMLMediaElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Hide controls after inactivity for video
  useEffect(() => {
    if (type === 'audio') return;
    let timeout: NodeJS.Timeout;
    const resetTimer = () => {
      setShowControls(true);
      clearTimeout(timeout);
      if (isPlaying) {
        timeout = setTimeout(() => setShowControls(false), 2000);
      }
    };
    window.addEventListener('mousemove', resetTimer);
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      clearTimeout(timeout);
    };
  }, [isPlaying, type]);

  const togglePlay = () => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      setProgress(mediaRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (mediaRef.current) {
      setDuration(mediaRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (mediaRef.current) {
      mediaRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const toggleMute = () => {
    if (mediaRef.current) {
      mediaRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!mediaRef.current) return;
    // Simple fullscreen toggle logic for the container or video
    const container = mediaRef.current.parentElement;
    if (!document.fullscreenElement && container) {
        container.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  return (
    <div className={cn(
        "relative group overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 my-8",
        type === 'video' ? "aspect-video" : "p-4"
    )}>
      {type === 'video' ? (
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          src={src}
          poster={poster}
          className="w-full h-full object-cover"
          onClick={togglePlay}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
        />
      ) : (
        <audio
          ref={mediaRef as React.RefObject<HTMLAudioElement>}
          src={src}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
        />
      )}

      {/* Controls Overlay */}
      <div 
        className={cn(
            "absolute bottom-0 left-0 right-0 p-4 transition-opacity duration-300 bg-gradient-to-t from-black/50 to-transparent",
            type === 'video' ? (showControls ? "opacity-100" : "opacity-0") : "opacity-100 relative bg-none p-0"
        )}
      >
        <div className="flex items-center gap-3 text-white">
            {/* Play/Pause */}
            <button 
                onClick={togglePlay} 
                className={cn(
                    "p-2 rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm",
                    type === 'audio' && "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-700"
                )}
            >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            {/* Time */}
            <span className={cn("text-xs font-mono font-medium", type === 'audio' && "text-gray-600 dark:text-gray-400")}>
                {formatTime(progress)} / {formatTime(duration)}
            </span>

            {/* Progress Bar */}
            <input
                type="range"
                min="0"
                max={duration || 100}
                value={progress}
                onChange={handleSeek}
                className="flex-1 h-1.5 bg-gray-200/30 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:h-2 transition-all"
            />

            {/* Volume */}
            <button onClick={toggleMute} className={cn("p-1.5 hover:bg-white/20 rounded-md transition-colors", type === 'audio' && "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800")}>
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Fullscreen (Video only) */}
            {type === 'video' && (
                <button onClick={toggleFullscreen} className="p-1.5 hover:bg-white/20 rounded-md transition-colors">
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
            )}
        </div>
      </div>
    </div>
  );
}

// Helper utility if you don't have one
function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}
