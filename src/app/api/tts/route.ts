import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@deepgram/sdk';
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Define strict types for the request body
interface TtsRequest {
  text: string;
  model?: string;
}

//export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { text, model } = (await req.json()) as TtsRequest;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const { env } = getCloudflareContext();

    // 1. Retrieve Secret from Cloudflare Secrets Store or Standard Env
    // If you used the 'secrets_store' binding named "SECRETS":
    let apiKey = env.DEEPGRAM_API_KEY;
    
    // Check if the SECRETS binding exists (specific to Secrets Store integration)
    if ((env as any).SECRETS) {
      try {
        // @ts-expect-error - The SECRETS binding type isn't automatically inferred in all setups yet
        const secretValue = await (env as any).SECRETS.get("DEEPGRAM_API_KEY");
        if (secretValue) apiKey = secretValue;
      } catch (e) {
        console.warn("Failed to fetch from Secrets Store, falling back to env var", e);
      }
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'Service configuration error: API Key missing' }, { status: 500 });
    }

    const deepgram = createClient(apiKey);

    // 2. Request Audio from Deepgram
    const response = await deepgram.speak.request(
      { text },
      {
        model: model || 'aura-asteria-en',
        encoding: 'mp3',
        container: 'mp3',
      }
    );

    const stream = await response.getStream();

    if (!stream) {
      throw new Error('No audio stream received from Deepgram');
    }

    // 3. Stream response directly to client (Low Latency)
    // @ts-expect-error - ReadableStream type mismatch is common in Edge but valid
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'X-Tts-Model': model || 'aura-asteria-en',
        'Content-Disposition': `attachment; filename="speech-${Date.now()}.mp3"`,
      },
    });

  } catch (error) {
    console.error('TTS Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' }, 
      { status: 500 }
    );
  }
}
