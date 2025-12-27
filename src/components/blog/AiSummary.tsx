'use client';

import { useState } from 'react';
import { Sparkles, Bot } from 'lucide-react';

export function AiSummary({ content }: { content: string }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai-blog-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const json = await res.json();
      if (json.success) {
        setSummary(json.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-8 p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-semibold">
          <Sparkles className="w-5 h-5" />
          <span>AI Takeaways</span>
        </div>
        {!summary && !loading && (
          <button
            onClick={handleSummarize}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
          >
            <Bot className="w-3 h-3" />
            Generate Summary
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center space-x-2 text-sm text-gray-500 animate-pulse">
           <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
           <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
           <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"></div>
           <span>Analyzing content...</span>
        </div>
      )}

      {summary && (
        <div className="prose prose-sm dark:prose-invert text-gray-700 dark:text-gray-300 leading-relaxed animate-in fade-in slide-in-from-bottom-2">
          {summary}
        </div>
      )}
    </div>
  );
}
