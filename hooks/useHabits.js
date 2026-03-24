/**
 * ARCHIVO: hooks/useHabits.js
 * PAPEL: El "Cerebro" (Custom Hook) de la aplicación. Maneja toda la Lógica y los Datos.
 * DESCRIPCIÓN: En React, se recomienda separar "Cómo se ven las cosas" (Componentes .jsx)
 * de "Cómo funcionan las cosas" (Archivos Lógicos Custom Hooks). Este archivo centraliza
 * los estados: Guarda tu progreso, calcula la estadística, computa tu racha de días, 
 * y sincroniza todo con Firebase (si estás logeado) o con el LocalStorage de tu celular.
 */

import { useState, useEffect, useMemo } from 'react';
import { formatDate } from '../utils/dateUtils';

// Hook maestro: sincroniza con Firestore si Firebase está configurado y autenticado, sino usa memoria del navegador (localStorage)
export const useHabits = (daysInMonth, monthDays, todayDateStr, userId = null) => {
    const [habits, setHabits] = useState([]);
    const [records, setRecords] = useState({});
    const [notes, setNotes] = useState({});
    const [weeklyNotes, setWeeklyNotes] = useState({});
    const [isLoaded, setIsLoaded] = useState(false);

    // ─── CARGA Y ESCUCHA EN TIEMPO REAL ────────────────────────────────
    useEffect(() => {
        let unsubscribe = null;
        setIsLoaded(false);

        if (userId) {
            // Si hay usuario autenticado, conectar a Firestore
            import('firebase/firestore').then(({ doc, onSnapshot }) => {
                import('../firebase.js').then(({ db }) => {
                    const docRef = doc(db, 'users', userId, 'data', 'habitData');
                    unsubscribe = onSnapshot(docRef, (snap) => {
                        if (snap.exists()) {
                            const d = snap.data();
                            setHabits(d.habits || getDefaultHabits());
                            setRecords(d.records || {});
                            setNotes(d.notes || {});
                            setWeeklyNotes(d.weeklyNotes || {});
                        } else {
                            setHabits(getDefaultHabits());
                            setRecords({});
                            setNotes({});
                            setWeeklyNotes({});
                        }
                        setIsLoaded(true);
                    });
                });
            });
        } else {
            // Fallback: localStorage
            const savedHabits = localStorage.getItem('habitTracker_habits');
            const savedRecords = localStorage.getItem('habitTracker_records');
            const savedNotes = localStorage.getItem('habitTracker_notes');
            const savedWeeklyNotes = localStorage.getItem('habitTracker_weeklyNotes');

            setHabits(savedHabits ? JSON.parse(savedHabits) : getDefaultHabits());
            if (savedRecords) setRecords(JSON.parse(savedRecords));
            if (savedNotes) setNotes(JSON.parse(savedNotes));
            if (savedWeeklyNotes) setWeeklyNotes(JSON.parse(savedWeeklyNotes));
            setIsLoaded(true);
        }

        return () => { if (unsubscribe) unsubscribe(); };
    }, [userId]);

    // ─── GUARDAR CAMBIOS (Solo Local Automático) ─────────────────────────
    useEffect(() => {
        if (!isLoaded) return;
        // Guardar en localStorage siempre para no perder datos en recargas
        localStorage.setItem('habitTracker_habits', JSON.stringify(habits));
        localStorage.setItem('habitTracker_records', JSON.stringify(records));
        localStorage.setItem('habitTracker_notes', JSON.stringify(notes));
        localStorage.setItem('habitTracker_weeklyNotes', JSON.stringify(weeklyNotes));
    }, [habits, records, notes, weeklyNotes, isLoaded]);

    const [isSaving, setIsSaving] = useState(false);
    const [trophyEvent, setTrophyEvent] = useState(null);

    const saveToCloud = async () => {
        if (!userId) return;
        setIsSaving(true);
        try {
            const { doc, setDoc } = await import('firebase/firestore');
            const { db } = await import('../firebase.js');
            const docRef = doc(db, 'users', userId, 'data', 'habitData');
            await setDoc(docRef, { habits, records, notes, weeklyNotes }, { merge: true });
        } catch (error) {
            console.error("Error guardando en la nube:", error);
        } finally {
            setIsSaving(false);
        }
    };

    // ─── FUNCIONES ─────────────────────────────────────────────────────────
    const addHabit = (name, targetDate, reminderTime = null, category = 'general', goalType = 'consistencia', goalValue = '') => {
        if (!name.trim()) return;
        setHabits(prev => [...prev, {
            id: Date.now().toString(),
            name: name.trim(),
            frequency: 'diaria',
            targetDate: targetDate || null,
            reminderTime: reminderTime || null,
            category: category,
            goalType: goalType,
            goalValue: goalValue ? Number(goalValue) : (goalType === 'consistencia' ? 30 : null) // Default 30 para consistencia
        }]);
    };

    const updateNote = (dateStr, text) => setNotes(prev => ({ ...prev, [dateStr]: text }));

    const updateWeeklyNote = (weekKey, value) => setWeeklyNotes(prev => ({ ...prev, [weekKey]: value }));

    const removeHabit = (id) => setHabits(prev => prev.filter(h => h.id !== id));

    const toggleRecord = (dateStr, habitId) => {
        setRecords(prev => {
            const newRecords = { ...prev };
            const dayRecords = { ...(newRecords[dateStr] || {}) };
            const wasDone = dayRecords[habitId];
            dayRecords[habitId] = !wasDone;
            newRecords[dateStr] = dayRecords;
            
            // LÓGICA DE TROFEOS NO LINEALES (Fase 19)
            if (!wasDone) {
                const habit = habits.find(h => h.id === habitId);
                // Solo evaluamos si tiene una meta definida y no es Zen
                if (habit && habit.goalValue && habit.goalType !== 'zen') {
                    // Calcular el progreso total actual (veces que se ha cumplido)
                    let totalDone = 0;
                    Object.values(newRecords).forEach(day => {
                        if (day[habitId]) totalDone++;
                    });
                    
                    // Cálculo de Umbrales exactos para disparar evento una sola vez
                    let earned = null;
                    if (totalDone === Math.ceil(habit.goalValue * 0.25)) earned = 'Bronce';
                    else if (totalDone === Math.ceil(habit.goalValue * 0.50)) earned = 'Plata';
                    else if (totalDone === Math.ceil(habit.goalValue * 0.80)) earned = 'Oro';
                    else if (totalDone === habit.goalValue) earned = 'Diamante';
                    
                    if (earned) {
                        setTrophyEvent({ 
                            habitName: habit.name, 
                            category: habit.category, 
                            tier: earned, 
                            timestamp: Date.now() 
                        });
                    }
                }
            }
            return newRecords;
        });
    };

    // ─── ESTADÍSTICAS ───────────────────────────────────────────────────
    const stats = useMemo(() => {
        const s = { daily: 0, monthly: 0, completed: 0, total: 0, chart: [], pneumaXP: 0, techneOutputs: 0 };
        if (habits.length === 0) return s;
        
        const dayCount = habits.length;
        s.total = dayCount * daysInMonth;
        
        monthDays.forEach(date => {
            const dStr = formatDate(date);
            const dayRecs = records[dStr] || {};
            const dailyDone = habits.filter(h => dayRecs[h.id]).length;
            s.completed += dailyDone; // Total real
            s.chart.push({ day: date.getDate(), pct: dayCount > 0 ? (dailyDone / dayCount) * 100 : 0 });
            
            // Computando XP y Óutputs para Gemelos Digitales
            habits.forEach(h => {
                if (dayRecs[h.id]) {
                    if (h.category === 'pneuma') s.pneumaXP += 5; // 5 XP por vez
                    if (h.category === 'techne') s.techneOutputs += 1;
                }
            });
        });
        
        s.monthly = Math.round((s.completed / s.total) * 100) || 0;
        const todayDone = habits.filter(h => (records[todayDateStr] || {})[h.id]).length;
        s.daily = Math.round((todayDone / dayCount) * 100) || 0;
        return s;
    }, [habits, records, daysInMonth, monthDays, todayDateStr]);

    const racha = useMemo(() => {
        if (habits.length === 0) return 0;
        let count = 0;
        let d = new Date();
        const todayStr = formatDate(d);
        const todayDone = habits.filter(h => (records[todayStr] || {})[h.id]).length;
        if (todayDone < habits.length) d.setDate(d.getDate() - 1);
        while (true) {
            const dStr = formatDate(d);
            const done = habits.filter(h => (records[dStr] || {})[h.id]).length;
            if (done === habits.length && habits.length > 0) { count++; d.setDate(d.getDate() - 1); }
            else break;
        }
        return count;
    }, [habits, records]);

    return { habits, records, notes, weeklyNotes, isLoaded, isSaving, addHabit, removeHabit, toggleRecord, updateNote, updateWeeklyNote, saveToCloud, stats, racha, trophyEvent, setTrophyEvent };
};

function getDefaultHabits() {
    return [
        { id: '1', name: '💧 2L de agua' },
        { id: '2', name: '📚 Leer durante 30 minutos' },
        { id: '3', name: '🧘 Yoga' }
    ];
}
