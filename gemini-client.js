/**
 * Haupt-Logik: Koordiniert das Laden der Marktdaten,
 * die KI-Analyse und das Rendering des Fazits.
 */
async function render(data) {
  console.log("RENDER START: Daten empfangen", data);

  try {
    // 1. Marktstatus berechnen
    const status = berechneMarktStatus(data);
    
    // 2. Fazit-Texte via KI abrufen (mit Fallback-Mechanismus)
    let texte;
    try {
      // Zugriff auf die global registrierten Funktionen aus gemini-prompts.js
      // Wir stellen sicher, dass die Funktionen im Window-Objekt vorhanden sind
      if (typeof window.baueGeminiPrompt !== 'function' || typeof window.parseGeminiFazitAntwort !== 'function') {
        throw new Error("KI-Hilfsfunktionen nicht im globalen Scope gefunden.");
      }

      const prompt = window.baueGeminiPrompt(data);
      const rohAntwort = await rufeGemini(prompt);
      texte = window.parseGeminiFazitAntwort(rohAntwort);
      
      // Globalen State für fazit.js setzen (die "Brücke")
      window.lastParsedFazit = texte;
      console.log("KI-Daten erfolgreich verarbeitet.");
    } catch (apiError) {
      console.error("Fehler bei der KI-Analyse, nutze Fallback:", apiError);
      texte = {
        gesamtsituation: "Analyse konnte nicht dynamisch geladen werden.",
        actions: [] // Fallback wird in fazit.js geladen
      };
    }

    // 3. Fazit & Dynamische Actions rendern
    // Wir übergeben texte.actions direkt; falls undefined, greift fazit.js auf window.lastParsedFazit zu
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

/**
 * Hilfsfunktion zum Aufruf der Gemini-API
 */
async function rufeGemini(prompt) {
  // Stellt sicher, dass die API-Funktion korrekt aufgerufen wird
  if (typeof rufeGeminiAPI !== 'function') {
    throw new Error("API-Verbindungsfunktion 'rufeGeminiAPI' nicht definiert.");
  }
  return await rufeGeminiAPI(prompt); 
}
