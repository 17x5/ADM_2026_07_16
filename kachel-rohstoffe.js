function renderKachelRohstoffe(data) {
  let html = "";
  let goldPreisWert = data.gold_usd;
  let oelPreisWert = data.oil_usd;
  let goldOelRatio = oelPreisWert > 0 ? (goldPreisWert / oelPreisWert) : 0;

  let ratioColor = "gelb";
  if (goldOelRatio > 22) ratioColor = "rot";
  else if (goldOelRatio < 16) ratioColor = "gruen";
  let ratioPercent = Math.min(100, Math.max(0, ((goldOelRatio - 5) / 25) * 100));
  html += buildQuickRowHTML(ratioColor, "Gold-Öl-Ratio", "Krisen- &amp; Risikobarometer: Unzenpreis Gold geteilt durch Fasspreis Öl", ratioPercent, goldOelRatio.toFixed(1) + " : 1");

  let goldPercent = Math.min(100, Math.max(0, ((goldPreisWert - 1800) / (4500 - 1800)) * 100));
  let formattedGoldPreis = new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(goldPreisWert);
  html += buildQuickRowHTML("gelb", "Goldpreis (Unze)", "Feinunze Gold, Spotpreis in US-Dollar", goldPercent, formattedGoldPreis);

  let oelColor = oelPreisWert > 90 ? "rot" : (oelPreisWert < 60 ? "gruen" : "gelb");
  let oelPercent = Math.min(100, Math.max(0, ((oelPreisWert - 40) / (120 - 40)) * 100));
  let formattedOelPreis = new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(oelPreisWert);
  html += buildQuickRowHTML(oelColor, "Ölpreis (WTI)", "US-Rohöl-Fasspreis (West Texas Intermediate) in US-Dollar", oelPercent, formattedOelPreis);

  document.getElementById('rowsSection4').innerHTML = html;
  document.getElementById('fazitContent4').innerHTML = "Analysiere…";
}

function fallbackFazitRohstoffe(data) {
  let goldPreisWert = data.gold_usd;
  let oelPreisWert = data.oil_usd;
  let goldOelRatio = oelPreisWert > 0 ? (goldPreisWert / oelPreisWert) : 0;
  let ratioColor = goldOelRatio > 22 ? "rot" : (goldOelRatio < 16 ? "gruen" : "gelb");
  let formattedGoldPreis = new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(goldPreisWert);
  let formattedOelPreis = new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(oelPreisWert);

  return `
    Die **Gold-Öl-Ratio steht bei ${goldOelRatio.toFixed(1)} : 1** (Gold ${formattedGoldPreis} / Öl ${formattedOelPreis}). Dieses Verhältnis gilt als Krisenbarometer: Steigt Gold gegenüber Öl stark an, flüchten Anleger in Sicherheit, während gleichzeitig eine schwache Konjunktur (niedrige Öl-Nachfrage) signalisiert wird.
    <br><br>
    ${ratioColor === 'rot' ? 'Eine Ratio über 22 ist historisch ein klassisches **Warnsignal für Rezessionsangst** oder eine akute Krise – Kapital sucht Sicherheit in Gold, während die Öl-Nachfrage (Konjunktur) einbricht.' : ratioColor === 'gruen' ? 'Eine Ratio unter 16 deutet auf ein **robustes, wachstumsorientiertes Umfeld** hin: Die Öl-Nachfrage ist stark, Gold wird weniger stark als Fluchtwährung nachgefragt.' : 'Die Ratio liegt aktuell im **neutralen Bereich** – weder ausgeprägte Krisenangst noch übermässiger Wachstumsoptimismus.'}
    <br><br>
    <span style="color:var(--yellow); font-weight:bold;">🛢️ Hintergrund:</span>
    Öl reagiert direkt auf die reale Wirtschaftsaktivität (Transport, Industrie), Gold auf Angst und Liquidität. Die Kombination beider Preise liefert ein Signal, das die reinen Aktienindikatoren oben nicht abdecken.
  `;
}
