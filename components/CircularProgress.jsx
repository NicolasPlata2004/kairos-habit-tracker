// Importamos a nuestra biblioteca líder de crear interfaces "React", que nos dejará construir esto
import React from 'react';

// Fabricamos nuestro módulo Círculo Mágico Visual (De progreso): Se le pasan valores "value" completado y el general "max" tope de la cuenta  
const CircularProgress = ({ value, max }) => {
    // Configuro variable "radius" siendo un radio duro de matemáticas estándar en píxeles predeterminado de 36
    const radius = 36;

    // Utilizo Pi en Matemáticas Reales del CPU para descifrar exactamente el tamaño de largo circular general del propio aro "circumference"
    const circumference = 2 * Math.PI * radius;

    // Configuro un súper candado total a la variable max, a fin de impedir a toda costa una división de Cero absoluta sobre la faz de la pantalla o dará problemas fatales  
    const safeMax = max || 1;

    // Obtengo un vulgar múltiplo o un número super pequeño decimal ("percentage") que indicará la relación exacta porcentaje logro matemáticamente  
    const percentage = value / safeMax;

    // Adivino o Calculo que porción o sombra no debo ver (El total vacio real opaco sin progreso que falta de llegar al final del radio circunferencia maximo) 
    const offset = circumference - percentage * circumference;

    // Entregamos código mágico de JSX, el motor o renderizador en pantalla de nuestra web final
    return (
        // Es un contenedor padre general (Un div con relativo posicionamiento web css). "flex" lo centra en su super caja  divina al ser items-center  y justity-center   
        <div className="relative flex flex-col items-center justify-center p-2">

            {/* Esto se llama Elemento Gráfico Vectorizado (o Etiqueta SVG), que el mundo usa desde milenios para dibujar en código y no ser fotos feas con pixeles. Se le aplica la rotación inversa para que empiece arriba en las 12 horas del reloj del frente  */}
            <svg viewBox="0 0 100 100" className="w-28 h-28 transform -rotate-90">

                {/* Este simple y súper "circle" es el fondo opaquizado "El grisáceo track o caminito llano sin recorrer" de nuestra circunferencia. Omitirá colorear lo puro suyo "fill=none" y trazará lo externo de radio y golpe gordo de 12 puntos de grosor a color clarillo  */}
                <circle cx="50" cy="50" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="12" />

                {/* Éste es nuestro verdaderamente valioso "circle": Es animado o pintado con color oscuro poderoso "stroke=#4b5563" representivo del éxito conseguido, al cual aplicamos variables intermitentemente rotas "Stroke Dash" que cortan lo coloreble por fórmulas que le mandamos exactitas ocultadas en la variable Offset  */}
                <circle cx="50" cy="50" r={radius} fill="none" stroke="#4b5563" strokeWidth="12"
                    strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
            </svg>

            {/* Ésta miniatura y muy centrada y absoluta capa literal pone flotante los números encima total del SVG a las vistas centrales del centro geométrico en números del total y progreso (Ejemplo 50 / 80) a la simple y bruta pero eficientísima visión humana clara! */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-gray-800">{value} / {max}</span>
            </div>
        </div>
    );
};

// Como lo estandarizan los dioses, lo exportamos al viento como nuestra pieza por defecto (default) 
export default CircularProgress;
