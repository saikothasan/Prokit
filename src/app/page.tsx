import Link from 'next/link';
import { tools } from '@/lib/tools-config';
import { ArrowRight, Search, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50/50 dark:bg-black selection:bg-blue-500/30">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-gray-200/50 dark:border-gray-800 bg-white dark:bg-[#050505]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]"></div>
        
        <div className="relative max-w-5xl mx-auto px-6 pt-32 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-6 border border-blue-100 dark:border-blue-800">
            <Sparkles className="w-3 h-3" />
            <span>v2.0 Now Available</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-8">
            Developer tools for the <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">modern web</span>.
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            A privacy-focused suite of utilities for developers. Open Source, 
            no tracking, and powered by Cloudflare's edge network.
          </p>
          
          {/* Search Input */}
          <div className="max-w-md mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full opacity-20 group-hover:opacity-40 blur transition duration-200"></div>
            <div className="relative flex items-center bg-white dark:bg-black rounded-full border border-gray-200 dark:border-gray-800 shadow-sm">
              <Search className="w-5 h-5 text-gray-400 ml-4" />
              <input 
                type="text" 
                placeholder="Search for a tool (e.g., DNS, BIN, AI)..." 
                className="w-full h-14 pl-3 pr-6 rounded-full bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories & Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        
        {/* Category Filter Tabs (Visual) */}
        <div className="flex flex-wrap justify-center gap-2 mb-16">
          {['All', 'AI', 'Security', 'DNS', 'Image'].map((cat, i) => (
            <button 
              key={cat}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                i === 0 
                ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg shadow-gray-200 dark:shadow-none' 
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link 
              key={tool.slug} 
              href={`/tool/${tool.slug}`}
              className="group relative bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="p-3.5 bg-gray-50 dark:bg-gray-900 rounded-2xl text-gray-900 dark:text-white group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <tool.icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 dark:text-blue-400 text-sm font-medium">
                  Open <ArrowRight className="w-4 h-4" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {tool.name}
              </h3>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-4">
                {tool.description}
              </p>

              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-1 bg-gray-100 dark:bg-gray-900 text-gray-500 rounded-md">
                  {tool.category}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
