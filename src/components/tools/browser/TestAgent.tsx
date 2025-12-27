'use client';

import React, { useState } from 'react';
import { 
  Play, Loader2, AlertCircle, Globe, 
  Gauge, Activity, FileJson, Video, 
  Image as ImageIcon, Terminal, Download,
  Layout, Zap, Server
} from 'lucide-react';

// --- Types ---
interface TestResult {
  success: boolean;
  testId: string;
  urls: {
    screenshot?: string;
    video?: string;
    har?: string;
    filmstrip: string[];
  };
  data: {
    metrics: {
      navigationTiming?: any;
      largestContentfulPaint?: any[];
      paintTiming?: any[];
      layoutShifts?: any[];
    };
    console: { type: string; text: string; location?: any }[];
    resources: any[];
    config: any;
  };
}

export default function TestAgent() {
  const [url, setUrl] = useState('');
  const [browser, setBrowser] = useState('chrome');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'visuals' | 'console' | 'network' | 'raw'>('overview');

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
        body: JSON.stringify({ url: targetUrl, browser }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Test failed');
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Helper to extract key metrics safely
  const getMetrics = () => {
    if (!result) return null;
    const nav = result.data.metrics.navigationTiming || {};
    const lcpList = result.data.metrics.largestContentfulPaint || [];
    const paintList = result.data.metrics.paintTiming || [];
    
    return {
      ttfb: (nav.responseStart - nav.navigationStart) || 0,
      domLoad: (nav.domContentLoadedEventEnd - nav.navigationStart) || 0,
      windowLoad: (nav.loadEventEnd - nav.navigationStart) || 0,
      lcp: lcpList.length > 0 ? lcpList[lcpList.length - 1].startTime : 0,
      fcp: paintList.find((p:any) => p.name === 'first-contentful-paint')?.startTime || 0,
      cls: result.data.metrics.layoutShifts?.reduce((acc: number, cur: any) => acc + (cur.value || 0), 0) || 0,
    };
  };

  const metrics = getMetrics();

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-center gap-3">
          <Globe className="w-8 h-8 text-blue-600" />
          Browser Performance Agent
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Run deep diagnostic tests using real browser engines. Analyze Core Web Vitals, 
          inspect network waterfalls, and replay the loading experience.
        </p>
      </div>

      {/* Control Panel */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <form onSubmit={runTest} className="grid md:grid-cols-[1fr_180px_auto] gap-4">
          <input
            type="text"
            placeholder="Enter website URL (e.g., https://example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none w-full"
          />
          <select
            value={browser}
            onChange={(e) => setBrowser(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 outline-none"
          >
            <option value="chrome">Chrome</option>
            <option value="firefox">Firefox</option>
            <option value="edge">Edge</option>
            <option value="safari">Safari (WebKit)</option>
          </select>
          <button
            type="submit"
            disabled={loading || !url}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 min-w-[140px] justify-center"
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

      {/* Results View */}
      {result && metrics && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            {[
              { id: 'overview', label: 'Overview', icon: Layout },
              { id: 'visuals', label: 'Visuals & Filmstrip', icon: Video },
              { id: 'network', label: 'Network Resources', icon: Server },
              { id: 'console', label: 'Console Logs', icon: Terminal },
              { id: 'raw', label: 'Raw JSON', icon: FileJson },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Metric Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <MetricCard label="TTFB" value={metrics.ttfb} unit="ms" icon={Zap} color="text-blue-500" />
                  <MetricCard label="FCP" value={metrics.fcp} unit="ms" icon={Gauge} color="text-green-500" />
                  <MetricCard label="LCP" value={metrics.lcp} unit="ms" icon={Gauge} color="text-amber-500" />
                  <MetricCard label="CLS" value={metrics.cls.toFixed(3)} unit="" icon={Layout} color="text-purple-500" />
                  <MetricCard label="DOM Load" value={metrics.domLoad} unit="ms" icon={Activity} color="text-indigo-500" />
                  <MetricCard label="Full Load" value={metrics.windowLoad} unit="ms" icon={Activity} color="text-pink-500" />
                </div>

                {/* Screenshot & Summary */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-zinc-100 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden relative aspect-video group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={result.urls.screenshot} alt="Final State" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <a href={result.urls.screenshot} target="_blank" className="bg-white text-black px-4 py-2 rounded-full font-medium flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" /> View Full Size
                      </a>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <h3 className="font-semibold mb-4 text-lg">Test Details</h3>
                    <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                      <div className="flex justify-between border-b dark:border-zinc-800 pb-2">
                        <span>Browser Engine</span>
                        <span className="font-mono text-zinc-900 dark:text-zinc-100 capitalize">{result.data.config.browserConfig?.engine || browser}</span>
                      </div>
                      <div className="flex justify-between border-b dark:border-zinc-800 pb-2">
                        <span>User Agent</span>
                        <span className="font-mono text-xs max-w-[200px] truncate" title={result.data.config.browserConfig?.userAgent}>
                          {result.data.config.browserConfig?.userAgent || 'Default'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b dark:border-zinc-800 pb-2">
                        <span>Viewport</span>
                        <span className="font-mono text-zinc-900 dark:text-zinc-100">
                          {result.data.config.browserConfig?.viewport?.width} x {result.data.config.browserConfig?.viewport?.height}
                        </span>
                      </div>
                      {result.urls.har && (
                        <div className="pt-2">
                          <a href={result.urls.har} download className="flex items-center justify-center gap-2 w-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 py-2 rounded-lg transition-colors">
                            <Download className="w-4 h-4" /> Download HAR
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VISUALS TAB */}
            {activeTab === 'visuals' && (
              <div className="space-y-8">
                {/* Video Player */}
                {result.urls.video ? (
                  <div className="bg-black rounded-xl overflow-hidden aspect-video max-w-3xl mx-auto shadow-lg">
                    <video controls className="w-full h-full" src={result.urls.video} />
                  </div>
                ) : (
                  <div className="p-8 text-center text-zinc-500 bg-zinc-100 dark:bg-zinc-900 rounded-xl">Video recording unavailable</div>
                )}

                {/* Filmstrip Reel */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Filmstrip</h3>
                  <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                    {result.urls.filmstrip.map((url, i) => (
                      <div key={i} className="snap-start shrink-0 flex flex-col items-center gap-2">
                        <div className="w-48 aspect-video bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`Frame ${i}`} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs font-mono text-zinc-500">Frame {i + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* CONSOLE TAB */}
            {activeTab === 'console' && (
              <div className="bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden font-mono text-sm">
                <div className="bg-zinc-900 p-3 border-b border-zinc-800 text-zinc-400 flex items-center gap-2">
                  <Terminal className="w-4 h-4" /> Console Output
                </div>
                <div className="p-4 space-y-2 max-h-[600px] overflow-y-auto">
                  {result.data.console.length === 0 ? (
                    <div className="text-zinc-600 italic">No console messages logged.</div>
                  ) : (
                    result.data.console.map((msg, i) => (
                      <div key={i} className="flex gap-3 group">
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
              </div>
            )}

            {/* NETWORK TAB */}
            {activeTab === 'network' && (
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                 <div className="overflow-x-auto">
                   <table className="w-full text-left text-sm">
                     <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400">
                       <tr>
                         <th className="p-4 font-medium">Resource</th>
                         <th className="p-4 font-medium">Type</th>
                         <th className="p-4 font-medium">Duration</th>
                         <th className="p-4 font-medium">Size</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                       {result.data.resources.slice(0, 50).map((res: any, i) => (
                         <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                           <td className="p-4 max-w-xs truncate" title={res.name}>{res.name.split('/').pop() || res.name}</td>
                           <td className="p-4 text-zinc-500">{res.initiatorType}</td>
                           <td className="p-4 font-mono">{res.duration.toFixed(0)}ms</td>
                           <td className="p-4 font-mono text-zinc-500">{res.transferSize ? (res.transferSize / 1024).toFixed(1) + ' KB' : '-'}</td>
                         </tr>
                       ))}
                       {result.data.resources.length > 50 && (
                         <tr><td colSpan={4} className="p-4 text-center text-zinc-500 italic">...and {result.data.resources.length - 50} more (Download HAR for full details)</td></tr>
                       )}
                     </tbody>
                   </table>
                 </div>
              </div>
            )}

            {/* RAW JSON TAB */}
            {activeTab === 'raw' && (
              <div className="space-y-4">
                <div className="bg-zinc-950 rounded-xl p-4 overflow-auto max-h-[600px] border border-zinc-800">
                  <pre className="text-xs text-zinc-400 font-mono">
                    {JSON.stringify(result.data.metrics, null, 2)}
                  </pre>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, unit, icon: Icon, color }: any) {
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
