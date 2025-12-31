import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import puppeteer from '@cloudflare/puppeteer';

// R2 Domain Configuration
const R2_CUSTOM_DOMAIN = 'https://c.prokit.uk';

// --- Types ---

interface RequestBody {
  url: string;
  device?: 'desktop' | 'mobile';
}

interface ResourceMetric {
  count: number;
  size: number; // in bytes
}

interface ResourceData {
  totalSize: number;
  totalCount: number;
  breakdown: {
    document: ResourceMetric;
    stylesheet: ResourceMetric;
    image: ResourceMetric;
    media: ResourceMetric;
    font: ResourceMetric;
    script: ResourceMetric;
    other: ResourceMetric;
  };
}

interface SecurityHeaders {
  csp: boolean;
  hsts: boolean;
  xFrameOptions: string | null;
  xContentTypeOptions: boolean;
  referrerPolicy: string | null;
  permissionsPolicy: boolean;
}

interface AccessibilityMetrics {
  htmlLang: string | null;
  buttonsWithoutLabel: number;
  inputsWithoutLabel: number;
  imagesWithoutAlt: number;
  headingsOrder: boolean; // checks if h1 is present and h2 follows h1 roughly
}

interface SeoMetrics {
  title: string;
  description: string;
  keywords: string;
  h1Count: number;
  h2Count: number;
  linksCount: number;
  viewport: string | null;
  canonical: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  robots: string | null;
  generator: string | null;
}

interface PerfMetrics {
  ttfb: number;
  domLoad: number;
  windowLoad: number;
  fcp: number;
}

// --- Constants ---

const MOBILE_USER_AGENT =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1';

// --- Helper Functions ---

function getResourceType(type: string): keyof ResourceData['breakdown'] {
  const map: Record<string, keyof ResourceData['breakdown']> = {
    document: 'document',
    stylesheet: 'stylesheet',
    image: 'image',
    media: 'media',
    font: 'font',
    script: 'script',
    xhr: 'other',
    fetch: 'other',
    preflight: 'other',
    other: 'other',
  };
  return map[type] || 'other';
}

export async function POST(req: NextRequest) {
  let browser = null;
  try {
    const body = (await req.json()) as RequestBody;
    const { url, device = 'desktop' } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Ensure protocol
    const targetUrl = url.startsWith('http') ? url : `https://${url}`;

    const { env } = getCloudflareContext();
    if (!env.MY_BROWSER || !env.MY_FILES) {
      return NextResponse.json(
        { error: 'Browser or Storage binding not configured.' },
        { status: 500 }
      );
    }

    browser = await puppeteer.launch(env.MY_BROWSER);
    const page = await browser.newPage();

    // 1. Device Emulation
    if (device === 'mobile') {
      await page.setUserAgent(MOBILE_USER_AGENT);
      await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    } else {
      await page.setViewport({ width: 1440, height: 900 });
    }

    // 2. Console Capture
    const consoleLogs: { type: string; text: string; location: string }[] = [];
    page.on('console', (msg) => {
      const location = msg.location();
      consoleLogs.push({
        type: msg.type(),
        text: msg.text(),
        location: location ? location.url || 'unknown' : 'unknown',
      });
    });

    // 3. Resource Tracking
    const resources: ResourceData = {
      totalSize: 0,
      totalCount: 0,
      breakdown: {
        document: { count: 0, size: 0 },
        stylesheet: { count: 0, size: 0 },
        image: { count: 0, size: 0 },
        media: { count: 0, size: 0 },
        font: { count: 0, size: 0 },
        script: { count: 0, size: 0 },
        other: { count: 0, size: 0 },
      },
    };

    page.on('response', async (response) => {
      try {
        const type = getResourceType(response.request().resourceType());
        const length = Number(response.headers()['content-length'] || 0);

        // Update Stats
        resources.totalCount++;
        resources.totalSize += length;
        resources.breakdown[type].count++;
        resources.breakdown[type].size += length;
      } catch {
        // Ignore failed resource captures
      }
    });

    const startTime = Date.now();

    // 4. Navigation & Security Header Extraction
    const response = await page.goto(targetUrl, {
      waitUntil: 'networkidle0',
      timeout: 25000, // Slightly reduced timeout for Workers
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    const headers = response?.headers() || {};
    const security: SecurityHeaders = {
      csp: !!(headers['content-security-policy'] || headers['content-security-policy-report-only']),
      hsts: !!headers['strict-transport-security'],
      xFrameOptions: headers['x-frame-options'] || null,
      xContentTypeOptions: !!headers['x-content-type-options'],
      referrerPolicy: headers['referrer-policy'] || null,
      permissionsPolicy: !!headers['permissions-policy'],
    };

    // 5. In-Page Evaluation (SEO, Metrics, Accessibility)
    const pageData = await page.evaluate(() => {
      // Performance
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      const fcpEntry = paint.find((p) => p.name === 'first-contentful-paint');

      const metrics: PerfMetrics = {
        ttfb: nav ? nav.responseStart - nav.requestStart : 0,
        domLoad: nav ? nav.domContentLoadedEventEnd - nav.startTime : 0,
        windowLoad: nav ? nav.loadEventEnd - nav.startTime : 0,
        fcp: fcpEntry ? fcpEntry.startTime : 0,
      };

      // Helper for meta
      const getMeta = (name: string) =>
        document.querySelector(`meta[name="${name}"]`)?.getAttribute('content') || '';
      const getProp = (prop: string) =>
        document.querySelector(`meta[property="${prop}"]`)?.getAttribute('content') || null;

      const images = Array.from(document.querySelectorAll('img'));
      const h1s = Array.from(document.querySelectorAll('h1'));

      // SEO
      const seo: SeoMetrics = {
        title: document.title || '',
        description: getMeta('description'),
        keywords: getMeta('keywords'),
        robots: getMeta('robots') || null,
        generator: getMeta('generator') || null,
        h1Count: h1s.length,
        h2Count: document.querySelectorAll('h2').length,
        linksCount: document.querySelectorAll('a').length,
        viewport: getMeta('viewport') || null,
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || null,
        ogTitle: getProp('og:title'),
        ogDescription: getProp('og:description'),
        ogImage: getProp('og:image'),
      };

      // Accessibility Simple Checks
      const accessibility: AccessibilityMetrics = {
        htmlLang: document.documentElement.getAttribute('lang'),
        imagesWithoutAlt: images.filter((img) => !img.alt || img.alt.trim() === '').length,
        buttonsWithoutLabel: Array.from(document.querySelectorAll('button')).filter(
          (btn) => !btn.innerText.trim() && !btn.getAttribute('aria-label')
        ).length,
        inputsWithoutLabel: Array.from(document.querySelectorAll('input')).filter(
          (input) =>
            !input.getAttribute('aria-label') &&
            !input.getAttribute('placeholder') &&
            !document.querySelector(`label[for="${input.id}"]`)
        ).length,
        headingsOrder: h1s.length > 0, // Simplified check
      };

      return { metrics, seo, accessibility };
    });

    // 6. Screenshot Upload
    const screenshotBuffer = await page.screenshot({ fullPage: false });
    const testId = crypto.randomUUID();
    const screenshotKey = `puppeteer/${testId}/${device}.png`;

    await env.MY_FILES.put(screenshotKey, screenshotBuffer, {
      httpMetadata: { contentType: 'image/png' },
    });

    await browser.close();
    browser = null;

    return NextResponse.json({
      success: true,
      testId,
      device,
      urls: {
        screenshot: `${R2_CUSTOM_DOMAIN}/${screenshotKey}`,
      },
      data: {
        metrics: {
          ...pageData.metrics,
          duration,
        },
        seo: pageData.seo,
        accessibility: pageData.accessibility,
        security,
        resources,
        console: consoleLogs,
      },
    });
  } catch (error: unknown) {
    if (browser) await browser.close();
    console.error('Puppeteer Error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
