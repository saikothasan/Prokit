'use client';

import { useState } from 'react';
import { Copy, RefreshCw, User, MapPin, Building, Check, Hash } from 'lucide-react';
import { faker } from '@faker-js/faker';

interface AddressData {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  company: string;
  email: string;
}

export default function FakeAddressGenerator() {
  const [data, setData] = useState<AddressData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const generateAddress = () => {
    setLoading(true);
    // Simulate slight delay for "processing" feel
    setTimeout(() => {
      const newData = {
        fullName: faker.person.fullName(),
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: "United States", // Keeping it US-centric for standard testing
        phone: faker.phone.number(),
        company: faker.company.name(),
        email: faker.internet.email(),
      };
      setData(newData);
      setLoading(false);
    }, 400);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!data && !loading) {
    generateAddress();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Control Bar */}
      <div className="flex items-center justify-between p-4 border border-[var(--border)] bg-[var(--muted)]/20 rounded-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--background)] border border-[var(--border)] rounded-sm">
             <User className="w-5 h-5 text-[var(--foreground)]" />
          </div>
          <div>
             <h3 className="text-sm font-bold text-[var(--foreground)]">Identity Generator</h3>
             <p className="text-xs text-[var(--muted-foreground)] font-mono">LOCALE: EN_US // SEED: RANDOM</p>
          </div>
        </div>
        
        <button 
          onClick={generateAddress}
          disabled={loading}
          className="btn-agentic bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--foreground)]/90 gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'GENERATING...' : 'REGENERATE'}
        </button>
      </div>

      {/* Data Grid */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Personal Info Card */}
          <Card title="Personal Identity" icon={<User className="w-4 h-4" />}>
            <Field 
              label="Full Name" 
              value={data.fullName} 
              onCopy={() => copyToClipboard(data.fullName, 'name')} 
              copied={copied === 'name'} 
            />
            <Field 
              label="Email Address" 
              value={data.email} 
              onCopy={() => copyToClipboard(data.email, 'email')} 
              copied={copied === 'email'} 
            />
            <Field 
              label="Phone Number" 
              value={data.phone} 
              onCopy={() => copyToClipboard(data.phone, 'phone')} 
              copied={copied === 'phone'} 
            />
          </Card>

          {/* Location Card */}
          <Card title="Location Details" icon={<MapPin className="w-4 h-4" />}>
            <Field 
              label="Street Address" 
              value={data.street} 
              onCopy={() => copyToClipboard(data.street, 'street')} 
              copied={copied === 'street'} 
            />
            <div className="grid grid-cols-2 gap-4">
              <Field 
                label="City" 
                value={data.city} 
                onCopy={() => copyToClipboard(data.city, 'city')} 
                copied={copied === 'city'} 
              />
              <Field 
                label="State" 
                value={data.state} 
                onCopy={() => copyToClipboard(data.state, 'state')} 
                copied={copied === 'state'} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field 
                label="Zip Code" 
                value={data.zipCode} 
                onCopy={() => copyToClipboard(data.zipCode, 'zip')} 
                copied={copied === 'zip'} 
              />
              <Field 
                label="Country" 
                value={data.country} 
                onCopy={() => copyToClipboard(data.country, 'country')} 
                copied={copied === 'country'} 
              />
            </div>
          </Card>

          {/* Employment Card */}
          <Card title="Employment" icon={<Building className="w-4 h-4" />}>
             <Field 
              label="Company Name" 
              value={data.company} 
              onCopy={() => copyToClipboard(data.company, 'company')} 
              copied={copied === 'company'} 
            />
          </Card>

           {/* JSON Export Card */}
           <div className="md:col-span-1 border border-[var(--border)] bg-[var(--background)] rounded-sm p-4 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[var(--border)]">
                 <Hash className="w-4 h-4 text-[var(--muted-foreground)]" />
                 <h4 className="text-xs font-mono font-bold uppercase text-[var(--muted-foreground)]">Raw JSON Payload</h4>
              </div>
              <pre className="flex-1 bg-[var(--muted)]/20 p-3 rounded-sm text-[10px] font-mono text-[var(--muted-foreground)] overflow-auto custom-scrollbar">
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
    <div className="border border-[var(--border)] bg-[var(--background)] rounded-sm p-5 space-y-4 hover:border-[var(--foreground)]/30 transition-colors">
      <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]">
        <div className="text-[var(--muted-foreground)]">{icon}</div>
        <h4 className="text-xs font-mono font-bold uppercase text-[var(--muted-foreground)]">{title}</h4>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, onCopy, copied }: { label: string, value: string, onCopy: () => void, copied: boolean }) {
  return (
    <div className="group relative">
      <label className="text-[10px] uppercase font-mono text-[var(--muted-foreground)] block mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <code className="flex-1 block p-2 bg-[var(--muted)]/30 border border-[var(--border)] rounded-sm text-sm font-medium text-[var(--foreground)] truncate font-mono">
          {value}
        </code>
        <button 
          onClick={onCopy}
          className="p-2 hover:bg-[var(--muted)] rounded-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          title="Copy"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
