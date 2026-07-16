// Reine Technik: schickt einen Prompt an die Gemini API, gibt den Antworttext zurück.
// -> Hier den API-Key eintragen und ggf. das Modell wechseln.
const GEMINI_API_KEY = "HIER_DEINEN_GEMINI_API_KEY_EINTRAGEN";
const GEMINI_MODEL = "gemini-3.1-flash-lite";

async function rufeGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
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
