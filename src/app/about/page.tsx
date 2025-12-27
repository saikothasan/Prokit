import type { Metadata } from 'next';
import { Shield, Zap, Globe, Cpu } from 'lucide-react';
import React from 'react'; 

export const metadata: Metadata = {
  title: 'System Manifesto // ProKit',
  description: 'Infrastructure design and privacy protocols.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      
      {/* Hero Section */}
      <div className="border-b border-[var(--border)] py-20 bg-grid-pattern relative">
         <div className="max-w-4xl mx-auto px-6 relative z-10">
            <div className="inline-flex items-center gap-2 mb-6 border border-[var(--border)] bg-[var(--background)] px-3 py-1 rounded-sm">
              <span className="w-2 h-2 bg-blue-600 rounded-full" />
              <span className="text-xs font-mono font-medium tracking-wide">MISSION STATEMENT</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-[var(--foreground)] mb-8 leading-[0.9]">
              Utilities without <br />
              the <span className="text-[var(--muted-foreground)] line-through decoration-[var(--foreground)] decoration-2">surveillance</span>.
            </h1>
            
            <p className="text-xl text-[var(--muted-foreground)] leading-relaxed max-w-2xl">
              ProKit is a rejection of the bloated, ad-ridden web. 
              We build single-purpose, high-performance infrastructure tools that respect privacy and execute on the Edge.
            </p>
         </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-20">
        
        {/* Core Protocols */}
        <div className="space-y-16">
          <Section 
            number="01" 
            title="Privacy Protocol" 
            icon={<Shield />}
            text="Zero tracking pixels. Zero analytics sharing. Zero logs. Your inputs are processed in ephemeral runtime environments and discarded immediately after execution." 
          />
          
          <Section 
            number="02" 
            title="Edge Architecture" 
            icon={<Zap />}
            text="We leverage Cloudflare Workers to run code physically close to your location. This reduces latency to near-zero and eliminates the need for central origin servers." 
          />
          
          <Section 
            number="03" 
            title="Open Source Core" 
            icon={<Globe />}
            text="Trust requires verification. Our core logic is open source and auditable on GitHub. We believe developer tools should be transparent infrastructure, not black boxes." 
          />
        </div>

        {/* Footer Note */}
        <div className="mt-20 p-8 border border-[var(--border)] bg-[var(--muted)]/20 text-center">
          <Cpu className="w-8 h-8 text-[var(--foreground)] mx-auto mb-4" />
          <h3 className="font-bold text-[var(--foreground)] mb-2">Built by Developers, for Developers.</h3>
          <p className="text-sm text-[var(--muted-foreground)] mb-6">
            ProKit is maintained by DrKingBD as a contribution to the open web.
          </p>
          <a 
             href="https://t.me/drkingbd" 
             target="_blank"
             className="btn-agentic"
          >
             Contact Maintenance
          </a>
        </div>

      </div>
    </div>
  );
}

function Section({ number, title, icon, text }: { number: string, title: string, icon: React.ReactElement, text: string }) {
  return (
    <div className="flex gap-6 md:gap-10 items-start">
      <div className="hidden md:block font-mono text-sm text-[var(--muted-foreground)] pt-2">
        {number} {'//'}
      </div>
      <div className="flex-1">
         <div className="flex items-center gap-3 mb-4">
           <div className="p-2 bg-[var(--muted)] text-[var(--foreground)] rounded-sm border border-[var(--border)]">
             {/* Fix: Explicit cast to allow 'size' prop injection */}
             {React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}
           </div>
           <h2 className="text-2xl font-bold text-[var(--foreground)]">{title}</h2>
         </div>
         <p className="text-lg text-[var(--muted-foreground)] leading-relaxed border-l-2 border-[var(--border)] pl-6">
           {text}
         </p>
      </div>
    </div>
  );
}
