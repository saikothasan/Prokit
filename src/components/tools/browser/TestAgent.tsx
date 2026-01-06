'use client';

import React, { useState, useMemo } from 'react';
import {
  Play,
  Loader2,
  AlertCircle,
  Globe,
  Gauge,
  Activity,
  Terminal,
  Layout,
  Search,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  Share2,
  Maximize,
  ShieldCheck,
  Smartphone,
  Monitor,
  PieChart as PieChartIcon,
  Accessibility,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

// --- Types ---

interface TestResult {
  success: boolean;
  testId: string;
  device: 'desktop' | 'mobile';
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
      robots: string | null;
      generator: string | null;
      h1Count: number;
      h2Count: number;
      linksCount: number;
      viewport: string | null;
      canonical: string | null;
      ogTitle: string | null;
      ogDescription: string | null;
      ogImage: string | null;
    };
    accessibility: {
      htmlLang: string | null;
      buttonsWithoutLabel: number;
      inputsWithoutLabel: number;
      imagesWithoutAlt: number;
      headingsOrder: boolean;
    };
    security: {
      csp: boolean;
      hsts: boolean;
      xFrameOptions: string | null;
      xContentTypeOptions: boolean;
      referrerPolicy: string | null;
      permissionsPolicy: boolean;
    };
    resources: {
      totalSize: number;
      totalCount: number;
      breakdown: Record<string, { count: number; size: number }>;
    };
    console: { type: string; text: string; location?: string }[];
  };
}

interface ErrorResponse {
  error?: string;
}

type Tab = 'overview' | 'seo' | 'resources' | 'performance' | 'security' | 'console';

type DeviceType = 'desktop' | 'mobile';

const RESOURCE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-zinc-900 p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl text-sm">
        <p className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{data.full || label}</p>
        <div className="space-y-1">
          <p className="text-zinc-600 dark:text-zinc-400">
            Value: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {typeof data.value === 'number' && data.value > 1000
               ? `${(data.value / 1024).toFixed(1)} KB`
               : `${data.value.toFixed(0)} ${data.full ? 'ms' : 'bytes'}`}
            </span>
          </p>
          {data.count && (
             <p className="text-zinc-500">Count: {data.count}</p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export default function TestAgent() {
  const [url, setUrl] = useState('');
  const [device, setDevice] = useState<DeviceType>('desktop');
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
        body: JSON.stringify({ url: targetUrl, device }),
      });

      const data = (await res.json()) as unknown;

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

  // --- Chart Data Preparation ---

  const perfChartData = useMemo(() => result
    ? [
        { name: 'TTFB', value: result.data.metrics.ttfb, fill: '#3b82f6', full: 'Time to First Byte' },
        { name: 'FCP', value: result.data.metrics.fcp, fill: '#22c55e', full: 'First Contentful Paint' },
        { name: 'DOM', value: result.data.metrics.domLoad, fill: '#f59e0b', full: 'DOM Content Loaded' },
        { name: 'Load', value: result.data.metrics.windowLoad, fill: '#ec4899', full: 'Window Load' },
      ]
    : [], [result]);

  const resourceChartData = useMemo(() => result
    ? Object.entries(result.data.resources.breakdown)
        .filter(([, data]) => data.size > 0)
        .map(([key, data]) => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          value: data.size,
          count: data.count,
        }))
    : [], [result]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-center gap-3">
          <Globe className="w-8 h-8 text-indigo-600" />
          Prokit Browser Agent
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Full-stack website analysis. Audits Performance, SEO, Security headers, and Accessibility
          using a real headless browser.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
        <form onSubmit={runTest} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Enter website URL (e.g., example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 pl-11 focus:ring-2 focus:ring-indigo-500 outline-none w-full transition-all"
            />
            <Search className="w-5 h-5 text-zinc-400 absolute left-3.5 top-3.5" />
          </div>
          
          {/* Device Toggle */}
          <div className="bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl flex items-center border border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setDevice('desktop')}
              className={`p-2.5 rounded-lg transition-all ${device === 'desktop' ? 'bg-white dark:bg-zinc-700 shadow-sm text-indigo-600' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
              title="Desktop Mode"
            >
              <Monitor className="w-5 h-5" />
            </button>
             <button
              type="button"
              onClick={() => setDevice('mobile')}
              className={`p-2.5 rounded-lg transition-all ${device === 'mobile' ? 'bg-white dark:bg-zinc-700 shadow-sm text-indigo-600' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
              title="Mobile Mode"
            >
              <Smartphone className="w-5 h-5" />
            </button>
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
            <TabButton active={activeTab === 'seo'} onClick={() => setActiveTab('seo')} icon={Search} label="SEO & Accessibility" />
            <TabButton active={activeTab === 'performance'} onClick={() => setActiveTab('performance')} icon={Activity} label="Performance" />
            <TabButton active={activeTab === 'resources'} onClick={() => setActiveTab('resources')} icon={PieChartIcon} label="Resources" />
            <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={ShieldCheck} label="Security" />
            <TabButton active={activeTab === 'console'} onClick={() => setActiveTab('console')} icon={Terminal} label={`Console (${result.data.console.length})`} />
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'overview' && (
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                   <div className="bg-zinc-100 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden relative group shadow-sm flex items-center justify-center p-4">
                    {/* Responsive Container based on Device */}
                    <div className={`relative shadow-2xl transition-all duration-500 ${result.device === 'mobile' ? 'w-[30%] border-4 border-zinc-800 rounded-3xl overflow-hidden bg-black' : 'w-full aspect-video rounded-lg overflow-hidden border border-zinc-200'}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={result.urls.screenshot} alt="Site Screenshot" className="w-full h-full object-contain bg-white" />
                    </div>
                    
                    <div className="absolute inset-0 pointer-events-none flex items-end justify-center pb-4">
                      <a href={result.urls.screenshot} target="_blank" rel="noopener noreferrer" className="pointer-events-auto text-white flex items-center gap-2 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full hover:bg-black/80 transition-all text-sm font-medium">
                        <Maximize className="w-4 h-4" /> View Original
                      </a>
                    </div>
                  </div>
                  
                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <StatusCard 
                      label="HTTPS" 
                      status={result.data.security.hsts ? 'success' : 'warning'} 
                      value={result.data.security.hsts ? 'HSTS Active' : 'Standard'} 
                    />
                    <StatusCard 
                      label="Mobile Friendly" 
                      status={result.data.seo.viewport ? 'success' : 'error'} 
                      value={result.data.seo.viewport ? 'Yes' : 'No Viewport'} 
                    />
                  </div>
                </div>

                <div className="space-y-6">
                   <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                     <Activity className="w-5 h-5 text-indigo-500" />
                     Performance Snapshot
                   </h3>
                   <div className="grid grid-cols-2 gap-4">
                      <MetricCard label="TTFB" value={result.data.metrics.ttfb} unit="ms" icon={Activity} color="text-blue-500" />
                      <MetricCard label="FCP" value={result.data.metrics.fcp} unit="ms" icon={Gauge} color="text-green-500" />
                      <MetricCard label="Page Size" value={result.data.resources.totalSize / 1024} unit="KB" icon={PieChartIcon} color="text-amber-500" />
                      <MetricCard label="Requests" value={result.data.resources.totalCount} unit="" icon={Activity} color="text-purple-500" />
                   </div>
                   
                   <div className="bg-zinc-50 dark:bg-zinc-900/50 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <h4 className="text-sm font-medium text-zinc-500 mb-3 uppercase tracking-wider">Health Scorecard</h4>
                      <div className="space-y-3">
                         <HealthRow label="Console Errors" count={result.data.console.filter(l => l.type === 'error').length} inverse />
                         <HealthRow label="Missing Alt Tags" count={result.data.accessibility.imagesWithoutAlt} inverse />
                         <HealthRow label="Security Headers" count={Object.values(result.data.security).filter(x => x).length} total={6} />
                      </div>
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
                      <SeoItem label="Robots" value={result.data.seo.robots} isCode />
                      <SeoItem label="Canonical" value={result.data.seo.canonical} isCode />
                    </div>
                  </div>

                  {/* Accessibility Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Accessibility className="w-5 h-5 text-indigo-500" /> Accessibility
                    </h3>
                    <div className="grid gap-4">
                      <HealthCard 
                         label="HTML Lang Attribute" 
                         valid={!!result.data.accessibility.htmlLang} 
                         details={result.data.accessibility.htmlLang ? `Found: "${result.data.accessibility.htmlLang}"` : 'Missing lang attribute'} 
                      />
                      <HealthCard 
                         label="Image Alt Text" 
                         valid={result.data.accessibility.imagesWithoutAlt === 0} 
                         warning={result.data.accessibility.imagesWithoutAlt > 0}
                         details={`${result.data.accessibility.imagesWithoutAlt} images missing alt text`} 
                      />
                       <HealthCard 
                         label="Interactive Labels" 
                         valid={result.data.accessibility.buttonsWithoutLabel === 0 && result.data.accessibility.inputsWithoutLabel === 0} 
                         warning={result.data.accessibility.buttonsWithoutLabel > 0}
                         details={`${result.data.accessibility.buttonsWithoutLabel + result.data.accessibility.inputsWithoutLabel} unlabeled inputs/buttons`} 
                      />
                    </div>
                  </div>
                </div>

                {/* Social Preview */}
                <div className="border-t border-zinc-200 dark:border-zinc-800 pt-8">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                      <Share2 className="w-5 h-5 text-indigo-500" /> Social Preview (OG Tags)
                    </h3>
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                         <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden w-full max-w-md shadow-sm">
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
                         <div className="flex-1 space-y-3">
                             <SeoItem label="OG Title" value={result.data.seo.ogTitle} />
                             <SeoItem label="OG Description" value={result.data.seo.ogDescription} />
                             <SeoItem label="OG Image" value={result.data.seo.ogImage} isCode />
                         </div>
                    </div>
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-8">
                {/* Visual Chart Section */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <h3 className="text-lg font-semibold mb-6 text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-500" />
                    Load Timing (ms)
                  </h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={perfChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} opacity={0.2} />
                        <XAxis dataKey="name" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12 }} tickLine={false} axisLine={false} />
                        <YAxis stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12 }} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} animationDuration={1500}>
                          {perfChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricCard label="TTFB" value={result.data.metrics.ttfb} unit="ms" icon={Activity} color="text-blue-500" />
                  <MetricCard label="FCP" value={result.data.metrics.fcp} unit="ms" icon={Gauge} color="text-green-500" />
                  <MetricCard label="DOM Load" value={result.data.metrics.domLoad} unit="ms" icon={Activity} color="text-amber-500" />
                  <MetricCard label="Total Duration" value={result.data.metrics.duration} unit="ms" icon={Activity} color="text-purple-500" />
                </div>
              </div>
            )}

            {activeTab === 'resources' && (
                 <div className="grid md:grid-cols-2 gap-8 items-start">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm h-[400px]">
                        <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <PieChartIcon className="w-5 h-5 text-indigo-500" /> Resource Breakdown (Size)
                        </h3>
                        <ResponsiveContainer width="100%" height="100%">
                             <PieChart>
                                <Pie
                                    data={resourceChartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {resourceChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={RESOURCE_COLORS[index % RESOURCE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                             </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-4">
                         <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Asset Details</h3>
                         <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                             <table className="w-full text-sm text-left">
                                 <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-medium">
                                     <tr>
                                         <th className="px-4 py-3">Type</th>
                                         <th className="px-4 py-3 text-right">Requests</th>
                                         <th className="px-4 py-3 text-right">Size</th>
                                     </tr>
                                 </thead>
                                 <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                     {resourceChartData.map((item, idx) => (
                                         <tr key={item.name} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                             <td className="px-4 py-3 flex items-center gap-2">
                                                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: RESOURCE_COLORS[idx % RESOURCE_COLORS.length] }} />
                                                 {item.name}
                                             </td>
                                             <td className="px-4 py-3 text-right font-mono">{item.count}</td>
                                             <td className="px-4 py-3 text-right font-mono text-indigo-600 dark:text-indigo-400">
                                                 {(item.value / 1024).toFixed(1)} KB
                                             </td>
                                         </tr>
                                     ))}
                                     <tr className="bg-zinc-50 dark:bg-zinc-800/50 font-semibold">
                                         <td className="px-4 py-3">Total</td>
                                         <td className="px-4 py-3 text-right">{result.data.resources.totalCount}</td>
                                         <td className="px-4 py-3 text-right">{(result.data.resources.totalSize / 1024).toFixed(1)} KB</td>
                                     </tr>
                                 </tbody>
                             </table>
                         </div>
                    </div>
                 </div>
            )}

            {activeTab === 'security' && (
                <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                         <HealthCard 
                            label="SSL / HSTS" 
                            valid={result.data.security.hsts} 
                            details={result.data.security.hsts ? 'Strict-Transport-Security Header found' : 'HSTS Header missing'} 
                        />
                         <HealthCard 
                            label="Content Security Policy" 
                            valid={result.data.security.csp} 
                            warning={!result.data.security.csp}
                            details={result.data.security.csp ? 'CSP Header configured' : 'Recommended to prevent XSS'} 
                        />
                         <HealthCard 
                            label="X-Frame-Options" 
                            valid={!!result.data.security.xFrameOptions} 
                            details={result.data.security.xFrameOptions ? `Set to: ${result.data.security.xFrameOptions}` : 'Missing (Clickjacking risk)'} 
                        />
                         <HealthCard 
                            label="X-Content-Type-Options" 
                            valid={result.data.security.xContentTypeOptions} 
                            details={result.data.security.xContentTypeOptions ? 'nosniff is active' : 'Missing'} 
                        />
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/20 text-sm text-blue-800 dark:text-blue-300 flex gap-3">
                         <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                         <div>
                             <p className="font-semibold mb-1">Why these headers matter?</p>
                             <p>Security headers tell the browser how to behave when handling your site&apos;s content. They are the first line of defense against XSS, Clickjacking, and other code injection attacks.</p>
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

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: React.ElementType; label: string }) {
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

function MetricCard({ label, value, unit, icon: Icon, color }: { label: string; value: number; unit: string; icon: React.ElementType; color: string }) {
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

function HealthRow({ label, count, total, inverse }: { label: string; count: number; total?: number; inverse?: boolean }) {
  const isGood = inverse ? count === 0 : (total ? count === total : count > 0);
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-zinc-600 dark:text-zinc-400">{label}</span>
      <div className={`flex items-center gap-1.5 font-medium ${isGood ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
         {isGood ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
         <span>{count} {total ? `/ ${total}` : ''}</span>
      </div>
    </div>
  );
}
