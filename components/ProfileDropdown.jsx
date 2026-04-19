/**
 * ARCHIVO: components/ProfileDropdown.jsx
 * PAPEL: Menú de usuario interactivo y configuración personal.
 * DESCRIPCIÓN: Se ubica en la esquina superior derecha y permite al usuario ver 
 * su información básica de cuenta, configurar notificaciones locales, cambiar de cuenta 
 * o cerrar su sesión. Reacciona a clics fuera del menú para ocultarse mágicamente.
 */

import React, { useState, useRef, useEffect } from 'react';
// Importamos iconos visuales desde lucide-react para adornar el menú
import { LogOut, User, Users, Bell } from 'lucide-react';

// El componente recibe al "user" (datos de Firebase) y una función "onSignOut" (para deslogearse)
const ProfileDropdown = ({ user, onSignOut }) => {
    // Estado que controla si el menú colgante está a la vista o escondido
    const [isOpen, setIsOpen] = useState(false);
    // Referencia invisible conectada al HTML para saber si el usuario hizo clic adentro o afuera
    const dropdownRef = useRef(null);

    const [reminderTime, setReminderTime] = useState(localStorage.getItem('habitTracker_reminderTime') || '');
    const [isConfiguringReminder, setIsConfiguringReminder] = useState(false);

    const handleSaveReminder = () => {
        if (reminderTime) {
            localStorage.setItem('habitTracker_reminderTime', reminderTime);
            if (Notification.permission !== 'granted') {
                Notification.requestPermission();
            }
        } else {
            localStorage.removeItem('habitTracker_reminderTime');
        }
        setIsConfiguringReminder(false);
    };

    // Cerrar al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setIsConfiguringReminder(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    const displayName = user.displayName || 'Usuario';
    const email = user.email || '';
    const initial = displayName.charAt(0).toUpperCase();
    const photoURL = user.photoURL;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Botón de Perfil */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-dark-card hover:bg-dark-main border border-border-subtle p-1.5 pr-3 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-orange-200"
            >
                {photoURL ? (
                    <img src={photoURL} alt={displayName} className="w-8 h-8 rounded-full bg-dark-main border border-border-subtle object-cover" />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                        {initial}
                    </div>
                )}
                <span className="text-sm font-semibold text-text-primary hidden sm:block truncate max-w-[120px]">
                    {displayName}
                </span>
            </button>

            {/* Menú Desplegable */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-dark-card rounded-2xl shadow-lg border border-border-subtle py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-gray-50 flex flex-col">
                        <span className="text-sm font-bold text-text-primary truncate">{displayName}</span>
                        <span className="text-xs text-text-secondary truncate">{email}</span>
                    </div>

                    {!isConfiguringReminder ? (
                        <div className="mt-1">
                            <button
                                onClick={() => setIsConfiguringReminder(true)}
                                className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-dark-main hover:text-text-primary flex items-center justify-between transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Bell size={16} className={reminderTime ? "text-blue-500" : "text-text-secondary"} />
                                    Notificaciones
                                </div>
                                {reminderTime && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">{reminderTime}</span>}
                            </button>
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    onSignOut();
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-dark-main hover:text-text-primary flex items-center gap-2 transition-colors"
                            >
                                <Users size={16} className="text-text-secondary" />
                                Cambiar de cuenta
                            </button>
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    onSignOut();
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                            >
                                <LogOut size={16} className="text-red-400" />
                                Cerrar sesión
                            </button>
                        </div>
                    ) : (
                        <div className="px-4 py-3 bg-dark-main border-t border-border-subtle">
                            <label className="block text-xs font-bold text-text-primary mb-2">Recordatorio diario</label>
                            <input
                                type="time"
                                value={reminderTime}
                                onChange={(e) => setReminderTime(e.target.value)}
                                className="w-full text-sm p-1.5 border border-border-subtle rounded focus:ring-2 focus:ring-blue-200 outline-none mb-2"
                            />
                            <div className="flex gap-2">
                                <button onClick={() => setReminderTime('')} className="flex-1 text-[10px] text-text-secondary font-bold hover:text-red-500 transition-colors">Desactivar</button>
                                <button onClick={handleSaveReminder} className="flex-1 bg-blue-500 text-white text-[10px] font-bold py-1.5 rounded hover:bg-blue-600 transition-colors">Guardar</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;
