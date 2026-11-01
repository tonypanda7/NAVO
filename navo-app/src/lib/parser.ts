// Navo - AI Parser (Llama 70B via OpenInfra / OpenAI-compatible API)
import type { ParseResult, ContentType, Intent, DeadlineSource, SourcePlatform } from '@/types';

// Configuration - set these via environment variables
const LLM_API_URL = process.env.LLM_API_URL || '';
const LLM_API_KEY = process.env.LLM_API_KEY || '';
const LLM_MODEL = process.env.LLM_MODEL || 'meta-llama/llama-3.1-70b-instruct';

const SYSTEM_PROMPT = `You are Navo's understanding engine. Given a URL and any available content about it, you extract structured information.

You MUST respond with valid JSON matching this exact schema:
{
  "title": "string - a clear, descriptive title",
  "content_type": "opportunity|recipe|place|tutorial|product|design|event|other",
  "intent": "apply|visit|cook|learn|get_inspired|buy|someday",
  "deadline": "YYYY-MM-DD or null",
  "deadline_source": "caption|spoken|on_screen|manual or null",
  "source_platform": "instagram|youtube|tiktok|web",
  "extracted_data": { ... type-specific fields ... },
  "estimated_minutes": number or null,
  "suggested_steps": [
    { "title": "step title", "description": "optional details" }
  ]
}

Content type specific extracted_data fields:
- opportunity: { company, role, eligibility, application_link, documents_needed[], stage: "saved" }
- recipe: { ingredients: [{name, quantity}], steps[], cooking_time_minutes }
- place: { name, area, what_to_try, best_time }
- tutorial: { topic, length_minutes, level, steps_or_resources[] }
- product: { name, price, where_to_buy }
- design: { style, tools[], fonts[], resources[] }
- event: { date, time, venue, registration_link }

Rules:
- If a deadline exists, always include deadline_source
- If unsure about a date, set deadline to null
- Generate 2-5 actionable steps
- Be specific and useful in extracted_data
- Detect the source platform from the URL`;

export async function parseUrl(url: string): Promise<ParseResult> {
  // Try real LLM first
  if (LLM_API_URL && LLM_API_KEY) {
    try {
      return await parseLlm(url);
    } catch (error) {
      console.error('LLM parsing failed, falling back to mock:', error);
    }
  }

  // Fallback to mock parser
  return mockParse(url);
}

async function parseLlm(url: string): Promise<ParseResult> {
  const response = await fetch(LLM_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Parse this URL and extract structured information: ${url}\n\nAnalyze the URL pattern, any visible metadata, and infer the content type and intent. Return valid JSON only.` }
      ],
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('No content in LLM response');
  }

  const parsed = JSON.parse(content);
  return validateParseResult(parsed);
}

function validateParseResult(raw: Record<string, unknown>): ParseResult {
  const validContentTypes: ContentType[] = ['opportunity', 'recipe', 'place', 'tutorial', 'product', 'design', 'event', 'other'];
  const validIntents: Intent[] = ['apply', 'visit', 'cook', 'learn', 'get_inspired', 'buy', 'someday'];

  return {
    title: String(raw.title || 'Untitled Save'),
    content_type: validContentTypes.includes(raw.content_type as ContentType) 
      ? (raw.content_type as ContentType) : 'other',
    intent: validIntents.includes(raw.intent as Intent) 
      ? (raw.intent as Intent) : 'someday',
    deadline: raw.deadline ? String(raw.deadline) : null,
    deadline_source: raw.deadline_source as DeadlineSource | null,
    source_platform: (raw.source_platform as SourcePlatform) || detectPlatform(String(raw.title || '')),
    extracted_data: (raw.extracted_data as Record<string, unknown>) || {},
    estimated_minutes: typeof raw.estimated_minutes === 'number' ? raw.estimated_minutes : null,
    suggested_steps: Array.isArray(raw.suggested_steps) ? raw.suggested_steps : [
      { title: 'Review this save', description: 'Check the details and decide next steps' }
    ],
  };
}

function detectPlatform(url: string): SourcePlatform {
  if (url.includes('instagram.com') || url.includes('instagr.am')) return 'instagram';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('tiktok.com')) return 'tiktok';
  return 'web';
}

function mockParse(url: string): ParseResult {
  const platform = detectPlatform(url);
  const lowerUrl = url.toLowerCase();

  // Try to infer content type from URL
  if (lowerUrl.includes('intern') || lowerUrl.includes('job') || lowerUrl.includes('career') || lowerUrl.includes('scholarship') || lowerUrl.includes('fellowship')) {
    return {
      title: 'New Opportunity',
      content_type: 'opportunity',
      intent: 'apply',
      deadline: null,
      deadline_source: null,
      source_platform: platform,
      extracted_data: {
        company: 'Unknown',
        role: 'Position from reel',
        eligibility: 'Check the reel for details',
        application_link: url,
        documents_needed: ['Resume'],
        stage: 'saved'
      },
      estimated_minutes: 30,
      suggested_steps: [
        { title: 'Review the opportunity details', description: 'Watch the full reel for eligibility and requirements' },
        { title: 'Check the deadline', description: 'Confirm the application deadline' },
        { title: 'Prepare application materials', description: 'Update your resume and cover letter' },
        { title: 'Submit application', description: 'Apply before the deadline' }
      ]
    };
  }

  if (lowerUrl.includes('recipe') || lowerUrl.includes('cook') || lowerUrl.includes('food') || lowerUrl.includes('meal')) {
    return {
      title: 'New Recipe',
      content_type: 'recipe',
      intent: 'cook',
      deadline: null,
      deadline_source: null,
      source_platform: platform,
      extracted_data: {
        ingredients: [{ name: 'See reel for ingredients', quantity: '-' }],
        steps: ['Watch the reel for full instructions'],
        cooking_time_minutes: 30
      },
      estimated_minutes: 30,
      suggested_steps: [
        { title: 'Watch the full recipe', description: 'Note down all ingredients and steps' },
        { title: 'Check your pantry', description: 'See what you already have' },
        { title: 'Get missing ingredients', description: 'Quick grocery run' },
        { title: 'Cook it!', description: 'Follow the recipe steps' }
      ]
    };
  }

  if (lowerUrl.includes('cafe') || lowerUrl.includes('restaurant') || lowerUrl.includes('place') || lowerUrl.includes('travel') || lowerUrl.includes('trip')) {
    return {
      title: 'New Place to Visit',
      content_type: 'place',
      intent: 'visit',
      deadline: null,
      deadline_source: null,
      source_platform: platform,
      extracted_data: {
        name: 'Place from reel',
        area: 'See reel for location',
        what_to_try: 'Check the reel for recommendations',
        best_time: 'Weekends'
      },
      estimated_minutes: 60,
      suggested_steps: [
        { title: 'Check the location', description: 'Find it on maps' },
        { title: 'Plan a visit', description: 'Pick a good day to go' }
      ]
    };
  }

  // Default: general content
  return {
    title: 'New Save',
    content_type: 'other',
    intent: 'someday',
    deadline: null,
    deadline_source: null,
    source_platform: platform,
    extracted_data: {},
    estimated_minutes: 10,
    suggested_steps: [
      { title: 'Review this save', description: 'Watch or read the content' },
      { title: 'Decide on next steps', description: 'What do you want to do with this?' }
    ]
  };
}
