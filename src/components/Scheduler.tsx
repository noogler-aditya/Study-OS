import { CalendarPlus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { todayIso } from "../lib/date";
import { useStudyStore } from "../stores/studyStore";
import type { StudyBlockType } from "../types";

const blockTypes: StudyBlockType[] = ["learn", "revise", "pyq", "mock", "analysis", "backlog"];

export function Scheduler() {
  const studyBlocks = useStudyStore((state) => state.studyBlocks);
  const subjects = useStudyStore((state) => state.subjects);
  const upsertStudyBlock = useStudyStore((state) => state.upsertStudyBlock);
  const updateStudyBlock = useStudyStore((state) => state.updateStudyBlock);
  const toggleStudyBlock = useStudyStore((state) => state.toggleStudyBlock);
  const deleteStudyBlock = useStudyStore((state) => state.deleteStudyBlock);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayIso());
  const [start, setStart] = useState("06:30");
  const [end, setEnd] = useState("08:00");
  const [type, setType] = useState<StudyBlockType>("learn");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");

  // Track which block is being edited inline
  const [editingId, setEditingId] = useState<string | null>(null);

  const sorted = [...studyBlocks].sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`));

  return (
    <div className="grid two">
      <section className="panel">
        <div className="panel-header">
          <h3>Create Study Block</h3>
          <CalendarPlus size={18} />
        </div>
        <form
          className="form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!title.trim()) return;
            upsertStudyBlock({
              id: crypto.randomUUID(),
              date,
              start,
              end,
              type,
              energy: "normal",
              subjectId,
              title,
              completed: false
            });
            setTitle("");
          }}
        >
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Revise Control Systems revision #3" />
          <div className="form-row">
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            <select value={subjectId} onChange={(event) => setSubjectId(event.target.value)}>
              {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
            </select>
          </div>
          <div className="form-row">
            <input type="time" value={start} onChange={(event) => setStart(event.target.value)} />
            <input type="time" value={end} onChange={(event) => setEnd(event.target.value)} />
          </div>
          <select value={type} onChange={(event) => setType(event.target.value as StudyBlockType)}>
            {blockTypes.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <button className="primary-button" type="submit">Add Block</button>
        </form>
      </section>
      <section className="panel">
        <div className="panel-header">
          <h3>Planned Blocks</h3>
          <span className="pill">{studyBlocks.length} total</span>
        </div>
        <div className="list">
          {sorted.length === 0 ? (
            <div className="empty">No blocks planned yet.</div>
          ) : sorted.map((block) => (
            <PlannedBlock
              key={block.id}
              block={block}
              isEditing={editingId === block.id}
              onEdit={() => setEditingId(editingId === block.id ? null : block.id)}
              onUpdate={(patch) => {
                updateStudyBlock(block.id, patch);
                setEditingId(null);
              }}
              onToggle={() => toggleStudyBlock(block.id)}
              onDelete={() => deleteStudyBlock(block.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function PlannedBlock({ block, isEditing, onEdit, onUpdate, onToggle, onDelete }: {
  block: { id: string; date: string; start: string; end: string; type: string; title: string; completed: boolean };
  isEditing: boolean;
  onEdit: () => void;
  onUpdate: (patch: { date?: string; start?: string; end?: string }) => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [editDate, setEditDate] = useState(block.date);
  const [editStart, setEditStart] = useState(block.start);
  const [editEnd, setEditEnd] = useState(block.end);

  return (
    <div className="row" style={{ flexDirection: "column", alignItems: "stretch", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <strong>{block.title}</strong>
          <div className="muted">{block.date} · {block.start}–{block.end} · {block.type}</div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button
            className={block.completed ? "pill good" : "pill"}
            style={{ cursor: "pointer", border: "none" }}
            onClick={onToggle}
            title={block.completed ? "Mark incomplete" : "Mark done"}
          >
            {block.completed ? "done" : "planned"}
          </button>
          <button className="icon-button" title="Edit date & time" onClick={onEdit}>
            <Pencil size={14} />
          </button>
          <button className="icon-button" title="Delete block" onClick={onDelete}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {isEditing && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", paddingTop: 4, borderTop: "1px dashed #e2dccf" }}>
          <input
            type="date"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
            style={{ flex: 1 }}
          />
          <input
            type="time"
            value={editStart}
            onChange={(e) => setEditStart(e.target.value)}
            style={{ width: 100 }}
          />
          <input
            type="time"
            value={editEnd}
            onChange={(e) => setEditEnd(e.target.value)}
            style={{ width: 100 }}
          />
          <button
            className="primary-button"
            style={{ padding: "6px 12px", fontSize: 13 }}
            onClick={() => onUpdate({ date: editDate, start: editStart, end: editEnd })}
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}
