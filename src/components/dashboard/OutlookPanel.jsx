// Claude AI outlook panel: directional call, confidence, key drivers/risks, plain-language summary — amber-accented

import { useEffect, useState } from 'react';
import { callClaude, extractText } from '@/lib/claudeProxy';

// ─── Market context fed to Claude ────────────────────────────────────────────

const MARKET_SIGNALS = {
  price: {
    current_usd_per_ton: 5930,
    change_yoy_pct: -11,
    peak_usd_per_ton: 8900,
    peak_date: 'January 2024',
  },
  production: {
    world_total_million_tons: 3.57,
    change_vs_prior_crop_year_pct: 38,
    spain_harvest_change_pct: 42,
    spain_million_tons: 1.37,
    italy_million_tons: 0.30,
    greece_million_tons: 0.27,
    tunisia_million_tons: 0.28,
    turkey_million_tons: 0.21,
  },
  macro_events: [
    'Brent crude +8% over three weeks on Middle East supply disruption fears',
    'Spain 2025/26 olive harvest forecast revised up +31% vs prior year — IOC November update',
    'Strait of Hormuz transit insurance premiums rising following tanker incidents',
    'EU proposes 12% tariff adjustment on Tunisian olive oil imports from March 2026',
    'AEMET severe drought alert for Andalusia — 40% soil moisture deficit ahead of flowering',
  ],
  context_date: 'April 2025',
};

// ─── System prompt (cacheable) ────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are the market intelligence engine for Olive Intel, a dashboard tracking the global olive oil market for producers and buyers.

Given current market data, return a structured directional outlook as a single JSON object. Nothing else — no prose, no markdown fences, no explanation outside the JSON.

Output schema (return exactly this structure):
{
  "direction": "BEARISH" | "BULLISH" | "NEUTRAL",
  "confidence": "low" | "medium" | "high",
  "key_drivers": ["string", "string"],
  "key_risks": ["string", "string"],
  "summary": "string"
}

Field definitions:
  direction    — price outlook over the next 3–6 months: BEARISH (declining), BULLISH (rising), NEUTRAL (range-bound)
  confidence   — how clearly the signals align: low (conflicting), medium (directional but uncertain), high (strong consensus)
  key_drivers  — 2–3 factors actively pushing price in the called direction; each max 15 words, plain English
  key_risks    — 2–3 factors that could reverse or disrupt your call; each max 15 words, plain English
  summary      — 2–3 sentences a producer or buyer can act on; no hedging language, no disclaimers

This tool explicitly does not predict precise price levels — only direction and confidence.`;

// ─── Styles ───────────────────────────────────────────────────────────────────

const DIRECTION_STYLES = {
  BEARISH: { badge: 'bg-red-500/15 text-red-400 border border-red-500/30',     accent: 'text-red-400',   bar: 'bg-red-500'   },
  BULLISH: { badge: 'bg-green-500/15 text-green-400 border border-green-500/30', accent: 'text-green-400', bar: 'bg-green-500' },
  NEUTRAL: { badge: 'bg-zinc-700/40 text-zinc-300 border border-zinc-600/30',  accent: 'text-zinc-300',  bar: 'bg-zinc-500'  },
};

const CONFIDENCE_PCT = { low: 25, medium: 55, high: 85 };

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function Skeleton({ className }) {
  return <div className={`rounded-md bg-zinc-800 animate-pulse ${className}`} />;
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-32" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="h-1.5 w-full max-w-xs" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-24 mb-1" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-20 mb-1" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-3/6" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorState({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <p className="text-zinc-500 text-sm">Claude couldn't generate the outlook.</p>
      <button
        onClick={onRetry}
        className="text-amber-500 text-xs font-mono border border-amber-500/30 rounded px-3 py-1.5 hover:bg-amber-500/10 transition-colors"
      >
        Retry
      </button>
    </div>
  );
}

// ─── Signal column ────────────────────────────────────────────────────────────

function SignalColumn({ title, icon, iconClass, items, dotClass }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-1.5">
        <span className={`text-xs ${iconClass}`}>{icon}</span>
        <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wide">{title}</span>
      </div>
      <ul className="flex flex-col gap-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className={`mt-1.5 block w-1.5 h-1.5 rounded-full flex-none ${dotClass}`} />
            <span className="text-zinc-300 text-sm leading-snug">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Outlook content ──────────────────────────────────────────────────────────

function OutlookContent({ data }) {
  const styles   = DIRECTION_STYLES[data.direction] ?? DIRECTION_STYLES.NEUTRAL;
  const confStr  = String(data.confidence ?? 'medium').toLowerCase();
  const confPct  = CONFIDENCE_PCT[confStr] ?? 55;
  const confLabel = confStr.charAt(0).toUpperCase() + confStr.slice(1);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Direction + confidence */}
      <div className="flex items-start gap-6 flex-wrap">
        <span className={`px-4 py-1.5 rounded-lg border font-mono text-xl font-bold tracking-widest ${styles.badge}`}>
          {data.direction}
        </span>
        <div className="flex flex-col gap-1.5 flex-1 min-w-40 justify-center">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wide">Confidence</span>
            <span className={`text-[11px] font-mono ${styles.accent}`}>{confLabel} · {confPct}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-zinc-800">
            <div className={`h-1.5 rounded-full transition-all ${styles.bar}`} style={{ width: `${confPct}%` }} />
          </div>
        </div>
      </div>

      {/* Drivers + risks */}
      <div className="grid grid-cols-2 gap-6">
        <SignalColumn title="Key Drivers"       icon="↓" iconClass="text-red-400"   items={data.key_drivers} dotClass="bg-zinc-500" />
        <SignalColumn title="Key Risks to Call" icon="⚠" iconClass="text-amber-500" items={data.key_risks}   dotClass="bg-amber-500/60" />
      </div>

      {/* Summary */}
      <div className="border-t border-zinc-800 pt-5">
        <p className="text-zinc-300 text-sm leading-relaxed">{data.summary}</p>
      </div>
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export default function OutlookPanel() {
  const [status, setStatus]         = useState('loading');
  const [outlook, setOutlook]       = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    async function fetchOutlook() {
      try {
        const response = await callClaude({
          system: [
            { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
          ],
          messages: [
            {
              role: 'user',
              content: `Generate a market outlook based on these current signals:\n\n${JSON.stringify(MARKET_SIGNALS, null, 2)}`,
            },
          ],
          max_tokens: 600,
        });

        if (cancelled) return;

        const raw    = extractText(response);
        const parsed = JSON.parse(raw.replace(/```[a-z]*\n?/gi, '').trim());

        setOutlook(parsed);
        setStatus('ready');
      } catch (err) {
        if (cancelled) return;
        console.error('[OutlookPanel] Claude call failed:', err);
        setStatus('error');
      }
    }

    fetchOutlook();
    return () => { cancelled = true; };
  }, [retryCount]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <span className="block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-amber-500 font-mono text-xs font-semibold tracking-[0.15em] uppercase">
            Claude Market Outlook
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-zinc-600">Haiku 4.5 · Apr 2025 signals</span>
          {status === 'ready' && (
            <button
              onClick={() => setRetryCount((n) => n + 1)}
              className="text-[10px] font-mono text-zinc-500 hover:text-amber-400 transition-colors border border-zinc-700 hover:border-amber-500/40 rounded px-2 py-0.5"
            >
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      {status === 'loading' && <LoadingState />}
      {status === 'ready'   && outlook && <OutlookContent data={outlook} />}
      {status === 'error'   && <ErrorState onRetry={() => setRetryCount((n) => n + 1)} />}
    </div>
  );
}
