# PWA Repostería – Notificaciones Push

## 1. Configuración y activación de Push Notifications

- Proyecto configurado en Firebase (reposteria-c408d) con Cloud Messaging habilitado.
- Archivo `/reposteria/js/fcm.js`:
  - Inicializa la app de Firebase con `initializeApp`.
  - Configura `getMessaging` para usar Firebase Cloud Messaging.
  - Define la VAPID Public Key para obtener el token WebPush.
  - Calcula rutas dinámicas para `firebase-messaging-sw.js` y `admin/save-token.php`.
  - Implementa la función `activarNotificaciones()` que:
    - Pide permiso de notificaciones al usuario.
    - Registra el Service Worker `firebase-messaging-sw.js`.
    - Obtiene el FCM Token con `getToken`.
    - Guarda el token en `localStorage`.
    - Envía el token al backend (`save-token.php`) mediante `fetch`.

- Archivo `firebase-messaging-sw.js`:
  - Inicializa Firebase en el Service Worker.
  - Usa `messaging.onBackgroundMessage` para mostrar notificaciones cuando la PWA está en segundo plano.
  - Maneja el evento `notificationclick` para abrir la URL indicada en la notificación.

## 2. Vinculación de Push Notifications con la base de datos

- Tabla `fcm_tokens` en MySQL para almacenar los FCM Tokens de cada navegador.
- Archivo `/reposteria/admin/save-token.php`:
  - Recibe el token en formato JSON.
  - Valida que no esté vacío.
  - Lo inserta en la tabla `fcm_tokens` con `INSERT IGNORE` para evitar duplicados.
  - Responde con un JSON que indica si la operación fue exitosa.

- Archivo `/reposteria/admin/send-notification.php`:
  - Carga las credenciales del Service Account desde `firebase-key.json`.
  - Genera un JWT firmado con la Private Key del servicio.
  - Obtiene un `access_token` desde `https://oauth2.googleapis.com/token`.
  - Construye el cuerpo del mensaje con `webpush.notification` y `data`.
  - Envía notificaciones a cada token usando la API HTTP v1 de FCM.
  - Devuelve un resumen con la cantidad de envíos exitosos.

## 3. Ejecución del proyecto

1. Clonar el repositorio.
2. Configurar `firebase-key.json` con el Service Account de Firebase.
3. Ajustar las constantes de Firebase en `fcm.js` y `firebase-messaging-sw.js` si es necesario.
4. Configurar la base de datos y crear la tabla `fcm_tokens`.
5. Levantar el servidor (por ejemplo con XAMPP) y abrir la PWA en el navegador.
6. Desde la interfaz de administración, pulsar el botón "Permitir notificaciones" para registrar el token.
