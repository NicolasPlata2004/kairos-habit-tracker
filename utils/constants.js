/**
 * ARCHIVO: utils/constants.js
 * PAPEL: Diccionario central de valores estáticos inmutables.
 * DESCRIPCIÓN: Documento dedicado a guardar datos que no van a cambiar nunca a lo 
 * largo de la ejecución de la app (como las listas de meses o días de la semana).
 * Consolidar esto aquí ayuda a evitar errores tipográficos en el código fuente.
 */

// Exportamos un arreglo constante con los nombres de los meses del año para usarlos en la interfaz gráfica
// Esto centraliza los textos fijos en un solo lugar estratégico
export const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

// Exportamos un arreglo constante con las iniciales de los días de la semana (D=Domingo, L=Lunes, etc.)
// Muy util y liviano para dibujar la cabecera geométrica de nuestra tabla (visibleDays.map)
export const DIAS_SEMANA = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
