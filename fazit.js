/**
 * Hauptfunktion: Erstellt das HTML.
 * NUKLEAR-TEST: Inhalte sind jetzt standardmäßig sichtbar und rot markiert.
 */
function buildFazitDuForm(bfStatus, sfColor, welleDesc, currentScore, previousClose, situationErklaerung, actionList) {
  
  // 1. Validierung (wie gehabt)
  if (typeof situationErklaerung === 'object' && situationErklaerung !== null) {
    actionList = situationErklaerung.actions || actionList;
    situationErklaerung = situationErklaerung.gesamtsituation || "Analyse geladen.";
  }
  
  // Fallback laden, falls actions fehlt
  if ((!actionList || actionList.length === 0) && window.lastParsedFazit) {
    actionList = window.lastParsedFazit.actions;
  }

  let finalActions = (Array.isArray(actionList) && actionList.length > 0) 
    ? actionList 
    : ["Keine Aktionen definiert."];

  let items = finalActions.map(item => `<li>${item}</li>`).join("");

  // NUKLEAR-TEST: Wir erzwingen Sichtbarkeit und Farbe
  return `
    <style>
      .DEBUG_RED_CONTAINER {
        border: 3px solid red !important;
        background: yellow !important;
        color: black !important;
        padding: 20px !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        position: relative !important;
        z-index: 9999 !important;
      }
      .DEBUG_RED_CONTAINER ul {
        display: block !important;
        list-style-type: disc !important;
      }
      .DEBUG_RED_CONTAINER li {
        color: black !important;
        font-size: 16px !important;
        display: list-item !important;
      }
    </style>
    
    <div class="DEBUG_RED_CONTAINER">
      <h2>DEBUG-MODUS AKTIV</h2>
      <p>Situation: ${situationErklaerung}</p>
      <ul>${items}</ul>
    </div>
  `;
}

// Global registrieren
window.buildFazitDuForm = buildFazitDuForm;
