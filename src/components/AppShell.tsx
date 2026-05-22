import { BarChart3, BookOpen, CheckCircle, FlaskConical, Gauge, Library, Loader2, RotateCcw, Settings, XCircle, Play, Pause, Square, Sparkles, Trophy } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useStudyStore } from "../stores/studyStore";

const views = [
  { id: "dashboard", label: "Dashboard", icon: Gauge, subtitle: "Today mission control" },
  { id: "syllabus", label: "Syllabus", icon: BookOpen, subtitle: "Completion and mastery" },
  { id: "revision", label: "Revision", icon: RotateCcw, subtitle: "Due topics and recall" },
  { id: "mocks", label: "Mocks", icon: BarChart3, subtitle: "Analysis loops" },
  { id: "vault", label: "Resources", icon: Library, subtitle: "Mistakes and formulas" },
  { id: "settings", label: "Settings", icon: Settings, subtitle: "Local data controls" }
];

const STUDY_TASKS = [
  { id: "discrete-math", name: "Discrete Mathematics", durationText: "2.5 hrs", minutes: 150, color: "#1f6f5a", badge: "Math" },
  { id: "pds", name: "Programming + Data Structure", durationText: "1.5 hrs", minutes: 90, color: "#2563eb", badge: "Core" },
  { id: "digital", name: "Digital Logic", durationText: "2.0 hrs", minutes: 120, color: "#7c3aed", badge: "Core" },
  { id: "os", name: "Operating System (OS)", durationText: "45 min", minutes: 45, color: "#ea580c", badge: "System" },
  { id: "dbms", name: "DBMS", durationText: "45 min", minutes: 45, color: "#db2777", badge: "System" },
  { id: "aptitude", name: "General Aptitude", durationText: "1.5 hrs", minutes: 90, color: "#0891b2", badge: "Aptitude" }
];

const formatTime = (totalSeconds: number) => {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);
  
  return [
    hrs.toString().padStart(2, "0"),
    mins.toString().padStart(2, "0"),
    secs.toString().padStart(2, "0")
  ].join(":");
};

const playSuccessChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // First oscillator (E5 - 659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
    
    // Second oscillator (A5 - 880.00 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880.00, ctx.currentTime);
    
    // Envelopes
    gain1.gain.setValueAtTime(0.15, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
    
    gain2.gain.setValueAtTime(0.1, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
    
    // Connect
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    // Play
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 1.2);
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 1.2);
  } catch (e) {
    console.error("Web Audio synthesis failed:", e);
  }
};

const requestNotificationPermission = () => {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
};

const dispatchNotification = (subjectName: string, durationMinutes: number) => {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("🎉 Study OS — Focus Block Complete!", {
      body: `Excellent concentration! You completed a ${durationMinutes >= 1 ? `${Math.round(durationMinutes)} min` : "test"} focus session for ${subjectName}.`,
      tag: "study-os-focus",
      silent: true // Custom Web Audio API chime plays instead of default system beep
    });
  }
};

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const activeView = useStudyStore((state) => state.activeView);
  const setActiveView = useStudyStore((state) => state.setActiveView);
  const saveStatus = useStudyStore((state) => state.saveStatus);
  const saveError = useStudyStore((state) => state.saveError);
  
  // Timer state and actions
  const focusSession = useStudyStore((state) => state.focusSession);
  const startFocusSession = useStudyStore((state) => state.startFocusSession);
  const pauseFocusSession = useStudyStore((state) => state.pauseFocusSession);
  const resumeFocusSession = useStudyStore((state) => state.resumeFocusSession);
  const tickFocusSession = useStudyStore((state) => state.tickFocusSession);
  const cancelFocusSession = useStudyStore((state) => state.cancelFocusSession);
  const clearCompletedFocusSession = useStudyStore((state) => state.clearCompletedFocusSession);
  const todayTasksCompleted = useStudyStore((state) => state.todayTasksCompleted || []);

  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);

  const active = views.find((view) => view.id === activeView) ?? views[0];
  const lastStatusRef = useRef<string | null>(null);
  const tickRef = useRef(tickFocusSession);
  tickRef.current = tickFocusSession;

  // Derive status to use as a stable dependency (primitive string, not object ref)
  const sessionStatus = focusSession?.status ?? null;

  // 1-second countdown interval — only re-runs when status transitions,
  // NOT on every tick (which would reset the interval each second).
  useEffect(() => {
    if (sessionStatus !== "running") return;
    const timer = setInterval(() => {
      tickRef.current();
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionStatus]);

  // Session completion sound & OS notification hooks
  useEffect(() => {
    if (!focusSession) {
      lastStatusRef.current = null;
      return;
    }

    if (focusSession.status === "completed" && lastStatusRef.current !== "completed") {
      playSuccessChime();
      dispatchNotification(focusSession.subjectName, focusSession.durationMinutes);
      setShowCongrats(true);
    }
    
    lastStatusRef.current = focusSession.status;
  }, [focusSession]);

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
          
          {focusSession && (focusSession.status === "running" || focusSession.status === "paused") ? (
            <div className={`timer-capsule ${focusSession.status === "paused" ? "paused" : ""}`}>
              <div className={`timer-capsule-dot ${focusSession.status === "running" ? "pulse" : "paused"}`} />
              <span className="timer-capsule-text">
                <strong>Focus:</strong> {focusSession.subjectName.split(" ")[0]}
              </span>
              <span className="timer-capsule-time">
                {formatTime(focusSession.timeLeftSeconds)}
              </span>
              <div className="timer-capsule-actions">
                {focusSession.status === "running" ? (
                  <button 
                    className="timer-btn" 
                    type="button" 
                    onClick={pauseFocusSession}
                    title="Pause session"
                  >
                    <Pause size={12} fill="currentColor" />
                  </button>
                ) : (
                  <button 
                    className="timer-btn" 
                    type="button" 
                    onClick={resumeFocusSession}
                    title="Resume session"
                  >
                    <Play size={12} fill="currentColor" />
                  </button>
                )}
                <button 
                  className="timer-btn" 
                  type="button" 
                  onClick={() => setIsCancelConfirmOpen(true)}
                  title="Stop session"
                >
                  <Square size={10} fill="currentColor" />
                </button>
              </div>
            </div>
          ) : (
            <button 
              className="primary-button" 
              type="button"
              onClick={() => {
                requestNotificationPermission();
                setIsSelectModalOpen(true);
              }}
            >
              <FlaskConical size={16} /> Focus
            </button>
          )}
        </header>
        <section className="content">{children}</section>
      </main>

      {/* Focus Subject Selector Modal */}
      {isSelectModalOpen && (
        <div className="focus-modal-overlay">
          <div className="focus-modal-content">
            <div className="focus-modal-header">
              <h3>What will you study today?</h3>
              <p>Select a subject from your daily routine to start a focused, distraction-free timer.</p>
            </div>
            
            <div className="focus-subject-grid">
              {STUDY_TASKS.map((task) => {
                const isCompleted = todayTasksCompleted.includes(task.id);
                return (
                  <button
                    key={task.id}
                    className={`focus-subject-card ${isCompleted ? "checked" : ""}`}
                    style={{
                      ["--subject-color" as any]: task.color,
                      ["--subject-border-hover" as any]: task.color
                    }}
                    onClick={() => {
                      startFocusSession(task.id, task.name, task.minutes);
                      setIsSelectModalOpen(false);
                    }}
                  >
                    <div className="focus-subject-card-left">
                      <div className="focus-subject-color-bar" />
                      <div className="focus-subject-info">
                        <span className="focus-subject-name">{task.name}</span>
                        <span className="focus-subject-duration">{task.durationText}</span>
                      </div>
                    </div>
                    <Play size={14} className="focus-subject-arrow" />
                  </button>
                );
              })}
            </div>
            
            <button
              className="focus-test-session-btn"
              type="button"
              onClick={() => {
                startFocusSession("test-session", "⚡ 10 Second Focus Test Session", 0.166666);
                setIsSelectModalOpen(false);
              }}
            >
              <Sparkles size={14} /> ⚡ 10 Second Focus Test Session
            </button>
            
            <div className="focus-modal-footer">
              <button
                className="focus-modal-cancel-btn"
                type="button"
                onClick={() => setIsSelectModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Timer Confirmation Modal */}
      {isCancelConfirmOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Stop Focus Session?</h3>
            <p>Are you sure you want to stop focusing? Your current progress for this session will be lost.</p>
            <div className="modal-actions">
              <button
                className="ghost-button"
                type="button"
                onClick={() => setIsCancelConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                className="primary-button danger"
                type="button"
                onClick={() => {
                  cancelFocusSession();
                  setIsCancelConfirmOpen(false);
                }}
              >
                Stop Focusing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Congrats Celebration Overlay */}
      {showCongrats && focusSession && (
        <div className="congrats-modal-overlay">
          <div className="congrats-modal-content">
            <div className="congrats-trophy-container">
              <Trophy size={40} />
            </div>
            <h3>🎉 Focus Block Complete!</h3>
            <p>
              Excellent concentration! You have logged {focusSession.durationMinutes >= 1 ? `${Math.round(focusSession.durationMinutes)} minutes` : "a test session"} of focus time for <strong>{focusSession.subjectName}</strong>.
            </p>
            <div className="modal-actions" style={{ justifyContent: "center" }}>
              <button
                className="primary-button"
                type="button"
                onClick={() => {
                  clearCompletedFocusSession();
                  setShowCongrats(false);
                }}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
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
