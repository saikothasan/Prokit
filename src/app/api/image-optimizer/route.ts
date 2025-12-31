import { NextRequest, NextResponse } from 'next/server';
import jpegDecode, { init as initJpegDecode } from '@jsquash/jpeg/decode';
import jpegEncode, { init as initJpegEncode } from '@jsquash/jpeg/encode';
import pngDecode, { init as initPngDecode } from '@jsquash/png/decode';
import pngEncode, { init as initPngEncode } from '@jsquash/png/encode';
import webpDecode, { init as initWebpDecode } from '@jsquash/webp/decode';
import webpEncode, { init as initWebpEncode } from '@jsquash/webp/encode';
import avifDecode, { init as initAvifDecode } from '@jsquash/avif/decode';
import avifEncode, { init as initAvifEncode } from '@jsquash/avif/encode';
import resize, { initResize } from '@jsquash/resize';

// --- Configuration ---
// We fetch WASM from a CDN to avoid bundling limits/issues on Cloudflare Workers
const CDN_BASE = 'https://unpkg.com';

// Note: Ensure these versions match your package.json or use 'latest' if appropriate.
// Decoder and Encoder WASMs are often separate files in newer versions. 
// For this fix, we are using the provided URLs, but you may need to check 
// the @jsquash package contents on unpkg for dedicated decoder WASMs (e.g., jpeg_dec.wasm)
// if you encounter runtime errors during decoding.
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
    try {
      if (file.type === 'image/jpeg' || file.name.endsWith('.jpg') || file.name.endsWith('.jpeg')) {
        const wasm = await fetchWasm(MODULE_CONFIG.jpeg.wasm);
        await initJpegDecode(wasm);
        imageData = await jpegDecode(buffer);
      } else if (file.type === 'image/png' || file.name.endsWith('.png')) {
        const wasm = await fetchWasm(MODULE_CONFIG.png.wasm);
        await initPngDecode(wasm);
        imageData = await pngDecode(buffer);
      } else if (file.type === 'image/webp' || file.name.endsWith('.webp')) {
        const wasm = await fetchWasm(MODULE_CONFIG.webp.wasm);
        await initWebpDecode(wasm);
        imageData = await webpDecode(buffer);
      } else if (file.type === 'image/avif' || file.name.endsWith('.avif')) {
         const wasm = await fetchWasm(MODULE_CONFIG.avif.wasm);
         await initAvifDecode(wasm);
         imageData = await avifDecode(buffer);
      } else {
         throw new Error('Unsupported input format. Please upload JPG, PNG, WebP or AVIF.');
      }
    } catch (e) {
      console.error("Decode error", e);
      return NextResponse.json({ error: 'Failed to decode image. Format might be corrupted or unsupported.' }, { status: 400 });
    }

    // 2. Resize (if requested)
    if (width > 0 || height > 0) {
      const wasm = await fetchWasm(MODULE_CONFIG.resize.wasm);
      await initResize(wasm);
      
      // Calculate dimensions if one is missing (preserve aspect ratio)
      let targetWidth = width;
      let targetHeight = height;
      
      if (targetWidth === 0) targetWidth = Math.round(imageData.width * (targetHeight / imageData.height));
      if (targetHeight === 0) targetHeight = Math.round(imageData.height * (targetWidth / imageData.width));

      imageData = await resize(imageData, {
        width: targetWidth,
        height: targetHeight,
        // @jsquash/resize uses string literals 'contain' | 'stretch' for fitMethod
        fitMethod: fit === 'contain' ? 'contain' : 'stretch', 
      });
    }

    // 3. Encode to Target Format
    let resultBuffer: ArrayBuffer;
    
    switch (targetFormat) {
      case 'avif': {
        const wasm = await fetchWasm(MODULE_CONFIG.avif.wasm);
        await initAvifEncode(wasm);
        resultBuffer = await avifEncode(imageData, { quality });
        break;
      }
      case 'jpeg':
      case 'jpg': {
         const wasm = await fetchWasm(MODULE_CONFIG.jpeg.wasm);
         await initJpegEncode(wasm);
         resultBuffer = await jpegEncode(imageData, { quality });
         break;
      }
      case 'png': {
         const wasm = await fetchWasm(MODULE_CONFIG.png.wasm);
         await initPngEncode(wasm);
         resultBuffer = await pngEncode(imageData);
         break;
      }
      case 'webp':
      default: {
         const wasm = await fetchWasm(MODULE_CONFIG.webp.wasm);
         await initWebpEncode(wasm);
         resultBuffer = await webpEncode(imageData, { quality });
         break;
      }
    }

    // 4. Return Data
    const base64 = Buffer.from(resultBuffer).toString('base64');
    const mimeType = `image/${targetFormat === 'jpg' ? 'jpeg' : targetFormat}`;
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
