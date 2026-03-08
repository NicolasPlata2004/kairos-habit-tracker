import { useState, useEffect, useMemo } from 'react';
import { formatDate } from '../utils/dateUtils';

// useHabits — sincroniza con Firestore si Firebase está configurado, sino usa localStorage
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
    const addHabit = (name, targetDate) => {
        if (!name.trim()) return;
        setHabits(prev => [...prev, { id: Date.now().toString(), name: name.trim(), frequency: 'diaria', targetDate: targetDate || null }]);
    };

    const updateNote = (dateStr, text) => setNotes(prev => ({ ...prev, [dateStr]: text }));

    const updateWeeklyNote = (weekKey, value) => setWeeklyNotes(prev => ({ ...prev, [weekKey]: value }));

    const removeHabit = (id) => setHabits(prev => prev.filter(h => h.id !== id));

    const toggleRecord = (dateStr, habitId) => {
        setRecords(prev => {
            const newRecords = { ...prev };
            const dayRecords = { ...(newRecords[dateStr] || {}) };
            dayRecords[habitId] = !dayRecords[habitId];
            newRecords[dateStr] = dayRecords;
            return newRecords;
        });
    };

    // ─── ESTADÍSTICAS ───────────────────────────────────────────────────
    const stats = useMemo(() => {
        const s = { daily: 0, monthly: 0, completed: 0, total: 0, chart: [] };
        if (habits.length === 0) return s;
        const dayCount = habits.length;
        s.total = dayCount * daysInMonth;
        monthDays.forEach(date => {
            const dStr = formatDate(date);
            const dayRecs = records[dStr] || {};
            const dailyDone = habits.filter(h => dayRecs[h.id]).length;
            s.completed += dailyDone; // Total real
            s.chart.push({ day: date.getDate(), pct: dayCount > 0 ? (dailyDone / dayCount) * 100 : 0 });
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

    return { habits, records, notes, weeklyNotes, isLoaded, isSaving, addHabit, removeHabit, toggleRecord, updateNote, updateWeeklyNote, saveToCloud, stats, racha };
};

function getDefaultHabits() {
    return [
        { id: '1', name: '💧 2L de agua' },
        { id: '2', name: '📚 Leer durante 30 minutos' },
        { id: '3', name: '🧘 Yoga' }
    ];
}
