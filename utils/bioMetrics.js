/**
 * ARCHIVO: utils/bioMetrics.js
 * PAPEL: Utilidades matemáticas para cálculos corporales y de bio-feedback.
 * DESCRIPCIÓN: Contiene fórmulas estándar de ingeniería y medicina para 
 * calcular el % de grasa corporal y otras métricas del Gemelo Digital SOMA.
 */

/**
 * Fórmula de la US Navy para estimar % Grasa Corporal
 * Utiliza medidas en centímetros.
 * 
 * Hombres: 495 / (1.0324 - 0.19077 * log10(cintura - cuello) + 0.15456 * log10(altura)) - 450
 * Mujeres: 495 / (1.29579 - 0.35004 * log10(cintura + cadera - cuello) + 0.22100 * log10(altura)) - 450
 * 
 * @param {number} waist - Cintura en cm
 * @param {number} neck - Cuello en cm
 * @param {number} height - Altura en cm
 * @param {string} gender - 'male' | 'female'
 * @param {number} hip - (Solo mujeres) Cadera en cm
 * @returns {number} Porcentaje de grasa corporal estimado
 */
export const calculateBodyFat = (waist, neck, height, gender = 'male', hip = 0) => {
    // Validaciones para evitar logaritmos inválidos (valores nulos o inconsistentes)
    if (!waist || !neck || !height) return 0;
    if (gender === 'male' && waist <= neck) return 0;
    if (gender === 'female' && (waist + hip) <= neck) return 0;

    let bodyFat = 0;

    if (gender === 'male') {
        const d = 1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height);
        bodyFat = (495 / d) - 450;
    } else {
        const d = 1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height);
        bodyFat = (495 / d) - 450;
    }

    // Retorna el porcentaje con 1 decimal máximo
    return Math.max(0, parseFloat(bodyFat.toFixed(1)));
};
