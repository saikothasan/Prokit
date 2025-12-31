import { NextRequest, NextResponse } from 'next/server';

// 1. Correct Subpath Imports for Decoders and Encoders
import jpegDecode, { init as initJpegDecode } from '@jsquash/jpeg/decode';
import jpegEncode, { init as initJpegEncode } from '@jsquash/jpeg/encode';
import pngDecode, { init as initPngDecode } from '@jsquash/png/decode';
import pngEncode, { init as initPngEncode } from '@jsquash/png/encode';
import webpDecode, { init as initWebpDecode } from '@jsquash/webp/decode';
import webpEncode, { init as initWebpEncode } from '@jsquash/webp/encode';
import avifDecode, { init as initAvifDecode } from '@jsquash/avif/decode';
import avifEncode, { init as initAvifEncode } from '@jsquash/avif/encode';
import resize, { init as initResize } from '@jsquash/resize';

// --- Configuration ---
const CDN_BASE = 'https://unpkg.com';

// WASM Module URLs (Pinned versions for stability)
const MODULE_CONFIG = {
  jpegDec: `${CDN_BASE}/@jsquash/jpeg@1.2.0/codec/pkg/squoosh_mozjpeg_dec_bg.wasm`,
  jpegEnc: `${CDN_BASE}/@jsquash/jpeg@1.2.0/codec/pkg/squoosh_mozjpeg_enc_bg.wasm`,
  pngDec: `${CDN_BASE}/@jsquash/png@2.0.0/codec/pkg/squoosh_oxipng_bg.wasm`, // PNG uses one binary for both often, or we check specific pkg structure
  pngEnc: `${CDN_BASE}/@jsquash/png@2.0.0/codec/pkg/squoosh_oxipng_bg.wasm`,
  webpDec: `${CDN_BASE}/@jsquash/webp@1.2.0/codec/pkg/squoosh_webp_dec_bg.wasm`,
  webpEnc: `${CDN_BASE}/@jsquash/webp@1.2.0/codec/pkg/squoosh_webp_enc_bg.wasm`,
  avifDec: `${CDN_BASE}/@jsquash/avif@1.3.0/codec/pkg/squoosh_avif_dec_bg.wasm`,
  avifEnc: `${CDN_BASE}/@jsquash/avif@1.3.0/codec/pkg/squoosh_avif_enc_bg.wasm`,
  resize: `${CDN_BASE}/@jsquash/resize@1.0.0/lib/resize_bg.wasm`,
};

// Helper: Fetch WASM from CDN
async function fetchWasm(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load WASM module: ${url}`);
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
    
    // Default to 'contain' if not provided
    const fit = (formData.get('fit') as string) === 'stretch' ? 'stretch' : 'contain';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    let imageData: ImageData;

    // --- 2. Decode Input Image ---
    try {
      // Determine type by magic bytes would be better, but relying on type/extension for now
      if (file.type === 'image/jpeg' || file.name.endsWith('.jpg') || file.name.endsWith('.jpeg')) {
        const wasm = await fetchWasm(MODULE_CONFIG.jpegDec);
        await initJpegDecode(wasm);
        imageData = await jpegDecode(buffer);
      } else if (file.type === 'image/png' || file.name.endsWith('.png')) {
        const wasm = await fetchWasm(MODULE_CONFIG.pngDec);
        await initPngDecode(wasm);
        imageData = await pngDecode(buffer);
      } else if (file.type === 'image/webp' || file.name.endsWith('.webp')) {
        const wasm = await fetchWasm(MODULE_CONFIG.webpDec);
        await initWebpDecode(wasm);
        imageData = await webpDecode(buffer);
      } else if (file.type === 'image/avif' || file.name.endsWith('.avif')) {
        const wasm = await fetchWasm(MODULE_CONFIG.avifDec);
        await initAvifDecode(wasm);
        imageData = await avifDecode(buffer);
      } else {
        throw new Error('Unsupported input format. Allowed: JPG, PNG, WebP, AVIF');
      }
    } catch (error) {
      console.error("Decoding failed:", error);
      return NextResponse.json({ error: 'Failed to decode image. It may be corrupt or unsupported.' }, { status: 400 });
    }

    // --- 3. Resize (Optional) ---
    if (width > 0 || height > 0) {
      const wasm = await fetchWasm(MODULE_CONFIG.resize);
      await initResize(wasm);

      let targetWidth = width;
      let targetHeight = height;

      // Auto-calc dimension if set to 0 (preserve aspect ratio)
      if (targetWidth === 0) {
        targetWidth = Math.round(imageData.width * (targetHeight / imageData.height));
      }
      if (targetHeight === 0) {
        targetHeight = Math.round(imageData.height * (targetWidth / imageData.width));
      }

      imageData = await resize(imageData, {
        width: targetWidth,
        height: targetHeight,
        fitMethod: fit, // Pass string 'contain' or 'stretch'
      });
    }

    // --- 4. Encode Output Image ---
    let resultBuffer: ArrayBuffer;

    try {
      switch (targetFormat) {
        case 'avif': {
          const wasm = await fetchWasm(MODULE_CONFIG.avifEnc);
          await initAvifEncode(wasm);
          resultBuffer = await avifEncode(imageData, { quality });
          break;
        }
        case 'jpeg':
        case 'jpg': {
          const wasm = await fetchWasm(MODULE_CONFIG.jpegEnc);
          await initJpegEncode(wasm);
          resultBuffer = await jpegEncode(imageData, { quality });
          break;
        }
        case 'png': {
          const wasm = await fetchWasm(MODULE_CONFIG.pngEnc);
          await initPngEncode(wasm);
          // PNG is lossless; 'quality' doesn't apply directly in same way as JPEG
          resultBuffer = await pngEncode(imageData); 
          break;
        }
        case 'webp':
        default: {
          const wasm = await fetchWasm(MODULE_CONFIG.webpEnc);
          await initWebpEncode(wasm);
          resultBuffer = await webpEncode(imageData, { quality });
          break;
        }
      }
    } catch (error) {
       console.error("Encoding failed:", error);
       return NextResponse.json({ error: 'Failed to encode image to target format.' }, { status: 500 });
    }

    // --- 5. Return Response ---
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
    console.error("Image Optimizer Error:", e);
    const message = e instanceof Error ? e.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
