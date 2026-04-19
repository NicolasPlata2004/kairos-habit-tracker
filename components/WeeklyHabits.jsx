/**
 * ARCHIVO: components/WeeklyHabits.jsx
 * PAPEL: Componente contenedor para la vista de "Planificación Semanal".
 * DESCRIPCIÓN: Renderiza la tarjeta de Metas Semanales. A diferencia de los rápidos
 * hábitos diarios, esta vista permite crear una agenda dinámica agregando ítems (tareas) 
 * puntuales tipo "To-Do list" para una semana en específico y tacharlos. 
 * También muestra su propio gráfico circular independiente.
 */

import React, { useState } from 'react';
import CircularProgress from './CircularProgress';
import { Plus, Trash2 } from 'lucide-react';

// Componente de Hábitos Semanales: Gráfico circular unificado + input con "+" para añadir strings y objetos de tareas
const WeeklyHabits = ({ habits, records, toggleRecord, removeHabit, weeks, currentWeekIndex, weeklyNotes, updateWeeklyNote }) => {
    const [weekInputs, setWeekInputs] = useState({});

    // Hábitos marcados como "semanal" en la tabla principal
    const weeklyHabits = habits.filter(h => h.frequency === 'semanal');

    // Normaliza los ítems guardados a array de { text, done }
    const getItems = (weekKey) => {
        const raw = weeklyNotes[weekKey];
        if (!raw) return [];
        if (Array.isArray(raw)) return raw.map(r => typeof r === 'string' ? { text: r, done: false } : r);
        return typeof raw === 'string' && raw ? [{ text: raw, done: false }] : [];
    };

    // Progreso total para el gráfico: hábitos semanales + ítems personalizados de todas las semanas
    let totalExpected = 0;
    let totalDone = 0;
    weeks.forEach((_, weekIndex) => {
        const weekKey = `week-${weekIndex + 1}`;
        const weekRecords = records[weekKey] || {};
        // Hábitos semanales
        weeklyHabits.forEach(habit => {
            totalExpected++;
            if (weekRecords[habit.id]) totalDone++;
        });
        // Ítems personalizados
        getItems(weekKey).forEach(item => {
            totalExpected++;
            if (item.done) totalDone++;
        });
    });

    const handleAddItem = (weekKey) => {
        const text = (weekInputs[weekKey] || '').trim();
        if (!text) return;
        updateWeeklyNote(weekKey, [...getItems(weekKey), { text, done: false }]);
        setWeekInputs(prev => ({ ...prev, [weekKey]: '' }));
    };

    const handleToggleItem = (weekKey, idx) => {
        updateWeeklyNote(weekKey, getItems(weekKey).map((item, i) =>
            i === idx ? { ...item, done: !item.done } : item
        ));
    };

    const handleDeleteItem = (weekKey, idx) => {
        updateWeeklyNote(weekKey, getItems(weekKey).filter((_, i) => i !== idx));
    };

    return (
        <div className="mt-8 bg-dark-card border-t border-border-subtle p-6 flex flex-col xl:flex-row gap-8">
            {/* Gráfico circular */}
            <div className="flex flex-col items-center justify-center bg-dark-main rounded-2xl p-6 border border-border-subtle shrink-0 w-full xl:w-64 gap-4">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest text-center">MIS METAS SEMANALES</h3>
                {totalExpected > 0 ? (
                    <CircularProgress value={totalDone} max={totalExpected} />
                ) : (
                    <p className="text-xs text-text-secondary text-center italic">Agrega ítems con el botón "+" en cada semana</p>
                )}
            </div>

            {/* Columnas por semana */}
            <div className="flex-1 overflow-x-auto">
                <div className="flex min-w-max gap-4 w-full">
                    {(() => {
                        const weekDays = weeks[currentWeekIndex];
                        if (!weekDays) return null;

                        const weekKey = `week-${currentWeekIndex + 1}`;
                        const weekRecords = records[weekKey] || {};
                        const startDay = weekDays[0].getDate();
                        const endDay = weekDays[weekDays.length - 1].getDate();
                        const items = getItems(weekKey);

                        return (
                            <div key={weekKey} className="w-full xl:w-1/2 rounded-lg overflow-hidden border border-border-subtle flex flex-col shadow-sm">
                                {/* Cabecera */}
                                <div className="bg-dark-main p-3 text-center border-b border-border-subtle">
                                    <h4 className="text-[11px] font-black text-text-primary uppercase tracking-widest">SEMANA {currentWeekIndex + 1}</h4>
                                    <span className="text-[9px] text-text-secondary font-bold block mt-1">Días {startDay} al {endDay}</span>
                                </div>

                                {/* Lista unificada: hábitos semanales + ítems personalizados */}
                                <div className="p-3 space-y-1 flex-1">
                                    {/* Hábitos "semanal" (con su checkbox propio y botón borrar) */}
                                    {weeklyHabits.map(habit => {
                                        const isChecked = weekRecords[habit.id] || false;
                                        return (
                                            <div key={habit.id} className="flex items-center gap-2 p-2 hover:bg-dark-main rounded transition-colors group">
                                                <div
                                                    className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center shrink-0 cursor-pointer ${isChecked ? 'bg-pink-500 border-pink-500' : 'bg-dark-card border-pink-300'}`}
                                                    onClick={() => toggleRecord(weekKey, habit.id)}
                                                >
                                                    {isChecked && (
                                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <span
                                                    className={`flex-1 text-[13px] font-medium leading-tight select-none cursor-pointer ${isChecked ? 'text-text-secondary line-through' : 'text-text-primary'}`}
                                                    onClick={() => toggleRecord(weekKey, habit.id)}
                                                >
                                                    {habit.name}
                                                </span>
                                                <button
                                                    onClick={() => removeHabit(habit.id)}
                                                    className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-red-400 transition-all"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        );
                                    })}

                                    {/* Ítems personalizados añadidos con "+" */}
                                    {items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-2 p-2 hover:bg-dark-main rounded transition-colors group">
                                            <div
                                                className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center shrink-0 cursor-pointer ${item.done ? 'bg-pink-500 border-pink-500' : 'bg-dark-card border-pink-300'}`}
                                                onClick={() => handleToggleItem(weekKey, idx)}
                                            >
                                                {item.done && (
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span
                                                className={`flex-1 text-[13px] font-medium leading-tight select-none cursor-pointer ${item.done ? 'text-text-secondary line-through' : 'text-text-primary'}`}
                                                onClick={() => handleToggleItem(weekKey, idx)}
                                            >
                                                {item.text}
                                            </span>
                                            <button
                                                onClick={() => handleDeleteItem(weekKey, idx)}
                                                className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-red-400 transition-all"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Input + "+" */}
                                <div className="px-3 pb-3 mt-2">
                                    <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); handleAddItem(weekKey); }}>
                                        <input
                                            type="text"
                                            className="flex-1 text-xs p-1.5 rounded border border-border-subtle focus:outline-none focus:border-blue-300 bg-dark-card"
                                            placeholder="Añadir ítem..."
                                            value={weekInputs[weekKey] || ''}
                                            onChange={e => setWeekInputs(prev => ({ ...prev, [weekKey]: e.target.value }))}
                                        />
                                        <button type="submit" className="bg-blue-400 hover:bg-blue-500 text-white rounded w-7 h-7 flex items-center justify-center shrink-0 transition-colors">
                                            <Plus size={14} />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
};

export default WeeklyHabits;
