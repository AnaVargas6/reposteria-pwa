// /reposteria/js/fcm.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "AIzaSyAk2tL2_zTQ4oKkvPi3Yuvf_jOx390gIyA",
  authDomain: "reposteria-c408d.firebaseapp.com",
  projectId: "reposteria-c408d",
  storageBucket: "reposteria-c408d.firebasestorage.app",
  messagingSenderId: "1055870489222",
  appId: "1:1055870489222:web:e3f5ef440a0bf67495b707",
  measurementId: "G-Z6XFQ683XT"
};

const VAPID_KEY = "BF3S56UkeXDHOxgchei9ceb7MsupIkya-hFSJexRx7KlV1IUT4pI-KMC8oceM2YN9eD9Th1bpUfkrfx0OQHWTK0";
const first = location.pathname.split("/")[1] || "";
const BASE = first ? `/${first}` : "";
const FCM_SW_PATH = `${BASE}/firebase-messaging-sw.js`;
const SAVE_TOKEN_URL = `${BASE}/admin/save-token.php`;

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// 👉 Guarda el token globalmente para usarlo en fetch (cabecera X-Client-Token)
export async function getClientToken() {
  let t = localStorage.getItem("fcmToken");
  if (t) return t;
  return null;
}

// 👉 Notificación local (funciona sin internet)
export async function showLocalNotification(title, body, url = `${BASE}/index.html`) {
  if (!("serviceWorker" in navigator) || Notification.permission !== "granted") return;
  const reg = await navigator.serviceWorker.getRegistration(FCM_SW_PATH) || await navigator.serviceWorker.ready;
  await reg.showNotification(title, {
    body,
    icon: `${BASE}/images/icon-192.png`,
    data: { url },
    tag: "local-nuevo-producto",
    renotify: false
  });
}

async function activarNotificaciones() {
  try {
    if (Notification.permission !== "granted") {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { alert("Permite las notificaciones para continuar."); return; }
    }
    const reg = await navigator.serviceWorker.register(FCM_SW_PATH);
    const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: reg });
    if (!token) { alert("No se pudo obtener el token FCM."); return; }

    // Guarda token para usarlo luego en headers (anti-duplicado)
    localStorage.setItem("fcmToken", token);
    window.__fcmToken = token;

    // Envía token al backend
    await fetch(SAVE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });

    alert("¡Notificaciones activadas!");
  } catch (e) {
    console.error(e);
    alert("Error activando notificaciones. Revisa consola.");
  }
}

window.activarNotificaciones = activarNotificaciones;

// Primer plano opcional
onMessage(messaging, (payload) => {
  const d = payload?.data || {};
  if (Notification.permission === "granted") {
    new Notification(d.title || "Nuevo producto", {
      body: d.body || "Se agregó un nuevo producto.",
      icon: d.icon || `${BASE}/images/icon-192.png`,
    });
  }
});
