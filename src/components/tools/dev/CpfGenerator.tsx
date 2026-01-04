'use client';

import { useState } from 'react';
import { RefreshCw, Copy, Check, ShieldCheck, AlertTriangle, List, MapPin } from 'lucide-react';

interface GeneratedCPF {
  value: string;
  unformatted: string;
  regionCode: number;
  regionName: string;
}

// Fiscal Regions mapping (9th digit)
const REGIONS: Record<number, string> = {
  1: 'DF, GO, MS, MT, TO',
  2: 'AC, AM, AP, PA, RO, RR',
  3: 'CE, MA, PI',
  4: 'AL, PB, PE, RN',
  5: 'BA, SE',
  6: 'MG',
  7: 'ES, RJ',
  8: 'SP',
  9: 'PR, SC',
  0: 'RS'
};

export default function CpfGenerator() {
  const [cpfs, setCpfs] = useState<GeneratedCPF[]>([]);
  const [count, setCount] = useState(1);
  const [useDots, setUseDots] = useState(true); // Toggle formatting
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const randomInt = (min: number, max: number) => 
    Math.floor(Math.random() * (max - min + 1)) + min;

  const calculateDigit = (digits: number[]) => {
    const factor = digits.length + 1;
    const sum = digits.reduce((acc, curr, idx) => acc + curr * (factor - idx), 0);
    const remainder = (sum * 10) % 11;
    return remainder === 10 || remainder === 11 ? 0 : remainder;
  };

  const generateCPF = (): GeneratedCPF => {
    // 1. Generate first 9 digits (Base + Region)
    const base = Array.from({ length: 9 }, () => randomInt(0, 9));
    
    // 2. Calculate First Check Digit (J)
    const digit1 = calculateDigit(base);
    
    // 3. Calculate Second Check Digit (K)
    const digit2 = calculateDigit([...base, digit1]);

    const fullArray = [...base, digit1, digit2];
    const unformatted = fullArray.join('');
    
    // Format: 000.000.000-00
    const formatted = unformatted.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    
    const regionDigit = base[8];

    return {
      value: useDots ? formatted : unformatted,
      unformatted: unformatted,
      regionCode: regionDigit,
      regionName: REGIONS[regionDigit]
    };
  };

  const handleGenerate = () => {
    const newCpfs = Array.from({ length: count }, () => generateCPF());
    setCpfs(newCpfs);
    setCopiedAll(false);
    setCopiedIndex(null);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAll = () => {
    const text = cpfs.map(c => c.value).join('\n');
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
          
          <div className="flex items-center gap-3 pb-3">
             <input 
               type="checkbox" 
               id="formatToggle"
               checked={useDots}
               onChange={(e) => setUseDots(e.target.checked)}
               className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
             />
             <label htmlFor="formatToggle" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
               Format (###.###.###-##)
             </label>
          </div>

          <button
            onClick={handleGenerate}
            className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw size={20} /> Generate CPFs
          </button>
        </div>
      </div>

      {/* Results */}
      {cpfs.length > 0 && (
        <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
            <h3 className="font-bold flex items-center gap-2">
              <List size={18} /> Generated IDs
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
            {cpfs.map((cpf, idx) => (
              <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors group gap-4">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xl text-gray-900 dark:text-gray-100 tracking-wide">
                    {cpf.value}
                  </span>
                  
                  {/* Region Badge */}
                  <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs text-gray-500">
                    <MapPin size={12} />
                    <span className="font-medium">Reg {cpf.regionCode}:</span>
                    <span className="truncate max-w-[150px]">{cpf.regionName}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="hidden sm:flex items-center gap-1 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                    <ShieldCheck size={12} /> Valid Mod11
                  </span>
                  <button
                    onClick={() => copyToClipboard(cpf.value, idx)}
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                    title="Copy CPF"
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
        <h2>About CPF Generation</h2>
        <p>
          The <strong>CPF (Cadastro de Pessoas Físicas)</strong> is the Brazilian individual taxpayer registry identification. 
          This tool generates mathematically valid numbers using the standard Modulus 11 algorithm used by the Receita Federal.
        </p>

        <div className="grid md:grid-cols-2 gap-6 my-8 not-prose">
          <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/50">
            <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
              <ShieldCheck size={20} /> Structure Logic
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li>• <strong>Format:</strong> ABC.DEF.GHI-JK</li>
              <li>• <strong>Base:</strong> First 8 digits are random numbers.</li>
              <li>• <strong>Region (I):</strong> The 9th digit determines the fiscal region (e.g., 8 is SP).</li>
              <li>• <strong>Check Digits (JK):</strong> Calculated to verify authenticity.</li>
            </ul>
          </div>
          
          <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/50">
            <h3 className="font-bold text-amber-900 dark:text-amber-100 mb-3 flex items-center gap-2">
              <AlertTriangle size={20} /> Important Disclaimer
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              These numbers are valid only in <strong>format and algorithm</strong>. They are randomly generated for 
              software testing and development purposes. Do not use these numbers for fraudulent activities or real-world identification.
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}
