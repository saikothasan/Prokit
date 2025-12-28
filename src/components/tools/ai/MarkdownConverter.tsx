'use client';

import React, { useState } from 'react';
import { Search, Copy, Check, FileText, Settings, Sparkles } from 'lucide-react';

interface ConverterResponse {
  success?: boolean;
  data?: string;
  error?: string;
}

export default function MarkdownConverter() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Options
  const [enableFrontmatter, setEnableFrontmatter] = useState(true);

  const handleConvert = async () => {
    if (!url) return;
    setLoading(true);
    setResult('');
    
    try {
      const res = await fetch('/api/ai-markdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url,
          enableFrontmatter
        }),
      });

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
      {/* Input Section */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleConvert}
            disabled={loading || !url}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 font-medium transition-colors flex items-center gap-2"
          >
            {loading ? (
              <span className="animate-pulse">Analyzing...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Convert</span>
              </>
            )}
          </button>
        </div>

        {/* Options Toolbar */}
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
                    Include SEO Frontmatter
                </label>
            </div>
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
            <div className="absolute top-0 left-0 px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-tl-xl rounded-br-xl text-xs font-mono text-gray-500">
                MARKDOWN
            </div>
            <div className="p-6 pt-12 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl min-h-[300px] overflow-auto whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-800 dark:text-gray-300">
                {result}
            </div>
          </div>
        </div>
      )}

      {!result && !loading && (
        <div className="text-center py-12 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Enter a URL to generate clean, SEO-ready Markdown.</p>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-gray-400 justify-center mt-8">
        <FileText className="w-3 h-3" />
        <span>Powered by Cloudflare Browser Rendering & Llama 3</span>
      </div>
    </div>
  );
}
