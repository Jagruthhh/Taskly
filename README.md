# Taskly — Pure Serverless Firebase Task Manager

Taskly is a visually stunning, responsive, and 100% serverless task management web application built with **React 18 (Vite)**, **Firebase Authentication**, **Firebase Firestore**, and **Tailwind CSS v3**.

---

## 🎨 Key Features & Premium Aesthetics

- **100% Serverless Architecture**: Eliminates local Express servers, PostgreSQL database containers, SQLite database dependencies, and Prisma schema migrations. It runs entirely on the client, speaking directly and securely to Firebase Services.
- **Real-Time Cross-Device Sync**: Powered by Firestore, tasks synchronize reactively in **real-time** across multiple open browser tabs, computers, or devices.
- **Atomic Drag-and-Drop Batching**: Powered by `@dnd-kit/core` and `@dnd-kit/sortable`, task reordering is written to Firestore atomically inside a single **Firestore Write Batch (`writeBatch`)**.
- **Dark Mode Default & Mesh Glows**: Sleek navy theme (`#0B0F19`) accented by glowing electric indigo (`#6366F1`) gradients and custom CSS float animations.
- **Glassmorphic Cards**: Translucent dashboards (`backdrop-filter`) with subtle glowing borders.
- **Dynamic Completion Stats**: Custom circular SVG progress rings rendering daily completion stats reactively inside the header.
- **Google Sign-In & Email/Password Auth**: Handled entirely by Firebase Authentication.
- **Offline Mock Fallback**: Zero-config offline simulation! If Firebase credentials are not configured, Taskly automatically boots in a beautiful mock developer sandbox, persisting tasks inside `localStorage` so you can play with the entire drag-and-drop dashboard immediately.

---

## 📂 Consolidate Directory Layout

```
/todolist
  ├── README.md                → Full environment and startup instructions
  │
  └── /client                  → React 18 + Vite frontend (Pure Serverless)
        ├── tailwind.config.js → Custom color palettes and font styling mappings
        ├── index.html         → Heading (Syne) & Body (DM Sans) Google Fonts
        ├── src/
        │     ├── components/  → Collapsible Sidebar, circular ProgressRing, and Sortable lists
        │     ├── pages/       → Mesh Landing page, Zod Auth forms, main Dashboard, Profile Settings
        │     ├── store/       → useAuthStore.js (Zustand + Firestore database queries)
        │     ├── utils/       → firebase.config.js (Auth + Firestore SDK bootstrap)
        │     ├── App.jsx      → Router page mappings and premium custom Error Boundary
        │     ├── main.jsx
        │     └── index.css    → Translucent card layout templates
        └── package.json
```

---

## ⚙️ Quick Start Setup

### Step 1: Open Workspace
Make sure you are positioned inside the client directory:
```bash
cd e:\todolist\client
```

### Step 2: Install Dependencies
Run the package installation:
```bash
npm install
```

---

### Step 3: Run Taskly (Choose Option A or B)

#### Option A: Zero-Config Offline Dev Sandbox (Default)
If you do not have Firebase credentials ready yet, Taskly boots **immediately** in offline developer mode!
1. Start the Vite development server:
   ```bash
   npm run dev
   ```
2. Open your browser and navigate to **`http://localhost:5173`**.
3. Go to Login or Sign Up, click **"Continue with Google"** (or enter dummy credentials), and you will instantly be logged in as a **Local Developer**! All tasks and reorder states will persist inside your browser cache.

---

#### Option B: Hooking Up Real Firebase Services
When you are ready to connect to real Google accounts and cloud persistence:
1. Create a Firebase Project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** (turn on Email/Password and Google Sign-In providers).
3. Create a **Cloud Firestore Database** (start in test mode or define simple read/write rules).
4. Create a Web App inside your Firebase Project to get your configuration credentials.
5. Create a `.env` file inside the `client` directory (matching `client/.env.example`):
   ```env
   VITE_FIREBASE_API_KEY="AIzaSy..."
   VITE_FIREBASE_AUTH_DOMAIN="taskly.firebaseapp.com"
   VITE_FIREBASE_PROJECT_ID="taskly"
   VITE_FIREBASE_STORAGE_BUCKET="taskly.appspot.com"
   VITE_FIREBASE_MESSAGING_SENDER_ID="123456"
   VITE_FIREBASE_APP_ID="1:12345:web:abcd"
   ```
6. Start the dev server:
   ```bash
   npm run dev
   ```
Now, all logins, registrations, tasks, and drag-and-drop actions are fully authenticated by Firebase and written directly to your Firebase Firestore cloud database!
