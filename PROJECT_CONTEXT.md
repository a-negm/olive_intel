# Olive Intel — Project Context & Spec
> Briefing document for Claude Code. Read this before touching any file.

---

## What This Is

A web-based olive oil market intelligence dashboard with a personal grove yield calculator. A web-based olive oil market intelligence tool with a personal grove yield calculator.

**Live stack:**
- React + Vite (frontend)
- shadcn/ui (component library)
- Recharts (data visualisation)
- Cloudflare Pages (hosting)
- Cloudflare Workers (API proxy — keeps Anthropic key server-side)
- Anthropic Claude Haiku 4.5 (AI reasoning layer)

**Repo:** `olive-intel` on GitHub
**Deploy:** Cloudflare Pages, auto-deploys on push to main

---

## Why This Exists (The Origin Story)

The builder was planning to sell olive oil. Set up an online shop, created a brand — then paused end of 2025 to focus on a job search. The 25/26 harvest season they paused into was a paradox: the Peloponnese (Kalamata region) actually had a decent local harvest with 15–20% more blossoms than prior year, yet opening prices dropped to €7.85/kg from €10.20/kg the year before. Good yield, collapsing prices. Without visibility into what was driving that — supply recovery across the Mediterranean, pest damage elsewhere in Greece, global demand shifts — the decision to pause or push forward was essentially a guess. This tool is built to make that decision readable.



---

## Two User Personas

### Persona 1: The Market Watcher (buyer / importer / trader)
Wants to know: **where are prices going?**
Needs: macro signals, price trends, harvest forecasts, geopolitical context

### Persona 2: Spiros (the grower)
Greek olive grove owner in Kalamata. Grows Koroneiki variety.
Wants to know: **what will I produce this season, and when should I sell?**
Needs: yield estimate based on his grove inputs + current weather conditions

Both personas share the same underlying data. The connection between them is the insight — Spiros can look at the market dashboard *and* his yield estimate and make a timing/pricing decision.

---

## Architecture

```
Browser (React + Vite)
    ↓
Cloudflare Worker (API proxy at /api/claude)
    ↓
Anthropic Claude Haiku 4.5
```

**Why a Worker proxy:**
Calling Anthropic API directly from the browser exposes the API key. The Worker keeps the key server-side. Both deploy from the same repo.

**Environment variables:**
- In Worker: `ANTHROPIC_API_KEY` (set in Cloudflare dashboard, never in code)
- In React: `VITE_` prefix for any non-sensitive config
- `.env` is in `.gitignore` — never committed

---

## Page Layout (Top to Bottom)

### SECTION 1: Top Dashboard (Market Watcher persona)

**01 · Ticker — Full width**
- Scrolling feed of macro events with AI-generated impact tags
- Tags: BEARISH PRICE / BULLISH PRICE / BEARISH MARGIN / WATCH / NEUTRAL
- Events include: energy prices, fertilizer costs, geopolitical events (e.g. Strait of Hormuz), drought alerts, harvest forecasts, trade agreements
- Claude generates the impact tag and one-line explanation for each event
- Read-only feed — no user input, events are sourced and Claude-tagged only

**02 · KPI Strip — 5 cards**
1. Global Price (USD/metric ton) — from FRED data
2. Jaén Spot Price (€/kg) — IOC weekly benchmark
3. World Production (current crop year vs prior)
4. Spain Harvest (% change vs prior year — most important single number)
5. Claude Outlook — directional signal (BULLISH / BEARISH / NEUTRAL) with confidence level

Each KPI card has a sparkline. The Outlook card is visually distinct (amber colour).

**03 · Main Charts — 2/3 + 1/3 split**
- LEFT (2/3): Price History chart — FRED monthly data from 2018 to present. Line chart with annotated vertical markers for key events (2023 drought spike, 2024 recovery, etc.)
- RIGHT (1/3): Production by Region bar chart — Spain, Italy, Greece, Tunisia, Turkey, Morocco, other. Current crop year vs prior year comparison.

**04 · Context Row — 1/3 + 2/3 split**
- LEFT (1/3): Harvest Stress Map — Mediterranean region, colour-coded by drought/supply stress per country. Hover shows IOC data tooltip.
- RIGHT (2/3): Claude Outlook Panel — AI-generated plain-language reasoning. Shows: directional call, confidence level, key factors, key risks, sources cited. This is the core AI feature.

---

### SECTION 2: Grove Calculator (Spiros persona)

Separated from dashboard by a visual divider.

**User inputs:**
- Location (dropdown of major olive regions: Kalamata, Crete, Andalusia, Tuscany, Catalonia, Tunisia, Morocco, other)
- Olive variety (dropdown): Koroneiki, Picual, Frantoio, Arbequina, Leccino, Coratina, Manzanilla
- Total number of trees
- Tree age range (young 1–5yr / mature 6–20yr / old 20yr+)
- Allocation split (sliders, must total 100%):
  - Organic EVOO %
  - Conventional EVOO %
  - Early Harvest %

**Output — Claude calculates and explains:**
- Estimated yield range (litres) — broken down by allocation type
- Harvest timing recommendation — given variety, location, current season
- Revenue estimate — yield × current market price × product type premium
- Input cost flag — if ticker shows fertilizer/energy spike, surface it here directly
- One-paragraph narrative explanation of the reasoning

**Variety yield reference data (baked into Claude prompt):**
- Koroneiki: ~22% oil content, small fruit, high polyphenol, early harvest potential
- Picual: ~23% oil content, high yield, drought resistant
- Frantoio: ~20% oil content, medium yield, frost sensitive
- Arbequina: ~18% oil content, consistent yield, mild flavour
- Leccino: ~19% oil content, cold hardy, moderate yield
- Coratina: ~24% oil content, very high polyphenol
- Manzanilla: ~17% oil content, dual purpose (table + oil)

---

## Data Sources

| Data | Source | Access |
|------|---------|--------|
| Monthly global price (USD/t) | FRED API — series `POLVOILUSDM` | Free API key |
| Jaén weekly spot price | IOC website | Manual / scraped |
| World production & harvest forecasts | IOC monthly reports | Public PDFs |
| EU consumer price index | Eurostat HICP | Free |
| Market news & events | Olive Oil Times | RSS / manual |
| Weather / drought context | Open-Meteo API | Free, no key needed |
| Brent crude oil price | FRED API — series `DCOILBRENTEU` | Free API key |
| Natural gas spot price | FRED API — series `DHHNGSP` | Free API key |
| Fertilizer price index | World Bank Pink Sheet | Free, manual |

**FRED API call example:**
```
https://api.stlouisfed.org/fred/series/observations?series_id=POLVOILUSDM&api_key=YOUR_KEY&file_type=json
https://api.stlouisfed.org/fred/series/observations?series_id=DCOILBRENTEU&api_key=YOUR_KEY&file_type=json
https://api.stlouisfed.org/fred/series/observations?series_id=DHHNGSP&api_key=YOUR_KEY&file_type=json
```

---

## What Claude Does (AI Layer)

Claude is the **market direction reading layer**, not a price predictor. This is a deliberate product decision grounded in how the 2025 price collapse actually unfolded.

**The case for directional outlook over price prediction:**
The 2025 price collapse was not a surprise in hindsight. Spain's +48% harvest recovery was visible in IOC flowering data months before prices moved. EU consumption had fallen 22% over two prior years as consumers switched to alternatives. The supply recovery signal was sitting in public data — most small producers and buyers simply weren't reading it. A tool that synthesises those signals into a plain-language directional call (*"prices declining, confidence high, key driver: Spain supply recovery"*) would have been genuinely useful. A tool claiming to predict €/kg with precision would have been dishonest.

**What the tool can do:**
- Read the direction of the market before it moves, based on harvest forecasts, supply data, and macro signals
- Flag leading indicators (flowering data, drought indices, production forecasts) that precede price moves by weeks or months
- Surface macro events (energy costs, trade policy, fraud/distortion) that affect producer margins independently of harvest conditions
- Give Spiros a yield and revenue range to plan around, not a false precise number

**What the tool cannot do:**
- Predict exact price levels or timing
- Detect market distortion events (e.g. fraudulent below-floor pricing) before they are reported
- Account for retailer inventory strategies that delay consumer price corrections
- Replace agronomic expertise for grove-level decisions

**Three Claude-powered features:**

1. **Ticker impact tags** — given a market event, Claude returns: impact type, affected variable, one-line explanation, confidence level
2. **Outlook panel** — given: current price, production data, harvest forecasts, recent ticker events → Claude returns: directional call (bullish / bearish / neutral), confidence level, key drivers, key risks, plain-language summary, sources cited
3. **Grove calculator narrative** — given: user's grove inputs + variety data + current market conditions → Claude returns: yield estimate range, harvest timing recommendation, revenue range, input cost flags

**Model:** Claude Haiku 4.5 (`claude-haiku-4-5-20251001`)
**Avg tokens per call:** ~800 input / ~400 output
**Est. cost per call:** ~$0.003

**Prompt caching:** Use for system prompts (variety data, market context) — cuts cost ~90% on repeated calls.

---

## Component Structure

```
olive-intel/
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── Ticker.jsx
│   │   │   ├── KPIStrip.jsx
│   │   │   ├── PriceChart.jsx
│   │   │   ├── ProductionChart.jsx
│   │   │   ├── HarvestMap.jsx
│   │   │   └── OutlookPanel.jsx
│   │   ├── grove/
│   │   │   ├── GroveCalculator.jsx
│   │   │   ├── GroveInputs.jsx
│   │   │   └── GroveOutput.jsx
│   │   └── ui/
│   │       └── (shadcn components live here)
│   ├── hooks/
│   │   ├── useFredData.js
│   │   └── useClaudeOutlook.js
│   ├── lib/
│   │   ├── fredApi.js
│   │   └── claudeProxy.js
│   ├── data/
│   │   └── varietyData.js
│   ├── App.jsx
│   └── main.jsx
├── worker/
│   └── index.js          ← Cloudflare Worker proxy
├── .env                  ← never committed
├── .gitignore
├── wrangler.toml         ← Cloudflare Worker config
├── README.md
└── package.json
```

---

## Design System

**Library:** shadcn/ui + Tailwind CSS
**Charts:** Recharts

**Colour logic:**
- Amber (`amber-500`) = Claude-powered / AI component — consistent across all AI outputs
- Gray = Static data / chart component
- Green = Positive / bullish signal
- Red = Negative / bearish signal

**Key shadcn components to install:**
```bash
npx shadcn@latest add card badge slider select tooltip separator progress
```

**Typography:** Use shadcn defaults — clean, readable, professional

---

## What NOT to Build in v1

- User authentication / accounts
- Saved grove profiles (session only for now)
- Push notifications
- Mobile-optimised layout (desktop first)
- Paid tiers or paywalls
- Precise price number predictions (directional outlook only — this is an intentional product decision for honesty)

---


## What This Tool Is — One Sentence

**Olive Intel reads the direction of the olive oil market before it moves — so producers and buyers make decisions, not guesses.**

---

## Competitive Landscape

No direct competitor combines:
- Free, accessible market direction signals with transparent AI reasoning
- A grower-facing yield calculator without hardware requirements
- Both the buyer and producer persona in one tool

The 2025 price collapse is the proof of concept: Spain's supply recovery was visible in public IOC harvest data months before prices moved. Nobody synthesised it into a plain-language signal for small producers and independent buyers.

Existing tools:
- **Procurement Resource / Tridge** — paywalled B2B price data, no AI reasoning, no directional narrative
- **TADIA.ai (Diego Hueltes)** — research-grade price prediction model, not consumer-facing, black-box output
- **BeHTool / Farmonaut** — enterprise agri-tech requiring hardware sensors, priced for large estates
- **OliveSuite** — social/networking for producers, no market intelligence layer

---

## The Story (for README and LinkedIn)

> "I was planning to sell olive oil. I built a brand, set up an online shop — then paused end of 2025 to focus on my job search. The season I paused into was a paradox: Kalamata had a decent local harvest, but prices dropped from €10.20 to €7.85 per kilo as supply recovered across the Mediterranean. Good yield, collapsing prices. Without visibility into what was actually driving the market, the decision to push forward or wait was a guess. This tool is built so that guess becomes a decision."

---

## 3D Olive Tree — Planned for v2

### v1 Approach
The grove calculator in v1 uses a **styled SVG olive tree illustration** as the visual centrepiece. It should:
- Animate with a gentle CSS wind sway (transform: rotate on branch elements)
- Change fruit colour and density based on selected season
- Feel intentional and designed — not a placeholder apology
- Use the same dark background / amber accent language as the dashboard

The SVG is designed as a direct swap target — when v2 ships the 3D scene, the layout around it does not change. Do NOT use a 3D library in v1 for the tree.

### v2 Vision
A live Three.js olive tree that feels like a video game prop — stylized, alive, characterful. Not archviz. Not cartoon. Twisted ancient trunk, sparse silvery canopy, small visible fruits swaying in wind.

The tree responds to grove calculator state:
- Wind intensity → sway amplitude (driven by regional weather data)
- Season → fruit colour and density (flowering / growing / harvest / winter)
- Drought stress signal → foliage opacity reduction
- Yield estimate → fruit count visible on canopy

### v2 Asset
Target model: **Marmeris Olive Tree** by Christos Marmeris (concept artist at Gameloft Barcelona)
`https://marmeris.artstation.com/store/gWnP/olive-tree`
- ~1,500 polygons — game-ready, ideal for web Three.js
- Stylized low-poly with textures baked in
- Free standard use license
- Available as OBJ, FBX, STL and native Blender file

### v2 Implementation Path
1. Download from ArtStation (free, account required)
2. Open .blend → Export as GLTF/GLB (File → Export → glTF 2.0, embed textures)
3. Place at `src/assets/olive-tree.glb`
4. Load in `OliveTreeScene.jsx` using Three.js GLTFLoader
5. Add wind via vertex shader or bone animation
6. Wire to grove calculator state (season, wind, yield, drought)

### Broader Visual Reference
AC Odyssey Mediterranean environment art — the gold standard for stylized web-weight olive trees.

### Two prototypes already built (in conversation history)
- v1 prototype: procedural geometry — too low poly, rejected
- v2 prototype: billboard foliage with canvas-drawn leaf textures — better but not quite there
- Decision: use Marmeris GLTF asset for v2, SVG illustration for v1
