import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get('domain');

  if (!domain) {
    return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
  }

  // Basic cleanup to ensure we send just the domain
  const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0];

  try {
    const response = await fetch("https://www.warmupinbox.com/wp-json/my-ai-tools/v1/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
        "Referer": "https://www.warmupinbox.com/"
      },
      body: JSON.stringify({
        task: "blacklist_checker",
        input: cleanDomain
      })
    });

    if (!response.ok) {
      throw new Error(`Upstream service error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to check blacklists';
    return NextResponse.json(
      { error: errorMessage }, 
      { status: 500 }
    );
  }
}
