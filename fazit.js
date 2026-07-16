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

/**
 * Steuert das Auf- und Zuklappen der Actions-Box inklusive Icon-Wechsel.
 * Nutzt 'header', um relativ im DOM zu suchen – extrem stabil und resistent gegen Konflikte.
 */
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
      console.log("fazit.js: Actions-Box geöffnet.");
    } else {
      content.style.display = "none";
      icon.textContent = "▶ Anzeigen";
      console.log("fazit.js: Actions-Box geschlossen.");
    }
  } else {
    console.error("fazit.js: .action-content oder .action-toggle-icon fehlt innerhalb der Box.");
  }
}

/**
 * Hauptfunktion: Erstellt das HTML für das Gesamtfazit im Original-Layout.
 * Befüllt die Actions-Liste dynamisch aus den KI-Daten oder nutzt das Fallback.
 */
function buildFazitDuForm(bfStatus, sfColor, welleDesc, currentScore, previousClose, situationErklaerung, actionList) {
  console.log("fazit.js: buildFazitDuForm aufgerufen mit:", { bfStatus, sfColor, welleDesc, currentScore, previousClose });
  console.log("fazit.js: Erhaltene raw actionList von KI:", actionList);

  let accentColor = accentColorFuerStatus(bfStatus);
  let labelHtml = baueStatusLabel(bfStatus, sfColor, welleDesc);
  
  // Extrem robuster Normalisierungs-Parser für jegliche Formate der Action-List
  let cleanActions = [];
  if (actionList) {
    if (Array.isArray(actionList)) {
      // Wenn es ein Array ist, konvertiere jedes Element sauber in Text
      cleanActions = actionList.map(item => {
        if (!item) return "";
        if (typeof item === "string") return item.trim();
        if (typeof item === "object") {
          // Falls die KI Objekte wie { text: "Aktion" } liefert
          return item.text || item.action || item.desc || JSON.stringify(item);
        }
        return String(item).trim();
      }).filter(item => item.length > 0);
    } else if (typeof actionList === "object") {
      // Falls ein Objekt mit Keys { "1": "Aktion", "2": "Aktion" } geliefert wird
      cleanActions = Object.values(actionList).map(item => {
        if (!item) return "";
        return typeof item === "string" ? item.trim() : String(item).trim();
      }).filter(item => item.length > 0);
    } else if (typeof actionList === "string" && actionList.trim().length > 0) {
      // Falls ein einziger langer String geliefert wird, versuche ihn an Zeilenumbrüchen oder Aufzählungen zu splitten
      const lines = actionList.split(/\n|- |• /).map(s => s.trim()).filter(s => s.length > 5);
      if (lines.length > 1) {
        cleanActions = lines;
      } else {
        cleanActions = [actionList.trim()];
      }
    }
  }

  // Nutzen der bereinigten KI-Actions, sonst Aktivierung des passgenauen Fallback-Systems
  let finalActions = (cleanActions.length > 0) 
    ? cleanActions 
    : getFallbackActions(bfStatus);

  console.log("fazit.js: Finale verarbeitete Actions zur Anzeige:", finalActions);

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
      <!-- Durch style="display: none;" standardmäßig beim Start unsichtbar -->
      <div class="action-content" style="display: none;">
        <ul class="action-list">${items}</ul>
      </div>
    </div>
  `;
}

// EXPLIZITE GLOBALE REGISTRIERUNG:
// Garantiert, dass inline 'onclick'-Attribute im dynamisch geladenen HTML 
// die Funktionen unabhängig von Ladezeiten oder Modulscoping immer finden!
window.toggleActionBox = toggleActionBox;
window.buildFazitDuForm = buildFazitDuForm;
