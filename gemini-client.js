// Reine Technik: schickt einen Prompt an die Gemini API, gibt den Antworttext zurück.
// -> Hier den API-Key eintragen und ggf. das Modell wechseln.
const GEMINI_API_KEY = "AQ.Ab8RN6I6i117jvqUVBPcgca7S0HTxD_EpYI1WFplok3q4qDhQg";
const GEMINI_MODEL = "gemini-3.1-flash-lite";

async function rufeGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ 
          text: "Du bist ein präziser Finanzanalyst. Antworte AUSSCHLIESSLICH im validen JSON-Format. Deine Antwort muss zwingend folgende Struktur haben: { \"gesamtsituation\": \"Erklärung...\", \"actions\": [\"Action 1\", \"Action 2\"], \"sentiment\": \"...\", \"trend\": \"...\", \"struktur\": \"...\", \"rohstoffe\": \"...\" }. Kein zusätzlicher Text vor oder nach dem JSON." 
        }]
      },
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!res.ok) {
    throw new Error("Gemini API Fehler: HTTP " + res.status);
  }

  const json = await res.json();
  const text = json.candidates && json.candidates[0] && json.candidates[0].content
    ? json.candidates[0].content.parts[0].text
    : null;

  if (!text) {
    throw new Error("Gemini: leere oder unerwartete Antwort");
  }
  return text;
}

// Der Parser wandelt den KI-Text in ein echtes JavaScript-Objekt um
function parseGeminiFazitAntwort(antwortText) {
  try {
    // Entfernt mögliche Markdown-Reste (z.B. ```json)
    const cleanText = antwortText.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Parser Fehler:", e);
    // Rückgabe eines Fallback-Objekts, um den Programmablauf nicht zu stoppen
    return {
      gesamtsituation: "Analyse-Format fehlerhaft.",
      actions: ["KI-Antwort konnte nicht als JSON geladen werden."],
      sentiment: "Fehler beim Parsen",
      trend: "Fehler beim Parsen",
      struktur: "Fehler beim Parsen",
      rohstoffe: "Fehler beim Parsen"
    };
  }
}
