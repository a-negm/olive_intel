// Bar chart of olive oil production by region (Spain, Italy, Greece, etc.) — current vs prior crop year

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const PRODUCTION_DATA = [
  { region: 'Spain',   current: 1.37, prior: 1.41 },
  { region: 'Italy',   current: 0.30, prior: 0.23 },
  { region: 'Greece',  current: 0.27, prior: 0.34 },
  { region: 'Tunisia', current: 0.28, prior: 0.24 },
  { region: 'Turkey',  current: 0.21, prior: 0.32 },
  { region: 'Morocco', current: 0.18, prior: 0.20 },
];

const CURRENT_YEAR = '25/26';
const PRIOR_YEAR   = '24/25';

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const current = payload.find((p) => p.dataKey === 'current');
  const prior   = payload.find((p) => p.dataKey === 'prior');
  const delta   = current && prior
    ? (((current.value - prior.value) / prior.value) * 100).toFixed(1) : null;
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 shadow-xl">
      <p className="text-zinc-300 text-xs font-semibold mb-2">{label}</p>
      {current && (
        <div className="flex items-center justify-between gap-4">
          <span className="text-[11px] text-zinc-500 font-mono">{CURRENT_YEAR}</span>
          <span className="text-amber-400 text-[11px] font-mono font-medium">{current.value.toFixed(2)}M t</span>
        </div>
      )}
      {prior && (
        <div className="flex items-center justify-between gap-4">
          <span className="text-[11px] text-zinc-500 font-mono">{PRIOR_YEAR}</span>
          <span className="text-zinc-400 text-[11px] font-mono">{prior.value.toFixed(2)}M t</span>
        </div>
      )}
      {delta !== null && (
        <p className={`text-[11px] font-mono mt-1 pt-1 border-t border-zinc-800 ${delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {delta > 0 ? '↑' : '↓'} {Math.abs(delta)}% vs prior year
        </p>
      )}
    </div>
  );
}

function ChartLegend() {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1.5">
        <span className="block w-2.5 h-2.5 rounded-sm bg-amber-500" />
        <span className="text-[10px] font-mono text-zinc-500">{CURRENT_YEAR}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="block w-2.5 h-2.5 rounded-sm bg-zinc-600" />
        <span className="text-[10px] font-mono text-zinc-500">{PRIOR_YEAR}</span>
      </div>
    </div>
  );
}

export default function ProductionChart() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-3 h-full">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Production by Region</h2>
          <p className="text-[11px] text-zinc-500 mt-0.5">Million metric tons · IOC estimates</p>
        </div>
        <ChartLegend />
      </div>

      <ResponsiveContainer width="100%" height={248}>
        <BarChart data={PRODUCTION_DATA} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barCategoryGap="28%" barGap={3}>
          <CartesianGrid vertical={false} stroke="#27272a" strokeDasharray="3 3" />
          <XAxis dataKey="region" tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'monospace' }} axisLine={{ stroke: '#3f3f46' }} tickLine={false} />
          <YAxis tickFormatter={(v) => `${v.toFixed(1)}`} tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} width={28} domain={[0, 1.6]} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: '#27272a' }} />
          <Bar dataKey="prior"   fill="#52525b" radius={[3, 3, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="current" fill="#f59e0b" radius={[3, 3, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
