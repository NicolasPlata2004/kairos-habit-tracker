/**
 * ARCHIVO: App.jsx
 * PAPEL: Componente Orquestador Principal (Root UI Component).
 * DESCRIPCIÓN: Este archivo es el esqueleto que sostiene toda la aplicación. Aquí es donde 
 * se arma el rompecabezas: Importa el Hook lógico (useHabits), renderiza el header con tu perfil,
 * dibuja las tarjetas de resumen (progreso circular, gráfica principal) y muestra las tablas 
 * enviando los datos correspondientes. También maneja la lógica de Notificaciones Push locales.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, Target, Flame, LogOut, X } from 'lucide-react';
import { useHabits } from './hooks/useHabits';
import { getDaysInMonth, formatDate } from './utils/dateUtils';
import { MESES } from './utils/constants';
import CircularProgress from './components/CircularProgress';
import ProgressBar from './components/ProgressBar';
import HabitTable from './components/HabitTable';
import WeeklyHabits from './components/WeeklyHabits';
import ProfileDropdown from './components/ProfileDropdown';
import TrophyNotification from './components/TrophyNotification';
import NeuralMap from './components/NeuralMap';
import CreativeTree from './components/CreativeTree';
import WeeklyReview from './components/WeeklyReview';
import MobileDayView from './components/MobileDayView';

const App = () => {
  // ── FIREBASE DYNAMIC LOAD ───────────────────────────────────────────────
  const [firebaseMod, setFirebaseMod] = useState({ loaded: true, auth: null, onAuthStateChanged: null, signOut: null, AuthScreen: null }); // FORzando offline para test
  const [firebaseUser, setFirebaseUser] = useState(false);
  const [localBypass, setLocalBypass] = useState(false);

  useEffect(() => {
    // Exponemos bypass para testing sin Firebase
    window.bypassAuth = () => setLocalBypass(true);

    // Intentamos cargar Firebase dinámicamente
    Promise.all([
      import('./firebase.js').catch(() => null),
      import('firebase/auth').catch(() => null),
      import('./components/AuthScreen.jsx').catch(() => null)
    ]).then(([fb, authPkg, authScreenPkg]) => {
      // Si todo cargó Y además de que el usuario haya puesto sus credenciales...
      if (fb && fb.auth && authPkg && authScreenPkg && fb.isConfigured) {
        setFirebaseMod({
          loaded: true,
          auth: fb.auth,
          onAuthStateChanged: authPkg.onAuthStateChanged,
          signOut: authPkg.signOut,
          AuthScreen: authScreenPkg.default
        });
      } else {
        // Fallback offline (sin Firebase)
        setFirebaseMod({ loaded: true, auth: null, onAuthStateChanged: null, signOut: null, AuthScreen: null });
        setFirebaseUser(false);
      }
    });
  }, []);

  // Escuchar estado de autenticación
  useEffect(() => {
    if (!firebaseMod.loaded || !firebaseMod.auth) return;
    const unsub = firebaseMod.onAuthStateChanged(firebaseMod.auth, (user) => {
      setFirebaseUser(user || false);
    });
    return unsub;
  }, [firebaseMod]);

  // ── ESTADO APP (7-DAY SLIDING WINDOW) ──────────────────────────────────
  const todayRaw = new Date();
  const todayDateStr = [
    todayRaw.getFullYear(),
    String(todayRaw.getMonth() + 1).padStart(2, '0'),
    String(todayRaw.getDate()).padStart(2, '0')
  ].join('-');

  // Window default: 3 días antes de hoy y 3 días después de hoy.
  const defaultWindowStart = new Date(todayRaw);
  defaultWindowStart.setDate(todayRaw.getDate() - 3);

  const [windowStartDate, setWindowStartDate] = useState(defaultWindowStart);

  // Generamos los 7 días visibles desde windowStartDate
  const visibleDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(windowStartDate);
        d.setDate(windowStartDate.getDate() + i);
        days.push(d);
    }
    return days;
  }, [windowStartDate]);

  // HACK: Compatibilidad con useHabits temporal, stats se computará en los visibleDays o en los pre-guardados
  const monthDays = visibleDays; // Hacemos que "el mes entero" sean los 7 días por ahora, para no romper HabitTable interno de tajo. 
  const daysInMonth = 7;

  const [selectedDateStr, setSelectedDateStr] = useState(todayDateStr);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isPneumaOpen, setIsPneumaOpen] = useState(false);
  const [isTechneOpen, setIsTechneOpen] = useState(false);

  // Pasamos el UID a useHabits (si existe) para que sincronice con Firestore
  const { habits, records, isLoaded, isSaving, saveToCloud, addHabit, removeHabit, toggleRecord, updateNote, notes, weeklyNotes, updateWeeklyNote, stats, racha, trophyEvent, setTrophyEvent } =
    useHabits(daysInMonth, monthDays, todayDateStr, firebaseUser ? firebaseUser.uid : null);

  // Pestañas móviles: resumen | diario | semanal
  const [mobileTab, setMobileTab] = useState('diario');

  const prevWeek = () => {
    const newStart = new Date(windowStartDate);
    newStart.setDate(windowStartDate.getDate() - 7);
    setWindowStartDate(newStart);
  };
  const nextWeek = () => {
    const newStart = new Date(windowStartDate);
    newStart.setDate(windowStartDate.getDate() + 7);
    setWindowStartDate(newStart);
  };

  const handleSignOut = async () => {
    if (firebaseMod.signOut && firebaseMod.auth) {
      await firebaseMod.signOut(firebaseMod.auth);
    }
  };

  // ── RECORDATORIOS Y NOTIFICACIONES LOCALES ────────────────────────────────
  useEffect(() => {
    const checkReminder = () => {
      if (Notification.permission !== 'granted') return;

      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const todayStr = formatDate(now);

      // 1. Recordatorio General de Planificación (Desde Configuración Perfil)
      const configReminderTime = localStorage.getItem('habitTracker_reminderTime');
      const lastGeneralNotified = localStorage.getItem('habitTracker_lastNotified');

      if (configReminderTime && currentTimeStr === configReminderTime && lastGeneralNotified !== todayStr) {
        new Notification('🌟 Tiempo de Kairos', {
          body: 'Recuerda planificar tu día de mañana para mantener tu buena racha.',
          icon: '/logo.png' // Icono nativo de Chrome/Android Notificación
        });
        localStorage.setItem('habitTracker_lastNotified', todayStr);
      }

      // 2. Recordatorios Específicos por Hábito
      let notifiedHabits = { date: '', sent: [] };
      try {
        const stored = localStorage.getItem('habitTracker_notifiedHabits');
        if (stored) notifiedHabits = JSON.parse(stored);
      } catch (e) { }

      // Reseteamos el registro si ya es un nuevo día
      if (notifiedHabits.date !== todayStr) {
        notifiedHabits = { date: todayStr, sent: [] };
      }

      let modifiedNotifiedHabits = false;
      const todayRecords = records[todayStr] || {};

      // Buscamos matches de tiempo activo entre todos los hábitos y la hora local
      habits.forEach(habit => {
        // ¿Tiene una hora asignada, es idéntica al minuto actual, y NO fue notificado hoy?
        if (habit.reminderTime && habit.reminderTime === currentTimeStr && !notifiedHabits.sent.includes(habit.id)) {

          // Chequear si este hábito le aplica legalmente al día de HOY
          const appliesToday = (habit.frequency === 'diaria' && !habit.targetDate) || habit.targetDate === todayStr;

          if (appliesToday) {
            // Verificar si el hábito aún NO ha sido marcado (check)
            const isCompleted = todayRecords[habit.id];

            if (!isCompleted) {
              new Notification('⏰ Recordatorio Específico', {
                body: `Recuerda hacer: ${habit.name}`,
                icon: '/logo.png'
              });
              notifiedHabits.sent.push(habit.id); // Registrar envío para evitar spam en el mismo minuto
              modifiedNotifiedHabits = true;
            }
          }
        }
      });

      // Si enviamos alguna alerta de hábito en este ciclo, guardamos la base local de notificados
      if (modifiedNotifiedHabits) {
        localStorage.setItem('habitTracker_notifiedHabits', JSON.stringify(notifiedHabits));
      }
    };

    // Lanzar el check automático cada minuto con el Event Loop
    const intervalId = setInterval(checkReminder, 60000);
    // Dispararlo justo ahora una vez por si nos perdimos el evento al abrir la app
    checkReminder();

    return () => clearInterval(intervalId);
  }, [habits, records]); // Añadimos dependencias para que el check tenga las listas frescas

  // ── RENDER ─────────────────────────────────────────────────────────────
  // 1. Cargando módulos o autenticación
  if (!firebaseMod.loaded || (firebaseMod.auth && firebaseUser === undefined)) {
    return <div className="min-h-screen flex items-center justify-center bg-dark-main">
      <div className="text-text-secondary font-medium animate-pulse">Cargando...</div>
    </div>;
  }

  // 2. Pantalla de Auth (si hay Firebase pero no hay sesión y NO hemos activado bypass)
  if (firebaseMod.auth && firebaseUser === false && firebaseMod.AuthScreen && !localBypass) {
    const AuthScreen = firebaseMod.AuthScreen;
    return <AuthScreen />;
  }

  // 3. App Principal (Offline o Logueado)
  return (
    <div className="min-h-screen bg-dark-main font-sans text-text-primary p-2 md:p-4 pb-20">
      <div className="max-w-7xl mx-auto bg-dark-card shadow-2xl border border-border-subtle rounded-2xl overflow-hidden">

        {/* ── CABECERA ── */}
        <div className="p-4 md:p-6 border-b border-border-subtle bg-dark-card">
          <div className="flex flex-col gap-4 md:flex-row md:items-end justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 mr-2">
                <img src="/logo.png" alt="Kairos" className="w-16 h-16 md:w-20 md:h-20 object-contain shrink-0 drop-shadow-sm" />
                <span className="text-4xl font-black tracking-tight text-text-primary hidden sm:block">Kairos</span>
              </div>
              <div className="h-8 w-px bg-dark-main border border-border-subtle hidden sm:block"></div>
              {/* RANGO DE FECHAS */}
              <h1 className="text-xl md:text-3xl font-serif text-text-secondary whitespace-nowrap">
                {visibleDays.length === 7 ? `${visibleDays[0].getDate()} ${MESES[visibleDays[0].getMonth()].substring(0,3)} — ${visibleDays[6].getDate()} ${MESES[visibleDays[6].getMonth()].substring(0,3)}` : ''}
              </h1>
            </div>
            {/* Botón de Perfil con menú desplegable, Guardar y Twins */}
            {firebaseUser && (
              <div className="flex items-center gap-1 md:gap-3 self-end md:self-auto z-50">
                <button
                  onClick={() => setIsReviewOpen(true)}
                  className="flex items-center gap-1 px-2 py-1.5 md:px-3 bg-gray-900 text-white hover:bg-black rounded-lg text-xs md:text-sm font-bold border border-gray-900 transition-colors shadow-lg shadow-gray-900/20"
                  title="SOMA Check-In"
                >
                  <Target size={14} className="text-blue-400" /> <span className="hidden lg:inline">SOMA Check-In</span><span className="lg:hidden">SOMA</span>
                </button>
                <button
                  onClick={() => setIsPneumaOpen(true)}
                  className="flex items-center gap-1 px-2 py-1.5 md:px-3 bg-[#1e1b4b] text-white hover:bg-[#151236] rounded-lg text-xs md:text-sm font-bold border border-[#2d2966] transition-colors shadow-lg shadow-[#1e1b4b]/20"
                  title="PNEUMA Map"
                >
                  <Flame size={14} className="text-purple-400" /> <span className="hidden lg:inline">PNEUMA Map</span><span className="lg:hidden">PNEUMA</span>
                </button>
                <button
                  onClick={() => setIsTechneOpen(true)}
                  className="flex items-center gap-1 px-2 py-1.5 md:px-3 bg-[#064e3b] text-white hover:bg-[#022c22] rounded-lg text-xs md:text-sm font-bold border border-[#065f46] transition-colors shadow-lg shadow-[#064e3b]/20"
                  title="TECHNE Tree"
                >
                  <TrendingUp size={14} className="text-emerald-400" /> <span className="hidden lg:inline">TECHNE Tree</span><span className="lg:hidden">TECHNE</span>
                </button>
                <button
                  onClick={saveToCloud}
                  disabled={isSaving}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs md:text-sm font-bold border border-blue-200 transition-colors disabled:opacity-50"
                  title="Guardar Nube"
                >
                  {isSaving ? "Guardando..." : "Guardar Nube"}
                </button>
                <ProfileDropdown user={firebaseUser} onSignOut={handleSignOut} />
              </div>
            )}
          </div>

          {/* NAVEGACIÓN SECUNDARIA: SEMANAS Y TABS MÓVILES */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-2 mb-4 bg-dark-main border border-border-subtle p-2 md:p-3 rounded-lg overflow-x-auto">
            {/* Paginación Semanal Universal */}
            <div className="flex items-center gap-3 bg-dark-card p-1.5 rounded-md border border-border-subtle shadow-sm shrink-0 w-full md:w-auto justify-center">
              <button onClick={prevWeek} className="p-1 hover:bg-dark-main rounded text-text-secondary">
                <ChevronLeft size={16} />
              </button>
              <div className="font-bold text-[11px] text-text-primary uppercase tracking-widest min-w-[120px] text-center">
                 {visibleDays.length === 7 ? `${visibleDays[0].getFullYear()}` : ''}
              </div>
              <button onClick={nextWeek} className="p-1 hover:bg-dark-main rounded text-text-secondary">
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Mobile Tabs */}
            <div className="md:hidden flex w-full bg-dark-main border border-border-subtle rounded-lg p-1 shrink-0">
              {['resumen', 'diario', 'semanal'].map(tab => (
                <button
                  key={tab}
                  className={`flex-1 text-[10px] font-bold uppercase py-2 rounded-md transition-all ${mobileTab === tab ? 'bg-dark-card shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                  onClick={() => setMobileTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* SECCIÓN RESUMEN GLOBAL */}
          <div className={mobileTab !== 'resumen' ? 'hidden md:block' : ''}>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-stretch mb-6">
              {/* Tarjetas Métricas */}
              <div className="flex gap-3 shrink-0">
                <div className="bg-dark-card p-3 md:p-4 items-center justify-center rounded-2xl border border-border-subtle flex flex-col shadow-sm w-1/2 xl:w-40">
                  <span className="text-[10px] md:text-[11px] font-bold text-text-primary uppercase mb-2 md:mb-4 tracking-widest text-center">PROGRESO</span>
                  <CircularProgress value={stats.completed} max={stats.total} />
                </div>
                <div className="bg-dark-card rounded-2xl border border-border-subtle shadow-sm flex overflow-hidden w-1/2 xl:w-auto">
                  <div className="p-3 md:p-5 flex flex-col justify-center flex-1 xl:w-48 border-r border-border-subtle">
                    <div className="space-y-3 md:space-y-4">
                      <div>
                        <div className="flex justify-between text-[9px] md:text-[10px] font-bold mb-1.5"><span className="text-text-secondary">DIARIO</span><span>{stats.daily}%</span></div>
                        <ProgressBar percentage={stats.daily} colorClass="bg-green-400" />
                      </div>
                      <div>
                        <div className="flex justify-between text-[9px] md:text-[10px] font-bold mb-1.5"><span className="text-text-secondary">MENSUAL</span><span>{stats.monthly}%</span></div>
                        <ProgressBar percentage={stats.monthly} colorClass="bg-pink-400" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-dark-main p-3 md:p-5 flex flex-col items-center justify-center shrink-0 w-24 md:w-28">
                    <Flame size={20} className="text-orange-500 mb-1" />
                    <span className="text-2xl md:text-4xl font-black text-orange-600 leading-none my-1">{racha}</span>
                    <span className="text-[9px] font-bold text-orange-800 uppercase mt-1 tracking-widest">RACHA</span>
                  </div>
                </div>
              </div>

              {/* Gráfica de Tendencia */}
              <div className="bg-dark-card rounded-2xl border border-border-subtle shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex-1 flex flex-col p-4 relative min-h-[140px] xl:min-h-[160px] overflow-hidden">
                {stats.chart.length > 0 ? (
                  <div className="h-full w-full relative">
                    {(() => {
                      const V_WIDTH = 1000;
                      const V_HEIGHT = 200;
                      const dx = V_WIDTH / (stats.chart.length - 1 || 1);
                      const points = stats.chart.map((d, i) => ({ x: i * dx, y: V_HEIGHT - (d.pct / 100) * V_HEIGHT, pct: d.pct, date: monthDays[i] }));
                      const pathD = points.reduce((acc, p, i, a) => {
                        if (i === 0) return `M ${p.x},${p.y}`;
                        const prev = a[i - 1];
                        // Smooth curve using Monotone Bezier (horizontal tangents)
                        const cp1x = (prev.x + p.x) / 2;
                        const cp1y = prev.y;
                        const cp2x = (prev.x + p.x) / 2;
                        const cp2y = p.y;
                        return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p.x},${p.y}`;
                      }, '');
                      const areaD = `${pathD} L ${V_WIDTH},${V_HEIGHT} L 0,${V_HEIGHT} Z`;

                      return (
                        <svg viewBox={`0 -10 ${V_WIDTH} ${V_HEIGHT + 50}`} className="w-full h-28 md:h-[130px] overflow-visible">
                          <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="rgba(209,213,219,0.5)" />
                              <stop offset="100%" stopColor="rgba(243,244,246,0.1)" />
                            </linearGradient>
                          </defs>
                          <path d={areaD} fill="url(#chartGradient)" />
                          <path d={pathD} fill="none" stroke="#9ca3af" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                          {points.map((p, i) => {
                            const dStr = [p.date.getFullYear(), String(p.date.getMonth() + 1).padStart(2, '0'), String(p.date.getDate()).padStart(2, '0')].join('-');
                            if (dStr > todayDateStr) return null;
                            return (
                              <circle key={i} cx={p.x} cy={p.y} r="5" fill={p.pct === 100 ? '#4ade80' : 'white'} stroke={p.pct === 100 ? '#22c55e' : '#9ca3af'} strokeWidth="3">
                                <title>{p.date.getDate()} - Progreso: {p.pct.toFixed(0)}%</title>
                              </circle>
                            );
                          })}
                          {/* Etiquetas de fechas dibujadas directamente en el SVG para evitar que se recorten */}
                          {points.map((p, i) => {
                            const dStr = [p.date.getFullYear(), String(p.date.getMonth() + 1).padStart(2, '0'), String(p.date.getDate()).padStart(2, '0')].join('-');
                            const isToday = dStr === todayDateStr;
                            // Mostrar etiqueta solo cada ciertos días en móvil, o todos en desktop (simulado por no estar tan saturado el ancho)
                            return (
                              <text
                                key={`t-${i}`}
                                x={p.x}
                                y={V_HEIGHT + 30}
                                textAnchor="middle"
                                fontSize="18"
                                fontWeight="bold"
                                fill={isToday ? '#ca8a04' : '#d1d5db'}
                                className="hidden md:block" // Se muestran todos en desktop mediante Tailwind? No se puede aplicar class al text en SVG facil, mejor solo renderizar en DOM
                              >
                                {p.date.getDate()}
                              </text>
                            );
                          })}
                          {/* Versión responsiva de los días para celular (solo mostramos impares o algunos para no saturar) */}
                          {points.map((p, i) => {
                            const dStr = [p.date.getFullYear(), String(p.date.getMonth() + 1).padStart(2, '0'), String(p.date.getDate()).padStart(2, '0')].join('-');
                            const isToday = dStr === todayDateStr;
                            if (i % 2 !== 0 && !isToday) return null; // Saltar pares en celular para que no colisionen
                            return (
                              <text
                                key={`t-mob-${i}`}
                                x={p.x}
                                y={V_HEIGHT + 30}
                                textAnchor="middle"
                                fontSize="24"
                                fontWeight="bold"
                                fill={isToday ? '#ca8a04' : '#d1d5db'}
                                className="md:hidden" // Mostrado en móviles
                              >
                                {p.date.getDate()}
                              </text>
                            );
                          })}
                        </svg>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-text-secondary italic">Agrega hábitos para ver tu tendencia de cumplimiento.</div>
                )}
              </div>
            </div>
          </div>

          {/* ── ALERTA FIREBASE ── */}
          {!firebaseMod.auth && (
            <div className="bg-yellow-900/30 p-3 text-xs text-yellow-200 border-b border-yellow-800/50 text-center">
              <strong>Modo Local:</strong> Tus datos se están guardando solo en este dispositivo. Configura `firebase.js` para sincronizar entre celular y compu.
            </div>
          )}

          {/* SECCIÓN DIARIA (HabitTable o List) */}
          <div className={mobileTab !== 'diario' ? 'hidden md:block' : ''}>
            <div className="hidden md:block">
              {/* ── TABLA DE HÁBITOS (DESKTOP) ── */}
              <HabitTable
                habits={habits}
                records={records}
                monthDays={monthDays}
                visibleDays={visibleDays}
                todayDateStr={todayDateStr}
                daysInMonth={daysInMonth}
                toggleRecord={toggleRecord}
                removeHabit={removeHabit}
                addHabit={addHabit}
                stats={stats}
                selectedDateStr={selectedDateStr}
                setSelectedDateStr={setSelectedDateStr}
              />
            </div>
            <div className="block md:hidden mt-4">
              <MobileDayView 
                habits={habits}
                records={records}
                toggleRecord={toggleRecord}
                todayDateStr={todayDateStr}
              />
            </div>
          </div>

          {/* LISTA DE PROGRESO DE HÁBITOS DETALLADA (Movida debajo de la tabla) */}
          <div className={mobileTab !== 'diario' ? 'hidden md:block' : ''}>
            <div className="bg-dark-card rounded-2xl border border-border-subtle shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-4 md:p-6 mb-6 mt-6">
              <h3 className="text-xs font-black text-text-primary uppercase tracking-widest mb-4 border-b border-border-subtle pb-3 flex items-center gap-2">
                <Target size={16} className="text-blue-500" /> Progreso por Hábito
              </h3>
              <div className="flex flex-col gap-4">
                {habits.filter(h => (h.frequency || 'diaria') !== 'semanal').map(habit => {
                  let habitCount = 0;
                  monthDays.forEach(d => { if ((records[formatDate(d)] || {})[habit.id]) habitCount++; });
                  const maxDays = daysInMonth;
                  const habitPct = Math.min(100, (habitCount / maxDays) * 100).toFixed(0);

                  return (
                    <div key={habit.id} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-end">
                        <span className="text-sm font-bold text-text-primary">{habit.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-dark-main text-text-secondary">{habitCount}/{maxDays}</span>
                          <span className="text-[10px] font-black w-8 text-right text-text-primary">{habitPct}%</span>
                        </div>
                      </div>
                      <div className="w-full h-2 md:h-2.5 bg-dark-main rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${habitPct >= 100 ? 'bg-green-400' : 'bg-blue-400'}`} style={{ width: `${habitPct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
                {habits.filter(h => (h.frequency || 'diaria') !== 'semanal').length === 0 && (
                  <div className="text-xs text-center text-text-secondary italic py-4">No hay hábitos diarios registrados aún.</div>
                )}
              </div>
            </div>
          </div>

          {/* SECCIÓN SEMANAL */}
          <div className={mobileTab !== 'semanal' ? 'hidden md:block' : ''}>
            {/* ── METAS SEMANALES ── */}
            <WeeklyHabits
              habits={habits}
              records={records}
              toggleRecord={toggleRecord}
              removeHabit={removeHabit}
              visibleDays={visibleDays}
              weeklyNotes={weeklyNotes}
              updateWeeklyNote={updateWeeklyNote}
            />
          </div>

          {/* ── DIARIO (Notas movidas al final, visibles en Tab Diario en móvil o siempre en Web al fondo) ── */}
          <div className={mobileTab !== 'diario' ? 'hidden md:block' : ''}>
            <div className="mt-6 bg-dark-card border border-border-subtle rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-6">
              <div className="bg-dark-main border-b border-border-subtle p-3 px-4 md:px-6 flex justify-between items-center">
                <h3 className="text-sm font-bold text-text-primary capitalize">
                  Nota Diaria: {selectedDateStr === todayDateStr ? 'Hoy' : selectedDateStr}
                </h3>
                {firebaseMod.auth ? (
                  <button
                    onClick={saveToCloud}
                    disabled={isSaving}
                    className="text-xs font-bold px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-1 shadow-sm disabled:opacity-50"
                  >
                    {isSaving ? "Guardando..." : "Guardar Nota"}
                  </button>
                ) : (
                  <button
                    onClick={() => { document.activeElement?.blur(); }}
                    className="text-xs font-bold px-4 py-1.5 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors"
                  >
                    Listo
                  </button>
                )}
              </div>
              <div className="p-4 md:p-6 bg-dark-main">
                <textarea
                  className="w-full h-24 p-3 md:p-4 bg-dark-card border border-border-subtle rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none shadow-inner"
                  placeholder={`¿Qué hiciste el ${selectedDateStr}? Escribe tus logros, retos o pensamientos del día...`}
                  value={notes[selectedDateStr] || ''}
                  onChange={(e) => updateNote(selectedDateStr, e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-dark-main text-center text-[10px] font-bold text-text-secondary uppercase tracking-widest border-t border-border-subtle flex-shrink-0">
            - Diseñado para mejorar tu constancia día a día -
          </div>
        </div>
      </div>
      
      {/* Sistema de Trofeos Emergente (Fase 19) */}
      <TrophyNotification event={trophyEvent} onClose={() => setTrophyEvent(null)} />

      {/* Modal de Calibración Semanal SOMA */}
      <WeeklyReview 
        isOpen={isReviewOpen} 
        onClose={() => setIsReviewOpen(false)} 
        initialMeasurements={stats.latestSoma}
        onSave={(data) => {
          // Placeholder por si queremos guardar las medidas luego
        }}
      />

      {/* PNEUMA MAP MODAL */}
      {isPneumaOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-purple-500/30 animate-in zoom-in-95 duration-200 flex flex-col h-auto max-h-[90vh]">
            <div className="p-4 px-6 flex justify-between items-center border-b border-gray-800 shrink-0 bg-gray-900 z-10 w-full relative">
              <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-2">
                <Flame size={20} className="text-purple-400" /> PNEUMA Visualizer
              </h2>
              <button 
                onClick={() => setIsPneumaOpen(false)} 
                className="p-2 text-text-secondary hover:text-white bg-gray-800/50 hover:bg-gray-800 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="relative p-0 flex items-center justify-center w-full min-h-[400px]">
              <NeuralMap mindXP={stats.pneumaXP || 0} />
            </div>
          </div>
        </div>
      )}

      {/* TECHNE TREE MODAL */}
      {isTechneOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm">
          <div className="bg-dark-card rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-emerald-500/30 animate-in zoom-in-95 duration-200 flex flex-col h-auto max-h-[90vh]">
            <div className="p-4 px-6 flex justify-between items-center border-b border-border-subtle shrink-0 z-10 w-full relative group">
              <h2 className="text-lg md:text-xl font-black text-text-primary flex items-center gap-2">
                <TrendingUp size={20} className="text-emerald-500" /> TECHNE Visualizer
              </h2>
              <button 
                onClick={() => setIsTechneOpen(false)} 
                className="p-2 text-text-secondary hover:text-emerald-600 bg-dark-main hover:bg-emerald-50 focus:outline-none rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="relative bg-dark-main p-0 flex items-center justify-center w-full min-h-[400px] h-[60vh]">
              <CreativeTree streak={racha} outputsCount={stats.techneOutputs || 0} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;