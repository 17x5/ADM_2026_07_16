/**
 * DATEI: fazit.js
 * FUNKTION: Generiert das HTML für das KI-Fazit und verwaltet die UI-Interaktionen.
 */

function buildFazitDuForm(bfStatus, sfColor, welleDesc, score, prevClose, gesamtsituation, actions) {
  // Fallback, falls getEmojiColor nicht definiert ist
  const farbCode = (typeof getEmojiColor === 'function') ? getEmojiColor(sfColor) : sfColor;

  const actionList = actions.map(act => `<li class='mb-2'>${act}</li>`).join('');

  return `
    <div class='bg-white p-6 rounded-2xl shadow-lg border-l-8' style='border-color: ${farbCode};'>
      <h3 class='text-xl font-bold mb-4'>Marktanalyse</h3>
      <div class='mb-4'>
        <p class='text-gray-700 leading-relaxed'>${gesamtsituation}</p>
      </div>
      
      <div class='bg-gray-50 p-4 rounded-xl mb-4'>
        <p class='font-semibold mb-2'>Empfohlene Handlungen:</p>
        <ul class='list-disc list-inside text-sm text-gray-800'>
          ${actionList}
        </ul>
      </div>

      <div class='flex justify-between items-center text-xs text-gray-400'>
        <span>Status: ${bfStatus}</span>
        <span>Score: ${score}</span>
      </div>
    </div>
  `;
}

function toggleActionBox(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.toggle('hidden');
  }
}

// Finale Registrierung für die globale Verwendung
window.toggleActionBox = toggleActionBox;
window.buildFazitDuForm = buildFazitDuForm;

console.log("fazit.js: buildFazitDuForm wurde global registriert.");
