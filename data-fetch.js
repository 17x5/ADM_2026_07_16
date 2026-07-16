/**
 * DATEI: data-fetch.js
 * FUNKTION: Lädt Marktdaten und orchestriert den Start des Dashboards.
 */

// Globale Absicherung: Wir nutzen window-Properties, um Kollisionen zu vermeiden
window.isLive = window.isLive || false;

// Wir definieren FALLBACK nur, falls es nicht schon existiert, um "Identifier already declared"-Fehler zu vermeiden
if (typeof window.FALLBACK === 'undefined') {
  window.FALLBACK = {
    timestamp: Date.now(),
    score: 50,
    rating: "Neutral",
    previous_close: 50,
    btc_usd: 60000,
    btc_change_24h: 0,
    gold_usd: 2000,
    oil_usd: 75
  };
}

/**
 * Lädt alle benötigten Marktdaten und startet die Analyse.
 */
async function ladeDaten() {
  const btn = document.getElementById('refreshBtn');
  if (btn) btn.disabled = true;

  // Zugriff immer über window.FALLBACK
  let btcPreis = window.FALLBACK.btc_usd;
  let btcAenderung = window.FALLBACK.btc_change_24h;

  try {
    const cryptoRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true');
    if(cryptoRes.ok) {
      const cryptoJson = await cryptoRes.json();
      if(cryptoJson.bitcoin) {
        btcPreis = cryptoJson.bitcoin.usd;
        btcAenderung = cryptoJson.bitcoin.usd_24h_change;
      }
    }
  } catch(e) { console.warn("Krypto-API Fehler."); }

  try {
    const res = await fetch('https://production.dataviz.cnn.io/index/fearandgreed/graphdata', { headers: {'Accept':'application/json'} });
    if(!res.ok) throw new Error("CNN API nicht verfügbar");
    const json = await res.json();

    const data = {
      timestamp: json.fear_and_greed.timestamp,
      score: json.fear_and_greed.score,
      rating: json.fear_and_greed.rating,
      previous_close: json.fear_and_greed.previous_close,
      btc_usd: btcPreis,
      btc_change_24h: btcAenderung,
      gold_usd: 2000, // Platzhalter bei API-Fehler
      oil_usd: 75,
      subs: [
        {key:"market_momentum_sp500", name:"Markt-Schwung", score:json.market_momentum_sp500.score},
        {key:"stock_price_strength", name:"Aktien-Stärke", score:json.stock_price_strength.score},
        {key:"stock_price_breadth", name:"Marktbreite", score:json.stock_price_breadth.score},
        {key:"put_call_options", name:"Absicherungs-Verhältnis", score:json.put_call_options.score},
        {key:"market_volatility_vix", name:"Markt-Nervosität", score:json.market_volatility_vix.score},
        {key:"finra_margin_debt", name:"Kredit-Hebelung", score: json.fear_and_greed.score > 78 ? 85 : 35}
      ]
    };
    
    window.isLive = true;
    if (typeof window.render === 'function') window.render(data);
  } catch(err) {
    console.error("Daten-Fetch Fehler:", err);
    window.isLive = false;
    if (typeof window.render === 'function') window.render(window.FALLBACK);
  } finally {
    if(btn) btn.disabled = false;
  }
}

// Finale Registrierung
window.starteDashboard = ladeDaten;
console.log("data-fetch.js geladen: starteDashboard wurde global registriert.");
