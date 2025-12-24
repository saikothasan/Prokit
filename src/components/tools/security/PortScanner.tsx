'use client';

import { useState } from 'react';
import { Activity, Server, Lock, Unlock } from 'lucide-react';

export default function PortScanner() {
  const [host, setHost] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const scan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResults([]);
    
    try {
      const res = await fetch(`/api/port-scan?host=${host}`);
      const data = await res.json();
      if (data.results) setResults(data.results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={scan} className="flex gap-4">
        <input
          value={host}
          onChange={(e) => setHost(e.target.value)}
          placeholder="Enter IP or Domain (e.g., 8.8.8.8)"
          className="flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button disabled={loading || !host} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Scanning...' : 'Scan Ports'}
        </button>
      </form>

      {results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {results.map((r) => (
            <div key={r.port} className={`p-4 rounded-xl border flex items-center justify-between ${
              r.status === 'open' 
                ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800' 
                : 'bg-gray-50 border-gray-200 text-gray-500 dark:bg-gray-800/50 dark:border-gray-800'
            }`}>
              <div className="flex items-center gap-3">
                {r.status === 'open' ? <Unlock size={18} /> : <Lock size={18} />}
                <div>
                  <div className="font-bold text-lg">{r.port}</div>
                  <div className="text-xs uppercase opacity-75">{r.service}</div>
                </div>
              </div>
              <span className="text-sm font-medium capitalize">{r.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
