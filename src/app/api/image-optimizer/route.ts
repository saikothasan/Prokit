import { NextRequest, NextResponse } from 'next/server';

// 1. Static Imports for Decoders/Encoders
import jpegDecode, { init as initJpegDecode } from '@jsquash/jpeg/decode';
import jpegEncode, { init as initJpegEncode } from '@jsquash/jpeg/encode';
import pngDecode, { init as initPngDecode } from '@jsquash/png/decode';
import pngEncode, { init as initPngEncode } from '@jsquash/png/encode';
import webpDecode, { init as initWebpDecode } from '@jsquash/webp/decode';
import webpEncode, { init as initWebpEncode } from '@jsquash/webp/encode';
import avifDecode, { init as initAvifDecode } from '@jsquash/avif/decode';
import avifEncode, { init as initAvifEncode } from '@jsquash/avif/encode';

// 2. Import WASM files as assets (configured in next.config.ts)
// @ts-expect-error - Webpack handles these imports via asset/resource
import jpegDecWasm from '@jsquash/jpeg/codec/pkg/squoosh_mozjpeg_dec_bg.wasm';
// @ts-expect-error
import jpegEncWasm from '@jsquash/jpeg/codec/pkg/squoosh_mozjpeg_enc_bg.wasm';
// @ts-expect-error
import pngDecWasm from '@jsquash/png/codec/pkg/squoosh_oxipng_bg.wasm';
// @ts-expect-error
import pngEncWasm from '@jsquash/png/codec/pkg/squoosh_oxipng_bg.wasm';
// @ts-expect-error
import webpDecWasm from '@jsquash/webp/codec/pkg/squoosh_webp_dec_bg.wasm';
// @ts-expect-error
import webpEncWasm from '@jsquash/webp/codec/pkg/squoosh_webp_enc_bg.wasm';
// @ts-expect-error
import avifDecWasm from '@jsquash/avif/codec/pkg/squoosh_avif_dec_bg.wasm';
// @ts-expect-error
import avifEncWasm from '@jsquash/avif/codec/pkg/squoosh_avif_enc_bg.wasm';
// @ts-expect-error
import resizeWasm from '@jsquash/resize/lib/resize_bg.wasm';

// Helper to load WASM from local assets
async function loadWasm(wasmUrl: string, baseUrl: string): Promise<ArrayBuffer> {
  const url = new URL(wasmUrl, baseUrl);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load WASM from ${url.toString()}`);
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
    const fit = (formData.get('fit') as string) || 'contain';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const baseUrl = req.url; // Use current request URL as base for relative assets
    let imageData: ImageData;

    // --- 3. Decode Input ---
    try {
      let decoded: ImageData | null = null;

      if (file.type === 'image/jpeg' || file.name.endsWith('.jpg') || file.name.endsWith('.jpeg')) {
        const wasm = await loadWasm(jpegDecWasm, baseUrl);
        await initJpegDecode(wasm);
        decoded = await jpegDecode(buffer);
      } else if (file.type === 'image/png' || file.name.endsWith('.png')) {
        const wasm = await loadWasm(pngDecWasm, baseUrl);
        await initPngDecode(wasm);
        decoded = await pngDecode(buffer);
      } else if (file.type === 'image/webp' || file.name.endsWith('.webp')) {
        const wasm = await loadWasm(webpDecWasm, baseUrl);
        await initWebpDecode(wasm);
        decoded = await webpDecode(buffer);
      } else if (file.type === 'image/avif' || file.name.endsWith('.avif')) {
         const wasm = await loadWasm(avifDecWasm, baseUrl);
         await initAvifDecode(wasm);
         decoded = await avifDecode(buffer);
      } else {
         throw new Error('Unsupported input format. Allowed: JPG, PNG, WebP, AVIF');
      }

      if (!decoded) {
        throw new Error('Decoder returned null');
      }
      imageData = decoded;

    } catch (e) {
      console.error("Decode error", e);
      return NextResponse.json({ error: 'Failed to decode image. Format might be corrupted or unsupported.' }, { status: 400 });
    }

    // --- 4. Resize (Optional) ---
    if (width > 0 || height > 0) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ResizeMod = await import('@jsquash/resize') as any;
        const resize = ResizeMod.default;
        const initResizeFunc = ResizeMod.initResize || ResizeMod.init;

        const wasm = await loadWasm(resizeWasm, baseUrl);
        
        if (initResizeFunc) {
            await initResizeFunc(wasm);
        }

        let targetWidth = width;
        let targetHeight = height;
        
        if (targetWidth === 0) targetWidth = Math.round(imageData.width * (targetHeight / imageData.height));
        if (targetHeight === 0) targetHeight = Math.round(imageData.height * (targetWidth / imageData.width));

        imageData = await resize(imageData, {
          width: targetWidth,
          height: targetHeight,
          fitMethod: fit === 'contain' ? 'contain' : 'stretch', 
        });
      } catch (resizeError) {
        console.error("Resize error:", resizeError);
        return NextResponse.json({ error: 'Failed during resize operation.' }, { status: 500 });
      }
    }

    // --- 5. Encode to Target Format ---
    let resultBuffer: ArrayBuffer;
    
    try {
      switch (targetFormat) {
        case 'avif': {
          const wasm = await loadWasm(avifEncWasm, baseUrl);
          await initAvifEncode(wasm);
          resultBuffer = await avifEncode(imageData, { quality });
          break;
        }
        case 'jpeg':
        case 'jpg': {
           const wasm = await loadWasm(jpegEncWasm, baseUrl);
           await initJpegEncode(wasm);
           resultBuffer = await jpegEncode(imageData, { quality });
           break;
        }
        case 'png': {
           const wasm = await loadWasm(pngEncWasm, baseUrl);
           await initPngEncode(wasm);
           resultBuffer = await pngEncode(imageData);
           break;
        }
        case 'webp':
        default: {
           const wasm = await loadWasm(webpEncWasm, baseUrl);
           await initWebpEncode(wasm);
           resultBuffer = await webpEncode(imageData, { quality });
           break;
        }
      }
    } catch (encodeError) {
      console.error("Encode error:", encodeError);
      return NextResponse.json({ error: 'Failed to encode to target format.' }, { status: 500 });
    }

    // --- 6. Return Binary Response ---
    const mimeType = `image/${targetFormat === 'jpg' ? 'jpeg' : targetFormat}`;
    
    return new NextResponse(resultBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': resultBuffer.byteLength.toString(),
        'X-Original-Width': imageData.width.toString(),
        'X-Original-Height': imageData.height.toString(),
        'X-Original-Size': file.size.toString(),
      }
    });

  } catch (e: unknown) {
    console.error("Optimization error:", e);
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
