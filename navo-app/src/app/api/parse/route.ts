// Navo - Parse URL API (Supports Multi-Model Pipeline: Whisper + Ling-VL + Llama 70B)
import { NextRequest, NextResponse } from 'next/server';
import { parseUrl } from '@/lib/parser';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { url, context, audioBase64, imageBase64 } = body;

  if (!url && !context && !audioBase64 && !imageBase64) {
    return NextResponse.json({ error: 'At least a URL, caption, audio clip, or screenshot is required' }, { status: 400 });
  }

  try {
    const result = await parseUrl({
      url: url || 'https://instagram.com/reel',
      context,
      audioBase64,
      imageBase64
    });
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to parse reel with Multi-Model AI';
    console.error('Parse error:', message);
    return NextResponse.json(
      { error: message }, 
      { status: 500 }
    );
  }
}
