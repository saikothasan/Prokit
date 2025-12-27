'use client';

import { useState, useCallback } from 'react';
import { Upload, Download, ArrowRight, Settings, Image as ImageIcon, RefreshCw, Check } from 'lucide-react';
import Image from 'next/image';

interface OptimizationResult {
  originalSize: number;
  optimizedSize: number;
  success: boolean;
  format: string;
  error?: string;
  image?: string;
}

const FORMATS = [
  { id: 'webp', label: 'WebP', desc: 'Best for Web' },
  { id: 'avif', label: 'AVIF', desc: 'Max Compression' },
  { id: 'png', label: 'PNG', desc: 'Lossless' },
  { id: 'jpeg', label: 'JPEG', desc: 'Universal' },
];

const SCALES = [
  { id: 'original', label: 'Original Size' },
  { id: '1920', label: 'FHD (1920px)' },
  { id: '1280', label: 'HD (1280px)' },
  { id: '800', label: 'Mobile (800px)' },
];

export default function ImageOptimizer() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Settings
  const [format, setFormat] = useState('webp');
  const [quality, setQuality] = useState(80);
  const [scale, setScale] = useState('original');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
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
      fd.append('scale', scale);
      
      const res = await fetch('/api/image-optimizer', { method: 'POST', body: fd });
      const data = (await res.json()) as OptimizationResult;
      
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Optimization failed');
      }
      
      setResult(data);
    } catch (err: unknown) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        alert("Error optimizing image: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (result?.image) {
        const link = document.createElement('a');
        link.href = result.image;
        link.download = `optimized-prokit.${result.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  // Calculate savings percentage
  const savings = result 
    ? Math.round(((result.originalSize - result.optimizedSize) / result.originalSize) * 100) 
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Upload Area */}
      {!file ? (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-3xl p-16 text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all cursor-pointer relative group">
          <input 
            type="file" 
            onChange={handleFileSelect} 
            className="absolute inset-0 opacity-0 cursor-pointer z-10" 
            accept="image/png, image/jpeg, image/jpg, image/webp"
          />
          <div className="flex flex-col items-center gap-4 transition-transform group-hover:scale-105 duration-300">
            <div className="p-5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl shadow-sm">
              <Upload size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Drop your image here</h3>
              <p className="text-gray-500">Supports JPG, PNG, WEBP up to 10MB</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
          {/* Toolbar */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-wrap gap-6 items-center justify-between">
             <div className="flex items-center gap-4">
                <button 
                  onClick={() => { setFile(null); setResult(null); }} 
                  className="text-sm font-medium text-gray-500 hover:text-red-500 transition-colors"
                >
                  Remove File
                </button>
                <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />
                <span className="font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                  {file.name}
                </span>
             </div>

             <div className="flex items-center gap-3">
               {!result && (
                 <button 
                    onClick={handleUpload} 
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
                 >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Optimizing...
                      </>
                    ) : (
                      <>
                        <Settings className="w-4 h-4" /> Compress & Convert
                      </>
                    )}
                 </button>
               )}
               {result && (
                  <button 
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-green-600/20"
                  >
                    <Download className="w-4 h-4" /> Download Result
                  </button>
               )}
             </div>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Settings Sidebar */}
            <div className="w-full lg:w-80 p-6 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20 space-y-8">
               
               {/* Format Selection */}
               <div className="space-y-3">
                 <label className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                   <ImageIcon className="w-4 h-4 text-blue-500" /> Output Format
                 </label>
                 <div className="grid grid-cols-2 gap-2">
                   {FORMATS.map((f) => (
                     <button
                       key={f.id}
                       onClick={() => setFormat(f.id)}
                       disabled={loading || !!result}
                       className={`p-2.5 rounded-lg text-left transition-all border ${
                         format === f.id 
                           ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                           : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                       } ${result ? 'opacity-50 cursor-not-allowed' : ''}`}
                     >
                       <div className="font-semibold text-sm">{f.label}</div>
                       <div className={`text-xs ${format === f.id ? 'text-blue-100' : 'text-gray-500'}`}>{f.desc}</div>
                     </button>
                   ))}
                 </div>
               </div>

               {/* Scale Selection */}
               <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-900 dark:text-gray-100">Resize (Width)</label>
                  <select 
                    value={scale}
                    onChange={(e) => setScale(e.target.value)}
                    disabled={loading || !!result}
                    className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {SCALES.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
               </div>

               {/* Quality Slider */}
               <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-gray-900 dark:text-gray-100">Quality</label>
                    <span className="text-xs font-mono bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">{quality}%</span>
                 </div>
                 <input 
                    type="range" 
                    min="1" 
                    max="100" 
                    value={quality} 
                    onChange={(e) => setQuality(Number(e.target.value))}
                    disabled={loading || !!result}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                 />
                 <p className="text-xs text-gray-500">Lower quality = smaller file size.</p>
               </div>

            </div>

            {/* Preview Area */}
            <div className="flex-1 p-8 bg-gray-100/50 dark:bg-gray-900/50 flex flex-col items-center justify-center min-h-[400px]">
               {result ? (
                 <div className="w-full space-y-6">
                    {/* Success Stats */}
                    <div className="flex flex-wrap justify-center gap-4">
                        <div className="bg-white dark:bg-gray-800 px-5 py-3 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Original</div>
                            <div className="text-lg font-mono font-bold mt-1">{(result.originalSize / 1024).toFixed(1)} KB</div>
                        </div>
                        <div className="flex items-center text-gray-400">
                            <ArrowRight />
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 px-5 py-3 rounded-xl shadow-sm border border-green-200 dark:border-green-800 text-center">
                            <div className="text-xs text-green-600 dark:text-green-400 uppercase tracking-wider font-semibold">Optimized</div>
                            <div className="text-lg font-mono font-bold text-green-700 dark:text-green-400 mt-1">{(result.optimizedSize / 1024).toFixed(1)} KB</div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-3 rounded-xl border border-blue-200 dark:border-blue-800 flex items-center">
                            <span className="text-blue-700 dark:text-blue-300 font-bold">-{savings}% Size</span>
                        </div>
                    </div>

                    {/* Compare View */}
                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                        <div className="space-y-2">
                             <p className="text-center text-sm font-medium text-gray-500">Original</p>
                             <div className="relative aspect-video bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                                <img src={preview} alt="Original" className="object-contain w-full h-full" />
                             </div>
                        </div>
                        <div className="space-y-2">
                             <p className="text-center text-sm font-medium text-green-600">Optimized ({result.format.toUpperCase()})</p>
                             <div className="relative aspect-video bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden border-2 border-green-500/30">
                                <img src={result.image} alt="Optimized" className="object-contain w-full h-full" />
                             </div>
                        </div>
                    </div>
                 </div>
               ) : (
                 <div className="relative w-full max-w-md aspect-square md:aspect-video bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group">
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="w-full h-full object-contain p-4 transition-opacity opacity-100 group-hover:opacity-90" 
                    />
                    {loading && (
                      <div className="absolute inset-0 bg-white/80 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3 animate-pulse">
                           <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                           <p className="font-medium text-gray-900 dark:text-white">Processing...</p>
                        </div>
                      </div>
                    )}
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
