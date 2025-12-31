import { NextRequest, NextResponse } from 'next/server';
import * as jpeg from '@jsquash/jpeg';
import * as png from '@jsquash/png';
import * as webp from '@jsquash/webp';
import * as avif from '@jsquash/avif';
import resize, { ResizeMethod } from '@jsquash/resize';

// --- Configuration ---
// We fetch WASM from a CDN to avoid bundling limits/issues on Cloudflare Workers
const CDN_BASE = 'https://unpkg.com';

const MODULE_CONFIG = {
  jpeg: { wasm: `${CDN_BASE}/@jsquash/jpeg@1.2.0/codec/pkg/squoosh_mozjpeg_bg.wasm` },
  png: { wasm: `${CDN_BASE}/@jsquash/png@2.0.0/codec/pkg/squoosh_oxipng_bg.wasm` },
  webp: { wasm: `${CDN_BASE}/@jsquash/webp@1.2.0/codec/pkg/squoosh_webp_enc_bg.wasm` },
  avif: { wasm: `${CDN_BASE}/@jsquash/avif@1.3.0/codec/pkg/squoosh_avif_enc_bg.wasm` },
  resize: { wasm: `${CDN_BASE}/@jsquash/resize@1.0.0/lib/resize_bg.wasm` },
};

// Helper to fetch WASM modules dynamically
async function fetchWasm(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load WASM from ${url}`);
  return await res.arrayBuffer();
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const targetFormat = (formData.get('format') as string) || 'webp';
    const quality = parseInt(formData.get('quality') as string) || 80;
    const width = parseInt(formData.get('width') as string) || 0;
    const height = parseInt(formData.get('height') as string) || 0;
    const fit = (formData.get('fit') as 'contain' | 'cover') || 'contain';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    let imageData: ImageData;

    // 1. Decode Input
    // We detect format by magic bytes or extension, but for simplicity here we try/catch standard decoders
    try {
      if (file.type === 'image/jpeg' || file.name.endsWith('.jpg')) {
        const wasm = await fetchWasm(MODULE_CONFIG.jpeg.wasm);
        await jpeg.init(wasm);
        imageData = await jpeg.decode(buffer);
      } else if (file.type === 'image/png' || file.name.endsWith('.png')) {
        const wasm = await fetchWasm(MODULE_CONFIG.png.wasm);
        await png.init(wasm);
        imageData = await png.decode(buffer);
      } else if (file.type === 'image/webp' || file.name.endsWith('.webp')) {
         const wasm = await fetchWasm(MODULE_CONFIG.webp.wasm);
        await webp.init(wasm);
        imageData = await webp.decode(buffer);
      } else {
         // Fallback: Use browser/standard capabilities if available or throw
         // In a pure worker, we might need a generic decoder or rely on jsquash support
         throw new Error('Unsupported input format. Please upload JPG, PNG, or WebP.');
      }
    } catch (e) {
      console.error("Decode error", e);
      return NextResponse.json({ error: 'Failed to decode image. Format might be corrupted or unsupported.' }, { status: 400 });
    }

    // 2. Resize (if requested)
    if (width > 0 || height > 0) {
      const wasm = await fetchWasm(MODULE_CONFIG.resize.wasm);
      await resize.init(wasm);
      
      // Calculate dimensions if one is missing (preserve aspect ratio)
      let targetWidth = width;
      let targetHeight = height;
      
      if (targetWidth === 0) targetWidth = Math.round(imageData.width * (targetHeight / imageData.height));
      if (targetHeight === 0) targetHeight = Math.round(imageData.height * (targetWidth / imageData.width));

      imageData = await resize.resize(imageData, {
        width: targetWidth,
        height: targetHeight,
        fitMethod: fit === 'contain' ? ResizeMethod.Contain : ResizeMethod.Stretch, // jsquash resize mapping
        // 'Cover' logic would require cropping, which is complex manually here, sticking to resize scaling
      });
    }

    // 3. Encode to Target Format
    let resultBuffer: ArrayBuffer;
    
    switch (targetFormat) {
      case 'avif': {
        const wasm = await fetchWasm(MODULE_CONFIG.avif.wasm);
        await avif.init(wasm);
        resultBuffer = await avif.encode(imageData, { quality });
        break;
      }
      case 'jpeg': {
         // Re-init check handled by library usually, but good to be safe
         if (!jpeg.default) await jpeg.init(await fetchWasm(MODULE_CONFIG.jpeg.wasm));
         resultBuffer = await jpeg.encode(imageData, { quality });
         break;
      }
      case 'png': {
         if (!png.default) await png.init(await fetchWasm(MODULE_CONFIG.png.wasm));
         resultBuffer = await png.encode(imageData); // PNG is lossless, usually ignores quality or maps it to optimization effort
         break;
      }
      case 'webp':
      default: {
         if (!webp.default) await webp.init(await fetchWasm(MODULE_CONFIG.webp.wasm));
         resultBuffer = await webp.encode(imageData, { quality });
         break;
      }
    }

    // 4. Return Data
    const base64 = Buffer.from(resultBuffer).toString('base64');
    const mimeType = `image/${targetFormat}`;
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({
      success: true,
      originalSize: file.size,
      optimizedSize: resultBuffer.byteLength,
      width: imageData.width,
      height: imageData.height,
      format: targetFormat,
      image: dataUrl,
    });

  } catch (e: unknown) {
    console.error("Optimization error:", e);
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
