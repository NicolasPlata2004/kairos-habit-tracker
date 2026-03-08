/**
 * ARCHIVO: main.jsx
 * PAPEL: Punto de entrada principal (Entry Point) de la aplicación web React.
 * DESCRIPCIÓN: Este archivo es lo primero que ejecuta el navegador al cargar la página.
 * Su único trabajo es "despertar" a React, importar los estilos globales, tomar el 
 * componente maestro de tu aplicación (<App />) e inyectarlo en el archivo index.html.
 */

// Importamos la librería principal de React necesaria para crear interfaces de usuario
import React from 'react'
// Importamos la herramienta ReactDOM que conecta React con el modelo del navegador (DOM)
import ReactDOM from 'react-dom/client'
// Importamos nuestro componente principal que contiene toda la lógica y vista de Kairos
import App from './App.jsx'
// Importamos el archivo de estilos universales e iniciales de Tailwind CSS
import './index.css'

// 1. Buscamos la etiqueta <div id="root"> dentro de nuestro index.html
// 2. Le indicamos a ReactDOM que ese será el "creador de raíces" de nuestra app
// 3. Renderizamos (dibujamos) nuestro componente <App /> dentro de él
ReactDOM.createRoot(document.getElementById('root')).render(
    // React.StrictMode es una herramienta de desarrollo que renderiza los componentes 
    // dos veces (solo en modo local) para ayudar a detectar errores o posibles bugs ocultos.
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
