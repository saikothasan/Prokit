import { NextRequest, NextResponse } from 'next/server';
import { promises as dns } from 'node:dns';

interface DnsRequest {
  domain: string;
  type: 'A' | 'AAAA' | 'MX' | 'TXT' | 'NS' | 'CNAME' | 'PTR' | 'SOA' | 'SRV' | 'CAA';
}

export async function POST(req: NextRequest) {
  try {
    const { domain, type } = (await req.json()) as DnsRequest;

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    let result: unknown;

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
      case 'PTR':
        result = await dns.resolvePtr(domain);
        break;
      case 'SOA':
        result = await dns.resolveSoa(domain);
        break;
      case 'SRV':
        result = await dns.resolveSrv(domain);
        break;
      case 'CAA':
        result = await dns.resolveCaa(domain);
        break;
      default:
        return NextResponse.json({ error: 'Unsupported record type' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorCode = (error as any).code;

    return NextResponse.json(
      { success: false, error: errorCode || errorMessage },
      { status: 500 }
    );
  }
}
