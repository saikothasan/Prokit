import { NextRequest, NextResponse } from 'next/server';

// REMOVED: export const runtime = 'edge'; 
// OpenNext automatically optimizes this for Cloudflare via 'nodejs_compat'

interface BinListResponse {
  number: {
    length: number;
    luhn: boolean;
  };
  scheme: string;
  type: string;
  brand: string;
  prepaid: boolean;
  category: string;
  country: {
    numeric: string;
    alpha2: string;
    alpha3: string;
    name: string;
    emoji: string;
    currency: string;
    latitude: number;
    longitude: number;
  };
  bank: {
    name: string;
    url: string;
    phone: string;
    city: string;
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const binInput = searchParams.get('bin');

    if (!binInput) {
      return NextResponse.json({ error: 'Please provide a "bin" query parameter.' }, { status: 400 });
    }

    const bin = binInput.replace(/\D/g, '').substring(0, 6);

    if (bin.length < 6) {
      return NextResponse.json({ error: 'BIN must contain at least 6 digits.' }, { status: 400 });
    }

    const apiUrl = `https://binlist.io/lookup/${bin}`;
    console.log(`Fetching upstream: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      headers: {
        'Accept-Version': '3',
      },
      // PROFESSIONAL TIP: Cache this request for 1 hour (3600s).
      // This makes repeated lookups instant and avoids API rate limits.
      next: { revalidate: 3600 } 
    });

    if (response.status === 404) {
      return NextResponse.json({ success: false, error: 'BIN not found in global database.' }, { status: 404 });
    }

    if (!response.ok) {
      console.error(`Upstream Error: ${response.status} ${response.statusText}`);
      // Return a generic error so we don't leak upstream details
      return NextResponse.json({ error: 'Service temporarily unavailable.' }, { status: 502 });
    }

    const data = (await response.json()) as BinListResponse;

    return NextResponse.json({
      success: true,
      data: {
        bin: bin,
        brand: data.scheme || 'Unknown',
        type: data.type || 'Unknown',
        category: data.category || '',
        issuer: data.bank?.name || 'Unknown',
        issuer_phone: data.bank?.phone || '',
        issuer_url: data.bank?.url || '',
        country: {
          name: data.country?.name || 'Unknown',
          iso2: data.country?.alpha2 || '',
          iso3: data.country?.alpha3 || '',
        },
      },
    });

  } catch (error) {
    console.error('Error in bin-checker API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
