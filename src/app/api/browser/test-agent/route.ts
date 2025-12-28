import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import puppeteer from '@cloudflare/puppeteer';

// R2 Domain Configuration
const R2_CUSTOM_DOMAIN = 'https://c.prokit.uk'; 

// Define types for our extended data
interface PerfMetrics {
  ttfb: number;
  domLoad: number;
  windowLoad: number;
  fcp: number;
}

interface SeoMetrics {
  title: string;
  description: string;
  keywords: string;
  h1Count: number;
  h2Count: number;
  linksCount: number;
  imagesCount: number;
  imagesWithoutAlt: number;
  viewport: string | null;
  canonical: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
}

export async function POST(req: NextRequest) {
  let browser = null;
  try {
    const body = (await req.json()) as { url?: string };
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    if (!env.MY_BROWSER || !env.MY_FILES) {
      return NextResponse.json({ error: 'Browser or Storage binding not configured.' }, { status: 500 });
    }

    browser = await puppeteer.launch(env.MY_BROWSER);
    const page = await browser.newPage();
    
    // Capture Console Logs
    const consoleLogs: { type: string; text: string; location: string }[] = [];
    page.on('console', msg => {
      const location = msg.location();
      consoleLogs.push({
        type: msg.type(),
        text: msg.text(),
        location: location ? location.url || 'unknown' : 'unknown'
      });
    });

    const startTime = Date.now();
    
    // Set a standard viewport for consistent screenshots/testing
    await page.setViewport({ width: 1280, height: 800 });
    
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    const endTime = Date.now();

    // Collect Metrics & SEO Data
    const result = await page.evaluate(() => {
      // Performance
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      const fcpEntry = paint.find(p => p.name === 'first-contentful-paint');
      
      const metrics: PerfMetrics = {
        ttfb: nav ? nav.responseStart - nav.requestStart : 0,
        domLoad: nav ? nav.domContentLoadedEventEnd - nav.startTime : 0,
        windowLoad: nav ? nav.loadEventEnd - nav.startTime : 0,
        fcp: fcpEntry ? fcpEntry.startTime : 0,
      };

      // SEO Extraction
      const getMeta = (name: string) => document.querySelector(`meta[name="${name}"]`)?.getAttribute('content') || '';
      const getProp = (prop: string) => document.querySelector(`meta[property="${prop}"]`)?.getAttribute('content') || null;
      
      const images = Array.from(document.querySelectorAll('img'));
      
      const seo: SeoMetrics = {
        title: document.title || '',
        description: getMeta('description'),
        keywords: getMeta('keywords'),
        h1Count: document.querySelectorAll('h1').length,
        h2Count: document.querySelectorAll('h2').length,
        linksCount: document.querySelectorAll('a').length,
        imagesCount: images.length,
        imagesWithoutAlt: images.filter(img => !img.alt || img.alt.trim() === '').length,
        viewport: getMeta('viewport') || null,
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || null,
        ogTitle: getProp('og:title'),
        ogDescription: getProp('og:description'),
        ogImage: getProp('og:image'),
      };

      return { metrics, seo };
    });

    const screenshotBuffer = await page.screenshot({ fullPage: false });

    // Upload to R2
    const testId = crypto.randomUUID();
    const screenshotKey = `puppeteer/${testId}/screenshot.png`;

    await env.MY_FILES.put(screenshotKey, screenshotBuffer, {
      httpMetadata: { contentType: 'image/png' }
    });

    await browser.close();
    browser = null;

    return NextResponse.json({
      success: true,
      testId,
      urls: {
        screenshot: `${R2_CUSTOM_DOMAIN}/${screenshotKey}`,
      },
      data: {
        metrics: {
          ...result.metrics,
          duration: endTime - startTime
        },
        seo: result.seo,
        console: consoleLogs
      }
    });

  } catch (error: unknown) {
    if (browser) await browser.close();
    console.error('Puppeteer Error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
