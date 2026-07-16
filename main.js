async function render(data) {
  const vix = data.subs.find(s => s.key === "market_volatility_vix");
  const breadth = data.subs.find(s => s.key === "stock_price_breadth");
  const marginDebt = data.subs.find(s => s.key === "finra_margin_debt");

  const status = berechneMarktStatus(data, vix, breadth, marginDebt);

  // Kacheln rendern
  renderKachelSentiment(data, status.vixColor, status.rawVix, status.cnnColor);
  renderKachelTrend(data, status.sfColor, status.bfStatus, status.welleDesc, status.actBreadth);
  renderKachelStruktur(data);
  renderKachelRohstoffe(data);

  try {
    const prompt = baueGeminiPrompt(data, status);
    const antwortText = await rufeGemini(prompt);
    // HINWEIS: Dein Parser muss hier ein Objekt liefern: { gesamtsituation: "...", actions: [...] }
    const texte = parseGeminiFazitAntwort(antwortText);

    document.getElementById('fazitContent1').innerHTML = texte.sentiment;
    document.getElementById('fazitContent2').innerHTML = texte.trend;
    document.getElementById('fazitContent3').innerHTML = texte.struktur;
    document.getElementById('fazitContent4').innerHTML = texte.rohstoffe;
    
    // Übergabe der dynamischen Actions an die Funktion
    const fazitHtml = await buildFazitDuForm(
        status.bfStatus, status.sfColor, status.welleDesc, 
        data.score, data.previous_close, texte.gesamtsituation, 
        texte.actions // Hier kommen die KI-Actions rein!
    );
    document.getElementById('fazitInhalt').innerHTML = fazitHtml;

  } catch (err) {
    console.error("KI-Fehler, Fallback aktiv:", err);
    // ... (Hier deine Fallback-Logik mit statischen Arrays) ...
    const fallbackHtml = await buildFazitDuForm(
        status.bfStatus, status.sfColor, status.welleDesc, 
        data.score, data.previous_close, "Analyse derzeit nicht verfügbar.", 
        ["Beobachte den Markt aktiv.", "Halte Liquidität bereit."]
    );
    document.getElementById('fazitInhalt').innerHTML = fallbackHtml;
  }
}
