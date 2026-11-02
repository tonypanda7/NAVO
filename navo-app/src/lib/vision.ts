// Navo - Ling-3.0-flash-VL Vision & OCR Engine (DeepInfra)
import https from 'https';

const DEEPINFRA_API_KEY = process.env.DEEPINFRA_API_KEY || process.env.LLM_API_KEY || '';
const VISION_MODEL = 'inclusionAI/Ling-3.0-flash-VL';

export interface VisionResult {
  ocr_text: string;
  visual_description: string;
  cost: number;
}

export async function extractVisualAndOcr(imageBase64DataUrl: string): Promise<VisionResult> {
  const apiKey = DEEPINFRA_API_KEY.trim();
  if (!apiKey) {
    throw new Error('DEEPINFRA_API_KEY not configured for Vision extraction');
  }

  const prompt = `You are Navo's Vision and OCR Engine.
Inspect this reel screenshot/image carefully:
1. Transcribe ALL on-screen text, dates, numbers, hashtags, usernames, eligibility, deadlines, URLs, or prices you see (acting as high-precision OCR).
2. Briefly describe the visual scene and category (is it tech/coding, food/cooking, cafe/travel, fitness, or design?).

Respond with:
OCR TEXT: <all text extracted from the image>
SCENE SUMMARY: <brief visual description>`;

  const payload = JSON.stringify({
    model: VISION_MODEL,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageBase64DataUrl } }
        ]
      }
    ],
    max_tokens: 600,
    temperature: 0.1
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      'https://api.deepinfra.com/v1/openai/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Content-Length': Buffer.byteLength(payload),
          'Connection': 'close',
        },
        timeout: 45000,
      },
      (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode !== 200) {
            return reject(new Error(`Ling-VL API error (${res.statusCode}): ${data}`));
          }
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.message?.content || '';
            const cost = typeof parsed.usage?.estimated_cost === 'number' ? parsed.usage.estimated_cost : 0.00001;

            resolve({
              ocr_text: content,
              visual_description: content,
              cost
            });
          } catch (err) {
            reject(new Error(`Failed to parse Ling-VL response: ${String(err)}`));
          }
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Vision API request timed out'));
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}
