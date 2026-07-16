// Kachel 2: Trend & Sicherheits-Schutz (Ampel-Status, Markt-Schwung, A/D-Linie)
// -> Hier anpassen, wenn sich diese 3 Zeilen ändern sollen. Fazit-Text kommt jetzt von Gemini,
//    fallbackFazitTrend() ist die Notlösung falls die API mal nicht antwortet.
function renderKachelTrend(data, sfColor, bfStatus, welleDesc, actBreadth) {
  let html = "";
  let sfPercent = sfColor === 'gruen' ? 100 : (sfColor === 'purple' ? 85 : (sfColor === 'gelb' ? 45 : 15));
  html += buildQuickRowHTML(sfColor, "Sicherheits-Ampel & Markttrend", `Modell 9iof2PC9 &bull; ${welleDesc}`, sfPercent, bfStatus);

  let momentum = data.subs.find(s=>s.key==="market_momentum_sp500");
  let momScore = momentum ? momentum.score : 50;
  let momColor = momScore < 35 ? "rot" : (momScore > 75 ? "purple" : "gruen");
  html += buildQuickRowHTML(momColor, "Markt-Schwung", "S&P 500 relativ zur 200-Tage-Linie", momScore, momScore.toFixed(0) + " / 100");

  html += buildQuickRowHTML(actBreadth < 35 ? "rot" : (actBreadth < 50 ? "gelb" : "gruen"), "Advance-Decline-Linie (A/D-Linie)", "Das fundamentale Verhältnis von steigenden zu fallenden Aktien", actBreadth, actBreadth.toFixed(0) + " / 100");
  document.getElementById('rowsSection2').innerHTML = html;
  document.getElementById('fazitContent2').innerHTML = "Analysiere…";
}

function fallbackFazitTrend(data, bfStatus, actBreadth) {
  let momentum = data.subs.find(s=>s.key==="market_momentum_sp500");
  let momScore = momentum ? momentum.score : 50;

  return `
    Aktueller Modellstatus ist **${bfStatus}**. Der Markt-Schwung hält sich rechnerisch bei **${momScore.toFixed(0)} Punkten**, was optisch stabil aussieht. 
    <br><br>
    Die kritische Schwachstelle liegt bei der **Marktbreite (A/D-Linie), die mit ${actBreadth.toFixed(0)} / 100 Punkten** tief im Keller festsitzt. 
    <br><br>
    <span style="color:var(--red); font-weight:bold;">⚠️ Risikocheck:</span> 
    Wenn die großen Indizes steigen oder seitwärts laufen, aber die Marktbreite so extrem schwach ist wie jetzt, bedeutet das: Nur noch eine Handvoll Tech-Giganten schleppt den Markt nach oben. Der Rest der Aktien stürzt bereits ab. Das ist das klassische Bild einer ungesunden Rallye, der die Puste ausgeht.
  `;
}
