/**
 * DATEI: gemini-client.js
 * FUNKTION: API-Verbindung zu Google Gemini.
 */

const GEMINI_API_KEY = "AQ.Ab8RN6I6i117jvqUVBPcgca7S0HTxD_EpYI1WFplok3q4qDhQg";
const GEMINI_MODEL = "gemini-3.1-flash-lite";

async function rufeGemini(prompt) {
  console.log("Starte API-Aufruf an Gemini...");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(`API Fehler: ${res.status} - ${errorData.error?.message || 'Unbekannt'}`);
    }
    
    const json = await res.json();
    return json.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Fehler in rufeGemini:", error);
    throw error;
  }
}

// Globale Registrierung unter dem korrekten Namen
window.rufeGemini = rufeGemini;
console.log("gemini-client.js: rufeGemini wurde global registriert.");
