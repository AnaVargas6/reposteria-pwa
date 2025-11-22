// firebase-messaging-sw.js (RAÍZ)
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAk2tL2_zTQ4oKkvPi3Yuvf_jOx390gIyA",
  authDomain: "reposteria-c408d.firebaseapp.com",
  projectId: "reposteria-c408d",
  storageBucket: "reposteria-c408d.firebasestorage.app",
  messagingSenderId: "1055870489222",
  appId: "1:1055870489222:web:e3f5ef440a0bf67495b707",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const data = payload?.data || {};
  const title = data.title || "Nuevo producto";
  const body  = data.body  || "Se agregó un nuevo producto.";
  const icon  = data.icon  || "/images/icon-192.png";
  const url   = data.url   || "/";

  self.registration.showNotification(title, {
    body,
    icon,
    data: { url }
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || "/";
  event.waitUntil(clients.openWindow(url));
});
