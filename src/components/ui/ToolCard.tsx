import Link from 'next/link';
import { ArrowUpRight, Activity } from 'lucide-react';
import { Tool } from '@/lib/tools-config';

interface ToolCardProps {
  tool: Tool;
  index: number;
}

export function ToolCard({ tool, index }: ToolCardProps) {
  // Format slug to look like a serial number (e.g., "DNS-LOOKUP" -> "DNS-01")
  const serialId = `${tool.category.toUpperCase().slice(0, 3)}-${String(index + 1).padStart(2, '0')}`;

  return (
    <Link 
      href={`/tool/${tool.slug}`}
      className="group relative flex flex-col h-full border border-[var(--border)] bg-[var(--background)] hover:border-[var(--foreground)] transition-colors duration-300"
    >
      {/* 1. Visual "Art" Area (Top Half - 1:1 aspect ratio feel) */}
      <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-[var(--border)] bg-[var(--muted)]">
        {/* Halftone Pattern Overlay */}
        <div className="absolute inset-0 bg-halftone opacity-[0.15] group-hover:scale-105 transition-transform duration-700" />
        
        {/* Centered Technical Icon */}
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
           <tool.icon strokeWidth={1} className="w-16 h-16 text-[var(--foreground)] opacity-80 group-hover:scale-110 transition-transform duration-500" />
        </div>

        {/* Live Status Indicator */}
        <div className="absolute top-3 left-3 flex items-center gap-2" title="System Operational">
           <div className="flex items-center justify-center w-5 h-5 bg-white dark:bg-black border border-[var(--border)] rounded-full" aria-hidden="true">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
           </div>
           <span className="sr-only">System Operational</span>
        </div>

        {/* Serial ID */}
        <div className="absolute top-3 right-3">
          <span className="font-mono text-[10px] tracking-widest uppercase text-[var(--muted-foreground)]">
            {serialId}
          </span>
        </div>
      </div>

      {/* 2. Data/Content Area */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold tracking-tight text-[var(--foreground)] group-hover:underline decoration-1 underline-offset-4">
            {tool.name}
          </h3>
          <ArrowUpRight className="w-4 h-4 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors" aria-hidden="true" />
        </div>

        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed line-clamp-2 mb-6 flex-1">
          {tool.description}
        </p>

        {/* 3. Technical Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)] mt-auto">
          <div className="flex items-center gap-2">
             <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium font-mono uppercase border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)]">
               {tool.category}
             </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono text-[var(--muted-foreground)]" title="Status: Ready">
            <Activity className="w-3 h-3" aria-hidden="true" />
            <span aria-label="Status: Ready">RDY</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
