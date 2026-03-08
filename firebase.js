/**
 * ARCHIVO: firebase.js
 * PAPEL: Configuración maestra y conexión con los servicios en la nube de Firebase.
 * DESCRIPCIÓN: Se encarga de leer las credenciales seguras (Variables de Entorno .env),
 * inicializar la aplicación remota y exportar las "llaves" necesarias (Base de datos, 
 * Autenticación de Google) para que el resto de los componentes React puedan comunicarse 
 * con la base de datos y validar sesiones.
 */
// =====================================================
// CONFIGURACIÓN DE FIREBASE
// INSTRUCCIONES: Los valores reales deben vivir en tu archivo .env
// =====================================================

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ⬇️ PEGA AQUÍ TUS CREDENCIALES DE FIREBASE (reemplaza cada valor)
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Exportamos variable para saber si el usuario ya configuró sus llaves
export const isConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== "PEGA_AQUI_TU_API_KEY";

// Inicializa Firebase con tu config (solo si está configurado)
const app = isConfigured ? initializeApp(firebaseConfig) : null;

// Exportamos el servicio de Auth (para login/logout)
export const auth = isConfigured ? getAuth(app) : null;

// Exportamos el proveedor de Google
export const googleProvider = isConfigured ? new GoogleAuthProvider() : null;
if (googleProvider) {
    googleProvider.setCustomParameters({ prompt: 'select_account' });
}

// Exportamos la base de datos Firestore
export const db = isConfigured ? getFirestore(app) : null;
