import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from "@opennextjs/cloudflare";

interface ImageGenRequest {
  prompt: string;
  useEnhancer: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, useEnhancer = true } = (await req.json()) as ImageGenRequest;

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    let finalPrompt = prompt;
    let enhanced = false;

    // --- STEP 1: PROMPT ENHANCEMENT (Chain Node 1) ---
    // If enabled, we feed the raw input into an LLM to generate a detailed description.
    if (useEnhancer) {
      try {
        const enhanceResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          messages: [
            { 
              role: 'system', 
              content: `You are an expert AI image prompt engineer. Your task is to take a short, simple user concept and expand it into a detailed, high-quality prompt suitable for the FLUX.2 diffusion model. 
              Focus on: Lighting, Texture, Camera Angle, Composition, and Artistic Style. 
              Do not add conversational filler. Output ONLY the enhanced prompt text.` 
            },
            { role: 'user', content: prompt }
          ]
        }) as { response: string };

        if (enhanceResponse?.response) {
          finalPrompt = enhanceResponse.response;
          enhanced = true;
        }
      } catch (e) {
        console.warn('Prompt enhancement failed, falling back to raw prompt:', e);
      }
    }

    // --- STEP 2: IMAGE GENERATION (Chain Node 2) ---
    // We use the FLUX.2 [dev] model. 
    // Note: Flux 2 often requires specific parameter tuning for best results.
    const imageResponse = await env.AI.run('@cf/black-forest-labs/flux-2-dev', {
      prompt: finalPrompt,
      num_steps: 25,     // Higher steps for "dev" model quality
      guidance: 7.5,     // Standard guidance scale
      width: 1024,
      height: 768,
      output_format: 'png'
    }) as { image: string };

    return NextResponse.json({
      success: true,
      image: imageResponse.image, // Base64 string
      originalPrompt: prompt,
      finalPrompt: finalPrompt,
      isEnhanced: enhanced
    });

  } catch (error) {
    console.error('AI Image Gen Error:', error);
    return NextResponse.json(
      { error: 'Generation failed. The model might be busy or warming up.' }, 
      { status: 500 }
    );
  }
}
