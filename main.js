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

    // 3. Gesamtfazit rendern (mit kurzem Timeout für DOM-Stabilität)
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
    // Wir nutzen eine Verzögerung, damit alle Kachel-Skripte initialisiert sind.
    setTimeout(() => {
        const updateKachel = (id, text) => {
          const box = document.getElementById(id);
          if (box) {
            // Wir suchen nach dem spezifischen Inhaltsbereich.
            // Sollte dieser nicht vorhanden sein, nutzen wir eine sicherere Methode,
            // um den Text anzuhängen, ohne das Box-Layout zu zerstören.
            let contentArea = box.querySelector('.kachel-fazit-content');
            
            if (!contentArea) {
               // Erstelle Container nur, wenn absolut nötig
               contentArea = document.createElement('div');
               contentArea.className = 'kachel-fazit-content';
               box.appendChild(contentArea);
            }
            
            // Text als sauberes HTML einfügen
            contentArea.innerHTML = `<div style="padding:15px; font-size: 0.9rem; line-height: 1.4; color: #e2e8f0; border-top: 1px solid #444; margin-top: 10px;">${text}</div>`;
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
    }, 800);

  } catch (error) {
    console.error("Kritischer Fehler im Render-Prozess:", error);
  }
}

window.render = render;
