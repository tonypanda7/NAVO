// Navo - Parse URL API (POST URL → AI parsing result)
import { NextRequest, NextResponse } from 'next/server';
import { parseUrl } from '@/lib/parser';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { url } = body;

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const result = await parseUrl(url);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json(
      { error: 'Failed to parse URL' }, 
      { status: 500 }
    );
  }
}
