import { useMemo, useState } from "react";
import { mockTrend } from "../lib/analytics";
import { todayIso } from "../lib/date";
import { useStudyStore } from "../stores/studyStore";
import { CustomSelect } from "./CustomSelect";

export function Mocks() {
  const mockTests = useStudyStore((state) => state.mockTests);
  const subjects = useStudyStore((state) => state.subjects);
  const addMockTest = useStudyStore((state) => state.addMockTest);
  const [name, setName] = useState("");
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(100);
  const [attempted, setAttempted] = useState(50);
  const [sillyMistakes, setSillyMistakes] = useState(0);
  const [conceptualMistakes, setConceptualMistakes] = useState(0);
  const [timeIssues, setTimeIssues] = useState(0);
  const [notes, setNotes] = useState("");
  const [weakSubjectId, setWeakSubjectId] = useState(subjects[0]?.id ?? "");

  const subjectOptions = useMemo(() => {
    return subjects.map((sub) => ({ value: sub.id, label: sub.name }));
  }, [subjects]);

  const resetForm = () => {
    setName("");
    setScore(0);
    setAttempted(50);
    setSillyMistakes(0);
    setConceptualMistakes(0);
    setTimeIssues(0);
    setNotes("");
  };

  return (
    <div className="grid two">
      <section className="panel">
        <div className="panel-header">
          <h3>Mock Trend</h3>
          <span className={mockTrend(mockTests) >= 0 ? "pill good" : "pill warn"}>{mockTrend(mockTests)}%</span>
        </div>
        <div className="list">
          {mockTests.length === 0 ? (
            <div className="empty">No mock tests analyzed yet.</div>
          ) : mockTests.map((mock) => (
            <div className="row" key={mock.id}>
              <div>
                <strong>{mock.name}</strong>
                <div className="muted">
                  {mock.date} · {mock.score}/{mock.maxScore} · {mock.accuracy}% accuracy
                </div>
                {mock.notes && <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{mock.notes}</div>}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {mock.sillyMistakes > 0 && <span className="pill warn">{mock.sillyMistakes} silly</span>}
                <span className="pill warn">{mock.conceptualMistakes} concepts</span>
                {mock.timeIssues > 0 && <span className="pill">{mock.timeIssues} time</span>}
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="panel">
        <div className="panel-header">
          <h3>Analyze New Mock</h3>
        </div>
        <form
          className="form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!name.trim()) return;
            addMockTest({
              id: crypto.randomUUID(),
              name,
              date: todayIso(),
              score,
              maxScore,
              attempted,
              accuracy: Math.min(100, Math.round((score / Math.max(1, attempted)) * 100)),
              sillyMistakes,
              conceptualMistakes,
              timeIssues,
              weakSubjectIds: [weakSubjectId],
              notes
            });
            resetForm();
          }}
        >
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="GATE CS Mock 02" />
          <div className="form-row">
            <div>
              <label className="muted" style={{ fontSize: 12 }}>Score</label>
              <input type="number" min="0" max={maxScore} value={score} onChange={(event) => setScore(Number(event.target.value))} />
            </div>
            <div>
              <label className="muted" style={{ fontSize: 12 }}>Max Score</label>
              <input type="number" min="1" value={maxScore} onChange={(event) => setMaxScore(Number(event.target.value))} />
            </div>
          </div>
          <div className="form-row">
            <div>
              <label className="muted" style={{ fontSize: 12 }}>Attempted</label>
              <input type="number" min="0" value={attempted} onChange={(event) => setAttempted(Number(event.target.value))} />
            </div>
            <div>
              <label className="muted" style={{ fontSize: 12 }}>Identify Focus Subject</label>
              <CustomSelect 
                value={weakSubjectId} 
                onChange={setWeakSubjectId} 
                options={subjectOptions} 
              />
            </div>
          </div>
          <div className="form-row">
            <div>
              <label className="muted" style={{ fontSize: 12 }}>Silly mistakes</label>
              <input type="number" min="0" value={sillyMistakes} onChange={(event) => setSillyMistakes(Number(event.target.value))} />
            </div>
            <div>
              <label className="muted" style={{ fontSize: 12 }}>Conceptual mistakes</label>
              <input type="number" min="0" value={conceptualMistakes} onChange={(event) => setConceptualMistakes(Number(event.target.value))} />
            </div>
          </div>
          <div className="form-row">
            <div>
              <label className="muted" style={{ fontSize: 12 }}>Time issues</label>
              <input type="number" min="0" value={timeIssues} onChange={(event) => setTimeIssues(Number(event.target.value))} />
            </div>
            <div />
          </div>
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="What went wrong? What to review?" style={{ minHeight: 64 }} />
          <button className="primary-button" type="submit">Save Analysis</button>
        </form>
      </section>
    </div>
  );
}
