// Form inputs for grove calculator: location, variety, tree count, age range, and allocation sliders

import { VARIETY_DATA } from '@/data/varietyData';

const LOCATIONS = ['Andalusia, Spain', 'Crete, Greece', 'Apulia, Italy', 'Attica, Greece', 'Kalamata, Greece', 'Sfax, Tunisia', 'Marrakech, Morocco', 'Aegean Coast, Turkey'];
const AGE_RANGES = ['1–5 years', '6–10 years', '11–20 years', '21–50 years', '50+ years'];

function SliderRow({ label, value, onChange, color }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wide">{label}</span>
        <span className={`text-[11px] font-mono font-semibold ${color}`}>{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-zinc-700 accent-amber-500 cursor-pointer"
      />
    </div>
  );
}

export default function GroveInputs({ inputs, onChange }) {
  const { location, variety, trees, treeAge, allocPremium, allocBulk, allocTable } = inputs;
  const total = allocPremium + allocBulk + allocTable;
  const totalOk = total === 100;

  function set(key, val) {
    onChange({ ...inputs, [key]: val });
  }

  function handleSlider(key, val) {
    const rest = 100 - val;
    const others = { allocPremium, allocBulk, allocTable };
    delete others[key];
    const otherKeys = Object.keys(others);
    const otherTotal = otherKeys.reduce((s, k) => s + others[k], 0);
    if (otherTotal === 0) {
      const half = Math.floor(rest / 2);
      const updated = { [otherKeys[0]]: half, [otherKeys[1]]: rest - half };
      onChange({ ...inputs, [key]: val, ...updated });
    } else {
      const scale = rest / otherTotal;
      const a = Math.round(others[otherKeys[0]] * scale);
      const b = rest - a;
      onChange({ ...inputs, [key]: val, [otherKeys[0]]: a, [otherKeys[1]]: b });
    }
  }

  const varietyInfo = VARIETY_DATA[variety];

  return (
    <div className="flex flex-col gap-5">
      {/* Row 1 — location + variety */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono text-zinc-500 uppercase tracking-wide">Location</label>
          <select
            value={location}
            onChange={(e) => set('location', e.target.value)}
            className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500/50 transition-colors"
          >
            {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono text-zinc-500 uppercase tracking-wide">Variety</label>
          <select
            value={variety}
            onChange={(e) => set('variety', e.target.value)}
            className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500/50 transition-colors"
          >
            {Object.keys(VARIETY_DATA).map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* Variety badge row */}
      {varietyInfo && (
        <div className="flex flex-wrap gap-2 -mt-1">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">
            Oil {(varietyInfo.oilContent * 100).toFixed(0)}%
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">
            Yield {varietyInfo.yieldProfile}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">
            Polyphenol {varietyInfo.polyphenol}
          </span>
          {varietyInfo.earlyHarvestSuitable && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
              Early harvest
            </span>
          )}
        </div>
      )}

      {/* Row 2 — trees + age */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono text-zinc-500 uppercase tracking-wide">Tree Count</label>
          <input
            type="number"
            min={1}
            max={100000}
            value={trees}
            onChange={(e) => set('trees', Math.max(1, Number(e.target.value)))}
            className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500/50 transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono text-zinc-500 uppercase tracking-wide">Tree Age</label>
          <select
            value={treeAge}
            onChange={(e) => set('treeAge', e.target.value)}
            className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500/50 transition-colors"
          >
            {AGE_RANGES.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Allocation sliders */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wide">Output Allocation</span>
          <span className={`text-[11px] font-mono font-semibold ${totalOk ? 'text-zinc-500' : 'text-red-400'}`}>
            {total}% {!totalOk && '— must total 100'}
          </span>
        </div>
        <div className="flex flex-col gap-3">
          <SliderRow label="Premium extra virgin" value={allocPremium} onChange={(v) => handleSlider('allocPremium', v)} color="text-amber-400" />
          <SliderRow label="Bulk / commodity"     value={allocBulk}    onChange={(v) => handleSlider('allocBulk',    v)} color="text-zinc-300" />
          <SliderRow label="Table olives"          value={allocTable}   onChange={(v) => handleSlider('allocTable',   v)} color="text-zinc-400" />
        </div>
      </div>
    </div>
  );
}
