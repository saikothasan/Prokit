import { Cpu, Lock, Globe, Mail, Image as ImageIcon } from 'lucide-react';

export type Tool = {
  slug: string;
  name: string;
  description: string;
  category: 'ai' | 'security' | 'dns' | 'image' | 'email';
  icon: any;
  keywords: string[];
};

export const tools: Tool[] = [
  {
    slug: 'bin-checker',
    name: 'BIN Checker',
    description: 'Validate and retrieve details for any Bank Identification Number.',
    category: 'security',
    icon: Lock,
    keywords: ['bin lookup', 'credit card validator', 'bank identifier'],
  },
  {
    slug: 'ai-translator',
    name: 'AI Translator',
    description: 'Context-aware translation using Cloudflare Neural Networks.',
    category: 'ai',
    icon: Cpu,
    keywords: ['translation', 'ai language', 'polyglot'],
  },
  {
    slug: 'dns-lookup',
    name: 'DNS Propogation',
    description: 'Check DNS records (A, MX, NS) across global nodes.',
    category: 'dns',
    icon: Globe,
    keywords: ['whois', 'dns check', 'mx records'],
  },
  // Add more tools here...
];

export const getTool = (slug: string) => tools.find((t) => t.slug === slug);
