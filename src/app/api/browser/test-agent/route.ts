import { NextRequest, NextResponse } from 'next/server';
import { launchTest } from '@cloudflare/telescope';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import fs from 'fs';
import path from 'path';

// Helper to determine Content-Type based on extension
const getContentType = (filename: string) => {
  const ext = path.extname(filename).toLowerCase();
  const types: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.json': 'application/json',
    '.har': 'application/json',
    '.webm': 'video/webm',
    '.mp4': 'video/mp4',
  };
  return types[ext] || 'application/octet-stream';
};

// R2 Domain Configuration (Ensure this matches your R2 setup)
const R2_CUSTOM_DOMAIN = 'https://c.prokit.uk'; 

export async function POST(req: NextRequest) {
  let resultsPath = '';
  try {
    const { url, browser = 'chrome' } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // 1. Get Context
    const { env } = getCloudflareContext();
    if (!env.MY_FILES) {
      return NextResponse.json({ error: 'Storage binding (R2) not configured.' }, { status: 500 });
    }

    // 2. Run Telescope Test
    const result = await launchTest({
      url,
      browser,
      timeout: 45000, // Increased timeout for heavier pages
      connectionType: 'cable', // Default to cable, can be parameterized
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Telescope test failed' }, { status: 500 });
    }

    const { testId } = result;
    resultsPath = result.resultsPath;

    // 3. Prepare Artifacts for Upload
    const artifacts: { name: string; path: string; folder?: string }[] = [];
    const jsonResults: Record<string, any> = {};

    // Helper to process files
    const processDir = (dir: string, prefix = '') => {
      if (!fs.existsSync(dir)) return;
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          processDir(fullPath, `${prefix}${file}/`);
        } else {
          // Identify specific important files
          if (file === 'metrics.json') jsonResults.metrics = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
          else if (file === 'console.json') jsonResults.console = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
          else if (file === 'resources.json') jsonResults.resources = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
          else if (file === 'config.json') jsonResults.config = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
          
          // Queue for R2 Upload
          // We intentionally upload everything including the JSONs for permalink access
          artifacts.push({ 
            name: file, 
            path: fullPath,
            folder: prefix
          });
        }
      }
    };

    processDir(resultsPath);

    // 4. Upload to R2 (Parallelized)
    const uploadPromises = artifacts.map(async (artifact) => {
      try {
        const fileBuffer = fs.readFileSync(artifact.path);
        const r2Key = `telescope/${testId}/${artifact.folder}${artifact.name}`;
        
        await env.MY_FILES.put(r2Key, fileBuffer, {
          httpMetadata: { contentType: getContentType(artifact.name) },
        });

        return {
          key: artifact.name,
          folder: artifact.folder,
          url: `${R2_CUSTOM_DOMAIN}/${r2Key}`
        };
      } catch (e) {
        console.error(`Failed to upload ${artifact.name}:`, e);
        return null;
      }
    });

    const uploadedFiles = (await Promise.all(uploadPromises)).filter(Boolean);

    // 5. Structure the Response
    // Group filmstrip images
    const filmstrip = uploadedFiles
      .filter(f => f?.folder === 'filmstrip/')
      .sort((a, b) => {
        // Sort by frame number if possible "frame_1.jpg"
        const numA = parseInt(a?.key.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b?.key.match(/\d+/)?.[0] || '0');
        return numA - numB;
      });

    const mainAssets = {
      screenshot: uploadedFiles.find(f => f?.key === 'screenshot.png')?.url,
      video: uploadedFiles.find(f => f?.key.endsWith('.webm') || f?.key.endsWith('.mp4'))?.url,
      har: uploadedFiles.find(f => f?.key === 'pageload.har')?.url,
    };

    return NextResponse.json({
      success: true,
      testId,
      urls: {
        ...mainAssets,
        filmstrip: filmstrip.map(f => f?.url)
      },
      data: {
        metrics: jsonResults.metrics || {},
        console: jsonResults.console || [],
        resources: jsonResults.resources || [],
        config: jsonResults.config || {}
      }
    });

  } catch (error: unknown) {
    console.error('Agent Error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  } finally {
    // 6. Cleanup Ephemeral Files
    if (resultsPath && fs.existsSync(resultsPath)) {
      try {
        fs.rmSync(resultsPath, { recursive: true, force: true });
      } catch (e) {
        console.error('Cleanup failed:', e);
      }
    }
  }
}
