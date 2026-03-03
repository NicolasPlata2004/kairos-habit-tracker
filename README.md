# Kairos - Habit Tracker 🌿

Kairos es una aplicación web progresiva (PWA) diseñada para el seguimiento de hábitos diarios y semanales. Construida con React y Firebase, permite a los usuarios registrar su progreso de forma visual, mantener notas personales, y sincronizar sus datos en la nube en tiempo real a través de múltiples dispositivos.

## 🚀 Características Principales

- **Dashboard Visual**: Gráfica de progreso generada dinámicamente con SVG que muestra la tendencia de cumplimiento de hábitos a lo largo del mes.
- **Seguimiento Diario y Semanal**: Registra hábitos que realizas todos los días, así como tareas y notas generales para la semana.
- **Sincronización en la Nube (Firebase)**: Autenticación segura con Google y guardado de datos en tiempo real usando Firestore.
- **Modo Offline/Local**: Si no deseas iniciar sesión, la aplicación puede funcionar de manera local guardando tus hábitos directamente en el almacenamiento de tu navegador (`localStorage`).
- **Instalable (PWA)**: Diseño "Mobile-First" que permite instalar la aplicación directamente en tu teléfono móvil o computadora (sin pasar por tiendas de aplicaciones).
- **Diseño Moderno y Responsivo**: Construido con Tailwind CSS para garantizar una experiencia fluida tanto en pantallas pequeñas como grandes, utilizando componentes interactivos y animaciones sutiles.

## 🛠️ Tecnologías Empleadas

- **Frontend**: React (Vite)
- **Estilos**: Tailwind CSS
- **Backend as a Service (BaaS)**: Firebase (Authentication, Firestore, Hosting)
- **PWA**: `vite-plugin-pwa` para service workers y manifest.
- **Iconos**: Lucide React
- **Gráficos**: SVG nativo y dinámico (sin librerías pesadas)

## ⚙️ Instalación y Desarrollo Local

Para ejecutar este proyecto en tu propia máquina, sigue estos pasos:

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/TU_USUARIO/kairos-habit-tracker.git
   cd kairos-habit-tracker
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno (Firebase):**
   - El proyecto requiere credenciales de Firebase para la sincronización en la nube.
   - Crea un archivo llamado `.env` en la raíz del proyecto basándote en el archivo de ejemplo:
     ```bash
     cp .env.example .env
     ```
   - Abre el archivo `.env` y reemplaza los valores con las credenciales de tu propio proyecto de Firebase.

4. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:5173`.

## 🔒 Privacidad y Seguridad

Por motivos de seguridad, las credenciales del proyecto original de Firebase han sido extraídas a variables de entorno que no se suben al repositorio (ver `.gitignore`). Cualquiera que desee probar la funcionalidad en la nube deberá proporcionar su propia configuración de Firebase en el archivo `.env`.

---
*Proyecto desarrollado con una metodología de aprendizaje basado en proyectos (PBL), cubriendo el ciclo completo desde el diseño del frontend hasta el despliegue en producción.*
