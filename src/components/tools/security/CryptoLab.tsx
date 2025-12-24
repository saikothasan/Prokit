'use client';

import { useState } from 'react';
import { Key, Copy, RefreshCw } from 'lucide-react';

export default function CryptoLab() {
  const [type, setType] = useState('rsa');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const res = await fetch('/api/crypto-lab', {
      method: 'POST',
      body: JSON.stringify({ type, length: 2048 })
    });
    setResult(await res.json());
    setLoading(false);
  };

  const copy = (text: string) => navigator.clipboard.writeText(text);

  return (
    <div className="space-y-6">
      <div className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <select 
          value={type} 
          onChange={(e) => setType(e.target.value)}
          className="bg-white dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700 outline-none"
        >
          <option value="rsa">RSA Key Pair (2048-bit)</option>
          <option value="api-key">API Key (Hex)</option>
          <option value="secret">JWT Secret (Base64)</option>
        </select>
        <button onClick={generate} disabled={loading} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center gap-2">
          {loading ? <RefreshCw className="animate-spin" size={16} /> : <Key size={16} />} Generate
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          {result.publicKey && (
            <div className="relative group">
              <label className="text-xs font-bold text-gray-500 uppercase">Public Key</label>
              <pre className="p-4 bg-gray-900 text-green-400 rounded-lg text-xs overflow-x-auto mt-1">
                {result.publicKey}
              </pre>
              <button onClick={() => copy(result.publicKey)} className="absolute top-8 right-2 p-2 bg-gray-800 text-white rounded hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition">
                <Copy size={14} />
              </button>
            </div>
          )}
          {result.privateKey && (
             <div className="relative group">
              <label className="text-xs font-bold text-gray-500 uppercase">Private Key</label>
              <pre className="p-4 bg-gray-900 text-red-400 rounded-lg text-xs overflow-x-auto mt-1">
                {result.privateKey}
              </pre>
               <button onClick={() => copy(result.privateKey)} className="absolute top-8 right-2 p-2 bg-gray-800 text-white rounded hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition">
                <Copy size={14} />
              </button>
            </div>
          )}
          {result.key && (
             <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg flex justify-between items-center">
                <code className="text-lg font-mono text-blue-600 dark:text-blue-400">{result.key}</code>
                <button onClick={() => copy(result.key)}><Copy size={18} className="text-gray-400 hover:text-gray-600" /></button>
             </div>
          )}
           {result.secret && (
             <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg flex justify-between items-center">
                <code className="text-sm font-mono break-all text-purple-600 dark:text-purple-400">{result.secret}</code>
                <button onClick={() => copy(result.secret)}><Copy size={18} className="text-gray-400 hover:text-gray-600" /></button>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
