/**
 * Robustes Parsen der KI-Antwort.
 * Entfernt Markdown-Block-Tags und extrahiert exakt den JSON-Bereich.
 */
function parseGeminiFazitAntwort(antwortText) {
  try {
    // 1. Markdown-Marker entfernen
    let cleanText = antwortText.replace(/```json/gi, "").replace(/```/g, "").trim();

    // 2. Extrahiere den reinen JSON-String (von der ersten { bis zur letzten })
    const startIndex = cleanText.indexOf('{');
    const endIndex = cleanText.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1) {
      throw new Error("Kein valider JSON-Strukturblock gefunden.");
    }

    const jsonString = cleanText.substring(startIndex, endIndex + 1);

    // 3. Jetzt sicher parsen
    return JSON.parse(jsonString);

  } catch (e) {
    console.error("Parsing-Fehler:", e);
    
    // Fallback: Damit die Anwendung nicht abstürzt und die UI nicht leer bleibt
    return {
      gesamtsituation: "Analyse-Daten konnten aktuell nicht geladen werden.",
      actions: [
        "System-Parser-Fehler aufgetreten.",
        "Versuche bitte einen Refresh.",
        "KI-Datenformat ist instabil."
      ],
      sentiment: "Fehler",
      trend: "Fehler",
      struktur: "Fehler",
      rohstoffe: "Fehler"
    };
  }
}
