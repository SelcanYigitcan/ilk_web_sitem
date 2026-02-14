# Selcan's Digital Headquarters 🚀

> A professional, multi-page personal portfolio and digital workspace built with modern web technologies.

## Overview
This project serves as a central hub for my digital identity, showcasing my projects, technical skills, and providing a suite of personal productivity tools. It transitions from a simple single-page application to a robust **Multi-Page Architecture (MPA)** with a focus on maintainability (DRY principle), aesthetics (Light Mode Glassmorphism), and interactivity.

## Key Features

### 🎨 Design & Interactivity
*   **Light Mode Glassmorphism:** A clean, professional aesthetic using `backdrop-filter`, subtle gradients, and modern typography (Outfit & Inter).
*   **Interactive Hero Canvas:** A custom HTML5 Canvas animation ("Constellation Network") where particles react to mouse movement, implemented with high-performance Vanilla JS.
*   **Responsive Layout:** Fully adaptive designs for Mobile, Tablet, and Desktop.

### 🛠 Global Utilities (The "Digital HQ" Aspect)
Accessible from the Global Navbar on *every* page:
*   **📅 Calendar Widget:** A custom-built, interactive drop-down calendar.
*   **✅ Daily Tasks:** A persistent task manager (uses `localStorage`) to track daily goals.
*   **📚 Learning Log:** An auto-saving notepad for quick technical notes.
*   **🔒 Secure Vault:** A password-protected area (Pass: `1234`) revealing confidential project details.

### 🏗 Architecture
*   **Tech Stack:** Vanilla JavaScript (ES6+), HTML5, CSS3. No heavy frameworks.
*   **Component Injection:** To adhere to the **DRY (Don't Repeat Yourself)** principle, the Global Navbar and all Utility Tools are injected dynamically into every page via `app.js`. This centralizes logic and makes maintenance effortless.
*   **Persistence:** All user data (Tasks, Notes) is stored locally in the browser's `localStorage`.

## Project Structure
```
/
├── index.html       # Home (Hero Section)
├── about.html       # Bio & Tech Stack
├── projects.html    # Filterable Project Grid
├── contact.html     # Contact Form
├── style.css        # Global Styles, Variables & Animations
├── app.js           # Core Logic (Navbar Injection, Tools, Canvas)
└── README.md        # Documentation
```

## Deployment
Ready for static hosting on **Render** or **Vercel**.
*   **Domain:** `selcan.store` (Managed via Spaceship DNS).
*   **Build Command:** None (Static Site).
*   **Publish Directory:** `./` (Root).

---
*Architected by Selcan Yigitcan & AntiGravity AI.*
