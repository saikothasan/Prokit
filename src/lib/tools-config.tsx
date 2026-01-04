import dynamic from 'next/dynamic';
import { 
  Network,
  Globe,
  Search, 
  Shield, 
  Terminal, 
  Image as ImageIcon, 
  Lock, 
  CreditCard, 
  User,
  Zap,
  FileCode,
  ScanSearch,
  Languages
} from 'lucide-react';
import { Loader2, AudioLines } from 'lucide-react';
import React from 'react';

export type ToolCategory = 'security' | 'ai' | 'dns' | 'image' | 'dev';

export interface Tool {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  // Fix: Use React.ElementType for icons (components passed as values)
  icon: React.ElementType;
  // Fix: Use React.ComponentType for the tool component itself
  component: React.ComponentType;
  keywords: string[];
}

// Simple loader
const ToolLoader = ({ name }: { name: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground animate-pulse">
    <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
    <p>Loading {name}...</p>
  </div>
);

// Lazy Loaded Components
const BinChecker = dynamic(() => import('@/components/tools/security/BinChecker'), {
  loading: () => <ToolLoader name="BIN Checker" />,
});
const DnsLookup = dynamic(() => import('@/components/tools/dns/DnsLookup'), {
  loading: () => <ToolLoader name="DNS Lookup" />,
});
const Translator = dynamic(() => import('@/components/tools/ai/Translator'), {
  loading: () => <ToolLoader name="AI Translator" />,
});
const WhatIsMyIp = dynamic(() => import('@/components/tools/network/WhatIsMyIp'), {
  loading: () => <ToolLoader name="IP Analyzer" />,
});
const ImageOptimizer = dynamic(() => import('@/components/tools/image/ImageOptimizer'), {
  loading: () => <ToolLoader name="Image Optimizer" />,
});
const TextToSpeech = dynamic(() => import('@/components/tools/ai/TextToSpeech'), {
  loading: () => <ToolLoader name="AI Text to Speech" />,
});
const SsnGenerator = dynamic(() => import('@/components/tools/dev/SsnGenerator'), {
  loading: () => <ToolLoader name="SSN Generator" />,
});
const SslInspector = dynamic(() => import('@/components/tools/security/SslInspector'), {
  loading: () => <ToolLoader name="SSL Inspector" />,
});
const CpfGenerator = dynamic(() => import('@/components/tools/dev/CpfGenerator'), {
  loading: () => <ToolLoader name="CPF Generator" />,
});
const CryptoLab = dynamic(() => import('@/components/tools/security/CryptoLab'), {
  loading: () => <ToolLoader name="Crypto Lab" />,
});
const PortScanner = dynamic(() => import('@/components/tools/security/PortScanner'), {
  loading: () => <ToolLoader name="Port Scanner" />,
});
const BlacklistChecker = dynamic(() => import('@/components/tools/security/BlacklistChecker'), {
  loading: () => <ToolLoader name="Blacklist Checker" />,
});
const FakeAddress = dynamic(() => import('@/components/tools/dev/FakeAddressGenerator'), {
  loading: () => <ToolLoader name="Fake Address Gen" />,
});
const MarkdownConverter = dynamic(() => import('@/components/tools/ai/MarkdownConverter'), {
  loading: () => <ToolLoader name="Markdown AI" />,
});
const WebExtractor = dynamic(() => import('@/components/tools/ai/WebExtractor'), {
  loading: () => <ToolLoader name="Web Extractor" />,
});
const SiteAudit = dynamic(() => import('@/components/tools/ai/SiteAudit'), {
  loading: () => <ToolLoader name="Site Audit" />,
});
const CurlTool = dynamic(() => import('@/components/tools/dev/CurlTool'), {
  loading: () => <ToolLoader name="cURL" />,
});
const TestAgent = dynamic(() => import('@/components/tools/browser/TestAgent'), {
  loading: () => <ToolLoader name="Test Agent" />,
});
const ImageGenerator = dynamic(() => import('@/components/tools/ai/ImageGenerator'), {
  loading: () => <ToolLoader name="Flux AI" />,
});
const Screenshot = dynamic(() => import('@/components/tools/browser/Screenshot'), {
  loading: () => <ToolLoader name="Screenshot" />,
});
const ProxyChecker = dynamic(() => import('@/components/tools/security/ProxyChecker'), {
  loading: () => <ToolLoader name="Proxy Checker" />,
});

export const tools: Tool[] = [
  {
    slug: 'bin-checker',
    name: 'BIN Inspector',
    description: 'Analyze credit card BIN numbers to retrieve issuing bank, card type, and country data securely.',
    category: 'security',
    icon: CreditCard,
    keywords: ['bin', 'credit card', 'bank', 'lookup'],
    component: BinChecker,
  },
	{
    slug: 'text-to-speech',
    name: 'AI Voice Studio',
    description: 'Convert text into lifelike human speech using Deepgram Aura models. Supports multiple accents and tones.',
    category: 'ai',
    icon: AudioLines, // Uses Lucide-react 'AudioLines' icon
    keywords: ['tts', 'speech', 'voice', 'audio', 'deepgram', 'ai'],
    component: TextToSpeech,
  },
	{
    slug: 'flux-image-gen',
    name: 'Flux 2 Creator',
    description: 'Next-gen image synthesis using the Flux 2 [dev] model with automated prompt enhancement.',
    category: 'ai',
    icon: ImageIcon,
    keywords: ['ai', 'flux', 'image', 'generator', 'art', 'dev'],
    component: ImageGenerator,
  },
	{
    slug: 'ssn-generator',
    name: 'SSN Generator',
    description: 'Generate valid, non-traceable US Social Security Numbers for testing and QA.',
    category: 'dev',
    icon: FileCode,
    keywords: ['ssn', 'fake', 'generator', 'testing', 'mock', 'data'],
    component: SsnGenerator,
  },
	{
    slug: 'cpf-generator',
    name: 'CPF Generator',
    description: 'Generate valid, algorithmic Brazilian CPF numbers (Cadastro de Pessoas Físicas) for testing.',
    category: 'dev',
    icon: User, // Represents Personal ID
    keywords: ['cpf', 'brazil', 'id', 'generator', 'fake', 'data'],
    component: CpfGenerator,
  },
  {
    slug: 'dns-lookup',
    name: 'DNS Propagation',
    description: 'Check DNS records (A, MX, NS, CNAME) globally across multiple servers to verify propagation.',
    category: 'dns',
    icon: Globe,
    keywords: ['dns', 'propagation', 'lookup', 'records'],
    component: DnsLookup,
  },
  {
    slug: 'ai-translator',
    name: 'Neural Translate',
    description: 'High-accuracy text translation powered by AI. Supports context-aware translation for developers.',
    category: 'ai',
    icon: Languages,
    keywords: ['translation', 'ai', 'language', 'convert'],
    component: Translator,
  },
  {
    slug: 'image-optimizer',
    name: 'Media Optimize',
    description: 'Compress and optimize images (WebP/AVIF) locally using WebAssembly. No server uploads required.',
    category: 'image',
    icon: ImageIcon,
    keywords: ['image', 'compress', 'webp', 'avif'],
    component: ImageOptimizer,
  },
	{
    slug: 'blacklist-checker',
    name: 'Blacklist Check',
    description: 'Scan your domain or IP against major DNSBL blacklists to check email reputation.',
    category: 'security',
    icon: Shield, // You can also import 'ShieldAlert' from lucide-react if preferred
    keywords: ['blacklist', 'spam', 'email', 'dnsbl', 'reputation'],
    component: BlacklistChecker,
  },
	{
    slug: 'what-is-my-ip',
    name: 'What is my IP',
    description: 'Deep analysis of your IP address including Geo-location, ISP, ASN, and Reputation Score.',
    category: 'security',
    icon: Network,
    keywords: ['ip', 'my ip', 'geo', 'location', 'isp', 'score'],
    component: WhatIsMyIp,
  },
  {
    slug: 'ssl-check',
    name: 'SSL/TLS Inspector',
    description: 'Deep analyze SSL certificates, validity chains, and security vulnerabilities.',
    category: 'security',
    icon: Lock,
    keywords: ['ssl', 'cert', 'https', 'security'],
    component: SslInspector,
  },
  {
    slug: 'crypto-lab',
    name: 'Crypto Lab',
    description: 'Encrypt/Decrypt text using AES, hashing (SHA-256), and encoding utilities directly in-browser.',
    category: 'security',
    icon: Shield,
    keywords: ['crypto', 'aes', 'hash', 'encrypt'],
    component: CryptoLab,
  },
  {
    slug: 'port-scan',
    name: 'Port Scanner',
    description: 'Scan common open ports (80, 443, 22, etc.) on a target IP or domain to verify accessibility.',
    category: 'security',
    icon: Network,
    keywords: ['port', 'scan', 'network', 'ip'],
    component: PortScanner,
  },
  {
    slug: 'fake-address',
    name: 'Fake Identity Gen',
    description: 'Generate realistic test identities, addresses, and JSON payloads for development testing.',
    category: 'dev',
    icon: User,
    keywords: ['fake', 'address', 'mock', 'data'],
    component: FakeAddress,
  },
  {
    slug: 'markdown-ai',
    name: 'Markdown Enhancer',
    description: 'Convert raw text to structured Markdown using AI. Perfect for documentation cleanup.',
    category: 'ai',
    icon: FileCode,
    keywords: ['markdown', 'ai', 'format', 'docs'],
    component: MarkdownConverter,
  },
  {
    slug: 'web-extractor',
    name: 'Web Extractor',
    description: 'Extract structured data (metadata, text, links) from any URL using edge-rendering.',
    category: 'ai',
    icon: ScanSearch,
    keywords: ['scrape', 'metadata', 'extract', 'seo'],
    component: WebExtractor,
  },
  {
    slug: 'site-audit',
    name: 'SEO & Perf Audit',
    description: 'Analyze website performance, SEO tags, and accessibility metrics in one click.',
    category: 'ai',
    icon: Search,
    keywords: ['seo', 'audit', 'performance', 'lighthouse'],
    component: SiteAudit,
  },
  {
    slug: 'curl-builder',
    name: 'cURL Builder',
    description: 'Visual interface to generate and test cURL commands for API development.',
    category: 'dev',
    icon: Terminal,
    keywords: ['curl', 'api', 'request', 'test'],
    component: CurlTool,
  },
  {
    slug: 'test-agent',
    name: 'Browser Agent',
    description: 'Run automated browser tests on the Edge. Verify site rendering and response codes.',
    category: 'dev',
    icon: Zap,
    keywords: ['browser', 'test', 'automation', 'agent'],
    component: TestAgent,
  },
  {
    slug: 'screenshot',
    name: 'Site Screenshot',
    description: 'Capture high-resolution screenshots of any website using a headless edge browser.',
    category: 'image',
    icon: ImageIcon,
    keywords: ['screenshot', 'capture', 'browser', 'image'],
    component: Screenshot,
  },
  {
    slug: 'bulk-proxy-checker',
    name: 'Bulk Proxy Checker',
    description: 'High-speed proxy validator using Edge sockets. Checks reachability and latency.',
    category: 'security',
    icon: Network, 
    keywords: ['proxy', 'check', 'socket', 'network'],
    component: ProxyChecker,
  },
];

export function getTool(slug: string) {
  return tools.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: ToolCategory) {
  return tools.filter((t) => t.category === category);
}
