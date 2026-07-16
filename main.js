/**
 * DATEI: main.js
 * FUNKTION: Koordiniert das Laden der Marktdaten, die KI-Analyse und das Rendering.
 */

async function render(data) {
  console.log("RENDER START: Daten empfangen", data);

  try {
    // 1. Marktstatus berechnen
    if (typeof berechneMarktStatus !== 'function') {
      throw new Error("berechneMarktStatus ist nicht definiert!");
    }
    const status = berechneMarktStatus(data);
    
    // 2. KI-Fazit abrufen (mit Timeout-Absicherung)
    let texte;
    try {
      console.log("Starte KI-Abfrage...");
      
      // Promise.race sorgt dafür, dass wir nicht ewig warten, wenn Gemini hängt
      const kiAbfrage = rufeGemini(window.baueGeminiPrompt(data));
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout bei KI-Abfrage")), 8000)
      );
      
      const rohAntwort = await Promise.race([kiAbfrage, timeout]);
      texte = window.parseGeminiFazitAntwort(rohAntwort);
      console.log("KI-Daten erfolgreich verarbeitet.");
      
    } catch (apiError) {
      console.error("Fehler oder Timeout bei der KI-Analyse, nutze Fallback:", apiError);
      texte = {
        gesamtsituation: "Die KI-Analyse ist aktuell nicht verfügbar. Bitte lade die Seite später neu.",
        actions: ["Überprüfe den Marktstatus manuell.", "Aktualisiere die Seite für einen neuen Versuch."]
      };
    }

    // 3. Rendering des Fazits
    console.log("Starte Rendering...");
    const fazitHtml = window.buildFazitDuForm(
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
      console.log("Rendering erfolgreich abgeschlossen.");
    }

  } catch (error) {
    console.error("Kritischer Fehler im Render-Prozess:", error);
  }
}

// Hilfsfunktion: Aufruf der globalen Gemini-Funktion
async function rufeGemini(prompt) {
  if (typeof window.rufeGeminiAPI !== 'function') {
    throw new Error("rufeGeminiAPI ist nicht global verfügbar.");
  }
  return await window.rufeGeminiAPI(prompt); 
}

// Sicherer Start-Trigger
window.addEventListener('load', () => {
  console.log("Seite geladen, warte auf Datenabfrage...");
  setTimeout(() => {
    if (typeof window.starteDashboard === 'function') {
      window.starteDashboard();
    } else {
      console.error("FEHLER: 'starteDashboard' ist immer noch nicht global verfügbar.");
    }
  }, 1000);
});
