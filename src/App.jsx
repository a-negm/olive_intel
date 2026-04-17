// Root app shell — composes the dashboard and grove calculator sections

import Ticker from '@/components/dashboard/Ticker';
import KPIStrip from '@/components/dashboard/KPIStrip';

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Ticker />
      <KPIStrip />
      {/* PriceChart, ProductionChart, HarvestMap, OutlookPanel, GroveCalculator — added in subsequent sessions */}
    </div>
  );
}
