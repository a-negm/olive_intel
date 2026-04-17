// Root app shell — composes the dashboard and grove calculator sections

import Ticker from '@/components/dashboard/Ticker';
import KPIStrip from '@/components/dashboard/KPIStrip';
import PriceChart from '@/components/dashboard/PriceChart';
import ProductionChart from '@/components/dashboard/ProductionChart';
import OutlookPanel from '@/components/dashboard/OutlookPanel';
import GroveCalculator from '@/components/grove/GroveCalculator';

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">

      {/* Row 1 — Ticker */}
      <Ticker />

      {/* Description banner */}
      <div className="w-full bg-zinc-900 border-b border-zinc-800 px-6 py-2 flex items-center justify-between">
        <span className="text-zinc-400 text-xs font-mono">
          AI-powered olive oil market intelligence · Price direction · Harvest signals · Grove yield calculator
        </span>
        <a
          href="https://github.com/a-negm/olive_intel"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-600 text-xs font-mono hover:text-zinc-400 transition-colors"
        >
          View source ↗
        </a>
      </div>

      {/* Row 2 — Claude outlook panel */}
      <div className="px-3 md:px-6 pb-6">
        <OutlookPanel />
      </div>

      {/* Row 3 — KPI strip */}
      <KPIStrip />

      {/* Row 4 — Price history full-width on mobile, 2/3 + 1/3 on desktop */}
      <div className="px-3 md:px-6 pb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2"><PriceChart /></div>
        <div className="hidden md:block md:col-span-1"><ProductionChart /></div>
      </div>

      {/* Divider */}
      <div className="mx-3 md:mx-6 mb-8 border-t border-zinc-800" />

      {/* Row 5 — Grove Calculator */}
      <GroveCalculator />

    </div>
  );
}
