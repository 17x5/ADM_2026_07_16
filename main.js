/**
 * DATEI: main.js
 * FUNKTION: Koordiniert den Start des Dashboards und wartet auf alle Modul-Abhängigkeiten.
 */

async function render(data) {
  console.log("RENDER START: Daten empfangen", data);

  try {
    // 1. Prüfen, ob die Berechnungslogik (aus einer anderen Datei) da ist
    if (typeof window.berechneMarktStatus !== 'function') {
      throw new Error("window.berechneMarktStatus ist nicht definiert!");
    }
    const status = window.berechneMarktStatus(data);
    
    // 2. KI-Analyse durchführen
    let texte;
    try {
      console.log("Starte KI-Abfrage...");
      // Die Funktionen kommen aus gemini-client.js und gemini-prompts.js
      const prompt = window.baueGeminiPrompt(data);
      // Hier wird die globale Funktion aus gemini-client.js korrekt aufgerufen
      const rohAntwort = await window.rufeGemini(prompt);
      texte = window.parseGeminiFazitAntwort(rohAntwort);
      console.log("KI-Analyse erfolgreich erhalten und geparst.");
    } catch (apiError) {
      console.error("Fehler bei der KI-Analyse:", apiError);
      texte = { 
        gesamtsituation: "Die KI-Analyse ist aktuell nicht verfügbar.", 
        actions: ["Überprüfe die API-Verbindung.", "Manuelle Prüfung empfohlen."] 
      };
    }

    // 3. UI rendern (aus fazit.js)
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
      console.log("Rendering erfolgreich abgeschlossen.");
    } else {
      console.error("Element 'fazitInhalt' nicht im DOM gefunden.");
    }
  } catch (error) {
    console.error("Kritischer Fehler im Render-Prozess:", error);
  }
}

// Global für externe Aufrufe registrieren
window.render = render;

// Warteraum für alle Abhängigkeiten:
// Erst wenn alle globalen Funktionen vorhanden sind, wird das Dashboard gestartet.
window.addEventListener('load', () => {
  const checkInterval = setInterval(() => {
    const allesDa = (
        typeof window.starteDashboard === 'function' && 
        typeof window.buildFazitDuForm === 'function' &&
        typeof window.rufeGemini === 'function' &&
        typeof window.baueGeminiPrompt === 'function' &&
        typeof window.parseGeminiFazitAntwort === 'function' &&
        typeof window.berechneMarktStatus === 'function'
    );
    
    if (allesDa) {
      clearInterval(checkInterval);
      console.log("ALLES GELADEN - Starte Dashboard");
      window.starteDashboard();
    } else {
      console.log("Warte auf Module: fazit, gemini, etc...");
    }
  }, 500);
});
