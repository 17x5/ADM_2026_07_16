/**
 * DATEI: main.js
 * FUNKTION: Koordiniert das Laden der Marktdaten, die KI-Analyse und das Rendering des Fazits.
 */
async function render(data) {
  console.log("RENDER START: Daten empfangen", data);

  try {
    // 1. Marktstatus berechnen
    const status = berechneMarktStatus(data);
    
    // 2. Fazit-Texte via KI abrufen (mit Fallback-Mechanismus)
    let texte;
    try {
      if (typeof window.baueGeminiPrompt !== 'function' || typeof window.parseGeminiFazitAntwort !== 'function') {
        throw new Error("KI-Hilfsfunktionen nicht im globalen Scope gefunden.");
      }

      const prompt = window.baueGeminiPrompt(data);
      const rohAntwort = await rufeGemini(prompt);
      texte = window.parseGeminiFazitAntwort(rohAntwort);
      
      window.lastParsedFazit = texte;
      console.log("KI-Daten erfolgreich verarbeitet.");
    } catch (apiError) {
      console.error("Fehler bei der KI-Analyse, nutze Fallback:", apiError);
      texte = {
        gesamtsituation: "Analyse konnte nicht dynamisch geladen werden.",
        actions: []
      };
    }

    // 3. Fazit & Dynamische Actions rendern
    const fazitHtml = buildFazitDuForm(
        status.bfStatus, 
        status.sfColor, 
        status.welleDesc, 
        data.score, 
        data.previous_close, 
        texte.gesamtsituation, 
        texte.actions 
    );

    const container = document.getElementById('fazitInhalt');
    if (container) {
      container.innerHTML = fazitHtml;
    } else {
      console.error("Element #fazitInhalt nicht gefunden!");
    }

  } catch (error) {
    console.error("Kritischer Fehler im Render-Prozess:", error);
  }
}

async function rufeGemini(prompt) {
  if (typeof rufeGeminiAPI !== 'function') {
    throw new Error("API-Verbindungsfunktion 'rufeGeminiAPI' nicht definiert.");
  }
  return await rufeGeminiAPI(prompt); 
}

window.addEventListener('load', () => {
  console.log("Seite geladen, starte Dashboard-Datenabfrage...");
  if (typeof starteDashboard === 'function') {
    starteDashboard();
  } else {
    console.error("Funktion 'starteDashboard' nicht gefunden. Prüfe data-fetch.js");
  }
});
