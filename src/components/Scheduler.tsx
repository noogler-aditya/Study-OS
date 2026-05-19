import { CalendarPlus, Trash2 } from "lucide-react";
import { useState } from "react";
import { todayIso } from "../lib/date";
import { useStudyStore } from "../stores/studyStore";
import type { EnergyLevel, StudyBlockType } from "../types";

const blockTypes: StudyBlockType[] = ["learn", "revise", "pyq", "mock", "analysis", "backlog"];
const energyLevels: EnergyLevel[] = ["peak", "normal", "low"];

export function Scheduler() {
  const studyBlocks = useStudyStore((state) => state.studyBlocks);
  const subjects = useStudyStore((state) => state.subjects);
  const upsertStudyBlock = useStudyStore((state) => state.upsertStudyBlock);
  const deleteStudyBlock = useStudyStore((state) => state.deleteStudyBlock);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayIso());
  const [start, setStart] = useState("06:30");
  const [end, setEnd] = useState("08:00");
  const [type, setType] = useState<StudyBlockType>("learn");
  const [energy, setEnergy] = useState<EnergyLevel>("peak");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");

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
              energy,
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
          <div className="form-row">
            <select value={type} onChange={(event) => setType(event.target.value as StudyBlockType)}>
              {blockTypes.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select value={energy} onChange={(event) => setEnergy(event.target.value as EnergyLevel)}>
              {energyLevels.map((item) => <option key={item} value={item}>{item} energy</option>)}
            </select>
          </div>
          <button className="primary-button" type="submit">Add Block</button>
        </form>
      </section>
      <section className="panel">
        <div className="panel-header">
          <h3>Planned Blocks</h3>
        </div>
        <div className="list">
          {[...studyBlocks].sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`)).map((block) => (
            <div className="row" key={block.id}>
              <div>
                <strong>{block.title}</strong>
                <div className="muted">{block.date} · {block.start}–{block.end} · {block.type} · {block.energy}</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span className={block.completed ? "pill good" : "pill"}>{block.completed ? "done" : "planned"}</span>
                <button
                  className="icon-button"
                  title="Delete block"
                  onClick={() => deleteStudyBlock(block.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
