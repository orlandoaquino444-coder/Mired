# Mi Red — proyecto inicial para GitHub + Render

Este repositorio contiene una base funcional para continuar Mi Red: interfaz adaptable, autenticación Firebase, publicaciones compartidas en Firestore, búsqueda, favoritos, edición/eliminación del propietario, carga de medios preparada para Cloudinary y una estructura de servidor segura.

## Importante: alcance real
No es honesto presentar todavía las 35 funciones como terminadas. Chat, notificaciones, reservas con bloqueo de horarios, panel de administración, publicidad pagada y suscripciones PayPal requieren implementación y pruebas adicionales. Premium no se activa desde el navegador; no se debe aceptar dinero hasta implementar y verificar los webhooks de PayPal.

## 1. Configurar Firebase
1. En Firebase Console, abre el proyecto `mi-red-a687d`.
2. En Authentication > Sign-in method, habilita Email/Password.
3. En Firestore Database, crea la base.
4. En Rules, publica el contenido de `firebase/firestore.rules`.
5. En Authentication > Settings > Authorized domains, agrega el dominio de Render cuando exista.
6. En el archivo `public/index.html`, comprueba el objeto `firebaseConfig`. La configuración web identifica el proyecto; la seguridad real depende de Authentication y Rules.

## 2. Configurar Cloudinary
En Cloudinary Console, busca API Key y API Secret. La nube es `olte8v49`.
- No pongas el API Secret en HTML, JavaScript del navegador ni GitHub.
- Configura `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET` en Render.
- Crea una cuenta de servicio Firebase Admin, guarda el JSON de forma segura y configura `FIREBASE_SERVICE_ACCOUNT_JSON` como variable de entorno (JSON en una sola línea). Nunca lo subas al repositorio.
- Para habilitar el endpoint firmado, instala Firebase Admin: `npm install firebase-admin` y vuelve a desplegar. El endpoint falla de forma cerrada si no se configuró la verificación.

## 3. Desplegar en Render
1. Sube esta carpeta a un repositorio de GitHub.
2. En Render elige **New > Web Service** y conecta el repositorio.
3. Runtime: Node.
4. Build Command: `npm install`.
5. Start Command: `npm start`.
6. Agrega las variables de entorno desde `.env.example` en el panel de Render. No subas `.env`.
7. Despliega y abre la URL. `/api/health` debe responder con `{"ok":true,"app":"Mi Red"}`.

## 4. Antes de producción
- Revisa y prueba las reglas de Firestore con cuentas distintas.
- Configura App Check y límites de uso.
- Implementa verificación de webhooks PayPal, cambios de estado, cancelación y renovaciones antes de ofrecer Premium.
- Implementa revisión de archivos, límites de tamaño y tipos MIME.
- Crea un rol de administrador asignado únicamente desde un entorno confiable.
- Publica política de privacidad, términos, reglas comunitarias y procedimiento de eliminación de cuenta.
- Verifica licencias y derechos de las imágenes, mapas y demás contenido publicado por los usuarios.

## Variables de Render
Consulta `.env.example`. No compartas valores secretos en chats ni capturas.
