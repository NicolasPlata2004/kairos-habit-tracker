/**
 * ARCHIVO: components/AuthScreen.jsx
 * PAPEL: Pantalla de inicio de sesión y barrera de seguridad de la aplicación.
 * DESCRIPCIÓN: Este componente es la puerta de entrada geográfica de la app. 
 * Si un usuario no está autenticado, React "bloquea" la entrada y muestra esta pantalla.
 * Aquí manejamos exclusivamente la conexión con el proveedor de identidades de Google.
 */

import React, { useState } from 'react';
// Importamos la función nativa de Firebase que invoca la redirección de Google (ideal para móviles)
import { signInWithRedirect } from 'firebase/auth';
// Importamos nuestras llaves instanciadas de firebase.js
import { auth, googleProvider } from '../firebase';

// Componente visual: Pantalla de bienvenida que aparece cuando el usuario no ha iniciado sesión
const AuthScreen = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Función que dispara el login con Google
    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            // Cambiamos a signInWithPopup temporalmente para evitar el bug de ciclo de redirección infinita
            // luego de vaciar la caché.
            const { signInWithPopup } = await import('firebase/auth');
            await signInWithPopup(auth, googleProvider);
        } catch (err) {
            console.error("Error de Firebase:", err);
            // Mensaje más descriptivo si es posible
            if (err.code === 'auth/unauthorized-domain') {
                setError('Este dominio (IP) no está autorizado en tu consola de Firebase.');
            } else {
                setError(`Error: ${err.message || 'No se pudo iniciar sesión.'}`);
            }
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f0f9fb] to-[#fbd4bc] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-10 w-full max-w-sm flex flex-col items-center gap-6">

                {/* Logo / Emoji */}
                <img src="/logo.png" alt="Kairos" className="w-32 h-32 object-contain" />

                {/* Título */}
                <div className="text-center">
                    <h1 className="text-3xl font-black text-gray-800 mb-1">Kairos</h1>
                    <p className="text-sm text-gray-500">Inicia sesión para sincronizar tus hábitos en todos tus dispositivos</p>
                </div>

                {/* Botón Google */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-md rounded-xl py-3 px-4 transition-all font-semibold text-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {/* Logo Google SVG */}
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    {loading ? 'Iniciando sesión...' : 'Continuar con Google'}
                </button>

                {/* Botón Bypass (Solo para testing / Modo Local) */}
                <button
                    onClick={() => {
                        // Simulamos login vacío para que la app cargue en modo local temporalmente
                        if (window.bypassAuth) window.bypassAuth();
                    }}
                    className="w-full text-center text-xs text-gray-400 hover:text-gray-600 underline"
                >
                    Continuar sin cuenta (Modo Local)
                </button>

                {/* Error */}
                {error && <p className="text-xs text-red-500 text-center">{error}</p>}

                {/* Footer note */}
                <p className="text-[10px] text-gray-400 text-center">
                    Tus datos se sincronizan de forma segura entre todos tus dispositivos.
                </p>
            </div>
        </div>
    );
};

export default AuthScreen;
