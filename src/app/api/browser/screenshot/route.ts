import { NextRequest, NextResponse } from 'next/server';
import puppeteer from '@cloudflare/puppeteer';
import { getCloudflareContext } from '@opennextjs/cloudflare';

// Define your R2 Custom Domain here (configured in Cloudflare Dashboard)
const R2_CUSTOM_DOMAIN = 'https://c.prokit.uk'; // <--- CHANGE THIS TO YOUR DOMAIN

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'Please provide a "url" query parameter.' }, { status: 400 });
    }

    // 1. Get the Cloudflare Environment
    const { env } = getCloudflareContext();

    if (!env.MY_BROWSER || !env.MY_FILES) {
      console.error("Bindings not found");
      return NextResponse.json({ error: 'Browser or R2 binding not configured.' }, { status: 500 });
    }

    // 2. Launch the Remote Browser
    const browser = await puppeteer.launch(env.MY_BROWSER);
    const page = await browser.newPage();
    
    await page.setViewport({ width: 1280, height: 720 });
    
    // Navigate with a timeout
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 10000 
    });

    // 3. Take Screenshot (Returns a Buffer)
    const screenshotBuffer = await page.screenshot();
    
    await browser.close();

    // 4. Generate a unique filename
    const filename = `screenshots/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;

    // 5. Upload to R2
    // We convert buffer to Uint8Array to satisfy R2 types if necessary, though put() usually accepts Buffer.
    // The explicit cast or typed array wrapper solves the "Buffer vs Blob" issue.
    await env.MY_FILES.put(filename, screenshotBuffer, {
      httpMetadata: {
        contentType: 'image/png',
      }
    });

    // 6. Return the Public URL
    const publicUrl = `${R2_CUSTOM_DOMAIN}/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      captured_at: new Date().toISOString()
    });

  } catch (error: unknown) {
    console.error('Browser Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: 'Failed to generate screenshot', details: errorMessage }, 
      { status: 500 }
    );
  }
}
