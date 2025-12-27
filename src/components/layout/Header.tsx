'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Cpu, Menu, X, Github, Terminal } from 'lucide-react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        
        {/* 1. Technical Brand Identifier */}
        <Link 
          href="/" 
          className="group flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-sm bg-[var(--foreground)] text-[var(--background)]">
            <Cpu size={16} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-bold text-sm tracking-tight text-[var(--foreground)]">
              PROKIT<span className="text-[var(--muted-foreground)]">.UK</span>
            </span>
            <span className="text-[10px] font-mono text-[var(--muted-foreground)] group-hover:text-blue-500 transition-colors">
              SYS.V.1.0
            </span>
          </div>
        </Link>

        {/* 2. Desktop Navigation (Breadcrumb Style) */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-[var(--muted-foreground)]">
          <NavLink href="/">/index</NavLink>
          <span className="text-[var(--border)]">/</span>
          <NavLink href="/categories">/modules</NavLink>
          <span className="text-[var(--border)]">/</span>
          <NavLink href="/about">/specs</NavLink>
        </nav>

        {/* 3. Status & Actions */}
        <div className="hidden md:flex items-center gap-4">
          {/* Live Status Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-sm bg-[var(--muted)] border border-[var(--border)]">
             <div className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
             </div>
             <span className="text-[10px] font-mono font-medium text-[var(--foreground)]">
               SYSTEM ONLINE
             </span>
          </div>

          <div className="h-4 w-px bg-[var(--border)]" />

          <Link 
            href="https://github.com/saikothasan/Prokit" 
            target="_blank"
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            <Github size={18} />
          </Link>

          <Link 
            href="https://t.me/drkingbd" 
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-medium bg-[var(--foreground)] text-[var(--background)] rounded-sm hover:opacity-90 transition-all"
          >
            <Terminal size={12} />
            <span>JOIN NET</span>
          </Link>
        </div>

        {/* 4. Mobile Toggle */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-[var(--foreground)] hover:bg-[var(--muted)] rounded-sm transition-colors"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* 5. Mobile Menu (Technical List) */}
      {isMenuOpen && (
        <div className="md:hidden border-b border-[var(--border)] bg-[var(--background)]">
          <div className="p-4 space-y-1 font-mono text-sm">
            <MobileLink href="/" onClick={() => setIsMenuOpen(false)} index="01">Index</MobileLink>
            <MobileLink href="/categories" onClick={() => setIsMenuOpen(false)} index="02">Modules</MobileLink>
            <MobileLink href="/about" onClick={() => setIsMenuOpen(false)} index="03">Specifications</MobileLink>
            
            <div className="mt-4 pt-4 border-t border-[var(--border)] grid grid-cols-2 gap-2">
              <Link 
                href="https://t.me/drkingbd"
                target="_blank"
                className="flex items-center justify-center gap-2 p-2 text-xs font-medium border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)]"
              >
                TELEGRAM
              </Link>
              <Link 
                href="https://github.com/saikothasan/Prokit"
                target="_blank" 
                className="flex items-center justify-center gap-2 p-2 text-xs font-medium border border-[var(--border)] bg-[var(--foreground)] text-[var(--background)]"
              >
                GITHUB
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="px-3 py-1 rounded-sm hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
    >
      {children}
    </Link>
  );
}

function MobileLink({ href, children, onClick, index }: { href: string; children: React.ReactNode; onClick: () => void; index: string }) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className="flex items-center gap-4 p-3 hover:bg-[var(--muted)] transition-colors"
    >
      <span className="text-[var(--muted-foreground)] text-xs">{index} {`//`}</span>
      <span className="font-medium text-[var(--foreground)] uppercase">{children}</span>
    </Link>
  );
}
