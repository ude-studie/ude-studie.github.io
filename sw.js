/* Offline-Cache: erst Netz, bei fehlendem Netz der zuletzt geladene Stand. */
var CACHE = "boost-v2";
var FILES = ["./", "index.html", "app.js", "content.js", "styles.css",
  "assets/foto-hoersaal.jpg", "assets/foto-hund.jpg", "assets/foto-mia-pasta.jpg", "assets/foto-tom-lissabon.jpg", "assets/foto-weiter.jpg", "assets/video-jonas-lauf.jpg", "assets/video-mia-pasta.jpg", "assets/video-tom-lissabon.jpg", "assets/video-weiter.jpg"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then(function (res) {
      if (res.ok) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req, { ignoreSearch: true });
    })
  );
});
