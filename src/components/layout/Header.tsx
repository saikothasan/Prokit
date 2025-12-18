import Link from 'next/link';
import { Cpu } from 'lucide-react'; // Using icons from your package.json

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="p-1.5 bg-black dark:bg-white text-white dark:text-black rounded-lg">
            <Cpu size={20} />
          </div>
          <span>DevTools<span className="text-blue-600">.pro</span></span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600 dark:text-gray-400">
          <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">All Tools</Link>
          <Link href="/categories" className="hover:text-black dark:hover:text-white transition-colors">Categories</Link>
          <Link href="/about" className="hover:text-black dark:hover:text-white transition-colors">About</Link>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-4">
          <Link 
            href="https://github.com/saikothasan/nn" 
            target="_blank"
            className="hidden sm:block text-xs font-mono bg-gray-100 dark:bg-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-200 transition-colors"
          >
            Star on GitHub
          </Link>
        </div>
      </div>
    </header>
  );
}
