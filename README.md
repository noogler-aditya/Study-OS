<div align="center">

# Study OS

**Offline-first macOS desktop study command center for GATE CS preparation.**

Built with React 19 · TypeScript · Electron · Zustand · Vite

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![Platform](https://img.shields.io/badge/platform-macOS-lightgrey)
![Status](https://img.shields.io/badge/status-active-brightgreen)

</div>

---

## Overview

Study OS is a personal, offline-first desktop application designed for long-form GATE (Graduate Aptitude Test in Engineering) preparation. It provides a structured command center to track syllabus progress, schedule study blocks, manage spaced-repetition revisions, analyze mock tests, and capture key learnings — all stored locally with zero cloud dependencies.

### Key Features

- **Syllabus Tracker** — Full GATE CS syllabus with 9 subjects, 18 chapters, and 50+ topics. Track completion, mastery percentage, and PYQ progress per topic.
- **Spaced Repetition Engine** — Confidence-based revision scheduling with automatic interval scaling. Topics are promoted to "mastered" after 3+ high-confidence revisions.
- **Study Block Scheduler** — Plan daily study sessions with energy-level tagging (peak/normal/low) and block-type classification (learn/revise/pyq/mock/analysis/backlog).
- **Mock Test Analyzer** — Log mock test scores with error categorization (silly mistakes, conceptual gaps, time management issues). Track score trends across tests.
- **Knowledge Vault** — Capture formulas, mistake patterns, forgotten concepts, and revision summaries. Searchable and categorized by subject.
- **Crash-Safe Persistence** — Atomic file writes with automatic backups. Data stored in macOS app data directory, not browser localStorage.
- **Save Status Feedback** — Real-time visual confirmation (Saving → Saved → Error) on every operation.

---

## Screenshots

<!-- Add screenshots here after building -->
<!-- ![Dashboard](docs/screenshots/dashboard.png) -->
<!-- ![Syllabus](docs/screenshots/syllabus.png) -->

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite |
| **State Management** | Zustand |
| **Styling** | Vanilla CSS with custom design system |
| **Desktop Shell** | Electron (primary), Tauri 2 (optional) |
| **Persistence** | Atomic JSON file writes via Electron IPC |
| **Icons** | Lucide React |
| **Testing** | Vitest |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **macOS** (Electron shell targets macOS)

### Install Dependencies

```bash
git clone https://github.com/<your-username>/gate-center.git
cd gate-center
npm install
```

### Run as Desktop App

```bash
# Production build → opens native macOS window
npm run desktop

# Development mode with hot reload
npm run desktop:dev
```

### Run in Browser (Dev Only)

```bash
npm run dev
```

Open `http://127.0.0.1:1420`. Note: browser mode uses localStorage (volatile). Use `desktop:dev` for persistent storage.

### Package as macOS App (.dmg)

```bash
npm run dist:mac
```

The packaged `.app` and `.dmg` are written to `release/`. To open without Gatekeeper warnings:

```bash
xattr -cr release/mac-arm64/Study\ OS.app
```

### Run Tests

```bash
npm test
```

---

## Project Structure

```
gate-center/
├── electron/               # Electron main process
│   ├── main.cjs            # Window creation, IPC handlers, atomic file I/O
│   └── preload.cjs         # Context bridge (load/save IPC)
├── src/
│   ├── components/         # React view components
│   │   ├── AppShell.tsx    # Sidebar navigation + save status indicator
│   │   ├── Dashboard.tsx   # Mission control — metrics, blocks, revisions
│   │   ├── Syllabus.tsx    # Subject/chapter/topic tree with status controls
│   │   ├── Revision.tsx    # Due revision queue with confidence tracking
│   │   ├── Scheduler.tsx   # Study block creation and management
│   │   ├── Mocks.tsx       # Mock test analysis and trend tracking
│   │   ├── Vault.tsx       # Knowledge vault — searchable notes
│   │   └── Settings.tsx    # Workspace stats and data reset
│   ├── stores/
│   │   └── studyStore.ts   # Zustand store — all state + persistence
│   ├── lib/
│   │   ├── storage.ts      # Storage abstraction (Electron IPC / dev fallback)
│   │   ├── revision.ts     # Spaced repetition algorithm
│   │   ├── analytics.ts    # Completion %, revision health, mock trends
│   │   └── date.ts         # ISO date utilities
│   ├── data/
│   │   └── seed.ts         # GATE CS syllabus seed data (9 subjects, 50+ topics)
│   ├── types.ts            # TypeScript domain types
│   ├── App.tsx             # Root component with view routing
│   ├── main.tsx            # React entry point
│   └── styles.css          # Design system — colors, layout, components
├── src-tauri/              # Optional Tauri 2 desktop shell (Rust + SQLite)
├── tests/
│   └── revision.test.ts    # Unit tests for revision engine + analytics
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Electron Shell                  │
│  ┌───────────┐    IPC     ┌──────────────────┐  │
│  │ preload   │◄──────────►│   main.cjs       │  │
│  │ (bridge)  │            │ Atomic JSON I/O  │  │
│  └─────┬─────┘            │ Auto-backup      │  │
│        │                  └────────┬─────────┘  │
│        │                           │             │
│  ┌─────▼──────────────────┐  ┌─────▼──────────┐ │
│  │    React 19 SPA        │  │  ~/Library/     │ │
│  │  ┌──────────────────┐  │  │  Application   │ │
│  │  │  Zustand Store   │  │  │  Support/      │ │
│  │  │  (studyStore.ts) │  │  │  Study OS/     │ │
│  │  └────────┬─────────┘  │  │  ├─ data.json  │ │
│  │           │             │  │  └─ backup.json│ │
│  │  ┌────────▼─────────┐  │  └────────────────┘ │
│  │  │  lib/ (pure fns) │  │                      │
│  │  │  revision.ts     │  │                      │
│  │  │  analytics.ts    │  │                      │
│  │  │  date.ts         │  │                      │
│  │  └──────────────────┘  │                      │
│  └────────────────────────┘                      │
└─────────────────────────────────────────────────┘
```

### Data Flow

1. **User action** (e.g., mark study block done) → React component
2. **Zustand store** updates in-memory state → UI reflects instantly
3. **`persist()`** serializes all data → calls `storage.ts`
4. **Electron IPC** → `main.cjs` writes to temp file → backs up current → atomic rename
5. **Save status** indicator shows ✓ Saved (or ✕ Error)

### Spaced Repetition Algorithm

```
interval = baseInterval[confidence] × (revisionCount + 1)

| Confidence | Base | After 0 revs | After 2 revs | After 4 revs |
|------------|------|-------------|-------------|-------------|
| Low        | 1d   | 1d          | 3d          | 5d          |
| Medium     | 3d   | 3d          | 9d          | 15d         |
| High       | 7d   | 7d          | 21d         | 35d         |
```

Topics are promoted to `mastered` after 3+ revisions at high confidence. Marking a topic as `forgotten` or `low` confidence demotes it to `weak`.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server (browser mode, port 1420) |
| `npm run desktop` | Build + open as native macOS Electron app |
| `npm run desktop:dev` | Hot-reload dev mode inside Electron window |
| `npm run dist:mac` | Package as `.app` and `.dmg` in `release/` |
| `npm run build` | TypeScript check + Vite production build |
| `npm run preview` | Preview production build locally |
| `npm test` | Run Vitest unit tests |
| `npm run tauri dev` | (Optional) Run via Tauri 2 shell (requires Rust) |

---

## Data Storage

Study OS stores all data locally:

```
~/Library/Application Support/Study OS/
├── study-os-data.json          # Current state
├── study-os-data.backup.json   # Previous save (auto-created)
└── study-os-data.tmp.json      # Only exists during write (deleted after)
```

Writes are **atomic**: data is written to a temp file first, the current file is backed up, then the temp file is renamed. A crash at any point cannot corrupt data.

---

## Contributing

This is a personal study tool, but contributions are welcome:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Built for focused GATE preparation. No accounts, no sync, no distractions.</sub>
</div>
