'use client';

import { useState } from 'react';
import { 
  Copy, RefreshCw, User, MapPin, Building, Check, Hash, 
  Globe, CreditCard, Wifi, Lock 
} from 'lucide-react';
import type { FakeIdentity } from '@/app/api/fake-address/route';

// Comprehensive list of FakerJS locales
const LOCALES = [
  { code: 'en', name: 'English' },
  { code: 'af_ZA', name: 'Afrikaans (South Africa)' },
  { code: 'ar', name: 'Arabic' },
  { code: 'az', name: 'Azerbaijani' },
  { code: 'cz', name: 'Czech' },
  { code: 'de', name: 'German' },
  { code: 'de_AT', name: 'German (Austria)' },
  { code: 'de_CH', name: 'German (Switzerland)' },
  { code: 'el', name: 'Greek' },
  { code: 'en_AU', name: 'English (Australia)' },
  { code: 'en_CA', name: 'English (Canada)' },
  { code: 'en_GB', name: 'English (United Kingdom)' },
  { code: 'en_IE', name: 'English (Ireland)' },
  { code: 'en_IN', name: 'English (India)' },
  { code: 'en_US', name: 'English (United States)' },
  { code: 'en_ZA', name: 'English (South Africa)' },
  { code: 'es', name: 'Spanish' },
  { code: 'es_MX', name: 'Spanish (Mexico)' },
  { code: 'fa', name: 'Farsi' },
  { code: 'fi', name: 'Finnish' },
  { code: 'fr', name: 'French' },
  { code: 'fr_CA', name: 'French (Canada)' },
  { code: 'fr_CH', name: 'French (Switzerland)' },
  { code: 'he', name: 'Hebrew' },
  { code: 'hr', name: 'Croatian' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'id_ID', name: 'Indonesian' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'lv', name: 'Latvian' },
  { code: 'mk', name: 'Macedonian' },
  { code: 'nb_NO', name: 'Norwegian' },
  { code: 'ne', name: 'Nepali' },
  { code: 'nl', name: 'Dutch' },
  { code: 'nl_BE', name: 'Dutch (Belgium)' },
  { code: 'pl', name: 'Polish' },
  { code: 'pt_BR', name: 'Portuguese (Brazil)' },
  { code: 'pt_PT', name: 'Portuguese (Portugal)' },
  { code: 'ro', name: 'Romanian' },
  { code: 'ru', name: 'Russian' },
  { code: 'sk', name: 'Slovak' },
  { code: 'sv', name: 'Swedish' },
  { code: 'th', name: 'Thai' },
  { code: 'tr', name: 'Turkish' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'zh_CN', name: 'Chinese (China)' },
  { code: 'zh_TW', name: 'Chinese (Taiwan)' },
];

export default function FakeAddressGenerator() {
  const [data, setData] = useState<FakeIdentity | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedLocale, setSelectedLocale] = useState('en');

  const generateAddress = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/fake-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: selectedLocale }),
      });
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to generate address', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  // Initial load
  if (!data && !loading) {
    generateAddress();
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 border border-[var(--border)] bg-[var(--muted)]/20 rounded-sm gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2 bg-[var(--background)] border border-[var(--border)] rounded-sm hidden sm:block">
             <User className="w-5 h-5 text-[var(--foreground)]" />
          </div>
          <div>
             <h3 className="text-sm font-bold text-[var(--foreground)]">Real Identity Generator</h3>
             <p className="text-xs text-[var(--muted-foreground)] font-mono">Generates consistent identities via FakerJS</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative">
             <Globe className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" />
             <select 
               value={selectedLocale}
               onChange={(e) => setSelectedLocale(e.target.value)}
               className="h-9 pl-8 pr-3 py-1 bg-[var(--background)] border border-[var(--border)] rounded-sm text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[var(--foreground)] cursor-pointer"
             >
               {LOCALES.map(loc => (
                 <option key={loc.code} value={loc.code}>{loc.name} ({loc.code})</option>
               ))}
             </select>
          </div>
          
          <button 
            onClick={generateAddress}
            disabled={loading}
            className="flex-1 sm:flex-none btn-agentic bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--foreground)]/90 gap-2 h-9 px-4"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'GENERATING...' : 'REGENERATE'}
          </button>
        </div>
      </div>

      {/* Data Grid */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Identity */}
          <Card title="Personal Identity" icon={<User className="w-4 h-4" />}>
            <div className="flex items-center gap-4 mb-4">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img src={data.identity.avatar} alt="Avatar" className="w-16 h-16 rounded-full border border-[var(--border)] bg-[var(--muted)] object-cover" />
               <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate">{data.identity.fullName}</h3>
                  <p className="text-xs text-[var(--muted-foreground)] font-mono">{data.identity.gender} • {data.identity.age} years old</p>
               </div>
            </div>
            <Field label="Full Name" value={data.identity.fullName} onCopy={copyToClipboard} copied={copied} id="fullname" />
            <div className="grid grid-cols-2 gap-2">
               <Field label="Birthday" value={new Date(data.identity.birthday).toLocaleDateString()} onCopy={copyToClipboard} copied={copied} id="bday" />
               <Field label="Blood Type" value={data.identity.bloodType || 'N/A'} onCopy={copyToClipboard} copied={copied} id="blood" />
            </div>
            <Field label="UUID" value={data.identity.uuid} onCopy={copyToClipboard} copied={copied} id="uuid" />
          </Card>

          {/* Location */}
          <Card title="Location Details" icon={<MapPin className="w-4 h-4" />}>
            <Field label="Full Address" value={data.location.fullAddress} onCopy={copyToClipboard} copied={copied} id="fulladdr" />
            <Field label="Street" value={data.location.street} onCopy={copyToClipboard} copied={copied} id="street" />
            <div className="grid grid-cols-2 gap-2">
              <Field label="City" value={data.location.city} onCopy={copyToClipboard} copied={copied} id="city" />
              <Field label="State" value={data.location.state} onCopy={copyToClipboard} copied={copied} id="state" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Zip Code" value={data.location.zipCode} onCopy={copyToClipboard} copied={copied} id="zip" />
              <Field label="Country" value={data.location.country} onCopy={copyToClipboard} copied={copied} id="country" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Timezone" value={data.location.timeZone} onCopy={copyToClipboard} copied={copied} id="tz" />
              <Field label="Coords" value={`${data.location.latitude.toFixed(4)}, ${data.location.longitude.toFixed(4)}`} onCopy={copyToClipboard} copied={copied} id="coords" />
            </div>
          </Card>

          {/* Contact & Job */}
          <Card title="Employment & Contact" icon={<Building className="w-4 h-4" />}>
            <Field label="Company" value={data.job.company} onCopy={copyToClipboard} copied={copied} id="company" />
            <Field label="Job Title" value={data.job.title} onCopy={copyToClipboard} copied={copied} id="job" />
            <Field label="Department" value={data.job.department} onCopy={copyToClipboard} copied={copied} id="dept" />
            <div className="h-px bg-[var(--border)] my-2" />
            <Field label="Phone" value={data.contact.phone} onCopy={copyToClipboard} copied={copied} id="phone" />
            <Field label="Email" value={data.internet.email} onCopy={copyToClipboard} copied={copied} id="email" />
            <Field label="IMEI" value={data.contact.imei} onCopy={copyToClipboard} copied={copied} id="imei" />
          </Card>

          {/* Finance */}
          <Card title="Financial Data" icon={<CreditCard className="w-4 h-4" />}>
            <Field label="Credit Card" value={data.finance.creditCardNumber} onCopy={copyToClipboard} copied={copied} id="cc" />
            <div className="grid grid-cols-2 gap-2">
               <Field label="CVV" value={data.finance.creditCardCVV} onCopy={copyToClipboard} copied={copied} id="cvv" />
               <Field label="Issuer" value={data.finance.creditCardIssuer} onCopy={copyToClipboard} copied={copied} id="issuer" />
            </div>
            <Field label="IBAN" value={data.finance.iban} onCopy={copyToClipboard} copied={copied} id="iban" />
            <Field label="Crypto (BTC)" value={data.finance.bitcoinAddress} onCopy={copyToClipboard} copied={copied} id="btc" />
          </Card>

           {/* Internet */}
           <Card title="Internet Presence" icon={<Wifi className="w-4 h-4" />}>
            <Field label="Username" value={data.internet.username} onCopy={copyToClipboard} copied={copied} id="username" />
            <Field label="Password" value={data.internet.password} onCopy={copyToClipboard} copied={copied} id="pass" />
            <Field label="IPv4 Address" value={data.internet.ip} onCopy={copyToClipboard} copied={copied} id="ip" />
            <Field label="MAC Address" value={data.internet.mac} onCopy={copyToClipboard} copied={copied} id="mac" />
            <Field label="User Agent" value={data.internet.userAgent} onCopy={copyToClipboard} copied={copied} id="ua" />
          </Card>

           {/* JSON Export */}
           <div className="lg:col-span-1 border border-[var(--border)] bg-[var(--background)] rounded-sm p-4 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[var(--border)]">
                 <Hash className="w-4 h-4 text-[var(--muted-foreground)]" />
                 <h4 className="text-xs font-mono font-bold uppercase text-[var(--muted-foreground)]">JSON Payload</h4>
              </div>
              <pre className="flex-1 bg-[var(--muted)]/20 p-3 rounded-sm text-[10px] font-mono text-[var(--muted-foreground)] overflow-auto custom-scrollbar max-h-[300px]">
                {JSON.stringify(data, null, 2)}
              </pre>
              <button 
                 onClick={() => copyToClipboard(JSON.stringify(data, null, 2), 'json')}
                 className="mt-3 w-full btn-agentic text-xs"
              >
                 {copied === 'json' ? <Check className="w-3 h-3 mr-2" /> : <Copy className="w-3 h-3 mr-2" />}
                 COPY JSON
              </button>
           </div>

        </div>
      )}
    </div>
  );
}

function Card({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <div className="border border-[var(--border)] bg-[var(--background)] rounded-sm p-5 space-y-4 hover:border-[var(--foreground)]/30 transition-colors h-full">
      <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]">
        <div className="text-[var(--muted-foreground)]">{icon}</div>
        <h4 className="text-xs font-mono font-bold uppercase text-[var(--muted-foreground)]">{title}</h4>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, onCopy, copied, id }: { label: string, value: string, onCopy: (txt: string, id: string) => void, copied: string | null, id: string }) {
  const isCopied = copied === id;
  return (
    <div className="group relative">
      <label className="text-[10px] uppercase font-mono text-[var(--muted-foreground)] block mb-1">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <code className="flex-1 block p-1.5 px-2 bg-[var(--muted)]/30 border border-[var(--border)] rounded-sm text-xs font-medium text-[var(--foreground)] truncate font-mono">
          {value}
        </code>
        <button 
          onClick={() => onCopy(value, id)}
          className="p-1.5 hover:bg-[var(--muted)] rounded-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          title="Copy"
        >
          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
