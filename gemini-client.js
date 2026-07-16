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
      // HIER wird der Stil definiert:
      system_instruction: {
        parts: [{ text: "Du bist ein präziser Finanzanalyst. Wenn du Daten analysierst: 1. Nenne kurz die relevanten Fachbegriffe (z.B. Welle B, Divergenz), damit die Analyse präzise bleibt. 2. Schreibe direkt danach in einem separaten Absatz eine 'Einfach-Erklärung': Übersetze diese Fachbegriffe in klare, warnende Alltagssprache. Komm sofort zum Punkt und sei ehrlich, wenn die Lage ernst ist." }]
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
