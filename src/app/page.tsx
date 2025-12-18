import Link from 'next/link';
import { tools } from '@/lib/tools-config';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-black selection:bg-blue-100">
      
      {/* Hero Section */}
      <div className="py-24 px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-500 bg-clip-text text-transparent">
          Professional Tools <br /> for Developers
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
          A suite of free, privacy-focused utilities for AI, Security, DNS, and Development. 
          Open Source and powered by Cloudflare.
        </p>
        
        {/* Search Bar Placeholder */}
        <div className="max-w-md mx-auto relative mb-20">
          <input 
            type="text" 
            placeholder="Search for a tool..." 
            className="w-full h-12 pl-4 pr-12 rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Tool Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link 
              key={tool.slug} 
              href={`/tool/${tool.slug}`}
              className="group block p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-900 hover:shadow-lg hover:border-blue-500/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white dark:bg-black rounded-lg border border-gray-100 dark:border-gray-800 group-hover:scale-110 transition-transform">
                  <tool.icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </div>
                <span className="text-xs font-mono py-1 px-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  {tool.category}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {tool.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
