import { NextRequest, NextResponse } from 'next/server';
import { promises as dns } from 'node:dns';

// --- Configuration ---
const DNSBL_ZONES = [
  'zen.spamhaus.org',
  'bl.spamcop.net',
  'b.barracudacentral.org',
  'dnsbl.sorbs.net',
  'spam.dnsbl.sorbs.net',
  'dnsbl-1.uceprotect.net',
  'dnsbl-3.uceprotect.net',
  'ix.dnsbl.manitu.net',
  'psbl.surriel.com',
  'ubl.unsubscore.com',
  'cbl.abuseat.org',
  'db.wpbl.info'
];

// --- Helpers ---

function reverseIp(ip: string): string {
  return ip.split('.').reverse().join('.');
}

async function checkZone(reversedIp: string, zone: string) {
  const lookupHostname = `${reversedIp}.${zone}`;
  try {
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 3000)
    );
    await Promise.race([dns.resolve4(lookupHostname), timeoutPromise]);
    return { zone, status: 'listed' as const };
  } catch (error: unknown) {
    const code = (error as { code?: string }).code;
    if (code === 'ENOTFOUND') return { zone, status: 'clean' as const };
    return { zone, status: 'error' as const };
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let ip = searchParams.get('ip');

    // --- Deep IP Detection Logic ---
    if (!ip) {
      // 1. Priority: Cloudflare Header (Most trusted when behind CF)
      const cfIp = req.headers.get('cf-connecting-ip');
      
      // 2. Fallback: Standard X-Forwarded-For (First IP is usually the client)
      const forwarded = req.headers.get('x-forwarded-for');
      const forwardedIp = forwarded ? forwarded.split(',')[0].trim() : null;

      // 3. Fallback: Development/Direct connection
      ip = cfIp || forwardedIp || '127.0.0.1';
    }

    // Validate IP format (IPv4)
    if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
      return NextResponse.json({ error: 'Invalid IP address format or IPv6 not supported for BL check' }, { status: 400 });
    }

    // --- Parallel Data Fetching ---
    // Using ipwho.is for GeoIP
    const geoPromise = fetch(`https://ipwho.is/${ip}`).then(res => res.json());
    
    // DNSBL Checks
    const reversedIp = reverseIp(ip);
    const blacklistPromise = Promise.all(DNSBL_ZONES.map(zone => checkZone(reversedIp, zone)));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [geoData, blacklistResults] = await Promise.all([geoPromise as Promise<any>, blacklistPromise]);

    // --- Reputation Score Calculation ---
    let score = 100;
    const listedCount = blacklistResults.filter(r => r.status === 'listed').length;
    
    blacklistResults.forEach(r => {
      if (r.status === 'listed') {
        if (r.zone.includes('spamhaus') || r.zone.includes('spamcop')) score -= 25;
        else score -= 10;
      }
    });
    
    score = Math.max(0, Math.min(100, score));

    let riskLevel = 'Low';
    if (score < 80) riskLevel = 'Medium';
    if (score < 50) riskLevel = 'High';
    if (score < 30) riskLevel = 'Critical';

    return NextResponse.json({
      ip,
      score,
      riskLevel,
      geo: {
        country: geoData.country || 'Unknown',
        country_code: geoData.country_code,
        region: geoData.region,
        city: geoData.city,
        flag: geoData.flag?.img,
        isp: geoData.connection?.isp || geoData.isp || 'Unknown',
        asn: geoData.connection?.asn || 'Unknown',
        org: geoData.connection?.org || 'Unknown',
        latitude: geoData.latitude,
        longitude: geoData.longitude,
        timezone: geoData.timezone?.id,
      },
      blacklist: {
        total_checked: DNSBL_ZONES.length,
        listed_count: listedCount,
        details: blacklistResults
      }
    });

  } catch (error: unknown) {
    console.error('IP Lookup Error:', error);
    return NextResponse.json({ error: 'Failed to analyze IP' }, { status: 500 });
  }
}
