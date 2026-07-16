// Dirigent: rendert zuerst alle Zahlen/Balken sofort,
// holt danach das Fazit und die dynamischen Actions.
async function render(data) {
  const vix = data.subs.find(s => s.key === "market_volatility_vix");
  const breadth = data.subs.find(s => s.key === "stock_price_breadth");
  const marginDebt = data.subs.find(s => s.key === "finra_margin_debt");

  const status = berechneMarktStatus(data, vix, breadth, marginDebt);

  // 1. Kacheln sofort rendern
  renderKachelSentiment(data, status.vixColor, status.rawVix, status.cnnColor);
  renderKachelTrend(data, status.sfColor, status.bfStatus, status.welleDesc, status.actBreadth);
  renderKachelStruktur(data);
  renderKachelRohstoffe(data);

  // 2. Status-Indikator setzen
  const statusIndicator = document.getElementById('statusIndicator');
  statusIndicator.className = isLive ? 'status-tag live' : 'status-tag stale';
  statusIndicator.textContent = fmtDate(data.timestamp) + (isLive ? " · Live" : " · Lokal");

  // 3. Fazit und Actions asynchron laden und einfügen
  try {
    // Zuerst den KI-Text holen
    const prompt = baueGeminiPrompt(data, status);
    const antwortText = await rufeGemini(prompt);
    const texte = parseGeminiFazitAntwort(antwortText);

    // Kachel-Texte setzen
    document.getElementById('fazitContent1').innerHTML = texte.sentiment;
    document.getElementById('fazitContent2').innerHTML = texte.trend;
    document.getElementById('fazitContent3').innerHTML = texte.struktur;
    document.getElementById('fazitContent4').innerHTML = texte.rohstoffe;
    
    // Gesamtfazit mit dynamischen Actions setzen
    const fazitHtml = await buildFazitDuForm(
        status.bfStatus, 
        status.sfColor, 
        status.welleDesc, 
        data.score, 
        data.previous_close, 
        texte.gesamtsituation
    );
    document.getElementById('fazitInhalt').innerHTML = fazitHtml;

  } catch (err) {
    console.error("Fehler beim Laden des KI-Fazits, nutze Fallback:", err);
    
    document.getElementById('fazitContent1').innerHTML = fallbackFazitSentiment(data, status.rawVix);
    document.getElementById('fazitContent2').innerHTML = fallbackFazitTrend(data, status.bfStatus, status.actBreadth);
    document.getElementById('fazitContent3').innerHTML = fallbackFazitStruktur(data);
    document.getElementById('fazitContent4').innerHTML = fallbackFazitRohstoffe(data);
    
    const fallbackHtml = await buildFazitDuForm(
        status.bfStatus, 
        status.sfColor, 
        status.welleDesc, 
        data.score, 
        data.previous_close, 
        fallbackSituationErklaerung(status.bfStatus, data.score)
    );
    document.getElementById('fazitInhalt').innerHTML = fallbackHtml;
  }
}

// Startpunkt
ladeDaten();
