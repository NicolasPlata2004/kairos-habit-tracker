import React, { useState } from 'react';
import { Plus, Trash2, Zap, MessageSquare } from 'lucide-react';

export default function DailyLog({ dailyLogs, addDailyLog, removeDailyLog, todayDateStr }) {
    const [text, setText] = useState('');
    const [category, setCategory] = useState('general');

    const getAccentColor = (cat) => {
        switch (cat) {
            case 'soma': return '#00d4aa';
            case 'pneuma': return '#8b5cf6';
            case 'techne': return '#f59e0b';
            default: return '#94a3b8';
        }
    };

    const handleAdd = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        
        addDailyLog(todayDateStr, text, category);
        setText('');
        // Category stays the same for fast multiple entries
    };

    const todayLogs = dailyLogs[todayDateStr] || [];

    // Count today's outputs by category for a cool little visual summary
    const summary = todayLogs.reduce((acc, log) => {
        acc[log.category] = (acc[log.category] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="w-full mt-8 mb-20 px-1">
            <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
                    <Zap size={20} className="text-yellow-400 fill-yellow-400" />
                    Log Diario
                </h3>
                
                {todayLogs.length > 0 && (
                    <div className="flex gap-1.5 opacity-80">
                        {Object.keys(summary).map(cat => (
                            <span 
                                key={cat} 
                                className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded"
                                style={{ backgroundColor: `${getAccentColor(cat)}20`, color: getAccentColor(cat) }}
                            >
                                {cat[0]}:{summary[cat]}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleAdd} className="bg-dark-card p-3 rounded-2xl border border-border-subtle shadow-md mb-6 flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
                        <MessageSquare size={16} />
                    </div>
                    <input 
                        type="text" 
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Agregar algo que hice hoy..."
                        className="w-full bg-dark-main text-text-primary rounded-xl pl-9 pr-4 py-2 border border-border-light focus:outline-none focus:border-brand-primary placeholder:text-text-secondary/70 text-sm"
                    />
                </div>
                
                <div className="flex items-center gap-2">
                    <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="bg-dark-main text-text-primary text-xs font-bold uppercase rounded-xl px-3 py-2 border border-border-light focus:outline-none focus:border-brand-primary appearance-none cursor-pointer"
                        style={{ color: getAccentColor(category) }}
                    >
                        <option value="general">GENERAL</option>
                        <option value="soma">SOMA</option>
                        <option value="pneuma">PNEUMA</option>
                        <option value="techne">TECHNE</option>
                    </select>
                    
                    <button 
                        type="submit"
                        disabled={!text.trim()}
                        className="bg-brand-primary text-dark-main p-2 rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus size={20} strokeWidth={3} />
                    </button>
                </div>
            </form>

            {/* Timeline */}
            <div className="flex flex-col gap-3 pl-2">
                {todayLogs.map(log => {
                    const color = getAccentColor(log.category);
                    
                    // Simple logic to format time if timestamp exists
                    let timeStr = '';
                    if (log.timestamp) {
                        const d = new Date(log.timestamp);
                        timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    }

                    return (
                        <div key={log.id} className="flex gap-4 group">
                            {/* Linea vertical y punto */}
                            <div className="flex flex-col items-center">
                                <div 
                                    className="w-3 h-3 rounded-full mt-1.5 shadow-[0_0_8px_rgba(255,255,255,0.1)] relative z-10"
                                    style={{ backgroundColor: color }}
                                ></div>
                                <div className="w-[2px] h-full bg-border-light/50 -mt-1 group-last:hidden"></div>
                            </div>
                            
                            {/* Contenido del log */}
                            <div className="flex-1 bg-dark-card/50 rounded-xl px-4 py-3 border border-border-subtle hover:bg-dark-card transition-colors flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] uppercase font-black" style={{ color }}>{log.category}</span>
                                        {timeStr && <span className="text-[10px] text-text-secondary">{timeStr}</span>}
                                    </div>
                                    <p className="text-sm text-text-primary">{log.text}</p>
                                </div>
                                <button 
                                    onClick={() => removeDailyLog(todayDateStr, log.id)}
                                    className="text-text-secondary hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {todayLogs.length === 0 && (
                    <div className="pl-6 border-l-2 border-border-subtle/30 py-4">
                        <p className="text-sm text-text-secondary italic">Aún no hay registros hoy.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
