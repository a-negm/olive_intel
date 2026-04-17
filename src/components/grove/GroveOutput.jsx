// Claude-generated output: yield range, harvest timing, revenue estimate, input cost flags, narrative paragraph

import { useState } from 'react';

function Skeleton({ className }) {
  return <div className={`rounded-md bg-zinc-800 animate-pulse ${className}`} />;
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-2 bg-zinc-800/40 rounded-xl p-4">
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-10 rounded-lg" />
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, accent }) {
  return (
    <div className="flex flex-col gap-1 bg-zinc-800/40 border border-zinc-800 rounded-xl p-4">
      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wide">{label}</span>
      <span className={`text-lg font-semibold font-mono ${accent ?? 'text-zinc-100'}`}>{value}</span>
      {sub && <span className="text-[11px] text-zinc-500">{sub}</span>}
    </div>
  );
}

function FlagRow({ flags }) {
  if (!flags?.length) return null;
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wide">Input Cost Flags</span>
      <div className="flex flex-wrap gap-2">
        {flags.map((f, i) => (
          <span key={i} className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function GroveOutput({ status, data }) {
  const [expanded, setExpanded] = useState(false);

  if (status === 'idle') {
    return (
      <div className="flex items-center justify-center py-14 text-center">
        <p className="text-zinc-600 text-sm font-mono">Configure your grove and press Calculate Yield</p>
      </div>
    );
  }

  if (status === 'loading') return <LoadingState />;

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center py-14">
        <p className="text-red-400 text-sm font-mono">Claude couldn't generate the estimate. Try again.</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-5">
      {/* KPI row — always visible; 2-col on mobile (harvest full-width), 3-col on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
        <MetricCard
          label="Estimated Yield"
          value={data.yield_range}
          sub="metric tons"
          accent="text-amber-400"
        />
        <MetricCard
          label="Revenue Estimate"
          value={data.revenue_range}
          sub="at current prices"
          accent="text-green-400"
        />
        <div className="col-span-2 md:col-span-1">
          <MetricCard
            label="Harvest Window"
            value={data.harvest_window}
            sub={data.early_harvest_note ?? undefined}
          />
        </div>
      </div>

      {/* Mobile toggle */}
      <button
        className="md:hidden self-start flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-zinc-300 border border-zinc-700 rounded px-3 py-1.5 transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        {expanded ? 'Hide analysis ↑' : 'Show full analysis ↓'}
      </button>

      {/* Detail section — always on desktop, toggled on mobile */}
      <div className={`${expanded ? 'flex' : 'hidden'} md:flex flex-col gap-5`}>
        {/* Narrative */}
        <div className="border-t border-zinc-800 pt-4">
          <p className="text-zinc-300 text-sm leading-relaxed">{data.narrative}</p>
        </div>

        {/* Input cost flags */}
        <FlagRow flags={data.input_cost_flags} />

        {/* Allocation breakdown */}
        {data.allocation_breakdown && (
          <div className="grid grid-cols-3 gap-2">
            {data.allocation_breakdown.map((item, i) => (
              <div key={i} className="flex flex-col gap-0.5 bg-zinc-800/30 rounded-lg px-3 py-2">
                <span className="text-xs font-mono text-zinc-500">{item.label}</span>
                <span className="text-xs font-mono text-zinc-300">{item.volume}</span>
                <span className="text-xs font-mono text-zinc-500">{item.revenue}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
