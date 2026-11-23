#!/usr/bin/env python3
"""
update_market.py – holt ALLE Marktwerte für das Cockpit und schreibt data/market.json.

Ersetzt die fünf Einzel-Workflows (ETF, Gold, Öl, MOVE, Zinskurve).
Eine Quelle darf ausfallen, die übrigen Werte bleiben erhalten.

Quellen (alle ohne Pflicht-Key):
  Yahoo Finance  → ETFs, S&P 500, MOVE, Gold, Öl, Bitcoin, Frühwarner, Bollinger
  FRED           → Zinskurve (T10Y2Y), Credit Spreads (BAMLH0A0HYM2)
                   mit Secret FRED_API_KEY über die offizielle API, sonst CSV
  CNN            → Angst & Gier inkl. aller 7 Teilindikatoren, VIX, Put/Call
"""

import csv
import io
import json
import os
import statistics
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

# ── Konfiguration ─────────────────────────────────────────────
OUT_FILE = Path("data/market.json")
TIMEOUT = 30
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                    "(KHTML, like Gecko) Chrome/130.0 Safari/537.36"}
CNN_HEADERS = {**UA, "Referer": "https://edition.cnn.com/", "Origin": "https://edition.cnn.com",
               "Accept": "application/json, text/plain, */*"}   # ohne diese Header: HTTP 418
FRED_KEY = os.environ.get("FRED_API_KEY", "").strip()

ETFS = {  # Schlüssel → Yahoo-Ticker (ISIN nur zur Dokumentation)
    "core":     {"ticker": "WRDUSW.SW", "name": "MSCI Core",         "currency": "CHF", "isin": "IE00BD4TXV59"},
    "equal":    {"ticker": "MWEQ.SW",   "name": "MSCI Equal Weight", "currency": "CHF", "isin": "IE000OEF25S1"},
    "emerging": {"ticker": "EIMI.SW",   "name": "MSCI Emerging",     "currency": "USD", "isin": "IE00BKM4GZ66"},
}
QUOTES = {  # Einzelwerte mit Vortagesvergleich
    "sp500":   "^GSPC",
    "move":    "^MOVE",
    "gold":    "GC=F",
    "oil":     "CL=F",
    "bitcoin": "BTC-USD",
}
CNN_PARTS = [  # CNN-Teilindikatoren (Score 0–100)
    "market_momentum_sp500", "stock_price_strength", "stock_price_breadth", "put_call_options",
    "market_volatility_vix", "junk_bond_demand", "safe_haven_demand",
]
BOLLINGER_TICKER = "SWDA.L"
SMA_DAYS = 50
BB_DAYS, BB_STD = 20, 2


# ── Hilfsfunktionen ───────────────────────────────────────────
def get(url: str, headers: dict = UA, retries: int = 2) -> bytes:
    for attempt in range(retries + 1):
        try:
            with urlopen(Request(url, headers=headers), timeout=TIMEOUT) as r:
                return r.read()
        except Exception:
            if attempt == retries:
                raise


def safe(fn, label: str, errors: list):
    try:
        return fn()
    except Exception as e:
        errors.append(f"{label}: {e}")
        return None


def rnd(x, n=2):
    return None if x is None else round(float(x), n)


def yahoo_closes(ticker: str, rng: str = "6mo") -> list[tuple[str, float]]:
    """[(Datum, Schluss)] aufsteigend. Der letzte Wert kann ein Intraday-Kurs sein."""
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}?range={rng}&interval=1d"
    res = json.loads(get(url))["chart"]["result"][0]
    rows = []
    for ts, c in zip(res["timestamp"], res["indicators"]["quote"][0]["close"]):
        if c is not None:
            rows.append((datetime.fromtimestamp(ts, timezone.utc).date().isoformat(), float(c)))
    return rows


def last_prev(ticker: str, digits: int = 2) -> dict:
    rows = yahoo_closes(ticker, "1mo")
    last, prev = rows[-1][1], rows[-2][1]
    return {"value": rnd(last, digits), "prev": rnd(prev, digits),
            "changePct": rnd((last / prev - 1) * 100, 2), "date": rows[-1][0]}


def fred_series(series_id: str, n: int = 80) -> list[tuple[str, float]]:
    """[(Datum, Wert)] aufsteigend. Offizielle API mit Key, sonst CSV-Export."""
    if FRED_KEY:
        url = ("https://api.stlouisfed.org/fred/series/observations"
               f"?series_id={series_id}&api_key={FRED_KEY}&file_type=json&sort_order=desc&limit={n}")
        obs = json.loads(get(url))["observations"]
        vals = [(o["date"], float(o["value"])) for o in obs if o["value"] not in (".", "")]
        return list(reversed(vals))
    raw = get(f"https://fred.stlouisfed.org/graph/fredgraph.csv?id={series_id}").decode()
    vals = [(r[0], float(r[1])) for r in list(csv.reader(io.StringIO(raw)))[1:] if r[1] not in (".", "")]
    return vals[-n:]


def sma(values: list[float], n: int) -> float:
    return sum(values[-n:]) / n


# ── Datenquellen ──────────────────────────────────────────────
def load_etfs() -> dict:
    out = {}
    for key, cfg in ETFS.items():
        q = last_prev(cfg["ticker"], 3)
        out[key] = {"name": cfg["name"], "currency": cfg["currency"],
                    "price": q["value"], "prevClose": q["prev"], "changePct": q["changePct"]}
    return out


def load_quotes() -> dict:
    return {key: last_prev(ticker) for key, ticker in QUOTES.items()}


def load_rates() -> dict:
    zk = fred_series("T10Y2Y", 10)
    hy = fred_series("BAMLH0A0HYM2", 80)
    return {
        "yieldCurve": {"value": zk[-1][1], "prev": zk[-2][1], "date": zk[-1][0]},
        "hySpread": {"value": hy[-1][1], "prev": hy[-2][1], "date": hy[-1][0],
                     "sma50": rnd(sma([v for _, v in hy], SMA_DAYS), 3)},
    }


def load_fruehwarner(rates: dict | None) -> dict:
    """Frühwarner: fallen Small Caps und der breite Markt UNTER ihren 50-Tage-Schnitt?
    Absolut gemessen (nicht im Vergleich zum S&P 500), damit ein breiter Absturz sicher erkannt wird."""
    def trend_signal(ticker: str) -> dict:
        c = [v for _, v in yahoo_closes(ticker)]
        avg = sma(c, SMA_DAYS)
        return {"price": rnd(c[-1]), "sma50": rnd(avg), "diffPct": rnd((c[-1] / avg - 1) * 100, 2), "red": c[-1] < avg}

    out = {"smallCaps": trend_signal("IWM"),   # Russell 2000
           "breadth": trend_signal("RSP")}     # S&P 500 gleichgewichtet = breiter Markt
    if rates:
        hy = rates["hySpread"]
        out["credit"] = {"value": hy["value"], "sma50": hy["sma50"], "red": hy["value"] > hy["sma50"]}
    return out


def load_cnn() -> dict:
    data = json.loads(get("https://production.dataviz.cnn.io/index/fearandgreed/graphdata", CNN_HEADERS))

    def last_and_prev_day(key):
        """Aktueller Wert und Wert des vorherigen Handelstags (Intraday-Duplikate überspringen)."""
        pts = data[key]["data"]
        day = lambda p: datetime.fromtimestamp(p["x"] / 1000, timezone.utc).date()
        prev = next((p for p in reversed(pts[:-1]) if day(p) < day(pts[-1])), pts[-2])
        return pts[-1]["y"], prev["y"]

    fg = data["fear_and_greed"]
    per_day = {}   # ein Wert pro Tag (Intraday-Duplikate zusammenfassen)
    for p in data["fear_and_greed_historical"]["data"]:
        per_day[datetime.fromtimestamp(p["x"] / 1000, timezone.utc).date()] = p["y"]
    hist = [per_day[d] for d in sorted(per_day)]
    vix, vix_prev = last_and_prev_day("market_volatility_vix")
    pc, pc_prev = last_and_prev_day("put_call_options")
    return {
        "fearGreed": {"value": rnd(fg["score"], 1), "prev": rnd(fg["previous_close"], 1),
                      "week": rnd(fg["previous_1_week"], 1), "rating": fg["rating"]},
        "vix": {"value": rnd(vix), "prev": rnd(vix_prev)},
        "putCall": {"value": rnd(pc, 3), "prev": rnd(pc_prev, 3)},
        "parts": {k: {"score": rnd(data[k]["score"], 1), "rating": data[k]["rating"]} for k in CNN_PARTS},
        "fearGreedHistory": [rnd(v, 1) for v in hist[-15:]],   # für den Erholungs-Radar
    }


def bands(closes: list[float]) -> tuple[float, float, float]:
    win = closes[-BB_DAYS:]
    mid, sd = statistics.fmean(win), statistics.pstdev(win)
    return mid + BB_STD * sd, mid, mid - BB_STD * sd


def load_bollinger() -> dict:
    closes = [c for _, c in yahoo_closes(BOLLINGER_TICKER, "3mo")]
    upper, mid, lower = bands(closes)
    last = closes[-1]
    # Lag der Kurs in den letzten 5 Tagen unter dem unteren Band und ist jetzt wieder darüber?
    was_below = any(closes[-i] < bands(closes[:len(closes) - i + 1])[2] for i in range(2, 7))
    return {"ticker": BOLLINGER_TICKER, "price": rnd(last), "upper": rnd(upper), "middle": rnd(mid),
            "lower": rnd(lower), "percentB": rnd((last - lower) / (upper - lower), 3) if upper != lower else 0.5,
            "bandwidthPct": rnd((upper - lower) / mid * 100),
            "returnedIntoBand": was_below and last > lower}


def load_erholung(sentiment: dict | None, rates: dict | None) -> dict:
    """Erholungs-Radar: drei Anzeichen, dass die Panik nachlässt (Gegenstück zum Frühwarner)."""
    out = {}
    if sentiment:
        hist = sentiment["fearGreedHistory"]
        now, prev, min10 = hist[-1], hist[-2], min(hist[-11:-1])
        out["fearTurn"] = {"value": now, "min10": min10, "green": min10 < 25 and now > 25 and now > prev}
    vix, vix3m = last_prev("^VIX")["value"], last_prev("^VIX3M")["value"]
    out["vixCurve"] = {"vix": vix, "vix3m": vix3m, "green": vix < vix3m}
    if rates:
        hy = fred_series("BAMLH0A0HYM2", 15)
        vals = [v for _, v in hy]
        out["credit"] = {"value": vals[-1], "sma10": rnd(sma(vals, 10), 3), "green": vals[-1] < sma(vals, 10)}
    return out


# ── Hauptprogramm ─────────────────────────────────────────────
def main() -> int:
    errors: list[str] = []
    rates = safe(load_rates, "FRED", errors)
    sentiment = safe(load_cnn, "CNN", errors)
    result = {
        "updated": datetime.now(timezone.utc).isoformat(timespec="minutes"),
        "sentiment": sentiment,
        "quotes": safe(load_quotes, "Kurse", errors),
        "rates": rates,
        "etfs": safe(load_etfs, "ETFs", errors),
        "fruehwarner": safe(lambda: load_fruehwarner(rates), "Frühwarner", errors),
        "bollinger": safe(load_bollinger, "Bollinger", errors),
        "erholung": safe(lambda: load_erholung(sentiment, rates), "Erholung", errors),
        "errors": errors,
    }
    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUT_FILE.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))
    sections = ("sentiment", "quotes", "rates", "etfs", "fruehwarner", "bollinger", "erholung")
    return 1 if all(result[k] is None for k in sections) else 0


if __name__ == "__main__":
    sys.exit(main())
