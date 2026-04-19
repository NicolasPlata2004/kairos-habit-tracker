/**
 * ARCHIVO: components/HabitTable.jsx
 * PAPEL: La Tabla Principal interactiva de Registro Diario.
 * DESCRIPCIÓN: Este es el corazón visual de Kairos. Muestra los hábitos listados verticalmente
 * y los días de la semana horizontalmente. Contiene la lógica visual hipercompleja para:
 * Mostrar celdas dinámicas (checkboxes cuadrados), renderizar resúmenes porcentuales por día,
 * colapsarse en diseño móvil (responsive), y poder crear nuevos hábitos.
 */

// Importamos la grandiosa biblioteca constructora maestra React y ganchos
import React, { useState } from 'react';
// Importamos iconitos de interfaz web "lucide-react" listísimos
import { Plus, Trash2, Check, Repeat, Bell } from 'lucide-react';
// Rescatamos variables o constantes estáticas universales externas
import { DIAS_SEMANA } from '../utils/constants';
// Rescatamos nuestra súper valiosa matemática utilidad convertidora
import { formatDate } from '../utils/dateUtils';

// Creamos un hiper inmenso e importante componente maestro
const HabitTable = ({ habits, records, monthDays, visibleDays, todayDateStr, daysInMonth, toggleRecord, removeHabit, addHabit, stats, selectedDateStr, setSelectedDateStr }) => {
    // Configuro variable super pequeña o humilde del estadito
    const [newHabitName, setNewHabitName] = useState('');
    const [newHabitTime, setNewHabitTime] = useState(''); // Estado para la hora de recordatorio opcional
    
    // Nuevas métricas para SOMA, PNEUMA, TECHNE y Trofeos
    const [newHabitCategory, setNewHabitCategory] = useState('general'); // general, soma, pneuma, techne
    const [newHabitGoalType, setNewHabitGoalType] = useState('consistencia'); // consistencia, cuantitativa, zen
    const [newHabitGoalValue, setNewHabitGoalValue] = useState(''); // Valor meta
    
    const [isAddingHabit, setIsAddingHabit] = useState(false);
    const [scheduledDays, setScheduledDays] = useState([0, 1, 2, 3, 4, 5, 6]);

    // Función para limpiar el formulario y resetear estados
    const resetForm = () => {
        setNewHabitName('');
        setNewHabitTime('');
        setNewHabitCategory('general');
        setNewHabitGoalType('consistencia');
        setNewHabitGoalValue('');
        setScheduledDays([0, 1, 2, 3, 4, 5, 6]);
        setIsAddingHabit(false);
        // Pedimos permiso de notificación si el usuario escoge una hora pero aún no ha dado permiso
        if (newHabitTime && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    };

    // Agrega el habíto anclado al día actualmente seleccionado
    const handleAddDaily = (e) => {
        e.preventDefault();
        addHabit(newHabitName, selectedDateStr, newHabitTime, newHabitCategory, newHabitGoalType, newHabitGoalValue, scheduledDays);
        resetForm();
    };

    // Agrega el habíto para todos los días
    const handleAddAlways = (e) => {
        e.preventDefault();
        addHabit(newHabitName, null, newHabitTime, newHabitCategory, newHabitGoalType, newHabitGoalValue, scheduledDays);
        resetForm();
    };
    // HTML Visiual absoluto del componente
    return (
        <div className="overflow-x-auto relative">
            <table className="w-full border-collapse table-auto md:table-fixed md:min-w-[800px]">
                {/* LA GRAN CABECERA TABULAR */}
                <thead>
                    <tr className="bg-dark-main">
                        <th className="w-auto min-w-[160px] md:w-[280px] p-2 md:p-4 text-left sticky left-0 z-40 bg-dark-main border-b border-r border-border-subtle shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                            <span className="text-[10px] md:text-xs font-bold text-text-secondary uppercase tracking-widest truncate block">HÁBITOS</span>
                        </th>
                        {visibleDays.map(d => {
                            const dStr = formatDate(d);
                            const isSelected = dStr === selectedDateStr;
                            const isToday = dStr === todayDateStr;
                            return (
                                <th key={d.getDate()}
                                    onClick={() => setSelectedDateStr(dStr)}
                                    className={`p-2 border-b border-r border-border-subtle text-center min-w-[80px] md:min-w-0 md:w-[45px] cursor-pointer hover:bg-blue-50 transition-colors ${isSelected ? 'bg-blue-100' : isToday ? 'bg-yellow-900/30' : ''} ${isSelected ? 'table-cell' : 'hidden md:table-cell'}`}>
                                    <div className={`text-[10px] font-bold ${isSelected ? 'text-blue-500' : 'text-text-secondary'}`}>{DIAS_SEMANA[d.getDay()][0]}</div>
                                    <div className={`text-xs ${isToday ? 'font-black text-yellow-600' : isSelected ? 'font-black text-blue-600' : 'text-text-secondary'}`}>{d.getDate()}</div>
                                </th>
                            );
                        })}
                    </tr>
                </thead>

                <tbody>
                    {/* Solo mostramos hábitos diarios (no semanales) que correspondan al día seleccionado */}
                    {habits.filter(h =>
                        (h.frequency || 'diaria') !== 'semanal' &&
                        (!h.targetDate || h.targetDate === selectedDateStr)
                    ).map(habit => {
                        return (
                            <tr key={habit.id} className="hover:bg-dark-main transition-colors">
                                <td className="p-3 border-b border-r border-border-subtle sticky left-0 z-30 bg-dark-card shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-text-primary break-words whitespace-normal leading-tight pr-2">{habit.name}</span>
                                        <button onClick={() => removeHabit(habit.id)} className="text-text-secondary hover:text-red-400 ml-2"><Trash2 size={14} /></button>
                                    </div>
                                </td>

                                {visibleDays.map(d => {
                                    const dStr = formatDate(d);
                                    const isChecked = (records[dStr] || {})[habit.id];
                                    const isSelected = dStr === selectedDateStr;

                                    const dayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1;
                                    const isScheduled = habit.scheduledDays ? habit.scheduledDays.includes(dayIndex) : true;

                                    if (!isScheduled) {
                                        return (
                                            <td key={d.getDate()} className={`p-1 border-b border-r border-border-subtle text-center bg-dark-main/50 ${isSelected ? 'table-cell' : 'hidden md:table-cell'}`}>
                                                <div className="flex justify-center">
                                                    <div className="w-5 h-5 rounded-full border-2 border-border-subtle/30 bg-transparent flex items-center justify-center opacity-30 cursor-not-allowed">
                                                        <span className="text-[10px] text-text-secondary">·</span>
                                                    </div>
                                                </div>
                                            </td>
                                        );
                                    }

                                    return (
                                        <td key={d.getDate()}
                                            className={`p-1 border-b border-r border-border-subtle text-center hover:bg-dark-card transition-colors ${dStr === todayDateStr ? 'bg-dark-card/30' : 'bg-dark-main'} ${isSelected ? 'table-cell' : 'hidden md:table-cell'}`}
                                            onClick={() => toggleRecord(dStr, habit.id)}>
                                            <div className="flex justify-center cursor-pointer">
                                                <div className="w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center" 
                                                     style={{ 
                                                        borderColor: isChecked ? getAccentColor(habit.category) : '#1e1e2e',
                                                        backgroundColor: isChecked ? getAccentColor(habit.category) : 'transparent',
                                                        boxShadow: isChecked ? `0 2px 8px ${getAccentColor(habit.category)}40` : 'none'
                                                     }}>
                                                    {isChecked && <Check size={14} className="text-dark-main" strokeWidth={3} />}
                                                </div>
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}

                    <tr className="bg-dark-card">
                        <td className="p-2 border-b border-r border-border-subtle sticky left-0 z-30 bg-dark-card">
                            {!isAddingHabit ? (
                                <button
                                    onClick={() => setIsAddingHabit(true)}
                                    className="w-full text-left flex items-center gap-1.5 p-1 text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors"
                                >
                                    <Plus size={14} /> Nuevo hábito...
                                </button>
                            ) : (
                                <form
                                    onSubmit={(e) => e.preventDefault()}
                                    className="flex flex-col gap-1.5"
                                >
                                    <input
                                        autoFocus
                                        value={newHabitName}
                                        onChange={e => setNewHabitName(e.target.value)}
                                        className="w-full text-xs p-1.5 rounded border border-blue-100 focus:outline-none focus:border-blue-400"
                                        placeholder="Hábito..."
                                    />
                                    
                                    {/* Selectores de Gemelo Digital y Meta */}
                                    <div className="flex gap-1">
                                        <select 
                                            value={newHabitCategory} 
                                            onChange={e => setNewHabitCategory(e.target.value)}
                                            className="flex-1 text-[10px] p-1 rounded border border-blue-100 bg-dark-card"
                                            title="Categoría Digital Twin"
                                        >
                                            <option value="general">General</option>
                                            <option value="soma">Físico (SOMA)</option>
                                            <option value="pneuma">Mente (PNEUMA)</option>
                                            <option value="techne">Arte (TECHNE)</option>
                                        </select>
                                        <select 
                                            value={newHabitGoalType} 
                                            onChange={e => setNewHabitGoalType(e.target.value)}
                                            className="flex-1 text-[10px] p-1 rounded border border-blue-100 bg-dark-card"
                                            title="Tipo de Meta de Progreso"
                                        >
                                            <option value="consistencia">Consistencia</option>
                                            <option value="cuantitativa">Cuantitativa</option>
                                        </select>
                                    </div>
                                    
                                    {newHabitGoalType === 'cuantitativa' && (
                                        <input
                                            type="number"
                                            value={newHabitGoalValue}
                                            onChange={e => setNewHabitGoalValue(e.target.value)}
                                            className="w-full text-xs p-1.5 rounded border border-blue-100 focus:border-blue-400"
                                            placeholder="Meta numérica (ej. 100)"
                                        />
                                    )}

                                    {/* Selector de Días de la Semana */}
                                    <div className="flex justify-between items-center px-0.5 mt-1">
                                        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((dayObj, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => toggleDaySelection(i)}
                                                className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center transition-colors ${
                                                    scheduledDays.includes(i) 
                                                    ? 'bg-blue-500 text-white shadow-md' 
                                                    : 'bg-dark-main border border-border-subtle text-text-secondary'
                                                }`}
                                            >
                                                {dayObj}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Selector de Hora Opcional */}
                                    <div className="flex items-center gap-1.5 px-0.5 mt-1">
                                        <Bell size={12} className={newHabitTime ? "text-blue-500" : "text-text-secondary"} />
                                        <input
                                            type="time"
                                            value={newHabitTime}
                                            onChange={e => setNewHabitTime(e.target.value)}
                                            className="text-[10px] bg-dark-card p-1 rounded border border-border-subtle text-text-secondary focus:outline-none focus:border-blue-400 flex-1"
                                            title="Hora de recordatorio (Opcional)"
                                        />
                                    </div>
                                    <div className="flex gap-1 mt-2">
                                        <button type="button" onClick={resetForm} className="flex-1 py-1 bg-dark-main border border-border-subtle text-text-secondary text-[10px] font-bold rounded">Cancelar</button>
                                        <button type="button" onClick={handleAddAlways} className="flex-1 py-1 bg-blue-500 text-white flex justify-center items-center rounded gap-1 font-bold text-[10px]" title="Guardar"><Check size={12} /> Guardar</button>
                                    </div>
                                </form>
                            )}
                        </td>
                        {visibleDays.map(d => <td key={d.getDate()} className={`border-b border-r border-border-subtle bg-dark-main ${formatDate(d) === selectedDateStr ? 'table-cell' : 'hidden md:table-cell'}`}></td>)}
                    </tr>

                    <tr>
                        <td colSpan={2} className="md:hidden h-6 bg-dark-card border-none"></td>
                        <td colSpan={visibleDays.length + 1} className="hidden md:table-cell h-6 bg-dark-card border-none"></td>
                    </tr>

                    <tr className="bg-dark-main">
                        <td className="p-4 sticky left-0 z-30 bg-dark-main border border-border-subtle border-y border-r border-border-subtle shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                            <div className="text-xs font-black text-text-primary uppercase">RESUMEN DIARIO</div>
                            <div className="text-[10px] text-text-secondary mt-1 font-bold">COMPLETADO: <span className="text-text-primary">{stats.completed} / {stats.total}</span></div>
                        </td>

                        {visibleDays.map(d => {
                            const dStr = formatDate(d);
                            const dailyHabits = habits.filter(h => h.frequency === 'diaria' || !h.frequency);
                            const done = dailyHabits.filter(h => (records[dStr] || {})[h.id]).length;
                            const hPct = dailyHabits.length > 0 ? (done / dailyHabits.length) * 100 : 0;
                            const isSelected = dStr === selectedDateStr;
                            return (
                                <td key={d.getDate()} className={`border-y border-r border-border-subtle p-1 h-24 align-bottom bg-dark-card ${isSelected ? 'table-cell' : 'hidden md:table-cell'}`}>
                                    <div className="w-full flex flex-col items-center gap-1 h-full justify-end">
                                        <div className="w-4 bg-gray-400 rounded-t-sm transition-all" style={{ height: `${hPct}%`, minHeight: hPct > 0 ? '4px' : '0' }}></div>
                                    </div>
                                </td>
                            );
                        })}
                    </tr>

                    <tr>
                        <td className="p-3 border-b border-r border-border-subtle sticky left-0 z-30 bg-dark-card font-bold text-xs shadow-[2px_0_5px_rgba(0,0,0,0.02)]">Completado</td>
                        {visibleDays.map(d => {
                            const dStr = formatDate(d);
                            const done = habits.filter(h => (records[dStr] || {})[h.id]).length;
                            return <td key={d.getDate()} className={`border-b border-r border-border-subtle text-center text-xs font-bold ${dStr === selectedDateStr ? 'table-cell' : 'hidden md:table-cell'}`}>{done}</td>;
                        })}
                    </tr>

                    <tr className="bg-amber-900/30">
                        <td className="p-3 border-b border-r border-amber-700/50 sticky left-0 z-30 bg-amber-900/30 font-bold text-xs text-[#8a4210] shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                            Objetivo diario
                        </td>
                        {visibleDays.map(d => (
                            <td key={d.getDate()} className={`border-b border-r border-amber-700/50 text-center text-xs font-bold text-[#8a4210] ${formatDate(d) === selectedDateStr ? 'table-cell' : 'hidden md:table-cell'}`}>
                                {habits.filter(h => h.frequency === 'diaria' || !h.frequency).length}
                            </td>
                        ))}
                    </tr>

                    <tr>
                        <td className="p-3 border-b border-r border-border-subtle sticky left-0 z-30 bg-dark-main font-bold text-xs text-text-secondary">Progreso semanal</td>
                        {visibleDays.map(d => {
                            const dStr = formatDate(d);
                            const dailyHabits = habits.filter(h => h.frequency === 'diaria' || !h.frequency);
                            const done = dailyHabits.filter(h => (records[dStr] || {})[h.id]).length;
                            const pct = dailyHabits.length > 0 ? Math.round((done / dailyHabits.length) * 100) : 0;
                            const isSelected = dStr === selectedDateStr;
                            return (
                                <td key={d.getDate()} className={`border-b border-r border-border-subtle p-1 ${isSelected ? 'table-cell' : 'hidden md:table-cell'}`}>
                                    <div className="w-full bg-dark-main h-2 rounded overflow-hidden">
                                        <div className="bg-gray-400 h-full" style={{ width: `${pct}%` }}></div>
                                    </div>
                                    <div className="text-[8px] text-center font-bold mt-0.5 text-text-secondary">{pct}%</div>
                                </td>
                            );
                        })}
                    </tr>
                </tbody>
            </table>
        </div>
    );
};
// Export
export default HabitTable;
