// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ---
// ¡ACCIÓN REQUERIDA!
// Reemplaza este objeto de configuración con el de tu propio proyecto de Firebase.
//
// ¿Cómo obtenerlo?
// 1. Ve a la consola de Firebase: https://console.firebase.google.com/
// 2. Selecciona tu proyecto.
// 3. Haz clic en el ícono de engranaje (Configuración del proyecto) en la esquina superior izquierda.
// 4. En la pestaña "General", desplázate hacia abajo hasta "Tus apps".
// 5. Busca tu aplicación web y haz clic en el ícono "</>" para ver el fragmento de código de configuración.
// 6. Copia el objeto `firebaseConfig` completo y pégalo aquí.
// ---
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // <-- Pega tu clave aquí
  authDomain: "YOUR_AUTH_DOMAIN", // <-- Pega tu dominio aquí
  projectId: "YOUR_PROJECT_ID", // <-- Pega tu ID de proyecto aquí
  storageBucket: "YOUR_STORAGE_BUCKET", // <-- Pega tu bucket aquí
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // <-- Pega tu sender ID aquí
  appId: "YOUR_APP_ID" // <-- Pega tu App ID aquí
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
