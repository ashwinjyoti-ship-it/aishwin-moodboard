const DEFAULT_BASE_URL = 'https://api.moonshot.ai/v1';

const ANALYSIS_PROMPT = `You are analyzing inspiration images for a health & wellness website mood board.
Return ONLY valid JSON with this exact shape:
{"mood":["adjective1","adjective2","adjective3"],"colors":["#RRGGBB","#RRGGBB","#RRGGBB"]}
- mood: 3 short vibe words (lowercase)
- colors: 3 hex colors that match the image palette (primary, secondary, accent)`;

export function getKimiConfig(env) {
  const apiKey = env.MOONSHOT_API_KEY || env.KIMI_API_KEY;
  const baseUrl = (env.MOONSHOT_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '');
  return { apiKey, baseUrl };
}

export async function kimiChatCompletion({ apiKey, baseUrl, messages, options = {} }) {
  const body = {
    model: options.model ?? 'kimi-k2.6',
    messages,
    thinking: options.thinking ?? { type: 'disabled' },
    max_completion_tokens: options.maxCompletionTokens ?? 2048,
    ...options.extra,
  };

  if (options.responseFormat) {
    body.response_format = options.responseFormat;
  }
  if (options.temperature != null) body.temperature = options.temperature;
  if (options.top_p != null) body.top_p = options.top_p;

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || res.statusText || 'Kimi API request failed';
    throw new Error(msg);
  }
  return data;
}

function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export async function imageUrlToDataUrl(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
  const contentType = res.headers.get('content-type') || 'image/jpeg';
  const mime = contentType.split(';')[0].trim();
  const buf = await res.arrayBuffer();
  return `data:${mime};base64,${bufferToBase64(buf)}`;
}

export async function fileToDataUrl(file) {
  const buf = await file.arrayBuffer();
  const mime = file.type || 'image/jpeg';
  return `data:${mime};base64,${bufferToBase64(buf)}`;
}

function parseAnalysisJson(text) {
  const trimmed = (text || '').trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    const parsed = JSON.parse(jsonMatch[0]);
    const mood = Array.isArray(parsed.mood) ? parsed.mood.map(String).slice(0, 5) : [];
    const colors = Array.isArray(parsed.colors)
      ? parsed.colors.filter((c) => /^#[0-9A-Fa-f]{6}$/.test(String(c))).slice(0, 5)
      : [];
    if (mood.length === 0 && colors.length === 0) return null;
    return { mood, colors, placeholder: false };
  } catch {
    return null;
  }
}

export async function analyzeInspirationImage({ apiKey, baseUrl, imageDataUrl }) {
  const completion = await kimiChatCompletion({
    apiKey,
    baseUrl,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: imageDataUrl } },
          { type: 'text', text: ANALYSIS_PROMPT },
        ],
      },
    ],
    responseFormat: { type: 'json_object' },
    maxCompletionTokens: 512,
    thinking: { type: 'disabled' },
  });

  const content = completion.choices?.[0]?.message?.content;
  const parsed = parseAnalysisJson(content);
  if (!parsed) throw new Error('Could not parse Kimi analysis response');
  return parsed;
}

export async function generateCodeWithKimi({ apiKey, baseUrl, prompt, systemPrompt }) {
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const completion = await kimiChatCompletion({
    apiKey,
    baseUrl,
    messages,
    thinking: { type: 'enabled' },
    maxCompletionTokens: 8192,
    temperature: 1,
  });

  return completion.choices?.[0]?.message?.content ?? '';
}
