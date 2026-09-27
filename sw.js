/* PINTU Kukar — service worker: halaman tetap terbuka walau sinyal lemah.
   Hanya berkas situs yang disimpan. Daftar berkas disimpan terpisah (IndexedDB) oleh aplikasi. */
var CACHE = "pintu-v1";
var INTI = ["./", "index.html", "assets/css/style.css", "assets/js/config.js", "assets/js/cari.js", "assets/js/app.js", "manifest.webmanifest", "assets/img/favicon.svg", "assets/img/icon-192.png"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(INTI).catch(function () {}); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin === self.location.origin) {
    e.respondWith(fetch(req, { cache: "no-cache" }).then(function (res) {
      if (res && res.ok) { var salin = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, salin); }); }
      return res;
    }).catch(function () {
      return caches.match(req, { ignoreSearch: true }).then(function (r) { return r || caches.match("index.html"); });
    }));
    return;
  }
  if (/^fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.match(req).then(function (r) {
      return r || fetch(req).then(function (res) { var salin = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, salin); }); return res; });
    }));
  }
});
