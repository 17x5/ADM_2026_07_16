/**
 * DATEI: main.js
 * FUNKTION: Koordiniert das Rendering und stellt sicher, dass alle globalen Funktionen geladen sind.
 */

async function render(data) {
  console.log("RENDER START: Daten empfangen", data);

  try {
    // 1. Prüfen, ob die Berechnungslogik da ist
    if (typeof window.berechneMarktStatus !== 'function') {
      console.error("KRITISCH: berechneMarktStatus ist nicht definiert.");
      return;
    }
    
    console.log("Berechne Marktstatus...");
    const status = window.berechneMarktStatus(data);
    
    // 2. KI-Analyse
    let texte;
    try {
      console.log("Starte KI-Abfrage...");
      if (typeof window.rufeGemini !== 'function') {
        throw new Error("window.rufeGemini ist nicht definiert!");
      }
      
      const prompt = window.baueGeminiPrompt(data);
      console.log("Prompt generiert, sende an Gemini...");
      
      const rohAntwort = await window.rufeGemini(prompt);
      console.log("Antwort von Gemini erhalten:", rohAntwort);
      
      texte = window.parseGeminiFazitAntwort(rohAntwort);
      console.log("Antwort erfolgreich geparst:", texte);
      
    } catch (apiError) {
      console.error("Fehler bei der KI-Analyse:", apiError);
      texte = {
        gesamtsituation: "Die KI-Analyse ist aktuell nicht verfügbar.",
        actions: ["Überprüfe den Marktstatus manuell."]
      };
    }

    // 3. UI-Komponente rendern
    if (typeof window.buildFazitDuForm !== 'function') {
      console.error("KRITISCH: window.buildFazitDuForm ist nicht definiert!");
      return;
    }

    console.log("Baue Fazit HTML...");
    const fazitHtml = window.buildFazitDuForm(
        status.bfStatus, status.sfColor, status.welleDesc, data.score, 
        data.previous_close, texte.gesamtsituation, texte.actions 
    );

    const container = document.getElementById('fazitInhalt');
    if (container) {
      container.innerHTML = fazitHtml;
      console.log("Rendering abgeschlossen.");
    } else {
      console.error("Element 'fazitInhalt' nicht im DOM gefunden.");
    }
  } catch (error) {
    console.error("Kritischer Fehler im Render-Prozess:", error);
  }
}

window.addEventListener('load', () => {
  const checkInterval = setInterval(() => {
    // Debug-Log, um zu sehen, ob das Intervall läuft
    console.log("Warte auf Abhängigkeiten...");
    
    if (typeof window.starteDashboard === 'function' && 
        typeof window.buildFazitDuForm === 'function' &&
        typeof window.rufeGemini === 'function' &&
        typeof window.berechneMarktStatus === 'function') {
      
      clearInterval(checkInterval);
      console.log("Alle Abhängigkeiten geladen, starte Dashboard...");
      window.starteDashboard();
    }
  }, 500);
});
