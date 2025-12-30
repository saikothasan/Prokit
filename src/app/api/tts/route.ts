import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from "@opennextjs/cloudflare";

// export const runtime = 'edge';

interface TtsRequest {
  text: string;
  model: string; // e.g., '@cf/deepgram/aura-2-en'
  speaker?: string; // e.g., 'luna'
  enhance?: boolean;
}

// Helper to sanitize keys for R2
const generateKey = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}.mp3`;

export async function POST(req: NextRequest) {
  try {
    const { text, model, speaker, enhance } = (await req.json()) as TtsRequest;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const { env } = getCloudflareContext();

    // 1. Prompt Enhancement (Optional)
    let processedText = text;
    if (enhance) {
      try {
        const prompt = `
          You are a professional script editor for Text-to-Speech engines. 
          Rewrite the following text to sound more natural when spoken.
          Rules:
          - Add commas for natural pauses.
          - Spell out numbers (e.g., "1/2" -> "one half", "$10" -> "ten dollars").
          - Expand abbreviations (e.g., "Dr." -> "Doctor").
          - Do not change the meaning or tone.
          - Return ONLY the rewritten text.

          Input Text: "${text}"
        `;
        
        const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 512,
        });
        
        if (aiResponse && 'response' in aiResponse) {
             processedText = aiResponse.response || text;
        }
      } catch (err) {
        console.warn('Enhancement failed, using original text:', err);
      }
    }

    // 2. Generate Speech
    let audioResponse: Blob | null = null;

    if (model.includes('deepgram')) {
       // Deepgram Aura on Workers AI
       // Schema: { text: string, speaker?: string }
       // Valid speakers for aura-2-en: asterisk, luna, stella, athena, etc.
       const inputs: any = { text: processedText };
       if (speaker) inputs.speaker = speaker;
       
       const response = await env.AI.run(model as any, inputs);
       
       // Workers AI returns a response with a body stream or base64 depending on the model/binding version.
       // The `run` method for binary outputs usually returns a ReadableStream or ArrayBuffer in some bindings, 
       // but strictly typed it might return { audio: number[] } or similar.
       // However, for standard fetch-based usage it returns a Response. 
       // When using the binding `env.AI.run`, it typically returns an object. 
       // For TTS, it often returns a ReadableStream (if using raw) or base64.
       // Let's assume it returns a standard response object or we handle the specific output type.
       // Based on docs: output is often `ReadableStream` for binary types in recent versions.
       
       // Handle different potential return types from the AI binding safely
       if (response instanceof ReadableStream) {
         audioResponse = await new Response(response).blob();
       } else if (response instanceof Response) {
         audioResponse = await response.blob();
       } else if ((response as any).audio) {
          // If base64
          const binaryString = atob((response as any).audio);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          audioResponse = new Blob([bytes], { type: 'audio/mpeg' });
       } else {
          // Fallback for direct byte array
          audioResponse = new Blob([response as any], { type: 'audio/mpeg' });
       }

    } else if (model.includes('melotts')) {
      // MeloTTS
      // Schema: { prompt: string, lang: string }
       const response = await env.AI.run('@cf/myshell-ai/melotts', {
         prompt: processedText,
         lang: 'en' // Defaulting to English for now, as Melo mainly supports EN well
       });
       
       if ((response as any).audio) {
          const binaryString = atob((response as any).audio);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          audioResponse = new Blob([bytes], { type: 'audio/mpeg' });
       }
    } else {
       return NextResponse.json({ error: 'Unsupported model' }, { status: 400 });
    }

    if (!audioResponse) {
       throw new Error("No audio generated");
    }

    // 3. Store in R2
    const fileKey = generateKey('tts');
    await env.MY_FILES.put(fileKey, audioResponse);

    // 4. Return URL info
    return NextResponse.json({ 
      success: true, 
      id: fileKey,
      url: `/api/tts?id=${fileKey}`
    });

  } catch (error) {
    console.error('TTS Error:', error);
    return NextResponse.json({ error: 'Failed to generate speech' }, { status: 500 });
  }
}

// GET handler to serve the file from R2
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
  }

  const { env } = getCloudflareContext();
  const object = await env.MY_FILES.get(id);

  if (!object) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers as any);
  headers.set('etag', object.httpEtag);
  headers.set('Content-Type', 'audio/mpeg');

  return new NextResponse(object.body, { headers });
}
