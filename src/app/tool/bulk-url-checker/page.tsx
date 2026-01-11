"use client";

import { useState } from "react";
import { checkBulkUrls, type UrlCheckResult } from "./actions";
import { Loader2, CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function BulkUrlCheckerPage() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<UrlCheckResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setResults(null);

    // Split by newlines and filter empty lines
    const urls = input.split(/[\n,]+/).map(u => u.trim()).filter(Boolean);

    if (urls.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const data = await checkBulkUrls(urls);
      setResults(data);
    } catch (e) {
      console.error("Error checking URLs:", e);
      // Handle global error if needed
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "up") return "text-green-600 bg-green-50 border-green-200";
    if (status === "down") return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getStatusIcon = (status: string) => {
    if (status === "up") return <CheckCircle className="w-4 h-4" />;
    if (status === "down") return <AlertCircle className="w-4 h-4" />;
    return <XCircle className="w-4 h-4" />;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Bulk URL / Domain Checker
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Check the status and response time of multiple websites simultaneously.
          High-speed parallel processing powered by Cloudflare Workers.
        </p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter URLs or domains (one per line)&#10;example.com&#10;https://google.com&#10;cloudflare.com"
            className="w-full h-48 p-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-sm resize-y"
          />
          <div className="absolute bottom-4 right-4 text-xs text-gray-400">
            {input.split(/\n/).filter(line => line.trim()).length} URLs
          </div>
        </div>

        <button
          onClick={handleCheck}
          disabled={loading || !input.trim()}
          className={cn(
            "flex items-center justify-center w-full sm:w-auto px-8 py-3 rounded-lg font-medium text-white transition-all",
            loading || !input.trim()
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-95"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            "Check URLs"
          )}
        </button>
      </div>

      {results && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Results</h2>
            <div className="text-sm text-gray-500">
              {results.filter(r => r.status === 'up').length} Up &bull; {results.filter(r => r.status !== 'up').length} Down/Error
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">URL</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-center">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">Code</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                {results.map((result, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-gray-700 dark:text-gray-300 truncate max-w-[200px] sm:max-w-md" title={result.url}>
                      {result.url}
                      {result.error && (
                        <div className="text-xs text-red-500 mt-0.5">{result.error}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                        getStatusColor(result.status)
                      )}>
                        {getStatusIcon(result.status)}
                        <span className="uppercase">{result.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-gray-600 dark:text-gray-400">
                      {result.statusCode || "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {result.responseTime !== undefined ? (
                        <span className={cn(
                          "inline-flex items-center gap-1",
                          result.responseTime < 500 ? "text-green-600" : result.responseTime < 1500 ? "text-yellow-600" : "text-red-600"
                        )}>
                          <Clock className="w-3 h-3" />
                          {result.responseTime}ms
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
