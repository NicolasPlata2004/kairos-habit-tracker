/**
 * ARCHIVO: components/CreativeTree.jsx
 * PAPEL: Gemelo Digital Artístico (TECHNE).
 * DESCRIPCIÓN: Representa visualmente la consistencia y producción creativa del usuario.
 * Es un árbol botánico SVG que engrosa y revela ramas basándose en la Racha (Consistencia)
 * y hace brotar frutos dorados basándose en los Outputs (Entregables) completados.
 */

import React from 'react';

const CreativeTree = ({ streak = 0, outputsCount = 0 }) => {
    // Calculamos el nivel de crecimiento del árbol basado en la racha (1-100 para porcentaje visual)
    const growth = Math.min(100, Math.max(10, streak * 5)); 
    // Opacidad y grosor del tronco base
    const trunkWidth = 4 + (growth * 0.04);
    
    // Frutos a renderizar (limitados a un máximo visual para no saturar)
    const MAX_FRUITS = 12;
    const fruitsToDraw = Math.min(outputsCount, MAX_FRUITS);
    
    // Generación determinista de posiciones de frutos para que no bailen
    const fruitPositions = [
        { cx: 35, cy: 35 }, { cx: 65, cy: 30 }, { cx: 50, cy: 20 },
        { cx: 20, cy: 50 }, { cx: 80, cy: 45 }, { cx: 40, cy: 45 },
        { cx: 60, cy: 55 }, { cx: 25, cy: 25 }, { cx: 75, cy: 20 },
        { cx: 45, cy: 30 }, { cx: 55, cy: 40 }, { cx: 30, cy: 60 }
    ];

    return (
        <div className="w-full h-64 md:h-80 bg-[#f8fafc] rounded-2xl relative overflow-hidden border border-border-subtle shadow-xl flex items-center justify-center">
            
            {/* Título y Data HUD */}
            <div className="absolute top-3 left-3 z-10">
                <p className="text-amber-600 font-bold text-xs tracking-widest uppercase">TECHNE // Árbol Creativo</p>
                <div className="text-text-primary text-sm font-mono mt-1">
                    <p>RACHA: <span className="font-bold text-amber-500">{streak}</span> días</p>
                    <p>OUTPUTS: <span className="font-bold text-green-600">{outputsCount}</span></p>
                </div>
            </div>

            <svg viewBox="0 0 100 100" className="w-full h-full max-w-sm max-h-sm overflow-visible drop-shadow-md">
                
                {/* Tronco Principal */}
                <path 
                    d="M 50 100 C 48 80, 52 60, 50 40" 
                    fill="none" 
                    stroke="#78350f" // Amber 900
                    strokeWidth={trunkWidth} 
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                />

                {/* Rama Izquierda 1 (Aparece a racha > 3) */}
                <path 
                    d="M 50 65 C 40 55, 30 60, 20 50" 
                    fill="none" 
                    stroke="#92400e" 
                    strokeWidth={trunkWidth * 0.7} 
                    strokeLinecap="round"
                    opacity={streak >= 3 ? 1 : 0}
                    style={{ strokeDasharray: 50, strokeDashoffset: streak >= 3 ? 0 : 50 }}
                    className="transition-all duration-1000 ease-out"
                />

                {/* Rama Derecha 1 (Aparece a racha > 7) */}
                <path 
                    d="M 50 55 C 60 45, 75 50, 80 40" 
                    fill="none" 
                    stroke="#92400e" 
                    strokeWidth={trunkWidth * 0.6} 
                    strokeLinecap="round"
                    opacity={streak >= 7 ? 1 : 0}
                    style={{ strokeDasharray: 50, strokeDashoffset: streak >= 7 ? 0 : 50 }}
                    className="transition-all duration-1000 ease-out delay-300"
                />

                {/* Copa del árbol (Hojas) - Escala con el crecimiento */}
                <g 
                    transform={`scale(${growth / 100})`} 
                    transform-origin="50 40"
                    className="transition-transform duration-1000 ease-out"
                >
                    <circle cx="50" cy="30" r="25" fill="#4ade80" opacity="0.4" />
                    <circle cx="35" cy="45" r="18" fill="#22c55e" opacity="0.5" />
                    <circle cx="65" cy="40" r="20" fill="#16a34a" opacity="0.6" />
                </g>

                {/* Frutos (Outputs) - Brotan según los outputs completados */}
                {fruitPositions.slice(0, fruitsToDraw).map((pos, idx) => (
                    <g key={`fruit-${idx}`} className="animate-in zoom-in duration-500">
                        {/* Fruto */}
                        <circle cx={pos.cx} cy={pos.cy} r="3" fill="#fbbf24" stroke="#d97706" strokeWidth="0.5" />
                        {/* Brillo */}
                        <circle cx={pos.cx - 1} cy={pos.cy - 1} r="0.8" fill="#ffffff" opacity="0.8" />
                    </g>
                ))}

            </svg>
        </div>
    );
};

export default CreativeTree;
