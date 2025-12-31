'use client';

import React, { useState, useRef } from 'react';
import { 
  Upload, Download, Settings, Image as ImageIcon, 
  RefreshCw, FileImage, Maximize2, MoveHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils'; 

interface OptimizationResult {
  originalSize: number;
  optimizedSize: number;
  width: number;
  height: number;
  success: boolean;
  format: string;
  error?: string;
  image?: string;
}

const FORMATS = [
  { id: 'avif', label: 'AVIF', desc: '-50% smaller than JPEG', badge: 'Best' },
  { id: 'webp', label: 'WebP', desc: 'Standard for Modern Web', badge: 'Fast' },
  { id: 'jpeg', label: 'JPEG', desc: 'Universal Compatibility', badge: 'Legacy' },
  { id: 'png', label: 'PNG', desc: 'Lossless / Transparent', badge: 'Clear' },
];

export default function ImageOptimizer() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  // Settings
  const [format, setFormat] = useState('avif');
  const [quality, setQuality] = useState(80);
  const [resizeMode, setResizeMode] = useState<'original' | 'custom'>('original');
  const [width, setWidth] = useState<number>(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      
      const img = new Image();
      img.onload = () => setWidth(img.width);
      img.src = URL.createObjectURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('format', format);
      fd.append('quality', quality.toString());
      fd.append('fit', 'contain'); 
      
      if (resizeMode === 'custom' && width > 0) {
        fd.append('width', width.toString());
      }
      
      const res = await fetch('/api/image-optimizer', { method: 'POST', body: fd });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Optimization failed');
      }

      // Handle Binary Response (Blob)
      const blob = await res.blob();
      const optimizedUrl = URL.createObjectURL(blob);
      
      // Extract metadata from headers
      const originalSize = parseInt(res.headers.get('X-Original-Size') || file.size.toString());
      const optimizedSize = parseInt(res.headers.get('Content-Length') || blob.size.toString());
      const resWidth = parseInt(res.headers.get('X-Original-Width') || '0');
      const resHeight = parseInt(res.headers.get('X-Original-Height') || '0');

      setResult({
        success: true,
        originalSize,
        optimizedSize,
        width: resWidth,
        height: resHeight,
        format: format,
        image: optimizedUrl
      });
      
    } catch (err: unknown) {
        alert(err instanceof Error ? err.message : 'Error optimizing image');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (result?.image && file) {
        const link = document.createElement('a');
        link.href = result.image;
        link.download = `optimized-${file.name.split('.')[0]}.${result.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const pos = ((x - rect.left) / rect.width) * 100;
      setSliderPosition(Math.min(Math.max(pos, 0), 100));
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-4">
         <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-center gap-3">
          <ImageIcon className="w-8 h-8 text-indigo-600" />
          Prokit Image Lab
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Professional Wasm-powered compression. Optimize AVIF, WebP, JPEG, and PNG directly in the cloud.
        </p>
      </div>

      <div className="grid lg:grid-cols-[350px_1fr] gap-8 items-start">
        {/* Controls Sidebar */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-8 shadow-sm h-fit">
           
           {!file ? (
             <div className="text-center py-12 px-4 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors relative cursor-pointer">
                <input type="file" onChange={handleFileSelect} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/png, image/jpeg, image/webp, image/avif" />
                <Upload className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
                <p className="font-medium text-zinc-900 dark:text-zinc-100">Click to Upload</p>
                <p className="text-xs text-zinc-500 mt-1">JPG, PNG, WebP, AVIF</p>
             </div>
           ) : (
             <div className="space-y-6">
                <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
                   <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center">
                      <FileImage className="w-5 h-5" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{file.name}</p>
                      <p className="text-xs text-zinc-500">{formatSize(file.size)}</p>
                   </div>
                   <button onClick={() => { setFile(null); setResult(null); }} className="text-xs text-red-500 hover:text-red-600">Change</button>
                </div>

                <div className="h-px bg-zinc-200 dark:bg-zinc-800" />

                {/* Format Settings */}
                <div className="space-y-3">
                   <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Target Format</label>
                   <div className="grid grid-cols-1 gap-2">
                      {FORMATS.map(f => (
                        <button
                          key={f.id}
                          onClick={() => setFormat(f.id)}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-xl border text-left transition-all",
                            format === f.id 
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20" 
                              : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-indigo-300"
                          )}
                        >
                           <div>
                              <div className="font-semibold text-sm">{f.label}</div>
                              <div className={cn("text-xs", format === f.id ? "text-indigo-100" : "text-zinc-500")}>{f.desc}</div>
                           </div>
                           <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold", 
                             format === f.id ? "bg-white/20 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                           )}>{f.badge}</span>
                        </button>
                      ))}
                   </div>
                </div>

                {/* Quality Slider */}
                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Quality</label>
                      <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{quality}%</span>
                   </div>
                   <input 
                     type="range" min="10" max="100" value={quality}
                     onChange={(e) => setQuality(Number(e.target.value))}
                     className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                   />
                </div>

                {/* Dimensions */}
                 <div className="space-y-3">
                   <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Resize</label>
                   <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                      <button 
                        onClick={() => setResizeMode('original')}
                        className={cn("flex-1 py-1.5 text-xs font-medium rounded-md transition-all", 
                          resizeMode === 'original' ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100" : "text-zinc-500"
                        )}
                      >Original</button>
                       <button 
                        onClick={() => setResizeMode('custom')}
                        className={cn("flex-1 py-1.5 text-xs font-medium rounded-md transition-all", 
                          resizeMode === 'custom' ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100" : "text-zinc-500"
                        )}
                      >Custom Width</button>
                   </div>
                   {resizeMode === 'custom' && (
                     <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          value={width || ''} 
                          onChange={(e) => setWidth(Number(e.target.value))}
                          placeholder="Width (px)"
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="text-xs text-zinc-400">px</span>
                     </div>
                   )}
                </div>

                {/* Action Button */}
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                >
                   {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Settings className="w-5 h-5" />}
                   {loading ? 'Compress Image' : 'Compress Image'}
                </button>
             </div>
           )}
        </div>

        {/* Preview / Result Area */}
        <div className="space-y-6">
           {/* Stats Dashboard */}
           {result && (
              <div className="grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-2">
                 <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="text-xs text-zinc-500 uppercase font-semibold mb-1">Savings</div>
                    <div className="text-2xl font-bold text-green-600">
                       {result.optimizedSize < result.originalSize ? '-' : '+'}{Math.abs(Math.round(((result.originalSize - result.optimizedSize) / result.originalSize) * 100))}%
                    </div>
                 </div>
                 <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="text-xs text-zinc-500 uppercase font-semibold mb-1">New Size</div>
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                       {formatSize(result.optimizedSize)}
                    </div>
                 </div>
                 <button 
                   onClick={handleDownload}
                   className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl shadow-lg shadow-green-600/20 flex flex-col items-center justify-center transition-all"
                 >
                    <Download className="w-6 h-6 mb-1" />
                    <span className="text-xs font-bold uppercase">Download</span>
                 </button>
              </div>
           )}

           {/* Visualization Area */}
           <div className="bg-zinc-100 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden relative shadow-inner min-h-[400px] flex items-center justify-center group select-none">
              {!preview ? (
                 <div className="text-zinc-400 flex flex-col items-center gap-2">
                    <Maximize2 className="w-8 h-8 opacity-50" />
                    <p>Image preview will appear here</p>
                 </div>
              ) : (
                <>
                  {/* Slider Logic */}
                  {result && result.image ? (
                     <div 
                        ref={containerRef}
                        className="relative w-full h-full min-h-[500px] cursor-col-resize"
                        onMouseMove={handleDrag}
                        onTouchMove={handleDrag}
                        onClick={handleDrag}
                     >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={result.image} 
                          alt="Optimized" 
                          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none" 
                        />
                        
                        {/* Foreground Image (Original) - Clipped */}
                        <div 
                          className="absolute inset-0 overflow-hidden pointer-events-none select-none border-r-2 border-white shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                          style={{ width: `${sliderPosition}%` }}
                        >
                           {/* eslint-disable-next-line @next/next/no-img-element */}
                           <img 
                              src={preview} 
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
                  ) : (
                     <div className="relative w-full h-full p-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                        {loading && (
                          <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center">
                             <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-xl flex items-center gap-3">
                                <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
                                <span className="font-medium">Optimizing...</span>
                             </div>
                          </div>
                        )}
                     </div>
                  )}
                </>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
