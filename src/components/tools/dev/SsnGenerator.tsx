'use client';

import { useState } from 'react';
import { RefreshCw, Copy, Check, ShieldCheck, AlertTriangle, List } from 'lucide-react';

interface GeneratedSSN {
  value: string;
  area: string;
  group: string;
  serial: string;
}

export default function SsnGenerator() {
  const [ssns, setSsns] = useState<GeneratedSSN[]>([]);
  const [count, setCount] = useState(1);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Helper: Generate a random integer between min and max (inclusive)
  const randomInt = (min: number, max: number) => 
    Math.floor(Math.random() * (max - min + 1)) + min;

  // Pad numbers with leading zeros
  const pad = (num: number, size: number) => num.toString().padStart(size, '0');

  const generateSSN = (): GeneratedSSN => {
    // 1. Area Number (AAA): 001-899
    // Exclusions: 000, 666, 900-999
    let area = randomInt(1, 899);
    while (area === 666) {
      area = randomInt(1, 899);
    }

    // 2. Group Number (GG): 01-99
    // Exclusions: 00
    const group = randomInt(1, 99);

    // 3. Serial Number (SSSS): 0001-9999
    // Exclusions: 0000
    const serial = randomInt(1, 9999);

    const areaStr = pad(area, 3);
    const groupStr = pad(group, 2);
    const serialStr = pad(serial, 4);

    return {
      value: `${areaStr}-${groupStr}-${serialStr}`,
      area: areaStr,
      group: groupStr,
      serial: serialStr
    };
  };

  const handleGenerate = () => {
    const newSsns = Array.from({ length: count }, () => generateSSN());
    setSsns(newSsns);
    setCopiedAll(false);
    setCopiedIndex(null);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAll = () => {
    const text = ssns.map(s => s.value).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="bg-white dark:bg-[#111] rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1 space-y-2 w-full">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Quantity to Generate
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <button
            onClick={handleGenerate}
            className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw size={20} /> Generate SSNs
          </button>
        </div>
      </div>

      {/* Results */}
      {ssns.length > 0 && (
        <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
            <h3 className="font-bold flex items-center gap-2">
              <List size={18} /> Generated Identifiers
            </h3>
            <button
              onClick={copyAll}
              className="text-sm flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              {copiedAll ? <Check size={16} /> : <Copy size={16} />}
              Copy All
            </button>
          </div>
          
          <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[500px] overflow-y-auto">
            {ssns.map((ssn, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors group">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xl text-gray-900 dark:text-gray-100 tracking-wide">
                    {ssn.value}
                  </span>
                  <div className="hidden sm:flex gap-2 text-xs text-gray-400">
                     <span title="Area Number">A: {ssn.area}</span>
                     <span title="Group Number">G: {ssn.group}</span>
                     <span title="Serial Number">S: {ssn.serial}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="hidden sm:flex items-center gap-1 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                    <ShieldCheck size={12} /> Valid Format
                  </span>
                  <button
                    onClick={() => copyToClipboard(ssn.value, idx)}
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                    title="Copy SSN"
                  >
                    {copiedIndex === idx ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Section */}
      <article className="prose prose-lg dark:prose-invert max-w-none bg-white dark:bg-[#111] p-8 md:p-12 rounded-3xl border border-gray-100 dark:border-gray-800">
        <h2>About SSN Generation</h2>
        <p>
          This tool generates <strong>random, validly formatted</strong> US Social Security Numbers for testing and development purposes. 
          The logic adheres to the standard structure and exclusions mandated by the SSA.
        </p>

        <div className="grid md:grid-cols-2 gap-6 my-8 not-prose">
          <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/50">
            <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
              <ShieldCheck size={20} /> Valid Structure
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li>• <strong>Area (AAA):</strong> 001-899 (Excludes 666, 900-999)</li>
              <li>• <strong>Group (GG):</strong> 01-99 (Excludes 00)</li>
              <li>• <strong>Serial (SSSS):</strong> 0001-9999 (Excludes 0000)</li>
            </ul>
          </div>
          
          <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/50">
            <h3 className="font-bold text-amber-900 dark:text-amber-100 mb-3 flex items-center gap-2">
              <AlertTriangle size={20} /> Important Disclaimer
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              These numbers are <strong>mathematically valid</strong> but randomly generated. 
              They should <strong>never</strong> be used for illegal activity or identity fraud. 
              These are strictly for database testing, QA, and development environments.
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}
