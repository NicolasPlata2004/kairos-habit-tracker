/**
 * ARCHIVO: components/WeeklyReview.jsx
 * PAPEL: Sesión de Calibración Semanal (High-Friction Check-in).
 * DESCRIPCIÓN: Un modal intenso diseñado para ejecutarse una vez a la semana. 
 * Permite actualizar las métricas corporales exactas (SOMA) e inyectarlas
 * directamente en el visualizador 3D para retroalimentación en tiempo real.
 */

import React, { useState, useEffect } from 'react';
import { X, Save, Ruler } from 'lucide-react';
import SomaVisualizer from './SomaVisualizer';
import { calculateBodyFat } from '../utils/bioMetrics';

const WeeklyReview = ({ isOpen, onClose, initialMeasurements, onSave }) => {
    // Estado local para los inputs del formulario
    const [measurements, setMeasurements] = useState({
        gender: 'male',
        height: 175,
        neck: 38,
        waist: 85,
        hip: 95, // Solo usado en female
        bodyFat: 15
    });

    // Cargar métricas guardadas si existen
    useEffect(() => {
        if (initialMeasurements) {
            setMeasurements(prev => ({ ...prev, ...initialMeasurements }));
        }
    }, [initialMeasurements, isOpen]);

    // Calcular la grasa automáticamente cada que cambian los inputs físicos
    useEffect(() => {
        const fat = calculateBodyFat(
            measurements.waist, 
            measurements.neck, 
            measurements.height, 
            measurements.gender, 
            measurements.hip
        );
        // Si hay un resultado matemático válido, sobreescribir bodyFat
        if (fat > 0) {
            setMeasurements(prev => ({ ...prev, bodyFat: fat }));
        }
    }, [measurements.waist, measurements.neck, measurements.height, measurements.gender, measurements.hip]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setMeasurements(prev => ({ 
            ...prev, 
            [name]: name === 'gender' ? value : Number(value) 
        }));
    };

    const handleSave = () => {
        if (onSave) onSave(measurements);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm">
            <div className="bg-dark-card rounded-3xl shadow-2xl w-full max-w-5xl h-[90vh] md:h-[80vh] flex flex-col md:flex-row overflow-hidden border border-border-subtle animate-in zoom-in-95 duration-200">
                
                {/* LADO IZQUIERDO: Formulario de Calibración */}
                <div className="w-full md:w-1/3 p-6 md:p-8 bg-dark-main flex flex-col overflow-y-auto border-r border-border-subtle">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-black text-text-primary flex items-center gap-2">
                                <Ruler size={24} className="text-blue-500" /> Calibración SOMA
                            </h2>
                            <p className="text-xs text-text-secondary font-mono mt-1">REVISIÓN SEMANAL PROFUNDA</p>
                        </div>
                        <button onClick={onClose} className="p-2 bg-dark-main border border-border-subtle hover:bg-red-100 hover:text-red-500 rounded-full transition-colors md:hidden">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-4 flex-1">
                        <div>
                            <label className="block text-xs font-bold text-text-primary uppercase mb-1">Género de Ingeniería</label>
                            <select 
                                name="gender" 
                                value={measurements.gender} 
                                onChange={handleChange}
                                className="w-full p-2.5 bg-dark-card border border-border-subtle rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm"
                            >
                                <option value="male">Masculino</option>
                                <option value="female">Femenino</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-text-primary uppercase mb-1">Altura (cm)</label>
                                <input type="number" name="height" value={measurements.height} onChange={handleChange} className="w-full p-2.5 bg-dark-card border border-border-subtle rounded-2xl text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-primary uppercase mb-1">Cuello (cm)</label>
                                <input type="number" name="neck" value={measurements.neck} onChange={handleChange} className="w-full p-2.5 bg-dark-card border border-border-subtle rounded-2xl text-sm" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-text-primary uppercase mb-1">Cintura (cm)</label>
                                <input type="number" name="waist" value={measurements.waist} onChange={handleChange} className="w-full p-2.5 bg-dark-card border border-border-subtle rounded-2xl text-sm" />
                            </div>
                            {measurements.gender === 'female' && (
                                <div>
                                    <label className="block text-xs font-bold text-text-primary uppercase mb-1">Cadera (cm)</label>
                                    <input type="number" name="hip" value={measurements.hip} onChange={handleChange} className="w-full p-2.5 bg-dark-card border border-border-subtle rounded-2xl text-sm" />
                                </div>
                            )}
                        </div>

                        {/* Mostrar Grasa Calculada Visualmente */}
                        <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-center">
                            <p className="text-xs font-bold text-blue-400 tracking-wider">ESTIMACIÓN US NAVY</p>
                            <p className="text-4xl font-black text-blue-600 mt-1">{measurements.bodyFat}% <span className="text-base text-blue-400">FAT</span></p>
                        </div>
                    </div>

                    <button 
                        onClick={handleSave}
                        className="mt-6 w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white p-4 rounded-2xl font-bold transition-transform active:scale-95 shadow-lg"
                    >
                        <Save size={18} /> INYECTAR DATOS
                    </button>
                </div>

                {/* LADO DERECHO: Gemelo Digital SOMA 3D */}
                <div className="w-full md:w-2/3 h-64 md:h-full relative bg-gray-900">
                    <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-red-500 text-white rounded-full transition-colors hidden md:block">
                        <X size={20} />
                    </button>
                    {/* Renderizamos el visualizador en tiempo real pasándole las métricas que estamos arrastrando */}
                    <div className="w-full h-full">
                        <SomaVisualizer measurements={measurements} />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default WeeklyReview;
