import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from "@opennextjs/cloudflare";

// export const runtime = 'edge';

// --- Type Definitions ---
interface ImageGenRequest {
  prompt: string;
  modelId?: string;
  useEnhancer?: boolean;
  settings?: {
    negativePrompt?: string;
    numSteps?: number;
    guidanceScale?: number;
    seed?: number;
    width?: number;
    height?: number;
  };
  gatewayId?: string; // Optional: Pass gateway ID from client or env
}

// --- Model Configuration ---
const MODEL_CONFIGS: Record<string, any> = {
  '@cf/black-forest-labs/flux-1-schnell': {
    type: 'flux',
    defaults: { num_steps: 4, width: 1024, height: 768 }
  },
  '@cf/black-forest-labs/flux-1-dev': { // Assuming standard dev or use user's flux-2 if strictly needed
    type: 'flux',
    defaults: { num_steps: 20, guidance: 7.5, width: 1024, height: 768 }
  },
  '@cf/stabilityai/stable-diffusion-xl-base-1.0': {
    type: 'sdxl',
    defaults: { num_steps: 30, guidance: 7.5, width: 1024, height: 1024 }
  },
  '@cf/bytedance/stable-diffusion-xl-lightning': {
    type: 'sdxl-lightning',
    defaults: { num_steps: 4, width: 1024, height: 1024 }
  },
  '@cf/lykon/dreamshaper-8-lcm': {
    type: 'sdxl-lcm',
    defaults: { num_steps: 8, guidance: 1.5, width: 768, height: 768 }
  }
};

export async function POST(req: NextRequest) {
  try {
    const { 
      prompt, 
      modelId = '@cf/black-forest-labs/flux-1-schnell', 
      useEnhancer = true, 
      settings = {},
      gatewayId 
    } = (await req.json()) as ImageGenRequest;

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    
    // --- 1. CONFIGURATION & AI GATEWAY ---
    // Use the provided gatewayId or fallback to a known environment variable/string if available
    // The binding option { gateway: { id: ... } } enables the AI Gateway
    const runOptions = gatewayId ? { gateway: { id: gatewayId, skipCache: false } } : {};

    let finalPrompt = prompt;
    let enhancementTrace = [];

    // --- 2. MULTI-STEP PROMPT ENHANCEMENT ---
    if (useEnhancer) {
      try {
        const enhancerModel = '@cf/meta/llama-3.3-70b-instruct-fp8-fast'; // Powerful model for logic

        // Step 2.1: Expansion & Detail
        const expansionResponse = await env.AI.run(enhancerModel, {
          messages: [
            { 
              role: 'system', 
              content: `You are an expert visual prompt engineer. Analyze the user's short request.
              Expand it into a rich visual description focusing on: Lighting, Texture, Camera Angle, and Atmosphere.
              Keep it under 3 sentences. Output ONLY the description.` 
            },
            { role: 'user', content: prompt }
          ]
        }, runOptions) as { response: string };
        
        const expandedPrompt = expansionResponse?.response || prompt;
        enhancementTrace.push({ step: 'Expansion', result: expandedPrompt });

        // Step 2.2: Stylization & Model Optimization (Chain of Thought)
        const optimizationResponse = await env.AI.run(enhancerModel, {
          messages: [
            { 
              role: 'system', 
              content: `You are optimizing a prompt for an AI Image Generator (${modelId}).
              Take the provided description and format it strictly as a comma-separated list of tags and phrases.
              Include technical keywords (e.g., "8k resolution", "cinematic lighting", "photorealistic").
              Output ONLY the final prompt string.` 
            },
            { role: 'user', content: expandedPrompt }
          ]
        }, runOptions) as { response: string };

        if (optimizationResponse?.response) {
          finalPrompt = optimizationResponse.response;
          enhancementTrace.push({ step: 'Optimization', result: finalPrompt });
        }
      } catch (e) {
        console.warn('Enhancement failed, using raw prompt:', e);
        enhancementTrace.push({ step: 'Error', result: 'Enhancement skipped due to timeout/error' });
      }
    }

    // --- 3. MODEL PREPARATION ---
    const config = MODEL_CONFIGS[modelId] || MODEL_CONFIGS['@cf/black-forest-labs/flux-1-schnell'];
    
    // Map generic settings to model-specific inputs
    let inputs: any = { prompt: finalPrompt };
    
    // Merge defaults with user settings
    const width = settings.width || config.defaults.width;
    const height = settings.height || config.defaults.height;
    const steps = settings.numSteps || config.defaults.num_steps;
    const seed = settings.seed || Math.floor(Math.random() * 1000000);

    if (config.type === 'flux') {
      // Flux Inputs
      inputs = {
        prompt: finalPrompt,
        num_steps: steps,
        width,
        height,
        // seed is sometimes supported depending on exact version/shim
        seed, 
      };
      // Add guidance only if supported (Flux Schnell typically doesn't use it, Dev does)
      if (modelId.includes('dev')) {
        inputs.guidance = settings.guidanceScale || config.defaults.guidance;
      }
    } else {
      // Stable Diffusion Inputs
      inputs = {
        prompt: finalPrompt,
        negative_prompt: settings.negativePrompt || 'blurry, low quality, distorted, ugly, watermark',
        num_steps: steps,
        width,
        height,
        guidance: settings.guidanceScale || config.defaults.guidance,
        seed,
      };
    }

    // --- 4. GENERATION ---
    const imageResponse = await env.AI.run(modelId, inputs, runOptions) as { image: string };

    return NextResponse.json({
      success: true,
      image: imageResponse.image, // Base64
      originalPrompt: prompt,
      finalPrompt: finalPrompt,
      trace: enhancementTrace,
      modelUsed: modelId,
      params: inputs
    });

  } catch (error: any) {
    console.error('AI Image Gen Error:', error);
    return NextResponse.json(
      { error: error.message || 'Generation failed' }, 
      { status: 500 }
    );
  }
}
