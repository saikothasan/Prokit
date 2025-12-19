'use client';

import React, { useState } from 'react';
import { Bot, Globe, Search, Loader2, FileJson, Copy, Check } from 'lucide-react';

// Define the shape of the API response to satisfy TypeScript
interface ExtractorResponse {
  success: boolean;
  data?: string;
  details?: string;
  error?: string;
}

export default function WebExtractor() {
  const [url, setUrl] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !query) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/ai-extractor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, query }),
      });
      
      // CAST THE RESULT TO THE INTERFACE
      const data = (await res.json()) as ExtractorResponse;
      
      if (data.success) {
        setResult(data.data || "No data returned.");
      } else {
        setResult(`Error: ${data.details || data.error || "Unknown error"}`);
      }
    } catch {
      setResult("Failed to connect to the extractor API.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-4">
          <Bot className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">Smart Web Scraper</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Extract specific data or summarize content from any website using AI.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-lg border border-zinc-200 dark:border-zinc-800">
        <form onSubmit={handleExtract} className="space-y-4">
          
          {/* URL Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 ml-1">Target Website URL</label>
            <div className="relative">
              <Globe className="absolute left-4 top-3.5 w-5 h-5 text-zinc-400" />
              <input 
                type="url" 
                required
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-zinc-900 dark:text-white"
              />
            </div>
          </div>

          {/* Query Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 ml-1">What do you want to extract?</label>
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-zinc-400" />
              <input 
                type="text" 
                required
                placeholder="e.g. 'Summarize the main article', 'Get the pricing for the Enterprise plan', 'Find the contact email'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-zinc-900 dark:text-white"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>Run Extraction <FileJson className="w-4 h-4" /></>}
          </button>
        </form>
      </div>

      {/* Output Area */}
      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="flex items-center justify-between mb-2 px-2">
              <h3 className="font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-sm">Extraction Result</h3>
              <button 
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Result'}
              </button>
           </div>
           
           <div className="bg-zinc-900 text-zinc-100 p-6 rounded-2xl border border-zinc-800 shadow-inner font-mono text-sm leading-relaxed whitespace-pre-wrap overflow-x-auto">
             {result}
           </div>
        </div>
      )}
    </div>
  );
}
