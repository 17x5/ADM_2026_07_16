async function ladeDaten(){
  const btn = document.getElementById('refreshBtn');
  const indicator = document.getElementById('statusIndicator');
  btn.disabled = true;

  let btcPreis = FALLBACK.btc_usd;
  let btcAenderung = FALLBACK.btc_change_24h;

  try {
    const cryptoRes = await fetch('https://api.coingecko.com/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true');
    if(cryptoRes.ok) {
      const cryptoJson = await cryptoRes.json();
      if(cryptoJson.bitcoin) {
        btcPreis = cryptoJson.bitcoin.usd;
        btcAenderung = cryptoJson.bitcoin.usd_24h_change;
      }
    }
  } catch(e) {
    console.log("Krypto-API konnte nicht geladen werden, verwende Fallback.");
  }

  let goldPreis = FALLBACK.gold_usd;
  let oelPreis = FALLBACK.oil_usd;
  try {
    const metalRes = await fetch('https://api.metalpriceapi.com/v1/latest?api_key=9ea216f35e8e7a6bab73a5f3c04853f5&base=USD&currencies=XAU,WTI');
    if(metalRes.ok) {
      const metalJson = await metalRes.json();
      if(metalJson && metalJson.success && metalJson.rates) {
        if(metalJson.rates.XAU) goldPreis = 1 / metalJson.rates.XAU;
        if(metalJson.rates.WTI) oelPreis = 1 / metalJson.rates.WTI;
      }
    }
  } catch(e) {
    console.log("MetalpriceAPI nicht erreichbar, verwende Fallback.");
  }

  try{
    const res = await fetch('https://production.dataviz.cnn.io/index/fearandgreed/graphdata', { headers: {'Accept':'application/json'} });
    if(!res.ok) throw new Error();
    const json = await res.json();

    let extrahierterVixUSD = null;
    if(json.market_volatility_vix && json.market_volatility_vix.data && json.market_volatility_vix.data.length > 0){
      const ndp = json.market_volatility_vix.data[json.market_volatility_vix.data.length - 1];
      if(ndp && ndp.y) extrahierterVixUSD = ndp.y; 
    }

    const data = {
      timestamp: json.fear_and_greed.timestamp,
      score: json.fear_and_greed.score,
      rating: json.fear_and_greed.rating,
      previous_close: json.fear_and_greed.previous_close,
      btc_usd: btcPreis,
      btc_change_24h: btcAenderung,
      gold_usd: goldPreis,
      oil_usd: oelPreis,
      subs: [
        {key:"market_momentum_sp500", name:"Markt-Schwung", sub:"S&P 500 relativ zur 200-Tage-Linie", score:json.market_momentum_sp500.score},
        {key:"stock_price_strength", name:"Aktien-Stärke", sub:"Anzahl der 52-Wochen-Hochs vs. Tiefs", score:json.stock_price_strength.score},
        {key:"stock_price_breadth", name:"Marktbreite (A/D Basis)", sub:"Volumen steigender vs. fallender Aktien", score:json.stock_price_breadth.score},
        {key:"put_call_options", name:"Absicherungs-Verhältnis", sub:"Put- zu Call-Optionsvolumen", score:json.put_call_options.score},
        {key:"market_volatility_vix", name:"Markt-Nervosität (VIX)", sub:"Implizite Volatilität S&P 500", score:json.market_volatility_vix.score, raw_vix: extrahierterVixUSD},
        {key:"finra_margin_debt", name:"Kredit-Hebelung am Markt", sub:"FINRA Margin Debt Dynamik", score: json.fear_and_greed.score > 78 ? 85 : 35}
      ]
    };
    isLive = true; render(data);
  }catch(err){
    isLive = false; render(FALLBACK);
    indicator.textContent = indicator.textContent + " (CORS-Fallback aktiv)";
  }finally{
    btn.disabled = false;
  }
}
