import { CheckCircle2, Clock3, Flame, TimerReset } from "lucide-react";
import { useMemo } from "react";
import { completionPercent, dailyStreak, weakTopics } from "../lib/analytics";
import { formatShortDate, todayIso } from "../lib/date";
import { dueRevisionTopics } from "../lib/revision";
import { useStudyStore } from "../stores/studyStore";

export function Dashboard() {
  const subjects = useStudyStore((state) => state.subjects);
  const topics = useStudyStore((state) => state.topics);
  const studyBlocks = useStudyStore((state) => state.studyBlocks);
  const toggleStudyBlock = useStudyStore((state) => state.toggleStudyBlock);
  const dashboard = useMemo(() => {
    const today = todayIso();
    return {
      completionPercent: completionPercent(topics),
      dueRevisions: dueRevisionTopics(topics, today),
      weakTopics: weakTopics(topics),
      todayBlocks: studyBlocks.filter((block) => block.date === today).sort((a, b) => a.start.localeCompare(b.start)),
      upcomingMocks: studyBlocks.filter((block) => block.type === "mock" && block.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3),
      streakDays: dailyStreak(studyBlocks, today)
    };
  }, [studyBlocks, topics]);

  const subjectName = (subjectId?: string) => subjects.find((subject) => subject.id === subjectId)?.name ?? "Mixed";

  return (
    <div className="grid">
      <div className="grid three">
        <section className="panel metric">
          <span>Syllabus completion</span>
          <strong>{dashboard.completionPercent}%</strong>
          <div className="progress"><span style={{ width: `${dashboard.completionPercent}%` }} /></div>
        </section>
        <section className="panel metric">
          <span>Due revisions</span>
          <strong>{dashboard.dueRevisions.length}</strong>
          <span>Sorted by oldest next revision date</span>
        </section>
        <section className="panel metric">
          <span>Execution streak</span>
          <strong>{dashboard.streakDays}</strong>
          <span>Completed study days</span>
        </section>
      </div>

      <div className="grid two">
        <section className="panel">
          <div className="panel-header">
            <h3>Today’s Study Blocks</h3>
            <Clock3 size={18} />
          </div>
          <div className="list">
            {dashboard.todayBlocks.map((block) => (
              <div className="row" key={block.id}>
                <div className="row-title">
                  <span className="dot" />
                  <div>
                    <strong>{block.title}</strong>
                    <div className="muted">{block.start}-{block.end} · {subjectName(block.subjectId)} · {block.energy}</div>
                  </div>
                </div>
                <button className={block.completed ? "primary-button" : "ghost-button"} onClick={() => toggleStudyBlock(block.id)}>
                  <CheckCircle2 size={16} /> {block.completed ? "Done" : "Mark"}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h3>Weak Topics</h3>
            <Flame size={18} />
          </div>
          <div className="list">
            {dashboard.weakTopics.map((topic) => (
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

      <div className="grid two">
        <section className="panel">
          <div className="panel-header">
            <h3>Revision Queue</h3>
            <TimerReset size={18} />
          </div>
          <div className="list">
            {dashboard.dueRevisions.slice(0, 6).map((topic) => (
              <div className="row" key={topic.id}>
                <div className="row-title">
                  <span className="dot" style={{ background: subjects.find((subject) => subject.id === topic.subjectId)?.color }} />
                  <div>
                    <strong>Revise {topic.name} #{topic.revisionCount + 1}</strong>
                    <div className="muted">Due {formatShortDate(topic.nextRevisionOn)} · {subjectName(topic.subjectId)}</div>
                  </div>
                </div>
                <span className="pill">{topic.confidence}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <div className="panel-header">
            <h3>Upcoming Mocks</h3>
          </div>
          <div className="list">
            {dashboard.upcomingMocks.map((mock) => (
              <div className="row" key={mock.id}>
                <div>
                  <strong>{mock.title}</strong>
                  <div className="muted">{formatShortDate(mock.date)} · {mock.start}-{mock.end}</div>
                </div>
                <span className="pill good">Planned</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
