// Kachel 3: Markt-Struktur & Liquidität (Aktien-Stärke, Kredit-Hebelung)
// -> Hier anpassen, wenn sich diese 2 Zeilen ändern sollen. Fazit-Text kommt jetzt von Gemini,
//    fallbackFazitStruktur() ist die Notlösung falls die API mal nicht antwortet.
function renderKachelStruktur(data) {
  let html = "";
  let strength = data.subs.find(s=>s.key==="stock_price_strength");
  let strScore = strength ? strength.score : 50;
  let strColor = strScore < 35 ? "rot" : (strScore > 75 ? "gruen" : "gelb");
  html += buildQuickRowHTML(strColor, "Aktien-Stärke", "Anzahl der 52-Wochen-Hochs vs. Tiefs am Markt", strScore, strScore.toFixed(0) + " / 100");

  let marginDebt = data.subs.find(s=>s.key==="finra_margin_debt");
  let debtScore = marginDebt ? marginDebt.score : 50;
  let debtColor = "gruen";
  let debtDisplayPercent = 100 - debtScore;

  if (debtScore > 75) {
    debtColor = "rot";
  } else if (debtScore > 50) {
    debtColor = "gelb";
  }
  html += buildQuickRowHTML(debtColor, "Kredit-Hebelung am Markt", "Aktienkäufe mit geliehenem Geld (FINRA)", debtDisplayPercent, debtScore.toFixed(0) + " / 100");
  document.getElementById('rowsSection3').innerHTML = html;
  document.getElementById('fazitContent3').innerHTML = "Analysiere…";
}

function fallbackFazitStruktur(data) {
  let strength = data.subs.find(s=>s.key==="stock_price_strength");
  let strScore = strength ? strength.score : 50;
  let marginDebt = data.subs.find(s=>s.key==="finra_margin_debt");
  let debtScore = marginDebt ? marginDebt.score : 50;
  let debtColor = debtScore > 75 ? "rot" : (debtScore > 50 ? "gelb" : "gruen");

  return `
    Das innere Fundament zeigt bei der **Aktien-Stärke einen Wert von ${strScore.toFixed(0)} von 100**. Das Verhältnis von neuen Höchstständen zu Tiefständen ist damit fragil. 
    <br><br>
    Die **Kredit-Hebelung liegt bei ${debtScore.toFixed(0)} / 100**. Da das Risiko hier invertiert berechnet wird, bedeutet der Wert von ${debtScore.toFixed(0)}, dass das Risiko aktuell im **${debtColor === 'gruen' ? 'sicheren' : 'erhöhten'} Bereich** liegt. 
    <br><br>
    <span style="color:var(--accent); font-weight:bold;">⚙️ Hintergrund-Struktur:</span> 
    Die Kombination aus schwacher innerer Aktien-Stärke bei gleichzeitig ${debtColor === 'gruen' ? 'unaufgeregter' : 'hoher'} Hebelung zeigt, dass große institutionelle Gelder unbemerkt Positionen abbauen, während Privatanleger teilweise noch investiert bleiben. Ein Zustand, der erhöhte Wachsamkeit verlangt.
  `;
}
