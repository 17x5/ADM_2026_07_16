// Gesamtfazit-Box: Statuslabel + Action-Liste bleiben regelbasiert (klare Handlungsanweisungen),
// nur der Erklärungstext "situationErklaerung" kommt jetzt von Gemini.
// -> fallbackSituationErklaerung() ist die Notlösung falls die API mal nicht antwortet.

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

function actionItemsFuerStatus(bfStatus) {
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
      "Vermeide FOMO-Nachkäufe auf Allzeithochs."
    ];
  }
  if (bfStatus === "FALLENDES MESSER") {
    return [
      "Halte die Füsse still und warte auf die Bodenbestätigung.",
      "Lasse langfristige Sparpläne stur weiterlaufen."
    ];
  }
  if (bfStatus === "KORREKTUR") {
    return [
      "Keine Panikverkäufe. Der Markt atmet lediglich kurz durch.",
      "Bereite deine Watchlist für gezielte Schnäppchenkauf vor."
    ];
  }
  return [
    "Bleibe entspannt voll investiert.",
    "Nutze temporäre Dips als Nachkaufchance."
  ];
}

function fallbackSituationErklaerung(bfStatus, currentScore) {
  if (bfStatus === "MARKT-ILLUSION") {
    return `Deine Skepsis war absolut berechtigt! Die Euphoriephase der Welle 5 ist vorbei und wir befinden uns mitten in der Korrektur-Welle B. Große Indizes täuschen optisch noch Stabilität oder eine harmlose Seitwärtsphase vor (CNN Score: ${currentScore.toFixed(0)}), doch unter der Oberfläche bricht das fundamentale Marktbreiten-Gerüst komplett ein. Die breite Masse stützt diese Rallye nicht mehr – das Risiko einer Bullenfalle ist jetzt extrem hoch.`;
  }
  if (bfStatus === "ÜBERHITZT") {
    return `Die Marktstimmung kippt in extreme Gier. Die Bewertungen sind ausgereizt und die Luft wird dünn – passe deine Risiken jetzt proaktiv an.`;
  }
  if (bfStatus === "FALLENDES MESSER") {
    return `Akuter Panik-Abverkauf am Markt. Vermeide unüberlegte Spontankäufe, bis eine klare Bodenbildung erkennbar wird.`;
  }
  if (bfStatus === "KORREKTUR") {
    return `Ein vollkommen gesunder Rücksetzer im laufenden Zyklus. Nutze diese Marktphase gezielt zur Vorbereitung.`;
  }
  return `Der Aufwärtstrend ist intakt und stabil stützende Säulen signalisieren ein robustes Marktumfeld ohne akute Warnzeichen.`;
}

function buildFazitDuForm(bfStatus, sfColor, welleDesc, currentScore, previousClose, situationErklaerung) {
  let accentColor = accentColorFuerStatus(bfStatus);
  let labelHtml = baueStatusLabel(bfStatus, sfColor, welleDesc);
  let listHtml = actionItemsFuerStatus(bfStatus).map(item => `<li>${item}</li>`).join("");

  let diff = currentScore - previousClose;
  let diffText = "";
  let diffColor = "var(--text-dim)";

  if (diff > 0) {
    diffText = `▲ +${diff.toFixed(1)} Punkte im Vergleich zum Vortag (${previousClose.toFixed(0)})`;
    diffColor = "var(--green)";
  } else if (diff < 0) {
    diffText = `▼ ${diff.toFixed(1)} Punkte im Vergleich zum Vortag (${previousClose.toFixed(0)})`;
    diffColor = "var(--red)";
  } else {
    diffText = `■ Unverändert zum Vortag (${previousClose.toFixed(0)})`;
    diffColor = "var(--yellow)";
  }

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
