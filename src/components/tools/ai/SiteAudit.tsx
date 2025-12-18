'use client';

import React, { useState } from 'react';
import { Sparkles, Globe, ArrowRight, Loader2, ScanEye } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // Ensure you have this or render plain text

export default function SiteAuditTool() {
  const [url, setUrl] = useState('');
  const [focus, setFocus] = useState('General UX & Design');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ screenshot: string; analysis: string } | null>(null);

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/ai-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, focus }),
      });
      const data = await res.json();
      
      if (data.success) {
        setResult(data);
      } else {
        alert(data.details || "Failed to run audit");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-4">
          <ScanEye className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">SiteScan AI Auditor</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Enter a URL to generate an instant visual snapshot and AI-powered technical audit using Neural Network.
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white dark:bg-zinc-900 p-2 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 max-w-3xl mx-auto">
        <form onSubmit={handleAudit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Globe className="absolute left-4 top-3.5 w-5 h-5 text-zinc-400" />
            <input 
              type="url" 
              required
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-transparent rounded-xl outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400"
            />
          </div>
          
          <select 
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            className="bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm font-medium outline-none cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
          >
            <option>General UX & Design</option>
            <option>SEO & Content</option>
            <option>Copywriting & Tone</option>
            <option>Conversion Optimization</option>
          </select>

          <button 
            type="submit" 
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] justify-center"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>Audit Site <Sparkles className="w-4 h-4" /></>}
          </button>
        </form>
      </div>

      {/* Results */}
      {result && (
        <div className="grid lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* Left: Visual Proof */}
          <div className="space-y-4">
            <h3 className="font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-sm">Visual Capture</h3>
            <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 shadow-sm aspect-video relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={result.screenshot} 
                alt="Site Screenshot" 
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
            </div>
            <a 
              href={result.screenshot} 
              target="_blank" 
              className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View Full Resolution <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Right: AI Analysis */}
          <div className="space-y-4">
            <h3 className="font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-sm">AI Intelligence Report</h3>
            <div className="prose prose-zinc dark:prose-invert max-w-none bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm h-full max-h-[600px] overflow-y-auto custom-scrollbar">
              {/* If you haven't installed react-markdown yet, simpler rendering: */}
              <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {result.analysis}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
