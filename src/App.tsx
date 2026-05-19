import { useEffect } from "react";
import { AppShell } from "./components/AppShell";
import { Dashboard } from "./components/Dashboard";
import { Mocks } from "./components/Mocks";
import { Revision } from "./components/Revision";
import { Scheduler } from "./components/Scheduler";
import { Settings } from "./components/Settings";
import { Syllabus } from "./components/Syllabus";
import { Vault } from "./components/Vault";
import { useStudyStore } from "./stores/studyStore";

export function App() {
  const hydrate = useStudyStore((state) => state.hydrate);
  const loading = useStudyStore((state) => state.loading);
  const activeView = useStudyStore((state) => state.activeView);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (loading) {
    return <div className="empty" style={{ minHeight: "100vh" }}>Opening Study OS</div>;
  }

  return (
    <AppShell>
      {activeView === "dashboard" && <Dashboard />}
      {activeView === "syllabus" && <Syllabus />}
      {activeView === "revision" && <Revision />}
      {activeView === "scheduler" && <Scheduler />}
      {activeView === "mocks" && <Mocks />}
      {activeView === "vault" && <Vault />}
      {activeView === "settings" && <Settings />}
    </AppShell>
  );
}
