import { Play, RotateCcw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { dueRevisionTopics } from "../lib/revision";
import { formatShortDate, todayIso } from "../lib/date";
import { useStudyStore } from "../stores/studyStore";
import type { Confidence } from "../types";

export function Revision() {
  const topics = useStudyStore((state) => state.topics);
  const subjects = useStudyStore((state) => state.subjects);
  const chapters = useStudyStore((state) => state.chapters);
  const completeRevision = useStudyStore((state) => state.completeRevision);
  const startTopic = useStudyStore((state) => state.startTopic);
  const updateTopic = useStudyStore((state) => state.updateTopic);
  const queue = dueRevisionTopics(topics, todayIso());

  // State for "Start Revision" form
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id ?? "");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [startDate, setStartDate] = useState(todayIso());

  // State for delete confirmation modal
  const [topicToDelete, setTopicToDelete] = useState<{ id: string; name: string } | null>(null);

  // Topics available for revision start (not-started or learning, not yet in revision cycle)
  const availableTopics = useMemo(() => {
    return topics.filter(
      (t) => t.subjectId === selectedSubjectId && (t.status === "not-started" || t.status === "learning")
    );
  }, [topics, selectedSubjectId]);

  // Topics that have been studied (have a revision schedule)
  const trackedTopics = useMemo(() => {
    return topics
      .filter((t) => t.nextRevisionOn)
      .sort((a, b) => (a.nextRevisionOn ?? "").localeCompare(b.nextRevisionOn ?? ""));
  }, [topics]);

  const subjectName = (subjectId: string) => subjects.find((s) => s.id === subjectId)?.name ?? "Subject";

  const handleStartRevision = () => {
    if (!selectedTopicId) return;
    const topic = topics.find((t) => t.id === selectedTopicId);
    const confidence = topic?.confidence ?? "medium";
    startTopic(selectedTopicId, confidence, startDate);
    setSelectedTopicId("");
  };

  return (
    <div className="grid">
      {/* Row 1: Start revision + Due queue */}
      <div className="grid two">
        <section className="panel">
          <div className="panel-header">
            <h3>Start Revision</h3>
            <Play size={18} />
          </div>
          <p className="muted" style={{ marginBottom: 10, fontSize: 13 }}>
            Pick a topic you've studied and schedule its first revision.
          </p>
          <div className="form">
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setSelectedTopicId("");
              }}
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
            >
              <option value="">Select a topic</option>
              {availableTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.status})
                </option>
              ))}
            </select>
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Select revision date"
            />
            <button
              className="primary-button"
              type="button"
              onClick={handleStartRevision}
              disabled={!selectedTopicId}
            >
              Schedule Revision
            </button>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h3>Due Revision Queue</h3>
            <RotateCcw size={18} />
          </div>
          <div className="list">
            {queue.length === 0 ? (
              <div className="empty">No due revisions today.</div>
            ) : queue.map((topic) => (
              <RevisionRow
                key={topic.id}
                topic={topic}
                subjectName={subjectName(topic.subjectId)}
                onComplete={completeRevision}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Row 2: All tracked topics */}
      <section className="panel">
        <div className="panel-header">
          <h3>Revision Schedule</h3>
          <span className="pill">{trackedTopics.length} topics tracked</span>
        </div>
        <div className="list">
          {trackedTopics.length === 0 ? (
            <div className="empty">No topics in revision yet. Use "Start Revision" above to begin tracking.</div>
          ) : trackedTopics.map((topic) => {
            const isDue = topic.nextRevisionOn && topic.nextRevisionOn <= todayIso();
            return (
              <div className="row" key={topic.id}>
                <div className="row-title">
                  <span
                    className="dot"
                    style={{ background: subjects.find((s) => s.id === topic.subjectId)?.color }}
                  />
                  <div>
                    <strong>{topic.name}</strong>
                    <div className="muted">
                      {subjectName(topic.subjectId)} · next {formatShortDate(topic.nextRevisionOn)} · {topic.confidence} confidence
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className="pill">{topic.revisionCount} revs</span>
                  <span className={isDue ? "pill warn" : "pill good"}>
                    {isDue ? "Due" : topic.status}
                  </span>
                  <button
                    className="icon-button"
                    title="Remove from schedule"
                    onClick={() => setTopicToDelete({ id: topic.id, name: topic.name })}
                    style={{ color: "#9a3412" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {topicToDelete && (
        <div className="modal-overlay" onClick={() => setTopicToDelete(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Remove from Schedule</h3>
            <p>
              Are you sure you want to remove <strong>{topicToDelete.name}</strong> from the revision schedule? This will reset its revision progress.
            </p>
            <div className="modal-actions">
              <button
                className="ghost-button"
                onClick={() => setTopicToDelete(null)}
              >
                Cancel
              </button>
              <button
                className="primary-button danger"
                onClick={() => {
                  updateTopic(topicToDelete.id, {
                    nextRevisionOn: undefined,
                    studiedOn: undefined,
                    revisionCount: 0,
                    status: "learning"
                  });
                  setTopicToDelete(null);
                }}
              >
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Controlled revision completion row */
function RevisionRow({ topic, subjectName, onComplete }: {
  topic: { id: string; name: string; subjectId: string; confidence: Confidence; revisionCount: number; nextRevisionOn?: string };
  subjectName: string;
  onComplete: (topicId: string, confidence: Confidence, forgotten: boolean) => void;
}) {
  return (
    <div className="row">
      <div>
        <strong>Revise {topic.name} #{topic.revisionCount + 1}</strong>
        <div className="muted">{subjectName} · due {formatShortDate(topic.nextRevisionOn)}</div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button className="primary-button" onClick={() => onComplete(topic.id, topic.confidence, false)}>
          Complete
        </button>
        <button className="ghost-button" onClick={() => onComplete(topic.id, "low", true)}>Forgot</button>
      </div>
    </div>
  );
}
