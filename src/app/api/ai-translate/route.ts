import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = 'edge';

// 1. Define the expected shape of the request body
interface TranslateRequest {
  text: string;
  targetLang: string;
}

export async function POST(req: NextRequest) {
  try {
    // 2. Cast the unknown JSON to our Interface
    const { text, targetLang } = (await req.json()) as TranslateRequest;
    
    if (!text || !targetLang) {
      return NextResponse.json({ error: 'Missing text or target language' }, { status: 400 });
    }

    const { env } = getCloudflareContext();

    // 3. Run the AI Model
    // Ensure you have an 'AI' binding in your wrangler.jsonc
    const response = await env.AI.run('@cf/meta/m2m100-1.2b', {
      text: text,
      target_lang: targetLang
    });

    // The AI response type is usually 'any' or specific based on model, 
    // but we can safely access translated_text here.
    return NextResponse.json({ 
      success: true, 
      translated: (response as any).translated_text 
    });

  } catch (error) {
    console.error('AI Error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
