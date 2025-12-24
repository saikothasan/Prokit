import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

// Define the interfaces locally to match the Cloudflare Images binding API
// and avoid 'any' types.
interface ImagesBinding {
  input(stream: ReadableStream<Uint8Array> | ArrayBuffer): ImageTransformer;
}

interface ImageTransformer {
  transform(options: { format?: string }): ImageTransformer;
  output(options: { format?: string }): Promise<ImageOutput>;
}

interface ImageOutput {
  response(): Response;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const format = (formData.get('format') as string) || 'webp';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const { env } = await getCloudflareContext();

    // The IMAGES binding is typed as Fetcher in the generated types, 
    // but at runtime it is an ImagesBinding. We cast it safely.
    const imagesBinding = env.IMAGES as unknown as ImagesBinding;

    if (!imagesBinding) {
      console.error("IMAGES binding is missing. Ensure 'images' binding is configured in wrangler.jsonc");
      return NextResponse.json({ 
        error: "Image optimization service is not configured correctly." 
      }, { status: 500 });
    }

    const arrayBuffer = await file.arrayBuffer();
    
    // Create image input from buffer
    const imageInput = imagesBinding.input(arrayBuffer);
    
    // Perform transformation
    const transformOptions = {
      format: format
    };

    const output = await imageInput.transform(transformOptions).output(transformOptions);
    
    // Get the response and buffer
    const response = output.response();
    const resultBuffer = await response.arrayBuffer();
    
    // Convert to base64 for the frontend to display/download
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
