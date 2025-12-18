import { NextRequest, NextResponse } from 'next/server';
import puppeteer from '@cloudflare/puppeteer';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'Please provide a "url" query parameter.' }, { status: 400 });
    }

    // 1. Get the Cloudflare Environment
    const { env } = getCloudflareContext();

    if (!env.MY_BROWSER) {
      console.error("MY_BROWSER binding not found");
      return NextResponse.json({ error: 'Browser binding not configured.' }, { status: 500 });
    }

    // 2. Launch the Remote Browser
    const browser = await puppeteer.launch(env.MY_BROWSER);
    
    // 3. Open Page & Screenshot
    const page = await browser.newPage();
    
    // Set viewport to a standard desktop size
    await page.setViewport({ width: 1280, height: 720 });
    
    await page.goto(url, {
      waitUntil: 'networkidle0', // Wait until network is quiet
      timeout: 15000 // 15s timeout
    });

    const screenshotBuffer = await page.screenshot();

    // 4. Close Browser
    await browser.close();

    // 5. Return Image Response
    return new NextResponse(screenshotBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error: any) {
    console.error('Browser Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate screenshot', details: error.message }, 
      { status: 500 }
    );
  }
}
