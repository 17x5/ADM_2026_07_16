// fazit.js - Erwartet ein Array 'actionList' direkt aus der KI
function baueStatusLabel(bfStatus, sfColor, welleDesc) {
  let ampelEmoji = getEmojiColor(sfColor);
  return `${ampelEmoji} <b>${bfStatus} (${welleDesc}):</b> `;
}

function accentColorFuerStatus(bfStatus) {
  if (bfStatus === "MARKT-ILLUSION" || bfStatus === "ÜBERHITZT") return "var(--red)";
  if (bfStatus === "FALLENDES MESSER" || bfStatus === "KORREKTUR") return "var(--yellow)";
  return "var(--green)";
}

function buildFazitDuForm(bfStatus, sfColor, welleDesc, currentScore, previousClose, situationErklaerung, actionList) {
  // Wenn keine KI-Daten kommen, zeigt das System jetzt explizit einen Fehler an,
  // statt statische Texte aus dem Code zu ziehen.
  let items = (Array.isArray(actionList) && actionList.length > 0) 
    ? actionList.map(item => `<li>${item}</li>`).join("") 
    : "<li>KEINE DYNAMISCHEN DATEN EMPFANGEN</li>";

  return `
    <div class="fazit-section">
      <p><b>Status:</b> ${bfStatus} (${welleDesc})</p>
      <p>${situationErklaerung || "Warte auf KI-Analyse..."}</p>
    </div>
    <div class="action-box">
      <h3>Deine dynamischen Actions:</h3>
      <ul>${items}</ul>
    </div>
  `;
}
