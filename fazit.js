function baueStatusLabel(bfStatus, sfColor, welleDesc) {
  let ampelEmoji = getEmojiColor(sfColor);
  const labels = {
    "MARKT-ILLUSION": `Markt-Illusion in Welle B (${welleDesc})`,
    "ÜBERHITZT": `Überhitzter Markt (${welleDesc})`,
    "FALLENDES MESSER": `Kapitulationsphase (${welleDesc})`,
    "KORREKTUR": `Normale Markt-Korrektur (${welleDesc})`
  };
  const label = labels[bfStatus] || `Gesundes Marktumfeld (${welleDesc})`;
  return `${ampelEmoji} <b>${label}:</b> `;
}

function accentColorFuerStatus(bfStatus) {
  if (bfStatus === "MARKT-ILLUSION" || bfStatus === "ÜBERHITZT") return "var(--red)";
  if (bfStatus === "FALLENDES MESSER" || bfStatus === "KORREKTUR") return "var(--yellow)";
  return "var(--green)";
}

// KEIN async, KEIN await: So bleibt die Seite nicht hängen!
function buildFazitDuForm(bfStatus, sfColor, welleDesc, currentScore, previousClose, situationErklaerung, actionList) {
  let accentColor = accentColorFuerStatus(bfStatus);
  let labelHtml = baueStatusLabel(bfStatus, sfColor, welleDesc);
  
  // Falls actionList kein Array ist, nutzen wir ein Fallback
  let items = (Array.isArray(actionList) && actionList.length > 0) ? actionList : ["Analysiere Marktdaten..."];
  let listHtml = items.map(item => `<li>${item}</li>`).join("");

  let diff = currentScore - previousClose;
  let diffText = diff > 0 ? `▲ +${diff.toFixed(1)}` : diff < 0 ? `▼ ${diff.toFixed(1)}` : `■ Unverändert`;
  let diffColor = diff > 0 ? "var(--green)" : diff < 0 ? "var(--red)" : "var(--yellow)";

  return `
    <div class="fazit-section">
      <div class="fazit-label">Deine Situation:</div>
      <p class="fazit-p">${labelHtml}${situationErklaerung}</p>
      <div class="fazit-change" style="color: ${diffColor};">
        <strong>Veränderung:</strong> ${diffText} Punkte
      </div>
    </div>
    <div id="actionBox" class="action-box" style="border-left-color:${accentColor};">
      <div class="action-header" onclick="toggleActionBox()">
        <h3 style="color:${accentColor};">Deine Actions:</h3>
      </div>
      <div class="action-content">
        <ul class="action-list">${listHtml}</ul>
      </div>
    </div>
  `;
}
