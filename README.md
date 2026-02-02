# 🎓 SIJA Learn - Project Documentation

**Project Name**: SIJA Learn  
**Version**: 0.1.0  
**Last Updated**: February 2026

---

## 1. 📖 Project Overview

**SIJA Learn** is a specialized E-Learning platform designed for students majoring in **SIJA (Sistem Informatika, Jaringan, dan Aplikasi)**.

The platform solves the problem of scattered learning materials by providing a centralized digital repository where students can:
*   📚 **Read Articles**: Access technical tutorials and general knowledge.
*   🎓 **Take Courses**: Follow structured learning paths (Chapters & Lessons).
*   🧠 **Take Quizzes**: Test their knowledge with interactive exams.
*   🏆 **Earn XP**: Gamification system (Level up & Badges) to motivate learning.

It acts as both a **Learning Management System (LMS)** and a **Knowledge Base** for the community.

---

## 2. 📂 Complete Folder Structure

This section explains how the project is organized. Use this as a map to find what you need.

| Folder | Description |
| :--- | :--- |
| **`src/app`** | **Frontend Pages & Routing**. Contains all the pages users see in the browser. The folder structure matches the URL (e.g., `app/login` matches `website.com/login`). |
| **`src/app/api`** | **Backend API Endpoints**. The "Engine" of the server. These files handle logic like logging in, saving quiz scores, and fetching data from the database. |
| **`src/components`** | **UI Building Blocks**. Reusable visual elements like Buttons, Cards, Modals, and Navigation Bars. Grouped by feature (e.g., `components/quiz` for quiz-related UI). |
| **`src/lib`** | **Core Logic & Utilities**. The "Brain" of the application. Contains helper functions for Database connection, Auth checks, Email sending, and Gamification math. |
| **`src/models`** | **Database Schemas**. Defines the shape of data. Although we use the Native MongoDB Driver, these files serve as the "Type Definitions" and Data Access Layer (CRUD functions) for concepts like Users, Courses, and Articles. |
| **`src/contexts`** | **Global State**. React Contexts that store data accessible by the entire app, such as the current User's profile or Theme settings. |
| **`src/hooks`** | **Custom Logic Hooks**. Reusable logic bundles for the Frontend, such as "Track view time" or "Calculate XP progress". |
| **`public`** | **Static Assets**. Stores images, fonts, and uploads that are directly accessible via URL. |

> 💡 **Tip**: For detailed explanation of each file, check the localized `README.md` inside each of these folders.

---

## 3. 🛠️ Technology Stack & Versions

We use modern web technologies to ensure performance and scalability.

### Core Framework
*   **Framework**: [Next.js](https://nextjs.org/) `v16.1.6` (App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/) `v5.7.2`
*   **Runtime**: Node.js (Latest LTS)

### Database & Backend
*   **Database**: [MongoDB](https://www.mongodb.com/) `v6.12.0` (Native Driver)
*   **Authentication**: Custom JWT (JSON Web Token) implementation + `bcryptjs` for security.
*   **Email Service**: [Nodemailer](https://nodemailer.com/) `v7.0.12` (SMTP)

### Frontend & Styling
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) `v3.4.17`
*   **Icons**: [Lucide React](https://lucide.dev/) `v0.563.0` & Font Awesome
*   **UI Library**: Custom built components (no heavy external UI framework).

### Key Features
*   **Gamification**: Custom logic for XP and Levels (`src/lib/gamification.ts`).
*   **Security**: Middleware-based Route Protection (`src/middleware.ts`).

---

## 4. 🔗 System Architecture Overview

How do the pieces fit together?

1.  **Client (Browser)**:
    *   The user interacts with **React Components** (`src/components`).
    *   Pages are rendered on the server (Server Components) for speed, but turn interactive (Client Components) for things like Quizzes.

2.  **API Layer (Server)**:
    *   When a user clicks "Submit Quiz", the browser sends a request to `/api/quizzes/[id]/submit`.
    *   **Route Handlers** (`src/app/api`) receive this request.
    *   They check **Auth** (`src/lib/auth.ts`) to ensure the user is logged in.

3.  **Data Layer (Database)**:
    *   The API talks to **MongoDB** using helper functions from `src/lib/mongodb.ts`.
    *   Data is read/written using the structure defined in `src/models`.
    *   **Important**: We do **NOT** use an ORM like Mongoose or Prisma. We write direct MongoDB queries for maximum control and performance.

4.  **Feedback Loop**:
    *   After saving data, the Server calculates new XP (`src/lib/gamification.ts`).
    *   The new Score and XP are sent back to the Client.
    *   **Context** (`GamificationContext`) updates the UI instantly.

---

## 5. 🤖 Notes for Team & AI Usage

**For Team Members:**
*   Use this README to understand the "Big Picture" before diving into code.
*   If you need to change a specific logical flow (e.g., how Login works), look at the **Documentation Hub** table below for the specific documentation file.

**For AI Assistants:**
*   This file is the **Source of Truth** for the project structure and technology.
*   When asked to generate code, strictly follow the **Tech Stack** listed here (e.g., use Tailwind, use Native MongoDB driver).
*   Refer to the detailed sub-documentation files for logic constraints.

### 📚 Documentation Hub

| Documentation | Description | Link |
| :--- | :--- | :--- |
| **System Logic** | Deep dive into Login, Progress Tracking, & Quiz Logic | [📄 System Logic](src/SYSTEM_LOGIC.md) |
| **API Reference** | List of all Backend Endpoints | [🔌 API Docs](src/app/api/README.md) |
| **Middleware** | Security & App Config | [🛡️ Config Docs](src/MIDDLEWARE_AND_CONFIG.md) |
| **Database** | Data Models & Schemas | [🗄️ Models Docs](src/models/README.md) |
| **Components** | UI Component Catalog | [🧩 Component Docs](src/components/README.md) |
| **Library** | Helper Functions | [📚 Lib Docs](src/lib/README.md) |

---
*Maintained by Team 5 - SIJA Learn*