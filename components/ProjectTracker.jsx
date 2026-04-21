import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, PlusCircle, MinusCircle, Target } from 'lucide-react';

export default function ProjectTracker({ 
    projects, addProject, removeProject, updateProjectProgress, toggleProjectCheck 
}) {
    const [isAdding, setIsAdding] = useState(false);
    const [name, setName] = useState('');
    const [category, setCategory] = useState('general');
    const [isNumeric, setIsNumeric] = useState(false);
    const [goalValue, setGoalValue] = useState('');
    const [unit, setUnit] = useState('');

    const getAccentColor = (cat) => {
        switch (cat) {
            case 'soma': return '#00d4aa';
            case 'pneuma': return '#8b5cf6';
            case 'techne': return '#f59e0b';
            default: return '#94a3b8';
        }
    };

    const handleAdd = () => {
        if (!name.trim()) return;
        addProject(name, category, isNumeric, goalValue, unit);
        
        // Reset form
        setName('');
        setCategory('general');
        setIsNumeric(false);
        setGoalValue('');
        setUnit('');
        setIsAdding(false);
    };

    return (
        <div className="w-full mt-8">
            <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
                    <Target size={20} className="text-brand-primary" />
                    Proyectos
                </h3>
                <button onClick={() => setIsAdding(!isAdding)} className="text-xl p-2 text-text-secondary hover:text-brand-primary transition-colors">
                    <Plus size={20} />
                </button>
            </div>

            {isAdding && (
                <div className="bg-dark-card p-5 rounded-2xl border border-border-subtle mb-4 shadow-lg">
                    <input 
                        autoFocus
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nombre del Proyecto (ej. Dominar React)"
                        className="w-full bg-dark-main text-text-primary rounded-xl px-4 py-3 border border-border-light focus:outline-none focus:border-brand-primary font-medium mb-4"
                    />
                    
                    <div className="mb-4">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block pl-1">Categoría</label>
                        <div className="flex flex-wrap gap-2 cursor-pointer">
                            {['general', 'soma', 'pneuma', 'techne'].map(cat => (
                                <div 
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`px-4 py-2 rounded-xl text-xs font-extrabold tracking-wider uppercase transition-colors flex-1 text-center ${category === cat ? 'bg-dark-main border' : 'bg-dark-main/40 text-text-secondary border border-transparent'}`}
                                    style={{ borderColor: category === cat ? getAccentColor(cat) : 'transparent', color: category === cat ? getAccentColor(cat) : undefined }}
                                >
                                    {cat}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-5 bg-dark-main/50 p-4 rounded-xl border border-border-subtle">
                        <label className="flex items-center gap-3 cursor-pointer mb-3">
                            <input 
                                type="checkbox" 
                                checked={isNumeric}
                                onChange={(e) => setIsNumeric(e.target.checked)}
                                className="w-5 h-5 rounded border-border-light text-brand-primary focus:ring-0 bg-dark-card accent-brand-primary"
                            />
                            <span className="text-sm font-semibold text-text-primary">¿Tiene meta numérica?</span>
                        </label>
                        
                        {isNumeric && (
                            <div className="flex gap-3 mt-3 animate-fade-in">
                                <input 
                                    type="number" 
                                    value={goalValue}
                                    onChange={(e) => setGoalValue(e.target.value)}
                                    placeholder="Meta (ej: 100)"
                                    className="w-1/2 bg-dark-card text-text-primary rounded-lg px-4 py-2 border border-border-light focus:outline-none focus:border-brand-primary"
                                />
                                <input 
                                    type="text" 
                                    value={unit}
                                    onChange={(e) => setUnit(e.target.value)}
                                    placeholder="Unidad (ej: kg, páginas)"
                                    className="w-1/2 bg-dark-card text-text-primary rounded-lg px-4 py-2 border border-border-light focus:outline-none focus:border-brand-primary"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3">
                        <button onClick={() => setIsAdding(false)} className="text-text-secondary text-sm font-bold hover:text-white transition-colors">Cancelar</button>
                        <button onClick={handleAdd} className="bg-brand-primary text-dark-main px-6 py-2.5 rounded-xl text-sm font-bold hover:brightness-110 transition-all">Crear Proyecto</button>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-4">
                {projects.map(project => {
                    const accent = getAccentColor(project.category);
                    
                    return (
                        <div key={project.id} className="bg-dark-card rounded-2xl border border-border-subtle p-4 shadow-md overflow-hidden relative">
                            {/* Borde sutil superior de color */}
                            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: accent, opacity: 0.8 }}></div>
                            
                            <div className="flex justify-between items-start mb-2 mt-1">
                                <div className="flex items-center gap-2">
                                    <h4 className={`text-lg font-bold leading-tight ${project.completed ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
                                        {project.name}
                                    </h4>
                                    <span 
                                        className="text-[9px] uppercase font-black px-2 py-0.5 rounded-full"
                                        style={{ backgroundColor: `${accent}20`, color: accent, border: `1px solid ${accent}40` }}
                                    >
                                        {project.category}
                                    </span>
                                </div>
                                <button onClick={() => removeProject(project.id)} className="text-text-secondary hover:text-red-400 opacity-40 hover:opacity-100 transition-opacity p-1">
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            {project.isNumeric ? (
                                <div className="mt-4">
                                    <div className="flex justify-between items-end mb-2">
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => updateProjectProgress(project.id, -1)} 
                                                className="text-text-secondary border border-border-subtle rounded-full p-0.5 hover:bg-dark-main transition-colors"
                                            >
                                                <MinusCircle size={20} />
                                            </button>
                                            <button 
                                                onClick={() => updateProjectProgress(project.id, 1)} 
                                                className="text-text-secondary border border-border-subtle rounded-full p-0.5 hover:bg-dark-main hover:text-white transition-colors"
                                            >
                                                <PlusCircle size={20} />
                                            </button>
                                        </div>
                                        <div className="text-sm font-bold antialiased">
                                            <span style={{ color: accent }}>{project.currentValue}</span>
                                            <span className="text-text-secondary mx-1">/</span>
                                            <span className="text-text-primary">{project.goalValue} {project.unit}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Progress Bar */}
                                    <div className="w-full h-3 bg-dark-main rounded-full overflow-hidden border border-border-subtle/50">
                                        <div 
                                            className="h-full transition-all duration-500 ease-out rounded-full"
                                            style={{ 
                                                width: `${Math.min(100, (project.currentValue / project.goalValue) * 100)}%`,
                                                backgroundColor: accent,
                                                boxShadow: `0 0 10px ${accent}80` 
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-3 flex items-center justify-between bg-dark-main/40 rounded-xl p-3 border border-border-subtle/50">
                                    <span className="text-sm font-medium text-text-secondary italic">
                                        {project.completed ? '¡Proyecto finalizado!' : 'Marca cuando lo termines'}
                                    </span>
                                    <button 
                                        onClick={() => toggleProjectCheck(project.id)}
                                        className="transition-transform hover:scale-110 active:scale-95"
                                    >
                                        {project.completed ? (
                                            <CheckCircle2 size={28} style={{ color: accent }} className="drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
                                        ) : (
                                            <Circle size={28} className="text-text-secondary hover:text-white transition-colors" />
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}

                {projects.length === 0 && !isAdding && (
                    <div className="text-center py-8 text-text-secondary bg-dark-card rounded-2xl border border-border-subtle border-dashed">
                        <p className="font-medium text-sm">No tienes proyectos a largo plazo.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
