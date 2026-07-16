async function render(data) {
  const vix = data.subs.find(s => s.key === "market_volatility_vix");
  const breadth = data.subs.find(s => s.key === "stock_price_breadth");
  const marginDebt = data.subs.find(s => s.key === "finra_margin_debt");

  const status = berechneMarktStatus(data, vix, breadth, marginDebt);

  renderKachelSentiment(data, status.vixColor, status.rawVix, status.cnnColor);
  renderKachelTrend(data, status.sfColor, status.bfStatus, status.welleDesc, status.actBreadth);
  renderKachelStruktur(data);
  renderKachelRohstoffe(data);

  try {
    const prompt = baueGeminiPrompt(data, status);
    const antwortText = await rufeGemini(prompt);
    const texte = parseGeminiFazitAntwort(antwortText);

    document.getElementById('fazitContent1').innerHTML = texte.sentiment;
    document.getElementById('fazitContent2').innerHTML = texte.trend;
    document.getElementById('fazitContent3').innerHTML = texte.struktur;
    document.getElementById('fazitContent4').innerHTML = texte.rohstoffe;
    
    // WICHTIG: Hier das await, da buildFazitDuForm nun async ist
    const fazitHtml = await buildFazitDuForm(status.bfStatus, status.sfColor, status.welleDesc, data.score, data.previous_close, texte.gesamtsituation);
    document.getElementById('fazitInhalt').innerHTML = fazitHtml;

  } catch (err) {
    console.error("Fehler:", err);
    document.getElementById('fazitContent1').innerHTML = fallbackFazitSentiment(data, status.rawVix);
    document.getElementById('fazitContent2').innerHTML = fallbackFazitTrend(data, status.bfStatus, status.actBreadth);
    document.getElementById('fazitContent3').innerHTML = fallbackFazitStruktur(data);
    document.getElementById('fazitContent4').innerHTML = fallbackFazitRohstoffe(data);
    
    const fallbackHtml = await buildFazitDuForm(status.bfStatus, status.sfColor, status.welleDesc, data.score, data.previous_close, "Marktlage wird analysiert...");
    document.getElementById('fazitInhalt').innerHTML = fallbackHtml;
  }
}
