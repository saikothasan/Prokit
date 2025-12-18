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

// Security Tools
const BinChecker = dynamic(() => import('@/components/tools/security/BinChecker'), {
  loading: () => <ToolLoader name="BIN Checker" />,
});

// AI Tools (NEW IMPORT ADDED HERE)
const Translator = dynamic(() => import('@/components/tools/ai/Translator'), {
  loading: () => <ToolLoader name="AI Translator" />,
});

// Browser Tool Import
const ScreenshotTool = dynamic(() => import('@/components/tools/browser/Screenshot'), {
  loading: () => <ToolLoader name="Screenshot Tool" />,
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
}

// --- 3. Configuration ---
export const tools: Tool[] = [
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
    slug: 'website-screenshot',
    name: 'Website Screenshot',
    description: 'Capture high-quality screenshots of any website using Cloudflare Browser Rendering.',
    category: 'image',
    icon: Camera,
    keywords: ['screenshot', 'capture', 'web', 'browser', 'rendering'],
    component: ScreenshotTool,
  },
  {
    slug: 'ai-translator',
    name: 'AI Translator',
    description: 'Context-aware translation using Cloudflare Neural Networks.',
    category: 'ai',
    icon: Cpu,
    keywords: ['translation', 'ai language', 'polyglot', 'neural network'],
    component: Translator, // <--- Now this works because 'Translator' is defined above
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
