'use client';

import { useState } from 'react';
import { Shield, ShieldAlert, CheckCircle, AlertTriangle, Search, Globe, Loader2 } from 'lucide-react';

interface BlacklistResult {
  status: 'listed' | 'not_listed' | 'errored';
  zone: string;
}

interface BlacklistResponse {
  results: BlacklistResult[];
  error?: string;
}

export default function BlacklistChecker() {
  const [domain, setDomain] = useState('');
  const [results, setResults] = useState<BlacklistResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const checkBlacklist = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults([]);
    setHasSearched(false);

    try {
      const res = await fetch(`/api/blacklist-check?domain=${encodeURIComponent(domain)}`);
      const json = (await res.json()) as BlacklistResponse;
      
      if (json.error) throw new Error(json.error);
      if (json.results) {
        setResults(json.results);
        setHasSearched(true);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to perform blacklist check';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const listedCount = results.filter(r => r.status === 'listed').length;

  return (
    <div className="space-y-12">
      {/* Search Section */}
      <div className="bg-white dark:bg-[#111] rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
        <form onSubmit={checkBlacklist} className="flex gap-4 max-w-3xl mx-auto mb-8">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            className="flex-1 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black focus:ring-4 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
          />
          <button
            disabled={loading || !domain}
            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><Search size={20} /> Scan</>}
          </button>
        </form>

        {error && (
          <div className="max-w-3xl mx-auto p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2 border border-red-100 dark:border-red-900/50">
            <ShieldAlert size={18} /> {error}
          </div>
        )}

        {/* Results Dashboard */}
        {hasSearched && (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 space-y-6">
            
            {/* Summary Card */}
            <div className={`p-6 rounded-2xl border flex items-center gap-6 ${
              listedCount > 0 
                ? 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/50' 
                : 'bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-900/50'
            }`}>
              <div className={`p-4 rounded-full ${
                listedCount > 0 ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
              }`}>
                {listedCount > 0 ? <ShieldAlert size={32} /> : <Shield size={32} />}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {listedCount > 0 ? `Listed on ${listedCount} Blacklists` : 'Clean Reputation'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We scanned {results.length} major DNSBL databases for {domain}.
                </p>
              </div>
            </div>

            {/* Detailed Grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((result, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 flex items-center justify-between group hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Globe size={16} className="text-gray-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate" title={result.zone}>
                      {result.zone}
                    </span>
                  </div>
                  
                  {result.status === 'listed' && (
                    <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded-md">
                      <ShieldAlert size={12} /> LISTED
                    </span>
                  )}
                  {result.status === 'not_listed' && (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-md">
                      <CheckCircle size={12} /> CLEAN
                    </span>
                  )}
                  {result.status === 'errored' && (
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded-md">
                      <AlertTriangle size={12} /> ERROR
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SEO Content */}
      <article className="prose prose-lg dark:prose-invert max-w-none bg-white dark:bg-[#111] p-8 md:p-12 rounded-3xl border border-gray-100 dark:border-gray-800">
        <h2>Email Blacklist Checker</h2>
        <p>
          Is your domain flagged as spam? Use our <strong>IP & Domain Blacklist Checker</strong> to scan over 15 major Real-time Blackhole Lists (RBLs) and DNSBLs. 
          Being listed can result in your emails bouncing or landing in the spam folder.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 my-8 not-prose">
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
            <h3 className="font-bold text-red-900 dark:text-red-100 mb-2">Impact of Blacklisting</h3>
            <p className="text-sm text-red-800 dark:text-red-200">
              A single listing can drop your email deliverability rate below 50%. Regular scans help you catch reputation issues before they affect your business.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
            <h3 className="font-bold text-green-900 dark:text-green-100 mb-2">How to De-list?</h3>
            <p className="text-sm text-green-800 dark:text-green-200">
              If listed, contact the specific blacklist operator (e.g., SpamHaus, SpamEatingMonkey) and follow their removal request procedure immediately.
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}
