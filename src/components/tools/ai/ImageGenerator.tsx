'use client';
import { useState } from 'react';
import Image from 'next/image';
import { 
  Sparkles, Download, Loader2, Image as ImageIcon, 
  Wand2, Settings2, ChevronDown, Layers 
} from 'lucide-react';

interface GenResponse {
  success: boolean;
  image: string;
  finalPrompt: string;
  trace?: { step: string; result: string }[];
  error?: string;
  params?: Record<string, string | number | undefined>;
}

const MODELS = [
  { id: '@cf/black-forest-labs/flux-1-schnell', name: 'Flux.1 Schnell (Fastest)', type: 'flux' },
  { id: '@cf/black-forest-labs/flux-1-dev', name: 'Flux.1 Dev (High Quality)', type: 'flux' },
  { id: '@cf/stabilityai/stable-diffusion-xl-base-1.0', name: 'Stable Diffusion XL', type: 'sd' },
  { id: '@cf/bytedance/stable-diffusion-xl-lightning', name: 'SDXL Lightning', type: 'sd' },
  { id: '@cf/lykon/dreamshaper-8-lcm', name: 'DreamShaper 8 (Artistic)', type: 'sd' },
];

export default function ImageGenerator() {
  // State
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [enhance, setEnhance] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenResponse | null>(null);
  const [error, setError] = useState('');
  
  // Advanced Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(768);
  const [steps, setSteps] = useState(4);
  const [guidance, setGuidance] = useState(7.5);
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [negativePrompt, setNegativePrompt] = useState('');

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/ai-image-gen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          modelId: selectedModel,
          useEnhancer: enhance,
          settings: {
            width, height, numSteps: steps, guidanceScale: guidance, seed, negativePrompt
          }
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Generation failed');
      }
    } catch {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!result?.image) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${result.image}`;
    link.download = `prokit-gen-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Determine standard defaults based on model type for the UI hints
  const currentModelType = MODELS.find(m => m.id === selectedModel)?.type || 'flux';

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      {/* --- Controls Section --- */}
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-6">
        
        {/* Header & Model Select */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-1">
            <label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2 block">AI Model</label>
            <div className="relative">
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full p-3 rounded-lg border border-[var(--border)] bg-[var(--muted)]/50 appearance-none focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              >
                {MODELS.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--muted-foreground)]">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>

          <div className="flex items-end">
             <button 
               onClick={() => setEnhance(!enhance)}
               className={`h-[46px] px-4 rounded-lg border flex items-center gap-2 font-medium transition-all ${enhance ? 'bg-purple-500/10 border-purple-500/50 text-purple-600 dark:text-purple-400' : 'bg-[var(--muted)] border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
             >
               <Wand2 size={16} />
               {enhance ? 'Enhancer: ON' : 'Enhancer: OFF'}
             </button>
          </div>
        </div>

        {/* Prompt Input */}
        <div className="relative">
          <textarea 
            className="w-full h-32 p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] focus:ring-2 focus:ring-blue-500 outline-none resize-none text-lg shadow-inner placeholder:text-[var(--muted-foreground)]/50"
            placeholder="Describe your imagination... (e.g., A cyberpunk samurai standing in neon rain)"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg border transition-colors ${showSettings ? 'bg-[var(--muted)] text-[var(--foreground)]' : 'border-transparent text-[var(--muted-foreground)] hover:bg-[var(--muted)]'}`}
              title="Advanced Settings"
            >
              <Settings2 size={20} />
            </button>
            <button 
              onClick={handleGenerate}
              disabled={loading || !prompt}
              className="px-6 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-lg font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>

        {/* Advanced Settings Panel */}
        {showSettings && (
          <div className="pt-4 border-t border-[var(--border)] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-top-2">
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--muted-foreground)]">Dimensions ({width}x{height})</label>
              <div className="flex gap-2">
                <input 
                  type="number" step="64" min="256" max="1536"
                  value={width} onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full p-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm"
                  placeholder="W"
                />
                <span className="self-center text-[var(--muted-foreground)]">x</span>
                <input 
                  type="number" step="64" min="256" max="1536"
                  value={height} onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full p-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm"
                  placeholder="H"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--muted-foreground)]">Steps ({steps})</label>
              <input 
                type="range" min="1" max="50" value={steps} 
                onChange={(e) => setSteps(Number(e.target.value))}
                className="w-full h-2 bg-[var(--muted)] rounded-lg appearance-none cursor-pointer accent-[var(--foreground)]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--muted-foreground)]">Guidance ({guidance})</label>
              <input 
                type="range" min="1" max="20" step="0.5" value={guidance} 
                onChange={(e) => setGuidance(Number(e.target.value))}
                disabled={currentModelType === 'flux' && !selectedModel.includes('dev')} // Flux schnell typically ignores guidance
                className="w-full h-2 bg-[var(--muted)] rounded-lg appearance-none cursor-pointer accent-[var(--foreground)] disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--muted-foreground)]">Seed (Optional)</label>
              <input 
                type="number" 
                value={seed || ''} 
                onChange={(e) => setSeed(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Random"
                className="w-full p-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm"
              />
            </div>

            {currentModelType !== 'flux' && (
              <div className="md:col-span-2 lg:col-span-4 space-y-2">
                <label className="text-xs font-semibold text-[var(--muted-foreground)]">Negative Prompt</label>
                <input 
                  type="text" 
                  value={negativePrompt} 
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="What to exclude (e.g. blurry, deformed, ugly)"
                  className="w-full p-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm"
                />
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>

      {/* --- Output Section --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Trace / Process Log */}
        {(loading || result?.trace) && (
          <div className="lg:col-span-1 space-y-4 animate-in fade-in slide-in-from-left duration-500 order-2 lg:order-1">
             <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30">
               <h3 className="text-xs font-mono font-semibold uppercase text-[var(--muted-foreground)] mb-3 flex items-center gap-2">
                 <Layers size={14} />
                 Enhancement Chain
               </h3>
               
               <div className="space-y-6">
                 {/* Original */}
                 <div className="relative pl-4 border-l-2 border-[var(--border)]">
                   <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Input</p>
                   <p className="text-sm font-medium opacity-80">{prompt}</p>
                 </div>

                 {/* Loading State */}
                 {loading && !result && (
                   <div className="relative pl-4 border-l-2 border-blue-500 animate-pulse">
                     <p className="text-[10px] text-blue-500 uppercase tracking-wider mb-1">AI Processing</p>
                     <p className="text-sm">Refining prompt logic...</p>
                   </div>
                 )}

                 {/* Trace Results */}
                 {result?.trace?.map((t, i) => (
                   <div key={i} className="relative pl-4 border-l-2 border-purple-500">
                     <p className="text-[10px] text-purple-500 uppercase tracking-wider mb-1">Step {i+1}: {t.step}</p>
                     <p className="text-sm text-[var(--foreground)] italic leading-relaxed text-balance">
                       &quot;{t.result}&quot;
                     </p>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        )}

        {/* Image Display */}
        <div className={`${(loading || result) ? 'lg:col-span-2' : 'lg:col-span-3'} transition-all duration-500 order-1 lg:order-2`}>
          <div className="min-h-[500px] h-full flex items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--muted)]/10 relative overflow-hidden group">
            {loading ? (
              <div className="flex flex-col items-center gap-6 max-w-sm text-center px-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-purple-500 border-l-transparent animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-[var(--foreground)] animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Synthesizing Image...</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">Running {MODELS.find(m => m.id === selectedModel)?.name} on Cloudflare</p>
                </div>
              </div>
            ) : result?.image ? (
              <>
                <div className="relative w-full h-full min-h-[500px] flex items-center justify-center bg-[url('/grid-pattern.svg')]">
                  <Image 
                    src={`data:image/png;base64,${result.image}`} 
                    alt="AI Generated" 
                    width={width}
                    height={height}
                    className="max-w-full max-h-[80vh] object-contain shadow-2xl rounded-lg"
                    unoptimized
                  />
                </div>
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button 
                    onClick={downloadImage}
                    className="px-4 py-2 bg-[var(--background)]/90 backdrop-blur text-[var(--foreground)] rounded-lg font-medium flex items-center gap-2 shadow-xl border border-[var(--border)] hover:bg-[var(--background)]"
                  >
                    <Download className="w-4 h-4" />
                    Save Image
                  </button>
                </div>
              </>
            ) : (
              <div className="text-[var(--muted-foreground)] flex flex-col items-center gap-3 opacity-50 select-none">
                <ImageIcon className="w-16 h-16 stroke-1" />
                <p className="font-mono text-sm">READY TO GENERATE</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
