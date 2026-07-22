import { useState, useMemo } from "react";
import {
  Plus,
  Flame,
  Check,
  Trash2,
  Dumbbell,
  Music,
  Pill,
  BookOpen,
  Droplet,
  Moon,
  PenLine,
  Salad,
} from "lucide-react";
import { useLocalStorage } from "./hooks/useLocalStorage";

// ---- helpers -------------------------------------------------

const todayKey = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString().slice(0, 10);
};
const addDays = (key, n) => {
  const d = new Date(key + "T00:00:00");
  d.setDate(d.getDate() + n);
  return todayKey(d);
};

const ICONS = {
  dumbbell: Dumbbell,
  music: Music,
  pill: Pill,
  book: BookOpen,
  droplet: Droplet,
  moon: Moon,
  pen: PenLine,
  salad: Salad,
};

const PALETTE = [
  { name: "gold", fill: "#F2C230", glow: "rgba(242,194,48,0.35)", dim: "#3A3320" },
  { name: "red", fill: "#F24E4E", glow: "rgba(242,78,78,0.35)", dim: "#3A2323" },
  { name: "blue", fill: "#5B7CFF", glow: "rgba(91,124,255,0.35)", dim: "#232A3A" },
  { name: "violet", fill: "#B26CF2", glow: "rgba(178,108,242,0.35)", dim: "#2E2338" },
  { name: "green", fill: "#4ED47A", glow: "rgba(78,212,122,0.35)", dim: "#20362A" },
];

// ---- streak math ----------------------------------------------

function computeStreaks(entries) {
  const dates = Object.keys(entries).filter((k) => entries[k]).sort();
  if (dates.length === 0) return { current: 0, longest: 0 };
  const set = new Set(dates);

  let longest = 1;
  let run = 1;
  for (let i = 1; i < dates.length; i++) {
    if (addDays(dates[i - 1], 1) === dates[i]) {
      run += 1;
    } else {
      run = 1;
    }
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

// ---- pixel grid --------------------------------------------------

function PixelGrid({ entries, color, rows = 5, cols = 13 }) {
  const days = rows * cols;
  const start = addDays(todayKey(), -(days - 1));
  const cells = [];
  for (let i = 0; i < days; i++) cells.push(addDays(start, i));

  const columns = [];
  for (let c = 0; c < cols; c++) {
    columns.push(cells.slice(c * rows, c * rows + rows));
  }

  return (
    <div className="flex gap-[3px]">
      {columns.map((col, ci) => (
        <div key={ci} className="flex flex-col gap-[3px]">
          {col.map((key, ri) => {
            const on = !!entries[key];
            return (
              <div
                key={ri}
                title={key}
                className="w-[9px] h-[9px] sm:w-[10px] sm:h-[10px] rounded-[2px]"
                style={{
                  background: on ? color.fill : color.dim,
                  boxShadow: on ? `0 0 6px ${color.glow}` : "none",
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ---- add habit form ---------------------------------------------

function AddHabitForm({ onAdd, onCancel, usedColors }) {
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const availableColor =
    PALETTE.find((p) => !usedColors.includes(p.name)) || PALETTE[0];
  const [colorName, setColorName] = useState(availableColor.name);
  const [iconKey, setIconKey] = useState("dumbbell");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onAdd(name.trim(), subtitle.trim(), colorName, iconKey);
        setName("");
        setSubtitle("");
      }}
      className="flex flex-col gap-3 bg-[#17171C] border border-[#2A2A32] rounded-2xl p-4"
    >
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Habit name — e.g. Hit the gym"
        className="bg-[#0F0F13] border border-[#2A2A32] rounded-lg px-3 py-2 text-[15px] text-white placeholder:text-[#6B6B75] focus:outline-none focus:ring-2 focus:ring-white/20"
      />
      <input
        value={subtitle}
        onChange={(e) => setSubtitle(e.target.value)}
        placeholder="Subtitle — e.g. Workout for an hour"
        className="bg-[#0F0F13] border border-[#2A2A32] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-[#6B6B75] focus:outline-none focus:ring-2 focus:ring-white/20"
      />
      <div className="flex items-center gap-2">
        {Object.entries(ICONS).map(([key, Icon]) => (
          <button
            type="button"
            key={key}
            onClick={() => setIconKey(key)}
            className="w-8 h-8 rounded-lg flex items-center justify-center border"
            style={{
              borderColor: iconKey === key ? "#fff" : "#2A2A32",
              background: iconKey === key ? "#25252C" : "transparent",
            }}
          >
            <Icon size={15} className="text-white" />
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        {PALETTE.map((p) => (
          <button
            type="button"
            key={p.name}
            onClick={() => setColorName(p.name)}
            aria-label={p.name}
            className="w-6 h-6 rounded-full border-2"
            style={{
              background: p.fill,
              borderColor: colorName === p.name ? "#fff" : "transparent",
            }}
          />
        ))}
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-sm text-[#9494A0] hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white text-black hover:bg-[#E4E4E4]"
        >
          Add habit
        </button>
      </div>
    </form>
  );
}

// ---- habit card ---------------------------------------------------

function HabitCard({ habit, onToggleToday, onDelete }) {
  const color = PALETTE.find((p) => p.name === habit.color) || PALETTE[0];
  const Icon = ICONS[habit.icon] || Dumbbell;
  const { current } = useMemo(() => computeStreaks(habit.entries), [habit.entries]);
  const doneToday = !!habit.entries[todayKey()];

  return (
    <div className="relative bg-[#17171C] border border-[#26262E] rounded-2xl p-4 overflow-hidden group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: color.dim }}
          >
            <Icon size={15} style={{ color: color.fill }} />
          </div>
          <div className="min-w-0">
            <h3 className="text-white text-[13px] font-semibold tracking-wide uppercase truncate">
              {habit.name}
            </h3>
            {habit.subtitle && (
              <p className="text-[#8A8A94] text-[12px] truncate">{habit.subtitle}</p>
            )}
          </div>
        </div>

        <button
          onClick={() => onToggleToday(habit.id)}
          className="relative shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-90"
          style={{
            background: doneToday ? color.fill : "#0F0F13",
            border: `1.5px solid ${doneToday ? color.fill : "#2A2A32"}`,
          }}
          aria-label="Mark today"
        >
          <Check size={16} color={doneToday ? "#0F0F13" : "#4A4A54"} />
        </button>
      </div>

      <PixelGrid entries={habit.entries} color={color} />

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1 text-[12px] font-medium" style={{ color: color.fill }}>
          <Flame size={13} />
          {current} {current === 1 ? "day" : "days"}
        </div>
        <button
          onClick={() => onDelete(habit.id)}
          className="text-[#4A4A54] hover:text-[#F24E4E] transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Delete habit"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ---- main app ------------------------------------------------------

const STORAGE_KEY = "habits-v2";

export default function HabitTracker() {
  const [habits, setHabits, storageError] = useLocalStorage(STORAGE_KEY, []);
  const [showAdd, setShowAdd] = useState(false);

  const addHabit = (name, subtitle, color, icon) => {
    setHabits([...habits, { id: crypto.randomUUID(), name, subtitle, color, icon, entries: {} }]);
    setShowAdd(false);
  };

  const toggleToday = (id) => {
    const key = todayKey();
    const next = habits.map((h) =>
      h.id === id
        ? { ...h, entries: { ...h.entries, [key]: !h.entries[key] || undefined } }
        : h
    );
    next.forEach((h) => {
      Object.keys(h.entries).forEach((k) => {
        if (!h.entries[k]) delete h.entries[k];
      });
    });
    setHabits(next);
  };

  const deleteHabit = (id) => setHabits(habits.filter((h) => h.id !== id));
  const usedColors = habits.map((h) => h.color);

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-md mx-auto px-4 pt-8 pb-28">
        <header className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[11px] tracking-[0.15em] uppercase text-[#6B6B75] font-medium mb-1">
              {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <h1 className="text-[22px] font-bold text-white tracking-tight">Habits</h1>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#17171C] border border-[#26262E] flex items-center justify-center">
            <Flame size={16} className="text-[#F2C230]" />
          </div>
        </header>

        {storageError && (
          <div className="mb-4 text-[13px] text-[#F24E4E] bg-[#2A1717] border border-[#F24E4E]/30 rounded-lg px-3 py-2">
            {storageError}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {habits.length === 0 && !showAdd && (
            <div className="text-center py-16 border border-dashed border-[#26262E] rounded-2xl">
              <p className="text-[#8A8A94] text-[14px] mb-3">No habits yet. Start with one small thing.</p>
              <button
                onClick={() => setShowAdd(true)}
                className="text-[13px] font-medium text-white underline underline-offset-2"
              >
                Add your first habit
              </button>
            </div>
          )}

          {habits.map((h) => (
            <HabitCard key={h.id} habit={h} onToggleToday={toggleToday} onDelete={deleteHabit} />
          ))}

          {showAdd && (
            <AddHabitForm onAdd={addHabit} onCancel={() => setShowAdd(false)} usedColors={usedColors} />
          )}
        </div>
      </div>

      {!showAdd && (
        <button
          onClick={() => setShowAdd(true)}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_24px_rgba(255,255,255,0.25)] active:scale-95 transition-transform"
          aria-label="Add habit"
        >
          <Plus size={22} />
        </button>
      )}
    </div>
  );
}
