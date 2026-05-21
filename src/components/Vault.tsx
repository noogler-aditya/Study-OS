import { ArrowUpDown, Clipboard, Copy, FileText, Image, Maximize2, Search, Trash2, UploadCloud, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { todayIso } from "../lib/date";
import { useStudyStore } from "../stores/studyStore";
import type { VaultNoteType } from "../types";
import { CustomSelect } from "./CustomSelect";

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

  // Attachment state
  const [attachment, setAttachment] = useState<{ name: string; type: string; size: string; dataUrl: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pipeline Filter Tabs
  const [activePipeline, setActivePipeline] = useState<"all" | "formula" | "mistake" | "insight" | "attachments">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "alpha">("newest");

  // Visual Interactive Lightbox
  const [activeLightbox, setActiveLightbox] = useState<{ src: string; caption: string } | null>(null);

  // Clipboard Copied Notifications state
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  const subjectOptions = useMemo(() => {
    return subjects.map((sub) => ({ value: sub.id, label: sub.name }));
  }, [subjects]);

  // Handle local Base64 file conversions
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("Local-first storage limit: Please upload images or files under 15MB to optimize database files.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const sizeStr = (file.size / (1024 * 1024)).toFixed(2) + " MB";
      const formattedSize = file.size > 1024 * 1024 ? sizeStr : (file.size / 1024).toFixed(0) + " KB";
      
      setAttachment({
        name: file.name,
        type: file.type,
        size: formattedSize,
        dataUrl: reader.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Pipeline Search, Filter and Sort
  const filteredAndSorted = useMemo(() => {
    let result = notes;

    // 1. Search Query
    const normalized = query.trim().toLowerCase();
    if (normalized) {
      result = result.filter((note) => 
        `${note.title} ${note.body} ${note.type}`.toLowerCase().includes(normalized)
      );
    }

    // 2. Active Pipeline tabs
    if (activePipeline !== "all") {
      if (activePipeline === "attachments") {
        result = result.filter((note) => !!note.attachment);
      } else {
        result = result.filter((note) => note.type === activePipeline);
      }
    }

    // 3. Sorting rules
    return [...result].sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortOrder === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });
  }, [notes, query, activePipeline, sortOrder]);

  // Copy Note Text to Clipboard
  const handleCopyNote = (noteId: string, contentText: string) => {
    void navigator.clipboard.writeText(contentText).then(() => {
      setCopiedNoteId(noteId);
      setTimeout(() => setCopiedNoteId(null), 2000);
    });
  };

  return (
    <div className="grid two">
      {/* Left Column: Search & Pipeline Cards */}
      <section className="panel" style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: "600px" }}>
        <div className="panel-header" style={{ marginBottom: 12 }}>
          <h3>Knowledge Resources</h3>
          <Search size={18} />
        </div>
        
        {/* Search Input */}
        <input 
          value={query} 
          onChange={(event) => setQuery(event.target.value)} 
          placeholder="Search formulas, mistakes, forgotten concepts..." 
          style={{ marginBottom: 16 }}
        />

        {/* Pipeline Filter Bar */}
        <div className="pipeline-filters-bar">
          <button 
            className={`pipeline-filter-pill ${activePipeline === "all" ? "active" : ""}`}
            onClick={() => setActivePipeline("all")}
          >
            All
          </button>
          <button 
            className={`pipeline-filter-pill ${activePipeline === "formula" ? "active" : ""}`}
            onClick={() => setActivePipeline("formula")}
          >
            Formulas
          </button>
          <button 
            className={`pipeline-filter-pill ${activePipeline === "mistake" ? "active" : ""}`}
            onClick={() => setActivePipeline("mistake")}
          >
            Mistakes
          </button>
          <button 
            className={`pipeline-filter-pill ${activePipeline === "insight" ? "active" : ""}`}
            onClick={() => setActivePipeline("insight")}
          >
            Insights
          </button>
          <button 
            className={`pipeline-filter-pill ${activePipeline === "attachments" ? "active" : ""}`}
            onClick={() => setActivePipeline("attachments")}
          >
            Attachments
          </button>

          {/* Sort Control */}
          <div className="pipeline-controls">
            <ArrowUpDown size={13} style={{ color: "#657169" }} />
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest" | "alpha")}
              className="pipeline-sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alpha">A-Z Title</option>
            </select>
          </div>
        </div>

        {/* Dynamic Resource Cards Grid */}
        <div style={{ flexGrow: 1, overflowY: "auto", maxHeight: "480px", paddingRight: "4px" }}>
          {filteredAndSorted.length === 0 ? (
            <div className="empty">
              {query || activePipeline !== "all" 
                ? "No matching notes found inside this filter." 
                : "No resource notes compiled yet."
              }
            </div>
          ) : (
            <div className="resources-grid">
              {filteredAndSorted.map((note) => {
                const subject = subjects.find((s) => s.id === note.subjectId);
                const isImage = note.attachment?.type.startsWith("image/");
                
                return (
                  <div className="resource-card" key={note.id}>
                    {/* Copy Alert Toast notification */}
                    <div className={`copy-feedback-toast ${copiedNoteId === note.id ? "show" : ""}`}>
                      Copied!
                    </div>

                    <div className="resource-card-header">
                      <div className="resource-card-meta">
                        {subject && (
                          <span 
                            className="subject-tag" 
                            style={{ 
                              color: subject.color, 
                              backgroundColor: `${subject.color}15`,
                              border: `1px solid ${subject.color}25`
                            }}
                          >
                            {subject.name}
                          </span>
                        )}
                        <span className="type-badge">{note.type.replace("-", " ")}</span>
                      </div>
                    </div>

                    <h4 className="resource-card-title">{note.title}</h4>
                    <p className="resource-card-body">{note.body}</p>

                    {/* Render local Base64 Attachment Preview block */}
                    {note.attachment && (
                      isImage ? (
                        <div 
                          className="attachment-preview-container"
                          onClick={() => setActiveLightbox({ src: note.attachment!.dataUrl, caption: note.title })}
                          title="Click to view full resolution"
                        >
                          <img src={note.attachment.dataUrl} alt={note.attachment.name} />
                          <div className="attachment-preview-overlay">
                            <Maximize2 size={16} />
                          </div>
                        </div>
                      ) : (
                        <a 
                          href={note.attachment.dataUrl} 
                          download={note.attachment.name}
                          className="file-attachment-badge"
                          title="Click to download local attachment"
                        >
                          <FileText size={16} style={{ color: "#17654f", flexShrink: 0 }} />
                          <div className="file-attachment-info">
                            <span className="file-attachment-name">{note.attachment.name}</span>
                            <span className="file-attachment-size">{note.attachment.size}</span>
                          </div>
                        </a>
                      )
                    )}

                    {/* Interactive Action buttons */}
                    <div className="resource-card-actions">
                      <button 
                        className="icon-button"
                        title="Copy note text to clipboard"
                        onClick={() => handleCopyNote(note.id, `${note.title}\n\n${note.body}`)}
                      >
                        <Copy size={13} />
                      </button>
                      <button 
                        className="icon-button"
                        title="Delete resource note"
                        onClick={() => deleteVaultNote(note.id)}
                        style={{ color: "#b91c1c" }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Right Column: Capture Note Form */}
      <section className="panel" style={{ height: "fit-content" }}>
        <div className="panel-header" style={{ marginBottom: 12 }}>
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
              attachment: attachment || undefined,
              createdAt: now,
              updatedAt: now
            });
            
            setTitle("");
            setBody("");
            removeAttachment();
          }}
        >
          {/* Note Title */}
          <input 
            value={title} 
            onChange={(event) => setTitle(event.target.value)} 
            placeholder="Mistake pattern, insight, or formula name" 
            required
          />

          {/* Select Type and Subject dropdown row */}
          <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <CustomSelect 
              value={type} 
              onChange={(value) => setType(value as VaultNoteType)} 
              options={noteTypes.map(t => ({ value: t, label: t.replace("-", " ") }))} 
            />
            <CustomSelect 
              value={subjectId} 
              onChange={setSubjectId} 
              options={subjectOptions} 
            />
          </div>

          {/* Note Body Textarea */}
          <textarea 
            value={body} 
            onChange={(event) => setBody(event.target.value)} 
            placeholder="Document detailed formula parameters, mistakes, or insights here." 
            required
            style={{ minHeight: "120px" }}
          />

          {/* File & Image Upload Area */}
          <div style={{ marginTop: 4, marginBottom: 12 }}>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              accept="image/*,.pdf,.txt,.docx,.zip"
              style={{ display: "none" }}
            />
            
            {!attachment ? (
              <div 
                className="upload-dashed-card"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud size={24} />
                <span className="upload-dashed-text">Upload image or document sheet</span>
                <span className="upload-dashed-subtext">Supports PNG, JPG, PDF, TXT, DOCX, ZIP (Max 15MB)</span>
              </div>
            ) : (
              <div className="upload-active-preview">
                {attachment.type.startsWith("image/") ? (
                  <img src={attachment.dataUrl} className="upload-active-thumbnail" alt="thumbnail" />
                ) : (
                  <div style={{ width: 44, height: 44, borderRadius: 4, backgroundColor: "#f0ede6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <FileText size={18} style={{ color: "#657169", margin: "auto" }} />
                  </div>
                )}
                <div className="upload-active-info">
                  <span className="upload-active-name">{attachment.name}</span>
                  <span className="upload-active-size">{attachment.size}</span>
                </div>
                <button 
                  type="button"
                  className="icon-button"
                  onClick={removeAttachment}
                  style={{ color: "#b91c1c", backgroundColor: "transparent" }}
                  title="Remove uploaded attachment"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <button className="primary-button" type="submit" style={{ width: "100%" }}>Save Note</button>
        </form>
      </section>

      {/* Premium Fullscreen Glassmorphic Lightbox Overlay */}
      {activeLightbox && (
        <div className="lightbox-overlay" onClick={() => setActiveLightbox(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="lightbox-close-btn" 
              onClick={() => setActiveLightbox(null)}
              title="Close image overlay"
            >
              <X size={16} />
            </button>
            <img src={activeLightbox.src} className="lightbox-img" alt={activeLightbox.caption} />
            <div className="lightbox-caption">{activeLightbox.caption}</div>
          </div>
        </div>
      )}
    </div>
  );
}
