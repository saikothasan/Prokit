'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Globe, 
  MapPin, 
  Server, 
  Activity, 
  Wifi, 
  Loader2,
  CheckCircle2
} from 'lucide-react';

interface IpData {
  ip: string;
  score: number;
  riskLevel: string;
  geo: {
    country: string;
    region: string;
    city: string;
    flag?: string;
    isp: string;
    asn: number;
    org: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  blacklist: {
    total_checked: number;
    listed_count: number;
    details: Array<{ zone: string; status: 'clean' | 'listed' | 'error' }>;
  };
}

// Helper interface for the API response which might contain an error
interface ApiResponse extends IpData {
  error?: string;
}

export default function WhatIsMyIp() {
  const [data, setData] = useState<IpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchIpData();
  }, []);

  const fetchIpData = async () => {
    try {
      setLoading(true);
      // Ensure we clear previous errors on retry
      setError('');
      
      const res = await fetch('/api/ip-lookup');
      if (!res.ok) throw new Error(`Analysis failed: ${res.statusText}`);
      
      const json = (await res.json()) as ApiResponse;
      
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-blue-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] animate-pulse">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-500">Analyzing Network Identity...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-center">
        <ShieldAlert className="w-12 h-12 mx-auto mb-4" />
        <h3 className="text-lg font-bold">Analysis Failed</h3>
        <p>{error}</p>
        <button 
          onClick={fetchIpData}
          className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Retry Analysis
        </button>
      </div>
    );
  }

  // Safe formatting helpers to prevent crashes
  const safeLat = typeof data.geo.latitude === 'number' ? data.geo.latitude.toFixed(4) : 'N/A';
  const safeLong = typeof data.geo.longitude === 'number' ? data.geo.longitude.toFixed(4) : 'N/A';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      
      {/* Hero Section - IP & Score */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main IP Card */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative">
            <div className="flex items-center gap-3 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              <Wifi className="w-4 h-4" /> Public IPv4 Address
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-white mb-6">
              {data.ip}
            </h2>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-medium">
                <Globe className="w-4 h-4 text-blue-500" /> {data.geo.country}
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-medium">
                <Server className="w-4 h-4 text-purple-500" /> {data.geo.isp}
              </div>
            </div>
          </div>
        </div>

        {/* Reputation Score Card */}
        <div className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center text-center relative">
          <div className="relative w-40 h-40 flex items-center justify-center mb-4">
             {/* Simple SVG Circular Gauge */}
             <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
               <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" className="text-gray-100 dark:text-gray-800" />
               <circle 
                 cx="50" 
                 cy="50" 
                 r="45" 
                 fill="none" 
                 stroke="currentColor" 
                 strokeWidth="10" 
                 strokeDasharray={`${283 * (data.score / 100)} 283`}
                 strokeLinecap="round"
                 className={`${getScoreColor(data.score)} transition-all duration-1000 ease-out`} 
               />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-black ${getScoreColor(data.score)}`}>{data.score}</span>
                <span className="text-xs font-bold uppercase text-gray-400">Reputation</span>
             </div>
          </div>
          <div className={`text-lg font-bold ${getScoreColor(data.score)}`}>
            {data.riskLevel} Risk
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Based on {data.blacklist.total_checked} security checks
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Geo Details */}
        <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center gap-3">
            <MapPin className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-lg">Geolocation Data</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500">Location</span>
              <span className="font-medium text-right">{data.geo.city}, {data.geo.region}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500">Coordinates</span>
              <span className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                {safeLat}, {safeLong}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500">Timezone</span>
              <span className="font-medium text-right">{data.geo.timezone}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500">Organization</span>
              <span className="font-medium text-right truncate max-w-[200px]">{data.geo.org}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-500">ASN</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{data.geo.asn}</span>
            </div>
          </div>
        </div>

        {/* Blacklist Status */}
        <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center gap-3">
            <Activity className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-lg">Blacklist Monitor</h3>
          </div>
          <div className="p-6">
            <div className="mb-6 flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
               <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Detection Rate</span>
               <div className="flex items-center gap-2">
                 <span className={`text-2xl font-bold ${data.blacklist.listed_count > 0 ? 'text-red-500' : 'text-green-500'}`}>
                   {data.blacklist.listed_count}
                 </span>
                 <span className="text-gray-400">/ {data.blacklist.total_checked}</span>
               </div>
            </div>

            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {data.blacklist.details.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm group">
                  <span className="text-gray-600 dark:text-gray-400 truncate max-w-[70%]" title={item.zone}>
                    {item.zone}
                  </span>
                  {item.status === 'clean' && (
                    <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-medium text-xs bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                      <CheckCircle2 size={12} /> Clean
                    </span>
                  )}
                  {item.status === 'listed' && (
                    <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-bold text-xs bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                      <ShieldAlert size={12} /> LISTED
                    </span>
                  )}
                  {item.status === 'error' && (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
