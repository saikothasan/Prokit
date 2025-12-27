import Link from 'next/link';
import { Cpu, Github, Send, ArrowUpRight, ShieldCheck, Activity, Globe } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative border-t border-[var(--border)] bg-[var(--background)] overflow-hidden">
      
      {/* Visual Pattern Overlay (Halftone) */}
      <div className="absolute inset-0 bg-halftone opacity-[0.05] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto">
        
        {/* Top Section: Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[var(--border)]">
          
          {/* Brand Column */}
          <div className="p-8 md:p-12 space-y-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-6 h-6 rounded-sm bg-[var(--foreground)] text-[var(--background)]">
                <Cpu size={14} />
              </div>
              <span className="font-bold text-sm tracking-tight text-[var(--foreground)]">
                PROKIT.UK
              </span>
            </Link>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed font-mono">
              Advanced utility infrastructure for the modern web. 
              Running on Edge Runtime.
            </p>
            <div className="flex gap-4">
              <SocialIcon href="https://github.com/saikothasan/Prokit" icon={<Github size={16} />} />
              <SocialIcon href="https://t.me/drkingbd" icon={<Send size={16} />} />
            </div>
          </div>

          {/* Tools Index */}
          <div className="p-8 md:p-12">
            <h4 className="font-mono text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider mb-6">
              // Core_Modules
            </h4>
            <ul className="space-y-3">
              <FooterLink href="/tool/bin-checker" code="SEC-01">BIN Inspector</FooterLink>
              <FooterLink href="/tool/ai-translator" code="AI-02">Neural Translate</FooterLink>
              <FooterLink href="/tool/dns-lookup" code="DNS-05">DNS Propagation</FooterLink>
              <FooterLink href="/tool/image-optimizer" code="IMG-09">Media Optimize</FooterLink>
            </ul>
          </div>
          
          {/* Resources Index */}
          <div className="p-8 md:p-12">
            <h4 className="font-mono text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider mb-6">
              // Documentation
            </h4>
            <ul className="space-y-3">
              <FooterLink href="/blog" code="DOC-01">Engineering Blog</FooterLink>
              <FooterLink href="/api-docs" code="API-00">API Reference</FooterLink>
              <FooterLink href="/status" code="SYS-STAT">System Status</FooterLink>
            </ul>
          </div>

          {/* Legal / Compliance */}
          <div className="p-8 md:p-12">
            <h4 className="font-mono text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider mb-6">
              // Compliance
            </h4>
            <ul className="space-y-3">
              <FooterLink href="/privacy" code="LEG-01">Privacy Protocol</FooterLink>
              <FooterLink href="/terms" code="LEG-02">Terms of Use</FooterLink>
            </ul>
          </div>
        </div>

        {/* Bottom System Bar */}
        <div className="border-t border-[var(--border)] bg-[var(--muted)]/50 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-mono uppercase tracking-wide text-[var(--muted-foreground)]">
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <ShieldCheck size={12} />
              <span>SECURE CONNECTION</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Globe size={12} />
              <span>REGION: GLOBAL_EDGE</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Activity size={12} />
              <span>UPTIME: 99.99%</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span>© {new Date().getFullYear()} PROKIT SYSTEMS. ENGINEERED BY</span>
            <a 
              href="https://t.me/drkingbd" 
              target="_blank" 
              className="text-[var(--foreground)] hover:underline decoration-1 underline-offset-2"
            >
              DRKINGBD
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}

// Sub-components
function SocialIcon({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      target="_blank"
      className="p-2 border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--foreground)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-all"
    >
      {icon}
    </Link>
  );
}

function FooterLink({ href, children, code }: { href: string; children: React.ReactNode; code: string }) {
  return (
    <Link 
      href={href} 
      className="group flex items-center justify-between text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
    >
      <span className="flex items-center gap-3">
        <span className="text-[10px] font-mono text-[var(--border)] group-hover:text-blue-500 transition-colors">
          {code}
        </span>
        {children}
      </span>
      <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}
