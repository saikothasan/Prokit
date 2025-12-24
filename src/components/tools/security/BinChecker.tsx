'use client';

import { useState } from 'react';
import { Search, Loader2, CheckCircle, AlertCircle, CreditCard, Globe, Info } from 'lucide-react';

// Data Interfaces (kept same)
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

type BinApiResponse = 
  | { success: true; data: BinData }
  | { success: false; error: string }
  | { error: string };

export default function BinChecker() {
  const [bin, setBin] = useState('');
  const [data, setData] = useState<BinData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheck = async () => {
    setLoading(true);
    setError('');
    setData(null);
    
    try {
      const res = await fetch(`/api/bin-checker?bin=${bin}`);
      const json = (await res.json()) as BinApiResponse; 
      
      if (!res.ok) {
        const errorMessage = 'error' in json ? json.error : 'Failed to fetch data';
        throw new Error(errorMessage);
      }
      
      if ('data' in json) {
        setData(json.data);
      } else {
         throw new Error('Invalid response format');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Tool Input Section */}
      <div className="bg-white dark:bg-[#111] rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-2xl mx-auto space-y-8">
           <div className="text-center space-y-2">
             <label htmlFor="bin-input" className="text-lg font-medium text-gray-900 dark:text-white">
               Enter First 6-8 Digits
             </label>
             <div className="relative">
                <input
                  id="bin-input"
                  value={bin}
                  onChange={(e) => setBin(e.target.value)}
                  placeholder="4532 11..."
                  maxLength={8}
                  className="w-full p-5 pl-14 text-xl rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-mono tracking-wider"
                />
                <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                <button 
                  onClick={handleCheck}
                  disabled={loading || bin.length < 6}
                  className="absolute right-3 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Check'}
                </button>
             </div>
             <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
               <Info className="w-3 h-3" /> We do not store or log any card data.
             </p>
           </div>

           {error && (
             <div className="p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2 border border-red-100 dark:border-red-900/20 animate-in fade-in slide-in-from-top-2">
               <AlertCircle className="w-5 h-5" /> {error}
             </div>
           )}

           {data && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4">
               <ResultItem label="Card Brand" value={data.brand} icon={<CreditCard className="w-4 h-4" />} />
               <ResultItem label="Type" value={data.type} />
               <ResultItem label="Category" value={data.category} />
               <ResultItem label="Issuing Bank" value={data.issuer} />
               <ResultItem label="Country" value={data.country.name} icon={<Globe className="w-4 h-4" />} />
               <ResultItem label="ISO Code" value={data.country.iso2} />
             </div>
           )}
        </div>
      </div>

      {/* SEO Content Section */}
      <article className="prose prose-lg dark:prose-invert max-w-none">
        <div className="bg-gray-50 dark:bg-[#111] p-8 md:p-12 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Comprehensive BIN/IIN Lookup</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Our <strong>Bank Identification Number (BIN) Checker</strong> provides instant, accurate data on credit and debit cards. 
              Also known as the Issuer Identification Number (IIN), the first 6 to 8 digits of a card number reveal critical 
              information about the issuing bank, card type, and geographical origin.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureBox title="Fraud Prevention" desc="Verify if the card's country matches the user's IP or shipping address." />
            <FeatureBox title="Payment Routing" desc="Detect Prepaid vs. Credit cards to optimize processing fees." />
            <FeatureBox title="User Validation" desc="Auto-fill bank names and card brands to improve UX." />
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Frequently Asked Questions</h3>
            <div className="space-y-4">
              <FaqItem q="Is this tool safe?" a="Yes. We only process the first 6-8 digits (public BIN data). We never ask for, store, or process full card numbers or CVV codes." />
              <FaqItem q="What is a BIN?" a="A Bank Identification Number (BIN) is the initial sequence of numbers on a payment card that identifies the issuing institution." />
              <FaqItem q="How accurate is the data?" a="We update our database weekly, aggregating data from major card networks and financial registries." />
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

function ResultItem({ label, value, icon }: { label: string; value: string, icon?: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="p-4 bg-white dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-blue-500/50 transition-colors">
      <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
        {icon} {label}
      </div>
      <div className="font-mono font-medium text-lg text-gray-900 dark:text-gray-100 truncate" title={value}>{value}</div>
    </div>
  );
}

function FeatureBox({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="bg-white dark:bg-black p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
      <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
    </div>
  );
}

function FaqItem({ q, a }: { q: string, a: string }) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-800 pb-4 last:border-0">
      <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{q}</h5>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{a}</p>
    </div>
  );
}
