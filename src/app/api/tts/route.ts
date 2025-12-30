import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from "@opennextjs/cloudflare";

// export const runtime = 'edge';

interface TtsRequest {
  text: string;
  model: string;
  speaker?: string;
  enhance?: boolean;
}

// Define the expected structure for Base64 audio responses
interface AiAudioResponse {
  audio: string;
}

// Type guard to safely check for Base64 audio response
function isAiAudioResponse(data: unknown): data is AiAudioResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'audio' in data &&
    typeof (data as AiAudioResponse).audio === 'string'
  );
}

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
        
        // Safely access the response without 'any'
        if (aiResponse && typeof aiResponse === 'object' && 'response' in aiResponse) {
             processedText = (aiResponse as { response: string }).response || text;
        }
      } catch (err) {
        console.warn('Enhancement failed, using original text:', err);
      }
    }

    // 2. Generate Speech
    let audioResponse: Blob | null = null;

    if (model.includes('deepgram')) {
       const inputs: { text: string; speaker?: string } = { text: processedText };
       if (speaker) inputs.speaker = speaker;
       
       // Cast to specific model literal to satisfy strict typing
       const response = await env.AI.run(model as '@cf/deepgram/aura-2-en', inputs);
       
       if (response instanceof ReadableStream) {
         audioResponse = await new Response(response).blob();
       } else if (response instanceof Response) {
         audioResponse = await response.blob();
       } else if (isAiAudioResponse(response)) {
          const binaryString = atob(response.audio);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          audioResponse = new Blob([bytes], { type: 'audio/mpeg' });
       } else {
          // Safe fallback for unknown blob-compatible types
          audioResponse = new Blob([response as BlobPart], { type: 'audio/mpeg' });
       }

    } else if (model.includes('melotts')) {
       const response = await env.AI.run('@cf/myshell-ai/melotts', {
         prompt: processedText,
         lang: 'en'
       });
       
       if (isAiAudioResponse(response)) {
          const binaryString = atob(response.audio);
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

    // 3. Return Audio Directly (No R2)
    return new NextResponse(audioResponse, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="speech-${Date.now()}.mp3"`,
      },
    });

  } catch (error) {
    console.error('TTS Error:', error);
    return NextResponse.json({ error: 'Failed to generate speech' }, { status: 500 });
  }
}
