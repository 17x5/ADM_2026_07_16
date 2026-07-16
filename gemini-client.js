// Reine Technik: schickt einen Prompt an die Gemini API, gibt den Antworttext zurück.
// -> Hier den API-Key eintragen und ggf. das Modell wechseln.
const GEMINI_API_KEY = "AQ.Ab8RN6I6i117jvqUVBPcgca7S0HTxD_EpYI1WFplok3q4qDhQg";
// Hinweis: "gemini-2.5-flash-preview-09-2025" oder "gemini-1.5-flash" sind die stabilsten Modelle für JSON-Outputs.
const GEMINI_MODEL = "gemini-3.1-flash-lite";

async function rufeGemini(prompt) {
  console.log("1. rufeGemini gestartet. Modell:", GEMINI_MODEL);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    console.log("2. Sende Request an API...");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ 
            text: "Du bist ein präziser Finanzanalyst. Du antwortest AUSSCHLIESSLICH im validen JSON-Format. Deine Antwort MUSS exakt diese JSON-Struktur einhalten: { \"gesamtsituation\": \"...\", \"actions\": [\"Action 1\", \"Action 2\"], \"sentiment\": \"...\", \"trend\": \"...\", \"struktur\": \"...\", \"rohstoffe\": \"...\" }. \n\n" +
                  "FORMATIERUNGS-REGELN FÜR DIE TEXTE IN DEN JSON-FELDERN:\n" +
                  "1. Nutze HTML-Tags (wie `<strong>`, `<br>`, `<p>`, `<ul>`, `<li>` und Emojis) innerhalb der JSON-Strings, um eine wunderschöne, übersichtliche und lesbare Formatierung zu erzeugen.\n" +
                  "2. ACHTUNG: Verwende innerhalb der HTML-Tags niemals doppelte Anführungszeichen (\"), sondern nur einfache (') oder gar keine (z.B. `<span style='color:red;'>`), um das JSON-Format nicht zu beschädigen.\n" +
                  "3. ANALYSE-STIL: Nenne in den Feldern immer zuerst kurz die relevanten Fachbegriffe (z.B. Welle B, Divergenz) für die Präzision. Schreibe direkt danach einen separaten Absatz (abgetrennt mit `<br><br>`) als 'Einfach-Erklärung': Übersetze die Fachbegriffe in klare, warnende Alltagssprache. Sei ehrlich, wenn die Lage ernst ist."
          }]
        },
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    console.log("3. API hat geantwortet. Status:", res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("API Fehler Details:", errorText);
      throw new Error(`Gemini API Fehler: HTTP ${res.status} - ${errorText}`);
    }

    const json = await res.json();
    console.log("4. JSON Response geparst.");

    const text = json.candidates && json.candidates[0] && json.candidates[0].content
      ? json.candidates[0].content.parts[0].text
      : null;

    if (!text) {
      throw new Error("Gemini: leere oder unerwartete Antwort");
    }
    
    console.log("5. Roher Text aus KI extrahiert:\n", text);
    return text;

  } catch (error) {
    if (error.name === 'AbortError') {
      console.error("TIMEOUT: Keine Antwort innerhalb von 15s.");
      throw new Error("Timeout bei der API-Verbindung.");
    }
    console.error("Fehler in rufeGemini:", error);
    throw error;
  }
}

// Der Parser wandelt den KI-Text in ein echtes JavaScript-Objekt um
function parseGeminiFazitAntwort(antwortText) {
  console.log("6. Starte Parsing des Textes...");
  try {
    // 1. Bereinige eventuelle Markdown-Reste, falls die KI sie trotz Verbot mitschickt
    let cleanText = antwortText.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    // 2. Extrahiere nur den JSON-Körper
    const startIndex = cleanText.indexOf('{');
    const endIndex = cleanText.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1) {
      cleanText = cleanText.substring(startIndex, endIndex + 1);
    }

    const result = JSON.parse(cleanText);
    console.log("7. Parsing erfolgreich!", result);

    // 3. ABSOLUTES SICHERHEITS-NETZ: Falls "actions" fehlt oder kein Array ist, füllen wir es intelligent!
    if (!result.actions || !Array.isArray(result.actions) || result.actions.length === 0) {
      console.warn("Warnung: 'actions' Key fehlt oder ist leer im KI-Response. Erstelle automatische Actions...");
      
      if (result.gesamtsituation) {
        // Trenne Sätze auf und nimm bis zu 3 prägnante Sätze als Not-Aktionen
        const saetze = result.gesamtsituation.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 15);
        result.actions = saetze.slice(0, 3);
      }
      
      if (!result.actions || result.actions.length === 0) {
        result.actions = [
          "Analysiere die Kacheldaten manuell auf Divergenzen.",
          "Sichere bestehende Positionen vorsorglich mit engen Stopps ab.",
          "Halte ausreichend Liquidität für neue Marktchancen bereit."
        ];
      }
    }

    return result;

  } catch (e) {
    console.error("8. Parser Fehler! Nutze Notfall-Objekt.");
    console.error("Fehlerdetails:", e);
    
    return {
      gesamtsituation: "Die KI-Antwort konnte nicht verarbeitet werden. Bitte lade die Seite neu.",
      actions: [
        "Überprüfe die Internetverbindung.",
        "Lade das Dashboard mit Strg + F5 neu.",
        "Prüfe das Konsolen-Log auf API-Verbindungsfehler."
      ],
      sentiment: "Fehler beim Parsen",
      trend: "Fehler beim Parsen",
      struktur: "Fehler beim Parsen",
      rohstoffe: "Fehler beim Parsen"
    };
  }
}
