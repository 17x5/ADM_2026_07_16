/**
 * DATEI: main.js
 * FUNKTION: Koordiniert das Laden der Marktdaten, die KI-Analyse und das Rendering des Fazits.
 */
async function render(data) {
  console.log("RENDER START: Daten empfangen", data);

  try {
    // 1. Marktstatus berechnen
    if (typeof berechneMarktStatus !== 'function') {
        throw new Error("berechneMarktStatus ist nicht definiert!");
    }
    const status = berechneMarktStatus(data);
    console.log("Status berechnet:", status);
    
    // 2. Fazit-Texte via KI abrufen
    let texte;
    try {
      console.log("Starte KI-Abfrage...");
      if (typeof window.baueGeminiPrompt !== 'function' || typeof window.parseGeminiFazitAntwort !== 'function') {
        throw new Error("KI-Hilfsfunktionen nicht im globalen Scope gefunden.");
      }

      const prompt = window.baueGeminiPrompt(data);
      const rohAntwort = await rufeGemini(prompt);
      console.log("KI-Antwort erhalten, parse nun...");
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
    console.log("Starte Rendering des Fazit-HTMLs...");
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
      console.log("Rendering abgeschlossen: HTML in #fazitInhalt geschrieben.");
    } else {
      console.error("Element #fazitInhalt nicht gefunden!");
    }

  } catch (error) {
    console.error("Kritischer Fehler im Render-Prozess:", error);
    const container = document.getElementById('fazitInhalt');
    if (container) container.innerHTML = "Fehler beim Laden des Fazits. Bitte F12-Konsole prüfen.";
  }
}

async function rufeGemini(prompt) {
  if (typeof rufeGeminiAPI !== 'function') {
    throw new Error("API-Verbindungsfunktion 'rufeGeminiAPI' nicht definiert.");
  }
  return await rufeGeminiAPI(prompt); 
}

// Event-Listener mit einem kurzen Timeout, um sicherzustellen, dass alles geladen ist
window.addEventListener('load', () => {
  console.log("Seite geladen, starte Dashboard-Datenabfrage mit kurzem Delay...");
  setTimeout(() => {
    if (typeof starteDashboard === 'function') {
      starteDashboard();
    } else {
      console.error("Funktion 'starteDashboard' nicht gefunden. Prüfe data-fetch.js");
    }
  }, 500);
});
