import React, { useState } from 'react';
import { Plus, Trash2, Check, Flame } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

export default function RoutineHabits({ 
    habits, records, addHabit, removeHabit, toggleRecord, 
    visibleDays, selectedDateStr, todayDateStr, getHabitStreak 
}) {
    const [isAdding, setIsAdding] = useState(false);
    const [newHabitName, setNewHabitName] = useState('');
    const [newHabitCategory, setNewHabitCategory] = useState('general');

    const getAccentColor = (category) => {
        switch (category) {
            case 'soma': return '#00d4aa';
            case 'pneuma': return '#8b5cf6';
            case 'techne': return '#f59e0b';
            default: return '#94a3b8';
        }
    };

    const handleAdd = () => {
        if (!newHabitName.trim()) return;
        addHabit(newHabitName, null, null, newHabitCategory, 'consistencia', '', [0,1,2,3,4,5,6]);
        setNewHabitName('');
        setIsAdding(false);
    };

    // Filter routines (backward compatibility for frequency !== 'semanal')
    const routines = habits.filter(h => (h.frequency || 'diaria') !== 'semanal');

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="text-xl font-bold tracking-tight text-text-primary">Rutinas</h3>
                <button onClick={() => setIsAdding(!isAdding)} className="text-xl p-2 text-text-secondary hover:text-brand-primary transition-colors">
                    <Plus size={20} />
                </button>
            </div>

            {isAdding && (
                <div className="bg-dark-card p-4 rounded-xl border border-border-subtle mb-4 shadow-lg">
                    <input 
                        autoFocus
                        type="text" 
                        value={newHabitName}
                        onChange={(e) => setNewHabitName(e.target.value)}
                        placeholder="Nueva Rutina (ej. Leer 10 páginas)"
                        className="w-full bg-dark-main text-text-primary rounded-lg px-4 py-3 border border-border-light focus:outline-none focus:border-brand-primary font-medium"
                    />
                    <div className="flex flex-wrap gap-2 mt-4 cursor-pointer">
                        {['general', 'soma', 'pneuma', 'techne'].map(cat => (
                            <div 
                                key={cat}
                                onClick={() => setNewHabitCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wider uppercase transition-colors flex-1 text-center ${newHabitCategory === cat ? 'bg-dark-main border' : 'bg-dark-main/40 text-text-secondary border border-transparent'}`}
                                style={{ borderColor: newHabitCategory === cat ? getAccentColor(cat) : 'transparent', color: newHabitCategory === cat ? getAccentColor(cat) : undefined }}
                            >
                                {cat}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end gap-3 mt-5">
                        <button onClick={() => setIsAdding(false)} className="text-text-secondary text-sm font-bold hover:text-white transition-colors">Cancelar</button>
                        <button onClick={handleAdd} className="bg-brand-primary text-dark-main px-6 py-2 rounded-lg text-sm font-bold hover:brightness-110 transition-all">Crear Rutina</button>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-4">
                {routines.map(habit => {
                    const accent = getAccentColor(habit.category);
                    const streak = getHabitStreak(habit.id);
                    
                    return (
                        <div key={habit.id} className="bg-dark-card rounded-2xl border border-border-subtle overflow-hidden flex flex-col relative shadow-md">
                            {/* Borde izquierdo */}
                            <div className="absolute left-0 top-0 bottom-0 w-[4px]" style={{ backgroundColor: accent }}></div>
                            
                            <div className="p-4 pl-5">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="text-lg font-bold text-text-primary leading-tight pl-1">{habit.name}</h4>
                                    <div className="flex items-center gap-3 shrink-0">
                                        {streak > 0 && (
                                            <div className="flex items-center gap-1.5 bg-dark-main/80 px-2.5 py-1.5 rounded-lg border border-border-subtle">
                                                <Flame size={14} className="text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                                                <span className="text-xs font-bold text-orange-400">{streak}</span>
                                            </div>
                                        )}
                                        <button onClick={() => removeHabit(habit.id)} className="text-text-secondary hover:text-red-400 opacity-40 hover:opacity-100 transition-opacity p-1">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center w-full px-1">
                                    {visibleDays.map(d => {
                                        const dStr = formatDate(d);
                                        const dIndex = d.getDay() === 0 ? 6 : d.getDay() - 1;
                                        const isScheduled = !habit.scheduledDays || habit.scheduledDays.includes(dIndex);
                                        const isChecked = (records[dStr] || {})[habit.id];
                                        const isToday = dStr === todayDateStr;
                                        const isSelected = dStr === selectedDateStr;

                                        const dayInitial = ['D', 'L', 'M', 'X', 'J', 'V', 'S'][d.getDay()];

                                        if (!isScheduled) {
                                            return (
                                                <div key={dStr} className="flex flex-col items-center gap-1 w-8" style={{ visibility: 'hidden' }}>
                                                    <span className="text-[10px] font-bold">{dayInitial}</span>
                                                    <div className="w-7 h-7"></div>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div 
                                                key={dStr} 
                                                onClick={() => toggleRecord(dStr, habit.id)}
                                                className={`flex flex-col items-center gap-1.5 cursor-pointer transition-transform hover:scale-110 active:scale-95 ${isSelected && !isToday ? 'bg-dark-main/50 rounded-lg -mx-1 p-1' : ''}`}
                                            >
                                                <span className={`text-[10px] uppercase tracking-widest font-black ${isToday ? 'text-brand-primary' : 'text-text-secondary'}`}>
                                                    {dayInitial}
                                                </span>
                                                <div 
                                                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-[2px] transition-all flex items-center justify-center transform"
                                                    style={{ 
                                                        borderColor: isChecked ? accent : '#2a2a3a',
                                                        backgroundColor: isChecked ? accent : 'transparent',
                                                        boxShadow: isChecked ? `0 0 12px ${accent}40` : 'none'
                                                     }}
                                                >
                                                    {isChecked && <Check size={14} className="text-dark-main" strokeWidth={3} />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {routines.length === 0 && !isAdding && (
                    <div className="text-center py-10 text-text-secondary bg-dark-card rounded-2xl border border-border-subtle border-dashed">
                        <p className="font-medium text-sm">No tienes rutinas activas.</p>
                        <button onClick={() => setIsAdding(true)} className="mt-3 text-brand-primary font-bold text-sm hover:underline">
                            Agrega tu primera rutina
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
