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
  let accentColor = accentColorFuerStatus(bfStatus);
  let labelHtml = baueStatusLabel(bfStatus, sfColor, welleDesc);
  
  // Dynamische Liste aus der KI
  let items = (Array.isArray(actionList) && actionList.length > 0) 
    ? actionList.map(item => `<li>${item}</li>`).join("") 
    : "<li>Keine dynamischen Actions empfangen.</li>";

  let diff = currentScore - previousClose;
  let diffText = diff > 0 ? `▲ +${diff.toFixed(1)}` : diff < 0 ? `▼ ${diff.toFixed(1)}` : `■ Unverändert`;

  return `
    <div class="fazit-section">
      <p class="fazit-p">${labelHtml}${situationErklaerung || "Analyse wird geladen..."}</p>
      <div class="fazit-change"><strong>Veränderung:</strong> ${diffText} Punkte</div>
    </div>
    <div class="action-box" style="border-left-color:${accentColor};">
      <div class="action-header">
        <h3 style="color:${accentColor};">Deine dynamischen Actions:</h3>
      </div>
      <div class="action-content">
        <ul class="action-list">${items}</ul>
      </div>
    </div>
  `;
}
