/**
 * DATEI: main.js
 * FUNKTION: Übergibt die KI-Daten an die existierenden Kachel-Container.
 */

async function render(data) {
  console.log("RENDER START: Daten empfangen", data);

  try {
    const status = window.berechneMarktStatus(data);
    
    // 1. KI-Daten abrufen
    let texte;
    try {
      const prompt = window.baueGeminiPrompt(data);
      const rohAntwort = await window.rufeGemini(prompt);
      texte = window.parseGeminiFazitAntwort(rohAntwort);
    } catch (apiError) {
      console.error("KI-Fehler:", apiError);
      texte = { gesamtsituation: "Analyse nicht verfügbar.", sentiment: "Keine Daten", trend: "Keine Daten", struktur: "Keine Daten", rohstoffe: "Keine Daten" };
    }

    // 2. Gesamtfazit rendern
    if (typeof window.buildFazitDuForm === 'function') {
      const container = document.getElementById('fazitInhalt');
      if (container) {
        container.innerHTML = window.buildFazitDuForm(
          status.bfStatus, status.sfColor, status.welleDesc, data.score, 
          data.previous_close, texte.gesamtsituation, texte.actions || [] 
        );
      }
    }

    // 3. KI-Text sicher in die Kacheln injizieren
    // Da deine Kacheln die Klasse 'kachel-fazit-box' haben und per toggleKachelFazit gesteuert werden,
    // suchen wir nach einem Bereich innerhalb dieser Box, der die KI-Analyse aufnimmt.
    const updateKachel = (id, text) => {
      const box = document.getElementById(id);
      if (box) {
        // Suche nach dem Inhaltsbereich für das Fazit
        // Laut index.html Snippet haben die Kacheln eine kachel-fazit-box Struktur
        let contentArea = box.querySelector('.kachel-fazit-content');
        
        if (!contentArea) {
          // Falls kein expliziter Container da ist, erstellen wir einen in der Box
          contentArea = document.createElement('div');
          contentArea.className = 'kachel-fazit-content';
          box.appendChild(contentArea);
        }
        
        // Füge den Text mit etwas Padding hinzu
        contentArea.innerHTML = `<div class="p-3 text-sm text-gray-200" style="padding:10px; font-size: 0.85rem;">${text}</div>`;
      } else {
        console.warn("Kachel-Box nicht gefunden:", id);
      }
    };

    updateKachel('fazitBox1', texte.sentiment);
    updateKachel('fazitBox2', texte.trend);
    updateKachel('fazitBox3', texte.struktur);
    updateKachel('fazitBox4', texte.rohstoffe);

    console.log("Rendering abgeschlossen.");
  } catch (error) {
    console.error("Kritischer Fehler:", error);
  }
}

window.render = render;
