// Top-level grove calculator section (Spiros persona) — composes GroveInputs and GroveOutput

import { useState } from 'react';
import GroveInputs from './GroveInputs';
import GroveOutput from './GroveOutput';
import { callClaude, extractText } from '@/lib/claudeProxy';
import { VARIETY_DATA } from '@/data/varietyData';

const CURRENT_PRICE_USD_T = 5930;

const MARKET_EVENTS = [
  'Spain 2025/26 harvest forecast +31% vs prior year',
  'Brent crude +8% over three weeks — energy costs elevated',
  'AEMET severe drought alert for Andalusia — 40% soil moisture deficit',
  'EU proposes 12% tariff adjustment on Tunisian olive oil imports from March 2026',
  'Olive oil spot price down 11% year-on-year from Jan 2024 peak',
];

const SYSTEM_PROMPT = `You are Spiros, the grove yield advisor for Olive Intel — a market intelligence platform for olive oil producers.

Given grove configuration and current market signals, return a structured yield and revenue estimate as a single JSON object. Nothing else — no prose, no markdown fences, no explanation outside the JSON.

Output schema (return exactly this structure):
{
  "yield_range": "string",
  "revenue_range": "string",
  "harvest_window": "string",
  "early_harvest_note": "string | null",
  "narrative": "string",
  "input_cost_flags": ["string"],
  "allocation_breakdown": [
    { "label": "string", "volume": "string", "revenue": "string" }
  ]
}

Field definitions:
  yield_range          — estimated harvest in metric tons, expressed as a range e.g. "18–24 t"
  revenue_range        — gross revenue estimate based on allocation mix and current prices, e.g. "$95,000–$128,000"
  harvest_window       — optimal harvest months for this variety and location, e.g. "Oct–Nov"
  early_harvest_note   — short note if early harvest is recommended for this variety, otherwise null
  narrative            — 2–3 sentences a producer can act on: yield outlook, key risks, and one concrete recommendation
  input_cost_flags     — 2–4 short flags (max 8 words each) for elevated input costs relevant to current market
  allocation_breakdown — one entry per non-zero allocation tier showing volume and revenue contribution

Use the olive oil price of $${CURRENT_PRICE_USD_T}/metric ton for premium extra virgin. Bulk/commodity: 60% of that price. Table olives: 40% of premium price per ton equivalent.
Yield calculations should account for variety oil content, tree age, and location climate typical for olive production.`;

const DEFAULT_INPUTS = {
  location:      'Kalamata, Greece',
  variety:       'Koroneiki',
  trees:         500,
  treeAge:       '11–20 years',
  allocPremium:  70,
  allocBulk:     20,
  allocTable:    10,
};

export default function GroveCalculator() {
  const [inputs,  setInputs]  = useState(DEFAULT_INPUTS);
  const [status,  setStatus]  = useState('idle');
  const [result,  setResult]  = useState(null);

  const total = inputs.allocPremium + inputs.allocBulk + inputs.allocTable;
  const canCalculate = total === 100 && inputs.trees > 0;

  async function handleCalculate() {
    setStatus('loading');
    setResult(null);

    const varietyInfo = VARIETY_DATA[inputs.variety];

    const userMessage = `Calculate yield and revenue for this grove:

Grove configuration:
- Location: ${inputs.location}
- Variety: ${inputs.variety}
- Trees: ${inputs.trees.toLocaleString()}
- Tree age: ${inputs.treeAge}
- Output allocation: ${inputs.allocPremium}% premium EVOO / ${inputs.allocBulk}% bulk / ${inputs.allocTable}% table olives

Variety reference data:
${JSON.stringify(varietyInfo, null, 2)}

Current market signals:
${MARKET_EVENTS.map((e) => `- ${e}`).join('\n')}

Current olive oil price: $${CURRENT_PRICE_USD_T.toLocaleString()}/metric ton`;

    try {
      const response = await callClaude({
        system: [
          { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
        ],
        messages: [{ role: 'user', content: userMessage }],
        max_tokens: 800,
      });

      const raw    = extractText(response);
      const parsed = JSON.parse(raw.replace(/```[a-z]*\n?/gi, '').trim());
      setResult(parsed);
      setStatus('ready');
    } catch (err) {
      console.error('[GroveCalculator] Claude call failed:', err);
      setStatus('error');
    }
  }

  return (
    <div className="px-3 md:px-6 pb-10">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="block w-2 h-2 rounded-full bg-amber-500" />
        <span className="text-amber-500 font-mono text-xs font-semibold tracking-[0.15em] uppercase">
          Grove Calculator · Spiros Mode
        </span>
        <span className="text-[10px] font-mono text-zinc-600 ml-auto">Haiku 4.5 · yield + revenue estimate</span>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x divide-zinc-800">
          {/* Left — inputs */}
          <div className="p-4 md:p-6 flex flex-col gap-6">
            <GroveInputs inputs={inputs} onChange={setInputs} />

            <button
              onClick={handleCalculate}
              disabled={!canCalculate || status === 'loading'}
              className="mt-auto w-full py-2.5 rounded-lg font-mono text-sm font-semibold tracking-wide transition-colors
                bg-amber-500 text-zinc-950 hover:bg-amber-400
                disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Calculating…' : 'Calculate Yield'}
            </button>
          </div>

          {/* Right — output */}
          <div className="p-4 md:p-6 border-t border-zinc-800 md:border-t-0">
            <GroveOutput status={status} data={result} />
          </div>
        </div>
      </div>
    </div>
  );
}
