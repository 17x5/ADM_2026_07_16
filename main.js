/**
 * DATEI: main.js
 * FUNKTION: Koordiniert den Start des Dashboards und verteilt die KI-Daten auf die Kacheln.
 */

async function render(data) {
  console.log("RENDER START: Daten empfangen", data);

  try {
    // 1. Marktstatus berechnen
    if (typeof window.berechneMarktStatus !== 'function') {
      throw new Error("window.berechneMarktStatus ist nicht definiert!");
    }
    const status = window.berechneMarktStatus(data);
    
    // 2. KI-Analyse durchführen
    let texte;
    try {
      console.log("Starte KI-Abfrage...");
      // Aufruf der globalen Funktionen (definiert in gemini-prompts.js und gemini-client.js)
      const prompt = window.baueGeminiPrompt(data);
      const rohAntwort = await window.rufeGemini(prompt);
      texte = window.parseGeminiFazitAntwort(rohAntwort);
      console.log("KI-Analyse erfolgreich erhalten:", texte);
    } catch (apiError) {
      console.error("Fehler bei der KI-Analyse:", apiError);
      texte = { 
        gesamtsituation: "Die KI-Analyse ist aktuell nicht verfügbar.", 
        actions: ["Überprüfe die API-Verbindung."],
        sentiment: "Keine Daten verfügbar", 
        trend: "Keine Daten verfügbar", 
        struktur: "Keine Daten verfügbar", 
        rohstoffe: "Keine Daten verfügbar"
      };
    }

    // 3. Gesamtfazit rendern (fazitInhalt aus index.html)
    if (typeof window.buildFazitDuForm === 'function') {
      const fazitHtml = window.buildFazitDuForm(
        status.bfStatus, status.sfColor, status.welleDesc, data.score, 
        data.previous_close, texte.gesamtsituation, texte.actions 
      );
      const container = document.getElementById('fazitInhalt');
      if (container) container.innerHTML = fazitHtml;
    }

    // 4. Kachel-Inhalte verteilen (sentimentGroup, trendGroup, etc.)
    // Diese IDs (fazitContent1-4) sind in der index.html definiert
    const kacheln = [
      { id: 'fazitContent1', content: texte.sentiment },
      { id: 'fazitContent2', content: texte.trend },
      { id: 'fazitContent3', content: texte.struktur },
      { id: 'fazitContent4', content: texte.rohstoffe }
    ];

    kacheln.forEach(k => {
      const el = document.getElementById(k.id);
      if (el) {
        // Wir setzen hier den Inhalt, die CSS-Klassen kommen aus style.css
        el.innerHTML = `<p class="kachel-text">${k.content || "Analyse wird geladen..."}</p>`;
      }
    });

    console.log("Rendering erfolgreich abgeschlossen.");
  } catch (error) {
    console.error("Kritischer Fehler im Render-Prozess:", error);
  }
}

// Global für externe Aufrufe registrieren
window.render = render;

// Initialisierung bei Ladevorgang
window.addEventListener('load', () => {
  const checkInterval = setInterval(() => {
    const allesDa = (
        typeof window.starteDashboard === 'function' && 
        typeof window.rufeGemini === 'function' &&
        typeof window.baueGeminiPrompt === 'function' &&
        typeof window.parseGeminiFazitAntwort === 'function' &&
        typeof window.berechneMarktStatus === 'function'
    );
    
    if (allesDa) {
      clearInterval(checkInterval);
      console.log("ALLES GELADEN - Starte Dashboard");
      window.starteDashboard();
    }
  }, 500);
});
