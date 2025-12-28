import { NextRequest, NextResponse } from 'next/server';
import puppeteer from '@cloudflare/puppeteer';
import { getCloudflareContext } from '@opennextjs/cloudflare';

interface MarkdownRequestBody {
  url: string;
  enableFrontmatter?: boolean;
}

interface AiModelResponse {
  response?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { url, enableFrontmatter = true } = (await req.json()) as MarkdownRequestBody;
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
        const firstSession = freeSessions[0];
        
        if (firstSession) {
            sessionId = firstSession.sessionId;
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

    // --- B. SCRAPING & METADATA EXTRACTION ---
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    // Optimize: block unnecessary resources
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (['image', 'font', 'stylesheet', 'media'].includes(req.resourceType())) {
            req.abort();
        } else {
            req.continue();
        }
    });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Extract content AND Metadata
    const pageData = await page.evaluate(() => {
        // 1. Extract SEO Metadata
        const getMeta = (name: string) => document.querySelector(`meta[name="${name}"]`)?.getAttribute('content') || '';
        const getProp = (prop: string) => document.querySelector(`meta[property="${prop}"]`)?.getAttribute('content') || '';
        
        const metadata = {
            title: document.title || '',
            description: getMeta('description') || getProp('og:description'),
            keywords: getMeta('keywords'),
            author: getMeta('author') || getProp('article:author'),
            image: getProp('og:image'),
            url: window.location.href,
        };

        // 2. Clean Content
        const noise = document.querySelectorAll('script, style, noscript, iframe, svg, nav, footer, .ads, .cookie-banner');
        noise.forEach(n => n.remove());
        
        // Return body content (truncated to avoid context limit)
        return {
            content: document.body.innerHTML.slice(0, 15000),
            metadata
        };
    });

    await page.close();
    browser.disconnect(); 

    // --- C. AI CONVERSION ---
    const systemPrompt = `You are an expert SEO Content Converter. 
    Task: Convert the provided HTML content into clean, semantic, and structured Markdown.
    
    Rules:
    1. Focus on the main article/content. Ignore leftover UI elements.
    2. Use semantic headers (# H1 for title, ## H2 for sections).
    3. Format links as [text](url).
    4. Format code blocks with backticks and language tags.
    5. Do not output any conversational text. ONLY output the Markdown.
    `;

    const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `HTML Content:\n${pageData.content}` }
      ]
    });

    const aiResult = response as unknown as AiModelResponse;
    let markdown = aiResult.response || "Failed to generate markdown.";

    // --- D. FRONTMATTER INJECTION ---
    if (enableFrontmatter) {
        const d = new Date().toISOString().split('T')[0];
        const { title, description, keywords, author, image, url: pageUrl } = pageData.metadata;
        
        // Escape quotes for YAML
        const safe = (str: string) => (str || '').replace(/"/g, '\\"');

        const frontmatter = `---
title: "${safe(title)}"
description: "${safe(description)}"
keywords: "${safe(keywords)}"
author: "${safe(author)}"
date: "${d}"
url: "${pageUrl}"
image: "${image}"
---

`;
        markdown = frontmatter + markdown;
    }

    return NextResponse.json({ success: true, data: markdown });

  } catch (error: unknown) {
    console.error('Markdown Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
