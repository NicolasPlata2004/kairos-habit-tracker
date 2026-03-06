# Kairos - Habit Tracker 🌿

Kairos is a Progressive Web Application (PWA) designed for tracking daily and weekly habits. Built with React and Firebase, it allows users to visually monitor their progress, keep personal notes, and synchronize their data in real time across multiple devices through cloud storage.

## 🚀 Main Features

- **Visual Dashboard**: A dynamically generated progress chart built with SVG that shows the trend of habit completion throughout the month.
- **Daily and Weekly Tracking**: Track habits performed every day, as well as general weekly tasks and notes.
- **Cloud Synchronization (Firebase)**: Secure Google authentication and real-time data storage using Firestore.
- **Offline / Local Mode**: If users prefer not to sign in, the application can run locally by storing habits directly in the browser’s storage (`localStorage`).
- **Installable (PWA)**: A mobile-first design that allows the application to be installed directly on a phone or computer without going through app stores.
- **Modern and Responsive Design**: Built with Tailwind CSS to ensure a smooth experience on both small and large screens, using interactive components and subtle animations.

## 🛠️ Technologies Used

- **Frontend**: React (Vite)
- **Styling**: Tailwind CSS
- **Backend as a Service (BaaS)**: Firebase (Authentication, Firestore, Hosting)
- **PWA**: `vite-plugin-pwa` for service workers and manifest configuration.
- **Icons**: Lucide React
- **Charts**: Native dynamic SVG (no heavy chart libraries)

## ⚙️ Installation and Local Development

To run this project on your own machine, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/kairos-habit-tracker.git
   cd kairos-habit-tracker
   ```

2. **Install the dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables (Firebase):**
   - The project requires Firebase credentials for cloud synchronization.
   - Create a file called `.env` in the root of the project based on the example file:
     ```bash
     cp .env.example .env
     ```
   - Open the `.env` file and replace the values with the credentials from your own Firebase project.

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## 🔒 Privacy and Security

For security reasons, the original Firebase project credentials have been moved to environment variables that are not uploaded to the repository (see `.gitignore`). Anyone who wants to test the cloud functionality must provide their own Firebase configuration in the `.env` file.

---
*Project developed using a Project-Based Learning (PBL) methodology, covering the full cycle from frontend design to production deployment.*
