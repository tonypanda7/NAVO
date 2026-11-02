// Navo - Multi-Model AI Understanding Engine
// Powered by:
// 1. Whisper Large-v3 (Speech Transcription)
// 2. Ling-3.0-flash-VL (Visual & On-Screen OCR Extraction)
// 3. Llama 3.3 70B Turbo (Orchestration & Structured Intent Action Planning)

import https from 'https';
import { URL } from 'url';
import type { ParseResult, ContentType, Intent, DeadlineSource, SourcePlatform } from '@/types';
import { transcribeAudio } from './whisper';
import { extractVisualAndOcr } from './vision';
import { fetchUrlMetadata, ScrapedMetadata } from './scraper';

const LLM_API_URL = process.env.LLM_API_URL || 'https://api.deepinfra.com/v1/openai/chat/completions';
const LLM_API_KEY = process.env.DEEPINFRA_API_KEY || process.env.LLM_API_KEY || '';
const LLM_MODEL = process.env.LLM_MODEL || 'meta-llama/Llama-3.3-70B-Instruct-Turbo';

const SYSTEM_PROMPT = `You are Navo's Multi-Model Understanding Engine.
You turn saved social content (Instagram reels, YouTube Shorts/videos, TikToks, and web links) into finished actions.

You receive combined multimodal signals:
1. URL & Platform metadata
2. User Caption & Text notes
3. Whisper Audio Transcript (spoken dialogue from the reel)
4. Vision & OCR Text (text overlays, dates, and visual scene analysis from video frames)

CLASSIFICATION RULES:
- "opportunity": Hackathons, internships, fellowships, coding competitions, grants, scholarships, job openings. If words like "hackathon", "devpost", "prize", "build", "intern", "fellowship", "apply", "bounty" appear, it is an OPPORTUNITY (intent: "apply"). NEVER classify a tech/hackathon reel as food or recipe!
- "recipe": Cooking, baking, food prep, drinks, ingredients.
- "place": Cafes, restaurants, travel spots, cities, attractions.
- "tutorial": Educational content, coding tutorials, design masterclasses, fitness form guides.
- "event": Concerts, meetups, webinars, conferences.
- "design": UI layouts, fonts, poster inspiration, aesthetic collections.
- "product": Gadgets, clothing, tools with prices or buy links.
- "other": Ambiguous items.

CRITICAL: If an opaque URL is given with no descriptive text, audio transcript, or OCR, classify strictly as "other" with intent "someday". NEVER invent or hallucinate food/recipes for unknown links!

You MUST respond strictly with valid JSON conforming to this schema:
{
  "title": "Clear, specific, descriptive title of the content",
  "content_type": "opportunity|recipe|place|tutorial|product|design|event|other",
  "intent": "apply|visit|cook|learn|get_inspired|buy|someday",
  "deadline": "YYYY-MM-DD or null",
  "deadline_source": "caption|spoken|on_screen|manual or null",
  "source_platform": "instagram|youtube|tiktok|web",
  "estimated_minutes": number,
  "extracted_data": {
    // For opportunity: { "company": "...", "role": "...", "eligibility": "...", "application_link": "...", "documents_needed": ["CV", ...], "prize": "..." }
    // For recipe: { "ingredients": [{"name": "...", "quantity": "..."}], "steps": ["..."], "cooking_time_minutes": number }
    // For place: { "name": "...", "area": "...", "what_to_try": "...", "best_time": "..." }
    // For tutorial: { "topic": "...", "length_minutes": number, "level": "...", "steps_or_resources": ["..."] }
    // For event: { "date": "...", "venue": "...", "registration_link": "..." }
  },
  "suggested_steps": [
    { "title": "Step 1 title", "description": "Specific actionable next step" },
    { "title": "Step 2 title", "description": "Specific actionable next step" }
  ]
}

Return ONLY raw JSON with no markdown wrapping.`;

function httpsPost(
  urlStr: string,
  headers: Record<string, string>,
  bodyStr: string,
  timeoutMs = 60000
): Promise<{ status: number; text: string }> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(urlStr);
    const req = https.request(
      {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'POST',
        headers: {
          ...headers,
          'Content-Length': Buffer.byteLength(bodyStr),
          'Connection': 'close',
        },
        timeout: timeoutMs,
      },
      (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({ status: res.statusCode || 200, text: data });
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`DeepInfra request timed out after ${timeoutMs / 1000}s`));
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(bodyStr);
    req.end();
  });
}

export interface ParseInput {
  url: string;
  context?: string;
  audioBase64?: string;
  imageBase64?: string;
}

export async function parseUrl(input: string | ParseInput, legacyContext?: string): Promise<ParseResult> {
  const options: ParseInput = typeof input === 'string'
    ? { url: input, context: legacyContext }
    : input;

  const apiKey = LLM_API_KEY.trim();
  if (!apiKey) {
    throw new Error('DEEPINFRA_API_KEY / LLM_API_KEY is not configured in .env.local');
  }

  let whisperCost = 0;
  let whisperTranscript: string | null = null;
  let visionCost = 0;
  let visionOcrText: string | null = null;

  // 0. Fetch public platform metadata if available (YouTube Shorts oEmbed, Web OpenGraph)
  let scrapedMeta: ScrapedMetadata | null = null;
  try {
    scrapedMeta = await fetchUrlMetadata(options.url);
  } catch (err) {
    console.warn('Scraper warning:', err);
  }

  // 1. Run Whisper Large-v3 if audio is attached
  if (options.audioBase64) {
    try {
      const buffer = Buffer.from(options.audioBase64.replace(/^data:audio\/\w+;base64,/, ''), 'base64');
      const whisperResult = await transcribeAudio(buffer);
      whisperTranscript = whisperResult.text;
      whisperCost = whisperResult.cost;
    } catch (err) {
      console.warn('Whisper transcription warning:', err);
    }
  }

  // 2. Run Ling-3.0-flash-VL if screenshot/image is attached
  if (options.imageBase64) {
    try {
      const dataUrl = options.imageBase64.startsWith('data:') 
        ? options.imageBase64 
        : `data:image/jpeg;base64,${options.imageBase64}`;
      const visionResult = await extractVisualAndOcr(dataUrl);
      visionOcrText = visionResult.ocr_text;
      visionCost = visionResult.cost;
    } catch (err) {
      console.warn('Ling-VL Vision extraction warning:', err);
    }
  }

  // 3. Assemble full multimodal prompt for Llama 3.3 70B
  let assembledContext = '';
  if (scrapedMeta?.title || scrapedMeta?.description) {
    assembledContext += `\n[PLATFORM AUTO-METADATA (${scrapedMeta.provider || 'Public Web'})]:\n`;
    if (scrapedMeta.title) assembledContext += `Title: ${scrapedMeta.title}\n`;
    if (scrapedMeta.author) assembledContext += `Creator/Channel: ${scrapedMeta.author}\n`;
    if (scrapedMeta.description) assembledContext += `Summary/Description: ${scrapedMeta.description}\n`;
  }
  if (options.context) {
    assembledContext += `\n[USER CAPTION / REEL NOTES]:\n${options.context}\n`;
  }
  if (whisperTranscript) {
    assembledContext += `\n[WHISPER AUDIO TRANSCRIPT]:\n"${whisperTranscript}"\n`;
  }
  if (visionOcrText) {
    assembledContext += `\n[ON-SCREEN OCR & VISUAL ANALYSIS (Ling-VL)]:\n${visionOcrText}\n`;
  }

  // 4. Call Llama 3.3 70B with retries
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const llamaResult = await runLlamaExtraction(options.url, assembledContext, apiKey);
      
      const totalCost = (llamaResult.cost || 0.00003) + whisperCost + visionCost;
      const modelNames = [
        'Llama-3.3-70B',
        whisperTranscript ? 'Whisper-Large-v3' : null,
        visionOcrText ? 'Ling-3.0-flash-VL' : null
      ].filter(Boolean).join(' + ');

      return {
        ...llamaResult.parsed,
        analysis_cost_usd: totalCost,
        tokens_used: llamaResult.tokens,
        model_name: modelNames,
        whisper_transcript: whisperTranscript,
        vision_ocr_text: visionOcrText,
        model_breakdown: {
          llama_cost: llamaResult.cost,
          whisper_cost: whisperCost > 0 ? whisperCost : undefined,
          vision_cost: visionCost > 0 ? visionCost : undefined,
        }
      };
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`DeepInfra extraction attempt ${attempt} failed: ${lastError.message}`);
      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }
  }

  throw new Error(`DeepInfra multimodal extraction failed: ${lastError?.message}`);
}

async function runLlamaExtraction(
  url: string,
  multimodalContext: string,
  apiKey: string
): Promise<{ parsed: ParseResult; cost: number; tokens: number }> {
  const userPrompt = `Analyze this saved reel / link:
URL: ${url}
${multimodalContext}

Extract structured intent, deadline, and 2-5 follow-through steps as JSON according to your schema.`;

  const payload = JSON.stringify({
    model: LLM_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.1,
    max_tokens: 1500,
    response_format: { type: 'json_object' },
  });

  const response = await httpsPost(
    LLM_API_URL,
    {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    payload,
    60000
  );

  if (response.status !== 200) {
    throw new Error(`DeepInfra API returned HTTP ${response.status}: ${response.text}`);
  }

  const data = JSON.parse(response.text);
  const rawContent = data.choices?.[0]?.message?.content;

  if (!rawContent) {
    throw new Error('No content returned from DeepInfra Llama model');
  }

  let cleaned = rawContent.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
  }

  const parsedJson = JSON.parse(cleaned);
  const cost = typeof data.usage?.estimated_cost === 'number' ? data.usage.estimated_cost : 0.00003;
  const tokens = data.usage?.total_tokens || 0;

  const validated = validateParseResult(parsedJson, url, cost, tokens, data.model || LLM_MODEL);
  return { parsed: validated, cost, tokens };
}

function validateParseResult(
  raw: Record<string, unknown>,
  originalUrl: string,
  costUsd: number,
  tokensUsed: number | null,
  modelName: string
): ParseResult {
  const validContentTypes: ContentType[] = [
    'opportunity',
    'recipe',
    'place',
    'tutorial',
    'product',
    'design',
    'event',
    'other',
  ];
  const validIntents: Intent[] = [
    'apply',
    'visit',
    'cook',
    'learn',
    'get_inspired',
    'buy',
    'someday',
  ];

  const contentType = validContentTypes.includes(raw.content_type as ContentType)
    ? (raw.content_type as ContentType)
    : 'other';

  const intent = validIntents.includes(raw.intent as Intent)
    ? (raw.intent as Intent)
    : 'someday';

  return {
    title: String(raw.title || 'Saved Reel'),
    content_type: contentType,
    intent: intent,
    deadline: raw.deadline ? String(raw.deadline) : null,
    deadline_source: (raw.deadline_source as DeadlineSource) || (raw.deadline ? 'caption' : null),
    source_platform: (raw.source_platform as SourcePlatform) || detectPlatform(originalUrl),
    extracted_data: (raw.extracted_data as Record<string, unknown>) || {},
    estimated_minutes: typeof raw.estimated_minutes === 'number' ? raw.estimated_minutes : 15,
    suggested_steps: Array.isArray(raw.suggested_steps) && raw.suggested_steps.length > 0
      ? raw.suggested_steps
      : [
          { title: 'Review details', description: 'Review the extracted information' },
          { title: 'Take action', description: 'Complete the follow-through step' },
        ],
    analysis_cost_usd: costUsd,
    tokens_used: tokensUsed,
    model_name: modelName,
  };
}

function detectPlatform(url: string): SourcePlatform {
  if (url.includes('instagram.com') || url.includes('instagr.am')) return 'instagram';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('tiktok.com')) return 'tiktok';
  return 'web';
}
