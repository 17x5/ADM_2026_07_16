/**
 * Haupt-Render-Logik
 * Diese Funktion steuert den gesamten Dashboard-Aufbau.
 */
async function render(data) {
  // 1. Marktdaten-Vorbereitung
  const vix = data.subs.find(s => s.key === "market_volatility_vix");
  const breadth = data.subs.find(s => s.key === "stock_price_breadth");
  const marginDebt = data.subs.find(s => s.key === "finra_margin_debt");

  const status = berechneMarktStatus(data, vix, breadth, marginDebt);

  // 2. Kacheln (Sentiment, Trend, Struktur, Rohstoffe) rendern
  renderKachelSentiment(data, status.vixColor, status.rawVix, status.cnnColor);
  renderKachelTrend(data, status.sfColor, status.bfStatus, status.welleDesc, status.actBreadth);
  renderKachelStruktur(data);
  renderKachelRohstoffe(data);

  // 3. Dynamisches Fazit und Actions über die KI laden
  try {
    console.log("Starte KI-Datenabruf...");
    
    // Prompt-Erstellung
    const prompt = baueGeminiPrompt(data, status);
    
    // KI-Antwort abwarten
    const antwortText = await rufeGemini(prompt);
    
    // Antwort parsen (MUSS ein Objekt liefern: { gesamtsituation: "...", actions: [...] })
    const texte = parseGeminiFazitAntwort(antwortText);

    // Kachel-Texte aktualisieren
    document.getElementById('fazitContent1').innerHTML = texte.sentiment;
    document.getElementById('fazitContent2').innerHTML = texte.trend;
    document.getElementById('fazitContent3').innerHTML = texte.struktur;
    document.getElementById('fazitContent4').innerHTML = texte.rohstoffe;

    // Fazit & Dynamische Actions rendern (WICHTIG: Hier kommt die Dynamik ins Spiel)
    document.getElementById('fazitInhalt').innerHTML = buildFazitDuForm(
        status.bfStatus, 
        status.sfColor, 
        status.welleDesc, 
        data.score, 
        data.previous_close, 
        texte.gesamtsituation, 
        texte.actions // Hier werden die KI-Actions direkt übergeben
    );

    console.log("KI-Daten erfolgreich verarbeitet.");

  } catch (err) {
    console.error("Fehler beim Laden der KI-Daten:", err);
    
    // Fallback-Anzeige bei Scheitern, um das "Hängenbleiben" zu verhindern
    document.getElementById('fazitInhalt').innerHTML = `
      <div class="action-box" style="border-left-color: var(--red);">
        <h3 style="color: var(--red);">Fehler bei der KI-Analyse</h3>
        <p>Die Analyse konnte nicht dynamisch geladen werden.</p>
        <p><small>Fehler: ${err.message}</small></p>
      </div>
    `;
  }
}

// Startpunkt: Daten laden und Dashboard initialisieren
// Stelle sicher, dass ladeDaten() in deiner data-fetch.js diese Funktion aufruft.
ladeDaten();
