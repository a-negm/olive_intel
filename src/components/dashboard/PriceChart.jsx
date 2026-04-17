// FRED monthly price history line chart (2018–present) with annotated vertical markers for key events

import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, Label,
} from 'recharts';

const PRICE_DATA = [
  { month: 'Jan 18', price: 2820 }, { month: 'Feb 18', price: 2790 },
  { month: 'Mar 18', price: 2760 }, { month: 'Apr 18', price: 2740 },
  { month: 'May 18', price: 2780 }, { month: 'Jun 18', price: 2810 },
  { month: 'Jul 18', price: 2830 }, { month: 'Aug 18', price: 2860 },
  { month: 'Sep 18', price: 2870 }, { month: 'Oct 18', price: 2850 },
  { month: 'Nov 18', price: 2820 }, { month: 'Dec 18', price: 2790 },
  { month: 'Jan 19', price: 2760 }, { month: 'Feb 19', price: 2730 },
  { month: 'Mar 19', price: 2710 }, { month: 'Apr 19', price: 2740 },
  { month: 'May 19', price: 2760 }, { month: 'Jun 19', price: 2750 },
  { month: 'Jul 19', price: 2720 }, { month: 'Aug 19', price: 2700 },
  { month: 'Sep 19', price: 2710 }, { month: 'Oct 19', price: 2730 },
  { month: 'Nov 19', price: 2750 }, { month: 'Dec 19', price: 2760 },
  { month: 'Jan 20', price: 2740 }, { month: 'Feb 20', price: 2700 },
  { month: 'Mar 20', price: 2600 }, { month: 'Apr 20', price: 2520 },
  { month: 'May 20', price: 2480 }, { month: 'Jun 20', price: 2500 },
  { month: 'Jul 20', price: 2530 }, { month: 'Aug 20', price: 2560 },
  { month: 'Sep 20', price: 2590 }, { month: 'Oct 20', price: 2610 },
  { month: 'Nov 20', price: 2620 }, { month: 'Dec 20', price: 2590 },
  { month: 'Jan 21', price: 2500 }, { month: 'Feb 21', price: 2450 },
  { month: 'Mar 21', price: 2420 }, { month: 'Apr 21', price: 2400 },
  { month: 'May 21', price: 2430 }, { month: 'Jun 21', price: 2480 },
  { month: 'Jul 21', price: 2530 }, { month: 'Aug 21', price: 2590 },
  { month: 'Sep 21', price: 2650 }, { month: 'Oct 21', price: 2720 },
  { month: 'Nov 21', price: 2810 }, { month: 'Dec 21', price: 2920 },
  { month: 'Jan 22', price: 3080 }, { month: 'Feb 22', price: 3290 },
  { month: 'Mar 22', price: 3510 }, { month: 'Apr 22', price: 3740 },
  { month: 'May 22', price: 3960 }, { month: 'Jun 22', price: 4210 },
  { month: 'Jul 22', price: 4480 }, { month: 'Aug 22', price: 4750 },
  { month: 'Sep 22', price: 5020 }, { month: 'Oct 22', price: 5310 },
  { month: 'Nov 22', price: 5640 }, { month: 'Dec 22', price: 5980 },
  { month: 'Jan 23', price: 6350 }, { month: 'Feb 23', price: 6780 },
  { month: 'Mar 23', price: 7120 }, { month: 'Apr 23', price: 7480 },
  { month: 'May 23', price: 7750 }, { month: 'Jun 23', price: 7980 },
  { month: 'Jul 23', price: 8190 }, { month: 'Aug 23', price: 8420 },
  { month: 'Sep 23', price: 8610 }, { month: 'Oct 23', price: 8740 },
  { month: 'Nov 23', price: 8820 }, { month: 'Dec 23', price: 8870 },
  { month: 'Jan 24', price: 8900 }, { month: 'Feb 24', price: 8760 },
  { month: 'Mar 24', price: 8510 }, { month: 'Apr 24', price: 8180 },
  { month: 'May 24', price: 7820 }, { month: 'Jun 24', price: 7350 },
  { month: 'Jul 24', price: 6890 }, { month: 'Aug 24', price: 6480 },
  { month: 'Sep 24', price: 6190 }, { month: 'Oct 24', price: 6050 },
  { month: 'Nov 24', price: 5970 }, { month: 'Dec 24', price: 5920 },
  { month: 'Jan 25', price: 5900 }, { month: 'Feb 25', price: 5880 },
  { month: 'Mar 25', price: 5870 }, { month: 'Apr 25', price: 5930 },
];

const EVENTS = [
  { month: 'Jan 22', label: 'Drought begins',   labelPosition: 'insideTopLeft'  },
  { month: 'Jan 24', label: '2024 peak',         labelPosition: 'insideTopRight' },
  { month: 'Jun 24', label: 'Harvest recovery',  labelPosition: 'insideTopLeft'  },
];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-zinc-400 text-[11px] font-mono mb-1">{label}</p>
      <p className="text-amber-400 text-sm font-semibold">
        ${payload[0].value.toLocaleString()}
        <span className="text-zinc-500 font-normal">/t</span>
      </p>
    </div>
  );
}

export default function PriceChart() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Global Price History</h2>
          <p className="text-[11px] text-zinc-500 mt-0.5">USD / metric ton · FRED POLVOILUSDM · Jan 2018 – Apr 2025</p>
        </div>
        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-wide">Monthly</span>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={PRICE_DATA} margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
          <CartesianGrid vertical={false} stroke="#27272a" strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tickFormatter={(t) => t.startsWith('Jan') ? t.replace('Jan ', "'") : ''}
            tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'monospace' }}
            axisLine={{ stroke: '#3f3f46' }}
            tickLine={false}
            interval={11}
          />
          <YAxis
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'monospace' }}
            axisLine={false} tickLine={false} width={36} domain={[2000, 9500]}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#52525b', strokeWidth: 1 }} />
          {EVENTS.map((ev) => (
            <ReferenceLine key={ev.month} x={ev.month} stroke="#52525b" strokeDasharray="4 3" strokeWidth={1}>
              <Label value={ev.label} position={ev.labelPosition} fill="#71717a" fontSize={10} fontFamily="monospace" offset={6} />
            </ReferenceLine>
          ))}
          <Line type="monotone" dataKey="price" stroke="#f59e0b" strokeWidth={2} dot={false}
            activeDot={{ r: 3, fill: '#f59e0b', stroke: '#18181b', strokeWidth: 2 }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
