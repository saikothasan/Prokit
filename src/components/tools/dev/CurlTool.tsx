'use client';

import React, { useState } from 'react';
import { Terminal, Play, Plus, Trash2, Clock, Copy } from 'lucide-react';

interface HeaderItem {
  key: string;
  value: string;
}

interface CurlResponse {
  success: boolean;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  timing: { duration: number };
  error?: string;
  details?: string;
}

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

export default function CurlTool() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [reqHeaders, setReqHeaders] = useState<HeaderItem[]>([{ key: '', value: '' }]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<CurlResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'response' | 'headers'>('response');

  const addHeader = () => setReqHeaders([...reqHeaders, { key: '', value: '' }]);
  const removeHeader = (index: number) => setReqHeaders(reqHeaders.filter((_, i) => i !== index));
  
  const updateHeader = (index: number, field: 'key' | 'value', val: string) => {
    const newHeaders = [...reqHeaders];
    // FIX: Ensure the item exists before assignment to satisfy TypeScript
    if (newHeaders[index]) {
      newHeaders[index][field] = val;
      setReqHeaders(newHeaders);
    }
  };

  // Generate the actual curl command string for display
  const generateCurlCommand = () => {
    let cmd = `curl -X ${method} "${url || 'https://example.com'}"`;
    reqHeaders.forEach(h => {
      if (h.key && h.value) cmd += ` \\\n  -H "${h.key}: ${h.value}"`;
    });
    if (body && method !== 'GET') {
      cmd += ` \\\n  -d '${body.replace(/'/g, "'\\''")}'`;
    }
    return cmd;
  };

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setResponse(null);

    // Filter empty headers and convert to object
    const headersObj: Record<string, string> = {};
    reqHeaders.forEach(h => {
      if (h.key.trim()) headersObj[h.key] = h.value;
    });

    try {
      const res = await fetch('/api/curl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method,
          url,
          headers: headersObj,
          body: (method !== 'GET' && method !== 'HEAD') ? body : undefined
        }),
      });
      
      const data = (await res.json()) as CurlResponse;
      setResponse(data);

    } catch (err) {
      console.error(err);
      alert('Failed to execute request');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-500 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900';
    if (status >= 300 && status < 400) return 'text-blue-500 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900';
    if (status >= 400 && status < 500) return 'text-orange-500 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900';
    return 'text-red-500 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl mb-4">
          <Terminal className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">Curl Runner</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Test APIs directly from the Cloudflare Edge. Inspect headers, response times, and payloads.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Col: Request Builder */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
            <form onSubmit={handleRun} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Method & URL</label>
                <div className="flex gap-2">
                  <select 
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 font-mono text-sm outline-none border border-transparent focus:border-emerald-500"
                  >
                    {METHODS.map(m => <option key={m}>{m}</option>)}
                  </select>
                  <input 
                    type="url" 
                    required
                    placeholder="https://api.example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 font-mono text-sm outline-none border border-transparent focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Headers</label>
                  <button type="button" onClick={addHeader} className="text-emerald-600 text-xs hover:underline flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                  {reqHeaders.map((h, i) => (
                    <div key={i} className="flex gap-2">
                      <input 
                        placeholder="Key"
                        value={h.key}
                        onChange={(e) => updateHeader(i, 'key', e.target.value)}
                        className="w-1/3 bg-zinc-50 dark:bg-zinc-800/50 rounded px-2 py-1.5 text-xs font-mono outline-none border border-zinc-200 dark:border-zinc-700 focus:border-emerald-500"
                      />
                      <input 
                        placeholder="Value"
                        value={h.value}
                        onChange={(e) => updateHeader(i, 'value', e.target.value)}
                        className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 rounded px-2 py-1.5 text-xs font-mono outline-none border border-zinc-200 dark:border-zinc-700 focus:border-emerald-500"
                      />
                      {reqHeaders.length > 1 && (
                        <button type="button" onClick={() => removeHeader(i)} className="text-zinc-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {method !== 'GET' && method !== 'HEAD' && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Body</label>
                  <textarea 
                    rows={5}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 font-mono text-xs outline-none border border-transparent focus:border-emerald-500 resize-none"
                    placeholder='{"key": "value"}'
                  />
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : <Play className="w-4 h-4 fill-current" />}
                Run Request
              </button>
            </form>
          </div>
          
          {/* Curl Command Preview */}
          <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 shadow-sm relative group">
             <button 
                onClick={() => navigator.clipboard.writeText(generateCurlCommand())}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
             >
               <Copy className="w-4 h-4" />
             </button>
             <pre className="text-xs text-zinc-400 font-mono whitespace-pre-wrap break-all overflow-hidden">
               {generateCurlCommand()}
             </pre>
          </div>
        </div>

        {/* Right Col: Response Viewer */}
        <div className="lg:col-span-2 h-full min-h-[500px]">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 h-full flex flex-col shadow-sm overflow-hidden">
            {response ? (
              <>
                {/* Status Bar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900">
                  <div className="flex items-center gap-4">
                     <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(response.status)}`}>
                       {response.status} {response.statusText}
                     </span>
                     <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                       <Clock className="w-3.5 h-3.5" /> {response.timing.duration}ms
                     </span>
                  </div>
                  <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                    <button 
                      onClick={() => setActiveTab('response')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'response' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                    >
                      Body
                    </button>
                    <button 
                      onClick={() => setActiveTab('headers')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'headers' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                    >
                      Headers
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto custom-scrollbar p-0 relative">
                  {activeTab === 'response' ? (
                     <pre className="p-6 text-sm font-mono text-zinc-800 dark:text-zinc-300 whitespace-pre-wrap">
                       {response.body || <span className="text-zinc-400 italic">No content</span>}
                     </pre>
                  ) : (
                    <div className="p-0">
                      <table className="w-full text-left border-collapse">
                        <tbody>
                          {Object.entries(response.headers).map(([k, v], i) => (
                            <tr key={k} className={`border-b border-zinc-100 dark:border-zinc-800/50 ${i % 2 === 0 ? 'bg-zinc-50/50 dark:bg-zinc-900' : ''}`}>
                              <td className="py-3 px-6 text-xs font-semibold text-zinc-500 font-mono w-1/3 border-r border-zinc-100 dark:border-zinc-800/50">{k}</td>
                              <td className="py-3 px-6 text-xs text-zinc-700 dark:text-zinc-300 font-mono break-all">{v}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 space-y-4">
                 {loading ? (
                   <div className="flex flex-col items-center gap-3">
                     <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                     <p className="text-sm font-medium animate-pulse">Sending Request...</p>
                   </div>
                 ) : (
                   <>
                     <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                       <Play className="w-6 h-6 text-zinc-300 ml-1" />
                     </div>
                     <p>Enter a URL and click Run to see the response.</p>
                   </>
                 )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
