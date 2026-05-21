import { Flame } from "lucide-react";
import { useMemo } from "react";
import { completionPercent, weakTopics } from "../lib/analytics";
import { todayIso } from "../lib/date";
import { dueRevisionTopics } from "../lib/revision";
import { useStudyStore } from "../stores/studyStore";

export function Dashboard() {
  const subjects = useStudyStore((state) => state.subjects);
  const topics = useStudyStore((state) => state.topics);
  const dashboard = useMemo(() => {
    const today = todayIso();
    return {
      completionPercent: completionPercent(topics),
      dueRevisions: dueRevisionTopics(topics, today),
      weakTopics: weakTopics(topics),
    };
  }, [topics]);

  const subjectName = (subjectId?: string) => subjects.find((subject) => subject.id === subjectId)?.name ?? "Mixed";

  return (
    <div className="grid">
      <div className="grid two">
        <section className="panel metric">
          <span>Syllabus completion</span>
          <strong>{dashboard.completionPercent}%</strong>
          <div className="progress"><span style={{ width: `${dashboard.completionPercent}%` }} /></div>
        </section>
        <section className="panel metric">
          <span>Due revisions</span>
          <strong>{dashboard.dueRevisions.length}</strong>
          <span>Topics needing revision today</span>
        </section>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h3>Weak Topics</h3>
          <Flame size={18} />
        </div>
        <div className="list">
          {dashboard.weakTopics.length === 0 ? (
            <div className="empty">No weak topics. Keep studying!</div>
          ) : dashboard.weakTopics.map((topic) => (
            <div className="row" key={topic.id}>
              <div className="row-title">
                <span className="dot" style={{ background: subjects.find((subject) => subject.id === topic.subjectId)?.color }} />
                <div>
                  <strong>{topic.name}</strong>
                  <div className="muted">{subjectName(topic.subjectId)} · {topic.confidence} confidence</div>
                </div>
              </div>
              <span className="pill warn">Needs recall</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

