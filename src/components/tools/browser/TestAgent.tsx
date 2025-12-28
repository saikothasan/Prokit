'use client';

import React, { useState } from 'react';
import { 
  Play, Loader2, AlertCircle, Globe, 
  Gauge, Activity, Terminal,
  Layout, Search, CheckCircle2, AlertTriangle, 
  Image as ImageIcon, Share2, Link as LinkIcon,
  Maximize
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
    seo: {
      title: string;
      description: string;
      keywords: string;
      h1Count: number;
      h2Count: number;
      linksCount: number;
      imagesCount: number;
      imagesWithoutAlt: number;
      viewport: string | null;
      canonical: string | null;
      ogTitle: string | null;
      ogDescription: string | null;
      ogImage: string | null;
    };
    console: { type: string; text: string; location?: string }[];
  };
}

interface ErrorResponse {
  error?: string;
}

type Tab = 'overview' | 'seo' | 'performance' | 'console';

export default function TestAgent() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

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

      const data = await res.json() as unknown;
      
      if (!res.ok) {
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
          Prokit Browser Agent
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Deep diagnostic testing with Puppeteer. Analyzes SEO metadata, 
          captures Core Web Vitals, and audits console logs in real-time.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
        <form onSubmit={runTest} className="grid md:grid-cols-[1fr_auto] gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Enter website URL (e.g., example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 pl-11 focus:ring-2 focus:ring-indigo-500 outline-none w-full transition-all"
            />
            <Search className="w-5 h-5 text-zinc-400 absolute left-3.5 top-3.5" />
          </div>
          <button
            type="submit"
            disabled={loading || !url}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 min-w-[140px] justify-center transition-all shadow-lg shadow-indigo-500/20"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Play className="w-5 h-5" />}
            <span>Analyze</span>
          </button>
        </form>
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 overflow-x-auto">
            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={Layout} label="Overview" />
            <TabButton active={activeTab === 'seo'} onClick={() => setActiveTab('seo')} icon={Search} label="SEO Analysis" />
            <TabButton active={activeTab === 'performance'} onClick={() => setActiveTab('performance')} icon={Activity} label="Performance" />
            <TabButton active={activeTab === 'console'} onClick={() => setActiveTab('console')} icon={Terminal} label={`Console (${result.data.console.length})`} />
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'overview' && (
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                   <div className="bg-zinc-100 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden relative group aspect-video shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={result.urls.screenshot} alt="Site Screenshot" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <a href={result.urls.screenshot} target="_blank" rel="noopener noreferrer" className="text-white flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/30 transition-colors">
                        <Maximize className="w-4 h-4" /> View Full Size
                      </a>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <StatusCard 
                      label="Title Tag" 
                      status={result.data.seo.title ? 'success' : 'error'} 
                      value={result.data.seo.title ? 'Present' : 'Missing'} 
                    />
                    <StatusCard 
                      label="Console Errors" 
                      status={result.data.console.some(l => l.type === 'error') ? 'warning' : 'success'} 
                      value={result.data.console.filter(l => l.type === 'error').length.toString()} 
                    />
                  </div>
                </div>

                <div className="space-y-6">
                   <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Quick Metrics</h3>
                   <div className="grid grid-cols-2 gap-4">
                      <MetricCard label="TTFB" value={result.data.metrics.ttfb} unit="ms" icon={Activity} color="text-blue-500" />
                      <MetricCard label="FCP" value={result.data.metrics.fcp} unit="ms" icon={Gauge} color="text-green-500" />
                      <MetricCard label="DOM Load" value={result.data.metrics.domLoad} unit="ms" icon={Activity} color="text-amber-500" />
                      <MetricCard label="Page Load" value={result.data.metrics.duration} unit="ms" icon={Activity} color="text-purple-500" />
                   </div>
                   
                   <div className="bg-zinc-50 dark:bg-zinc-900/50 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <h4 className="text-sm font-medium text-zinc-500 mb-3 uppercase tracking-wider">Page Summary</h4>
                      <ul className="space-y-3 text-sm">
                        <li className="flex justify-between">
                          <span className="text-zinc-600 dark:text-zinc-400">Total Links</span>
                          <span className="font-mono font-medium">{result.data.seo.linksCount}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-zinc-600 dark:text-zinc-400">Heading Tags (H1/H2)</span>
                          <span className="font-mono font-medium">{result.data.seo.h1Count} / {result.data.seo.h2Count}</span>
                        </li>
                         <li className="flex justify-between">
                          <span className="text-zinc-600 dark:text-zinc-400">Images</span>
                          <span className="font-mono font-medium">{result.data.seo.imagesCount}</span>
                        </li>
                      </ul>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Meta Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Search className="w-5 h-5 text-indigo-500" /> Meta Tags
                    </h3>
                    <div className="space-y-3">
                      <SeoItem label="Title" value={result.data.seo.title} />
                      <SeoItem label="Description" value={result.data.seo.description} />
                      <SeoItem label="Keywords" value={result.data.seo.keywords} />
                      <SeoItem label="Canonical" value={result.data.seo.canonical} isCode />
                      <SeoItem label="Viewport" value={result.data.seo.viewport} isCode />
                    </div>
                  </div>

                  {/* Social Preview */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-indigo-500" /> Social Preview
                    </h3>
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden max-w-sm mx-auto shadow-sm">
                      <div className="aspect-[1.91/1] bg-zinc-100 dark:bg-zinc-800 relative flex items-center justify-center overflow-hidden">
                        {result.data.seo.ogImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={result.data.seo.ogImage} alt="OG Preview" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-12 h-12 text-zinc-300" />
                        )}
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2">
                          {result.data.seo.ogTitle || result.data.seo.title || 'No Title'}
                        </div>
                        <div className="text-sm text-zinc-500 line-clamp-3">
                          {result.data.seo.ogDescription || result.data.seo.description || 'No description available.'}
                        </div>
                        <div className="text-xs text-zinc-400 mt-2 uppercase">
                          {new URL(result.data.seo.canonical || url || 'https://example.com').hostname}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Health Checks */}
                <div>
                   <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-indigo-500" /> Content Health
                    </h3>
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <HealthCard 
                        label="H1 Tag" 
                        valid={result.data.seo.h1Count > 0} 
                        details={`${result.data.seo.h1Count} found`} 
                      />
                      <HealthCard 
                        label="Meta Description" 
                        valid={!!result.data.seo.description} 
                        details={result.data.seo.description ? 'Present' : 'Missing'} 
                      />
                      <HealthCard 
                        label="Image Alt Text" 
                        valid={result.data.seo.imagesWithoutAlt === 0} 
                        warning={result.data.seo.imagesWithoutAlt > 0}
                        details={`${result.data.seo.imagesWithoutAlt} missing alt`} 
                      />
                       <HealthCard 
                        label="Internal Links" 
                        valid={result.data.seo.linksCount > 0} 
                        details={`${result.data.seo.linksCount} found`} 
                      />
                    </div>
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricCard label="TTFB" value={result.data.metrics.ttfb} unit="ms" icon={Activity} color="text-blue-500" />
                  <MetricCard label="FCP" value={result.data.metrics.fcp} unit="ms" icon={Gauge} color="text-green-500" />
                  <MetricCard label="DOM Load" value={result.data.metrics.domLoad} unit="ms" icon={Activity} color="text-amber-500" />
                  <MetricCard label="Total Duration" value={result.data.metrics.duration} unit="ms" icon={Activity} color="text-purple-500" />
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/20 flex gap-3 text-blue-800 dark:text-blue-300">
                  <Activity className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold mb-1">About Metrics</p>
                    <p>These metrics are captured from a real headless browser session on Cloudflare Workers. They represent the experience of a first-time visitor with an empty cache.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'console' && (
              <div className="bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden font-mono text-sm p-4 space-y-2 max-h-[600px] overflow-y-auto shadow-inner">
                {result.data.console.length === 0 ? (
                  <div className="text-zinc-600 italic flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> No console messages logged.
                  </div>
                ) : (
                  result.data.console.map((msg, i) => (
                    <div key={i} className="flex gap-3 border-b border-zinc-900 pb-2 last:border-0 last:pb-0 group">
                      <span className={`uppercase text-[10px] px-1.5 py-0.5 rounded font-bold h-fit mt-0.5 min-w-[50px] text-center ${
                        msg.type === 'error' ? 'bg-red-900/50 text-red-200' :
                        msg.type === 'warning' ? 'bg-yellow-900/50 text-yellow-200' :
                        'bg-zinc-800 text-zinc-300'
                      }`}>{msg.type}</span>
                      <div className="flex-1 min-w-0">
                         <div className="text-zinc-300 break-words whitespace-pre-wrap">{msg.text}</div>
                         {msg.location && msg.location !== 'unknown' && (
                            <div className="text-zinc-600 text-xs mt-1 truncate group-hover:text-zinc-500 transition-colors">{msg.location}</div>
                         )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Subcomponents ---

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
        active
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
      }`}
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  );
}

function MetricCard({ label, value, unit, icon: Icon, color }: { label: string; value: number; unit: string; icon: any; color: string }) {
  return (
    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
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

function SeoItem({ label, value, isCode }: { label: string; value: string | null; isCode?: boolean }) {
  return (
    <div className="group">
      <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">{label}</div>
      {value ? (
        <div className={`text-zinc-900 dark:text-zinc-100 break-words ${isCode ? 'font-mono text-xs bg-zinc-100 dark:bg-zinc-800 p-2 rounded-md' : 'text-sm'}`}>
          {value}
        </div>
      ) : (
        <div className="text-zinc-400 italic text-sm">Not found</div>
      )}
    </div>
  );
}

function StatusCard({ label, status, value }: { label: string; status: 'success' | 'warning' | 'error'; value: string }) {
  const colors = {
    success: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/30',
    error: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30'
  };
  
  return (
    <div className={`p-4 rounded-xl border ${colors[status]} flex items-center justify-between`}>
      <span className="font-medium">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function HealthCard({ label, valid, warning, details }: { label: string; valid: boolean; warning?: boolean; details: string }) {
  return (
    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-start gap-3">
      <div className={`mt-0.5 ${valid && !warning ? 'text-green-500' : warning ? 'text-yellow-500' : 'text-red-500'}`}>
        {valid && !warning ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
      </div>
      <div>
        <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{label}</div>
        <div className="text-xs text-zinc-500 mt-0.5">{details}</div>
      </div>
    </div>
  );
}
