// Navo - AI Understanding Engine (Powered by DeepInfra Llama 3.3 70B Turbo)
import https from 'https';
import { URL } from 'url';
import type { ParseResult, ContentType, Intent, DeadlineSource, SourcePlatform } from '@/types';

// Configuration - DeepInfra OpenAI-compatible endpoint
const LLM_API_URL = process.env.LLM_API_URL || 'https://api.deepinfra.com/v1/openai/chat/completions';
const LLM_API_KEY = process.env.DEEPINFRA_API_KEY || process.env.LLM_API_KEY || '';
const LLM_MODEL = process.env.LLM_MODEL || 'meta-llama/Llama-3.3-70B-Instruct-Turbo';

const SYSTEM_PROMPT = `You are Navo's Understanding Engine, an AI that turns saved social media content (Instagram reels, YouTube Shorts/videos, TikToks, and web links) into finished actions.

Analyze the given URL, platform, and any user caption or notes. Extract structured intent, deadlines, context, and a 2-5 step action plan.

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
    // For opportunity: { "company": "...", "role": "...", "eligibility": "...", "application_link": "...", "documents_needed": ["CV", ...] }
    // For recipe: { "ingredients": [{"name": "...", "quantity": "..."}], "steps": ["..."], "cooking_time_minutes": number }
    // For place: { "name": "...", "area": "...", "what_to_try": "...", "best_time": "..." }
    // For tutorial: { "topic": "...", "length_minutes": number, "level": "...", "steps_or_resources": ["..."] }
    // For event: { "date": "...", "venue": "...", "registration_link": "..." }
    // For design/product/other: relevant structured key-values
  },
  "suggested_steps": [
    { "title": "Step 1 title", "description": "Short specific actionable instruction" },
    { "title": "Step 2 title", "description": "Short specific actionable instruction" }
  ]
}

Rules:
1. Always analyze the URL domain, slugs, parameters, and all text provided in the user's caption or notes.
2. "opportunity" includes internships, hackathons, fellowships, scholarships, competitions, and job applications.
3. If any date or deadline is stated or strongly implied, format as YYYY-MM-DD and specify deadline_source. If no deadline exists, set deadline to null.
4. Keep action steps high-impact (2-5 steps max) following Navo's core philosophy: "Each notification surfaces only the next step so users never face a wall of tasks."
5. Return ONLY valid JSON with no conversational text.`;

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
          'Connection': 'close', // Avoid TLS stream ECONNRESET on Node 26
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

export async function parseUrl(url: string, context?: string): Promise<ParseResult> {
  const apiKey = LLM_API_KEY.trim();

  if (!apiKey) {
    throw new Error('DEEPINFRA_API_KEY / LLM_API_KEY is not configured in .env.local');
  }

  // Real LLM call with up to 3 automatic retries for network resilience
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await parseWithDeepInfraLlama(url, context, apiKey);
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`DeepInfra Llama attempt ${attempt} failed: ${lastError.message}`);
      if (attempt < 3) {
        // Wait 1 second before retry
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  // If all attempts failed, throw the REAL error — DO NOT return fake mock placeholders!
  throw new Error(`DeepInfra Llama 70B extraction failed after 3 attempts: ${lastError?.message}`);
}

async function parseWithDeepInfraLlama(
  url: string,
  context: string | undefined,
  apiKey: string
): Promise<ParseResult> {
  const userContent = context
    ? `URL: ${url}\nUser Caption / Notes: ${context}\n\nPlease analyze this saved content and extract structured data conforming to the schema.`
    : `URL: ${url}\n\nPlease analyze this saved URL and extract structured data conforming to the schema.`;

  const payload = JSON.stringify({
    model: LLM_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userContent },
    ],
    temperature: 0.2,
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
    60000 // 60s timeout for 70B model inference
  );

  if (response.status !== 200) {
    throw new Error(`DeepInfra API returned HTTP ${response.status}: ${response.text}`);
  }

  const data = JSON.parse(response.text);
  const rawContent = data.choices?.[0]?.message?.content;

  if (!rawContent) {
    throw new Error('No content returned from DeepInfra Llama model');
  }

  // Clean JSON response if wrapped in markdown
  let cleaned = rawContent.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
  }

  const parsedJson = JSON.parse(cleaned);

  // Extract usage & cost per reel directly from DeepInfra!
  const costUsd = typeof data.usage?.estimated_cost === 'number'
    ? data.usage.estimated_cost
    : 0.00003;
  const tokensUsed = data.usage?.total_tokens || null;

  return validateParseResult(parsedJson, url, costUsd, tokensUsed, data.model || LLM_MODEL);
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
