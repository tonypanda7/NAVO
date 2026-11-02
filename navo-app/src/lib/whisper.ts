// Navo - Whisper Large-v3 Audio Transcription (DeepInfra)
import https from 'https';

const DEEPINFRA_API_KEY = process.env.DEEPINFRA_API_KEY || process.env.LLM_API_KEY || '';

export interface WhisperResult {
  text: string;
  cost: number;
  duration: number;
}

export async function transcribeAudio(audioBuffer: Buffer, filename = 'audio.mp3'): Promise<WhisperResult> {
  const apiKey = DEEPINFRA_API_KEY.trim();
  if (!apiKey) {
    throw new Error('DEEPINFRA_API_KEY not configured for Whisper transcription');
  }

  const boundary = '----NavoBoundary' + Math.random().toString(36).substring(2);
  const crlf = '\r\n';

  // Build multipart/form-data body
  const pre = Buffer.from(
    `--${boundary}${crlf}` +
    `Content-Disposition: form-data; name="audio"; filename="${filename}"${crlf}` +
    `Content-Type: audio/mpeg${crlf}${crlf}`
  );
  const post = Buffer.from(`${crlf}--${boundary}--${crlf}`);
  const multipartBody = Buffer.concat([pre, audioBuffer, post]);

  return new Promise((resolve, reject) => {
    const req = https.request(
      'https://api.deepinfra.com/v1/inference/openai/whisper-large-v3',
      {
        method: 'POST',
        headers: {
          'Authorization': `bearer ${apiKey}`,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': multipartBody.length,
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
            return reject(new Error(`Whisper API error (${res.statusCode}): ${data}`));
          }
          try {
            const parsed = JSON.parse(data);
            const cost = typeof parsed.inference_status?.cost === 'number' ? parsed.inference_status.cost : 0.00001;
            const duration = typeof parsed.duration === 'number' ? parsed.duration : 0;
            resolve({
              text: parsed.text || '',
              cost,
              duration,
            });
          } catch (err) {
            reject(new Error(`Failed to parse Whisper response: ${String(err)}`));
          }
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Whisper API request timed out'));
    });

    req.on('error', reject);
    req.write(multipartBody);
    req.end();
  });
}
