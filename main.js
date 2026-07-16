/**
 * DATEI: main.js
 * FUNKTION: Koordiniert das Laden der Marktdaten, die KI-Analyse und das Rendering.
 */

async function render(data) {
  console.log("RENDER START: Daten empfangen", data);

  try {
    if (typeof window.berechneMarktStatus !== 'function') {
      throw new Error("berechneMarktStatus ist global nicht definiert!");
    }
    const status = window.berechneMarktStatus(data);
    
    let texte;
    try {
      console.log("Starte KI-Abfrage...");
      const kiAbfrage = rufeGemini(window.baueGeminiPrompt(data));
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout bei KI-Abfrage")), 8000)
      );
      
      const rohAntwort = await Promise.race([kiAbfrage, timeout]);
      texte = window.parseGeminiFazitAntwort(rohAntwort);
    } catch (apiError) {
      console.error("Fehler bei der KI-Analyse:", apiError);
      texte = {
        gesamtsituation: "Die KI-Analyse ist aktuell nicht verfügbar.",
        actions: ["Überprüfe den Marktstatus manuell."]
      };
    }

    const fazitHtml = window.buildFazitDuForm(
        status.bfStatus, status.sfColor, status.welleDesc, data.score, 
        data.previous_close, texte.gesamtsituation, texte.actions 
    );

    const container = document.getElementById('fazitInhalt');
    if (container) {
      container.innerHTML = fazitHtml;
    }
  } catch (error) {
    console.error("Kritischer Fehler im Render-Prozess:", error);
  }
}

async function rufeGemini(prompt) {
  if (typeof window.rufeGeminiAPI !== 'function') throw new Error("rufeGeminiAPI fehlt.");
  return await window.rufeGeminiAPI(prompt); 
}

window.addEventListener('load', () => {
  const checkInterval = setInterval(() => {
    if (typeof window.starteDashboard === 'function') {
      clearInterval(checkInterval);
      window.starteDashboard();
    }
  }, 500);
});
