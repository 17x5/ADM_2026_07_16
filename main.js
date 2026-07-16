/**
 * DATEI: main.js
 * FUNKTION: Übergibt die KI-Daten an die existierenden Kachel-Container.
 */

async function render(data) {
  console.log("RENDER START: Daten empfangen", data);

  try {
    // 1. Marktstatus berechnen
    if (typeof window.berechneMarktStatus !== 'function') {
      console.error("KRITISCH: berechneMarktStatus ist nicht definiert!");
      return;
    }
    const status = window.berechneMarktStatus(data);
    
    // 2. KI-Daten abrufen
    let texte;
    try {
      const prompt = window.baueGeminiPrompt(data);
      const rohAntwort = await window.rufeGemini(prompt);
      texte = window.parseGeminiFazitAntwort(rohAntwort);
    } catch (apiError) {
      console.error("KI-Fehler:", apiError);
      texte = { gesamtsituation: "Analyse nicht verfügbar.", sentiment: "Keine Daten", trend: "Keine Daten", struktur: "Keine Daten", rohstoffe: "Keine Daten" };
    }

    // 3. Gesamtfazit rendern (mit kurzem Timeout, um sicherzustellen, dass das DOM steht)
    setTimeout(() => {
        if (typeof window.buildFazitDuForm === 'function') {
            const container = document.getElementById('fazitInhalt');
            if (container) {
                container.innerHTML = window.buildFazitDuForm(
                    status.bfStatus, status.sfColor, status.welleDesc, data.score, 
                    data.previous_close, texte.gesamtsituation, texte.actions || [] 
                );
            }
        }
    }, 200);

    // 4. KI-Text in die Kacheln injizieren
    // Wir nutzen eine explizite Verzögerung, damit die Kachel-Skripte 
    // ihre Strukturen (wie kachel-fazit-content) vorher erstellen konnten.
    setTimeout(() => {
        const updateKachel = (id, text) => {
          const box = document.getElementById(id);
          if (box) {
            let contentArea = box.querySelector('.kachel-fazit-content');
            if (!contentArea) {
               contentArea = document.createElement('div');
               contentArea.className = 'kachel-fazit-content';
               box.appendChild(contentArea);
            }
            contentArea.innerHTML = `<div style="padding:15px; font-size: 0.9rem; line-height: 1.4; color: #e2e8f0;">${text}</div>`;
            console.log("Kachel", id, "erfolgreich befüllt.");
          } else {
            console.warn("Kachel-Box nicht gefunden:", id);
          }
        };

        updateKachel('fazitBox1', texte.sentiment);
        updateKachel('fazitBox2', texte.trend);
        updateKachel('fazitBox3', texte.struktur);
        updateKachel('fazitBox4', texte.rohstoffe);
        
        console.log("Rendering komplett abgeschlossen.");
    }, 500);

  } catch (error) {
    console.error("Kritischer Fehler im Render-Prozess:", error);
  }
}

window.render = render;
