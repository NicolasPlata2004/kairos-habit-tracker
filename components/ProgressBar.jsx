/**
 * ARCHIVO: components/ProgressBar.jsx
 * PAPEL: Componente visual de barra de carga horizontal.
 * DESCRIPCIÓN: Dibuja una línea de porcentaje clásica que de fondo es gris y 
 * se rellena de un color dinámico según el porcentaje de meta alcanzada.
 * Es usado por el panel superior de resumen (Resumen Diario/Mensual).
 */

// Importamos el React absoluto desde los adentros del sistema de node modules universales del core de nuestra APP!
import React from 'react';

// Declaramos al mundo nuestro modesto o diminuto componente visual: "ProgressBar" visual. 
// Tiene un grandioso pero minúsculo trabajo súper simple: Dibujar un barra y recibir de exterior un "percentage" el tamaño exacto del CSS y de pasadita reciclarla pero para eso pidiendo prestado el color a usar (O lo usa verde lima brillante general si nadie le indica la orden "colorClass" de afuera por parámetros defectillos variables predeterminadas default destructuradas) 
const ProgressBar = ({ percentage, colorClass = "bg-green-400" }) => {
    return (
        // Nuestra maravillosa caja HTML principal (Div) a la que dotaremos el máximo súper ancho "w-full", la engordaremos un poquito a unos hermosos píxeles y le aplicaremos curvitación final a los extremis y fondo gris palidecente universal 
        <div className="w-full bg-dark-main h-1.5 rounded-full overflow-hidden">

            {/* Adentro en las asombrosa cajilla le empotramos u embutimos esta súper gráfica "barra" HTML simple (Div) a quien daremos el mandato forzado explícito sobrepasando css puro style. Lo forzare directos desde React enviando la formula final cruda variable percentage interpolar del string de CSS duro ancho width % y pasamos grandiosamente la pintura externa o su colorClass dinámico a className. ¡El HTML más pulcrísimo e idealizado de lo simpleza sin repetirse cien veces en las apps! */}
            <div
                className={`${colorClass} h-1.5 rounded-full transition-all`}
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    );
};

// Se habilita globalmente su grandioso uso externo si algún componente divino de afuera lo ansía y clama importarlo a sí mismo 
export default ProgressBar;
