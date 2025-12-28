import { NextRequest, NextResponse } from 'next/server';

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

// Use DNS-over-HTTPS (DoH) for Edge Compatibility
// Cloudflare Workers cannot use the native 'node:dns' module.
async function checkZone(reversedIp: string, zone: string) {
  const lookupHostname = `${reversedIp}.${zone}`;
  try {
    // Using Google Public DNS JSON API
    const response = await fetch(`https://dns.google/resolve?name=${lookupHostname}&type=A`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 60 } // Cache DNS results slightly
    });
    
    // Explicitly cast the response to unknown first
    const data = (await response.json()) as { Status?: number; Answer?: unknown[] };
    
    // Status 0 = Success (Record Exists -> LISTED)
    // Status 3 = NXDOMAIN (No Record -> CLEAN)
    if (data.Status === 0 && Array.isArray(data.Answer) && data.Answer.length > 0) {
      return { zone, status: 'listed' as const };
    }
    
    return { zone, status: 'clean' as const };
  } catch (error) {
    console.error(`DNS Check Error for ${zone}:`, error);
    return { zone, status: 'error' as const };
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let ip = searchParams.get('ip');

    // 1. Robust IP Detection for Cloudflare
    if (!ip) {
      const cfIp = req.headers.get('cf-connecting-ip');
      if (cfIp) {
        ip = cfIp;
      } else {
        const forwarded = req.headers.get('x-forwarded-for');
        ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
      }
    }

    // Validate IPv4 format
    if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
      return NextResponse.json({ error: 'Invalid IPv4 address' }, { status: 400 });
    }

    // 2. Parallel Data Fetching
    // Fetch Geo Data
    const geoPromise = fetch(`https://ipwho.is/${ip}`)
      .then(res => res.json())
      .catch(() => ({ success: false })); // Fail gracefully
    
    // Fetch Blacklists
    const reversedIp = reverseIp(ip);
    const blacklistPromise = Promise.all(DNSBL_ZONES.map(zone => checkZone(reversedIp, zone)));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [geoData, blacklistResults] = await Promise.all([geoPromise as Promise<any>, blacklistPromise]);

    // 3. Calculate Reputation Score
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
      // Ensure geo object is always safe, even if API fails
      geo: {
        country: geoData.country || 'Unknown',
        country_code: geoData.country_code || 'XX',
        region: geoData.region || 'Unknown',
        city: geoData.city || 'Unknown',
        flag: geoData.flag?.img || '',
        isp: geoData.connection?.isp || geoData.isp || 'Unknown',
        asn: geoData.connection?.asn || 0,
        org: geoData.connection?.org || 'Unknown',
        latitude: typeof geoData.latitude === 'number' ? geoData.latitude : 0,
        longitude: typeof geoData.longitude === 'number' ? geoData.longitude : 0,
        timezone: geoData.timezone?.id || 'UTC',
      },
      blacklist: {
        total_checked: DNSBL_ZONES.length,
        listed_count: listedCount,
        details: blacklistResults
      }
    });

  } catch (error: unknown) {
    console.error('IP Lookup Fatal Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
