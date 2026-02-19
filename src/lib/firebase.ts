import "@/lib/shim-storage";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCcU9HP6ELT0SKyhVXyxMPebE4c5KqTi7g",
  authDomain: "mujer-app.firebaseapp.com",
  projectId: "mujer-app",
  storageBucket: "mujer-app.firebasestorage.app",
  messagingSenderId: "731843251807",
  appId: "1:731843251807:web:244db05fd41c9fc55815ea",
  measurementId: "G-HZYB137Q23"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

let storage: ReturnType<typeof getStorage>;
try {
  storage = getStorage(app);
} catch (e) {
  // Storage might fail on server-side or if config is missing bucket
  console.warn("Storage init warning:", e);
  storage = {} as any;
}

let auth: Auth;
try {
  if (typeof window !== "undefined") {
    auth = getAuth(app);
  } else {
    // Server-side
    const { initializeAuth, inMemoryPersistence } = require("firebase/auth");
    auth = initializeAuth(app, {
      persistence: inMemoryPersistence
    });
  }
} catch (e) {
  // If initializeAuth fails, try getAuth
  try {
    auth = getAuth(app);
  } catch (e2) {
    auth = {} as any;
  }
}

export { db, auth, storage };
