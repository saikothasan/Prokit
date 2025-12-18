import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <h3 className="font-bold mb-4">DevTools.pro</h3>
          <p className="text-sm text-gray-500">
            Professional developer tools powered by Cloudflare Workers and Next.js.
          </p>
        </div>
        
        {/* Dynamic Category Links */}
        <div>
          <h4 className="font-semibold mb-4 text-sm">Tools</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><Link href="/tool/bin-checker" className="hover:text-blue-600">Security Tools</Link></li>
            <li><Link href="/tool/ai-translator" className="hover:text-blue-600">AI Tools</Link></li>
            <li><Link href="/tool/dns-lookup" className="hover:text-blue-600">DNS Tools</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-sm">Legal</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><Link href="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-blue-600">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-6 border-t border-gray-200 dark:border-gray-800 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} DevTools. All rights reserved.
      </div>
    </footer>
  );
}
