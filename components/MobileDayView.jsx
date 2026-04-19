import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { MESES } from '../utils/constants';

const MobileDayView = ({ habits, records, toggleRecord, todayDateStr }) => {
  // Estado local para el día que el usuario está viendo en el móvil.
  // Por defecto es 'hoy', pero se puede navegar.
  const [activeDate, setActiveDate] = useState(new Date());

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
    </div>
  );
};

export default MobileDayView;
