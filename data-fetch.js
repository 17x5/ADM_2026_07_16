/**
 * DATEI: data-fetch.js
 * FUNKTION: Lädt Marktdaten und startet das Dashboard.
 */

async function ladeDaten() {
  console.log("Starte Daten-Fetch...");
  
  try {
    const res = await fetch('https://production.dataviz.cnn.io/index/fearandgreed/graphdata', { headers: {'Accept':'application/json'} });
    const json = await res.json();

    const data = {
      timestamp: json.fear_and_greed.timestamp,
      score: json.fear_and_greed.score,
      rating: json.fear_and_greed.rating,
      previous_close: json.fear_and_greed.previous_close,
      btc_usd: 64500, // Platzhalter, hier kannst du deine API-Logik einfügen
      btc_change_24h: 0.5,
      subs: []
    };
    
    if (typeof window.render === 'function') window.render(data);
  } catch(err) {
    console.error("Daten-Fetch Fehler:", err);
  }
}

window.starteDashboard = ladeDaten;
console.log("data-fetch.js: starteDashboard registriert.");
