// Kachel 1: Sentiment & Markt-Nervosität (VIX, CNN-Index, Bitcoin, Absicherung)
// -> Hier anpassen, wenn sich diese 4 Zeilen ändern sollen. Fazit-Text kommt jetzt von Gemini,
//    fallbackFazitSentiment() ist die Notlösung falls die API mal nicht antwortet.
function renderKachelSentiment(data, vixColor, rawVix, cnnColor) {
  let html = "";
  let vixBarPercent = Math.min(100, Math.max(0, ((rawVix - 10) / 30) * 100));
  html += buildQuickRowHTML(vixColor, "Markt-Nervosität (VIX)", "Schwankungsbreite und implizite Angstkomponente des Aktienmarktes", vixBarPercent, rawVix.toFixed(2) + " USD");
  html += buildQuickRowHTML(cnnColor, "Angst & Gier Index (CNN)", "Aggregiertes Sentiment aus 7 Marktindikatoren", data.score, data.score.toFixed(0) + " / 100");

  let btcChange = data.btc_change_24h || 0;
  let btcColor = btcChange > 2 ? "gruen" : (btcChange < -2 ? "rot" : "orange");
  let btcBarPercent = Math.min(100, Math.max(0, 50 + btcChange * 5));
  let formattedBtcPrice = new Intl.NumberFormat('de-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(data.btc_usd);
  html += buildQuickRowHTML(btcColor, "Bitcoin (BTC/USD)", "Spekulativer Liquiditäts- & Risk-On-Fiebermesser", btcBarPercent, formattedBtcPrice);

  let options = data.subs.find(s=>s.key==="put_call_options");
  let optScore = options ? options.score : 50;
  let optColor = optScore > 75 ? "rot" : (optScore < 35 ? "gruen" : "gelb");
  html += buildQuickRowHTML(optColor, "Absicherungs-Verhältnis", "Put- zu Call-Optionsvolumen an den Terminbörsen", optScore, optScore.toFixed(0) + " / 100");

  document.getElementById('rowsSection1').innerHTML = html;
  document.getElementById('fazitContent1').innerHTML = "Analysiere…";
}

function fallbackFazitSentiment(data, rawVix) {
  let options = data.subs.find(s=>s.key==="put_call_options");
  let optScore = options ? options.score : 50;
  let btcChange = data.btc_change_24h || 0;
  let formattedBtcPrice = new Intl.NumberFormat('de-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(data.btc_usd);

  return `
    Der **CNN-Index steht neutral bei ${data.score.toFixed(0)}** von 100 Punkten. Das bedeutet, an den großen Börsen herrscht aktuell weder nackte Panik noch blinde Euphorie. Die Optionen-Absicherung ist mit **${optScore.toFixed(0)} Punkten** unaufgeregt und der VIX zeigt mit **${rawVix.toFixed(2)} USD** ein normales, leicht unruhiges Grundrauschen. 
    <br><br>
    Interessant wird es bei Bitcoin (**${formattedBtcPrice}**, ${btcChange >= 0 ? '+' : ''}${btcChange.toFixed(2)}% in 24h): Krypto ist der empfindlichste "Fiebermesser" für freies Geld im System. 
    <br><br>
    <span style="color:var(--orange); font-weight:bold;">💡 Warum das für dich wichtig ist:</span> 
    Krypto-Märkte hängen zu 100% am Tropf der weltweiten Dollar-Liquidität. Große Profi-Anleger (TradFi) ziehen ihr Geld bei aufziehendem Gewitter meistens *zuerst* aus den riskantesten, spekulativsten Ecken ab – und das ist Bitcoin. Wenn Bitcoin also plötzlich ohne News oder klaren Grund einbricht, ist das oft das erste Warnsignal, dass den großen Jungs im Hintergrund das Geld knapp wird. Kurze Zeit später erwischt es dann meistens auch den normalen Aktienmarkt.
  `;
}
