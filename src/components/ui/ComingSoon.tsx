import Link from 'next/link';
import { Construction, ArrowLeft } from 'lucide-react';

export default function ComingSoon() {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 animate-in fade-in zoom-in duration-500">
      
      {/* Icon Container */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-full blur-xl opacity-50" />
        <div className="relative bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700" aria-hidden="true">
          <Construction className="w-10 h-10 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      {/* Text Content */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
        Work in Progress
      </h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
        We are crafting this tool with precision. It will be available in the next update. 
        Check back soon!
      </p>

      {/* Action Button */}
      <Link 
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Explore Other Tools
      </Link>
    </div>
  );
}
