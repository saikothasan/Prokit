import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// FIX: Only initialize the Cloudflare proxy in local development mode.
// This prevents the "Address already in use" and "deadlock" errors during 'next build'.
if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}

const nextConfig: NextConfig = {
  // Prevent bundling these packages to avoid "cloudflare:workers" resolution errors
  serverExternalPackages: ["@cloudflare/puppeteer"],

  images: {
    loader: "custom",
    loaderFile: "./image-loader.ts",
  },

  // FIX: Tell Webpack to ignore "cloudflare:" imports so they work on the Edge
  webpack: (config) => {
    config.externals.push({
      "cloudflare:sockets": "commonjs cloudflare:sockets",
    });

    // WASM Support: Treat .wasm files as assets (URLs) rather than modules.
    // This allows us to import them in code and fetch them locally.
    config.module.rules.push({
      test: /\.wasm$/,
      type: "asset/resource",
      generator: {
        filename: 'static/wasm/[hash][ext][query]'
      }
    });

    return config;
  },
  
  // Security Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  },
};

export default nextConfig;
