// Importamos la grandiosa biblioteca constructora maestra React y ganchos
import React, { useState } from 'react';
// Importamos iconitos de interfaz web "lucide-react" listísimos
import { Plus, Trash2, Check, Repeat } from 'lucide-react';
// Rescatamos variables o constantes estáticas universales externas
import { DIAS_SEMANA } from '../utils/constants';
// Rescatamos nuestra súper valiosa matemática utilidad convertidora
import { formatDate } from '../utils/dateUtils';

// Creamos un hiper inmenso e importante componente maestro
const HabitTable = ({ habits, records, monthDays, visibleDays, currentWeekIndex, todayDateStr, daysInMonth, toggleRecord, removeHabit, addHabit, stats, selectedDateStr, setSelectedDateStr }) => {
    // Configuro variable super pequeña o humilde del estadito
    const [newHabitName, setNewHabitName] = useState('');
    const [isAddingHabit, setIsAddingHabit] = useState(false);

    // Agrega el habíto anclado al día actualmente seleccionado
    const handleAddDaily = (e) => {
        e.preventDefault();
        addHabit(newHabitName, selectedDateStr);
        setNewHabitName('');
        setIsAddingHabit(false);
    };

    // Agrega el habíto para todos los días
    const handleAddAlways = (e) => {
        e.preventDefault();
        addHabit(newHabitName, null);
        setNewHabitName('');
        setIsAddingHabit(false);
    };

    // HTML Visiual absoluto del componente
    return (
        <div className="overflow-x-auto relative">
            <table className="w-full border-collapse table-fixed min-w-[600px] md:min-w-[800px]">
                {/* LA GRAN CABECERA TABULAR */}
                <thead>
                    {/* FILA EXTRA: Agrupador por Semanas */}
                    <tr className="bg-gray-200/50">
                        {/* Celda vacía para alinear con "HÁBITOS" */}
                        <th className="w-[140px] md:w-[280px] p-2 bg-gray-100 border-b border-r border-gray-200 sticky left-0 z-40"></th>
                        <th colSpan={visibleDays.length} className="p-2 border-b border-r border-gray-300 text-center text-[10px] font-black text-gray-600 uppercase tracking-widest bg-gray-200/50">
                            SEMANA {currentWeekIndex + 1}
                        </th>
                    </tr>

                    <tr className="bg-gray-50">
                        <th className="w-[140px] md:w-[280px] p-2 md:p-4 text-left sticky left-0 z-40 bg-gray-100 border-b border-r border-gray-200 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                            <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest truncate block">HÁBITOS</span>
                        </th>
                        {visibleDays.map(d => {
                            const dStr = formatDate(d);
                            const isSelected = dStr === selectedDateStr;
                            const isToday = dStr === todayDateStr;
                            return (
                                <th key={d.getDate()}
                                    onClick={() => setSelectedDateStr(dStr)}
                                    className={`p-2 border-b border-r border-gray-200 text-center w-[45px] cursor-pointer hover:bg-blue-50 transition-colors ${isSelected ? 'bg-blue-100' : isToday ? 'bg-yellow-50' : ''}`}>
                                    <div className={`text-[10px] font-bold ${isSelected ? 'text-blue-500' : 'text-gray-400'}`}>{DIAS_SEMANA[d.getDay()][0]}</div>
                                    <div className={`text-xs ${isToday ? 'font-black text-yellow-600' : isSelected ? 'font-black text-blue-600' : 'text-gray-600'}`}>{d.getDate()}</div>
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
                            <tr key={habit.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-3 border-b border-r border-gray-200 sticky left-0 z-30 bg-[#e0f4f9] shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700 truncate">{habit.name}</span>
                                        <button onClick={() => removeHabit(habit.id)} className="text-gray-300 hover:text-red-400 ml-2"><Trash2 size={14} /></button>
                                    </div>
                                </td>

                                {visibleDays.map(d => {
                                    const dStr = formatDate(d);
                                    const isChecked = (records[dStr] || {})[habit.id];

                                    return (
                                        <td key={d.getDate()}
                                            className={`p-1 border-b border-r border-gray-200 text-center ${dStr === todayDateStr ? 'bg-yellow-50/30' : 'bg-[#fdebf1]'}`}
                                            onClick={() => toggleRecord(dStr, habit.id)}>
                                            <div className="flex justify-center cursor-pointer">
                                                <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${isChecked ? 'bg-gray-600 border-gray-600' : 'bg-white border-gray-200'}`}>
                                                    {isChecked && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                                </div>
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}

                    <tr className="bg-white">
                        <td className="p-2 border-b border-r border-gray-200 sticky left-0 z-30 bg-[#e0f4f9]">
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
                                    <div className="flex gap-1">
                                        <button type="button" onClick={() => setIsAddingHabit(false)} className="flex-[2] py-1 bg-gray-200 text-gray-600 text-[10px] font-bold rounded">Cancelar</button>
                                        <button type="button" onClick={handleAddDaily} className="flex-1 py-1 bg-green-500 text-white flex justify-center items-center rounded" title="Solo este día"><Check size={14} /></button>
                                        <button type="button" onClick={handleAddAlways} className="flex-1 py-1 bg-blue-500 text-white flex justify-center items-center rounded" title="Todos los días"><Repeat size={14} /></button>
                                    </div>
                                </form>
                            )}
                        </td>
                        {visibleDays.map(d => <td key={d.getDate()} className="border-b border-r border-gray-100 bg-[#fdebf1]/40"></td>)}
                    </tr>

                    <tr><td colSpan={visibleDays.length + 1} className="h-6 bg-white border-none"></td></tr>

                    <tr className="bg-gray-100">
                        <td className="p-4 sticky left-0 z-30 bg-gray-200 border-y border-r border-gray-300 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                            <div className="text-xs font-black text-gray-800 uppercase">RESUMEN DIARIO</div>
                            <div className="text-[10px] text-gray-500 mt-1 font-bold">COMPLETADO: <span className="text-gray-900">{stats.completed} / {stats.total}</span></div>
                        </td>

                        {visibleDays.map(d => {
                            const dStr = formatDate(d);
                            const dailyHabits = habits.filter(h => h.frequency === 'diaria' || !h.frequency);
                            const done = dailyHabits.filter(h => (records[dStr] || {})[h.id]).length;
                            const hPct = dailyHabits.length > 0 ? (done / dailyHabits.length) * 100 : 0;
                            return (
                                <td key={d.getDate()} className="border-y border-r border-gray-200 p-1 h-24 align-bottom bg-white">
                                    <div className="w-full flex flex-col items-center gap-1 h-full justify-end">
                                        <div className="w-4 bg-gray-400 rounded-t-sm transition-all" style={{ height: `${hPct}%`, minHeight: hPct > 0 ? '4px' : '0' }}></div>
                                    </div>
                                </td>
                            );
                        })}
                    </tr>

                    <tr>
                        <td className="p-3 border-b border-r border-gray-200 sticky left-0 z-30 bg-white font-bold text-xs shadow-[2px_0_5px_rgba(0,0,0,0.02)]">Completado</td>
                        {visibleDays.map(d => {
                            const done = habits.filter(h => (records[formatDate(d)] || {})[h.id]).length;
                            return <td key={d.getDate()} className="border-b border-r border-gray-200 text-center text-xs font-bold">{done}</td>;
                        })}
                    </tr>

                    <tr className="bg-[#fbd4bc]">
                        <td className="p-3 border-b border-r border-[#f5c6aa] sticky left-0 z-30 bg-[#fbd4bc] font-bold text-xs text-[#8a4210] shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                            Objetivo diario
                        </td>
                        {visibleDays.map(d => (
                            <td key={d.getDate()} className="border-b border-r border-[#f5c6aa] text-center text-xs font-bold text-[#8a4210]">
                                {habits.filter(h => h.frequency === 'diaria' || !h.frequency).length}
                            </td>
                        ))}
                    </tr>

                    <tr>
                        <td className="p-3 border-b border-r border-gray-200 sticky left-0 z-30 bg-gray-50 font-bold text-xs text-gray-600">Progreso semanal</td>
                        {visibleDays.map(d => {
                            const dStr = formatDate(d);
                            const dailyHabits = habits.filter(h => h.frequency === 'diaria' || !h.frequency);
                            const done = dailyHabits.filter(h => (records[dStr] || {})[h.id]).length;
                            const pct = dailyHabits.length > 0 ? Math.round((done / dailyHabits.length) * 100) : 0;
                            return (
                                <td key={d.getDate()} className="border-b border-r border-gray-200 p-1">
                                    <div className="w-full bg-gray-100 h-2 rounded overflow-hidden">
                                        <div className="bg-gray-400 h-full" style={{ width: `${pct}%` }}></div>
                                    </div>
                                    <div className="text-[8px] text-center font-bold mt-0.5 text-gray-400">{pct}%</div>
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
