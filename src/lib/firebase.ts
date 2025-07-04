// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ---
// ¡ACCIÓN MUY IMPORTANTE!
// ---
// El siguiente objeto `firebaseConfig` CONTIENE DATOS DE EJEMPLO.
// DEBES REEMPLAZARLOS con las credenciales de tu propio proyecto de Firebase
// para que la aplicación pueda funcionar.
//
// Sigue estos pasos para obtener tus credenciales:
// 1. Ve a la consola de Firebase: https://console.firebase.google.com/
// 2. Selecciona tu proyecto.
// 3. Haz clic en el ícono de engranaje (Configuración del proyecto).
// 4. En la pestaña "General", baja hasta "Tus apps".
// 5. Busca tu aplicación web y haz clic en el ícono "</>" para ver el código.
// 6. Copia el objeto `firebaseConfig` completo y pégalo aquí abajo,
//    reemplazando el objeto de ejemplo.
// ---
const firebaseConfig = {
  apiKey: "¡REEMPLAZAR! - Pega tu clave de API aquí",
  authDomain: "¡REEMPLAZAR! - Pega tu Auth Domain aquí",
  projectId: "¡REEMPLAZAR! - Pega tu Project ID aquí",
  storageBucket: "¡REEMPLAZAR! - Pega tu Storage Bucket aquí",
  messagingSenderId: "¡REEMPLAZAR! - Pega tu Sender ID aquí",
  appId: "¡REEMPLAZAR! - Pega tu App ID aquí"
};


// Initialize Firebase
// Si ves errores en la consola del navegador sobre "API Key not valid",
// es porque aún no has reemplazado el `firebaseConfig` de arriba.
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
