// Static olive variety reference data (oil content %, yield profile, flavour notes) baked into Claude prompts

export const VARIETY_DATA = {
  Koroneiki:  { oilContent: 0.22, yieldProfile: 'high',       fruitSize: 'small',  polyphenol: 'high',      earlyHarvestSuitable: true,  notes: 'Dominant Greek variety. Small fruit, very high polyphenol, early harvest potential.' },
  Picual:     { oilContent: 0.23, yieldProfile: 'high',       fruitSize: 'medium', polyphenol: 'high',      earlyHarvestSuitable: false, notes: 'Most planted Spanish variety. High yield, drought resistant.' },
  Frantoio:   { oilContent: 0.20, yieldProfile: 'medium',     fruitSize: 'medium', polyphenol: 'medium',    earlyHarvestSuitable: true,  notes: 'Central Italian variety. Medium yield, frost sensitive, prized flavour.' },
  Arbequina:  { oilContent: 0.18, yieldProfile: 'consistent', fruitSize: 'small',  polyphenol: 'low',       earlyHarvestSuitable: false, notes: 'Consistent yield, mild buttery flavour, suits super-high-density planting.' },
  Leccino:    { oilContent: 0.19, yieldProfile: 'moderate',   fruitSize: 'medium', polyphenol: 'medium',    earlyHarvestSuitable: false, notes: 'Cold-hardy Italian variety. Moderate yield, mild flavour.' },
  Coratina:   { oilContent: 0.24, yieldProfile: 'high',       fruitSize: 'large',  polyphenol: 'very high', earlyHarvestSuitable: true,  notes: 'Apulian variety. Very high polyphenol. Intensely bitter when young.' },
  Manzanilla: { oilContent: 0.17, yieldProfile: 'moderate',   fruitSize: 'large',  polyphenol: 'low',       earlyHarvestSuitable: false, notes: 'Dual-purpose (table + oil). Lower oil content, mild flavour.' },
};

export const DATA_SOURCES = {
  oliveOilPrice:  { series: 'POLVOILUSDM', provider: 'FRED', unit: 'USD/metric ton monthly' },
  brentCrude:     { series: 'DCOILBRENTEU', provider: 'FRED', unit: 'USD/barrel daily', notes: 'Energy cost proxy for irrigation, machinery, transport.' },
  naturalGas:     { series: 'DHHNGSP', provider: 'FRED', unit: 'USD/MMBtu daily', notes: 'Fertilizer cost proxy — natural gas is primary input for nitrogen fertilizer.' },
  fertilizerIndex:{ provider: 'World Bank Commodity Markets', unit: 'USD/metric ton', notes: 'Urea and DAP prices as input cost signals.' },
};
