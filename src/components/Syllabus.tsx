import { ArrowLeft, BookOpen } from "lucide-react";
import { useState } from "react";
import { revisionHealth } from "../lib/analytics";
import { useStudyStore } from "../stores/studyStore";
import type { TopicStatus } from "../types";

const statuses: TopicStatus[] = ["not-started", "learning", "completed", "revising", "weak", "mastered"];

export function Syllabus() {
  const subjects = useStudyStore((state) => state.subjects);
  const chapters = useStudyStore((state) => state.chapters);
  const topics = useStudyStore((state) => state.topics);
  const updateTopic = useStudyStore((state) => state.updateTopic);
  const startTopic = useStudyStore((state) => state.startTopic);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  if (selectedSubjectId) {
    const subject = subjects.find((s) => s.id === selectedSubjectId);
    if (!subject) return null;

    const subjectTopics = topics.filter((topic) => topic.subjectId === subject.id);
    const completed = subjectTopics.filter((topic) => ["completed", "revising", "mastered"].includes(topic.status)).length;
    const completion = subjectTopics.length ? Math.round((completed / subjectTopics.length) * 100) : 0;

    return (
      <div className="syllabus-detail">
        <button className="ghost-button" onClick={() => setSelectedSubjectId(null)} style={{ marginBottom: 16 }}>
          <ArrowLeft size={16} /> Back to Subjects
        </button>
        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>{subject.name}</h3>
              <p className="muted">{completion}% complete · {revisionHealth(subjectTopics)}% revision health</p>
            </div>
            <span className="pill">{subject.targetWeight}% weight</span>
          </div>
          <div className="progress"><span style={{ width: `${completion}%`, background: subject.color }} /></div>
          {chapters.filter((chapter) => chapter.subjectId === subject.id).map((chapter) => (
            <div className="topic-list" key={chapter.id}>
              <strong>{chapter.name}</strong>
              {subjectTopics.filter((topic) => topic.chapterId === chapter.id).map((topic) => (
                <div className="row" key={topic.id}>
                  <div className="row-title">
                    <span className="dot" style={{ background: subject.color }} />
                    <div>
                      <strong>{topic.name}</strong>
                      <div className="muted">PYQs {topic.pyqSolved}/{topic.pyqTotal} · mastery {topic.mastery}%</div>
                    </div>
                  </div>
                  <select
                    className="status-select"
                    value={topic.status}
                    onChange={(event) => {
                      const status = event.target.value as TopicStatus;
                      if (status === "learning" && !topic.studiedOn) startTopic(topic.id);
                      else updateTopic(topic.id, { status });
                    }}
                  >
                    {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </div>
              ))}
            </div>
          ))}
        </section>
      </div>
    );
  }

  return (
    <div className="subject-cards">
      {subjects.map((subject) => {
        const subjectTopics = topics.filter((topic) => topic.subjectId === subject.id);
        const completed = subjectTopics.filter((topic) => ["completed", "revising", "mastered"].includes(topic.status)).length;
        const completion = subjectTopics.length ? Math.round((completed / subjectTopics.length) * 100) : 0;
        
        return (
          <div className="subject-card panel" key={subject.id} onClick={() => setSelectedSubjectId(subject.id)}>
            <div className="subject-card-icon" style={{ backgroundColor: `${subject.color}15`, color: subject.color }}>
              <BookOpen size={24} />
            </div>
            <div className="subject-card-content">
              <h3>{subject.name}</h3>
              <div className="subject-card-stats">
                <span className="pill">{subject.targetWeight}% weight</span>
                <span className="pill good">{revisionHealth(subjectTopics)}% health</span>
              </div>
            </div>
            <div className="subject-card-footer">
              <div className="progress-info">
                <span>Completion</span>
                <span>{completion}%</span>
              </div>
              <div className="progress"><span style={{ width: `${completion}%`, background: subject.color }} /></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
