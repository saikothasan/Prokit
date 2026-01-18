'use client';

import React, { useState } from 'react';
import { Camera, Download, Loader2, AlertCircle, CheckCircle2, Globe, Monitor, Zap } from 'lucide-react';

// FIX: Define the expected response shape
interface ScreenshotResponse {
  success?: boolean;
  url?: string;
  captured_at?: string;
  error?: string;
  details?: string;
}

export default function ScreenshotTool() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<{ url: string; captured_at: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScreenshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Normalize URL to ensure it has a protocol
      const targetUrl = url.startsWith('http') ? url : `https://${url}`;
      
      const apiEndpoint = `/api/browser/screenshot?url=${encodeURIComponent(targetUrl)}`;
      const res = await fetch(apiEndpoint);
      
      // FIX: Cast the response to our interface
      const data = (await res.json()) as ScreenshotResponse;

      if (!res.ok) {
        throw new Error(data.details || data.error || 'Failed to capture screenshot');
      }

      if (data.url && data.captured_at) {
        setResult({
          url: data.url,
          captured_at: data.captured_at
        });
      } else {
        throw new Error('Invalid response from server');
      }
      
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while capturing the website.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      
      {/* Tool Header & Input Section */}
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Website Screenshot Generator
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Capture high-resolution, full-page screenshots of any website instantly. 
            Our cloud-based rendering engine ensures pixel-perfect accuracy for developers, designers, and marketers.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <form onSubmit={handleScreenshot} className="flex gap-4 flex-col sm:flex-row" aria-busy={loading}>
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Globe className="h-5 w-5 text-zinc-400" />
              </div>
              <input
                type="text"
                placeholder="Enter website URL (e.g., google.com)"
                aria-label="Website URL"
                aria-invalid={!!error}
                aria-describedby={error ? "screenshot-error" : undefined}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !url}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  <span>Capturing...</span>
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5" />
                  <span>Snap URL</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div
              id="screenshot-error"
              role="alert"
              aria-live="assertive"
              className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-start gap-3 border border-red-100 dark:border-red-900/30"
            >
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold block">Capture Failed</span>
                <span className="text-sm opacity-90">{error}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Result Display Section */}
      {result && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Screenshot Captured
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Generated at {new Date(result.captured_at).toLocaleString()}
              </p>
            </div>
            <a 
              href={result.url} 
              target="_blank"
              rel="noopener noreferrer"
              download
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" /> 
              Download High-Res
            </a>
          </div>

          <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-950 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 group">
             {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={result.url} 
              alt={`Screenshot of ${url}`} 
              className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-[1.02]"
            />
          </div>
        </div>
      )}

      {/* SEO Content / Features Section */}
      <div className="grid md:grid-cols-3 gap-6 pt-8 border-t border-zinc-200 dark:border-zinc-800">
        <div className="space-y-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Monitor className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">True Browser Rendering</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            We use a real headless browser engine to render modern JavaScript, CSS Grid, and Web Fonts exactly as they appear to users.
          </p>
        </div>
        
        <div className="space-y-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Instant Cloud Capture</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Powered by Cloudflare Workers and R2 storage, our global network captures and serves images with minimal latency.
          </p>
        </div>

        <div className="space-y-3">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Shareable Links</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Every screenshot is automatically stored on a public CDN, giving you a permanent, shareable URL for your archives.
          </p>
        </div>
      </div>

    </div>
  );
}
