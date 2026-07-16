// Cached nur die App-Dateien (HTML/CSS/JS/Icons), damit die App auch offline startet.
// API-Calls (CNN, CoinGecko, MetalpriceAPI, Gemini) laufen immer live über das Netz.
// -> Version hochzählen (v2, v3, ...), wenn nach einem Update der alte Cache geleert werden soll.
const CACHE_NAME = "marktsentiment-v1";

const APP_DATEIEN = [
  "./index.html",
  "./style.css",
  "./config.js",
  "./helpers.js",
  "./utils.js",
  "./ampel-logik.js",
  "./fazit.js",
  "./kachel-sentiment.js",
  "./kachel-trend.js",
  "./kachel-struktur.js",
  "./kachel-rohstoffe.js",
  "./data-fetch.js",
  "./gemini-client.js",
  "./gemini-prompts.js",
  "./main.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Falls die API einen Fehlercode liefert (z.B. 401),
        // geben wir die Antwort normal zurück, damit die App darauf reagieren kann.
        return response;
      })
      .catch((error) => {
        // Hier landen wir, wenn das Netzwerk komplett down ist.
        // Wir versuchen, die Datei aus dem Cache zu laden.
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Wenn auch im Cache nichts ist, werfen wir keinen Fehler, 
          // sondern könnten eine Fallback-Seite zurückgeben.
          throw error;
        });
      })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((namen) =>
      Promise.all(
        namen.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Nur eigene App-Dateien aus dem Cache bedienen, alle anderen Domains (APIs) live laufen lassen.
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((treffer) => treffer || fetch(event.request))
  );
});
