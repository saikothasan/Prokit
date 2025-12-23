import { NextRequest, NextResponse } from 'next/server';
import { promises as dns } from 'node:dns';

 // Force Node.js runtime compatibility

interface DnsRequest {
  domain: string;
  type: 'A' | 'AAAA' | 'MX' | 'TXT' | 'NS' | 'CNAME';
}

export async function POST(req: NextRequest) {
  try {
    const { domain, type } = (await req.json()) as DnsRequest;

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    let result;
    
    // Cloudflare Workers node:dns implementation limitations:
    // 'lookup' (which uses OS host file) is NOT supported.
    // We must use specific resolve methods.
    switch (type) {
      case 'A':
        result = await dns.resolve4(domain);
        break;
      case 'AAAA':
        result = await dns.resolve6(domain);
        break;
      case 'MX':
        result = await dns.resolveMx(domain);
        break;
      case 'TXT':
        result = await dns.resolveTxt(domain);
        break;
      case 'NS':
        result = await dns.resolveNs(domain);
        break;
      case 'CNAME':
        result = await dns.resolveCname(domain);
        break;
      default:
        return NextResponse.json({ error: 'Unsupported record type' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    // Handle DNS errors gracefully (e.g., ENODATA, ENOTFOUND)
    return NextResponse.json(
      { success: false, error: error.code || error.message }, 
      { status: 500 }
    );
  }
}
