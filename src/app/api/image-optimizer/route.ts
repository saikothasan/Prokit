import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

// Define the interface for the Cloudflare Images Binding
interface ImagesBinding {
  input(source: ReadableStream | ArrayBuffer): ImageTransformer;
}

interface ImageTransformer {
  transform(options: TransformOptions): ImageTransformer;
  output(options: OutputOptions): Promise<ImageOutput>;
}

interface TransformOptions {
  width?: number;
  height?: number;
  rotate?: number;
  blur?: number;
  format?: string;
}

interface OutputOptions {
  format?: string;
  quality?: number;
}

interface ImageOutput {
  response(): Response;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Parse FormData
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const format = (formData.get('format') as string) || 'webp';
    const quality = parseInt(formData.get('quality') as string) || 80;
    const scale = formData.get('scale') as string; // 'original', '1920', '1080', etc.

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 2. Access Cloudflare Environment
    const { env } = await getCloudflareContext();
    const imagesBinding = env.IMAGES as unknown as ImagesBinding;

    if (!imagesBinding) {
      console.error("IMAGES binding is missing. Check wrangler.jsonc");
      return NextResponse.json({ 
        error: "Image optimization service is not configured correctly." 
      }, { status: 500 });
    }

    // 3. Prepare Input
    const arrayBuffer = await file.arrayBuffer();
    const imageInput = imagesBinding.input(arrayBuffer);
    
    // 4. Configure Transformations
    // Note: transformations are chainable
    let transformer = imageInput;

    // Apply resizing if requested
    if (scale && scale !== 'original') {
        const width = parseInt(scale);
        if (!isNaN(width)) {
            transformer = transformer.transform({ width });
        }
    }

    // 5. Generate Output
    // We explicitly set the format in .output() for final conversion
    const output = await transformer.output({ 
        format,
        quality
    });
    
    // 6. Process Response
    const response = output.response();
    const resultBuffer = await response.arrayBuffer();
    
    // Convert to base64 for immediate frontend display/download
    // (For very large files, a stream/blob response might be better, but base64 is easiest for tools)
    const base64 = Buffer.from(resultBuffer).toString('base64');
    const mimeType = response.headers.get('content-type') || `image/${format}`;
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({ 
      success: true, 
      originalSize: file.size, 
      optimizedSize: resultBuffer.byteLength,
      format: format,
      image: dataUrl
    });

  } catch (e: unknown) {
    console.error("Image optimization error:", e);
    const message = e instanceof Error ? e.message : 'An unknown error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
