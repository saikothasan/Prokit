'use client';

import React, { useState } from 'react';
import { Search, Copy, Check, FileText } from 'lucide-react';

export default function MarkdownConverter() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleConvert = async () => {
    if (!url) return;
    setLoading(true);
    setResult('');
    
    try {
      const res = await fetch('/api/ai-markdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
      } else {
        setResult(`Error: ${data.error}`);
      }
    } catch (err) {
      // Fix: Log the error so the variable is 'used'
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
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 font-medium transition-colors"
        >
          {loading ? 'Converting...' : 'Convert to Markdown'}
        </button>
      </div>

      {result && (
        <div className="relative group">
          <div className="absolute right-4 top-4">
            <button
              onClick={copyToClipboard}
              className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
            </button>
          </div>
          <div className="p-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl min-h-[300px] overflow-auto whitespace-pre-wrap font-mono text-sm">
            {result}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-gray-400 justify-center">
        <FileText className="w-3 h-3" />
        <span>Powered by Cloudflare Browser Rendering & Llama 3</span>
      </div>
    </div>
  );
}
