/**
 * ARCHIVO: components/TrophyNotification.jsx
 * PAPEL: Interfaz de Recompensas Gamificada.
 * DESCRIPCIÓN: Renderiza notificaciones cinemáticas (aprovechando framer-motion)
 * cuando el usuario cruza umbrales predefinidos de progreso en sus metas (Bronce, Plata, Oro, Diamante).
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Mapeo visual y semántico de Tiers
const TIER_MAP = {
    'Bronce': {
        color: 'from-amber-600 to-amber-800',
        textColor: 'text-amber-100',
        icon: '🥉',
        message: '¡Buen inicio! Primer cuarto dominado.'
    },
    'Plata': {
        color: 'from-slate-300 to-slate-500',
        textColor: 'text-text-primary',
        icon: '🥈',
        message: '¡Mitad del camino! Eres imparable.'
    },
    'Oro': {
        color: 'from-yellow-400 to-yellow-600',
        textColor: 'text-yellow-900',
        icon: '🥇',
        message: '¡Casi lo logras! Desempeño estelar.'
    },
    'Diamante': {
        color: 'from-cyan-300 to-blue-500',
        textColor: 'text-cyan-900',
        icon: '💎',
        message: '¡META ALCANZADA! Eres una leyenda.'
    }
};

const TrophyNotification = ({ event, onClose }) => {
    // Autocierre después de 5 segundos
    useEffect(() => {
        if (event) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [event, onClose]);

    return (
        <AnimatePresence>
            {event && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.3 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                    className="fixed bottom-10 inset-x-0 mx-auto w-11/12 max-w-sm z-50 pointer-events-none"
                >
                    <div className={`
                        bg-gradient-to-r ${TIER_MAP[event.tier].color}
                        rounded-2xl shadow-2xl p-4 border border-white/20
                        flex items-center gap-4 overflow-hidden relative
                    `}>
                        {/* Brillo dinámico de fondo */}
                        <motion.div 
                            className="absolute inset-0 bg-dark-card/20 w-1/2 -skew-x-12 -translate-x-full"
                            animate={{ translateX: ['-100%', '300%'] }}
                            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                        />

                        {/* Icono Trofeo GIGANTE */}
                        <motion.div 
                            initial={{ rotate: -15, scale: 0.5 }}
                            animate={{ rotate: [0, -10, 10, -10, 0], scale: 1 }}
                            transition={{ type: 'spring', delay: 0.2 }}
                            className="text-5xl drop-shadow-lg"
                        >
                            {TIER_MAP[event.tier].icon}
                        </motion.div>

                        {/* Textos */}
                        <div className="flex-1">
                            <h3 className={`font-black text-lg uppercase tracking-tight ${TIER_MAP[event.tier].textColor}`}>
                                Trofeo {event.tier} Desbloqueado
                            </h3>
                            <p className="text-white font-medium text-sm leading-tight mt-0.5 shadow-sm">
                                {event.habitName}
                            </p>
                            <p className="text-white/80 text-xs mt-1 italic font-light">
                                {TIER_MAP[event.tier].message}
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TrophyNotification;
