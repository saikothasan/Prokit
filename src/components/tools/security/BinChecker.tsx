'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

// 1. Define the response type
interface BinData {
  bin: string;
  brand: string;
  type: string;
  category: string;
  issuer: string;
  issuer_phone: string;
  issuer_url: string;
  country: {
    name: string;
    iso2: string;
    iso3: string;
  };
}

export default function BinChecker() {
  const [bin, setBin] = useState('');
  // 2. Type the state
  const [data, setData] = useState<BinData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheck = async () => {
    setLoading(true);
    setError('');
    setData(null);
    
    try {
      const res = await fetch(`/api/bin-checker?bin=${bin}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch');
      setData(json.data);
    } catch (err) {
      // 3. Type the error check
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
    <div className="max-w-xl mx-auto">
      <div className="flex gap-2 mb-8">
        <input
          value={bin}
          onChange={(e) => setBin(e.target.value)}
          placeholder="Enter first 6 digits (e.g. 453211)"
          maxLength={8}
          className="flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent"
        />
        <button 
          onClick={handleCheck}
          disabled={loading || bin.length < 6}
          className="bg-black dark:bg-white text-white dark:text-black px-6 rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Search className="w-4 h-4" />}
          Check
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}

      {data && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          {/* 4. Use specific rendering instead of Object.entries map with 'any' */}
          <ResultItem label="Brand" value={data.brand} />
          <ResultItem label="Type" value={data.type} />
          <ResultItem label="Category" value={data.category} />
          <ResultItem label="Issuer" value={data.issuer} />
          <ResultItem label="Country" value={data.country.name} />
          <ResultItem label="ISO Code" value={data.country.iso2} />
        </div>
      )}
    </div>
  );
}

// Helper component to avoid 'any' mapping
function ResultItem({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
      <div className="text-gray-500 uppercase text-xs font-bold mb-1">{label}</div>
      <div className="font-mono font-medium">{value}</div>
    </div>
  );
}
