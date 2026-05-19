import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { dueRevisionTopics } from "../lib/revision";
import { formatShortDate, todayIso } from "../lib/date";
import { useStudyStore } from "../stores/studyStore";
import type { Confidence } from "../types";

const confidenceOptions: Confidence[] = ["low", "medium", "high"];

export function Revision() {
  const topics = useStudyStore((state) => state.topics);
  const subjects = useStudyStore((state) => state.subjects);
  const completeRevision = useStudyStore((state) => state.completeRevision);
  const queue = dueRevisionTopics(topics, todayIso());

  const subjectName = (subjectId: string) => subjects.find((subject) => subject.id === subjectId)?.name ?? "Subject";

  return (
    <div className="grid two">
      <section className="panel">
        <div className="panel-header">
          <h3>Due Revision Queue</h3>
          <RotateCcw size={18} />
        </div>
        <div className="list">
          {queue.length === 0 ? <div className="empty">No due revisions today.</div> : queue.map((topic) => (
            <RevisionRow key={topic.id} topic={topic} subjectName={subjectName(topic.subjectId)} onComplete={completeRevision} />
          ))}
        </div>
      </section>
      <section className="panel">
        <div className="panel-header">
          <h3>Revision Health</h3>
        </div>
        <div className="list">
          {topics.filter((topic) => topic.nextRevisionOn).slice(0, 12).map((topic) => (
            <div className="row" key={topic.id}>
              <div>
                <strong>{topic.name}</strong>
                <div className="muted">{subjectName(topic.subjectId)} · next {formatShortDate(topic.nextRevisionOn)}</div>
              </div>
              <span className={topic.nextRevisionOn && topic.nextRevisionOn <= todayIso() ? "pill warn" : "pill good"}>{topic.revisionCount} revs</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/** Controlled component — no document.getElementById anti-pattern */
function RevisionRow({ topic, subjectName, onComplete }: {
  topic: { id: string; name: string; subjectId: string; confidence: Confidence; revisionCount: number; nextRevisionOn?: string };
  subjectName: string;
  onComplete: (topicId: string, confidence: Confidence, forgotten: boolean) => void;
}) {
  const [confidence, setConfidence] = useState<Confidence>(topic.confidence);

  return (
    <div className="row">
      <div>
        <strong>Revise {topic.name} #{topic.revisionCount + 1}</strong>
        <div className="muted">{subjectName} · due {formatShortDate(topic.nextRevisionOn)}</div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <select className="status-select" value={confidence} onChange={(e) => setConfidence(e.target.value as Confidence)}>
          {confidenceOptions.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className="primary-button" onClick={() => onComplete(topic.id, confidence, false)}>
          Complete
        </button>
        <button className="ghost-button" onClick={() => onComplete(topic.id, "low", true)}>Forgot</button>
      </div>
    </div>
  );
}
