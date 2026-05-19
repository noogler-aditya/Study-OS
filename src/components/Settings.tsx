import { useStudyStore } from "../stores/studyStore";

export function Settings() {
  const subjects = useStudyStore((state) => state.subjects.length);
  const topics = useStudyStore((state) => state.topics.length);
  const mocks = useStudyStore((state) => state.mockTests.length);
  const notes = useStudyStore((state) => state.vaultNotes.length);
  const blocks = useStudyStore((state) => state.studyBlocks.length);
  const reset = useStudyStore((state) => state.reset);

  const handleReset = () => {
    const confirmed = window.confirm(
      "This will permanently delete all your study data and restore the seed GATE CS workspace.\n\nAre you sure?"
    );
    if (confirmed) void reset();
  };

  return (
    <div className="grid two">
      <section className="panel">
        <div className="panel-header">
          <h3>Local Workspace</h3>
        </div>
        <div className="list">
          <div className="row"><strong>Subjects</strong><span className="pill">{subjects}</span></div>
          <div className="row"><strong>Topics</strong><span className="pill">{topics}</span></div>
          <div className="row"><strong>Study blocks</strong><span className="pill">{blocks}</span></div>
          <div className="row"><strong>Mock analyses</strong><span className="pill">{mocks}</span></div>
          <div className="row"><strong>Vault notes</strong><span className="pill">{notes}</span></div>
        </div>
      </section>
      <section className="panel">
        <div className="panel-header">
          <h3>Data Controls</h3>
        </div>
        <p className="muted">Reset restores the seeded GATE CS workspace. All current data will be permanently lost.</p>
        <button className="ghost-button" style={{ marginTop: 8, color: "#9a3412" }} onClick={handleReset}>Reset All Data</button>
      </section>
    </div>
  );
}
