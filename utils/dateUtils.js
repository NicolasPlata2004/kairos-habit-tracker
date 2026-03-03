// Función para obtener la cantidad de días que tiene un mes en un año específico
// Usa el truco de pedir el día 0 del mes siguiente, que JavaScript interpreta como el último día del mes actual
export const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

// Función para transformar un objeto Date (fecha) en un texto estandarizado "Año-Mes-Día"
// Esto es súper importante porque las llaves de nuestro localStorage necesitan ser textos idénticos y predecibles
export const formatDate = (date) => {
    // Convertimos el valor recibido a un objeto de fecha (por si nos pasan otra cosa)
    const d = new Date(date);

    // Obtenemos el mes. Sumamos 1 porque en JavaScript los meses van del 0 al 11
    const month = '' + (d.getMonth() + 1);

    // Obtenemos el día exacto del mes
    const day = '' + d.getDate();

    // Obtenemos el año completo
    const year = d.getFullYear();

    // Unimos todo asegurando que los meses y días tengan 2 dígitos (ejemplo: '05' en vez de '5')
    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
};
