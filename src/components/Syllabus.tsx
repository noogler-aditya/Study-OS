import { ArrowLeft, BookOpen, Calculator, Code2, Cpu, Database } from "lucide-react";
import { useState } from "react";
import { revisionHealth } from "../lib/analytics";
import { useStudyStore } from "../stores/studyStore";
import type { TopicStatus } from "../types";
import { CustomSelect } from "./CustomSelect";

const statuses: TopicStatus[] = ["not-started", "learning", "completed", "revising"];

const clusters = [
  {
    id: "cluster-a",
    name: "Cluster A — Mathematical Foundation",
    subtitle: "Highest ROI. These subjects improve almost every other subject.",
    subjectIds: ["sub-discrete-math", "sub-eng-math", "sub-aptitude"],
    icon: Calculator,
    color: "#4f46e5"
  },
  {
    id: "cluster-b",
    name: "Cluster B — Logic + Machines",
    subtitle: "Hardware and low-level logic. These subjects are interconnected.",
    subjectIds: ["sub-digital", "sub-coa", "sub-os"],
    icon: Cpu,
    color: "#d97706"
  },
  {
    id: "cluster-c",
    name: "Cluster C — Abstract Computation",
    subtitle: "Theoretical computer science and translation.",
    subjectIds: ["sub-toc", "sub-compiler"],
    icon: Code2,
    color: "#7c3aed"
  },
  {
    id: "cluster-d",
    name: "Cluster D — Software/System Subjects",
    subtitle: "Core software engineering and systems.",
    subjectIds: ["sub-pds", "sub-algo", "sub-dbms", "sub-networks"],
    icon: Database,
    color: "#0f9f8f"
  }
];

export function Syllabus() {
  const subjects = useStudyStore((state) => state.subjects);
  const chapters = useStudyStore((state) => state.chapters);
  const topics = useStudyStore((state) => state.topics);
  const updateTopic = useStudyStore((state) => state.updateTopic);

  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);
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
                  <CustomSelect
                    className="status-select"
                    value={topic.status}
                    onChange={(value) => updateTopic(topic.id, { status: value as TopicStatus })}
                    options={statuses}
                  />
                </div>
              ))}
            </div>
          ))}
        </section>
      </div>
    );
  }

  if (selectedClusterId) {
    const cluster = clusters.find((c) => c.id === selectedClusterId);
    if (!cluster) return null;
    const clusterSubjects = subjects.filter((s) => cluster.subjectIds.includes(s.id));

    return (
      <div>
        <button className="ghost-button" onClick={() => setSelectedClusterId(null)} style={{ marginBottom: 16 }}>
          <ArrowLeft size={16} /> Back to Clusters
        </button>
        <div className="subject-cards">
          {clusterSubjects.map((subject) => {
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
      </div>
    );
  }

  return (
    <div className="subject-cards">
      {clusters.map((cluster) => {
        const clusterTopics = topics.filter((t) => cluster.subjectIds.includes(t.subjectId));
        const completed = clusterTopics.filter((topic) => ["completed", "revising", "mastered"].includes(topic.status)).length;
        const completion = clusterTopics.length ? Math.round((completed / clusterTopics.length) * 100) : 0;
        const Icon = cluster.icon;
        
        return (
          <div className="subject-card panel" key={cluster.id} onClick={() => setSelectedClusterId(cluster.id)}>
            <div className="subject-card-icon" style={{ backgroundColor: `${cluster.color}15`, color: cluster.color }}>
              <Icon size={24} />
            </div>
            <div className="subject-card-content">
              <h3>{cluster.name}</h3>
              <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>{cluster.subtitle}</p>
            </div>
            <div className="subject-card-footer">
              <div className="progress-info">
                <span>Overall Completion</span>
                <span>{completion}%</span>
              </div>
              <div className="progress"><span style={{ width: `${completion}%`, background: cluster.color }} /></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
