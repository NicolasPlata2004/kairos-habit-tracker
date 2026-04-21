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
    const [projects, setProjects] = useState([]);
    const [dailyLogs, setDailyLogs] = useState({});
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
                            setProjects(d.projects || []);
                            setDailyLogs(d.dailyLogs || {});
                        } else {
                            setHabits(getDefaultHabits());
                            setRecords({});
                            setNotes({});
                            setWeeklyNotes({});
                            setProjects([]);
                            setDailyLogs({});
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
            const savedProjects = localStorage.getItem('habitTracker_projects');
            const savedDailyLogs = localStorage.getItem('habitTracker_dailyLogs');

            setHabits(savedHabits ? JSON.parse(savedHabits) : getDefaultHabits());
            if (savedRecords) setRecords(JSON.parse(savedRecords));
            if (savedNotes) setNotes(JSON.parse(savedNotes));
            if (savedWeeklyNotes) setWeeklyNotes(JSON.parse(savedWeeklyNotes));
            if (savedProjects) setProjects(JSON.parse(savedProjects));
            if (savedDailyLogs) setDailyLogs(JSON.parse(savedDailyLogs));
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
        localStorage.setItem('habitTracker_projects', JSON.stringify(projects));
        localStorage.setItem('habitTracker_dailyLogs', JSON.stringify(dailyLogs));
    }, [habits, records, notes, weeklyNotes, projects, dailyLogs, isLoaded]);

    const [isSaving, setIsSaving] = useState(false);
    const [trophyEvent, setTrophyEvent] = useState(null);

    const saveToCloud = async () => {
        if (!userId) return;
        setIsSaving(true);
        try {
            const { doc, setDoc } = await import('firebase/firestore');
            const { db } = await import('../firebase.js');
            const docRef = doc(db, 'users', userId, 'data', 'habitData');
            await setDoc(docRef, { habits, records, notes, weeklyNotes, projects, dailyLogs }, { merge: true });
        } catch (error) {
            console.error("Error guardando en la nube:", error);
        } finally {
            setIsSaving(false);
        }
    };

    // ─── FUNCIONES ─────────────────────────────────────────────────────────
    const addHabit = (name, targetDate, reminderTime = null, category = 'general', goalType = 'consistencia', goalValue = '', scheduledDays = [0, 1, 2, 3, 4, 5, 6]) => {
        if (!name.trim()) return;
        setHabits(prev => [...prev, {
            id: Date.now().toString(),
            name: name.trim(),
            frequency: 'diaria',
            targetDate: targetDate || null,
            reminderTime: reminderTime || null,
            category: category,
            goalType: goalType,
            goalValue: goalValue ? Number(goalValue) : (goalType === 'consistencia' ? 30 : null), // Default 30 para consistencia
            scheduledDays: scheduledDays
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

    // ─── LÓGICA DE PROYECTOS ───────────────────────────────────────────────
    const addProject = (name, category, isNumeric, goalValue, unit) => {
        if (!name.trim()) return;
        setProjects(prev => [...prev, {
            id: Date.now().toString(),
            name: name.trim(),
            category,
            isNumeric,
            currentValue: 0,
            goalValue: isNumeric ? Number(goalValue) : null,
            unit: isNumeric ? unit : '',
            completed: false
        }]);
    };

    const removeProject = (id) => setProjects(prev => prev.filter(p => p.id !== id));

    const updateProjectProgress = (id, delta) => {
        setProjects(prev => prev.map(p => {
            if (p.id === id && p.isNumeric) {
                const newValue = Math.max(0, p.currentValue + delta);
                return { ...p, currentValue: newValue, completed: newValue >= p.goalValue };
            }
            return p;
        }));
    };

    const toggleProjectCheck = (id) => {
        setProjects(prev => prev.map(p => {
            if (p.id === id && !p.isNumeric) {
                return { ...p, completed: !p.completed };
            }
            return p;
        }));
    };

    // ─── LÓGICA DE LOG DIARIO ──────────────────────────────────────────────
    const addDailyLog = (dateStr, text, category) => {
        if (!text.trim()) return;
        setDailyLogs(prev => {
            const dayLogs = prev[dateStr] ? [...prev[dateStr]] : [];
            return {
                ...prev,
                [dateStr]: [...dayLogs, { id: Date.now().toString(), text: text.trim(), category, timestamp: Date.now() }]
            };
        });
    };

    const removeDailyLog = (dateStr, id) => {
        setDailyLogs(prev => {
            if (!prev[dateStr]) return prev;
            return {
                ...prev,
                [dateStr]: prev[dateStr].filter(log => log.id !== id)
            };
        });
    };

    // ─── RACHA INDIVIDUAL DE HÁBITOS ───────────────────────────────────────
    const getHabitStreak = (habitId) => {
        const habit = habits.find(h => h.id === habitId);
        if (!habit) return 0;
        let count = 0;
        let iterations = 0;
        let d = new Date(); // Empezar desde hoy
        
        while (true) {
            iterations++;
            const dStr = formatDate(d);
            const dIndex = d.getDay() === 0 ? 6 : d.getDay() - 1;
            
            // Si el hábito está programado para este día
            const isScheduled = !habit.scheduledDays || habit.scheduledDays.includes(dIndex);
            
            if (isScheduled) {
                const isDone = (records[dStr] || {})[habitId];
                if (isDone) {
                    count++;
                } else if (count > 0 || dStr !== todayDateStr) {
                    break;
                }
            }
            
            d.setDate(d.getDate() - 1);
            if (iterations > 500) break; // Safety limit over iterations, not match count
        }
        return count;
    };

    // ─── ESTADÍSTICAS ───────────────────────────────────────────────────
    const stats = useMemo(() => {
        const s = { daily: 0, monthly: 0, completed: 0, total: 0, chart: [], pneumaXP: 0, techneOutputs: 0 };
        if (habits.length === 0) return s;
        
        let todayExpectedCount = 0;
        let todayDoneCount = 0;
        
        monthDays.forEach(date => {
            const dStr = formatDate(date);
            const dIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
            
            const expectedHabits = habits.filter(h => 
                (h.frequency === 'diaria' || !h.frequency) && 
                (!h.scheduledDays || h.scheduledDays.includes(dIndex))
            );
            const expectedCount = expectedHabits.length;
            const dayRecs = records[dStr] || {};
            const dailyDone = expectedHabits.filter(h => dayRecs[h.id]).length;
            
            s.total += expectedCount;
            s.completed += dailyDone; // Total real
            s.chart.push({ day: date.getDate(), pct: expectedCount > 0 ? (dailyDone / expectedCount) * 100 : 0 });
            
            if (dStr === todayDateStr) {
                todayExpectedCount = expectedCount;
                todayDoneCount = dailyDone;
            }

            // Computando XP y Óutputs para Gemelos Digitales
            habits.forEach(h => {
                if (dayRecs[h.id]) {
                    if (h.category === 'pneuma') s.pneumaXP += 5; // 5 XP por vez
                    if (h.category === 'techne') s.techneOutputs += 1;
                }
            });

            // Sumandos los aportes de los Logs Diarios Espontáneos
            const logsToday = dailyLogs[dStr] || [];
            logsToday.forEach(log => {
                if (log.category === 'pneuma') s.pneumaXP += 5;
                if (log.category === 'techne') s.techneOutputs += 1;
            });
        });
        
        s.monthly = Math.round((s.completed / s.total) * 100) || 0;
        s.daily = todayExpectedCount > 0 ? Math.round((todayDoneCount / todayExpectedCount) * 100) : 0;
        return s;
    }, [habits, records, daysInMonth, monthDays, todayDateStr]);

    const racha = useMemo(() => {
        if (habits.length === 0) return 0;
        let count = 0;
        let d = new Date();
        let checkedToday = false;
        let iter = 0;

        while (true) {
            iter++;
            if (iter > 500) break; // Límite de seguridad
            
            const dStr = formatDate(d);
            const dIndex = d.getDay() === 0 ? 6 : d.getDay() - 1;

            const expectedHabits = habits.filter(h => {
                const isDailyOrAlways = h.frequency === 'diaria' || !h.frequency;
                const isScheduledToday = !h.scheduledDays || h.scheduledDays.includes(dIndex);
                return isDailyOrAlways && isScheduledToday;
            });

            const expectedCount = expectedHabits.length;
            const doneCount = expectedHabits.filter(h => (records[dStr] || {})[h.id]).length;

            if (!checkedToday) {
                checkedToday = true;
                if (expectedCount > 0 && doneCount < expectedCount) {
                    d.setDate(d.getDate() - 1);
                    continue;
                }
            }

            if (expectedCount === 0) {
                d.setDate(d.getDate() - 1);
                continue;
            }

            if (doneCount === expectedCount) {
                count++;
                d.setDate(d.getDate() - 1);
            } else {
                break;
            }
        }
        return count;
    }, [habits, records]);

    return { 
        habits, records, notes, weeklyNotes, projects, dailyLogs, 
        isLoaded, isSaving, trophyEvent, stats, racha,
        addHabit, removeHabit, toggleRecord, updateNote, updateWeeklyNote, saveToCloud, setTrophyEvent,
        addProject, removeProject, updateProjectProgress, toggleProjectCheck,
        addDailyLog, removeDailyLog, getHabitStreak
    };
};

function getDefaultHabits() {
    return [
        { id: '1', name: '💧 2L de agua' },
        { id: '2', name: '📚 Leer durante 30 minutos' },
        { id: '3', name: '🧘 Yoga' }
    ];
}
