// Fetch wrapper for Claude calls — always POSTs to /api/claude
// Dev: Vite proxy forwards to Anthropic server-side (no CORS, key never in browser)
// Prod: Cloudflare Worker handles the same path

const WORKER_PATH = '/api/claude';

/**
 * Send a request to Claude.
 *
 * @param {object} params
 * @param {string} [params.model]        - Defaults to claude-haiku-4-5-20251001
 * @param {number} [params.max_tokens]   - Defaults to 1024
 * @param {Array|string} [params.system] - System prompt string or content blocks (use blocks for prompt caching)
 * @param {Array}  params.messages       - Anthropic messages array (required)
 * @returns {Promise<object>}            - Parsed Anthropic response object
 */
export async function callClaude({ model, max_tokens, system, messages }) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('callClaude: messages array is required');
  }

  const payload = {
    model:      model ?? 'claude-haiku-4-5-20251001',
    max_tokens: max_tokens ?? 1024,
    ...(system !== undefined && { system }),
    messages,
  };

  const res = await fetch(WORKER_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      `Claude API error ${res.status}: ${data?.error?.message ?? data?.error ?? JSON.stringify(data)}`
    );
  }

  return data;
}

/**
 * Extract the text content from a Claude response object.
 * Convenience helper for the common single-text-block case.
 */
export function extractText(response) {
  return response?.content?.find((b) => b.type === 'text')?.text ?? '';
}
