import { tools } from '@/lib/tools-config';
import { ToolCard } from '@/components/ui/ToolCard';
import { Search } from 'lucide-react';

export default function Home() {
  const categories = ['All', 'AI', 'Security', 'DNS', 'Dev'];

  return (
    <main className="min-h-screen bg-[var(--background)]">
      
      {/* --- Section 1: Precision Hero --- */}
      <section className="border-b border-[var(--border)] relative overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.5] pointer-events-none" />
        
        <div className="container-wide relative pt-24 pb-20">
          <div className="max-w-3xl">
            {/* Metadata Label */}
            <div className="mb-6 inline-flex items-center gap-2 px-2 py-1 border border-[var(--border)] bg-[var(--background)] rounded-sm">
               <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
               <span className="text-xs font-mono font-medium text-[var(--foreground)] uppercase tracking-wider">
                 System v0.1.0 // Online
               </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-[var(--foreground)] mb-6 text-balance">
              Professional <br />
              <span className="text-[var(--muted-foreground)]">Developer Infrastructure.</span>
            </h1>
            
            <p className="text-xl text-[var(--muted-foreground)] max-w-xl leading-relaxed">
              High-performance utilities for AI, Security, and DNS analysis. 
              Designed for transparency, speed, and agentic workflows.
            </p>
          </div>
        </div>
      </section>

      {/* --- Section 2: Control Bar --- */}
      <div className="sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className="container-wide flex flex-col md:flex-row items-center justify-between py-4 gap-4">
          
          {/* Category "Tabs" (Text-based) */}
          <div className="flex items-center gap-6 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
            {categories.map((cat, i) => (
              <button 
                key={cat}
                className={`text-sm font-medium transition-colors whitespace-nowrap ${
                  i === 0 
                  ? 'text-[var(--foreground)] border-b-2 border-[var(--foreground)]' 
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Field (Minimalist) */}
          <div className="relative w-full md:w-64">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <input 
              type="text" 
              aria-label="Filter modules"
              placeholder="Filter modules..." 
              className="w-full pl-9 pr-4 py-1.5 bg-[var(--muted)] border-none rounded-md text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:ring-1 focus:ring-[var(--foreground)] transition-all"
            />
          </div>
        </div>
      </div>

      {/* --- Section 3: The "News" Grid --- */}
      <section className="container-wide py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-[var(--border)] border border-[var(--border)]">
          {/* We use gap-px with a background color to create precise inner borders between cards */}
          
          {tools.map((tool, index) => (
            <div key={tool.slug} className="bg-[var(--background)]">
              <ToolCard tool={tool} index={index} />
            </div>
          ))}
        </div>

        {/* Footer Metrics */}
        <div className="mt-12 flex items-center justify-between border-t border-[var(--border)] pt-8">
           <p className="text-xs font-mono text-[var(--muted-foreground)]">
             PROKIT SYSTEM ID: 8FF-ABD-5CF
           </p>
           <p className="text-xs font-mono text-[var(--muted-foreground)]">
             LATENCY: 12ms
           </p>
        </div>
      </section>

    </main>
  );
}
