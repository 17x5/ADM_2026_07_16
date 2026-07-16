// Dirigent: rendert zuerst alle Zahlen/Balken sofort (schnell, ohne Warten),
// holt danach mit EINEM Gemini-Call alle 5 Fazit-Texte nach.
// Schlägt Gemini fehl (kein Netz, Rate-Limit, ungültiger Key) -> Fallback-Texte je Kachel.
async function render(data){
  const vix = data.subs.find(s=>s.key==="market_volatility_vix");
  const breadth = data.subs.find(s=>s.key==="stock_price_breadth");
  const marginDebt = data.subs.find(s=>s.key==="finra_margin_debt");

  const status = berechneMarktStatus(data, vix, breadth, marginDebt);

  renderKachelSentiment(data, status.vixColor, status.rawVix, status.cnnColor);
  renderKachelTrend(data, status.sfColor, status.bfStatus, status.welleDesc, status.actBreadth);
  renderKachelStruktur(data);
  renderKachelRohstoffe(data);

  document.getElementById('fazitInhalt').innerHTML = buildFazitDuForm(status.bfStatus, status.sfColor, status.welleDesc, data.score, data.previous_close, "Analysiere…");

  const statusIndicator = document.getElementById('statusIndicator');
  statusIndicator.className = isLive ? 'status-tag live' : 'status-tag stale';
  statusIndicator.textContent = fmtDate(data.timestamp) + (isLive ? " · Live" : " · Lokal");

  try {
    const prompt = baueGeminiPrompt(data, status);
    const antwortText = await rufeGemini(prompt);
    const texte = parseGeminiFazitAntwort(antwortText);

    document.getElementById('fazitContent1').innerHTML = texte.sentiment;
    document.getElementById('fazitContent2').innerHTML = texte.trend;
    document.getElementById('fazitContent3').innerHTML = texte.struktur;
    document.getElementById('fazitContent4').innerHTML = texte.rohstoffe;
    document.getElementById('fazitInhalt').innerHTML = buildFazitDuForm(status.bfStatus, status.sfColor, status.welleDesc, data.score, data.previous_close, texte.gesamtsituation);
  } catch(err) {
    console.log("Gemini nicht erreichbar, verwende Fallback-Texte.", err);
    document.getElementById('fazitContent1').innerHTML = fallbackFazitSentiment(data, status.rawVix);
    document.getElementById('fazitContent2').innerHTML = fallbackFazitTrend(data, status.bfStatus, status.actBreadth);
    document.getElementById('fazitContent3').innerHTML = fallbackFazitStruktur(data);
    document.getElementById('fazitContent4').innerHTML = fallbackFazitRohstoffe(data);
    document.getElementById('fazitInhalt').innerHTML = buildFazitDuForm(status.bfStatus, status.sfColor, status.welleDesc, data.score, data.previous_close, fallbackSituationErklaerung(status.bfStatus, data.score));
  }
}

ladeDaten();
