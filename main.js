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
    // Wir suchen innerhalb von fazitBoxX nach der Klasse 'kachel-fazit-content'
    const updateKachel = (id, text) => {
      const box = document.getElementById(id);
      if (box) {
        // Suche den Inhaltsbereich innerhalb der Box
        let contentArea = box.querySelector('.kachel-fazit-content');
        
        // Falls dieser Bereich noch nicht existiert, erstellen wir ihn
        if (!contentArea) {
          contentArea = document.createElement('div');
          contentArea.className = 'kachel-fazit-content';
          box.appendChild(contentArea);
        }
        
        contentArea.innerHTML = `<div class="p-4 text-sm text-gray-200">${text}</div>`;
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
