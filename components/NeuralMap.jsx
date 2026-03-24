/**
 * ARCHIVO: components/NeuralMap.jsx
 * PAPEL: Gemelo Digital Mental (PNEUMA).
 * DESCRIPCIÓN: Mapea el crecimiento cerebral/académico del usuario. Simula 
 * una red neuronal en SVG donde los nodos se van iluminando (efecto neón)
 * conforme el usuario adquiere XP en hábitos de enfoque y estudio.
 */

import React from 'react';

// Nodos estáticos del mapa de habilidades cerebrales
const brainNodes = [
    { id: 'core', x: 50, y: 50, label: 'CORE', type: 'root', threshold: 0 },
    { id: 'logic', x: 25, y: 35, label: 'LÓGICA', type: 'node', threshold: 10 },
    { id: 'focus', x: 75, y: 35, label: 'ENFOQUE', type: 'node', threshold: 25 },
    { id: 'languages', x: 50, y: 15, label: 'IDIOMAS', type: 'node', threshold: 50 },
    { id: 'memory', x: 20, y: 65, label: 'MEMORIA', type: 'node', threshold: 40 },
    { id: 'creative_thought', x: 80, y: 65, label: 'PENSAMIENTO', type: 'node', threshold: 70 },
];

// Conexiones (Sinapsis)
const connections = [
    { from: 'core', to: 'logic' },
    { from: 'core', to: 'focus' },
    { from: 'core', to: 'memory' },
    { from: 'core', to: 'creative_thought' },
    { from: 'logic', to: 'languages' },
    { from: 'focus', to: 'languages' },
];

const NeuralMap = ({ mindXP = 0 }) => {
    // Helper para verificar si un nodo está iluminado
    const isNodeActive = (threshold) => mindXP >= threshold;

    return (
        <div className="w-full h-64 md:h-80 bg-gray-900 rounded-2xl relative overflow-hidden border-2 border-slate-700 shadow-2xl flex items-center justify-center">
            
            {/* Título y Data */}
            <div className="absolute top-3 right-3 text-right z-10">
                <p className="text-purple-400 font-bold text-xs tracking-widest uppercase">PNEUMA // Red Neuronal</p>
                <p className="text-white text-lg font-mono">{mindXP} <span className="text-purple-500 text-xs">XP</span></p>
            </div>

            <svg viewBox="0 0 100 100" className="w-full h-full max-w-sm max-h-sm overflow-visible drop-shadow-lg">
                <defs>
                    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Dibujar Conexiones */}
                {connections.map((conn, idx) => {
                    const fromNode = brainNodes.find(n => n.id === conn.from);
                    const toNode = brainNodes.find(n => n.id === conn.to);
                    
                    // La línea brilla solo si el nodo destino está activo
                    const isActive = isNodeActive(toNode.threshold);

                    return (
                        <line 
                            key={`conn-${idx}`}
                            x1={fromNode.x} y1={fromNode.y}
                            x2={toNode.x} y2={toNode.y}
                            stroke={isActive ? "#a855f7" : "#334155"} // Purple 500 o Slate 700
                            strokeWidth={isActive ? "1.5" : "0.5"}
                            filter={isActive ? "url(#neonGlow)" : ""}
                            className="transition-colors duration-1000"
                        />
                    );
                })}

                {/* Dibujar Nodos */}
                {brainNodes.map((node) => {
                    const isActive = isNodeActive(node.threshold);
                    const isRoot = node.type === 'root';
                    
                    return (
                        <g key={node.id} filter={isActive ? "url(#neonGlow)" : ""} className="transition-all duration-700">
                            {/* Halo o brillo externo */}
                            <circle 
                                cx={node.x} cy={node.y} 
                                r={isRoot ? 4 : 2.5} 
                                fill={isActive ? (isRoot ? '#fff' : '#c084fc') : '#475569'} 
                            />
                            {/* Punto central intenso */}
                            <circle 
                                cx={node.x} cy={node.y} 
                                r={isRoot ? 2 : 1} 
                                fill={isActive ? '#ffffff' : '#1e293b'} 
                            />
                            <text 
                                x={node.x} y={node.y + (isRoot ? 8 : 6)} 
                                textAnchor="middle" 
                                fontSize="4" 
                                fontWeight="bold" 
                                fill={isActive ? '#e9d5ff' : '#64748b'}
                                className="font-mono tracking-tighter"
                            >
                                {node.label}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

export default NeuralMap;
