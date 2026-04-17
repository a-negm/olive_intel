# Olive Intel

**Olive Intel reads the direction of the olive oil market before it moves — so producers and buyers make decisions, not guesses.**

🔗 [Live demo](https://olive-intel.ahmednegm86.workers.dev)

---

## The problem

In late 2025 I paused an olive oil business I was building. The season I paused into was a paradox: the Kalamata region had a decent local harvest, but opening prices dropped from €10.20 to €7.85/kg as supply recovered across the Mediterranean. Good yield, collapsing prices.

Without visibility into what was driving that — Spain's +42% harvest recovery, demand destruction from two years of record highs, global inventory pressure — the decision to push forward or wait was essentially a guess.

The signals were all in public data. Nobody had synthesised them into something readable.

This tool is built so that guess becomes a decision.

---

## What it does

### Market Intelligence Dashboard

A real-time dashboard for olive oil market watchers — buyers, importers, traders, and producers tracking where prices are heading.

- **Market Signals ticker** — scrolling feed of macro events (energy prices, harvest forecasts, geopolitical signals, trade policy) with AI-generated impact tags (BEARISH PRICE / BULLISH PRICE / BEARISH MARGIN / WATCH / NEUTRAL)
- **KPI strip** — global price, Jaén spot benchmark, world production, Spain harvest signal, and a directional outlook card
- **Price history chart** — global olive oil price from 2018 to present, annotated with key events (2022 drought, 2024 peak, harvest recovery)
- **Production by region** — current vs prior crop year across Spain, Italy, Greece, Tunisia, Turkey, Morocco
- **Claude Market Outlook** — AI-generated directional reasoning: key drivers, key risks, plain-language summary with sources

### Grove Calculator

A yield and revenue estimator for olive grove operators. Enter your grove's specifics and get a season estimate grounded in current market conditions.

- Location and olive variety selector (Koroneiki, Picual, Frantoio, Arbequina, Leccino, Coratina, Manzanilla)
- Tree count and age range
- Output allocation sliders (Premium EVOO / Bulk / Table olives) — auto-rebalance to 100%
- AI-generated yield range, revenue estimate, harvest timing recommendation, and input cost flags drawn from live market signals

---

## What the AI does (and doesn't do)

Claude is the **market direction reading layer**, not a price predictor. This is a deliberate product decision.

The 2025 price collapse was not a surprise in hindsight — Spain's harvest recovery was visible in public IOC data months before prices moved. A tool that synthesises those signals into a plain-language directional call is genuinely useful. A tool claiming to predict €/kg with precision would be dishonest.

**Can do:** read market direction before it moves, flag leading indicators, surface macro risks to producer margins, give growers a yield range to plan around

**Cannot do:** predict exact prices or timing, detect unreported market distortions, replace agronomic expertise

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| UI | shadcn/ui + Tailwind CSS |
| Charts | Recharts |
| AI | Anthropic Claude Haiku 4.5 |
| API proxy | Cloudflare Worker |
| Hosting | Cloudflare Workers |

The Cloudflare Worker sits between the React app and the Anthropic API — keeping the API key server-side and never exposed to the browser.

---

## Data sources

| Signal | Source | Series |
|--------|--------|--------|
| Global olive oil price | FRED / IMF | `POLVOILUSDM` |
| Jaén weekly spot price | International Olive Council | Weekly reports |
| World production forecasts | International Olive Council | Monthly PDFs |
| EU consumer price index | Eurostat HICP | Olive oil index |
| Brent crude | FRED / EIA | `DCOILBRENTEU` |
| Natural gas | FRED / EIA | `DHHNGSP` |
| Fertilizer index | World Bank Pink Sheet | Urea / DAP |
| Weather / drought | Open-Meteo | Free API |

KPI and chart data in v1 is hardcoded from verified sources (FRED, IOC) as of April 2026. Live FRED API integration is planned for v2.

---

## Running locally

```bash
git clone https://github.com/a-negm/olive_intel.git
cd olive_intel
npm install
```

Create a `.env` file:
```
ANTHROPIC_API_KEY=your_key_here
```

Start the dev server (Vite proxy handles API calls locally):
```bash
npm run dev
```

---

## Deploying

The app deploys to Cloudflare Workers via `wrangler`. Set your API key as a Worker secret:

```bash
npx wrangler secret put ANTHROPIC_API_KEY
```

Then deploy:
```bash
npm run build
npx wrangler deploy worker/index.js --assets ./dist --compatibility-date 2024-01-01
```

---

## Roadmap

**v1 (current)**
- Market intelligence dashboard with live Claude reasoning
- Grove calculator with yield and revenue estimation
- Hardcoded price/production data from verified sources

**v2 (planned)**
- Live FRED API integration for real-time price data
- Harvest stress map — Mediterranean region, colour-coded by drought/supply conditions
- 3D olive tree in the grove calculator — stylized game-prop aesthetic, responds to season and yield state
- Open-Meteo weather integration for location-specific grove conditions
- Session storage for grove profile

---

## Why this exists

Built in one day as an AI-native portfolio project — to demonstrate what product thinking looks like when Claude is the reasoning layer, not just an autocomplete.

The problem is real. The data is real. The tool is live.

---

*Built with Claude Haiku 4.5 · Powered by Cloudflare Workers · Data from FRED, IOC, Eurostat*
