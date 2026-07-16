// Bestimmt Marktphase (bfStatus/sfColor/welleDesc), aktualisiert SVG-Punkt und Legende.
// -> Hier anpassen, wenn sich Schwellenwerte für die Ampel-Phasen ändern sollen.
function berechneMarktStatus(data, vix, breadth, marginDebt) {
  let rawVix = vix ? (vix.raw_vix || 16.90) : 16.90;
  let vixColor = "gelb";
  if (rawVix < 15.5) vixColor = "gruen";
  else if (rawVix > 24.0) vixColor = "rot";

  let cnnColor = "gelb";
  if(data.score < 25 || data.score > 75) cnnColor = "rot";
  else if(data.score >= 45 && data.score <= 55) cnnColor = "gruen";

  let bfStatus = "GESUND";
  let sfColor = "gruen"; 
  let welleDesc = "Trend läuft stabil";
  let activeLegId = "leg_W3";

  let actBreadth = breadth ? breadth.score : 50;

  if (data.score >= 76 || (marginDebt && marginDebt.score > 80)) {
    bfStatus = "ÜBERHITZT"; 
    sfColor = "rot"; 
    welleDesc = "Welle 5 erreicht (Top-Gefahr durch Überhebelung)";
    activeLegId = "leg_W5";
    updateSvgNode(450, 35, "var(--purple)", "Welle 5 (IST)");
  } 
  else if (actBreadth < 35 && data.score >= 35) {
    bfStatus = "MARKT-ILLUSION"; 
    sfColor = "rot"; 
    welleDesc = "Verdeckte Schwäche in Welle B (Index täuscht Stabilität vor, Fundament bricht ein)";
    activeLegId = "leg_WelleB";
    updateSvgNode(535, 65, "var(--red)", "Welle B (IST)");
  }
  else if (data.score < 30 && rawVix > 24.0) {
    bfStatus = "FALLENDES MESSER"; 
    sfColor = "gelb"; 
    welleDesc = "Welle C läuft (Panik-Abverkauf ohne Boden)";
    activeLegId = "leg_WelleC";
    updateSvgNode(580, 210, "var(--red)", "Welle C (IST)");
  } 
  else if (data.score < 45 || actBreadth < 45) {
    bfStatus = "KORREKTUR"; 
    sfColor = "gelb"; 
    welleDesc = "Welle A/B (Gesunder Rücksetzer)";
    activeLegId = "leg_WelleA";
    updateSvgNode(495, 125, "var(--yellow)", "Welle A (IST)");
  } else {
    updateSvgNode(320, 50, "var(--green)", "Trend (IST)");
  }

  document.querySelectorAll('.legende-item').forEach(item => {
    item.classList.remove('active');
    item.style.backgroundColor = '#0d1117';
  });
  const activeItem = document.getElementById(activeLegId);
  if(activeItem) {
    activeItem.classList.add('active');
    activeItem.style.backgroundColor = '#1c1618';
  }

  return { rawVix, vixColor, cnnColor, bfStatus, sfColor, welleDesc, actBreadth };
}
