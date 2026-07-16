/**
 * DATEI: main.js
 * FUNKTION: Koordiniert das Rendering und stellt sicher, dass alle globalen Funktionen geladen sind.
 */

async function render(data) {
  console.log("RENDER START: Daten empfangen", data);

  try {
    // 1. Prüfen, ob die Berechnungslogik da ist
    if (typeof window.berechneMarktStatus !== 'function') {
      throw new Error("berechneMarktStatus ist global nicht definiert!");
    }
    const status = window.berechneMarktStatus(data);
    
    // 2. KI-Analyse mit korrekter Funktionsbezeichnung 'rufeGemini'
    let texte;
    try {
      console.log("Starte KI-Abfrage...");
      // Verwende hier den in gemini-client.js definierten Funktionsnamen 'rufeGemini'
      const rohAntwort = await window.rufeGemini(window.baueGeminiPrompt(data));
      texte = window.parseGeminiFazitAntwort(rohAntwort);
    } catch (apiError) {
      console.error("Fehler bei der KI-Analyse:", apiError);
      texte = {
        gesamtsituation: "Die KI-Analyse ist aktuell nicht verfügbar.",
        actions: ["Überprüfe den Marktstatus manuell."]
      };
    }

    // 3. UI-Komponente rendern
    if (typeof window.buildFazitDuForm !== 'function') {
      throw new Error("window.buildFazitDuForm ist nicht definiert! Prüfe fazit.js");
    }

    const fazitHtml = window.buildFazitDuForm(
        status.bfStatus, status.sfColor, status.welleDesc, data.score, 
        data.previous_close, texte.gesamtsituation, texte.actions 
    );

    const container = document.getElementById('fazitInhalt');
    if (container) {
      container.innerHTML = fazitHtml;
    } else {
      console.error("Element 'fazitInhalt' nicht im DOM gefunden.");
    }
  } catch (error) {
    console.error("Kritischer Fehler im Render-Prozess:", error);
  }
}

// Globaler Wrapper für die API-Funktion, falls main.js diese erwartet
window.rufeGeminiAPI = window.rufeGemini;

window.addEventListener('load', () => {
  const checkInterval = setInterval(() => {
    // Wir prüfen nun, ob alle benötigten Abhängigkeiten geladen sind
    if (typeof window.starteDashboard === 'function' && 
        typeof window.buildFazitDuForm === 'function' &&
        typeof window.rufeGemini === 'function') {
      
      clearInterval(checkInterval);
      console.log("Alle Abhängigkeiten geladen, starte Dashboard...");
      window.starteDashboard();
    }
  }, 300);
});
