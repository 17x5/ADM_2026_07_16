// Baut EINEN Prompt für alle 5 Fazit-Texte und parst die JSON-Antwort von Gemini.
// -> Hier anpassen, wenn sich Ton/Länge der Texte oder die Datenpunkte im Prompt ändern sollen.

function baueGeminiPrompt(data, status) {
  const momentum = data.subs.find(s=>s.key==="market_momentum_sp500");
  const strength = data.subs.find(s=>s.key==="stock_price_strength");
  const options = data.subs.find(s=>s.key==="put_call_options");
  const marginDebt = data.subs.find(s=>s.key==="finra_margin_debt");
  const goldOelRatio = data.oil_usd > 0 ? (data.gold_usd / data.oil_usd) : 0;

  return `Du bist ein erfahrener, direkter Vermögensverwalter und schreibst kurze Fazit-Texte auf Deutsch für ein privates Börsen-Dashboard. Keine Anlageberatungs-Disclaimer, keine Einleitungsfloskeln, direkt zur Sache.

Antworte NUR mit einem gültigen JSON-Objekt, ohne Markdown-Codeblock, in genau diesem Format:
{"sentiment":"...","trend":"...","struktur":"...","rohstoffe":"...","gesamtsituation":"..."}

Jeder Text 2-4 Sätze, HTML-Formatierung erlaubt (<br><br>, <strong>).

Marktdaten:
- CNN Angst&Gier-Index: ${data.score.toFixed(0)} / 100 (Vortag ${data.previous_close.toFixed(0)})
- VIX: ${status.rawVix.toFixed(2)}
- Bitcoin: ${data.btc_usd} USD, 24h-Änderung ${data.btc_change_24h}%
- Absicherungs-Verhältnis (Put/Call): ${options ? options.score.toFixed(0) : "?"} / 100
- Markt-Schwung (S&P 500 vs. 200-Tage-Linie): ${momentum ? momentum.score.toFixed(0) : "?"} / 100
- Marktbreite (A/D-Linie): ${status.actBreadth.toFixed(0)} / 100
- Aktien-Stärke (52-Wochen-Hochs vs. Tiefs): ${strength ? strength.score.toFixed(0) : "?"} / 100
- Kredit-Hebelung (FINRA Margin Debt): ${marginDebt ? marginDebt.score.toFixed(0) : "?"} / 100
- Goldpreis: ${data.gold_usd} USD, Ölpreis (WTI): ${data.oil_usd} USD, Gold-Öl-Ratio: ${goldOelRatio.toFixed(1)}
- Modell-Status: ${status.bfStatus} (${status.welleDesc})

Bedeutung der 5 Felder:
sentiment = Kachel "Sentiment & Markt-Nervosität" (VIX, CNN-Index, Bitcoin, Absicherung)
trend = Kachel "Trend & Sicherheits-Schutz" (Ampel-Status, Markt-Schwung, A/D-Linie)
struktur = Kachel "Markt-Struktur & Liquidität" (Aktien-Stärke, Kredit-Hebelung)
rohstoffe = Kachel "Rohstoffe: Öl & Gold" (Gold-Öl-Ratio, Einzelpreise)
gesamtsituation = 2-3 Sätze Erklärung der aktuellen Gesamtlage (OHNE Statuslabel davor, das wird separat angezeigt)`;
}

function parseGeminiFazitAntwort(text) {
  const clean = text.replace(/```json|```/g, '').trim();
  const daten = JSON.parse(clean);
  const pflichtfelder = ["sentiment", "trend", "struktur", "rohstoffe", "gesamtsituation"];
  pflichtfelder.forEach(feld => {
    if (!daten[feld]) throw new Error("Gemini-Antwort unvollständig: " + feld + " fehlt");
  });
  return daten;
}
