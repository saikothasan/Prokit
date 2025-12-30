'use client';

import React, { useState, useRef } from 'react';
import { 
  Search, 
  Copy, 
  Check, 
  FileText, 
  Settings, 
  Sparkles, 
  Upload, 
  X, 
  FileIcon,
  Globe,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface ConverterResponse {
  success?: boolean;
  data?: string;
  error?: string;
}

type Mode = 'url' | 'file';

export default function MarkdownConverter() {
  const [mode, setMode] = useState<Mode>('url');
  
  // URL Mode State
  const [url, setUrl] = useState('');
  
  // File Mode State
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Shared State
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [enableFrontmatter, setEnableFrontmatter] = useState(true);

  // --- Handlers ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (mode === 'url' && !url) return;
    if (mode === 'file' && files.length === 0) return;

    setLoading(true);
    setResult('');
    
    try {
      let res;
      
      if (mode === 'url') {
        // URL Mode: Send JSON
        res = await fetch('/api/ai-markdown', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            url,
            enableFrontmatter
          }),
        });
      } else {
        // File Mode: Send FormData
        const formData = new FormData();
        files.forEach(file => {
          formData.append('files', file);
        });
        formData.append('enableFrontmatter', String(enableFrontmatter));

        res = await fetch('/api/ai-markdown', {
          method: 'POST',
          body: formData,
        });
      }

      const data = (await res.json()) as ConverterResponse;

      if (data.success) {
        setResult(data.data || '');
      } else {
        setResult(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Conversion request failed:', err);
      setResult('Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
        <button
          onClick={() => setMode('url')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
            mode === 'url' 
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' 
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          <Globe className="w-4 h-4" />
          Web URL
        </button>
        <button
          onClick={() => setMode('file')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
            mode === 'file' 
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' 
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          <Upload className="w-4 h-4" />
          File Upload
        </button>
      </div>

      {/* Input Section */}
      <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        
        {/* URL Input */}
        {mode === 'url' && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        )}

        {/* File Input */}
        {mode === 'file' && (
          <div className="space-y-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-8 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer text-center group"
            >
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.webp,.html,.xml,.docx"
                onChange={handleFileChange}
              />
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Click to upload files
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Supports PDF, Images, HTML, XML, DOCX
              </p>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 group">
                    <div className="w-8 h-8 rounded bg-white dark:bg-black flex items-center justify-center text-gray-400 shrink-0">
                      <FileIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button 
                      onClick={() => removeFile(i)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          {/* Options */}
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-md">
                <Settings className="w-3 h-3" />
                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                        type="checkbox" 
                        checked={enableFrontmatter}
                        onChange={(e) => setEnableFrontmatter(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Include Metadata
                </label>
            </div>
          </div>

          {/* Convert Button */}
          <button
            onClick={handleConvert}
            disabled={loading || (mode === 'url' ? !url : files.length === 0)}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 font-medium transition-all hover:shadow-lg hover:shadow-blue-500/25 flex items-center gap-2 ml-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Convert to Markdown</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result Section */}
      {result && (
        <div className="relative group animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="absolute right-4 top-4 z-10">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition-all text-xs font-medium"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-green-500" />
                  <span className="text-green-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-gray-500" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>
          </div>
          
          <div className="relative">
            <div className="absolute top-0 left-0 px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-tl-xl rounded-br-xl text-xs font-mono text-gray-500 uppercase tracking-wider">
                Markdown Output
            </div>
            <div className="p-6 pt-12 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl min-h-[300px] max-h-[600px] overflow-auto whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-800 dark:text-gray-300 custom-scrollbar">
                {result}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && !loading && (
        <div className="text-center py-12 text-gray-400 bg-gray-50/50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-medium">Ready to convert</p>
            <p className="text-sm opacity-60 mt-1">
              {mode === 'url' 
                ? 'Enter a URL above to extract content as Markdown.' 
                : 'Upload images, PDFs, or documents to convert them.'}
            </p>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-gray-400 justify-center mt-8">
        <Sparkles className="w-3 h-3" />
        <span>Powered by Cloudflare Workers AI & Browser Rendering</span>
      </div>
    </div>
  );
}
