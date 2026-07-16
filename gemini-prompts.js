/**
 * Erzeugt den Prompt für die KI-Analyse.
 * Sichergestellt durch explizite Zuweisung an das window-Objekt,
 * damit main.js global darauf zugreifen kann.
 */

// Funktionen direkt global definieren, ohne IIFE, um Scope-Probleme zu vermeiden
function baueGeminiPrompt(data) {
  return `Analysiere den aktuellen Markt basierend auf diesen Daten: ${JSON.stringify(data)}.
  Antworte ausschließlich im JSON-Format mit folgenden Feldern:
  {
    "gesamtsituation": "Erklärung...",
    "actions": ["Action 1", "Action 2", "Action 3", "Action 4"],
    "sentiment": "...",
    "trend": "...",
    "struktur": "...",
    "rohstoffe": "..."
  }`;
}

function parseGeminiFazitAntwort(antwortText) {
  try {
    const cleanText = antwortText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const startIndex = cleanText.indexOf('{');
    const endIndex = cleanText.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1) {
      throw new Error("Kein valider JSON-Strukturblock gefunden.");
    }
    
    return JSON.parse(cleanText.substring(startIndex, endIndex + 1));
  } catch (e) {
    console.error("Parsing-Fehler:", e);
    return {
      gesamtsituation: "Fehler beim Laden der Daten.",
      actions: ["Systemfehler", "Bitte Refresh durchführen"],
      sentiment: "Fehler", trend: "Fehler", struktur: "Fehler", rohstoffe: "Fehler"
    };
  }
}

// Explizite Zuweisung an das window-Objekt
window.baueGeminiPrompt = baueGeminiPrompt;
window.parseGeminiFazitAntwort = parseGeminiFazitAntwort;

console.log("gemini-prompts.js: Funktionen global registriert.");
