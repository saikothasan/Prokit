import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { launch } from '@cloudflare/playwright'; // Use Cloudflare's fork
import fs from 'fs';

// R2 Domain Configuration
const R2_CUSTOM_DOMAIN = 'https://c.prokit.uk'; 

export async function POST(req: NextRequest) {
  let browser = null;
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    if (!env.BROWSER || !env.MY_FILES) {
      return NextResponse.json({ error: 'Browser or Storage binding not configured.' }, { status: 500 });
    }

    // 1. Launch Browser (Cloudflare Browser Rendering)
    browser = await launch(env.BROWSER);
    
    // 2. Setup Context & Tracing
    const context = await browser.newContext();
    
    // Start tracing (captures screenshots, snapshots, and sources)
    await context.tracing.start({ screenshots: true, snapshots: true, sources: true });

    const page = await context.newPage();
    const consoleLogs: any[] = [];
    
    // Capture Console Logs
    page.on('console', msg => {
      consoleLogs.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });
    });

    // 3. Navigate & Wait
    const startTime = Date.now();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    const endTime = Date.now();

    // 4. Collect Metrics (Core Web Vitals) via Injection
    // We use a script to extract Performance API data
    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const fcp = paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0;
      
      // Rough LCP approximation (usually requires PerformanceObserver during load)
      // This is a simplified snapshot of what's available now
      return {
        ttfb: nav ? nav.responseStart - nav.requestStart : 0,
        domLoad: nav ? nav.domContentLoadedEventEnd - nav.startTime : 0,
        windowLoad: nav ? nav.loadEventEnd - nav.startTime : 0,
        fcp: fcp,
      };
    });

    // 5. Take High-Res Screenshot
    const screenshotBuffer = await page.screenshot({ fullPage: false });

    // 6. Stop Tracing & Save Trace
    // Traces are saved to a local temp path in the worker
    const tracePath = `/tmp/trace_${Date.now()}.zip`;
    await context.tracing.stop({ path: tracePath });
    const traceBuffer = fs.readFileSync(tracePath);

    // 7. Upload Artifacts to R2
    const testId = crypto.randomUUID();
    const screenshotKey = `playwright/${testId}/screenshot.png`;
    const traceKey = `playwright/${testId}/trace.zip`;

    await Promise.all([
      env.MY_FILES.put(screenshotKey, screenshotBuffer, {
        httpMetadata: { contentType: 'image/png' }
      }),
      env.MY_FILES.put(traceKey, traceBuffer, {
        httpMetadata: { contentType: 'application/zip' }
      })
    ]);

    await browser.close();

    return NextResponse.json({
      success: true,
      testId,
      urls: {
        screenshot: `${R2_CUSTOM_DOMAIN}/${screenshotKey}`,
        trace: `${R2_CUSTOM_DOMAIN}/${traceKey}`,
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
