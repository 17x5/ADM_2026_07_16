async function render(data) {
  const status = berechneMarktStatus(data, 
    data.subs.find(s=>s.key==="market_volatility_vix"), 
    data.subs.find(s=>s.key==="stock_price_breadth"), 
    data.subs.find(s=>s.key==="finra_margin_debt")
  );

  // Kacheln rendern
  renderKachelSentiment(data, status.vixColor, status.rawVix, status.cnnColor);
  renderKachelTrend(data, status.sfColor, status.bfStatus, status.welleDesc, status.actBreadth);
  renderKachelStruktur(data);
  renderKachelRohstoffe(data);

  try {
    // 1. KI-Prompt aufrufen
    const prompt = baueGeminiPrompt(data, status);
    const antwortText = await rufeGemini(prompt);
    
    // 2. Parser aufrufen (Muss ein Objekt mit {gesamtsituation, actions} liefern)
    const texte = parseGeminiFazitAntwort(antwortText);

    document.getElementById('fazitContent1').innerHTML = texte.sentiment;
    document.getElementById('fazitContent2').innerHTML = texte.trend;
    document.getElementById('fazitContent3').innerHTML = texte.struktur;
    document.getElementById('fazitContent4').innerHTML = texte.rohstoffe;

    // 3. Dynamisch rendern
    document.getElementById('fazitInhalt').innerHTML = buildFazitDuForm(
        status.bfStatus, status.sfColor, status.welleDesc, 
        data.score, data.previous_close, texte.gesamtsituation, texte.actions 
    );
    
  } catch (err) {
    console.error("Render-Fehler:", err);
    // Wenn KI-Daten fehlen, wird die Box informativ gefüllt
    document.getElementById('fazitInhalt').innerHTML = `
      <div class="action-box" style="border-left-color:red;">
        <h3>Analyse-Fehler</h3>
        <p>Die KI konnte keine dynamischen Actions liefern. Prüfe den Parser.</p>
        <p><small>Fehler-Info: ${err.message}</small></p>
      </div>`;
  }
}
