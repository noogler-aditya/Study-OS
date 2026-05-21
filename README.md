# 🎓 Study OS
### **Enterprise-grade, Offline-first macOS Study Command Center for GATE CS Preparation**

Built as a sleek, highly focused native macOS workstation, **Study OS** is engineered for deep concentration during long-form study blocks. Storing all metrics locally on disk, the system operates with zero cloud latency, zero accounts, and zero distractions.

---

## 🌟 Key Pillars & Features

### 📅 The 2-Month GATE Intensive Dashboard
Optimized for the high-intensity preparation window starting from **May 18 to July 18**, this mission-control workspace keeps you accountable, focused, and consistent.

*   **Today's Learning Schedule Checklist**: Statically targets 6 critical daily study targets:
    *   *Discrete Mathematics* (2.5 hrs)
    *   *Programming + Data Structure* (1.5 hrs)
    *   *Digital Logic* (2.0 hrs)
    *   *Operating System (OS)* (45 min)
    *   *DBMS* (45 min)
    *   *General Aptitude* (1.5 hrs / 12 questions)
*   **Active Session Lock Banner**: Operates within a designated **10:00 AM – 06:00 PM** time box. Completing all 6 checklist items transforms the warning banner into an active pulsing emerald trophy lock-in indicator.
*   **Integrated Month-Navigation Calendar**: Overhauls standard monthly view bounds:
    *   *Month & Year Nav*: Browse backwards or forwards through May, June, July, and beyond using sleek chevron button triggers.
    *   *Duolingo-Style Streak Pill*: Merged directly into the calendar card header with a bounce-animated flame icon (`🔥`).
    *   *Rounded Square Cells*: Ditch stretched columns for professional, flat `28px` rounded-square grids (`border-radius: 6px`).
    *   *Timezone-Safe Synchronization*: Uses local ISO date bounds, immediately lighting up the active cell in solid green upon task lock-in.

---

### 🔄 Spaced-Repetition Revision Center
Powered by a deterministic recall engine, topics are scheduled automatically to prevent conceptual decay.

```
Interval = BaseConfidenceDays × (RevisionCount + 1)
```

| Confidence | Base Interval | 0 Revs | 2 Revs | 4 Revs | Status Transition |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Low** | 1 Day | 1d | 3d | 5d | Demotes to `weak` |
| **Medium** | 3 Days | 3d | 9d | 15d | Promotes status to `revising` |
| **High** | 7 Days | 7d | 21d | 35d | Mastered after 3+ high reviews |

*   **One-Click Completion**: Toggling revisions executes instantly based on current confidence records, eliminating double-click layout clutter.
*   **Clean Untracking via Trashcan Icon (`🗑️`)**: Under the *Revision Schedule*, click the dustbin to remove a topic from active rotation.
*   **Custom Glassmorphic Alert Modal**: Triggering untracks opens a high-fidelity modal overlay with a `backdrop-filter: blur(8px)` glassmorphism effect, smooth scale transitions, and clear action styling.

---

### 📊 Comprehensive Mock & Knowledge Logs
*   **Mock Test Gaps**: Record test results with precise categorization of conceptual failures, silly mistakes, and time-management issues, reporting overall mock accuracy trends.
*   **The Knowledge Vault**: Catalog high-priority formulas, mistakes, and revision notes searchable by subject and topic.

---

## 🛠️ Technology Stack

| Layer | Component | Description |
| :--- | :--- | :--- |
| **Frontend Core** | **React 19 + TypeScript** | Type-safe declarative UI layer |
| **Styling Engine** | **Tailwind CSS + Custom System**| Clean, curated HSL color palette and custom components |
| **State Store** | **Zustand** | Central reactive state hub with decoupled persistent writes |
| **Desktop Shell**| **Electron Shell** | Runs native Chromium container with Mac-specific category flags |
| **Storage layer** | **Atomic local JSON write** | Temp file serialization and immediate local backups |
| **Test Suite** | **Vitest** | Blazing-fast reactive unit testing |

---

## 📁 System Architecture & Directory Layout

```
gate-center/
├── electron/               # Native main process & security bridges
│   ├── main.cjs            # Handles window parameters, atomic disk writes & IPC APIs
│   └── preload.cjs         # contextBridge isolation layer
├── src/
│   ├── components/         # High-fidelity React components
│   │   ├── AppShell.tsx    # Sidebar menu, route control & real-time Save Indicator
│   │   ├── Dashboard.tsx   # Dashboard featuring checklist, progress gauge & calendar nav
│   │   ├── Syllabus.tsx    # Deep nested cluster list for subjects & chapters
│   │   ├── Revision.tsx    # Spaced repetition scheduler, queues & confirmation modal
│   │   ├── Mocks.tsx       # Mock test metric logger and trend reporter
│   │   ├── Vault.tsx       # Searchable note card lists
│   │   └── Settings.tsx    # System stats overview & hard factory resets
│   ├── stores/
│   │   └── studyStore.ts   # Zustand main store orchestrator
│   ├── lib/
│   │   ├── storage.ts      # Storage layer choosing IPC API or web fallback
│   │   ├── revision.ts     # Spaced repetition scheduling formulas
│   │   ├── analytics.ts    # Syllabus calculation, health score & mock trends
│   │   └── date.ts         # Timezone-safe local ISO string formatting
│   ├── data/
│   │   └── seed.ts         # Seeding for all GATE CS clusters (9 subjects, 50+ topics)
│   ├── types.ts            # Core domain models
│   ├── App.tsx             # Page layout dispatcher
│   ├── main.tsx            # App mounting node
│   └── styles.css          # Curated layout tokens and animations
├── tests/
│   └── revision.test.ts    # Revision scheduling & progress unit tests
└── package.json
```

---

## 💾 Local Data Integrity & Atomic Writing

Study OS stores all workspace states directly under your macOS local user directory:
```
~/Library/Application Support/Study OS/
├── study-os-data.json          # Main workspace database file
├── study-os-data.backup.json   # Auto-created backup of previous successful write
└── study-os-data.tmp.json      # Temporary swap file (removed immediately on save success)
```

To eliminate data corruption during hardware crashes or process interrupts, the storage system utilizes **atomic file renames**:
1. Zustand state is written asynchronously to a temporary swap file (`.tmp.json`).
2. The current healthy `data.json` is safely renamed to `data.backup.json`.
3. The temporary file is atomatically renamed to `data.json` by the operating system kernel.
4. The sidebar saves indicator displays a visual validation tag (`✓ Saved`).

---

## 🚀 Getting Started

### Prerequisites
*   **Node.js**: `v18.0.0` or higher
*   **npm**: `v9.0.0` or higher
*   **Operating System**: macOS recommended for native Electron features

### Installation
1. Clone the repository and navigate to the directory:
   ```bash
   git clone https://github.com/aditya/study-os.git
   cd study-os
   ```
2. Install all development and core packages:
   ```bash
   npm install
   ```

### Command Reference

| Action | Command | Target Environment |
| :--- | :--- | :--- |
| **Development Desktop App** | `npm run desktop:dev` | Opens native macOS window with active Hot Module Reloading (HMR) |
| **Run Desktop App** | `npm run desktop` | Compiles a production bundle and launches in native Electron |
| **Browser Preview** | `npm run dev` | Starts Vite dev server locally at `http://127.0.0.1:1420` (Volatile LocalStorage) |
| **Execute Test Suites** | `npm run test` | Validates revision engine constraints and analytical helper formulas |
| **Production Build** | `npm run build` | Validates TypeScript typing and produces a static build folder |
| **Package macOS Installer** | `npm run dist:mac` | Produces an optimized, standalone `.app` and `.dmg` inside `release/` |

---

## 🛡️ License
This project is licensed under the terms of the MIT License.

---
<div align="center">
  <sub>Developed for focused, high-ROI GATE Computer Science preparation. No synchronization delays, no third-party trackers, no compromises.</sub>
</div>
