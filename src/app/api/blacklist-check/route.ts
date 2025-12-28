import { NextRequest, NextResponse } from 'next/server';
import { promises as dns } from 'node:dns';

// List of common DNSBL providers to check against
const DNSBL_ZONES = [
  'zen.spamhaus.org',
  'bl.spamcop.net',
  'b.barracudacentral.org',
  'dnsbl.sorbs.net',
  'all.s5h.net',
  'bl.spamcannibal.org',
  'spam.dnsbl.sorbs.net',
  'db.wpbl.info',
  'cbl.abuseat.org',
  'dnsbl-1.uceprotect.net',
  'dnsbl-2.uceprotect.net',
  'dnsbl-3.uceprotect.net',
  'ix.dnsbl.manitu.net',
  'psbl.surriel.com',
  'ubl.unsubscore.com'
];

interface BlacklistResult {
  status: 'listed' | 'not_listed' | 'errored';
  zone: string;
}

// Helper to reverse IP for DNSBL lookup (e.g., 1.2.3.4 -> 4.3.2.1)
function reverseIp(ip: string): string {
  return ip.split('.').reverse().join('.');
}

// Helper to check a single zone with timeout
async function checkZone(reversedIp: string, zone: string): Promise<BlacklistResult> {
  const lookupHostname = `${reversedIp}.${zone}`;
  
  try {
    // 5 second timeout for each lookup
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 5000)
    );

    await Promise.race([
      dns.resolve4(lookupHostname),
      timeoutPromise
    ]);

    // If resolve4 succeeds (does not throw), the IP is listed
    return { status: 'listed', zone };

  } catch (error: unknown) {
    const err = error as NodeJS.ErrnoException;
    
    // ENOTFOUND means the domain exists but has no record (Clean)
    // NXDOMAIN (code usually varies but often comes as ENOTFOUND in Node dns module for this context)
    if (err.code === 'ENOTFOUND') {
      return { status: 'not_listed', zone };
    }

    // Timeout or other network errors
    if (err.message === 'Timeout') {
      return { status: 'errored', zone }; // Mark as error or treat as clean depending on preference
    }

    // Any other error is likely a lookup failure, safe to assume not listed or error
    return { status: 'not_listed', zone };
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get('domain');

  if (!domain) {
    return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
  }

  // Basic cleanup
  const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0];

  try {
    // 1. Resolve the domain to an IP address first
    let ip: string;
    try {
      const addresses = await dns.resolve4(cleanDomain);
      ip = addresses[0]; // Use the first A record
    } catch {
      return NextResponse.json({ error: 'Could not resolve domain to an IP address' }, { status: 400 });
    }

    const reversedIp = reverseIp(ip);

    // 2. Check all zones in parallel
    const results = await Promise.all(
      DNSBL_ZONES.map(zone => checkZone(reversedIp, zone))
    );

    return NextResponse.json({ 
      ip, 
      results 
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage }, 
      { status: 500 }
    );
  }
}
