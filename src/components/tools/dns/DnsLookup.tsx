'use client';

import React, { useState } from 'react';
import { Globe, Search, Loader2, AlertCircle } from 'lucide-react';

export default function DnsLookupTool() {
  const [domain, setDomain] = useState('');
  const [recordType, setRecordType] = useState('A');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain) return;
    
    setLoading(true);
    setResult(null);
    setError('');

    try {
      const res = await fetch('/api/dns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, type: recordType }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || 'Failed to fetch records');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-4">
          <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">DNS Propagation Check</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Instant global DNS record lookup using Cloudflare Edge Network.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-2 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 max-w-2xl mx-auto">
        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-2">
          <input 
            type="text" 
            placeholder="example.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="flex-1 px-4 py-3 bg-transparent rounded-xl outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400"
          />
          <select 
            value={recordType}
            onChange={(e) => setRecordType(e.target.value)}
            className="bg-zinc-100 dark:bg-zinc-800 rounded-xl px-4 py-3 font-medium cursor-pointer"
          >
            {['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>
        </form>
      </div>

      {(result || error) && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4">
          {error ? (
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="font-semibold text-zinc-500 text-sm uppercase tracking-wider">Results ({recordType})</h3>
              <pre className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl overflow-x-auto text-sm font-mono text-zinc-800 dark:text-zinc-200">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
