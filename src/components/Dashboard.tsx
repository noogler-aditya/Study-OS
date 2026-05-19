import { CalendarClock, CheckCircle2, Clock3, Flame } from "lucide-react";
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
      upcomingBlocks: studyBlocks.filter((block) => block.date > today && !block.completed).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5),
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
          <span>Topics needing revision today</span>
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
            <h3>Today's Study Blocks</h3>
            <Clock3 size={18} />
          </div>
          <div className="list">
            {dashboard.todayBlocks.length === 0 ? (
              <div className="empty">No blocks scheduled for today.</div>
            ) : dashboard.todayBlocks.map((block) => (
              <div className="row" key={block.id}>
                <div className="row-title">
                  <span className="dot" style={{ background: subjects.find((s) => s.id === block.subjectId)?.color }} />
                  <div>
                    <strong>{block.title}</strong>
                    <div className="muted">{block.start}–{block.end} · {subjectName(block.subjectId)} · {block.type}</div>
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

      <section className="panel">
        <div className="panel-header">
          <h3>Upcoming Blocks</h3>
          <CalendarClock size={18} />
        </div>
        <div className="list">
          {dashboard.upcomingBlocks.length === 0 ? (
            <div className="empty">No upcoming blocks scheduled.</div>
          ) : dashboard.upcomingBlocks.map((block) => (
            <div className="row" key={block.id}>
              <div>
                <strong>{block.title}</strong>
                <div className="muted">{formatShortDate(block.date)} · {block.start}–{block.end} · {block.type}</div>
              </div>
              <span className="pill">{block.type}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

