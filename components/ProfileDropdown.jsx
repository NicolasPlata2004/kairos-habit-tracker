import React, { useState, useRef, useEffect } from 'react';
import { LogOut, User, Users, Bell } from 'lucide-react';

const ProfileDropdown = ({ user, onSignOut }) => {
    const [isOpen, setIsOpen] = useState(false);
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
                className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 p-1.5 pr-3 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-orange-200"
            >
                {photoURL ? (
                    <img src={photoURL} alt={displayName} className="w-8 h-8 rounded-full bg-gray-200 object-cover" />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                        {initial}
                    </div>
                )}
                <span className="text-sm font-semibold text-gray-700 hidden sm:block truncate max-w-[120px]">
                    {displayName}
                </span>
            </button>

            {/* Menú Desplegable */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-gray-50 flex flex-col">
                        <span className="text-sm font-bold text-gray-800 truncate">{displayName}</span>
                        <span className="text-xs text-gray-500 truncate">{email}</span>
                    </div>

                    {!isConfiguringReminder ? (
                        <div className="mt-1">
                            <button
                                onClick={() => setIsConfiguringReminder(true)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 flex items-center justify-between transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Bell size={16} className={reminderTime ? "text-blue-500" : "text-gray-400"} />
                                    Notificaciones
                                </div>
                                {reminderTime && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">{reminderTime}</span>}
                            </button>
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    onSignOut();
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-2 transition-colors"
                            >
                                <Users size={16} className="text-gray-400" />
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
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                            <label className="block text-xs font-bold text-gray-700 mb-2">Recordatorio diario</label>
                            <input
                                type="time"
                                value={reminderTime}
                                onChange={(e) => setReminderTime(e.target.value)}
                                className="w-full text-sm p-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-blue-200 outline-none mb-2"
                            />
                            <div className="flex gap-2">
                                <button onClick={() => setReminderTime('')} className="flex-1 text-[10px] text-gray-500 font-bold hover:text-red-500 transition-colors">Desactivar</button>
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
