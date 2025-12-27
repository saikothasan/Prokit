import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { launch } from '@cloudflare/playwright';

// R2 Domain Configuration
const R2_CUSTOM_DOMAIN = 'https://c.prokit.uk'; 

export async function POST(req: NextRequest) {
  let browser = null;
  try {
    // Explicitly type the parsed JSON to avoid "Unexpected any" lint errors
    const body = (await req.json()) as { url?: string };
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    if (!env.BROWSER || !env.MY_FILES) {
      return NextResponse.json({ error: 'Browser or Storage binding not configured.' }, { status: 500 });
    }

    // 1. Launch Browser
    browser = await launch(env.BROWSER);
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // 2. Capture Console Logs
    // Using explicit types for the log accumulator
    const consoleLogs: { type: string; text: string; location: string }[] = [];
    page.on('console', msg => {
      consoleLogs.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location().url
      });
    });

    // 3. Navigate & Wait
    const startTime = Date.now();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    const endTime = Date.now();

    // 4. Collect Metrics via Page Evaluation
    // Typed return to satisfy ESLint
    interface PerfMetrics {
        ttfb: number;
        domLoad: number;
        windowLoad: number;
        fcp: number;
    }
    
    const metrics = await page.evaluate((): PerfMetrics => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      const fcp = paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0;
      
      return {
        ttfb: nav ? nav.responseStart - nav.requestStart : 0,
        domLoad: nav ? nav.domContentLoadedEventEnd - nav.startTime : 0,
        windowLoad: nav ? nav.loadEventEnd - nav.startTime : 0,
        fcp: fcp,
      };
    });

    // 5. Screenshot (Buffer only, no FS write)
    const screenshotBuffer = await page.screenshot({ fullPage: false });

    // 6. Upload to R2
    const testId = crypto.randomUUID();
    const screenshotKey = `playwright/${testId}/screenshot.png`;

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
          ...metrics,
          duration: endTime - startTime
        },
        console: consoleLogs
      }
    });

  } catch (error: unknown) {
    if (browser) await browser.close();
    console.error('Playwright Error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
