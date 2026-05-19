import { useStudyStore } from "../stores/studyStore";
import type { TopicStatus } from "../types";
import { revisionHealth } from "../lib/analytics";

const statuses: TopicStatus[] = ["not-started", "learning", "completed", "revising", "weak", "mastered"];

export function Syllabus() {
  const subjects = useStudyStore((state) => state.subjects);
  const chapters = useStudyStore((state) => state.chapters);
  const topics = useStudyStore((state) => state.topics);
  const updateTopic = useStudyStore((state) => state.updateTopic);
  const startTopic = useStudyStore((state) => state.startTopic);

  return (
    <div className="subject-grid">
      {subjects.map((subject) => {
        const subjectTopics = topics.filter((topic) => topic.subjectId === subject.id);
        const completed = subjectTopics.filter((topic) => ["completed", "revising", "mastered"].includes(topic.status)).length;
        const completion = subjectTopics.length ? Math.round((completed / subjectTopics.length) * 100) : 0;
        return (
          <section className="panel" key={subject.id}>
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
        );
      })}
    </div>
  );
}
