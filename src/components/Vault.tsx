import { Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { todayIso } from "../lib/date";
import { useStudyStore } from "../stores/studyStore";
import type { VaultNoteType } from "../types";

const noteTypes: VaultNoteType[] = ["formula", "mistake", "insight", "revision-summary", "forgotten-concept"];

export function Vault() {
  const notes = useStudyStore((state) => state.vaultNotes);
  const subjects = useStudyStore((state) => state.subjects);
  const addVaultNote = useStudyStore((state) => state.addVaultNote);
  const deleteVaultNote = useStudyStore((state) => state.deleteVaultNote);
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<VaultNoteType>("mistake");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return notes;
    return notes.filter((note) => `${note.title} ${note.body} ${note.type}`.toLowerCase().includes(normalized));
  }, [notes, query]);

  return (
    <div className="grid two">
      <section className="panel">
        <div className="panel-header">
          <h3>Knowledge Vault</h3>
          <Search size={18} />
        </div>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search formulas, mistakes, forgotten concepts" />
        <div className="list" style={{ marginTop: 12 }}>
          {filtered.length === 0 ? (
            <div className="empty">{query ? "No matching notes." : "No vault notes yet."}</div>
          ) : filtered.map((note) => (
            <div className="row" key={note.id}>
              <div>
                <strong>{note.title}</strong>
                <div className="muted">{note.body}</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span className="pill">{note.type}</span>
                <button
                  className="icon-button"
                  title="Delete note"
                  onClick={() => deleteVaultNote(note.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="panel">
        <div className="panel-header">
          <h3>Capture Note</h3>
        </div>
        <form
          className="form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!title.trim() || !body.trim()) return;
            const now = todayIso();
            addVaultNote({
              id: crypto.randomUUID(),
              type,
              title,
              body,
              subjectId,
              createdAt: now,
              updatedAt: now
            });
            setTitle("");
            setBody("");
          }}
        >
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Mistake pattern or formula name" />
          <div className="form-row">
            <select value={type} onChange={(event) => setType(event.target.value as VaultNoteType)}>
              {noteTypes.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select value={subjectId} onChange={(event) => setSubjectId(event.target.value)}>
              {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
            </select>
          </div>
          <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Keep it short enough to revise fast." />
          <button className="primary-button" type="submit">Save Note</button>
        </form>
      </section>
    </div>
  );
}
