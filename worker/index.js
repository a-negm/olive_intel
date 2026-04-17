// Cloudflare Worker — proxies POST /api/claude to Anthropic, keeping the API key server-side

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const ALLOWED_ORIGIN = '*'; // tighten to your Pages domain in production if desired

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin ?? ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonResponse(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin),
    },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // Only handle POST /api/claude
    if (url.pathname !== '/api/claude' || request.method !== 'POST') {
      return jsonResponse({ error: 'Not found' }, 404, origin);
    }

    if (!env.ANTHROPIC_API_KEY) {
      return jsonResponse({ error: 'ANTHROPIC_API_KEY not configured' }, 500, origin);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON body' }, 400, origin);
    }

    // Require at minimum a messages array; default model to Haiku 4.5
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return jsonResponse({ error: 'messages array is required' }, 400, origin);
    }

    const anthropicPayload = {
      model: body.model ?? 'claude-haiku-4-5-20251001',
      max_tokens: body.max_tokens ?? 1024,
      ...(body.system && { system: body.system }),
      messages: body.messages,
    };

    let anthropicRes;
    try {
      anthropicRes = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': ANTHROPIC_VERSION,
          // Enable prompt caching for system prompts when the caller marks blocks with cache_control
          'anthropic-beta': 'prompt-caching-2024-07-31',
        },
        body: JSON.stringify(anthropicPayload),
      });
    } catch (err) {
      return jsonResponse({ error: 'Failed to reach Anthropic API', detail: err.message }, 502, origin);
    }

    const data = await anthropicRes.json();

    if (!anthropicRes.ok) {
      return jsonResponse({ error: 'Anthropic API error', detail: data }, anthropicRes.status, origin);
    }

    return jsonResponse(data, 200, origin);
  },
};
