'use client';

import React, { useState } from 'react';
import { Key, Copy, RefreshCw, Shield, Lock, Hash, FileKey } from 'lucide-react';

type ToolMode = 'generate' | 'hash' | 'encrypt' | 'decrypt';

interface CryptoResponse {
  publicKey?: string;
  privateKey?: string;
  output?: string;
  error?: string;
}

function isCryptoResponse(data: unknown): data is CryptoResponse {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const candidate = data as Partial<CryptoResponse>;

  if (candidate.publicKey !== undefined && typeof candidate.publicKey !== 'string') return false;
  if (candidate.privateKey !== undefined && typeof candidate.privateKey !== 'string') return false;
  if (candidate.output !== undefined && typeof candidate.output !== 'string') return false;
  if (candidate.error !== undefined && typeof candidate.error !== 'string') return false;

  return true;
}

export default function CryptoLab() {
  const [mode, setMode] = useState<ToolMode>('generate');
  const [subType, setSubType] = useState('rsa'); // rsa, uuid, sha256, etc.
  const [input, setInput] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [result, setResult] = useState<CryptoResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/crypto-lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: mode === 'decrypt' ? 'decrypt' : (mode === 'encrypt' ? 'encrypt' : (mode === 'hash' ? 'hash' : 'generate')), 
          type: subType,
          input,
          secretKey
        })
      });
      
      const data = await res.json();

      if (isCryptoResponse(data)) {
        setResult(data);
      } else {
        setResult({ error: 'Invalid response format' });
      }
    } catch {
      setResult({ error: 'Operation failed' });
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string) => navigator.clipboard.writeText(text);

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      
      {/* SEO Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-purple-100 dark:bg-purple-900/30 rounded-2xl mb-4">
          <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">Cryptography Lab</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Generate secure RSA key pairs, create strong hashes, and encrypt data using AES-256 standard. 
          All operations are processed securely via our edge network.
        </p>
      </div>

      {/* Main Tool Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
        
        {/* Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          <button 
            onClick={() => { setMode('generate'); setSubType('rsa'); setResult(null); }}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${mode === 'generate' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-b-2 border-purple-600' : 'text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
          >
            <Key className="w-4 h-4" /> Generators
          </button>
          <button 
            onClick={() => { setMode('hash'); setSubType('sha256'); setResult(null); }}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${mode === 'hash' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-b-2 border-purple-600' : 'text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
          >
            <Hash className="w-4 h-4" /> Hashing
          </button>
          <button 
            onClick={() => { setMode('encrypt'); setSubType('aes'); setResult(null); }}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${mode === 'encrypt' || mode === 'decrypt' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-b-2 border-purple-600' : 'text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
          >
            <Lock className="w-4 h-4" /> Encryption
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Controls Area */}
          <div className="space-y-4">
            
            {/* Mode Specific Inputs */}
            {mode === 'generate' && (
              <div className="flex flex-col sm:flex-row gap-4">
                <select 
                  value={subType}
                  onChange={(e) => setSubType(e.target.value)}
                  className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border-none outline-none font-medium text-zinc-700 dark:text-zinc-200"
                >
                  <option value="rsa">RSA Key Pair (2048-bit)</option>
                  <option value="uuid">UUID v4</option>
                  <option value="api-key">API Key (Hex)</option>
                  <option value="secret">JWT Secret (Base64)</option>
                </select>
                <button 
                  onClick={handleAction} 
                  disabled={loading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="animate-spin w-5 h-5" /> : <Key className="w-5 h-5" />}
                  Generate Keys
                </button>
              </div>
            )}

            {mode === 'hash' && (
              <div className="space-y-4">
                 <div className="flex gap-4">
                  <select 
                    value={subType}
                    onChange={(e) => setSubType(e.target.value)}
                    className="w-32 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl font-medium"
                  >
                    <option value="sha256">SHA-256</option>
                    <option value="sha512">SHA-512</option>
                    <option value="md5">MD5</option>
                  </select>
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter text to hash..."
                    className="flex-1 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl outline-none"
                  />
                 </div>
                 <button 
                  onClick={handleAction}
                  disabled={loading || !input} 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                 >
                   {loading ? <RefreshCw className="animate-spin w-5 h-5" /> : <Hash className="w-5 h-5" />}
                   Generate Hash
                 </button>
              </div>
            )}

            {(mode === 'encrypt' || mode === 'decrypt') && (
              <div className="space-y-4">
                <div className="flex gap-2 mb-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-fit">
                  <button 
                    onClick={() => { setMode('encrypt'); setResult(null); }}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${mode === 'encrypt' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'text-zinc-500'}`}
                  >
                    Encrypt
                  </button>
                  <button 
                    onClick={() => { setMode('decrypt'); setResult(null); }}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${mode === 'decrypt' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'text-zinc-500'}`}
                  >
                    Decrypt
                  </button>
                </div>
                
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={mode === 'encrypt' ? "Enter plain text..." : "Enter encrypted string (format iv:ciphertext)..."}
                  className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl outline-none min-h-[100px] font-mono text-sm"
                />
                
                <div className="flex gap-4">
                  <input 
                    type="password"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder="Enter Secret Key"
                    className="flex-1 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl outline-none"
                  />
                  <button 
                    onClick={handleAction}
                    disabled={loading || !input || !secretKey} 
                    className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-8 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="animate-spin w-5 h-5" /> : <Lock className="w-5 h-5" />}
                    {mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Results Area */}
          {result && (
            <div className="animate-in fade-in slide-in-from-bottom-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              {result.error ? (
                 <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl text-center">
                   {result.error}
                 </div>
              ) : (
                <div className="space-y-4">
                  {result.publicKey && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm text-zinc-500">
                        <span className="font-semibold uppercase tracking-wider">Public Key</span>
                        <button onClick={() => result.publicKey && copy(result.publicKey)} className="hover:text-purple-600"><Copy size={14}/></button>
                      </div>
                      <pre className="p-4 bg-zinc-900 text-emerald-400 rounded-xl text-xs overflow-x-auto font-mono">
                        {result.publicKey}
                      </pre>
                    </div>
                  )}
                  {result.privateKey && (
                     <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm text-zinc-500">
                        <span className="font-semibold uppercase tracking-wider">Private Key</span>
                        <button onClick={() => result.privateKey && copy(result.privateKey)} className="hover:text-purple-600"><Copy size={14}/></button>
                      </div>
                      <pre className="p-4 bg-zinc-900 text-rose-400 rounded-xl text-xs overflow-x-auto font-mono">
                        {result.privateKey}
                      </pre>
                    </div>
                  )}
                  {result.output && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm text-zinc-500">
                         <span className="font-semibold uppercase tracking-wider">Output Result</span>
                         <button onClick={() => result.output && copy(result.output)} className="hover:text-purple-600"><Copy size={14}/></button>
                      </div>
                      <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl font-mono text-sm break-all text-purple-600 dark:text-purple-400 border border-zinc-200 dark:border-zinc-700">
                        {result.output}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SEO Content Section */}
      <div className="grid md:grid-cols-2 gap-8 pt-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-zinc-900 dark:text-white">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
               <FileKey className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold">Secure Key Generation</h3>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Generate industry-standard RSA 2048-bit key pairs for SSH access, encryption, or digital signatures. 
            We also provide cryptographically strong random UUIDs and high-entropy API keys suitable for production use.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-zinc-900 dark:text-white">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
               <Lock className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold">AES Encryption</h3>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Protect sensitive text data using AES-256-CBC symmetric encryption. 
            The tool automatically handles Initialization Vectors (IVs) to ensure that identical text inputs produce different encrypted outputs for maximum security.
          </p>
        </div>
      </div>
    </div>
  );
}
