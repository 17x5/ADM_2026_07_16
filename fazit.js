/**
 * Hilfsfunktion zur Ermittlung des passenden Ampel-Emojis
 * Falls getEmojiColor in den helpers.js definiert ist, wird diese genutzt, 
 * andernfalls greift dieses Fallback.
 */
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

/**
 * Erstellt das beschreibende Label für die aktuelle Marktphase
 */
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

/**
 * Bestimmt die passende CSS-Farbe für die Rahmen-Hervorhebung
 */
function accentColorFuerStatus(bfStatus) {
  if (bfStatus === "MARKT-ILLUSION" || bfStatus === "ÜBERHITZT") return "var(--red)";
  if (bfStatus === "FALLENDES MESSER" || bfStatus === "KORREKTUR") return "var(--yellow)";
  return "var(--green)";
}

/**
 * Regelbasiertes Fallback-System für Aktionen, falls die KI-Schnittstelle
 * verzögert reagiert oder keine Daten liefert.
 */
function getFallbackActions(bfStatus) {
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

/**
 * Steuert das Auf- und Zuklappen der Actions-Box inklusive Icon-Wechsel
 */
function toggleActionBox() {
  const content = document.querySelector(".action-content");
  const icon = document.getElementById("actionToggleIcon");
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

/**
 * Hauptfunktion: Erstellt das HTML für das Gesamtfazit im Original-Layout.
 * Befüllt die Actions-Liste dynamisch aus den KI-Daten oder nutzt das Fallback.
 */
function buildFazitDuForm(bfStatus, sfColor, welleDesc, currentScore, previousClose, situationErklaerung, actionList) {
  let accentColor = accentColorFuerStatus(bfStatus);
  let labelHtml = baueStatusLabel(bfStatus, sfColor, welleDesc);
  
  // Validierung der KI-Aktionen
  let cleanActions = Array.isArray(actionList) 
    ? actionList.filter(item => item && typeof item === "string" && item.trim().length > 0) 
    : [];

  // Nutzen der KI-Actions, sonst Aktivierung des passgenauen Fallback-Systems
  let finalActions = (cleanActions.length > 0) 
    ? cleanActions 
    : getFallbackActions(bfStatus);

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
      <div class="action-header" onclick="toggleActionBox()">
        <h3 style="color:${accentColor};">Deine Actions:</h3>
        <span id="actionToggleIcon" class="action-toggle-icon">▶ Anzeigen</span>
      </div>
      <!-- Durch style="display: none;" standardmäßig beim Start unsichtbar -->
      <div class="action-content" style="display: none;">
        <ul class="action-list">${items}</ul>
      </div>
    </div>
  `;
}
