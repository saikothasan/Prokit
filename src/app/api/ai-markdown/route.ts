import { NextRequest, NextResponse } from 'next/server';
import puppeteer from '@cloudflare/puppeteer';
import { getCloudflareContext } from '@opennextjs/cloudflare';

interface MarkdownRequestBody {
  url: string;
}

export async function POST(req: NextRequest) {
  try {
    const { url } = (await req.json()) as MarkdownRequestBody;
    const { env } = getCloudflareContext();

    if (!env.MY_BROWSER || !env.AI) {
      return NextResponse.json({ error: 'Missing Browser or AI binding' }, { status: 500 });
    }

    // --- A. SESSION REUSE LOGIC ---
    let browser;
    let sessionId;
    
    try {
        const sessions = await puppeteer.sessions(env.MY_BROWSER);
        const freeSessions = sessions.filter((s) => !s.connectionId);
        
        if (freeSessions.length > 0) {
            sessionId = freeSessions[0].sessionId;
            browser = await puppeteer.connect(env.MY_BROWSER, sessionId);
            console.log(`Reusing session: ${sessionId}`);
        }
    } catch (e) {
        console.warn('Failed to find/connect to existing session, launching new one.', e);
    }

    if (!browser) {
        browser = await puppeteer.launch(env.MY_BROWSER, {
            keep_alive: 60000 
        });
    }

    // --- B. SCRAPING ---
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (['image', 'font', 'stylesheet'].includes(req.resourceType())) {
            req.abort();
        } else {
            req.continue();
        }
    });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

    const content = await page.evaluate(() => {
        const noise = document.querySelectorAll('script, style, noscript, iframe, svg');
        noise.forEach(n => n.remove());
        return document.body.innerHTML.slice(0, 15000); 
    });

    await page.close();
    browser.disconnect(); 

    // --- C. AI CONVERSION ---
    const systemPrompt = `You are an expert Content Converter. 
    Task: Convert the provided HTML content into clean, structured Markdown.
    Rules:
    1. Ignore navigation menus, footers, and ads. Focus on the main article/content.
    2. Use proper headers (#, ##).
    3. Format links as [text](url).
    4. Format code blocks with backticks.
    5. Do not include any conversational text ("Here is the markdown..."). Just output the Markdown.`;

    const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `HTML Content:\n${content}` }
      ]
    });

    // Fix: Removed @ts-expect-error as the type is valid in your environment
    // Use type assertion 'as any' just in case specific types are missing properties
    const markdown = (response as any).response || "Failed to generate markdown.";

    return NextResponse.json({ success: true, data: markdown });

  } catch (error: unknown) {
    console.error('Markdown Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
