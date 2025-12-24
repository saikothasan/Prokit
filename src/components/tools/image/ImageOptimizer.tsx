'use client';

import { useState } from 'react';
import { Upload, Image as ImageIcon, Download, ArrowRight } from 'lucide-react';

export default function ImageOptimizer() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('format', 'webp');
    
    const res = await fetch('/api/image-optimizer', { method: 'POST', body: fd });
    setResult(await res.json());
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-12 text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer relative">
        <input 
          type="file" 
          onChange={(e) => setFile(e.target.files?.[0] || null)} 
          className="absolute inset-0 opacity-0 cursor-pointer" 
          accept="image/*"
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
        <button onClick={handleUpload} disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition">
          {loading ? 'Optimizing...' : 'Compress & Convert'}
        </button>
      )}

      {result && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 flex items-center justify-between">
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
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm font-medium hover:bg-gray-50">
                <Download size={16} /> Download
            </button>
        </div>
      )}
    </div>
  );
}
