'use client';

import { useState } from 'react';
import { ShieldCheck, ShieldAlert, Search, AlertCircle, Calendar, Lock, FileKey, Server } from 'lucide-react';

interface SslData {
  isValid: boolean;
  validationError: string | null;
  daysRemaining: number;
  validFrom: string;
  validTo: string;
  protocol: string;
  cipher: string;
  fingerprint: string;
  serialNumber: string;
  subject: { CN: string; O?: string; OU?: string };
  issuer: { CN: string; O?: string; C?: string };
  sans: string[];
}

// Helper type for the API response which might be data OR an error
type ApiResponse = SslData & { error?: string };

export default function SslInspector() {
  const [domain, setDomain] = useState('');
  const [data, setData] = useState<SslData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkSsl = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setData(null);

    try {
      const res = await fetch(`/api/ssl-check?host=${encodeURIComponent(domain)}`);
      
      // Safely cast the unknown JSON to our expected type
      const json = (await res.json()) as ApiResponse;
      
      if (!res.ok || json.error) {
         throw new Error(json.error || 'Failed to fetch SSL data');
      }
      
      setData(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to inspect certificate');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (data: SslData) => {
    if (!data.isValid) return 'text-red-600 dark:text-red-400';
    if (data.daysRemaining < 14) return 'text-amber-600 dark:text-amber-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getStatusBg = (data: SslData) => {
    if (!data.isValid) return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900';
    if (data.daysRemaining < 14) return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900';
    return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900';
  };

  return (
    <div className="space-y-12">
      {/* Input Section */}
      <div className="bg-white dark:bg-[#111] rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
        <form onSubmit={checkSsl} className="flex gap-4 max-w-3xl mx-auto mb-8">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            className="flex-1 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
          />
          <button
            disabled={loading || !domain}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {loading ? 'Scanning...' : <><Search size={20} /> Inspect</>}
          </button>
        </form>

        {error && (
          <div className="max-w-3xl mx-auto p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2 border border-red-100 dark:border-red-900/50">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {data && (
          <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-4">
            
            {/* Main Status Card */}
            <div className={`md:col-span-2 p-8 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-6 ${getStatusBg(data)}`}>
              <div className="flex items-center gap-5">
                <div className={`p-4 rounded-full bg-white/50 dark:bg-black/20 ${getStatusColor(data)}`}>
                  {data.isValid ? <ShieldCheck size={40} /> : <ShieldAlert size={40} />}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {data.subject.CN}
                    {data.isValid ? 
                      <span className="text-xs px-2 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-100 rounded-full">Trusted</span> : 
                      <span className="text-xs px-2 py-1 bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-100 rounded-full">Untrusted</span>
                    }
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                     Issued by <span className="font-semibold">{data.issuer.O || data.issuer.CN}</span>
                  </p>
                  {!data.isValid && data.validationError && (
                    <p className="text-red-600 dark:text-red-400 text-sm font-mono mt-2 bg-white/50 dark:bg-black/20 p-2 rounded">
                      Error: {data.validationError}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-center md:text-right">
                <div className={`text-4xl font-bold ${data.daysRemaining > 30 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {data.daysRemaining}
                </div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Days Left</p>
              </div>
            </div>

            {/* Validity Details */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
              <h4 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-4">
                <Calendar className="w-5 h-5 text-blue-500" /> Validity Period
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-500">Issued On</span>
                  <span className="font-mono font-medium">{new Date(data.validFrom).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-500">Expires On</span>
                  <span className="font-mono font-medium">{new Date(data.validTo).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Tech Details */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
              <h4 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-4">
                <Lock className="w-5 h-5 text-purple-500" /> Encryption
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-500">Protocol</span>
                  <span className="font-mono font-medium">{data.protocol}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-500">Cipher</span>
                  <span className="font-mono font-medium truncate max-w-[150px]" title={data.cipher}>{data.cipher}</span>
                </div>
              </div>
            </div>

             {/* SANs (Subject Alternative Names) */}
             <div className="md:col-span-2 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
               <h4 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-4">
                 <Server className="w-5 h-5 text-indigo-500" /> Subject Alternative Names (SANs)
               </h4>
               <div className="flex flex-wrap gap-2">
                 {data.sans.map((san, i) => (
                   <span key={i} className="px-3 py-1 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-full text-xs font-mono text-gray-600 dark:text-gray-300">
                     {san}
                   </span>
                 ))}
                 {data.sans.length === 0 && <span className="text-gray-500 italic">No alternative names found</span>}
               </div>
            </div>
            
            {/* Fingerprint */}
            <div className="md:col-span-2 p-6 bg-gray-900 text-gray-300 rounded-2xl font-mono text-xs break-all">
               <div className="flex items-center gap-2 text-gray-400 mb-2 font-sans font-bold text-sm">
                 <FileKey className="w-4 h-4" /> Certificate Fingerprint (SHA1)
               </div>
               {data.fingerprint}
            </div>
          </div>
        )}
      </div>

       {/* SEO Text */}
       <article className="prose prose-lg dark:prose-invert max-w-none bg-white dark:bg-[#111] p-8 md:p-12 rounded-3xl border border-gray-100 dark:border-gray-800">
        <h2>SSL Certificate Checker</h2>
        <p>
          Secure your website and build trust with visitors by validating your SSL/TLS configuration. 
          Our <strong>SSL Inspector</strong> performs a deep handshake analysis to verify certificate validity, 
          expiration dates, and chain of trust.
        </p>
      </article>
    </div>
  );
}
