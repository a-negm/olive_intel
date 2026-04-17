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

      {/* Row 2 — KPI strip */}
      <KPIStrip />

      {/* Row 3 — Price history (2/3) + Production by region (1/3) */}
      <div className="px-6 pb-4 grid grid-cols-3 gap-4">
        <div className="col-span-2"><PriceChart /></div>
        <div className="col-span-1"><ProductionChart /></div>
      </div>

      {/* Row 4 — Claude outlook panel */}
      <div className="px-6 pb-6">
        <OutlookPanel />
      </div>

      {/* Divider */}
      <div className="mx-6 mb-8 border-t border-zinc-800" />

      {/* Row 5 — Grove Calculator */}
      <GroveCalculator />

    </div>
  );
}
