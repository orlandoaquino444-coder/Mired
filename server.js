require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cloudinary = require("cloudinary").v2;
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://www.gstatic.com", "https://www.googleapis.com", "https://www.google.com", "https://www.paypal.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://*.googleusercontent.com"],
      connectSrc: ["'self'", "https://identitytoolkit.googleapis.com", "https://securetoken.googleapis.com", "https://firestore.googleapis.com", "https://*.googleapis.com", "https://api.cloudinary.com", "https://res.cloudinary.com"],
      frameSrc: ["https://www.paypal.com"],
      objectSrc: ["'none'"]
    }
  }
}));
app.use(express.json({ limit: "100kb" }));
app.use("/api", rateLimit({ windowMs: 60_000, limit: 100, standardHeaders: true, legacyHeaders: false }));
app.use(express.static(path.join(__dirname, "public")));

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudKey = process.env.CLOUDINARY_API_KEY;
const cloudSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && cloudKey && cloudSecret) {
  cloudinary.config({ cloud_name: cloudName, api_key: cloudKey, api_secret: cloudSecret, secure: true });
}

app.get("/api/health", (_req, res) => res.json({ ok: true, app: "Mi Red" }));

// Client requests a short-lived signature. Firebase ID token is required so the
// server can associate uploads with an authenticated account. Verify token via
// Firebase Admin before production; this endpoint intentionally fails closed
// until FIREBASE_ADMIN credentials are configured.
app.post("/api/cloudinary/signature", async (req, res) => {
  try {
    if (!cloudName || !cloudKey || !cloudSecret) {
      return res.status(503).json({ error: "Falta configurar Cloudinary en las variables de entorno de Render." });
    }
    const auth = req.headers.authorization || "";
    const idToken = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!idToken) return res.status(401).json({ error: "Inicia sesión para subir archivos." });

    let uid;
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const admin = require("firebase-admin");
      if (!admin.apps.length) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
      }
      const decoded = await admin.auth().verifyIdToken(idToken);
      uid = decoded.uid;
    } else {
      return res.status(503).json({ error: "Falta configurar la verificación Firebase Admin en Render." });
    }

    const resourceType = req.body?.resourceType === "video" ? "video" : "image";
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `mi-red/${uid}`;
    const params = { timestamp, folder, resource_type: resourceType };
    const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, cloudSecret);
    res.json({ cloudName, apiKey: cloudKey, timestamp, folder, signature, resourceType, uid });
  } catch (_e) {
    res.status(401).json({ error: "No se pudo autorizar la subida." });
  }
});

// PayPal subscription creation/capture must be implemented with server-side
// OAuth credentials and verified webhooks before Premium can be activated.
app.get("/api/premium/status", (_req, res) => {
  res.json({ configured: Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET && process.env.PAYPAL_PLAN_ID), message: "Premium solo debe activarse tras verificar el estado en PayPal desde el servidor." });
});

app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.listen(PORT, () => console.log(`Mi Red escuchando en el puerto ${PORT}`));
