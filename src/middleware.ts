import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function middleware(req: NextRequest) {
  // Only apply to API routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    try {
      // 1. Get Cloudflare Context (Environment Bindings)
      const cfCtx = await getCloudflareContext();
      
      // Safety check: ensure we are running in the Cloudflare environment
      if (!cfCtx || !cfCtx.env.RATE_LIMITER) {
        // Optional: log warning only in development
        // console.warn('RATE_LIMITER binding not found. Skipping rate limit check.');
        return NextResponse.next();
      }

      // 2. Identify the user (IP address) - ROBUST METHOD
      // Priority 1: Cloudflare's verified client IP
      let ip = req.headers.get('cf-connecting-ip');

      // Priority 2: X-Forwarded-For (Must split to get the first one)
      if (!ip) {
        const forwarded = req.headers.get('x-forwarded-for');
        ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
      }

      // 3. Check Rate Limit
      const { success } = await cfCtx.env.RATE_LIMITER.limit({ key: ip });

      if (!success) {
        return NextResponse.json(
          { error: 'Too Many Requests', message: 'Rate limit exceeded. Max requests reached.' },
          { status: 429 }
        );
      }
    } catch (error) {
      console.error('Rate limiting error:', error);
      // Fail open to allow legitimate traffic during system errors
    }
  }

  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: '/api/:path*',
};
