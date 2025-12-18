'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Cpu, Send, Menu, X, Github, ChevronRight } from 'lucide-react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/50 dark:border-gray-800 bg-white/70 dark:bg-[#050505]/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* 1. Brand Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-2.5 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity"
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20">
            <Cpu size={18} />
          </div>
          <span className="text-gray-900 dark:text-white">
            ProKit<span className="text-blue-600 dark:text-blue-400">.uk</span>
          </span>
        </Link>

        {/* 2. Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-400">
          <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            All Tools
          </Link>
          <Link href="/categories" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Categories
          </Link>
          <Link href="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            About
          </Link>
        </nav>

        {/* 3. Action Buttons (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <Link 
            href="https://github.com/saikothasan/Prokit" 
            target="_blank"
            className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            title="Star on GitHub"
          >
            <Github size={20} />
          </Link>

          <Link 
            href="https://t.me/drkingbd" 
            target="_blank"
            className="group relative inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5"
          >
            <Send size={14} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-300" />
            <span>Join Channel</span>
          </Link>
        </div>

        {/* 4. Mobile Menu Button */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* 5. Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#050505] animate-in slide-in-from-top-2 duration-200">
          <div className="p-4 space-y-4">
            <nav className="flex flex-col gap-2">
              <MobileLink href="/" onClick={() => setIsMenuOpen(false)}>All Tools</MobileLink>
              <MobileLink href="/categories" onClick={() => setIsMenuOpen(false)}>Categories</MobileLink>
              <MobileLink href="/about" onClick={() => setIsMenuOpen(false)}>About ProKit</MobileLink>
            </nav>
            
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-3">
              <Link 
                href="https://t.me/drkingbd"
                target="_blank"
                className="flex items-center justify-center gap-2 w-full p-3 rounded-xl bg-[#0088cc]/10 text-[#0088cc] font-medium"
              >
                <Send size={16} /> Join Telegram
              </Link>
              <Link 
                href="https://github.com/saikothasan/nn"
                target="_blank" 
                className="flex items-center justify-center gap-2 w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
              >
                <Github size={16} /> Star on GitHub
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// Helper for Mobile Links
function MobileLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className="flex items-center justify-between p-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
    >
      <span className="font-medium">{children}</span>
      <ChevronRight size={16} className="text-gray-400" />
    </Link>
  );
}
