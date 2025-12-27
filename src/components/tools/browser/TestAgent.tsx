'use client';

import React, { useState } from 'react';
import { 
  Play, Loader2, AlertCircle, Globe, 
  Gauge, Activity, Terminal,
  Layout, FileSearch
} from 'lucide-react';

interface TestResult {
  success: boolean;
  testId: string;
  urls: {
    screenshot: string;
  };
  data: {
    metrics: {
      ttfb: number;
      domLoad: number;
      windowLoad: number;
      fcp: number;
      duration: number;
    };
    console: { type: string; text: string; location?: string }[];
  };
}

// Define an interface for the error response
interface ErrorResponse {
  error?: string;
}

export default function TestAgent() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'console'>('overview');

  const runTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setActiveTab('overview');

    try {
      const targetUrl = url.startsWith('http') ? url : `https://${url}`;
      const res = await fetch('/api/browser/test-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });

      // FIX: Use 'unknown' type instead of 'any' to satisfy ESLint.
      const data = await res.json() as unknown;
      
      if (!res.ok) {
        // Safe cast to access the error property
        const errorData = data as ErrorResponse;
        throw new Error(errorData.error || 'Test failed');
      }
      
      setResult(data as TestResult);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-center gap-3">
          <Globe className="w-8 h-8 text-indigo-600" />
          Playwright Testing Agent
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Run deep diagnostic tests using Cloudflare&apos;s Browser Rendering. 
          Captures screenshots, console logs, and Core Web Vitals.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <form onSubmit={runTest} className="grid md:grid-cols-[1fr_auto] gap-4">
          <input
            type="text"
            placeholder="Enter website URL (e.g., https://example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none w-full"
          />
          <button
            type="submit"
            disabled={loading || !url}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 min-w-[140px] justify-center"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Play className="w-5 h-5" />}
            <span>Run Test</span>
          </button>
        </form>
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Layout className="w-4 h-4" /> Overview
            </button>
            <button
              onClick={() => setActiveTab('console')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'console'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Terminal className="w-4 h-4" /> Console ({result.data.console.length})
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard label="TTFB" value={result.data.metrics.ttfb} unit="ms" icon={Activity} color="text-blue-500" />
                <MetricCard label="FCP" value={result.data.metrics.fcp} unit="ms" icon={Gauge} color="text-green-500" />
                <MetricCard label="DOM Load" value={result.data.metrics.domLoad} unit="ms" icon={Activity} color="text-amber-500" />
                <MetricCard label="Total Duration" value={result.data.metrics.duration} unit="ms" icon={Activity} color="text-purple-500" />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-zinc-100 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden relative aspect-video">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={result.urls.screenshot} alt="Screenshot" className="w-full h-full object-contain" />
                </div>
                
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col justify-center items-center text-center space-y-4">
                  <FileSearch className="w-12 h-12 text-zinc-300" />
                  <div>
                    <h3 className="text-lg font-semibold">Test Successful</h3>
                    <p className="text-sm text-zinc-500 max-w-xs mx-auto">
                      Screenshot and metrics captured successfully via Cloudflare Browser Rendering.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'console' && (
            <div className="bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden font-mono text-sm p-4 space-y-2 max-h-[600px] overflow-y-auto">
              {result.data.console.length === 0 ? (
                <div className="text-zinc-600 italic">No console messages logged.</div>
              ) : (
                result.data.console.map((msg, i) => (
                  <div key={i} className="flex gap-3 border-b border-zinc-900 pb-1 last:border-0">
                    <span className={`uppercase text-[10px] px-1.5 py-0.5 rounded font-bold h-fit mt-0.5 ${
                      msg.type === 'error' ? 'bg-red-900 text-red-200' :
                      msg.type === 'warning' ? 'bg-yellow-900 text-yellow-200' :
                      'bg-zinc-800 text-zinc-300'
                    }`}>{msg.type}</span>
                    <div className="text-zinc-300 break-all">{msg.text}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, unit, icon: Icon, color }: { label: string; value: number; unit: string; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        {typeof value === 'number' ? value.toFixed(0) : value}
        <span className="text-sm font-normal text-zinc-500 ml-0.5">{unit}</span>
      </div>
    </div>
  );
}
