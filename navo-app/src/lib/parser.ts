// Navo - AI Understanding Engine (Powered by DeepInfra Llama 3.3 70B Turbo)
import type { ParseResult, ContentType, Intent, DeadlineSource, SourcePlatform } from '@/types';

// Configuration - DeepInfra OpenAI-compatible endpoint
const LLM_API_URL = process.env.LLM_API_URL || 'https://api.deepinfra.com/v1/openai/chat/completions';
const LLM_API_KEY = process.env.DEEPINFRA_API_KEY || process.env.LLM_API_KEY || '';
const LLM_MODEL = process.env.LLM_MODEL || 'meta-llama/Llama-3.3-70B-Instruct-Turbo';

const SYSTEM_PROMPT = `You are Navo's Understanding Engine, a follow-through AI that turns saved reels and links into finished actions.

Analyze the given reel or link URL and any user caption/notes. Extract structured intent, deadlines, context, and a 2-5 step action plan.

You MUST respond strictly with valid JSON conforming to this schema:
{
  "title": "Clear, concise title of the reel/item",
  "content_type": "opportunity|recipe|place|tutorial|product|design|event|other",
  "intent": "apply|visit|cook|learn|get_inspired|buy|someday",
  "deadline": "YYYY-MM-DD or null",
  "deadline_source": "caption|spoken|on_screen|manual or null",
  "source_platform": "instagram|youtube|tiktok|web",
  "estimated_minutes": number (estimated time needed to act on or consume this item),
  "extracted_data": {
    // For opportunity: { "company": "...", "role": "...", "eligibility": "...", "application_link": "...", "documents_needed": ["CV", ...] }
    // For recipe: { "ingredients": [{"name": "...", "quantity": "..."}], "steps": ["..."], "cooking_time_minutes": number }
    // For place: { "name": "...", "area": "...", "what_to_try": "...", "best_time": "..." }
    // For tutorial: { "topic": "...", "length_minutes": number, "level": "...", "steps_or_resources": ["..."] }
    // For event: { "date": "...", "venue": "...", "registration_link": "..." }
    // For design/product/other: relevant structured key-values
  },
  "suggested_steps": [
    { "title": "Step 1 title", "description": "Short specific instruction" },
    { "title": "Step 2 title", "description": "Short specific instruction" }
  ]
}

Rules:
1. "opportunity" includes internships, hackathons, fellowships, scholarships, jobs.
2. If any date or deadline is mentioned or inferred from upcoming cycles, format as YYYY-MM-DD and specify deadline_source.
3. Keep action steps high-impact (2-5 steps max) following Navo's follow-through philosophy: "Each notification surfaces only the next step so users never face a wall of tasks."
4. If unsure of an exact deadline date, set deadline to null so we don't mislead the user.
5. Return ONLY the raw JSON object.`;

export async function parseUrl(url: string, context?: string): Promise<ParseResult> {
  const apiKey = LLM_API_KEY.trim();

  // Try DeepInfra Llama 3.3 70B Turbo first
  if (apiKey) {
    try {
      return await parseWithDeepInfraLlama(url, context, apiKey);
    } catch (error) {
      console.error('DeepInfra Llama 70B parsing failed, falling back to smart local parser:', error);
    }
  } else {
    console.warn('DEEPINFRA_API_KEY / LLM_API_KEY not set. Using smart local parser.');
  }

  // Fallback to local mock parser
  return mockParse(url, context);
}

async function parseWithDeepInfraLlama(url: string, context: string | undefined, apiKey: string): Promise<ParseResult> {
  const userContent = context 
    ? `URL: ${url}\nUser Caption / Notes: ${context}\n\nPlease analyze this saved content and extract structured data conforming to the schema.`
    : `URL: ${url}\n\nPlease analyze this saved URL and extract structured data conforming to the schema.`;

  const response = await fetch(LLM_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent }
      ],
      temperature: 0.2,
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`DeepInfra API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
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

  // Extract usage & cost per reel from DeepInfra response!
  const costUsd = typeof data.usage?.estimated_cost === 'number' 
    ? data.usage.estimated_cost 
    : 0.00003; // fallback typical cost (~$0.00003 per call)
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
  const validContentTypes: ContentType[] = ['opportunity', 'recipe', 'place', 'tutorial', 'product', 'design', 'event', 'other'];
  const validIntents: Intent[] = ['apply', 'visit', 'cook', 'learn', 'get_inspired', 'buy', 'someday'];

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
          { title: 'Check the details', description: 'Watch the full reel' },
          { title: 'Take action', description: 'Follow through on your intent' }
        ],
    analysis_cost_usd: costUsd,
    tokens_used: tokensUsed,
    model_name: modelName
  };
}

function detectPlatform(url: string): SourcePlatform {
  if (url.includes('instagram.com') || url.includes('instagr.am')) return 'instagram';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('tiktok.com')) return 'tiktok';
  return 'web';
}

function mockParse(url: string, context?: string): ParseResult {
  const platform = detectPlatform(url);
  const text = `${url} ${context || ''}`.toLowerCase();

  if (text.includes('intern') || text.includes('job') || text.includes('swe') || text.includes('fellowship') || text.includes('hackathon')) {
    return {
      title: 'Software Engineering Opportunity',
      content_type: 'opportunity',
      intent: 'apply',
      deadline: '2026-11-20',
      deadline_source: 'caption',
      source_platform: platform,
      extracted_data: {
        company: 'Tech Company',
        role: 'SWE Intern',
        eligibility: 'CS / Engineering students',
        application_link: url,
        documents_needed: ['Resume', 'Transcript'],
        stage: 'saved'
      },
      estimated_minutes: 30,
      suggested_steps: [
        { title: 'Review eligibility', description: 'Confirm requirements and graduation year' },
        { title: 'Tailor resume', description: 'Highlight relevant projects' },
        { title: 'Submit application', description: 'Apply via the direct link' }
      ],
      analysis_cost_usd: 0.00003,
      tokens_used: 350,
      model_name: 'meta-llama/Llama-3.3-70B-Instruct-Turbo (Simulated)'
    };
  }

  if (text.includes('recipe') || text.includes('cook') || text.includes('food') || text.includes('bake') || text.includes('tiramisu')) {
    return {
      title: 'Delicious Recipe Guide',
      content_type: 'recipe',
      intent: 'cook',
      deadline: null,
      deadline_source: null,
      source_platform: platform,
      extracted_data: {
        ingredients: [
          { name: 'Primary ingredients', quantity: 'As per reel' },
          { name: 'Seasoning / Sweetener', quantity: 'To taste' }
        ],
        steps: ['Prep ingredients', 'Cook / assemble', 'Serve fresh'],
        cooking_time_minutes: 25
      },
      estimated_minutes: 25,
      suggested_steps: [
        { title: 'Check pantry for ingredients', description: 'Verify what is already in stock' },
        { title: 'Pick up remaining groceries', description: 'Grab missing items' },
        { title: 'Cook and enjoy!', description: 'Follow the steps from the reel' }
      ],
      analysis_cost_usd: 0.00003,
      tokens_used: 280,
      model_name: 'meta-llama/Llama-3.3-70B-Instruct-Turbo (Simulated)'
    };
  }

  return {
    title: 'Saved Discovery',
    content_type: 'other',
    intent: 'someday',
    deadline: null,
    deadline_source: null,
    source_platform: platform,
    extracted_data: {},
    estimated_minutes: 15,
    suggested_steps: [
      { title: 'Review content', description: 'Watch or read the full item' },
      { title: 'Decide next action', description: 'Schedule or tick off' }
    ],
    analysis_cost_usd: 0.00003,
    tokens_used: 210,
    model_name: 'meta-llama/Llama-3.3-70B-Instruct-Turbo (Simulated)'
  };
}
