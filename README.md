# 🎓 Study OS
### **Universal, Local-First Academic Command Center & Spaced-Repetition Station**

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Electron](https://img.shields.io/badge/Electron-42.1-47848F?style=flat-square&logo=electron)](https://www.electronjs.org/)
[![Zustand](https://img.shields.io/badge/State-Zustand-orange?style=flat-square)](https://github.com/pmndrs/zustand)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Testing-Vitest-729B1B?style=flat-square&logo=vitest)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

**Study OS** is a premium, distraction-free desktop workstation engineered for high-intensity academic and professional examination prep (e.g., GATE, USMLE, MCAT, CFA, or custom curriculums). 

Built on an **offline-first, privacy-first** philosophy, Study OS stores all preparation metrics, spaced-repetition cards, and review statistics locally. It guarantees zero cloud latency, zero registration prompts, and zero distractions.

---

## 🌟 Key Pillars & Features

### 📅 Intensive Study Dashboard
Designed to maintain momentum and extreme consistency during high-intensity prep phases.
*   **Today's Learning Schedule Checklist**: A target list of daily subject blocks with time allocations. Completing all items unlocks your daily green streak.
*   **Daily Session Lock Banner**: Encourages deep study during core hours. Completing your checklist updates the active session banner into an active pulsing emerald lock-in confirmation.
*   **Integrated Calendar & Streak Tracker**: A unified visual dashboard mapping your consistency:
    *   **Duolingo-Style Streak Badges**: Track active daily streak streaks (`🔥`) merged directly into the calendar card header.
    *   **Standard Grid Layout**: Month-to-month calendar navigation featuring sleek rounded-square cards (`border-radius: 6px`) to map your study history.
    *   **Timezone-Safe Synchronization**: Local ISO timestamp matching immediately lights up today's cell green once targets are locked in.

---

### 🔄 Spaced-Repetition Revision Center
Powered by a deterministic local recall engine that systematically schedules topics based on cognitive decay curves.

$$\text{Interval} = \text{BaseConfidenceDays} \times (\text{RevisionCount} + 1)$$

| Confidence | Base Interval | 0 Revisions | 2 Revisions | 4 Revisions | Status Transition |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 🔴 **Low** | 1 Day | 1 Day | 3 Days | 5 Days | Demoted to `weak` |
| 🟡 **Medium** | 3 Days | 3 Days | 9 Days | 15 Days | Promotes to `revising` |
| 🟢 **High** | 7 Days | 7 Days | 21 Days | 35 Days | Marked as `mastered` (3+ reviews) |

*   **One-Click Completion**: Mark revisions instantly using the topic's current confidence status, maintaining flow state.
*   **Safe Revision Untracking**: Remove items from active scheduling with a quick confirmation modal featuring a modern, glassmorphic (`backdrop-filter: blur(8px)`) overlay design.

---

### 📚 Knowledge Resources Log
Catalog important exam resources, mistakes, and cheat sheets in a single local database.
*   **Mistake & Formula Catching**: Tag captured concepts as `formula`, `mistake`, `insight`, `revision-summary`, or `forgotten-concept`.
*   **Fast Indexing**: Search, filter, and isolate your compiled knowledge base instantly by subject and specific topics.

---

### 📊 Diagnostic Mock Logging
*   **Error Gap Analysis**: Log mock test scores while mapping conceptual failures, silly mistakes, and time-management issues.
*   **Accuracy Trends**: Monitor mock performance trends dynamically to address weak subjects before exam day.

---

## 🛠️ Technology Stack

| Layer | Component | Description |
| :--- | :--- | :--- |
| **UI Framework** | **React 19 + TypeScript** | Declarative type-safe components. |
| **State & Store** | **Zustand** | Centralized client-side state with native persistent writes. |
| **Desktop Shell** | **Electron Shell** | Sandbox-isolated native desktop container. |
| **Styling Engine** | **Vanilla CSS + System overrides**| Beautiful custom components with curated warm palettes. |
| **Storage Layer** | **Atomic Filesystem Writer** | Robust disk serialization with active backup mirrors. |
| **Testing** | **Vitest** | Highly responsive testing runner for scheduling logic. |

---

## 📁 System Architecture

```
study-os/
├── electron/               # Desktop main process & IPC bridges
│   ├── main.cjs            # Window creation, file I/O & native API handlers
│   └── preload.cjs         # contextBridge isolation boundary
├── src/
│   ├── components/         # High-Fidelity React components
│   │   ├── AppShell.tsx    # App shell, navigation & real-time write indicators
│   │   ├── Dashboard.tsx   # Checklist, timeline progress & monthly calendar
│   │   ├── Syllabus.tsx    # Nested syllabus tree with custom status controls
│   │   ├── Revision.tsx    # Spaced repetition lists, filters & glassmorphic dialogs
│   │   ├── Mocks.tsx       # Mock score logs and trend analysis tools
│   │   ├── Vault.tsx       # Searchable Knowledge Resources compiler
│   │   └── Settings.tsx    # Statistics dashboard & workspace data controls
│   ├── stores/
│   │   └── studyStore.ts   # Zustand main store orchestrator
│   ├── lib/
│   │   ├── storage.ts      # Storage controller prioritizing IPC file I/O over Web Storage
│   │   ├── revision.ts     # Spaced repetition formulas and scheduling mathematics
│   │   ├── analytics.ts    # Completion percentiles and trend reporters
│   │   └── date.ts         # Timezone-safe local ISO calendar utilities
│   ├── data/
│   │   └── seed.ts         # Mock data seeder (Pre-seeded for GATE CS out-of-the-box)
│   ├── types.ts            # Core TypeScript model schemas
│   ├── App.tsx             # Root viewport dispatcher
│   ├── main.tsx            # DOM mounting node
│   └── styles.css          # Customized CSS design design tokens & keyframes
├── tests/
│   └── revision.test.ts    # Revision algorithms unit tests
└── package.json
```

---

## ⚙️ Universal Customization: Adapting to Any Exam

Study OS is designed to be **universally adaptable** to any curriculum. While pre-seeded with GATE CS configurations, you can configure it for any exam (e.g., USMLE, MCAT, CFA) by modifying the data structure in `src/data/seed.ts`.

### Modifying Your Exam Syllabus
To customize your subjects, chapters, and topics, define your curriculum in [src/data/seed.ts](file:///Users/aditya/Desktop/Gate%20Center/src/data/seed.ts):

```typescript
export const seedSubjects = [
  {
    id: "sub-cardiology",
    name: "Cardiology",
    color: "#e11d48", // Hex color code for indicators
    targetWeight: 15  // Weight allocation
  },
  // Add other subjects...
];

export const seedChapters = [
  {
    id: "ch-valvular",
    subjectId: "sub-cardiology",
    name: "Valvular Heart Disease",
    order: 1
  },
  // Add other chapters...
];

export const seedTopics = [
  {
    id: "topic-mitral-stenosis",
    chapterId: "ch-valvular",
    subjectId: "sub-cardiology",
    name: "Mitral Stenosis Murmurs",
    status: "not-started",
    confidence: "medium",
    revisionCount: 0,
    pyqSolved: 0,
    pyqTotal: 15,
    mastery: 0
  },
  // Add other topics...
];
```

---

## 💾 Local Data Integrity & Atomic Writing

Study OS stores all data directly under your operating system's native application support folder:
*   **macOS**: `~/Library/Application Support/Study OS/`
*   **Windows**: `%APPDATA%/Study OS/`
*   **Linux**: `~/.config/Study OS/`

### Bulletproof File Serialization
To prevent data corruption during sudden system shutdowns, the filesystem module employs kernel-level **atomic file renames**:
1. State changes are written asynchronously to a temporary file (`study-os-data.tmp.json`).
2. The current healthy `study-os-data.json` is safely mirrored as `study-os-data.backup.json`.
3. The temporary file is atomically renamed to replace `study-os-data.json`.
4. The sidebar instantly displays a verified save badge (`Saved`).

---

## 🚀 Getting Started

### Prerequisites
*   **Node.js**: `v18.0.0` or higher
*   **npm**: `v9.0.0` or higher

### Installation
1. Clone the repository and navigate to the directory:
   ```bash
   git clone https://github.com/username/study-os.git
   cd study-os
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Command Reference

| Action | Command | Environment |
| :--- | :--- | :--- |
| **Launch Desktop Dev** | `npm run desktop:dev` | Opens native window with Hot Module Replacement (HMR). |
| **Launch Desktop Production** | `npm run desktop` | Compiles production bundle and launches window. |
| **Run Unit Tests** | `npm run test` | Validatesspaced-repetition engine and analysis formulas. |
| **Build Assets** | `npm run build` | Compiles TypeScript and packages production static directory. |
| **Package macOS App** | `npm run dist:mac` | Assembles a standalone `.app` and `.dmg` inside `release/`. |

---

## 🛡️ License
This project is licensed under the terms of the MIT License.
