// Automated Metadata Scraper for Public Video & Web Links
// Fetches title, author, and descriptions from YouTube Shorts/Videos and public oEmbed providers

import https from 'https';
import http from 'http';
import { URL } from 'url';

export interface ScrapedMetadata {
  title?: string;
  author?: string;
  description?: string;
  thumbnail_url?: string;
  provider?: string;
}

export async function fetchUrlMetadata(urlStr: string): Promise<ScrapedMetadata | null> {
  if (!urlStr || typeof urlStr !== 'string') return null;

  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase();

    // 1. YouTube & YouTube Shorts (free public oEmbed)
    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      const oEmbedUrl = `https://noembed.com/embed?url=${encodeURIComponent(urlStr)}`;
      const res = await simpleHttpGet(oEmbedUrl, 4000);
      if (res) {
        try {
          const json = JSON.parse(res);
          if (json.title) {
            return {
              title: json.title,
              author: json.author_name,
              thumbnail_url: json.thumbnail_url,
              provider: 'YouTube',
            };
          }
        } catch {
          // ignore json parse error
        }
      }
    }

    // 2. Standard Web & Article links: Try OpenGraph tags
    if (!host.includes('instagram.com') && !host.includes('tiktok.com')) {
      const html = await simpleHttpGet(urlStr, 4000);
      if (html) {
        const titleMatch = html.match(/<meta property=["']og:title["'] content=["'](.*?)["']/i) 
          || html.match(/<title>(.*?)<\/title>/i);
        const descMatch = html.match(/<meta property=["']og:description["'] content=["'](.*?)["']/i) 
          || html.match(/<meta name=["']description["'] content=["'](.*?)["']/i);
        const imgMatch = html.match(/<meta property=["']og:image["'] content=["'](.*?)["']/i);

        if (titleMatch || descMatch) {
          return {
            title: titleMatch ? decodeHtml(titleMatch[1]) : undefined,
            description: descMatch ? decodeHtml(descMatch[1]) : undefined,
            thumbnail_url: imgMatch ? imgMatch[1] : undefined,
            provider: 'Web',
          };
        }
      }
    }
  } catch (err) {
    console.warn('URL metadata fetch warning:', err);
  }

  return null;
}

function decodeHtml(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function simpleHttpGet(urlStr: string, timeoutMs = 4000): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(urlStr);
      const isHttps = parsed.protocol === 'https:';
      const client = isHttps ? https : http;

      const req = client.get(
        urlStr,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/json',
          },
          timeout: timeoutMs,
        },
        (res) => {
          if (res.statusCode && (res.statusCode >= 300 && res.statusCode < 400) && res.headers.location) {
            // handle 1 redirect
            simpleHttpGet(res.headers.location, timeoutMs).then(resolve);
            return;
          }

          let data = '';
          res.setEncoding('utf8');
          res.on('data', (chunk) => {
            data += chunk;
            if (data.length > 70000) {
              req.destroy();
            }
          });
          res.on('close', () => resolve(data));
          res.on('end', () => resolve(data));
        }
      );

      req.on('timeout', () => {
        req.destroy();
        resolve(null);
      });
      req.on('error', () => resolve(null));
    } catch {
      resolve(null);
    }
  });
}
