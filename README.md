# Advanced Market Sentiment Cockpit (AMS Cockpit)

A single-page market sentiment cockpit that aggregates multiple financial indicators (VIX, CNN Fear & Greed, credit spreads, yield curve, MOVE index, gold/oil ratio, ETF performance) into one visual "traffic light" overview, with AI-generated situational analysis via the Gemini API.

**Live demo:** https://17x5.github.io/ADM_2026_07_16/

![Cockpit Screenshot](screenshot.png)

## Features

- Traffic-light ("Ampel") system summarizing overall market sentiment
- AI-generated market commentary (Gemini API), adjustable to three experience levels (Beginner / Advanced / Pro)
- Free-form question box to ask Gemini about the current market context
- Live indicators: VIX, CNN Fear & Greed, credit spreads, MOVE index, 10Y-2Y yield curve, gold/oil ratio, Bitcoin, personal ETF position
- Dynamic background color tied to overall sentiment state
- Fully static hosting (GitHub Pages) — no backend server required

## Tech Stack

- **Frontend:** Vanilla JavaScript, HTML, CSS — single file, no build step, no framework
- **Data pipeline:** GitHub Actions workflows fetch gold, oil, ETF, and MOVE index data on a schedule and write them to static JSON files, avoiding browser-side CORS issues
- **AI integration:** Google Gemini API, accessed through a Cloudflare Worker proxy
- **Hosting:** GitHub Pages (frontend) + Cloudflare Workers (API proxy)

## Architecture

```
Browser  →  Cloudflare Worker (holds the API key as a secret)  →  Gemini API
   ↑
   └── static JSON files (updated by scheduled GitHub Actions) for market data
```

The Gemini API key is never exposed to the client. The Cloudflare Worker validates the request origin, forwards the prompt to Gemini using a server-side secret, and returns the response. Market data that doesn't require an API key on every page load (gold, oil, ETF, MOVE) is instead pre-fetched by GitHub Actions on a schedule and served as static JSON, which keeps the site fully static while still avoiding CORS restrictions.

## Development Process

The project went through roughly 24 iterations, grouped into four phases:

1. **v1–v5 — Foundation:** basic layout, first data sources (CNN Fear & Greed, MetalpriceAPI, CoinGecko), traffic-light logic
2. **v6–v12 — API integration & stabilization:** connected all indicator APIs, debugged CORS and Gemini key format issues, built a stable baseline
3. **v13–v18 — Feature expansion:** additional indicators (MOVE index, yield curve), UI refinements, collapsible info tiles
4. **v19–v24 — Hardening:** question input feature, security incident response (see below), and structural code documentation

## Lessons Learned: API Key Exposure Incident

During operation, Google suspended the project's Cloud/API access due to abuse detected on the exposed Gemini API key, which had been stored directly in the client-side JavaScript — a common but serious mistake for static-hosted projects with no backend.

**Response:**
1. Diagnosed the issue via Google's suspension notice and confirmed the key had been scraped from the public source.
2. Revoked the compromised key.
3. Redesigned the architecture to introduce a **Cloudflare Worker as an API proxy**, so the key lives only as a server-side secret and never reaches the browser.
4. Added an origin check and CORS handling to the proxy to restrict which sites can call it.

This is the single most valuable takeaway from the project: a working demo is not the same as a secure one, and static hosting requires deliberate architectural choices to keep secrets out of client code.

## Deliberate Architecture Decision: Single-File Structure

The project intentionally remains a single `index.html` file rather than being split into modules. An attempt at modularization made iterative, AI-assisted development significantly harder to manage in practice (context fragmentation across files). Structure is instead maintained through clearly labeled sections within the file (see the `SECTION:` comments throughout `index.html`), covering config, state, rendering, Gemini integration, data fetching, and app initialization.

## Running Locally

No build step required — this is a static site.

1. Clone the repository
2. Deploy your own Cloudflare Worker proxy for the Gemini API (see `index.html`, `GEMINI_PROXY_URL`) and update the URL to point to your instance
3. Serve `index.html` with any static file server, or open it directly in a browser

## License

All rights reserved — see [LICENSE](LICENSE). This repository is shared as a work sample; viewing is welcome, reuse requires permission.

## Author

Leonardo Curcuruto © 2026, Switzerland
