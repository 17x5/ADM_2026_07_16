// Gesamtfazit-Box: Statuslabel bleibt regelbasiert, 
// Actions kommen jetzt direkt aus dem Fallback (da keine API vorhanden).

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

function getStaticActionItems(bfStatus) {
  if (bfStatus === "MARKT-ILLUSION") {
    return [
      "Reduziere riskante Nebenwerte und spekulative Hebelpositionen konsequent.",
      "Sichere deine Kernpositionen mit engen, strikten Stop-Loss-Marken ab.",
      "Schichte frei werdendes Kapital vorübergehend in Cash oder hochdefensive Werte um."
    ];
  }
  if (bfStatus === "ÜBERHITZT") {
    return ["Nimm strategische Teilgewinne bei stark gelaufenen Positionen mit.", "Vermeide FOMO-Nachkäufe auf Allzeithochs."];
  }
  if (bfStatus === "FALLENDES MESSER") {
    return ["Halte die Füsse still und warte auf die Bodenbestätigung.", "Lasse langfristige Sparpläne stur weiterlaufen."];
  }
  if (bfStatus === "KORREKTUR") {
    return ["Keine Panikverkäufe. Der Markt atmet lediglich kurz durch.", "Bereite deine Watchlist für gezielte Schnäppchenkauf vor."];
  }
  return ["Bleibe entspannt voll investiert.", "Nutze temporäre Dips als Nachkaufchance."];
}

// Hier wird nun direkt die statische Liste zurückgegeben
function fetchDynamicActions(bfStatus) {
  return getStaticActionItems(bfStatus);
}

async function buildFazitDuForm(bfStatus, sfColor, welleDesc, currentScore, previousClose, situationErklaerung) {
  let accentColor = accentColorFuerStatus(bfStatus);
  let labelHtml = baueStatusLabel(bfStatus, sfColor, welleDesc);
  
  let actionList = fetchDynamicActions(bfStatus);
  let listHtml = actionList.map(item => `<li>${item}</li>`).join("");

  let diff = currentScore - previousClose;
  let diffText = diff > 0 ? `▲ +${diff.toFixed(1)} Punkte...` : diff < 0 ? `▼ ${diff.toFixed(1)} Punkte...` : `■ Unverändert...`;
  let diffColor = diff > 0 ? "var(--green)" : diff < 0 ? "var(--red)" : "var(--yellow)";

  return `
    <div class="fazit-section">
      <div class="fazit-label">Deine Situation:</div>
      <p class="fazit-p">${labelHtml}${situationErklaerung}</p>
      <div class="fazit-change" style="color: ${diffColor};">
        <strong>Veränderung zum letzten Handelstag:</strong> ${diffText}
      </div>
    </div>
    <div id="actionBox" class="action-box" style="border-left-color:${accentColor};">
      <div class="action-header" onclick="toggleActionBox()">
        <h3 style="color:${accentColor};">Deine Actions:</h3>
        <span id="actionToggleIcon" class="action-toggle-icon">▶ Anzeigen</span>
      </div>
      <div class="action-content">
        <ul class="action-list">${listHtml}</ul>
      </div>
    </div>
  `;
}
