import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Plus } from 'lucide-react';
import { MESES } from '../utils/constants';

const MobileDayView = ({ habits, records, toggleRecord, todayDateStr, addHabit }) => {
  // Estado local para el día que el usuario está viendo en el móvil.
  // Por defecto es 'hoy', pero se puede navegar.
  const [activeDate, setActiveDate] = useState(new Date());

  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('general');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    addHabit(newHabitName, null, '', newHabitCategory, 'consistencia', '', [0, 1, 2, 3, 4, 5, 6]);
    setNewHabitName('');
    setNewHabitCategory('general');
    setIsAddingHabit(false);
  };

  const activeDateStr = [
    activeDate.getFullYear(),
    String(activeDate.getMonth() + 1).padStart(2, '0'),
    String(activeDate.getDate()).padStart(2, '0')
  ].join('-');

  const prevDay = () => {
    const newDate = new Date(activeDate);
    newDate.setDate(newDate.getDate() - 1);
    setActiveDate(newDate);
  };

  const nextDay = () => {
    const newDate = new Date(activeDate);
    newDate.setDate(newDate.getDate() + 1);
    setActiveDate(newDate);
  };

  const dayRecords = records[activeDateStr] || {};

  const getAccentColor = (category) => {
    switch (category) {
      case 'soma': return '#00d4aa';
      case 'pneuma': return '#8b5cf6';
      case 'techne': return '#f59e0b';
      default: return '#94a3b8';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* HEADER DEL DÍA */}
      <div className="flex items-center justify-between bg-dark-card p-4 rounded-2xl border border-border-subtle shadow-sm">
        <button onClick={prevDay} className="p-2 bg-dark-main rounded-xl text-text-secondary hover:text-text-primary">
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <h2 className="text-xl font-bold text-text-primary capitalize">
            {activeDate.toLocaleDateString('es-ES', { weekday: 'long' })} {activeDate.getDate()}
          </h2>
          <p className="text-xs uppercase tracking-widest text-text-secondary font-bold mt-1">
            {MESES[activeDate.getMonth()]} {activeDate.getFullYear()}
          </p>
        </div>
        <button onClick={nextDay} className="p-2 bg-dark-main rounded-xl text-text-secondary hover:text-text-primary">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* LISTA VERTICAL DE HÁBITOS */}
      <div className="flex flex-col gap-3">
        {habits.map((habit) => {
          // Si implementamos Priority 4 (días específicos), comprobamos si el hábito está programado hoy
          const activeDayOfWeek = activeDate.getDay() === 0 ? 6 : activeDate.getDay() - 1; // 0=Lun, 6=Dom
          if (habit.scheduledDays && !habit.scheduledDays.includes(activeDayOfWeek)) {
            return null; // El hábito no está programado para este día
          }

          const isCompleted = dayRecords[habit.id];
          const accentColor = getAccentColor(habit.category);

          return (
            <div
              key={habit.id}
              onClick={() => toggleRecord(activeDateStr, habit.id)}
              className="flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer"
              style={{
                backgroundColor: isCompleted ? `${accentColor}15` : '#111118',
                borderColor: isCompleted ? `${accentColor}40` : '#1e1e2e'
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}80` }}
                />
                <div>
                  <h3 className={`font-bold text-sm ${isCompleted ? 'line-through text-text-secondary opacity-70' : 'text-text-primary'}`}>
                    {habit.name}
                  </h3>
                  <p className="text-[10px] uppercase tracking-widest font-bold mt-0.5 opacity-60 flex gap-1 items-center" style={{ color: accentColor }}>
                    {habit.category || 'General'}
                    <span className="text-text-secondary">·</span>
                    <span className="text-text-secondary">{habit.goalType || 'Consist'}</span>
                  </p>
                </div>
              </div>

              {/* CHECKBOX CIRCULAR */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all shrink-0"
                style={{
                  borderColor: isCompleted ? accentColor : '#1e1e2e',
                  backgroundColor: isCompleted ? accentColor : 'transparent',
                  boxShadow: isCompleted ? `0 2px 10px ${accentColor}40` : 'none'
                }}
              >
                {isCompleted && <Check size={16} strokeWidth={3} className="text-dark-main" />}
              </div>
            </div>
          );
        })}
        {habits.length === 0 && (
          <div className="text-center p-6 text-text-secondary text-sm italic border border-dashed border-border-subtle rounded-2xl">
            Aún no tienes hábitos para este día.
          </div>
        )}
      </div>

      {/* ÁREA DE AGREGAR NUEVO HÁBITO EN MÓVIL */}
      <div className="mt-2">
        {!isAddingHabit ? (
          <button
            onClick={() => setIsAddingHabit(true)}
            className="w-full flex items-center justify-center gap-2 p-3 text-sm font-bold text-blue-500 hover:text-blue-400 bg-dark-card border border-border-subtle border-dashed rounded-2xl transition-colors"
          >
            <Plus size={16} /> Nuevo hábito...
          </button>
        ) : (
          <form
            onSubmit={handleAdd}
            className="flex flex-col gap-3 p-4 bg-dark-card border border-border-subtle rounded-2xl shadow-sm"
          >
            <input
              autoFocus
              value={newHabitName}
              onChange={e => setNewHabitName(e.target.value)}
              className="w-full text-sm p-3 rounded-xl border border-border-subtle bg-dark-main text-text-primary focus:outline-none focus:border-blue-400"
              placeholder="Nombre del hábito..."
            />
            <div className="flex gap-2">
              <select 
                value={newHabitCategory} 
                onChange={e => setNewHabitCategory(e.target.value)}
                className="flex-1 text-xs p-2.5 rounded-xl border border-border-subtle bg-dark-main text-text-primary"
              >
                <option value="general">General</option>
                <option value="soma">Físico (SOMA)</option>
                <option value="pneuma">Mente (PNEUMA)</option>
                <option value="techne">Arte (TECHNE)</option>
              </select>
            </div>
            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={() => setIsAddingHabit(false)}
                className="flex-[1] py-3 text-xs font-bold text-text-secondary bg-dark-main border border-border-subtle rounded-xl hover:text-text-primary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!newHabitName.trim()}
                className="flex-[2] py-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl disabled:opacity-50"
              >
                + Agregar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default MobileDayView;
