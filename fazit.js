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

function buildFazitDuForm(bfStatus, sfColor, welleDesc, currentScore, previousClose, situationErklaerung, actionList) {
  let accentColor = accentColorFuerStatus(bfStatus);
  let labelHtml = baueStatusLabel(bfStatus, sfColor, welleDesc);
  
  // Dynamische Liste aus der KI
  let items = (Array.isArray(actionList) && actionList.length > 0) 
    ? actionList.map(item => `<li>${item}</li>`).join("") 
    : "<li>Keine Aktionen empfangen.</li>";

  let diff = currentScore - previousClose;
  let diffText = diff > 0 ? `▲ +${diff.toFixed(1)} Punkte...` : diff < 0 ? `▼ ${diff.toFixed(1)} Punkte...` : `■ Unverändert...`;
  let diffColor = diff > 0 ? "var(--green)" : diff < 0 ? "var(--red)" : "var(--yellow)";

  return `
    <div class="fazit-section">
      <div class="fazit-label">Deine Situation:</div>
      <p class="fazit-p">${labelHtml}${situationErklaerung || "Analyse wird geladen..."}</p>
      <div class="fazit-change" style="color: ${diffColor};">
        <strong>Veränderung zum letzten Handelstag:</strong> ${diffText}
      </div>
    </div>
    <div id="actionBox" class="action-box" style="border-left-color:${accentColor};">
      <div class="action-header" onclick="toggleActionBox()">
        <h3 style="color:${accentColor};">Deine Actions:</h3>
        <span id="actionToggleIcon" class="action-toggle-icon">▶ Anzeigen</span>
      </div>
      <!-- Standardmäßig eingeklappt durch style="display: none;" -->
      <div class="action-content" style="display: none;">
        <ul class="action-list">${items}</ul>
      </div>
    </div>
  `;
}
