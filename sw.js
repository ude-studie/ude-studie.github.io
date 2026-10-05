/*
 * Aufräum-Worker. Früher lag die Schulung im Hauptordner und hat hier einen
 * Offline-Cache registriert. Die Studie braucht ihn nicht mehr; Geräte, die
 * die alte Fassung kannten, holen sich beim nächsten Besuch diese Datei,
 * löschen den alten Cache und melden den Worker ab. Danach lädt alles
 * wieder direkt aus dem Netz. boost/sw.js (eigener Bereich) bleibt unberührt.
 */
self.addEventListener("install", function () { self.skipWaiting(); });

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) { return /^boost-/.test(k); })
          .map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.registration.unregister(); })
      .then(function () { return self.clients.matchAll({ type: "window" }); })
      .then(function (clients) {
        clients.forEach(function (c) { c.navigate(c.url); });
      })
  );
});
