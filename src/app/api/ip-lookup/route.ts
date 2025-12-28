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

// Reverse IP for DNSBL lookup (1.2.3.4 -> 4.3.2.1)
function reverseIp(ip: string): string {
  return ip.split('.').reverse().join('.');
}

// Check a single DNSBL zone
async function checkZone(reversedIp: string, zone: string) {
  const lookupHostname = `${reversedIp}.${zone}`;
  try {
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 3000)
    );
    await Promise.race([dns.resolve4(lookupHostname), timeoutPromise]);
    return { zone, status: 'listed' as const };
  } catch (error: any) {
    if (error.code === 'ENOTFOUND') return { zone, status: 'clean' as const };
    return { zone, status: 'error' as const };
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let ip = searchParams.get('ip');

    // 1. Detect IP if not provided
    if (!ip) {
      const forwarded = req.headers.get('x-forwarded-for');
      ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1';
    }

    // Validate IP (Basic check)
    if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
      return NextResponse.json({ error: 'Invalid IP address format' }, { status: 400 });
    }

    // 2. Parallel Data Fetching
    // We use ipwho.is for free, no-key, HTTPS-compatible GeoIP data
    const geoPromise = fetch(`https://ipwho.is/${ip}`).then(res => res.json());
    
    // DNSBL Checks
    const reversedIp = reverseIp(ip);
    const blacklistPromise = Promise.all(DNSBL_ZONES.map(zone => checkZone(reversedIp, zone)));

    const [geoData, blacklistResults] = await Promise.all([geoPromise, blacklistPromise]);

    // 3. Calculate Reputation Score
    // Start at 100. High impact lists penalize more.
    let score = 100;
    const listedCount = blacklistResults.filter(r => r.status === 'listed').length;
    
    // Penalties
    blacklistResults.forEach(r => {
      if (r.status === 'listed') {
        if (r.zone.includes('spamhaus') || r.zone.includes('spamcop')) score -= 25;
        else score -= 10;
      }
    });
    
    // Cap score
    score = Math.max(0, Math.min(100, score));

    // Determine Risk Level
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

  } catch (error: any) {
    console.error('IP Lookup Error:', error);
    return NextResponse.json({ error: 'Failed to analyze IP' }, { status: 500 });
  }
}
