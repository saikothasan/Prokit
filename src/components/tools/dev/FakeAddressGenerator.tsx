'use client';

import React, { useState } from 'react';
import { MapPin, RefreshCw, Copy, Check, Globe } from 'lucide-react';

// List of supported locales based on Faker docs
const LOCALES = [
  { code: 'af_ZA', name: 'Afrikaans (South Africa)' },
  { code: 'ar', name: 'Arabic' },
  { code: 'az', name: 'Azerbaijani' },
  { code: 'cz', name: 'Czech' },
  { code: 'de', name: 'German' },
  { code: 'de_AT', name: 'German (Austria)' },
  { code: 'de_CH', name: 'German (Switzerland)' },
  { code: 'el', name: 'Greek' },
  { code: 'en', name: 'English' },
  { code: 'en_AU', name: 'English (Australia)' },
  { code: 'en_CA', name: 'English (Canada)' },
  { code: 'en_GB', name: 'English (Great Britain)' },
  { code: 'en_IE', name: 'English (Ireland)' },
  { code: 'en_IN', name: 'English (India)' },
  { code: 'en_NG', name: 'English (Nigeria)' },
  { code: 'en_US', name: 'English (United States)' },
  { code: 'en_ZA', name: 'English (South Africa)' },
  { code: 'es', name: 'Spanish' },
  { code: 'es_MX', name: 'Spanish (Mexico)' },
  { code: 'fa', name: 'Farsi' },
  { code: 'fi', name: 'Finnish' },
  { code: 'fr', name: 'French' },
  { code: 'fr_BE', name: 'French (Belgium)' },
  { code: 'fr_CA', name: 'French (Canada)' },
  { code: 'fr_CH', name: 'French (Switzerland)' },
  { code: 'ge', name: 'Georgian' },
  { code: 'he', name: 'Hebrew' },
  { code: 'hr', name: 'Croatian' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'hy', name: 'Armenian' },
  { code: 'id_ID', name: 'Indonesian' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'lv', name: 'Latvian' },
  { code: 'mk', name: 'Macedonian' },
  { code: 'nb_NO', name: 'Norwegian' },
  { code: 'ne', name: 'Nepalese' },
  { code: 'nl', name: 'Dutch' },
  { code: 'nl_BE', name: 'Dutch (Belgium)' },
  { code: 'pl', name: 'Polish' },
  { code: 'pt_BR', name: 'Portuguese (Brazil)' },
  { code: 'pt_PT', name: 'Portuguese (Portugal)' },
  { code: 'ro', name: 'Romanian' },
  { code: 'ru', name: 'Russian' },
  { code: 'sk', name: 'Slovakian' },
  { code: 'sv', name: 'Swedish' },
  { code: 'tr', name: 'Turkish' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'ur', name: 'Urdu' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'zh_CN', name: 'Chinese' },
  { code: 'zh_TW', name: 'Chinese (Taiwan)' },
  { code: 'zu_ZA', name: 'Zulu (South Africa)' },
];

interface AddressData {
  street: string;
  buildingNumber: string;
  city: string;
  zipCode: string;
  country: string;
  state: string;
  latitude: number;
  longitude: number;
  fullAddress: string;
  timeZone: string;
}

// Define the response shape to fix the 'unknown' type error
interface AddressApiResponse {
  success: boolean;
  data: AddressData;
  error?: string;
  details?: string;
}

export default function FakeAddressGenerator() {
  const [locale, setLocale] = useState('en_US');
  const [data, setData] = useState<AddressData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateAddress = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fake-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale }),
      });
      
      // CAST the response to our interface
      const json = (await res.json()) as AddressApiResponse;
      
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!data) return;
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center justify-center p-3 bg-teal-100 dark:bg-teal-900/30 rounded-2xl mb-4">
          <MapPin className="w-8 h-8 text-teal-600 dark:text-teal-400" />
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">Fake Address Generator</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Generate localized fake address data for testing and development using Faker.js.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-lg border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-4 items-center">
        
        <div className="relative w-full sm:w-64">
          <Globe className="absolute left-3 top-3.5 w-5 h-5 text-zinc-400" />
          <select 
            value={locale} 
            onChange={(e) => setLocale(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition-all text-zinc-900 dark:text-white appearance-none cursor-pointer"
          >
            {LOCALES.map(l => (
              <option key={l.code} value={l.code}>{l.name} ({l.code})</option>
            ))}
          </select>
        </div>

        <button 
          onClick={generateAddress}
          disabled={loading}
          className="w-full sm:flex-1 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading ? <RefreshCw className="animate-spin w-5 h-5" /> : <>Generate New Address <RefreshCw className="w-4 h-4" /></>}
        </button>
      </div>

      {/* Result Card */}
      {data && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid md:grid-cols-2 gap-6">
          
          {/* Visual Representation */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
             <h3 className="font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-sm border-b border-zinc-100 dark:border-zinc-800 pb-2">Formatted Address</h3>
             
             <div className="space-y-4">
               <div>
                  <div className="text-xs text-zinc-500 mb-1">Street</div>
                  <div className="text-lg font-medium text-zinc-900 dark:text-white">{data.street}</div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <div className="text-xs text-zinc-500 mb-1">City</div>
                    <div className="text-lg font-medium text-zinc-900 dark:text-white">{data.city}</div>
                 </div>
                 <div>
                    <div className="text-xs text-zinc-500 mb-1">State / Province</div>
                    <div className="text-lg font-medium text-zinc-900 dark:text-white">{data.state}</div>
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <div className="text-xs text-zinc-500 mb-1">Zip Code</div>
                    <div className="font-mono text-lg font-medium text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 inline-block px-2 rounded">{data.zipCode}</div>
                 </div>
                 <div>
                    <div className="text-xs text-zinc-500 mb-1">Country</div>
                    <div className="text-lg font-medium text-zinc-900 dark:text-white">{data.country}</div>
                 </div>
               </div>
               <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="text-xs text-zinc-500 mb-1">Coordinates</div>
                  <div className="font-mono text-sm text-zinc-600 dark:text-zinc-400">
                    {data.latitude}, {data.longitude}
                  </div>
               </div>
             </div>
          </div>

          {/* JSON Output */}
          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 shadow-inner flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-zinc-400 uppercase tracking-wider text-sm">JSON Output</h3>
              <button 
                onClick={copyToClipboard}
                className="text-xs flex items-center gap-1.5 text-teal-400 hover:text-teal-300 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy JSON'}
              </button>
            </div>
            <pre className="flex-1 overflow-x-auto font-mono text-xs sm:text-sm text-zinc-300 leading-relaxed custom-scrollbar">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>

        </div>
      )}
    </div>
  );
}
