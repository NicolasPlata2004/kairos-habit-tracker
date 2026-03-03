import React, { useState, useRef, useEffect } from 'react';
import { LogOut, User, Users } from 'lucide-react';

const ProfileDropdown = ({ user, onSignOut }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Cerrar al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
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

                    <div className="mt-1">
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
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;
