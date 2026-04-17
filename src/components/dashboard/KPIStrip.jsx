// Five KPI cards: Global Price, Jaén Spot, World Production, Spain Harvest, Claude Outlook — each with a sparkline

import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// ─── Static data ──────────────────────────────────────────────────────────────

const spark = (values) => values.map((v, i) => ({ i, v }));

const KPI_CARDS = [
  {
    id: 'global-price',
    label: 'Global Price',
    source: 'FRED · POLVOILUSDM',
    value: '$5,930',
    unit: '/t',
    delta: '−11%',
    deltaContext: 'year on year',
    trend: 'down',
    sparkData: spark([7820, 7400, 7050, 6700, 6290, 5930]),
  },
  {
    id: 'jaen-spot',
    label: 'Jaén Spot',
    source: 'IOC weekly benchmark',
    value: '€4.33',
    unit: '/kg',
    delta: '−3.1%',
    deltaContext: 'vs last week',
    trend: 'down',
    sparkData: spark([5.20, 4.95, 4.72, 4.58, 4.44, 4.33]),
  },
  {
    id: 'world-production',
    label: 'World Production',
    source: 'IOC crop year 25/26',
    value: '3.57M',
    unit: 't',
    delta: '+38%',
    deltaContext: 'vs prior crop year',
    trend: 'up',
    sparkData: spark([2.59, 2.51, 2.77, 3.05, 3.31, 3.57]),
  },
  {
    id: 'spain-harvest',
    label: 'Spain Harvest',
    source: 'Most important single signal',
    value: '+42%',
    unit: '',
    delta: '+42%',
    deltaContext: 'vs prior year',
    trend: 'up',
    sparkData: spark([74, 68, 71, 84, 98, 142]),
  },
];

const OUTLOOK = {
  direction: 'BEARISH',
  confidence: 'MEDIUM',
  confidencePct: 55,
  summary: 'Spain supply recovery driving sustained price pressure into H2 2026.',
};

// ─── Colour helpers ───────────────────────────────────────────────────────────

const TREND_COLOUR = {
  up:   { text: 'text-green-400', stroke: '#4ade80' },
  down: { text: 'text-red-400',   stroke: '#f87171' },
};

const DIRECTION_STYLE = {
  BEARISH: { text: 'text-red-400',   bg: 'bg-red-500/10',   border: 'border-red-500/20'   },
  BULLISH: { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  NEUTRAL: { text: 'text-zinc-300',  bg: 'bg-zinc-700/30',  border: 'border-zinc-600/30'  },
};

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ data, stroke }) {
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data} margin={{ top: 4, right: 2, bottom: 4, left: 2 }}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={stroke}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── Data KPI card ────────────────────────────────────────────────────────────

function KPICard({ card }) {
  const { text: deltaText, stroke } = TREND_COLOUR[card.trend];
  const arrow = card.trend === 'up' ? '↑' : '↓';

  return (
    <Card className="bg-zinc-900 border border-zinc-800 ring-0 gap-0 py-0 rounded-xl overflow-hidden">
      <CardHeader className="px-4 pt-4 pb-0">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[11px] font-mono tracking-wide text-zinc-500 uppercase leading-tight">
            {card.label}
          </span>
          <span className={`text-[11px] font-mono font-medium ${deltaText} whitespace-nowrap`}>
            {arrow} {card.delta}
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-4 pt-2 pb-0">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-semibold text-zinc-100 leading-none tracking-tight">
            {card.value}
          </span>
          {card.unit && (
            <span className="text-sm text-zinc-500 leading-none">{card.unit}</span>
          )}
        </div>
        <p className="text-[10px] text-zinc-600 mt-1 leading-tight">{card.deltaContext}</p>
      </CardContent>

      <div className="px-2 pb-2 pt-1">
        <Sparkline data={card.sparkData} stroke={stroke} />
      </div>

      <div className="px-4 pb-3">
        <span className="text-[10px] text-zinc-700">{card.source}</span>
      </div>
    </Card>
  );
}

// ─── Outlook card (5th card, no sparkline) ────────────────────────────────────

function OutlookCard() {
  const dir = DIRECTION_STYLE[OUTLOOK.direction] ?? DIRECTION_STYLE.NEUTRAL;

  return (
    <Card className="bg-zinc-900 border border-amber-500/30 ring-0 gap-0 py-0 rounded-xl overflow-hidden">
      <CardHeader className="px-4 pt-4 pb-0">
        <div className="flex items-center gap-1.5">
          <span className="block w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="text-[11px] font-mono tracking-wide text-amber-500 uppercase">
            Claude Outlook
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-4 pt-3 pb-0 flex flex-col gap-3">
        {/* Direction pill */}
        <div className={`self-start px-3 py-1 rounded-md border text-sm font-mono font-semibold tracking-widest ${dir.text} ${dir.bg} ${dir.border}`}>
          {OUTLOOK.direction}
        </div>

        {/* Confidence */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wide">
              Confidence
            </span>
            <span className="text-[10px] font-mono text-amber-400">
              {OUTLOOK.confidence} · {OUTLOOK.confidencePct}%
            </span>
          </div>
          <div className="h-1 w-full rounded-full bg-zinc-800">
            <div
              className="h-1 rounded-full bg-amber-500"
              style={{ width: `${OUTLOOK.confidencePct}%` }}
            />
          </div>
        </div>

        {/* Summary */}
        <p className="text-[11px] text-zinc-400 leading-relaxed pb-4">
          {OUTLOOK.summary}
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Strip ────────────────────────────────────────────────────────────────────

export default function KPIStrip() {
  return (
    <div className="w-full px-3 md:px-6 py-4 grid grid-cols-2 md:grid-cols-5 gap-3">
      {KPI_CARDS.map((card) => (
        <KPICard key={card.id} card={card} />
      ))}
      {/* Full width on mobile (spans 2 cols), single col on desktop */}
      <div className="col-span-2 md:col-span-1">
        <OutlookCard />
      </div>
    </div>
  );
}
