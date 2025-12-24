import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTool, getToolsByCategory, tools } from '@/lib/tools-config';
import { Metadata } from 'next';
import { ChevronRight, Home, Share2, ShieldCheck, Send, Zap, Star } from 'lucide-react';

type Props = {
  params: Promise<{ slug: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  
  if (!tool) return { title: 'Tool Not Found' };

  return {
    title: `${tool.name} - Free Online Tool | ProKit`,
    description: tool.description,
    keywords: tool.keywords,
    alternates: {
      canonical: `https://prokit.uk/tool/${slug}`,
    },
    openGraph: {
      title: tool.name,
      description: tool.description,
      type: 'website',
      url: `https://prokit.uk/tool/${slug}`,
      siteName: 'ProKit Developer Tools',
    }
  };
}

export async function generateStaticParams() {
  return tools.map((tool) => ({
    slug: tool.slug,
  }));
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = getTool(slug);

  if (!tool) notFound();

  const ToolComponent = tool.component;
  const relatedTools = getToolsByCategory(tool.category).filter(t => t.slug !== tool.slug).slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    operatingSystem: 'Web',
    applicationCategory: tool.category,
    description: tool.description,
    url: `https://prokit.uk/tool/${slug}`,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1240'
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] selection:bg-blue-500/30">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm text-gray-500 mb-8 overflow-x-auto whitespace-nowrap pb-2">
          <Link href="/" className="hover:text-blue-600 flex items-center gap-1 transition-colors">
            <Home className="w-4 h-4" /> Home
          </Link>
          <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
          <Link href={`/categories/${tool.category}`} className="capitalize hover:text-blue-600 transition-colors">
             {tool.category} Tools
          </Link>
          <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
          <span className="text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md">
            {tool.name}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Tool Header */}
            <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-gray-50 dark:from-[#111] dark:to-[#0a0a0a] border border-gray-200 dark:border-gray-800 p-8 md:p-10 shadow-sm">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-5 dark:opacity-10 pointer-events-none">
                <tool.icon className="w-64 h-64" />
              </div>
              
              <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 capitalize border border-blue-200 dark:border-blue-900/50">
                    {tool.category}
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
                    <ShieldCheck className="w-3.5 h-3.5" /> Secure & Private
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
                    <Zap className="w-3.5 h-3.5" /> Edge Powered
                  </span>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
                  {tool.name}
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
                  {tool.description}
                </p>
              </div>
            </header>

            {/* Tool Interactive Component */}
            <div className="min-h-[400px]">
              <ToolComponent />
            </div>

          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            
            {/* Telegram Promo */}
            <a 
               href="https://t.me/drkingbd"
               target="_blank"
               className="group block bg-gradient-to-br from-[#0088cc] to-[#0077b5] rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.02] transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                 <h3 className="font-bold text-xl flex items-center gap-2">
                   <Send className="w-6 h-6" /> Telegram
                 </h3>
                 <div className="bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition-colors">
                   <ChevronRight className="w-4 h-4" />
                 </div>
              </div>
              <p className="text-blue-50 text-sm mb-6 leading-relaxed">
                Join our developer community. Get exclusive tools, API keys, and updates directly in your feed.
              </p>
              <div className="bg-white/10 backdrop-blur-md py-3 px-4 rounded-xl text-sm font-semibold text-center border border-white/20 group-hover:bg-white/20 transition-colors">
                 @drkingbd
              </div>
            </a>

            {/* Related Tools */}
            {relatedTools.length > 0 && (
              <div className="bg-white dark:bg-[#111] rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /> 
                  Similar Tools
                </h3>
                <div className="space-y-4">
                  {relatedTools.map((t) => (
                    <Link 
                      key={t.slug}
                      href={`/tool/${t.slug}`}
                      className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 group transition-all duration-200 border border-transparent hover:border-gray-100 dark:hover:border-gray-800"
                    >
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                        <t.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {t.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 line-clamp-1 mt-0.5">
                          {t.description}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
