import { 
  Cpu,
  ScanEye,
  FileText,
  Camera,
  Terminal,
  Lock, 
  Globe, 
  Image as ImageIcon,
  MapPin,
  ShieldCheck, // New: for SSL
  Server,      // New: for Port Scanner
  Key,         // New: for Crypto Lab
  LucideIcon 
} from 'lucide-react';
import dynamic from 'next/dynamic';
import React from 'react';

// --- 1. Dynamic Component Imports ---

// Security Tools
const BinChecker = dynamic(() => import('@/components/tools/security/BinChecker'), {
  loading: () => <ToolLoader name="BIN Checker" />,
});

const SslInspector = dynamic(() => import('@/components/tools/security/SslInspector'), {
  loading: () => <ToolLoader name="SSL Inspector" />,
});

const TestAgent = dynamic(() => import('@/components/tools/browser/TestAgent'), {
  loading: () => <ToolLoader name="Website Testing Agent" />,
});

const PortScanner = dynamic(() => import('@/components/tools/security/PortScanner'), {
  loading: () => <ToolLoader name="Port Scanner" />,
});

const CryptoLab = dynamic(() => import('@/components/tools/security/CryptoLab'), {
  loading: () => <ToolLoader name="Crypto Lab" />,
});

// DNS Tools
const DnsLookup = dynamic(() => import('@/components/tools/dns/DnsLookup'), {
  loading: () => <ToolLoader name="DNS Lookup" />,
});

// Dev Tools
const CurlRunner = dynamic(() => import('@/components/tools/dev/CurlTool'), {
  loading: () => <ToolLoader name="Curl Runner" />,
});

const FakeAddressGenerator = dynamic(() => import('@/components/tools/dev/FakeAddressGenerator'), {
  loading: () => <ToolLoader name="Fake Address Gen" />,
});

// AI Tools
const MarkdownConverter = dynamic(() => import('@/components/tools/ai/MarkdownConverter'), {
  loading: () => <ToolLoader name="AI Markdown Converter" />,
});

const Translator = dynamic(() => import('@/components/tools/ai/Translator'), {
  loading: () => <ToolLoader name="AI Translator" />,
});

const SiteAudit = dynamic(() => import('@/components/tools/ai/SiteAudit'), {
  loading: () => <ToolLoader name="Site Audit" />,
});

const WebExtractor = dynamic(() => import('@/components/tools/ai/WebExtractor'), {
  loading: () => <ToolLoader name="AI Web Scraper" />,
});

// Browser/Image Tools
const ScreenshotTool = dynamic(() => import('@/components/tools/browser/Screenshot'), {
  loading: () => <ToolLoader name="Screenshot Tool" />,
});

const ImageOptimizer = dynamic(() => import('@/components/tools/image/ImageOptimizer'), {
  loading: () => <ToolLoader name="Image Optimizer" />,
});


// --- 2. Type Definitions ---
export type ToolCategory = 'ai' | 'security' | 'dns' | 'image' | 'email' | 'dev';

export interface Tool {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: LucideIcon;
  keywords: string[];
  component: React.ComponentType; 
}

// --- 3. Configuration ---
export const tools: Tool[] = [
  // --- Security ---
  {
    slug: 'bin-checker',
    name: 'BIN Checker',
    description: 'Validate and retrieve details for any Bank Identification Number immediately.',
    category: 'security',
    icon: Lock,
    keywords: ['bin lookup', 'credit card validator', 'bank identifier', 'payment security'],
    component: BinChecker,
  },
  {
    slug: 'ssl-inspector',
    name: 'SSL/TLS Inspector',
    description: 'Deep analyze SSL certificates, expiry dates, and handshake protocols.',
    category: 'security',
    icon: ShieldCheck,
    keywords: ['ssl', 'cert', 'https', 'security', 'tls', 'inspector'],
    component: SslInspector,
  },
	{
    slug: 'web-agent',
    name: 'Website Testing Agent',
    description: 'Run deep diagnostic performance tests (LCP, CLS, TTFB) across different browsers.',
    category: 'image',
    icon: Globe,
    keywords: ['telescope', 'browser test', 'performance', 'lcp', 'metrics', 'agent'],
    component: TestAgent,
  },
  {
    slug: 'port-scanner',
    name: 'TCP Port Scanner',
    description: 'Scan common ports (FTP, SSH, HTTP, SQL) on any target server or IP.',
    category: 'security',
    icon: Server,
    keywords: ['nmap', 'port', 'network', 'tcp', 'open ports'],
    component: PortScanner,
  },
  {
    slug: 'crypto-lab',
    name: 'Crypto Key Generator',
    description: 'Generate production-grade RSA keys, API secrets, and JWT tokens.',
    category: 'security',
    icon: Key,
    keywords: ['rsa', 'crypto', 'generator', 'secret', 'jwt', 'key pair'],
    component: CryptoLab,
  },

  // --- AI ---
  {
    slug: 'site-audit-ai',
    name: 'SiteScan AI Auditor',
    description: 'Autonomous website auditing powered by Cloudflare Browser Rendering and AI Gateway.',
    category: 'ai',
    icon: ScanEye,
    keywords: ['audit', 'seo', 'ux', 'ai', 'vision'],
    component: SiteAudit,
  },
  {
    slug: 'ai-markdown-converter',
    name: 'AI Markdown Converter',
    description: 'Convert any website into clean, structured Markdown using AI.',
    category: 'ai',
    icon: FileText,
    keywords: ['markdown', 'converter', 'html to markdown', 'web scraper'],
    component: MarkdownConverter,
  },
  {
    slug: 'ai-web-scraper',
    name: 'Smart Web Scraper',
    description: 'Extract specific data, summaries, or insights from any webpage using AI.',
    category: 'ai',
    icon: Cpu,
    keywords: ['scraping', 'extraction', 'ai analysis', 'summary', 'data mining'],
    component: WebExtractor,
  },
  {
    slug: 'ai-translator',
    name: 'AI Translator',
    description: 'Context-aware translation using Cloudflare Neural Networks.',
    category: 'ai',
    icon: Globe,
    keywords: ['translation', 'ai language', 'polyglot', 'neural network'],
    component: Translator,
  },

  // --- Image ---
  {
    slug: 'website-screenshot',
    name: 'Website Screenshot',
    description: 'Capture high-quality screenshots of any website using Cloudflare Browser Rendering.',
    category: 'image',
    icon: Camera,
    keywords: ['screenshot', 'capture', 'web', 'browser', 'rendering'],
    component: ScreenshotTool,
  },
  {
    slug: 'image-optimizer',
    name: 'Image Optimizer',
    description: 'Compress and resize images to WebP/AVIF without losing quality.',
    category: 'image',
    icon: ImageIcon,
    keywords: ['image compression', 'webp converter', 'resize', 'avif'],
    component: ImageOptimizer,
  },

  // --- Dev ---
  {
    slug: 'fake-address-generator',
    name: 'Fake Address Generator',
    description: 'Generate localized fake address data for testing in 50+ languages.',
    category: 'dev',
    icon: MapPin,
    keywords: ['faker', 'mock data', 'address', 'testing', 'dev tool'],
    component: FakeAddressGenerator,
  },
  {
    slug: 'curl-runner',
    name: 'Curl Runner',
    description: 'Execute HTTP requests from the Edge. Inspect status, headers, and performance.',
    category: 'dev',
    icon: Terminal,
    keywords: ['curl', 'http client', 'api tester', 'fetch'],
    component: CurlRunner,
  },

  // --- DNS ---
  {
    slug: 'dns-lookup',
    name: 'DNS Propagation',
    description: 'Check DNS records (A, MX, NS) across global nodes.',
    category: 'dns',
    icon: Globe,
    keywords: ['whois', 'dns check', 'mx records', 'domain propagation'],
    component: DnsLookup,
  },
];

// --- 4. Helpers ---
export const getTool = (slug: string) => tools.find((t) => t.slug === slug);
export const getToolsByCategory = (category: ToolCategory) => 
  tools.filter((t) => t.category === category);

// --- 5. Internal Components ---
function ToolLoader({ name }: { name: string }) {
  return (
    <div className="p-12 flex flex-col items-center justify-center space-y-4 animate-pulse">
      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full" />
      <div className="text-gray-400 font-medium">Loading {name}...</div>
    </div>
  );
}
