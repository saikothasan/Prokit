'use client';

import { useState } from 'react';
import { Upload, Download, ArrowRight } from 'lucide-react';

interface OptimizationResult {
  originalSize: number;
  optimizedSize: number;
  success: boolean;
  format: string;
  error?: string;
  image?: string;
}

export default function ImageOptimizer() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('format', 'webp');
      
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
        link.download = `optimized-image.${result.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-8">
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-12 text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer relative">
        <input 
          type="file" 
          onChange={(e) => {
            setFile(e.target.files?.[0] || null);
            setResult(null);
          }} 
          className="absolute inset-0 opacity-0 cursor-pointer" 
          accept="image/png, image/jpeg, image/jpg, image/webp"
        />
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
            <Upload size={32} />
          </div>
          <div>
            <h3 className="text-xl font-semibold">{file ? file.name : "Drop image here"}</h3>
            <p className="text-gray-500">Supports JPG, PNG, WEBP up to 5MB</p>
          </div>
        </div>
      </div>

      {file && !result && (
        <button 
          onClick={handleUpload} 
          disabled={loading} 
          className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Optimizing...' : 'Compress & Convert'}
        </button>
      )}

      {result && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 flex items-center justify-between animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-6">
                <div className="text-center">
                    <div className="text-sm text-gray-500">Original</div>
                    <div className="font-mono font-bold">{(result.originalSize / 1024).toFixed(1)} KB</div>
                </div>
                <ArrowRight className="text-gray-400" />
                <div className="text-center">
                    <div className="text-sm text-green-600">Optimized</div>
                    <div className="font-mono font-bold text-green-600">{(result.optimizedSize / 1024).toFixed(1)} KB</div>
                </div>
            </div>
            <button 
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm font-medium hover:bg-gray-50 transition"
            >
                <Download size={16} /> Download
            </button>
        </div>
      )}
    </div>
  );
}
