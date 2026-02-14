import "@/lib/shim-storage";
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ---
// ¡ACCIÓN MUY IMPORTANTE!
// ---
// El siguiente objeto `firebaseConfig` CONTIENE DATOS DE EJEMPLO.
// DEBES REEMPLAZARLOS con las credenciales de tu propio proyecto de Firebase.
//
// Sigue estos pasos:
// 1. Ve a la consola de Firebase: https://console.firebase.google.com/
// 2. Selecciona tu proyecto y ve a "Configuración del proyecto" (el engranaje ⚙️).
// 3. En la pestaña "General", baja hasta "Tus apps".
// 4. Busca tu app web, haz clic en el ícono "</>" para ver el código de configuración.
// 5. Copia los valores del objeto `firebaseConfig` y pégalos aquí abajo.
// ---

const firebaseConfig = {
  // ==================> PEGA TUS CREDENCIALES AQUÍ <==================

  apiKey: "AIzaSyCcU9HP6ELT0SKyhVXyxMPebE4c5KqTi7g",

  authDomain: "mujer-app.firebaseapp.com",

  projectId: "mujer-app",

  storageBucket: "mujer-app.appspot.com",

  messagingSenderId: "731843251807",

  appId: "1:731843251807:web:244db05fd41c9fc55815ea",

  measurementId: "G-HZYB137Q23"


  // ==================> FIN DEL ÁREA PARA PEGAR <==================
};


// Initialize Firebase
// Esta lógica previene la re-inicialización en entornos de desarrollo (hot-reloading)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

let auth;
try {
  // Check if we are in a browser environment
  if (typeof window !== "undefined") {
    auth = getAuth(app);
  } else {
    // Server-side
    const { initializeAuth, inMemoryPersistence } = require("firebase/auth");
    // Try to initialize with in-memory persistence
    auth = initializeAuth(app, {
      persistence: inMemoryPersistence
    });
    console.error("[DEBUG] Server auth initialized successfully");
  }
} catch (e) {
  console.error("[DEBUG] Failed to initialize (likely already initialized). Error:", e);
  // If initializeAuth fails, it usually means it was already initialized.
  // We can try getAuth(app), but if that crashes, we should catch it too.
  try {
    auth = getAuth(app);
  } catch (e2) {
    console.error("[DEBUG] getAuth(app) also failed:", e2);
    // Return a mock or empty object to prevent crash
    auth = {} as any;
  }
}

export { db, auth };
