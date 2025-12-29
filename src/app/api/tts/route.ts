import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@deepgram/sdk';
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Define strict types for the request body
interface TtsRequest {
  text: string;
  model?: string;
}

//export const runtime = 'edge'; // Use Edge Runtime for lower latency

export async function POST(req: NextRequest) {
  try {
    const { text, model } = (await req.json()) as TtsRequest;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' }, 
        { status: 400 }
      );
    }

    // Retrieve environment variables from Cloudflare context
    const { env } = getCloudflareContext();
    const apiKey = env.DEEPGRAM_API_KEY;

    if (!apiKey) {
      console.error("DEEPGRAM_API_KEY is missing in environment variables.");
      return NextResponse.json(
        { error: 'Service configuration error' }, 
        { status: 500 }
      );
    }

    const deepgram = createClient(apiKey);

    // Call Deepgram's Speak API
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

    // Return the audio stream directly to the client with correct headers
    // @ts-expect-error - ReadableStream type mismatch between web/node standards is common in edge but works
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'attachment; filename="speech.mp3"',
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
