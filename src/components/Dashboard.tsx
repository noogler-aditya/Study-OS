import { Check, ChevronLeft, ChevronRight, Flame, Lock, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import { todayIso, getStreak } from "../lib/date";
import { useStudyStore } from "../stores/studyStore";

export function Dashboard() {
  const completedDates = useStudyStore((state) => state.completedDates || []);
  const todayTasksCompleted = useStudyStore((state) => state.todayTasksCompleted || []);
  const toggleTask = useStudyStore((state) => state.toggleTask);

  const [viewedDate, setViewedDate] = useState(() => new Date());

  const handlePrevMonth = () => {
    setViewedDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() - 1);
      return next;
    });
  };

  const handleNextMonth = () => {
    setViewedDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
  };

  const studyTasks = useMemo(() => [
    { id: "discrete-math", name: "Discrete Mathematics", duration: "2.5 hrs", badge: "Math" },
    { id: "pds", name: "Programming + Data Structure", duration: "1.5 hrs", badge: "Core" },
    { id: "digital", name: "Digital Logic", duration: "2.0 hrs", badge: "Core" },
    { id: "os", name: "Operating System (OS)", duration: "45 min", badge: "System" },
    { id: "dbms", name: "DBMS", duration: "45 min", badge: "System" },
    { id: "aptitude", name: "General Aptitude", duration: "1.5 hrs (12 questions)", badge: "Aptitude" }
  ], []);

  const completedCount = useMemo(() => {
    return studyTasks.filter(task => todayTasksCompleted.includes(task.id)).length;
  }, [todayTasksCompleted, studyTasks]);

  const allCompleted = completedCount === studyTasks.length;

  // Streak calculation
  const streakCount = useMemo(() => getStreak(completedDates), [completedDates]);

  // GATE Prep Timeline gauge calculation (May 18 to July 18)
  const timelineData = useMemo(() => {
    const today = todayIso();
    const [tYear, tMonth, tDay] = today.split("-").map(Number);
    const todayUtc = Date.UTC(tYear, tMonth - 1, tDay);

    const startUtc = Date.UTC(2026, 4, 18); // May 18, 2026
    const endUtc = Date.UTC(2026, 6, 18);   // July 18, 2026

    const oneDay = 24 * 60 * 60 * 1000;
    const totalDays = 61; // May 18 to July 18 is 61 days inclusive
    let elapsedDays = Math.floor((todayUtc - startUtc) / oneDay) + 1;

    if (elapsedDays < 1) elapsedDays = 1;
    if (elapsedDays > totalDays) elapsedDays = totalDays;

    const progressPercent = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));

    return {
      elapsedDays,
      totalDays,
      progressPercent
    };
  }, []);

  // Calendar parameters for the viewed month
  const calendarInfo = useMemo(() => {
    const today = todayIso();
    const year = viewedDate.getFullYear();
    const month = viewedDate.getMonth();
    const currentMonthName = viewedDate.toLocaleString("default", { month: "long" }).toUpperCase();

    const firstDayDate = new Date(year, month, 1);
    const firstDayIndex = firstDayDate.getDay();
    const mondayBasedStartDay = (firstDayIndex + 6) % 7;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const headers = ["M", "T", "W", "T", "F", "S", "S"];

    const cells: Array<{ isEmpty: boolean; dayNum?: number; dateStr?: string; key: string }> = [];

    // Empty pre-padding cells
    for (let i = 0; i < mondayBasedStartDay; i++) {
      cells.push({ isEmpty: true, key: `empty-${i}` });
    }

    // Actual day cells
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = (month + 1).toString().padStart(2, '0');
      const dayStr = d.toString().padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;

      cells.push({
        isEmpty: false,
        dayNum: d,
        dateStr,
        key: dateStr
      });
    }

    return {
      currentMonthName,
      year,
      headers,
      cells,
      today
    };
  }, [completedDates, viewedDate]);

  return (
    <div className="dashboard-grid">
      {/* Left Column: Core Preparation Hub */}
      <div className="dashboard-left">
        {/* Premium Header Greeting */}
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#17201b", margin: "0 0 6px 0" }}>
            Welcome back, Scholar!
          </h1>
          <p style={{ fontSize: "14px", color: "#657169", margin: 0, fontWeight: 500 }}>
            {new Intl.DateTimeFormat("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric"
            }).format(new Date())}
            {" · "}
            <span style={{ fontStyle: "italic", color: "#1f6f5a" }}>
              "Success in GATE demands consistency, precision, and relentless focus."
            </span>
          </p>
        </div>

        {/* GATE Prep Timeline gauge */}
        <div className="timeline-card">
          <div className="timeline-info">
            <h4>GATE Intensive Preparation Phase</h4>
            <span>Day {timelineData.elapsedDays} of {timelineData.totalDays}</span>
          </div>
          <div className="timeline-bar">
            <div className="timeline-fill" style={{ width: `${timelineData.progressPercent}%` }} />
          </div>
          <p style={{ fontSize: "11px", color: "#8a948c", margin: "8px 0 0 0", textAlign: "right", fontWeight: 600 }}>
            May 18 to July 18 Window ({Math.round(timelineData.progressPercent)}% Elapsed)
          </p>
        </div>

        {/* Today's Learning Checklist */}
        <div className="checklist-card">
          <div className="checklist-header">
            <h3>Today's Learning Schedule</h3>
            <span>{completedCount} / 6 Completed</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {studyTasks.map((task) => {
              const isChecked = todayTasksCompleted.includes(task.id);
              return (
                <div
                  key={task.id}
                  className={`checklist-item${isChecked ? " completed" : ""}`}
                  onClick={() => toggleTask(task.id)}
                >
                  <div className="checklist-left">
                    <div className="custom-checkbox">
                      <Check size={14} />
                    </div>
                    <div className="task-info">
                      <span className="task-name">{task.name}</span>
                      <span className="task-duration">{task.duration}</span>
                    </div>
                  </div>
                  <span className="checklist-badge">{task.badge}</span>
                </div>
              );
            })}
          </div>

          {/* Checklist Lock Banner */}
          {allCompleted ? (
            <div className="lock-banner locked">
              <Trophy size={16} />
              <span>Amazing work! You've locked your daily green streak today. Keep it up!</span>
            </div>
          ) : (
            <div className="lock-banner active">
              <Lock size={16} />
              <span>Session active (10:00 AM - 06:00 PM). Complete all items to lock your daily green streak!</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Integrated Calendar & Streak Widget */}
      <div className="dashboard-right">
        <div className="calendar-card">
          <div className="calendar-card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button 
                onClick={handlePrevMonth} 
                className="calendar-nav-btn"
                title="Previous Month"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="calendar-title">
                {calendarInfo.currentMonthName} {calendarInfo.year}
              </span>
              <button 
                onClick={handleNextMonth} 
                className="calendar-nav-btn"
                title="Next Month"
              >
                <ChevronRight size={14} />
              </button>
            </div>
            <div className="calendar-streak" title="Your consecutive daily study streak">
              <span className="calendar-streak-flame">
                <Flame size={13} fill="#ff512f" color="#ff512f" />
              </span>
              <span>{streakCount} {streakCount === 1 ? "Day" : "Days"}</span>
            </div>
          </div>
          <div className="calendar-grid">
            {calendarInfo.headers.map((h, i) => (
              <div className="calendar-header-day" key={i}>{h}</div>
            ))}
            {calendarInfo.cells.map((cell) => {
              if (cell.isEmpty) {
                return <div className="calendar-day-cell empty" key={cell.key} />;
              }

              const isCompleted = completedDates.includes(cell.dateStr!);
              const isToday = cell.dateStr === calendarInfo.today;
              const cellClass = `calendar-day-cell${isCompleted ? " completed" : ""}${isToday ? " today" : ""}`;

              return (
                <div className={cellClass} key={cell.key} title={cell.dateStr}>
                  <div className="calendar-day-circle">
                    {cell.dayNum}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}


