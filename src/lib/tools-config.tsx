import { 
  Cpu, 
  Lock, 
  Globe, 
  Image as ImageIcon, 
  LucideIcon 
} from 'lucide-react';
import dynamic from 'next/dynamic';
import React from 'react';
import ComingSoon from '@/components/ui/ComingSoon';

// --- 1. Dynamic Component Imports ---
const BinChecker = dynamic(() => import('@/components/tools/security/BinChecker'), {
  loading: () => <ToolLoader name="BIN Checker" />,
});

// --- 2. Type Definitions ---
export type ToolCategory = 'ai' | 'security' | 'dns' | 'image' | 'email';

export interface Tool {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: LucideIcon;
  keywords: string[];
  component: React.ComponentType; 
  content?: React.ReactNode; // <--- NEW: Field for SEO Texts
}

// --- 3. Configuration ---
export const tools: Tool[] = [
  {
    slug: 'bin-checker',
    name: 'BIN Checker',
    description: 'Validate and retrieve details for any Bank Identification Number immediately.',
    category: 'security',
    icon: Lock,
    keywords: ['bin lookup', 'credit card validator', 'bank identifier', 'payment security', 'check bin number'],
    component: BinChecker,
    // <--- UNIQUE SEO CONTENT FOR BIN CHECKER --->
    content: (
      <>
        <h2>What is a BIN Checker?</h2>
        <p>
          A <strong>Bank Identification Number (BIN)</strong> is the first 6 to 8 digits of a credit or debit card. 
          This number identifies the institution that issued the card. Our <em>ProKit BIN Checker</em> tool allows you to instantly 
          verify this information to prevent fraud and validate payment details.
        </p>
        <h3>Why use this tool?</h3>
        <ul>
          <li><strong>Fraud Prevention:</strong> Verify if a card matches the user's billing country.</li>
          <li><strong>Payment Validation:</strong> Ensure the card type (Debit/Credit) is accepted by your gateway.</li>
          <li><strong>Bank Details:</strong> Find the issuing bank name and contact phone number.</li>
        </ul>
        <p>
          This tool is free to use and powered by our secure, privacy-focused database. We do not store any card numbers you enter.
        </p>
      </>
    )
  },
  {
    slug: 'ai-translator',
    name: 'AI Translator',
    description: 'Context-aware translation using Cloudflare Neural Networks.',
    category: 'ai',
    icon: Cpu,
    keywords: ['translation', 'ai language', 'polyglot', 'neural network'],
    component: ComingSoon,
    content: (
      <>
        <h2>Next-Gen AI Translation</h2>
        <p>Break language barriers with our neural network powered translator.</p>
      </>
    )
  },
  {
    slug: 'dns-lookup',
    name: 'DNS Propagation',
    description: 'Check DNS records (A, MX, NS) across global nodes.',
    category: 'dns',
    icon: Globe,
    keywords: ['whois', 'dns check', 'mx records', 'domain propagation'],
    component: ComingSoon,
  },
  {
    slug: 'image-optimizer',
    name: 'Image Optimizer',
    description: 'Compress and resize images without losing quality.',
    category: 'image',
    icon: ImageIcon,
    keywords: ['image compression', 'webp converter', 'resize'],
    component: ComingSoon,
  },
];

// --- 4. Helpers ---
export const getTool = (slug: string) => tools.find((t) => t.slug === slug);
export const getToolsByCategory = (category: ToolCategory) => tools.filter((t) => t.category === category);

function ToolLoader({ name }: { name: string }) {
  return (
    <div className="p-12 flex flex-col items-center justify-center space-y-4 animate-pulse">
      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full" />
      <div className="text-gray-400 font-medium">Loading {name}...</div>
    </div>
  );
}
