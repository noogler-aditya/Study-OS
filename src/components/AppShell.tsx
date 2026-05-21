import { BarChart3, BookOpen, CheckCircle, FlaskConical, Gauge, Library, Loader2, RotateCcw, Settings, XCircle } from "lucide-react";
import type React from "react";
import { useStudyStore } from "../stores/studyStore";

const views = [
  { id: "dashboard", label: "Dashboard", icon: Gauge, subtitle: "Today mission control" },
  { id: "syllabus", label: "Syllabus", icon: BookOpen, subtitle: "Completion and mastery" },
  { id: "revision", label: "Revision", icon: RotateCcw, subtitle: "Due topics and recall" },
  { id: "mocks", label: "Mocks", icon: BarChart3, subtitle: "Analysis loops" },
  { id: "vault", label: "Resources", icon: Library, subtitle: "Mistakes and formulas" },
  { id: "settings", label: "Settings", icon: Settings, subtitle: "Local data controls" }
];

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const activeView = useStudyStore((state) => state.activeView);
  const setActiveView = useStudyStore((state) => state.setActiveView);
  const saveStatus = useStudyStore((state) => state.saveStatus);
  const saveError = useStudyStore((state) => state.saveError);
  const active = views.find((view) => view.id === activeView) ?? views[0];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <h1>Study OS</h1>
          <p>GATE command center</p>
        </div>
        <nav className="nav" aria-label="Primary">
          {views.map((view) => {
            const Icon = view.icon;
            return (
              <button key={view.id} className={activeView === view.id ? "active" : ""} onClick={() => setActiveView(view.id)} title={view.label}>
                <Icon size={18} />
                <span>{view.label}</span>
              </button>
            );
          })}
        </nav>
        <div style={{ marginTop: "auto", padding: "12px 10px" }}>
          <SaveStatusIndicator status={saveStatus} error={saveError} />
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div>
            <h2>{active.label}</h2>
            <p>{active.subtitle}</p>
          </div>
          <button className="primary-button" type="button">
            <FlaskConical size={16} /> Focus
          </button>
        </header>
        <section className="content">{children}</section>
      </main>
    </div>
  );
}

function SaveStatusIndicator({ status, error }: { status: string; error: string | null }) {
  if (status === "saving") {
    return (
      <span className="save-status saving" title="Saving...">
        <Loader2 size={14} className="spin" /> Saving
      </span>
    );
  }
  if (status === "saved") {
    return (
      <span className="save-status saved" title="All changes saved">
        <CheckCircle size={14} /> Saved
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="save-status error" title={error ?? "Save failed"}>
        <XCircle size={14} /> Save failed
      </span>
    );
  }
  return null;
}
