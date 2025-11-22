const CACHE_NAME = "reposteria-cache-v3";
const urlsToCache = [
  "index.html",
  "styles.css",
  "manifest.json",
  "images/pastel_chocolate.jpg",
  "images/mini_vainilla.jpg",
  "images/icon-192.png",
  "images/icon-512.png",
  // Admin
  "admin/login.html",      // ✅ login progresivo
  "admin/menu.html",
  "admin/productos.html",
  "admin/ingredientes.html",
  "admin/pedidos.html"
];

// --- Instalación ---
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Archivos cacheados correctamente");
      return cache.addAll(urlsToCache);
    })
  );
});

// --- Activación ---
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log("Eliminando caché viejo:", name);
            return caches.delete(name);
          }
        })
      );
    })
  );
});

// --- Interceptar peticiones ---
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        return response;
      })
      .catch(() => {
        // Si no hay conexión, intenta servir desde el caché
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;

          // Si pide login.php y no hay conexión, sirve login.html
          if (event.request.url.includes("login.php")) {
            return caches.match("admin/login.html");
          }

          return Promise.reject("No hay conexión ni caché disponible");
        });
      })
  );
});
