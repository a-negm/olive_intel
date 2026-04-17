// Scrolling ticker of macro market events with Claude-generated impact tags (BEARISH/BULLISH/WATCH/NEUTRAL)

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { callClaude, extractText } from '@/lib/claudeProxy';

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_EVENTS = [
  {
    id: 1,
    text: 'Brent crude +8% over three weeks on Middle East supply disruption fears',
  },
  {
    id: 2,
    text: "Spain 2025/26 olive harvest forecast revised up +31% vs prior year — IOC November update",
  },
  {
    id: 3,
    text: 'Strait of Hormuz transit insurance premiums rise following tanker incidents',
  },
  {
    id: 4,
    text: 'EU proposes 12% tariff adjustment on Tunisian olive oil imports from March 2026',
  },
  {
    id: 5,
    text: 'AEMET severe drought alert for Andalusia — 40% soil moisture deficit ahead of flowering',
  },
];

// Used when Claude is unavailable so the ticker is never empty
const FALLBACK_TAGS = {
  1: { tag: 'BEARISH MARGIN', explanation: 'Higher energy costs squeeze producer margins' },
  2: { tag: 'BEARISH PRICE',  explanation: 'Major supply recovery drives prices lower' },
  3: { tag: 'BEARISH MARGIN', explanation: 'Logistics cost spike hits export margins' },
  4: { tag: 'WATCH',          explanation: 'Tariff outcome uncertain, monitor closely' },
  5: { tag: 'BULLISH PRICE',  explanation: 'Drought risk threatens Andalusia output' },
};

// ─── Style map ────────────────────────────────────────────────────────────────

const TAG_STYLES = {
  'BEARISH PRICE':  'bg-red-500/15 text-red-400 border border-red-500/30',
  'BULLISH PRICE':  'bg-green-500/15 text-green-400 border border-green-500/30',
  'BEARISH MARGIN': 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
  'WATCH':          'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  'NEUTRAL':        'bg-zinc-700/40 text-zinc-400 border border-zinc-600/30',
};

// ─── Claude system prompt (cached) ───────────────────────────────────────────

const SYSTEM_PROMPT = `You are a market intelligence tagger for the global olive oil market.

Given a JSON array of market events, return a JSON array of tags. Nothing else — no prose, no markdown fences.

Tag definitions (pick exactly one per event):
  BEARISH PRICE   — likely pushes olive oil prices down (supply recovery, demand collapse)
  BULLISH PRICE   — likely pushes prices up (harvest failure, supply disruption, demand surge)
  BEARISH MARGIN  — hurts producer or grower margins regardless of olive oil price (energy costs, freight, input prices)
  WATCH           — developing situation, price impact genuinely uncertain — monitor closely
  NEUTRAL         — negligible direct price or margin effect

Output schema per item:
  { "id": number, "tag": string, "explanation": string }

explanation: one plain-English sentence, max 12 words, no hedging language.`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function Ticker() {
  const [events, setEvents] = useState(
    SEED_EVENTS.map((e) => ({ ...e, tag: null, explanation: null, loading: true }))
  );

  useEffect(() => {
    async function tagEvents() {
      try {
        const response = await callClaude({
          // Mark system prompt as cacheable — repeated renders won't re-charge tokens
          system: [
            {
              type: 'text',
              text: SYSTEM_PROMPT,
              cache_control: { type: 'ephemeral' },
            },
          ],
          messages: [
            {
              role: 'user',
              content: JSON.stringify(
                SEED_EVENTS.map(({ id, text }) => ({ id, text }))
              ),
            },
          ],
          max_tokens: 512,
        });

        const raw = extractText(response);

        // Strip any accidental markdown fences before parsing
        const cleaned = raw.replace(/```[a-z]*\n?/gi, '').trim();
        const parsed = JSON.parse(cleaned);

        setEvents((prev) =>
          prev.map((event) => {
            const result = parsed.find((r) => r.id === event.id);
            const fallback = FALLBACK_TAGS[event.id];
            return {
              ...event,
              tag: result?.tag ?? fallback?.tag ?? 'NEUTRAL',
              explanation: result?.explanation ?? fallback?.explanation ?? '',
              loading: false,
            };
          })
        );
      } catch (err) {
        console.error('[Ticker] Claude tagging failed:', err);
        setEvents((prev) =>
          prev.map((event) => ({
            ...event,
            tag: FALLBACK_TAGS[event.id]?.tag ?? 'NEUTRAL',
            explanation: FALLBACK_TAGS[event.id]?.explanation ?? '',
            loading: false,
          }))
        );
      }
    }

    tagEvents();
  }, []);

  return (
    <div className="relative w-full bg-zinc-950 border-b border-zinc-800 overflow-hidden">
      <div className="flex items-stretch h-11">

        {/* ── Sticky label ── */}
        <div className="flex-none flex items-center px-4 gap-2 border-r border-zinc-800 bg-zinc-950 z-10">
          <span className="block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-amber-500 font-mono text-[10px] font-semibold tracking-[0.18em] uppercase whitespace-nowrap">
            Market Signals
          </span>
        </div>

        {/* ── Scrolling strip ── */}
        <div className="overflow-hidden flex-1 flex items-center cursor-default">
          <div className="ticker-track flex items-center whitespace-nowrap">
            <TickerItems events={events} />
            {/* Duplicate for seamless loop */}
            <TickerItems events={events} aria-hidden="true" />
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Event items (rendered twice for seamless loop) ──────────────────────────

function TickerItems({ events, ...rest }) {
  return (
    <span className="inline-flex items-center" {...rest}>
      {events.map((event) => (
        <TickerEvent key={event.id} event={event} />
      ))}
    </span>
  );
}

function TickerEvent({ event }) {
  const tagStyle = TAG_STYLES[event.tag] ?? TAG_STYLES['NEUTRAL'];

  return (
    <span className="inline-flex items-center gap-2.5 px-5">
      {/* Separator diamond */}
      <span className="text-zinc-700 text-[10px] select-none">◆</span>

      {/* Event text */}
      <span className="text-zinc-300 text-sm leading-none">{event.text}</span>

      {/* Impact tag */}
      {event.loading ? (
        <Badge className="bg-zinc-800 text-zinc-600 border border-zinc-700 animate-pulse font-mono text-[10px]">
          TAGGING…
        </Badge>
      ) : (
        <Badge className={`font-mono text-[10px] tracking-wide ${tagStyle}`}>
          {event.tag}
        </Badge>
      )}

      {/* Claude explanation */}
      {!event.loading && event.explanation && (
        <span className="text-zinc-500 text-xs italic leading-none">
          {event.explanation}
        </span>
      )}
    </span>
  );
}
