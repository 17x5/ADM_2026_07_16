const FALLBACK = {
  timestamp: "2026-07-09T08:00:00+00:00",
  score: 42.0, 
  rating: "neutral",
  previous_close: 45.0,
  btc_usd: 64250,
  btc_change_24h: 1.25,
  gold_usd: 4032.00,
  oil_usd: 79.57,
  subs: [
    {key:"market_momentum_sp500", name:"Markt-Schwung", sub:"S&P 500 relativ zur 200-Tage-Linie", score:45.0},
    {key:"stock_price_strength", name:"Aktien-Stärke", sub:"Anzahl der 52-Wochen-Hochs vs. Tiefs", score:44.0},
    {key:"stock_price_breadth", name:"Marktbreite (A/D Basis)", sub:"Volumen steigender vs. fallender Aktien", score:23.0}, 
    {key:"put_call_options", name:"Absicherungs-Verhältnis", sub:"Put- zu Call-Optionsvolumen", score:53.0},
    {key:"market_volatility_vix", name:"Markt-Nervosität (VIX)", sub:"Implizite Volatilität S&P 500", score:58.0, raw_vix: 16.90}, 
    {key:"finra_margin_debt", name:"Kredit-Hebelung am Markt", sub:"FINRA Margin Debt Dynamik", score:45.0},
    {key:"technical_confirmation", name:"Trend-Bestätigung", sub:"Technische Verkaufserschöpfung", score:55.0}
  ]
};

let isLive = false;
