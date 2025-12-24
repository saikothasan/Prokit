'use client';

import { useState } from 'react';
import { ShieldCheck, Search, AlertCircle, CheckCircle } from 'lucide-react';

export default function SslInspector() {
  const [domain, setDomain] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkSsl = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setData(null);

    try {
      const res = await fetch(`/api/ssl-check?host=${encodeURIComponent(domain)}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Failed to inspect certificate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={checkSsl} className="flex gap-4">
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="example.com"
          className="flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button
          disabled={loading || !domain}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? 'Scanning...' : <><Search size={18} /> Inspect</>}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {data && (
        <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-4">
          {/* Status Card */}
          <div className="md:col-span-2 p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${data.days_remaining > 30 ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                <ShieldCheck size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold">{data.subject.CN}</h3>
                <p className="text-sm text-gray-500">Issued by {data.issuer.O}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{data.days_remaining} Days</div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Remaining</p>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4">
            <h4 className="font-semibold text-gray-500 uppercase text-xs">Validity</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">Issued On</span>
                <span className="font-mono">{new Date(data.valid_from).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">Expires On</span>
                <span className="font-mono">{new Date(data.valid_to).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4">
            <h4 className="font-semibold text-gray-500 uppercase text-xs">Technical</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">Protocol</span>
                <span className="font-mono">{data.protocol}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">Cipher</span>
                <span className="font-mono">{data.cipher}</span>
              </div>
               <div className="flex flex-col py-2">
                <span className="text-gray-500 mb-1">Fingerprint</span>
                <span className="font-mono text-xs break-all text-gray-400">{data.fingerprint}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
