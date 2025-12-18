import { Cpu, Lock, Globe, LucideIcon } from 'lucide-react';
import dynamic from 'next/dynamic';

// 1. Dynamic Imports for Performance (Lazy loads tool components)
// These map to the files in src/components/tools/
const BinChecker = dynamic(() => import('@/components/tools/security/BinChecker'), {
  loading: () => <p className="p-10 text-center text-gray-500">Loading Tool...</p>
});

// Define the Tool Interface
export type ToolCategory = 'ai' | 'security' | 'dns' | 'image' | 'email';

export type Tool = {
  slug: string; // URL friendly ID: /tool/bin-checker
  name: string; // Display Name
  description: string; // SEO Description
  category: ToolCategory;
  icon: LucideIcon;
  keywords: string[]; // For internal search & SEO
  component: React.ComponentType<any>; // The actual React Component
};

export const tools: Tool[] = [
  {
    slug: 'bin-checker',
    name: 'BIN Checker',
    description: 'Validate and retrieve details for any Bank Identification Number immediately.',
    category: 'security',
    icon: Lock,
    keywords: ['bin lookup', 'credit card validator', 'bank identifier'],
    component: BinChecker,
  },
  {
    slug: 'dns-lookup',
    name: 'DNS Propagation',
    description: 'Check DNS records (A, MX, NS) across global nodes.',
    category: 'dns',
    icon: Globe,
    keywords: ['whois', 'dns check', 'mx records'],
    component: () => <div className="p-4">DNS Tool Coming Soon</div>, // Placeholder
  },
  // Add more tools here...
];

export const getTool = (slug: string) => tools.find((t) => t.slug === slug);
export const getToolsByCategory = (cat: ToolCategory) => tools.filter((t) => t.category === cat);
