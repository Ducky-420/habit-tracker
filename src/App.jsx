import { useState, useEffect, useMemo } from "react";
import {
  Plus, Flame, Check, Trash2, X, ChevronDown, Settings, LayoutGrid,
  Dumbbell, HeartPulse, Bike, Footprints, Droplet, Sparkles, Bath, Smile,
  PenLine, Music, Palette, Camera, Moon, Sun, Wind, Brain,
  BookOpen, GraduationCap, Pencil, Languages,
} from "lucide-react";
import { useLocalStorage } from "./hooks/useLocalStorage";

const todayKey = (d = new Date()) => {
  const x = new Date(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const addDays = (key, n) => {
  const d = new Date(key + "T00:00:00");
  d.setDate(d.getDate() + n);
  return todayKey(d);
};

const CATEGORIES = [
  { key: "health", label: "Health", icons: { dumbbell: Dumbbell, heart: HeartPulse, bike: Bike, footprints: Footprints } },
  { key: "hygiene", label: "Hygiene", icons: { droplet: Droplet, sparkles: Sparkles, bath: Bath, smile: Smile } },
  { key: "creative", label: "Creative", icons: { pen: PenLine, music: Music, palette: Palette, camera: Camera } },
  { key: "mindfulness", label: "Mindfulness", icons: { moon: Moon, sun: Sun, wind: Wind, brain: Brain } },
  { key: "learning", label: "Learning", icons: { book: BookOpen, grad: GraduationCap, pencil: Pencil, lang: Languages } },
];

const ALL_ICONS = CATEGORIES.reduce((acc, c) => ({ ...acc, ...c.icons }), {});

const PALETTE = [
  { name: "gold", fill: "#F2C230", glow: "rgba(242,194,48,0.35)", dim: "#3A3320" },
  { name: "red", fill: "#F24E4E", glow: "rgba(242,78,78,0.35)", dim: "#3A2323" },
  { name: "blue", fill: "#5B7CFF", glow: "rgba(91,124,255,0.35)", dim: "#232A3A" },
  { name: "violet", fill: "#B26CF2", glow: "rgba(178,108,242,0.35)", dim: "#2E2338" },
  { name: "green", fill: "#4ED47A", glow: "rgba(78,212,122,0.35)", dim: "#20362A" },
  { name: "teal", fill: "#3ECFCB", glow: "rgba(62,207,203,0.35)", dim: "#1F3736" },
  { name: "pink", fill: "#F26CA7", glow: "rgba(242,108,167,0.35)", dim: "#3A2130" },
  { name: "orange", fill: "#F28B3C", glow: "rgba(242,139,60,0.35)", dim: "#3A2A1B" },
];

function computeStreaks(entries) {
  const dates = Object.keys(entries).filter((k) => entries[k]).sort();
  if (dates.length === 0) return { current: 0, longest: 0 };
  const set = new Set(dates);
  let longest = 1;
  let run = 1;
  for (let i = 1; i < dates.length; i++) {
    if (addDays(dates[i - 1], 1) === dates[i]) run += 1;
    else run = 1;
    longest = Math.max(longest, run);
  }
  let cursor = todayKey();
  if (!set.has(cursor)) cursor = addDays(cursor, -1);
  let current = 0;
  while (set.has(cursor)) {
    current += 1;
    cursor = addDays(cursor, -1);
  }
  return { current, longest };
}

function PixelGrid({ entries, color, rows = 6, cols = 15 }) {
  const days = rows * cols;
  const start = addDays(todayKey(), -(days - 1));
  const cells = [];
  for (let i = 0; i < days; i++) cells.push(addDays(start, i));
  const columns = [];
  for (let c = 0; c < cols; c++) columns.push(cells.slice(c * rows, c * rows + rows));

  return (
    <div className="flex gap-[4px]">
      {columns.map((col, ci) => (
        <div key={ci} className="flex flex-col gap-[4px]">
          {col.map((key, ri) => {
            const on = !!entries[key];
            return (
              <div key={ri} title={key} className="w-[12px] h-[12px] rounded-[3px] transition-all duration-300"
                style={{ background: on ? color.fill : "#1E1E23", boxShadow: on ? `0 0 6px ${color.glow}` : "none" }} />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function MiniBars({ color, current }) {
  const heights = [22, 10, 10, 10];
  return (
    <div className="flex items-end gap-[3px] h-[22px]">
      {heights.map((h, i) => (
        <div key={i} className="w-[3px] rounded-full" style={{ height: h, background: i === 0 && current > 0 ? color.fill : "#2A2A32" }} />
      ))}
    </div>
  );
}

function HabitForm({ initial, onSave, onCancel, onDelete, onBackfill, usedColors }) {
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name || "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle || "");
  const [notes, setNotes] = useState(initial?.notes || "");
  const [category, setCategory] = useState(initial?.category || CATEGORIES[0].key);
  const [iconKey, setIconKey] = useState(initial?.icon || Object.keys(CATEGORIES[0].icons)[0]);
  const availableColor = PALETTE.find((p) => !usedColors.includes(p.name)) || PALETTE[0];
  const [colorName, setColorName] = useState(initial?.color || availableColor.name);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [backfillDate, setBackfillDate] = useState(todayKey());

  const activeCategory = CATEGORIES.find((c) => c.key === category) || CATEGORIES[0];

  return (
    <div className="flex flex-col gap-3 bg-[#141417] rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white text-[13px] font-semibold uppercase tracking-wide">{isEdit ? "Edit habit" : "New habit"}</h3>
        <button onClick={onCancel} className="text-[#6B6B75] hover:text-white" aria-label="Close"><X size={16} /></button>
      </div>
      <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Habit name — e.g. Hit the gym"
        className="bg-[#0F0F13] border border-[#2A2A32] rounded-lg px-3 py-2 text-[15px] text-white placeholder:text-[#6B6B75] focus:outline-none focus:ring-2 focus:ring-white/20" />
      <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Subtitle — e.g. Workout for an hour"
        className="bg-[#0F0F13] border border-[#2A2A32] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-[#6B6B75] focus:outline-none focus:ring-2 focus:ring-white/20" />
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional) — reminders, motivation, details" rows={2}
        className="bg-[#0F0F13] border border-[#2A2A32] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-[#6B6B75] focus:outline-none focus:ring-2 focus:ring-white/20 resize-none" />
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button key={c.key} type="button" onClick={() => { setCategory(c.key); setIconKey(Object.keys(c.icons)[0]); }}
            className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium border"
            style={{ borderColor: category === c.key ? "#fff" : "#2A2A32", background: category === c.key ? "#25252C" : "transparent", color: category === c.key ? "#fff" : "#8A8A94" }}>
            {c.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        {Object.entries(activeCategory.icons).map(([key, Icon]) => (
          <button type="button" key={key} onClick={() => setIconKey(key)} className="w-9 h-9 rounded-lg flex items-center justify-center border"
            style={{ borderColor: iconKey === key ? "#fff" : "#2A2A32", background: iconKey === key ? "#25252C" : "transparent" }}>
            <Icon size={16} className="text-white" />
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {PALETTE.map((p) => (
          <button type="button" key={p.name} onClick={() => setColorName(p.name)} aria-label={p.name} className="w-6 h-6 rounded-full border-2"
            style={{ background: p.fill, borderColor: colorName === p.name ? "#fff" : "transparent" }} />
        ))}
      </div>
      {isEdit && (
        <div className="flex items-center gap-2 bg-[#0F0F13] border border-[#2A2A32] rounded-lg px-3 py-2">
          <span className="text-[12px] text-[#8A8A94] shrink-0">Log a past day:</span>
          <input type="date" value={backfillDate} max={todayKey()} onChange={(e) => setBackfillDate(e.target.value)}
            className="bg-transparent text-[13px] text-white flex-1 focus:outline-none" />
          <button type="button" onClick={() => onBackfill(initial.id, backfillDate)} className="text-[12px] font-medium text-white bg-[#25252C] px-2 py-1 rounded shrink-0">
            {initial.entries[backfillDate] ? "Unmark" : "Mark done"}
          </button>
        </div>
      )}
      <div className="flex items-center justify-between pt-1">
        <div>
          {isEdit && !confirmDelete && (
            <button type="button" onClick={() => setConfirmDelete(true)} className="text-[13px] text-[#8A8A94] hover:text-[#F24E4E] flex items-center gap-1">
              <Trash2 size={13} /> Delete
            </button>
          )}
          {isEdit && confirmDelete && (
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#F24E4E]">Delete for good?</span>
              <button type="button" onClick={() => onDelete(initial.id)} className="text-[12px] font-medium text-white bg-[#F24E4E] px-2 py-1 rounded">Yes</button>
              <button type="button" onClick={() => setConfirmDelete(false)} className="text-[12px] text-[#8A8A94]">Cancel</button>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="px-3 py-1.5 text-sm text-[#9494A0] hover:text-white">Cancel</button>
          <button type="button" onClick={() => { if (!name.trim()) return; onSave({ name: name.trim(), subtitle: subtitle.trim(), notes: notes.trim(), category, icon: iconKey, color: colorName }); }}
            className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white text-black hover:bg-[#E4E4E4]">
            {isEdit ? "Save" : "Add habit"}
          </button>
        </div>
      </div>
    </div>
  );
}

function HabitCard({ habit, onToggleToday, onOpenEdit, collapsed, onToggleCollapse }) {
  const color = PALETTE.find((p) => p.name === habit.color) || PALETTE[0];
  const Icon = ALL_ICONS[habit.icon] || Dumbbell;
  const { current } = useMemo(() => computeStreaks(habit.entries), [habit.entries]);
  const doneToday = !!habit.entries[todayKey()];

  return (
    <div className="relative bg-[#141417] rounded-2xl p-4 overflow-hidden transition-all duration-300">
      <div className={`flex items-center justify-between transition-all duration-300 ${collapsed ? "" : "mb-3"}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: color.dim }}>
            <Icon size={15} style={{ color: color.fill }} />
          </div>
          <button onClick={() => onOpenEdit(habit)} className="min-w-0 text-left">
            <h3 className="text-white text-[13px] font-semibold tracking-wide uppercase truncate">{habit.name}</h3>
          </button>
          <button onClick={() => onToggleCollapse(habit.id)} className="w-6 h-6 rounded-full bg-[#25252C] flex items-center justify-center shrink-0" aria-label={collapsed ? "Expand" : "Collapse"}>
            <ChevronDown size={13} className="text-white transition-transform duration-300" style={{ transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)" }} />
          </button>
        </div>
        {collapsed && <MiniBars color={color} current={current} />}
        <button onClick={() => onToggleToday(habit.id)} className="relative shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90"
          style={{ background: doneToday ? color.fill : "#0F0F13", border: `1.5px solid ${doneToday ? color.fill : "#2A2A32"}`, transform: doneToday ? "scale(1.05)" : "scale(1)" }}
          aria-label="Mark today">
          <Check size={16} color={doneToday ? "#0F0F13" : "#4A4A54"} className="transition-transform duration-200" />
        </button>
      </div>
      {!collapsed && (
        <>
          <PixelGrid entries={habit.entries} color={color} />
          {habit.notes && <p className="text-[11px] text-[#6B6B75] mt-2 italic line-clamp-2">{habit.notes}</p>}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1 text-[12px] font-medium" style={{ color: color.fill }}>
              <Flame size={13} />
              {current} {current === 1 ? "day" : "days"}
            </div>
            <button onClick={() => onOpenEdit(habit)} className="px-3 py-1 rounded-full bg-[#25252C] text-[12px] font-medium text-white">Edit</button>
          </div>
        </>
      )}
    </div>
  );
}

const STORAGE_KEY = "habits-v3";

export default function HabitTracker() {
  const [habits, setHabits, storageError] = useLocalStorage(STORAGE_KEY, []);
  const [reminderTime, setReminderTime] = useLocalStorage("reminder-time", "");
  const [showAdd, setShowAdd] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [collapsedIds, setCollapsedIds] = useState(new Set());
  const [showSettings, setShowSettings] = useState(false);

  const allCollapsed = habits.length > 0 && habits.every((h) => collapsedIds.has(h.id));

  const toggleCollapseAll = () => {
    setCollapsedIds(allCollapsed ? new Set() : new Set(habits.map((h) => h.id)));
  };

  const toggleCollapse = (id) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    if (!reminderTime || typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;
    let timeoutId;
    const scheduleNext = () => {
      const [h, m] = reminderTime.split(":").map(Number);
      const now = new Date();
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
      if (next <= now) next.setDate(next.getDate() + 1);
      const ms = next.getTime() - now.getTime();
      timeoutId = setTimeout(() => {
        const undone = habits.filter((hb) => !hb.entries[todayKey()]);
        if (undone.length > 0) {
          new Notification("Habit reminder", { body: `${undone.length} habit${undone.length === 1 ? "" : "s"} still waiting today.` });
        }
        scheduleNext();
      }, ms);
    };
    scheduleNext();
    return () => clearTimeout(timeoutId);
  }, [reminderTime, habits]);

  const enableReminders = async () => {
    if (typeof Notification === "undefined") return;
    const perm = await Notification.requestPermission();
    if (perm === "granted" && !reminderTime) setReminderTime("09:00");
  };

  const addHabit = (data) => { setHabits([...habits, { id: crypto.randomUUID(), ...data, entries: {} }]); setShowAdd(false); };
  const updateHabit = (data) => { setHabits(habits.map((h) => (h.id === editingHabit.id ? { ...h, ...data } : h))); setEditingHabit(null); };
  const deleteHabit = (id) => { setHabits(habits.filter((h) => h.id !== id)); setEditingHabit(null); };

  const backfillEntry = (id, dateKey) => {
    const next = habits.map((h) => {
      if (h.id !== id) return h;
      const entries = { ...h.entries };
      if (entries[dateKey]) delete entries[dateKey];
      else entries[dateKey] = true;
      return { ...h, entries };
    });
    setHabits(next);
    const updated = next.find((h) => h.id === id);
    if (updated) setEditingHabit(updated);
  };

  const toggleToday = (id) => {
    const key = todayKey();
    const next = habits.map((h) => (h.id === id ? { ...h, entries: { ...h.entries, [key]: !h.entries[key] || undefined } } : h));
    next.forEach((h) => { Object.keys(h.entries).forEach((k) => { if (!h.entries[k]) delete h.entries[k]; }); });
    setHabits(next);
  };

  const usedColors = habits.map((h) => h.color);

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-md mx-auto px-4 pt-8 pb-28">
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1 text-[13px] font-semibold text-[#B4B4C0]">Habits <ChevronDown size={13} /></div>
            <div className="flex items-center gap-1 bg-[#141417] rounded-full p-1">
              <button onClick={toggleCollapseAll} className="w-8 h-8 rounded-full flex items-center justify-center text-[#B4B4C0] hover:text-white transition-colors" aria-label={allCollapsed ? "Expand all" : "Collapse all"}>
                <LayoutGrid size={15} />
              </button>
              <button onClick={() => setShowSettings((s) => !s)} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ color: showSettings ? "#fff" : "#B4B4C0", background: showSettings ? "#25252C" : "transparent" }} aria-label="Settings">
                <Settings size={15} />
              </button>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-[28px] font-bold text-white tracking-tight">{new Date().toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}</h1>
            <span className="text-[16px] font-medium text-[#9494A0]">Today</span>
          </div>
          {showSettings && (
            <div className="mt-4 bg-[#141417] rounded-2xl p-4 flex flex-col gap-3">
              <h3 className="text-white text-[13px] font-semibold uppercase tracking-wide">Reminders</h3>
              {typeof Notification !== "undefined" && Notification.permission === "granted" ? (
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-[#B4B4C0]">Remind me daily at</span>
                  <input type="time" value={reminderTime || "09:00"} onChange={(e) => setReminderTime(e.target.value)}
                    className="bg-[#0F0F13] border border-[#2A2A32] rounded-lg px-2 py-1 text-[13px] text-white focus:outline-none" />
                </div>
              ) : (
                <button onClick={enableReminders} className="self-start px-3 py-1.5 rounded-full bg-white text-black text-[13px] font-medium">Enable reminders</button>
              )}
              <p className="text-[11px] text-[#6B6B75]">Reminders fire while the app is installed and recently opened. iOS may not deliver them if the app has been fully closed for a while.</p>
            </div>
          )}
        </header>
        {storageError && <div className="mb-4 text-[13px] text-[#F24E4E] bg-[#2A1717] border border-[#F24E4E]/30 rounded-lg px-3 py-2">{storageError}</div>}
        <div className="flex flex-col gap-3">
          {habits.length === 0 && !showAdd && (
            <div className="text-center py-16 bg-[#141417] rounded-2xl">
              <p className="text-[#8A8A94] text-[14px] mb-3">No habits yet. Start with one small thing.</p>
              <button onClick={() => setShowAdd(true)} className="text-[13px] font-medium text-white underline underline-offset-2">Add your first habit</button>
            </div>
          )}
          {habits.map((h) =>
            editingHabit?.id === h.id ? (
              <div key={h.id} className="animate-[fadeIn_0.25s_ease-out]">
                <HabitForm initial={editingHabit} onSave={updateHabit} onCancel={() => setEditingHabit(null)} onDelete={deleteHabit} onBackfill={backfillEntry} usedColors={usedColors} />
              </div>
            ) : (
              <div key={h.id} className="animate-[fadeIn_0.25s_ease-out]">
                <HabitCard habit={h} onToggleToday={toggleToday} onOpenEdit={setEditingHabit} collapsed={collapsedIds.has(h.id)} onToggleCollapse={toggleCollapse} />
              </div>
            )
          )}
          {showAdd && (
            <div className="animate-[fadeIn_0.25s_ease-out]">
              <HabitForm onSave={addHabit} onCancel={() => setShowAdd(false)} usedColors={usedColors} />
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {!showAdd && !editingHabit && (
        <button onClick={() => setShowAdd(true)} className="fixed bottom-8 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_24px_rgba(255,255,255,0.25)] active:scale-95 transition-transform" aria-label="Add habit">
          <Plus size={22} />
        </button>
      )}
    </div>
  );
}
