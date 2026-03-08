/**
 * ARCHIVO: utils/dateUtils.js
 * PAPEL: Colección de funciones puras, matemáticas y formadores de fechas.
 * DESCRIPCIÓN: Provee herramientas reutilizables a lo largo del proyecto para tareas 
 * repetitivas con fechas, como saber los límites geográficos de un mes, o transformar
 * objetos complejos de Date a un Simple String compatible con nuestra base de datos.
 */

// Función para obtener la cantidad exacta de días que tiene un mes en un año específico
// (Detecta inteligentemente si es año bisiesto)
// TRUCO EXPLICADO: En JavaScript, pedir el día "0" del mes siguiente nos devuelve automáticamente el último día del mes actual
export const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

// Función convertidora para transformar un objeto Date en un texto estandarizado y ordenable: "AAAA-MM-DD"
// EJEMPLO VITAL: '2026-03-05'
// ¿Por qué es importante?: Nuestras llaves (keys) en Firebase y localStorage usan este texto como su ID único.
export const formatDate = (date) => {
    // 1. Convertimos el valor recibido a un objeto oficial de fecha de JavaScript
    const d = new Date(date);

    // 2. Extraemos el mes numérico. OJO: Los meses en JS empiezan en 0 (Enero=0, Diciembre=11), así que sumamos 1.
    const month = '' + (d.getMonth() + 1);

    // 3. Extraemos el día exacto de la semana
    const day = '' + d.getDate();

    // 4. Extraemos el año con 4 dígitos
    const year = d.getFullYear();

    // 5. Encadenamos todo asegurando que los meses y días pequeños tengan un cero por delante
    // Ejemplo: padStart(2, '0') transforma el mes '3' en '03'.
    // join('-') ensambla el arreglo a: 2026-03-05
    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
};
