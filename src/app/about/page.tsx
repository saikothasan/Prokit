import type { Metadata } from 'next';
import { Shield, Zap, Globe } from 'lucide-react';
import React from 'react'; 

export const metadata: Metadata = {
  title: 'About ProKit',
  description: 'The story behind the privacy-focused developer toolkit.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 dark:text-white">
          Tools without the <span className="text-blue-600">tracking</span>.
        </h1>
        
        <div className="prose prose-lg dark:prose-invert mb-16">
          <p>
            Most online developer tools are bloated with ads, trackers, and slow scripts. 
            We built <strong>ProKit</strong> to be different.
          </p>
          <p>
            Our mission is simple: provide single-purpose, high-performance utilities that respect your privacy. 
            We run on the Edge, meaning your data is processed instantly and securely, often without ever hitting a database.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <Feature icon={<Shield />} title="Privacy First" desc="No logs. No ads. Your data serves you, not us." />
          <Feature icon={<Zap />} title="Edge Powered" desc="Running on Cloudflare Workers for near-zero latency." />
          <Feature icon={<Globe />} title="Open Source" desc="Transparent code you can verify on GitHub." />
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
      <div className="mb-4 text-blue-600 dark:text-blue-400">{icon}</div>
      <h3 className="font-bold mb-2 dark:text-white">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
    </div>
  );
}
