'use client';

import React, { useState, useEffect } from 'react';
import { 
  MapPin, RefreshCw, Copy, Check, Globe, 
  User, Briefcase, CreditCard, Wifi, Smartphone, 
  LayoutList, FileJson
} from 'lucide-react';
import { cn } from '@/lib/utils'; // Ensure you have a utility for class merging, or remove if not needed

// Comprehensive list of locales supported by @faker-js/faker
const LOCALES = [
  { code: 'en', name: 'English' },
  { code: 'en_US', name: 'English (USA)' },
  { code: 'en_GB', name: 'English (UK)' },
  { code: 'de', name: 'German' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh_CN', name: 'Chinese (China)' },
  { code: 'zh_TW', name: 'Chinese (Taiwan)' },
  { code: 'ru', name: 'Russian' },
  { code: 'pt_BR', name: 'Portuguese (Brazil)' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'tr', name: 'Turkish' },
  { code: 'id_ID', name: 'Indonesian' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'sv', name: 'Swedish' },
];

// Re-using the interface from the API for type safety
interface FakeIdentity {
  identity: {
    firstName: string;
    lastName: string;
    fullName: string;
    gender: string;
    birthday: string; // Transformed to string from JSON
    avatar: string;
  };
  location: {
    street: string;
    buildingNumber: string;
    city: string;
    zipCode: string;
    country: string;
    countryCode: string;
    state: string;
    latitude: number;
    longitude: number;
    fullAddress: string;
    timeZone: string;
  };
  internet: {
    email: string;
    username: string;
    ip: string;
    mac: string;
    userAgent: string;
    domainName: string;
    url: string;
  };
  finance: {
    accountName: string;
    accountNumber: string;
    iban: string;
    bic: string;
    creditCardNumber: string;
    creditCardCVV: string;
    currencyName: string;
    currencyCode: string;
  };
  job: {
    title: string;
    company: string;
    department: string;
  };
  contact: {
    phone: string;
    imei: string;
  };
}

interface ApiResponse {
  success: boolean;
  data: FakeIdentity;
  error?: string;
}

function CopyButton({ text }: { text: string | number }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(String(text));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-zinc-400 hover:text-teal-600"
      title="Copy"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-teal-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function FieldRow({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0 group">
      <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 font-mono truncate max-w-[200px] md:max-w-xs text-right">
          {value}
        </span>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
           <CopyButton text={value} />
        </div>
      </div>
    </div>
  );
}

export default function FakeAddressGenerator() {
  const [locale, setLocale] = useState('en_US');
  const [data, setData] = useState<FakeIdentity | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'json'>('details');

  const generateData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fake-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale }),
      });
      const json = (await res.json()) as ApiResponse;
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Generate initial data on mount
  useEffect(() => {
    generateData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center justify-center p-3 bg-teal-100 dark:bg-teal-900/30 rounded-2xl mb-4">
          <MapPin className="w-8 h-8 text-teal-600 dark:text-teal-400" />
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">Fake Identity Generator</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Generate comprehensive fake identities including personal info, address, finance, and internet details for testing.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl shadow-lg border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-4 items-center sticky top-4 z-20 backdrop-blur-xl bg-opacity-80 dark:bg-opacity-80">
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
          onClick={generateData}
          disabled={loading}
          className="w-full sm:flex-1 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-md shadow-teal-600/20"
        >
          {loading ? <RefreshCw className="animate-spin w-5 h-5" /> : <>Generate New Identity <RefreshCw className="w-4 h-4" /></>}
        </button>

        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
           <button 
             onClick={() => setActiveTab('details')}
             className={`p-2.5 rounded-lg transition-all ${activeTab === 'details' ? 'bg-white dark:bg-zinc-700 shadow text-teal-600' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
           >
             <LayoutList className="w-5 h-5" />
           </button>
           <button 
             onClick={() => setActiveTab('json')}
             className={`p-2.5 rounded-lg transition-all ${activeTab === 'json' ? 'bg-white dark:bg-zinc-700 shadow text-teal-600' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
           >
             <FileJson className="w-5 h-5" />
           </button>
        </div>
      </div>

      {data && activeTab === 'details' && (
        <div className="grid lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* 1. Identity Card */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
                    <User className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Personal Identity</h3>
             </div>
             
             <div className="flex items-center gap-4 mb-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
                 <img src={data.identity.avatar} alt="Avatar" className="w-16 h-16 rounded-full bg-zinc-200" />
                 <div>
                    <div className="font-bold text-lg text-zinc-900 dark:text-white">{data.identity.fullName}</div>
                    <div className="text-sm text-zinc-500">{data.job.title}</div>
                 </div>
             </div>

             <div className="space-y-0">
                <FieldRow label="Full Name" value={data.identity.fullName} />
                <FieldRow label="First Name" value={data.identity.firstName} />
                <FieldRow label="Last Name" value={data.identity.lastName} />
                <FieldRow label="Gender" value={data.identity.gender} />
                <FieldRow label="Birthday" value={new Date(data.identity.birthday).toLocaleDateString()} />
                <FieldRow label="Phone" value={data.contact.phone} />
                <FieldRow label="Company" value={data.job.company} />
             </div>
          </div>

          {/* 2. Location Card */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-teal-50 dark:bg-teal-900/20 text-teal-600 rounded-xl">
                    <MapPin className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Location Details</h3>
             </div>
             
             <div className="p-4 bg-teal-50/50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-900/30 rounded-2xl mb-6">
                 <p className="font-mono text-sm text-teal-900 dark:text-teal-100 leading-relaxed">
                    {data.location.fullAddress}
                 </p>
             </div>

             <div className="space-y-0">
                <FieldRow label="Street" value={data.location.street} />
                <FieldRow label="City" value={data.location.city} />
                <FieldRow label="State/Province" value={data.location.state} />
                <FieldRow label="Zip Code" value={data.location.zipCode} />
                <FieldRow label="Country" value={data.location.country} />
                <FieldRow label="Timezone" value={data.location.timeZone} />
                <FieldRow label="Coordinates" value={`${data.location.latitude.toFixed(4)}, ${data.location.longitude.toFixed(4)}`} />
             </div>
          </div>

          {/* 3. Internet Card */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl">
                    <Wifi className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Internet & Device</h3>
             </div>
             <div className="space-y-0">
                <FieldRow label="Email" value={data.internet.email} />
                <FieldRow label="Username" value={data.internet.username} />
                <FieldRow label="Password" value="********" />
                <FieldRow label="IP Address" value={data.internet.ip} />
                <FieldRow label="MAC Address" value={data.internet.mac} />
                <FieldRow label="User Agent" value={data.internet.userAgent.substring(0, 30) + '...'} />
                <FieldRow label="Website" value={data.internet.domainName} />
             </div>
          </div>

          {/* 4. Finance Card */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl">
                    <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Financial Data</h3>
             </div>
             
             {/* Fake Credit Card Visual */}
             <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-zinc-800 to-black text-white shadow-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                 <div className="flex justify-between items-start mb-8">
                     <CreditCard className="w-8 h-8 opacity-80" />
                     <span className="font-mono text-sm opacity-60">{data.finance.currencyCode}</span>
                 </div>
                 <div className="font-mono text-xl tracking-widest mb-4 shadow-sm">{data.finance.creditCardNumber}</div>
                 <div className="flex justify-between items-end">
                     <div>
                         <div className="text-[10px] opacity-60 uppercase tracking-wider mb-0.5">Card Holder</div>
                         <div className="font-medium text-sm">{data.identity.fullName.toUpperCase()}</div>
                     </div>
                     <div className="text-right">
                         <div className="text-[10px] opacity-60 uppercase tracking-wider mb-0.5">CVV</div>
                         <div className="font-mono text-sm">{data.finance.creditCardCVV}</div>
                     </div>
                 </div>
             </div>

             <div className="space-y-0">
                <FieldRow label="IBAN" value={data.finance.iban} />
                <FieldRow label="BIC / SWIFT" value={data.finance.bic} />
                <FieldRow label="Account No" value={data.finance.accountNumber} />
                <FieldRow label="Currency" value={`${data.finance.currencyName} (${data.finance.currencyCode})`} />
             </div>
          </div>

        </div>
      )}

      {/* JSON Output Tab */}
      {data && activeTab === 'json' && (
        <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 shadow-inner relative group">
           <button 
                onClick={() => {navigator.clipboard.writeText(JSON.stringify(data, null, 2))}}
                className="absolute top-4 right-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2"
           >
              <Copy className="w-3.5 h-3.5" /> Copy Raw JSON
           </button>
           <pre className="font-mono text-sm text-blue-300 overflow-x-auto p-2 custom-scrollbar">
              {JSON.stringify(data, null, 2)}
           </pre>
        </div>
      )}
    </div>
  );
}
