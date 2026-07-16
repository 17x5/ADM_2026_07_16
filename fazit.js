function sicheresEmoji(sfColor) {
  if (typeof getEmojiColor === 'function') {
    return getEmojiColor(sfColor);
  }
  const emojis = {
    "red": "🔴",
    "yellow": "🟡",
    "green": "🟢"
  };
  return emojis[sfColor] || "🚦";
}

function baueStatusLabel(bfStatus, sfColor, welleDesc) {
  let ampelEmoji = sicheresEmoji(sfColor);
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

function getFallbackActions(bfStatus) {
  console.log("fazit.js: Nutze regelbasiertes Fallback-System für Status:", bfStatus);
  if (bfStatus === "MARKT-ILLUSION") {
    return [
      "Reduziere riskante Nebenwerte und spekulative Hebelpositionen konsequent.",
      "Sichere deine Kernpositionen mit engen, strikten Stop-Loss-Marken ab.",
      "Schichte frei werdendes Kapital vorübergehend in Cash oder hochdefensive Werte um."
    ];
  }
  if (bfStatus === "ÜBERHITZT") {
    return [
      "Nimm strategische Teilgewinne bei stark gelaufenen Positionen mit.",
      "Vermeide FOMO-Nachkäufe auf Allzeithochs.",
      "Erhöhe die Cash-Quote für spätere Rücksetzer."
    ];
  }
  if (bfStatus === "FALLENDES MESSER") {
    return [
      "Halte die Füße still und warte auf eine nachhaltige Bodenbestätigung.",
      "Lasse langfristige Sparpläne stur weiterlaufen.",
      "Vermeide verfrühtes 'Ins fallende Messer greifen' ohne Trendwende-Signale."
    ];
  }
  if (bfStatus === "KORREKTUR") {
    return [
      "Keine Panikverkäufe – der Markt atmet lediglich gesund durch.",
      "Bereite deine Watchlist für gezielte Qualitätskäufe vor.",
      "Prüfe wichtige gleitende Durchschnitte (z.B. SMA 50/200) als Unterstützungszonen."
    ];
  }
  return [
    "Bleibe entspannt voll investiert.",
    "Nutze temporäre Kursrücksetzer (Dips) als gezielte Nachkaufchance.",
    "Überprüfe regelmäßig die fundamentale Stärke deines Depots."
  ];
}

function toggleActionBox(headerElement) {
  const box = headerElement ? headerElement.closest(".action-box") : document.getElementById("actionBox");
  if (!box) {
    console.error("fazit.js: .action-box konnte im DOM nicht gefunden werden.");
    return;
  }
  
  const content = box.querySelector(".action-content");
  const icon = box.querySelector(".action-toggle-icon");
  
  if (content && icon) {
    if (content.style.display === "none" || content.style.display === "") {
      content.style.display = "block";
      icon.textContent = "▼ Ausblenden";
    } else {
      content.style.display = "none";
      icon.textContent = "▶ Anzeigen";
    }
  }
}

function buildFazitDuForm(bfStatus, sfColor, welleDesc, currentScore, previousClose, situationErklaerung, actionList) {
  console.log("fazit.js: buildFazitDuForm gestartet.");

  // DEFENSIEVER CHECK 1: Falls das 6. Argument ein ganzes Objekt ist (weil main.js es so übergibt)
  if (typeof situationErklaerung === 'object' && situationErklaerung !== null) {
    actionList = situationErklaerung.actions || actionList;
    situationErklaerung = situationErklaerung.gesamtsituation || "Analyse geladen.";
  }

  // DEFENSIEVER CHECK 2: Falls das 6. Argument ein roher JSON-String ist
  if (typeof situationErklaerung === 'string' && situationErklaerung.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(situationErklaerung);
      actionList = parsed.actions || actionList;
      situationErklaerung = parsed.gesamtsituation || situationErklaerung;
    } catch (e) {}
  }

  // DEFENSIEVER CHECK 3 (DIE BRÜCKE): Falls actionList undefined ist, greifen wir auf das globale Backup zu!
  if ((!actionList || !Array.isArray(actionList) || actionList.length === 0) && window.lastParsedFazit && window.lastParsedFazit.actions) {
    actionList = window.lastParsedFazit.actions;
    console.log("fazit.js: Actions erfolgreich über globale State-Brücke geladen!", actionList);
  }

  let accentColor = accentColorFuerStatus(bfStatus);
  let labelHtml = baueStatusLabel(bfStatus, sfColor, welleDesc);
  
  // Normalisierung der Aktionen
  let cleanActions = [];
  if (actionList) {
    if (Array.isArray(actionList)) {
      cleanActions = actionList.map(item => String(item).trim()).filter(s => s.length > 0);
    } else if (typeof actionList === "string" && actionList.trim().length > 0) {
      cleanActions = actionList.split(/\n|- |• /).map(s => s.trim()).filter(s => s.length > 5);
    }
  }

  // Nutzen der bereinigten KI-Actions oder Aktivierung des regelbasierten Fallback-Systems
  let finalActions = (cleanActions.length > 0) ? cleanActions : getFallbackActions(bfStatus);
  let items = finalActions.map(item => `<li>${item}</li>`).join("");

  // Berechnung der Punkte-Differenz zum Vortag
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
      <div class="action-header" onclick="toggleActionBox(this)">
        <h3 style="color:${accentColor};">Deine Actions:</h3>
        <span id="actionToggleIcon" class="action-toggle-icon">▶ Anzeigen</span>
      </div>
      <!-- Standardmäßig zugeklappt -->
      <div class="action-content" style="display: none;">
        <ul class="action-list">${items}</ul>
      </div>
    </div>
  `;
}

// Global registrieren für inline Event-Handler
window.toggleActionBox = toggleActionBox;
window.buildFazitDuForm = buildFazitDuForm;
