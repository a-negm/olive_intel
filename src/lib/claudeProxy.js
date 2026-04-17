// Fetch wrapper for Claude calls — routes to Worker proxy in prod, direct Anthropic API in dev

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const WORKER_PATH = '/api/claude';

const isDev =
  import.meta.env.DEV && !!import.meta.env.VITE_ANTHROPIC_API_KEY;

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
    model: model ?? 'claude-haiku-4-5-20251001',
    max_tokens: max_tokens ?? 1024,
    ...(system !== undefined && { system }),
    messages,
  };

  if (isDev) {
    return callDirect(payload);
  }

  return callWorker(payload);
}

async function callWorker(payload) {
  const res = await fetch(WORKER_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      `Worker error ${res.status}: ${data?.error ?? 'Unknown error'}`
    );
  }

  return data;
}

async function callDirect(payload) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'anthropic-beta': 'prompt-caching-2024-07-31',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      `Anthropic API error ${res.status}: ${data?.error?.message ?? JSON.stringify(data)}`
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
