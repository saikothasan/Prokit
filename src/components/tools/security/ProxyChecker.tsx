'use client';

import React, { useState, useRef } from 'react';
import { Play, Pause, RefreshCw, Terminal, Shield, Activity, Wifi } from 'lucide-react';

interface ProxyResult {
  proxy: string;
  status: string;
  latency: number;
  healthy: boolean;
}

export default function ProxyChecker() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<ProxyResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>(['// SYSTEM READY. WAITING FOR INPUT...']);
  
  const abortController = useRef<AbortController | null>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [`> ${msg}`, ...prev].slice(0, 10));
  };

  const processBatch = async () => {
    if (!input.trim()) return;
    
    setIsScanning(true);
    setResults([]);
    setProgress(0);
    addLog('INITIALIZING PROXY SCAN PROTOCOL...');

    const proxies = input.split('\n').map(p => p.trim()).filter(p => p);
    const BATCH_SIZE = 5;
    const total = proxies.length;
    let processed = 0;

    abortController.current = new AbortController();

    try {
      for (let i = 0; i < total; i += BATCH_SIZE) {
        if (abortController.current.signal.aborted) break;

        const batch = proxies.slice(i, i + BATCH_SIZE);
        addLog(`PROCESSING BATCH ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} TARGETS)...`);

        const response = await fetch('/api/proxy-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ proxies: batch }),
          signal: abortController.current.signal
        });

        const data = await response.json();
        
        if (data.results) {
          setResults(prev => [...prev, ...data.results]);
          processed += batch.length;
          setProgress(Math.round((processed / total) * 100));
        }

        await new Promise(r => setTimeout(r, 200));
      }
      addLog('SCAN COMPLETE. GENERATING REPORT.');
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        addLog('PROCESS ABORTED BY USER.');
      } else {
        addLog('ERROR: CONNECTION FAILURE.');
      }
    } finally {
      setIsScanning(false);
      abortController.current = null;
    }
  };

  const stopScan = () => {
    if (abortController.current) {
      abortController.current.abort();
    }
  };

  const activeCount = results.filter(r => r.healthy).length;
  const avgLatency = activeCount > 0 
    ? Math.round(results.filter(r => r.healthy).reduce((a, b) => a + b.latency, 0) / activeCount) 
    : 0;

  return (
    <div className="space-y-8">
      
      {/* 1. Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
              {'//'} Proxy List Input (IP:Port)
            </label>
            <span className="text-xs font-mono text-[var(--muted-foreground)]">
              {input.split('\n').filter(x => x.trim()).length} TARGETS
            </span>
          </div>
          
          <div className="relative group">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`192.168.1.1:8080\n10.0.0.1:3128`}
              className="w-full h-64 p-4 bg-[var(--background)] border border-[var(--border)] rounded-sm font-mono text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 focus:ring-1 focus:ring-[var(--foreground)] focus:border-[var(--foreground)] transition-all resize-none"
              spellCheck={false}
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-r-2 border-b-2 border-[var(--foreground)] opacity-50" />
          </div>

          <div className="flex gap-3">
            {!isScanning ? (
              <button 
                onClick={processBatch}
                disabled={!input.trim()}
                className="flex-1 btn-agentic bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--foreground)]/90"
              >
                <Play className="w-4 h-4 mr-2" />
                INITIATE SCAN
              </button>
            ) : (
              <button 
                onClick={stopScan}
                className="flex-1 btn-agentic border-red-500/50 text-red-500 hover:bg-red-500/10"
              >
                <Pause className="w-4 h-4 mr-2" />
                ABORT PROTOCOL
              </button>
            )}
            <button 
              onClick={() => { setResults([]); setInput(''); setLogs(['// CLEARED']); }}
              className="btn-agentic w-12 px-0"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Monitor */}
        <div className="space-y-4">
           {/* Metric Cards */}
           <div className="p-4 bg-[var(--muted)]/20 border border-[var(--border)] rounded-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--muted-foreground)] uppercase pb-2 border-b border-[var(--border)]">
                <Activity className="w-3.5 h-3.5" />
                Live Metrics
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] uppercase text-[var(--muted-foreground)] mb-1">Active Nodes</div>
                  <div className="text-2xl font-bold font-mono text-emerald-500">{activeCount}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-[var(--muted-foreground)] mb-1">Avg Latency</div>
                  <div className="text-2xl font-bold font-mono text-[var(--foreground)]">{avgLatency}<span className="text-sm text-[var(--muted-foreground)]">ms</span></div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-[var(--muted-foreground)] mb-1">Dead Nodes</div>
                  <div className="text-2xl font-bold font-mono text-red-500">{results.filter(r => !r.healthy).length}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-[var(--muted-foreground)] mb-1">Progress</div>
                  <div className="text-2xl font-bold font-mono text-blue-500">{progress}%</div>
                </div>
              </div>
           </div>

           {/* Terminal Output */}
           <div className="h-40 bg-[var(--background)] border border-[var(--border)] rounded-sm p-3 font-mono text-xs overflow-hidden relative">
             <div className="absolute top-2 right-2 opacity-20">
               <Terminal className="w-4 h-4" />
             </div>
             <div className="space-y-1.5 h-full overflow-y-auto custom-scrollbar">
               {logs.map((log, i) => (
                 <div key={i} className="text-[var(--muted-foreground)]">
                   {log}
                 </div>
               ))}
               {isScanning && (
                 <div className="animate-pulse text-[var(--foreground)]">_</div>
               )}
             </div>
           </div>
        </div>
      </div>

      {/* 2. Results Grid */}
      {results.length > 0 && (
        <div className="border border-[var(--border)] rounded-sm overflow-hidden">
          <div className="bg-[var(--muted)]/30 px-4 py-2 border-b border-[var(--border)] flex justify-between items-center">
             <span className="text-xs font-mono font-semibold uppercase text-[var(--foreground)]">
               {'//'} Scan_Results
             </span>
             <div className="flex gap-2">
               <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
               <span className="w-2 h-2 rounded-full bg-red-500"></span>
             </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[var(--muted)]/10 text-[var(--muted-foreground)] font-mono text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Target Address</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Latency</th>
                  <th className="px-4 py-3 font-medium">Integrity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {results.map((res, idx) => (
                  <tr key={idx} className="hover:bg-[var(--muted)]/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-[var(--foreground)]">
                      {res.proxy}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase border ${
                        res.healthy 
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400' 
                          : 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400'
                      }`}>
                        {res.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[var(--muted-foreground)]">
                      {res.latency > 0 ? `${res.latency}ms` : '--'}
                    </td>
                    <td className="px-4 py-3">
                      {res.healthy ? (
                        <Shield className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Wifi className="w-4 h-4 text-red-400 opacity-50" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
