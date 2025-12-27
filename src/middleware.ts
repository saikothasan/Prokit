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
        console.warn('RATE_LIMITER binding not found. Skipping rate limit check.');
        return NextResponse.next();
      }

      // 2. Identify the user (IP address)
      // 'cf-connecting-ip' is standard for Cloudflare; fallback to 'x-forwarded-for'
      const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown';

      // 3. Check Rate Limit
      const { success } = await cfCtx.env.RATE_LIMITER.limit({ key: ip });

      if (!success) {
        return NextResponse.json(
          { error: 'Too Many Requests', message: 'Rate limit exceeded. Max 5 requests per hour.' },
          { status: 429 }
        );
      }
    } catch (error) {
      console.error('Rate limiting error:', error);
      // Fail open (allow request) or closed (deny) depending on preference. 
      // Usually fail open to prevent blocking legitimate traffic on system errors.
    }
  }

  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: '/api/:path*',
};
