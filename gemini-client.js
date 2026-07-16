const GEMINI_API_KEY = "AQ.Ab8RN6I6i117jvqUVBPcgca7S0HTxD_EpYI1WFplok3q4qDhQg";
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
            text: "Du bist ein präziser Finanzanalyst. Du antwortest AUSSCHLIESSLICH im validen JSON-Format. Deine Antwort MUSS exakt diese JSON-Struktur einhalten: { \"gesamtsituation\": \"...\", \"actions\": [\"Action 1\", \"Action 2\"], \"sentiment\": \"...\", \"trend\": \"...\", \"struktur\": \"...\", \"rohstoffe\": \"...\" }.\n\n" +
                  "FORMATIERUNGS-REGELN FÜR DIE JSON-FELDER:\n" +
                  "1. FELD 'gesamtsituation': Nutze hier intensiv HTML-Tags (wie `<strong>`, `<br>`, `<p>`, Emojis) für eine wunderschöne, fette und lesbare Formatierung. Verwende niemals doppelte Anführungszeichen (\") innerhalb des HTMLs, sondern nur einfache (') oder gar keine (z.B. `<span style='color:red;'>`), um das JSON-Format nicht zu beschädigen.\n" +
                  "2. ANALYSE-STIL FÜR 'gesamtsituation': Nenne zuerst kurz die relevanten Fachbegriffe (z.B. Welle B, Divergenz) für die Präzision. Schreibe direkt danach einen separaten Absatz (abgetrennt mit `<br><br>`) als 'Einfach-Erklärung': Übersetze die Fachbegriffe in klare, warnende Alltagssprache. Sei ehrlich und direkt, wenn die Lage ernst ist.\n" +
                  "3. FELD 'actions': Dieses Feld MUSS zwingend ein einfaches Array aus 3 bis 5 kurzen, prägnanten, handlungsorientierten Sätzen (als reine Text-Strings) sein (z.B. [\"Sichere Kernpositionen ab.\", \"Erhöhe Cash-Quote.\"]). Verwende im 'actions'-Array KEINE HTML-Tags oder komplexe Strukturen."
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
      throw new Error(`Gemini API Fehler: HTTP ${res.status}`);
    }

    const json = await res.json();
    const text = json.candidates && json.candidates[0] && json.candidates[0].content
      ? json.candidates[0].content.parts[0].text
      : null;

    if (!text) {
      throw new Error("Gemini: leere oder unerwartete Antwort");
    }
    
    console.log("4. Roher Text aus KI extrahiert.");
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

function parseGeminiFazitAntwort(antwortText) {
  console.log("5. Starte Parsing des Textes...");
  let cleanText = antwortText.replace(/```json/gi, "").replace(/```/g, "").trim();
  
  try {
    const startIndex = cleanText.indexOf('{');
    const endIndex = cleanText.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1) {
      cleanText = cleanText.substring(startIndex, endIndex + 1);
    }

    const result = JSON.parse(cleanText);
    console.log("6. Parsing erfolgreich!", result);

    // ABSOLUTES SICHERHEITS-NETZ: Falls "actions" fehlt oder leer ist, füllen wir es aus der Gesamtsituation
    if (!result.actions || !Array.isArray(result.actions) || result.actions.length === 0) {
      console.warn("Actions-Array leer oder fehlt. Generiere automatische Actions...");
      if (result.gesamtsituation) {
        const saetze = result.gesamtsituation.replace(/<[^>]*>/g, '').split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 15);
        result.actions = saetze.slice(0, 3);
      }
    }

    // GLOBALE STATE-BRÜCKE: Speichert das Ergebnis für die fazit.js ab!
    window.lastParsedFazit = result;
    return result;

  } catch (e) {
    console.error("7. Parser Fehler! Versuche manuelle Regex-Rettung...");
    
    // Manuelle Notfall-Extraktion bei leicht beschädigtem JSON
    try {
      const result = {
        gesamtsituation: "Analyse wurde geladen.",
        actions: [],
        sentiment: "Neutral", trend: "Neutral", struktur: "Neutral", rohstoffe: "Neutral"
      };

      const sitMatch = cleanText.match(/"gesamtsituation"\s*:\s*"([\s\S]*?)"\s*(?:,|\})/);
      if (sitMatch) {
        result.gesamtsituation = sitMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '<br>');
      }

      const actionsMatch = cleanText.match(/"actions"\s*:\s*\[([\s\S]*?)\]/);
      if (actionsMatch) {
        const items = actionsMatch[1].match(/"([\s\S]*?)"/g);
        if (items) {
          result.actions = items.map(item => item.slice(1, -1).replace(/\\"/g, '"'));
        }
      }

      if (result.gesamtsituation || result.actions.length > 0) {
        window.lastParsedFazit = result;
        return result;
      }
    } catch (err) {
      console.error("Regex-Rettung ebenfalls fehlgeschlagen:", err);
    }

    // Rücksturz auf solides Fallback-Objekt
    const fallback = {
      gesamtsituation: "Die KI-Antwort konnte nicht verarbeitet werden.",
      actions: [
        "Überprüfe die Internetverbindung.",
        "Lade das Dashboard mit Strg + F5 neu.",
        "Prüfe das Konsolen-Log auf API-Verbindungsfehler."
      ],
      sentiment: "Fehler", trend: "Fehler", struktur: "Fehler", rohstoffe: "Fehler"
    };
    window.lastParsedFazit = fallback;
    return fallback;
  }
}

window.parseGeminiFazitAntwort = parseGeminiFazitAntwort;
