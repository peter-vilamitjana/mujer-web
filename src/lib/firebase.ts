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
  
  apiKey: "AQUÍ_VA_TU_API_KEY",
  authDomain: "AQUÍ_VA_TU_AUTH_DOMAIN",
  projectId: "AQUÍ_VA_TU_PROJECT_ID",
  storageBucket: "AQUÍ_VA_TU_STORAGE_BUCKET",
  messagingSenderId: "AQUÍ_VA_TU_MESSAGING_SENDER_ID",
  appId: "AQUÍ_VA_TU_APP_ID"

  // ==================> FIN DEL ÁREA PARA PEGAR <==================
};


// Initialize Firebase
// Esta lógica previene la re-inicialización en entornos de desarrollo (hot-reloading)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
