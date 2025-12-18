import Link from 'next/link';
import { Cpu, Github, Send, Twitter, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative border-t border-gray-200/60 dark:border-gray-800 bg-white dark:bg-[#050505] pt-16 pb-8 overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Top Section: Brand & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          <div className="lg:col-span-5 space-y-6">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-600 text-white">
                <Cpu size={18} />
              </div>
              <span className="text-gray-900 dark:text-white">
                ProKit<span className="text-blue-600 dark:text-blue-400">.uk</span>
              </span>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
              Professional developer tools running on the Edge. 
              Open Source, privacy-focused, and blazing fast.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <SocialLink href="https://t.me/drkingbd" icon={<Send size={18} />} label="Telegram" />
              <SocialLink href="https://github.com/saikothasan/Prokit" icon={<Github size={18} />} label="GitHub" />
              <SocialLink href="#" icon={<Twitter size={18} />} label="Twitter" />
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Tools</h4>
              <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                <li><FooterLink href="/tool/bin-checker">BIN Checker</FooterLink></li>
                <li><FooterLink href="/tool/ai-translator">AI Translator</FooterLink></li>
                <li><FooterLink href="/tool/dns-lookup">DNS Lookup</FooterLink></li>
                <li><FooterLink href="/tool/image-optimizer">Image Tools</FooterLink></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Resources</h4>
              <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                <li><FooterLink href="/blog">Developer Blog</FooterLink></li>
                <li><FooterLink href="/api-docs">API Documentation</FooterLink></li>
                <li><FooterLink href="/status">System Status</FooterLink></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                <li><FooterLink href="/privacy">Privacy Policy</FooterLink></li>
                <li><FooterLink href="/terms">Terms of Service</FooterLink></li>
                <li><FooterLink href="/cookies">Cookie Policy</FooterLink></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            © {new Date().getFullYear()} ProKit.uk. All rights reserved.
          </p>
          
          <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-500">
            <span>Made with</span>
            <Heart size={14} className="text-red-500 fill-red-500" />
            <span>by</span>
            <a 
              href="https://t.me/drkingbd" 
              target="_blank" 
              className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              DrKingBD
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Helper Components
function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      href={href} 
      target="_blank"
      className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all hover:scale-105"
      aria-label={label}
    >
      {icon}
    </Link>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors block"
    >
      {children}
    </Link>
  );
}
