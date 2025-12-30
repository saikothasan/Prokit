import { NextRequest, NextResponse } from 'next/server';
import puppeteer from '@cloudflare/puppeteer';
import { getCloudflareContext } from '@opennextjs/cloudflare';

// Removed 'edge' runtime config to allow OpenNext to handle polyfills and Puppeteer dependencies
// export const runtime = 'edge';

// --- Type Definitions for Workers AI Beta Features ---

interface MarkdownConversionInput {
  name?: string;
  blob: Blob;
}

interface ConversionResult {
  name: string;
  format: 'markdown' | 'error';
  mimetype: string;
  tokens?: number;
  data?: string;
  error?: string;
}

// Extend the AI interface locally to support the beta toMarkdown method
interface ExtendedAI {
  run(model: string, inputs: unknown): Promise<unknown>;
  toMarkdown(input: MarkdownConversionInput | MarkdownConversionInput[]): Promise<ConversionResult | ConversionResult[]>;
}

// --- Interfaces ---

interface MarkdownRequestBody {
  url: string;
  enableFrontmatter?: boolean;
}

interface AiModelResponse {
  response?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { env } = getCloudflareContext();
    const contentType = req.headers.get('content-type') || '';
    const ai = env.AI as unknown as ExtendedAI;

    // ---------------------------------------------------------
    // SCENARIO 1: File Upload (Multipart Form Data)
    // Uses Workers AI `toMarkdown` feature
    // ---------------------------------------------------------
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const files = formData.getAll('files') as File[];
      const enableFrontmatter = formData.get('enableFrontmatter') === 'true';
      
      if (!files || files.length === 0) {
        return NextResponse.json({ error: 'No files provided' }, { status: 400 });
      }

      // Map files to the format expected by env.AI.toMarkdown
      const inputs: MarkdownConversionInput[] = files.map(file => ({
        name: file.name,
        blob: file
      }));

      // Call the Workers AI Beta Endpoint
      let results: ConversionResult | ConversionResult[];
      try {
        results = await ai.toMarkdown(inputs);
      } catch (err) {
        console.error("Workers AI toMarkdown failed:", err);
        return NextResponse.json({ error: "Markdown conversion failed. Ensure your Workers AI binding is updated." }, { status: 500 });
      }

      // Normalize results to array
      const resultsArray = Array.isArray(results) ? results : [results];
      
      let combinedMarkdown = '';

      resultsArray.forEach((res) => {
        if (res.format === 'markdown' && res.data) {
          if (enableFrontmatter) {
             const d = new Date().toISOString().split('T')[0];
             combinedMarkdown += `---
filename: "${res.name}"
mimetype: "${res.mimetype}"
date: "${d}"
tokens: ${res.tokens || 0}
---

`;
          }
          combinedMarkdown += res.data + '\n\n---\n\n';
        } else if (res.format === 'error') {
          combinedMarkdown += `> **Error converting ${res.name}:** ${res.error}\n\n`;
        }
      });

      return NextResponse.json({ success: true, data: combinedMarkdown.trim() });
    }

    // ---------------------------------------------------------
    // SCENARIO 2: URL Scraping (JSON)
    // Uses Puppeteer + LLM
    // ---------------------------------------------------------
    else {
      const { url, enableFrontmatter = true } = (await req.json()) as MarkdownRequestBody;

      if (!env.MY_BROWSER || !env.AI) {
        return NextResponse.json({ error: 'Missing Browser or AI binding' }, { status: 500 });
      }

      // 1. Session Management
      let browser;
      let sessionId;
      
      try {
          const sessions = await puppeteer.sessions(env.MY_BROWSER);
          const freeSessions = sessions.filter((s) => !s.connectionId);
          const firstSession = freeSessions[0];
          if (firstSession) {
              sessionId = firstSession.sessionId;
              browser = await puppeteer.connect(env.MY_BROWSER, sessionId);
          }
      } catch (e) {
          console.warn('Failed to reuse session:', e);
      }

      if (!browser) {
          browser = await puppeteer.launch(env.MY_BROWSER, { keep_alive: 60000 });
      }

      // 2. Scraping
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      
      // Optimize loading
      await page.setRequestInterception(true);
      page.on('request', (req) => {
          if (['image', 'font', 'stylesheet', 'media'].includes(req.resourceType())) {
              req.abort();
          } else {
              req.continue();
          }
      });

      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

      const pageData = await page.evaluate(() => {
          const getMeta = (name: string) => document.querySelector(`meta[name="${name}"]`)?.getAttribute('content') || '';
          const getProp = (prop: string) => document.querySelector(`meta[property="${prop}"]`)?.getAttribute('content') || '';
          
          return {
              content: document.body.innerHTML.slice(0, 15000), // Truncate for LLM limit
              metadata: {
                  title: document.title || '',
                  description: getMeta('description') || getProp('og:description'),
                  keywords: getMeta('keywords'),
                  author: getMeta('author') || getProp('article:author'),
                  image: getProp('og:image'),
                  url: window.location.href,
              }
          };
      });

      await page.close();
      // Don't close browser if we want to reuse session logic via keep_alive, 
      // but strictly we should disconnect to release the connection for re-use.
      browser.disconnect(); 

      // 3. AI Conversion (Llama 3)
      const systemPrompt = `You are an expert SEO Content Converter. 
      Convert the HTML to clean Markdown.
      - Use # H1, ## H2.
      - Format links [text](url).
      - Remove nav/footer noise.
      - Output ONLY Markdown.`;

      const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `HTML:\n${pageData.content}` }
        ]
      });

      const aiResult = response as unknown as AiModelResponse;
      let markdown = aiResult.response || "Failed to generate markdown.";

      if (enableFrontmatter) {
          const d = new Date().toISOString().split('T')[0];
          const { title, description, keywords, author, image, url: pageUrl } = pageData.metadata;
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
    }

  } catch (error: unknown) {
    console.error('Markdown Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
