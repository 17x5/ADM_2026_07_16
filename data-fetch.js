/**
 * DATEI: data-fetch.js
 * FUNKTION: Lädt Marktdaten von externen APIs und stößt den Render-Prozess in main.js an.
 */

// Wir nutzen window.isLive, um Kollisionen mit anderen 'let isLive' Deklarationen zu vermeiden
window.isLive = false;

// Fallback-Daten für den Fehlerfall
const FALLBACK = {
  timestamp: Date.now(),
  score: 50,
  rating: "Neutral",
  previous_close: 50,
  btc_usd: 60000,
  btc_change_24h: 0,
  gold_usd: 2000,
  oil_usd: 75
};

/**
 * Lädt alle benötigten Marktdaten und startet die Analyse.
 */
async function ladeDaten() {
  const btn = document.getElementById('refreshBtn');
  const indicator = document.getElementById('statusIndicator');
  
  if (btn) btn.disabled = true;

  let btcPreis = FALLBACK.btc_usd;
  let btcAenderung = FALLBACK.btc_change_24h;

  try {
    const cryptoRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true');
    if(cryptoRes.ok) {
      const cryptoJson = await cryptoRes.json();
      if(cryptoJson.bitcoin) {
        btcPreis = cryptoJson.bitcoin.usd;
        btcAenderung = cryptoJson.bitcoin.usd_24h_change;
      }
    }
  } catch(e) {
    console.warn("Krypto-API Fehler.");
  }

  let goldPreis = FALLBACK.gold_usd;
  let oelPreis = FALLBACK.oil_usd;
  try {
    const metalRes = await fetch('https://api.metalpriceapi.com/v1/latest?api_key=9ea216f35e8e7a6bab73a5f3c04853f5&base=USD&currencies=XAU,WTI');
    if(metalRes.ok) {
      const metalJson = await metalRes.json();
      if(metalJson && metalJson.success && metalJson.rates) {
        if(metalJson.rates.XAU) goldPreis = 1 / metalJson.rates.XAU;
        if(metalJson.rates.WTI) oelPreis = 1 / metalJson.rates.WTI;
      }
    }
  } catch(e) {
    console.warn("MetalpriceAPI Fehler.");
  }

  try {
    const res = await fetch('https://production.dataviz.cnn.io/index/fearandgreed/graphdata', { headers: {'Accept':'application/json'} });
    if(!res.ok) throw new Error("CNN API nicht verfügbar");
    const json = await res.json();

    let extrahierterVixUSD = null;
    if(json.market_volatility_vix?.data?.length > 0){
      extrahierterVixUSD = json.market_volatility_vix.data[json.market_volatility_vix.data.length - 1].y;
    }

    const data = {
      timestamp: json.fear_and_greed.timestamp,
      score: json.fear_and_greed.score,
      rating: json.fear_and_greed.rating,
      previous_close: json.fear_and_greed.previous_close,
      btc_usd: btcPreis,
      btc_change_24h: btcAenderung,
      gold_usd: goldPreis,
      oil_usd: oelPreis,
      subs: [
        {key:"market_momentum_sp500", name:"Markt-Schwung", score:json.market_momentum_sp500.score},
        {key:"stock_price_strength", name:"Aktien-Stärke", score:json.stock_price_strength.score},
        {key:"stock_price_breadth", name:"Marktbreite", score:json.stock_price_breadth.score},
        {key:"put_call_options", name:"Absicherungs-Verhältnis", score:json.put_call_options.score},
        {key:"market_volatility_vix", name:"Markt-Nervosität", score:json.market_volatility_vix.score, raw_vix: extrahierterVixUSD},
        {key:"finra_margin_debt", name:"Kredit-Hebelung", score: json.fear_and_greed.score > 78 ? 85 : 35}
      ]
    };
    
    window.isLive = true;
    if (typeof render === 'function') render(data);
  } catch(err) {
    console.error("Daten-Fetch Fehler:", err);
    window.isLive = false;
    if (typeof render === 'function') render(FALLBACK);
  } finally {
    if(btn) btn.disabled = false;
  }
}

// Explizite Registrierung im globalen Window-Scope
window.starteDashboard = ladeDaten;
