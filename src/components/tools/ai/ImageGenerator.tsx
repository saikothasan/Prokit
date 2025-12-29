'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Sparkles, Download, Loader2, Image as ImageIcon, Wand2, ArrowRight } from 'lucide-react';

interface GenResponse {
  success: boolean;
  image: string;
  finalPrompt: string;
  isEnhanced: boolean;
  error?: string;
}

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [usedPrompt, setUsedPrompt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [enhance, setEnhance] = useState(true);
  const [status, setStatus] = useState(''); // 'enhancing' | 'generating' | ''
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setStatus(enhance ? 'enhancing' : 'generating');
    setError('');
    setImage(null);
    setUsedPrompt(null);

    try {
      const res = await fetch('/api/ai-image-gen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, useEnhancer: enhance })
      });
      
      // Update status if we were enhancing, now we are just waiting for the image
      if (enhance) setStatus('generating');

      const data = (await res.json()) as GenResponse;
      
      if (data.success) {
        setImage(`data:image/png;base64,${data.image}`);
        setUsedPrompt(data.finalPrompt);
      } else {
        setError(data.error || 'Generation failed');
      }
    } catch (e) {
      setError('Network error occurred');
      console.error(e);
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const downloadImage = () => {
    if (!image) return;
    const link = document.createElement('a');
    link.href = image;
    link.download = `flux-2-gen-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Controls Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
           <label className="text-sm font-medium text-[var(--muted-foreground)]">Prompt Logic</label>
           <button 
             onClick={() => setEnhance(!enhance)}
             className={`flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full border transition-colors ${enhance ? 'bg-purple-500/10 border-purple-500/50 text-purple-500' : 'bg-[var(--muted)] border-transparent text-[var(--muted-foreground)]'}`}
           >
             <Wand2 size={12} />
             {enhance ? 'AI ENHANCEMENT: ON' : 'RAW MODE'}
           </button>
        </div>

        <div className="relative group">
          <textarea 
            className="w-full h-28 p-5 rounded-xl border border-[var(--border)] bg-[var(--background)] focus:ring-2 focus:ring-blue-500 outline-none resize-none text-lg shadow-sm transition-all"
            placeholder="Describe your imagination..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="absolute bottom-4 right-4">
            <button 
              onClick={handleGenerate}
              disabled={loading || !prompt}
              className="px-6 py-2.5 rounded-lg bg-[var(--foreground)] text-[var(--background)] font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {loading ? (status === 'enhancing' ? 'Enhancing...' : 'Rendering...') : 'Generate'}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Workflow Info (Visible after generation) */}
        {usedPrompt && (
          <div className="lg:col-span-1 space-y-4 animate-in fade-in slide-in-from-left duration-500">
             <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30">
               <h3 className="text-xs font-mono font-semibold uppercase text-[var(--muted-foreground)] mb-3 flex items-center gap-2">
                 <Wand2 size={12} />
                 Prompt Chain
               </h3>
               
               <div className="space-y-4">
                 <div className="relative pl-4 border-l-2 border-[var(--border)]">
                   <p className="text-xs text-[var(--muted-foreground)] mb-1">User Input</p>
                   {/* FIXED: Escaped quotes */}
                   <p className="text-sm font-medium line-clamp-2">&quot;{prompt}&quot;</p>
                 </div>
                 
                 <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)] rotate-90 lg:rotate-0 mx-auto lg:mx-0" />
                 
                 <div className="relative pl-4 border-l-2 border-purple-500">
                   <p className="text-xs text-purple-500 mb-1">Flux 2 Optimized</p>
                   {/* FIXED: Escaped quotes */}
                   <p className="text-sm text-[var(--foreground)] italic leading-relaxed">
                     &quot;{usedPrompt}&quot;
                   </p>
                 </div>
               </div>
             </div>
          </div>
        )}

        {/* Image Output */}
        <div className={`${usedPrompt ? 'lg:col-span-2' : 'lg:col-span-3'} transition-all duration-500`}>
          <div className="min-h-[500px] h-full flex items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--muted)]/10 relative overflow-hidden group">
            {loading ? (
              <div className="flex flex-col items-center gap-6 max-w-sm text-center px-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-purple-500 border-l-transparent animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-[var(--foreground)] animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    {status === 'enhancing' ? 'Refining Concept...' : 'Synthesizing Image...'}
                  </h3>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Running Flux 2 [dev] model on Cloudflare Workers AI
                  </p>
                </div>
              </div>
            ) : image ? (
              <>
                {/* FIXED: Using Next.js Image component with unoptimized prop for base64 */}
                <div className="relative w-full h-full min-h-[500px]">
                  <Image 
                    src={image} 
                    alt="Flux Generated" 
                    fill
                    className="object-contain p-2"
                    unoptimized
                  />
                </div>
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button 
                    onClick={downloadImage}
                    className="px-4 py-2 bg-[var(--background)]/80 backdrop-blur text-[var(--foreground)] rounded-lg font-medium flex items-center gap-2 hover:bg-[var(--background)] shadow-lg border border-[var(--border)]"
                  >
                    <Download className="w-4 h-4" />
                    Save
                  </button>
                </div>
              </>
            ) : (
              <div className="text-[var(--muted-foreground)] flex flex-col items-center gap-3 opacity-50">
                <ImageIcon className="w-16 h-16 stroke-1" />
                <p className="font-mono text-sm">NO_OUTPUT_DETECTED</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
