import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Plus, Flame, Check, Trash2, X, ChevronRight, GripVertical,
  ListChecks, BarChart3, Settings as SettingsIcon, Sparkles, Home, ShieldCheck,
  Dumbbell, HeartPulse, Bike, Footprints, Activity, Salad, Pill, Stethoscope, Apple, Waves,
  Droplet, Droplets, Bath, Smile, ShowerHead, Scissors, Sparkle, Wind, CircleCheck,
  PenLine, Music, Palette, Camera, Paintbrush, Film, Mic, Feather, Guitar, Clapperboard,
  Moon, Sun, Brain, Leaf, Cloud, Heart, Infinity as InfinityIcon, CircleDot,
  BookOpen, GraduationCap, Pencil, Languages, Calculator, Globe, Library, Notebook, Lightbulb, Puzzle,
  Wand2, Star, Zap, Ghost, Gem, Skull, Eye,
  Cigarette, Wine, Beer, Candy, Smartphone, Gamepad2, Dice5, Ban, EyeOff,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useLocalStorage } from "./hooks/useLocalStorage";

// ---- date helpers -------------------------------------------------

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

// ---- categories & icons (7 categories, 10 icons each) ----------------

const CATEGORIES = [
  {
    key: "health", label: "Health",
    icons: { dumbbell: Dumbbell, heart: HeartPulse, bike: Bike, footprints: Footprints, activity: Activity, salad: Salad, pill: Pill, stethoscope: Stethoscope, apple: Apple, waves: Waves },
  },
  {
    key: "hygiene", label: "Hygiene",
    icons: { droplet: Droplet, droplets: Droplets, bath: Bath, smile: Smile, shower: ShowerHead, scissors: Scissors, sparkle: Sparkle, sparkles2: Sparkles, freshair: Wind, clean: CircleCheck },
  },
  {
    key: "creative", label: "Creative",
    icons: { pen: PenLine, music: Music, palette: Palette, camera: Camera, brush: Paintbrush, film: Film, mic: Mic, feather: Feather, guitar: Guitar, clapper: Clapperboard },
  },
  {
    key: "mindfulness", label: "Mindfulness",
    icons: { moon: Moon, sun: Sun, wind: Wind, brain: Brain, leaf: Leaf, cloud: Cloud, heart2: Heart, infinity: InfinityIcon, dot: CircleDot, waves2: Waves },
  },
  {
    key: "learning", label: "Learning",
    icons: { book: BookOpen, grad: GraduationCap, pencil: Pencil, lang: Languages, calc: Calculator, globe: Globe, library: Library, notebook: Notebook, bulb: Lightbulb, puzzle: Puzzle },
  },
  {
    key: "magick", label: "Magick",
    icons: { wand: Wand2, sparkles: Sparkles, star: Star, zap: Zap, ghost: Ghost, gem: Gem, skull: Skull, moon2: Moon, flame2: Flame, eye: Eye },
  },
  {
    key: "quit", label: "Quit",
    icons: { cigarette: Cigarette, wine: Wine, beer: Beer, candy: Candy, phone: Smartphone, gamepad: Gamepad2, dice: Dice5, ban: Ban, eyeoff: EyeOff, shield: ShieldCheck },
  },
];
const ALL_ICONS = CATEGORIES.reduce((acc, c) => ({ ...acc, ...c.icons }), {});

// ---- palette (18 colors) ------------------------------------------

const PALETTE = [
  { name: "gold", fill: "#F2C230", glow: "rgba(242,194,48,0.35)", dim: "#3A3320" },
  { name: "red", fill: "#F24E4E", glow: "rgba(242,78,78,0.35)", dim: "#3A2323" },
  { name: "blue", fill: "#5B7CFF", glow: "rgba(91,124,255,0.35)", dim: "#232A3A" },
  { name: "violet", fill: "#B26CF2", glow: "rgba(178,108,242,0.35)", dim: "#2E2338" },
  { name: "green", fill: "#4ED47A", glow: "rgba(78,212,122,0.35)", dim: "#20362A" },
  { name: "teal", fill: "#3ECFCB", glow: "rgba(62,207,203,0.35)", dim: "#1F3736" },
  { name: "pink", fill: "#F26CA7", glow: "rgba(242,108,167,0.35)", dim: "#3A2130" },
  { name: "orange", fill: "#F28B3C", glow: "rgba(242,139,60,0.35)", dim: "#3A2A1B" },
  { name: "indigo", fill: "#8B7CF6", glow: "rgba(139,124,246,0.35)", dim: "#28223D" },
  { name: "crimson", fill: "#DC2626", glow: "rgba(220,38,38,0.35)", dim: "#3A1F1F" },
  { name: "amber", fill: "#F59E0B", glow: "rgba(245,158,11,0.35)", dim: "#3A2E14" },
  { name: "lime", fill: "#A3E635", glow: "rgba(163,230,53,0.35)", dim: "#2C3A18" },
  { name: "cyan", fill: "#22D3EE", glow: "rgba(34,211,238,0.35)", dim: "#163539" },
  { name: "fuchsia", fill: "#E879F9", glow: "rgba(232,121,249,0.35)", dim: "#35213A" },
  { name: "rose", fill: "#FB7185", glow: "rgba(251,113,133,0.35)", dim: "#3A2226" },
  { name: "sky", fill: "#38BDF8", glow: "rgba(56,189,248,0.35)", dim: "#1A2E3A" },
  { name: "emerald", fill: "#10B981", glow: "rgba(16,185,129,0.35)", dim: "#163529" },
  { name: "slate", fill: "#94A3B8", glow: "rgba(148,163,184,0.35)", dim: "#26292E" },
];

const BUILD_PRESETS = [
  { name: "Drink water", category: "hygiene", icon: "droplet", color: "blue" },
  { name: "Move your body", category: "health", icon: "dumbbell", color: "gold" },
  { name: "Read 10 minutes", category: "learning", icon: "book", color: "teal" },
];
const BREAK_PRESETS = [
  { name: "No smoking", category: "quit", icon: "cigarette", color: "crimson" },
  { name: "No social media before bed", category: "quit", icon: "phone", color: "slate" },
  { name: "No junk food", category: "quit", icon: "candy", color: "amber" },
];

const MILESTONES = [7, 30, 100];

// ---- streak math ----------------------------------------------

function computeStreaks(entries) {
  const dates = Object.keys(entries).filter((k) => entries[k]).sort();
  if (dates.length === 0) return { current: 0, longest: 0 };
  const set = new Set(dates);
  let longest = 1, run = 1;
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

function last30(entries) {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const key = addDays(todayKey(), -i);
    days.push({ date: key.slice(5), value: entries[key] ? 1 : 0 });
  }
  return days;
}

function buzz(ms = 15) {
  if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(ms);
}

// ---- grids --------------------------------------------------

function MiniBars({ color, current }) {
  const heights = [22, 10, 10, 10];
  return (
    <div className="flex items-end gap-[3px] h-[22px]">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full"
          style={{ height: h, background: i === 0 && current > 0 ? color.fill : "#2A2A32" }}
        />
      ))}
    </div>
  );
}

function FullGrid({ entries, color, rows = 6, cols = 15 }) {
  const days = rows * cols;
  const start = addDays(todayKey(), -(days - 1));
  const cells = [];
  for (let i = 0; i < days; i++) cells.push(addDays(start, i));
  const columns = [];
  for (let c = 0; c < cols; c++) columns.push(cells.slice(c * rows, c * rows + rows));

  return (
    <div className="flex gap-[4px] flex-wrap">
      {columns.map((col, ci) => (
        <div key={ci} className="flex flex-col gap-[4px]">
          {col.map((key, ri) => {
            const on = !!entries[key];
            return (
              <div key={ri} title={key} className="w-[12px] h-[12px] rounded-[3px] transition-all duration-200"
                style={{ background: on ? color.fill : "#1E1E23", boxShadow: on ? `0 0 6px ${color.glow}` : "none" }} />
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ---- quick row (dashboard) --------------------------------------------

function QuickRow({ habit, onToggleToday }) {
  const color = PALETTE.find((p) => p.name === habit.color) || PALETTE[0];
  const Icon = ALL_ICONS[habit.icon] || Dumbbell;
  const done = !!habit.entries[todayKey()];
  const isBreak = habit.type === "break";

  return (
    <div className="flex items-center gap-2.5 bg-[#0F0F13] rounded-xl px-3 py-2.5">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: color.dim }}>
        <Icon size={13} style={{ color: color.fill }} />
      </div>
      <span className="flex-1 min-w-0 text-white text-[13px] font-medium truncate">{habit.name}</span>
      <button
        onClick={() => onToggleToday(habit.id)}
        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90"
        style={{ background: done ? color.fill : "transparent", border: `1.5px solid ${done ? color.fill : "#2A2A32"}` }}
        aria-label="Toggle today"
      >
        {done ? <Check size={13} color="#0F0F13" /> : isBreak ? <ShieldCheck size={12} color="#4A4A54" /> : <Check size={13} color="#4A4A54" />}
      </button>
    </div>
  );
}

// ---- swipeable + draggable habit row --------------------------------

function HabitRow({ habit, onToggleToday, onOpenEdit, dragProps, isDragging }) {
  const color = PALETTE.find((p) => p.name === habit.color) || PALETTE[0];
  const Icon = ALL_ICONS[habit.icon] || Dumbbell;
  const isBreak = habit.type === "break";
  const { current } = useMemo(() => computeStreaks(habit.entries), [habit.entries]);
  const doneToday = !!habit.entries[todayKey()];

  const [dragX, setDragX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [locked, setLocked] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const triggeredRef = useRef(false);

  const onPointerDown = (e) => {
    if (isDragging) return;
    startX.current = e.clientX;
    startY.current = e.clientY;
    triggeredRef.current = false;
    setLocked(null);
    setSwiping(true);
  };
  const onPointerMove = (e) => {
    if (!swiping) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;
    if (!locked) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      const direction = Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical";
      setLocked(direction);
      // Capture only once a horizontal swipe is confirmed, so plain taps on
      // inner buttons (expand toggle, edit, mark today) still receive their click.
      if (direction === "horizontal") e.currentTarget.setPointerCapture?.(e.pointerId);
      return;
    }
    if (locked === "vertical") return;
    const clamped = Math.max(0, Math.min(90, dx));
    setDragX(clamped);
    if (clamped > 70 && !triggeredRef.current) {
      triggeredRef.current = true;
      buzz(20);
    }
  };
  const onPointerUp = (e) => {
    if (!swiping) return;
    setSwiping(false);
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (locked === "horizontal" && dragX > 70) onToggleToday(habit.id);
    setDragX(0);
    setLocked(null);
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-2xl flex items-center pl-5" style={{ background: color.dim, opacity: dragX / 90 }}>
        {isBreak ? <ShieldCheck size={18} style={{ color: color.fill }} /> : <Check size={18} style={{ color: color.fill }} />}
      </div>

      <div
        className="relative bg-white/[0.045] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-3.5 flex items-start gap-3 touch-pan-y select-none"
        style={{
          transform: `translateX(${dragX}px) ${isDragging ? "scale(1.02)" : "scale(1)"}`,
          transition: swiping ? "none" : "transform 200ms ease",
          boxShadow: isDragging ? "0 8px 24px rgba(0,0,0,0.4)" : "none",
          borderLeft: isBreak ? "2px solid #DC2626" : "none",
          zIndex: isDragging ? 10 : 1,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <button
          {...dragProps}
          onPointerDown={(e) => { e.stopPropagation(); dragProps.onPointerDown(e); }}
          className="text-[#4A4A54] shrink-0 cursor-grab active:cursor-grabbing touch-none p-2.5 -m-2.5"
          aria-label="Drag to reorder"
        >
          <GripVertical size={15} />
        </button>

        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: color.dim }}>
          <Icon size={15} style={{ color: color.fill }} />
        </div>

        <div className="flex-1 min-w-0">
          <button onClick={() => onOpenEdit(habit)} className="text-left block w-full">
            <h3 className="text-white text-[13px] font-semibold tracking-wide uppercase truncate">{habit.name}</h3>
          </button>

          <button onClick={() => setExpanded((v) => !v)} className="flex items-center gap-1 mt-1">
            {isBreak ? <ShieldCheck size={11} style={{ color: color.fill }} /> : <Flame size={11} style={{ color: color.fill }} />}
            <span className="text-[11px] font-medium" style={{ color: color.fill }}>
              {current} {isBreak ? (current === 1 ? "day clean" : "days clean") : (current === 1 ? "day" : "days")}
            </span>
            <ChevronRight size={11} className="text-[#6B6B75] transition-transform duration-250 ml-0.5"
              style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)" }} />
          </button>

          {!expanded && (
            <button onClick={() => setExpanded(true)} className="mt-2 block">
              <MiniBars color={color} current={current} />
            </button>
          )}

          <div className="grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}>
            <div className="overflow-hidden">
              <div className="pt-2.5">
                <FullGrid entries={habit.entries} color={color} />
                <button onClick={() => onOpenEdit(habit)} className="mt-2.5 px-3 py-1 rounded-full bg-[#25252C] text-[12px] font-medium text-white">
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => onToggleToday(habit.id)}
          className="relative shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90"
          style={{ background: doneToday ? color.fill : "#0F0F13", border: `1.5px solid ${doneToday ? color.fill : "#2A2A32"}` }}
          aria-label="Mark today"
        >
          {doneToday ? <Check size={16} color="#0F0F13" /> : isBreak ? <ShieldCheck size={15} color="#4A4A54" /> : <Check size={16} color="#4A4A54" />}
        </button>
      </div>
    </div>
  );
}

// ---- milestone toast ------------------------------------------------

function MilestoneToast({ habitName, days, isBreak, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed left-1/2 -translate-x-1/2 z-50 animate-[popIn_0.35s_ease-out]" style={{ top: "calc(24px + env(safe-area-inset-top, 0px))" }}>
      <div className="bg-white text-black rounded-2xl px-4 py-3 flex items-center gap-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
        {isBreak ? <ShieldCheck size={18} className="text-[#DC2626]" /> : <Sparkles size={18} className="text-[#F2C230]" />}
        <div>
          <p className="text-[13px] font-bold leading-tight">{days} days {isBreak ? "clean" : "strong"}!</p>
          <p className="text-[11px] text-[#6B6B75] leading-tight">{habitName}</p>
        </div>
      </div>
      <style>{`
        @keyframes popIn {
          0% { opacity: 0; transform: translateY(-10px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

// ---- habit form (add + edit) -------------------------------------

function HabitForm({ initial, defaultType = "build", onSave, onCancel, onDelete, onBackfill, usedColors }) {
  const isEdit = !!initial;
  const [type, setType] = useState(initial?.type || defaultType);
  const [name, setName] = useState(initial?.name || "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle || "");
  const [notes, setNotes] = useState(initial?.notes || "");
  const [category, setCategory] = useState(initial?.category || (defaultType === "break" ? "quit" : CATEGORIES[0].key));
  const [iconKey, setIconKey] = useState(initial?.icon || Object.keys((CATEGORIES.find(c => c.key === (initial?.category || (defaultType === "break" ? "quit" : CATEGORIES[0].key))) || CATEGORIES[0]).icons)[0]);
  const availableColor = PALETTE.find((p) => !usedColors.includes(p.name)) || PALETTE[0];
  const [colorName, setColorName] = useState(initial?.color || (defaultType === "break" ? "crimson" : availableColor.name));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [backfillDate, setBackfillDate] = useState(todayKey());
  const activeCategory = CATEGORIES.find((c) => c.key === category) || CATEGORIES[0];

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, []);

  return (
    <div className="fixed inset-0 z-40 bg-black/70 flex items-end sm:items-center justify-center" onClick={onCancel}>
      <div className="w-full sm:max-w-md bg-white/[0.045] backdrop-blur-xl border border-white/[0.08] rounded-t-3xl sm:rounded-3xl p-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white text-[13px] font-semibold uppercase tracking-wide">{isEdit ? "Edit habit" : "New habit"}</h3>
          <button onClick={onCancel} className="text-[#6B6B75] hover:text-white" aria-label="Close"><X size={18} /></button>
        </div>

        <div className="flex flex-col gap-3">
          {!isEdit && (
            <div className="flex bg-[#0F0F13] rounded-xl p-1">
              <button type="button" onClick={() => setType("build")} className="flex-1 py-2 rounded-lg text-[13px] font-semibold transition-colors"
                style={{ background: type === "build" ? "#25252C" : "transparent", color: type === "build" ? "#fff" : "#6B6B75" }}>
                Build
              </button>
              <button type="button" onClick={() => setType("break")} className="flex-1 py-2 rounded-lg text-[13px] font-semibold transition-colors"
                style={{ background: type === "break" ? "#3A1F1F" : "transparent", color: type === "break" ? "#DC2626" : "#6B6B75" }}>
                Break
              </button>
            </div>
          )}

          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder={type === "break" ? "What are you quitting? — e.g. Smoking" : "Habit name — e.g. Hit the gym"}
            className="bg-[#0F0F13] border border-[#2A2A32] rounded-lg px-3 py-2 text-[15px] text-white placeholder:text-[#6B6B75] focus:outline-none focus:ring-2 focus:ring-white/20" />
          <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Subtitle (optional)"
            className="bg-[#0F0F13] border border-[#2A2A32] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-[#6B6B75] focus:outline-none focus:ring-2 focus:ring-white/20" />
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" rows={2}
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

          <div className="flex items-center gap-2 flex-wrap">
            {Object.entries(activeCategory.icons).map(([key, Icon]) => (
              <button type="button" key={key} onClick={() => setIconKey(key)} className="w-9 h-9 rounded-lg flex items-center justify-center border"
                style={{ borderColor: iconKey === key ? "#fff" : "#2A2A32", background: iconKey === key ? "#25252C" : "transparent" }}>
                <Icon size={16} className="text-white" />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {PALETTE.map((p) => (
              <button type="button" key={p.name} onClick={() => setColorName(p.name)} aria-label={p.name} className="w-6 h-6 rounded-full border-2 shrink-0"
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
              <button type="button"
                onClick={() => { if (!name.trim()) return; onSave({ type, name: name.trim(), subtitle: subtitle.trim(), notes: notes.trim(), category, icon: iconKey, color: colorName }); }}
                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white text-black hover:bg-[#E4E4E4]">
                {isEdit ? "Save" : "Add habit"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- onboarding -----------------------------------------------------

function Onboarding({ mode, onQuickAdd, onCustom }) {
  const presets = mode === "break" ? BREAK_PRESETS : BUILD_PRESETS;
  return (
    <div className="text-center py-10 bg-white/[0.045] backdrop-blur-xl border border-white/[0.08] rounded-2xl px-5">
      <p className="text-white text-[16px] font-semibold mb-1">
        {mode === "break" ? "What are you ready to quit?" : "Let's start with one thing"}
      </p>
      <p className="text-[#8A8A94] text-[13px] mb-5">Pick one below, or make your own.</p>
      <div className="flex flex-col gap-2 mb-4">
        {presets.map((p) => {
          const color = PALETTE.find((c) => c.name === p.color);
          const Icon = ALL_ICONS[p.icon];
          return (
            <button key={p.name} onClick={() => onQuickAdd(p)}
              className="flex items-center gap-3 bg-[#0F0F13] rounded-xl px-4 py-3 text-left hover:bg-[#1A1A1F] transition-colors">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: color.dim }}>
                <Icon size={15} style={{ color: color.fill }} />
              </div>
              <span className="text-white text-[14px] font-medium">{p.name}</span>
            </button>
          );
        })}
      </div>
      <button onClick={onCustom} className="text-[13px] font-medium text-white underline underline-offset-2">
        Create a custom habit
      </button>
    </div>
  );
}

// ---- habits tab (build/break sub-views) --------------------------------

function HabitsTab({ habits, subview, onSubviewChange, onToggleToday, onOpenEdit, onReorder, onQuickAdd, onOpenAdd }) {
  const [dragId, setDragId] = useState(null);
  const cardRefs = useRef({});
  const filtered = habits.filter((h) => h.type === subview);

  const onDragStart = (id, e) => {
    e.preventDefault();
    setDragId(id);
  };

  useEffect(() => {
    if (!dragId) return;
    const onMove = (e) => {
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const entries = Object.entries(cardRefs.current);
      let closestId = dragId, closestDist = Infinity;
      entries.forEach(([id, el]) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const dist = Math.abs(clientY - (rect.top + rect.height / 2));
        if (dist < closestDist) { closestDist = dist; closestId = id; }
      });
      if (closestId !== dragId) onReorder(dragId, closestId);
    };
    const onUp = () => setDragId(null);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragId, onReorder]);

  const doneCount = filtered.filter((h) => h.entries[todayKey()]).length;
  const total = filtered.length;
  const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);
  const isBreak = subview === "break";

  return (
    <>
      <div className="flex bg-white/[0.045] backdrop-blur-xl border border-white/[0.08] rounded-full p-1 mb-4">
        <button onClick={() => onSubviewChange("build")} className="flex-1 py-2 rounded-full text-[13px] font-semibold transition-colors"
          style={{ background: subview === "build" ? "#25252C" : "transparent", color: subview === "build" ? "#fff" : "#6B6B75" }}>
          Building
        </button>
        <button onClick={() => onSubviewChange("break")} className="flex-1 py-2 rounded-full text-[13px] font-semibold transition-colors"
          style={{ background: subview === "break" ? "#3A1F1F" : "transparent", color: subview === "break" ? "#DC2626" : "#6B6B75" }}>
          Breaking
        </button>
      </div>

      {total > 0 && (
        <div className="bg-white/[0.045] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-medium text-[#B4B4C0]">
              {doneCount} of {total} {isBreak ? "clean" : "done"} today
            </span>
            <span className="text-[13px] font-semibold text-white">{pct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[#0F0F13] overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: isBreak ? "#DC2626" : "#F2C230" }} />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        {total === 0 && <Onboarding mode={subview} onQuickAdd={onQuickAdd} onCustom={onOpenAdd} />}

        {filtered.map((h) => (
          <div key={h.id} ref={(el) => (cardRefs.current[h.id] = el)} className="animate-[fadeIn_0.25s_ease-out]">
            <HabitRow
              habit={h}
              onToggleToday={onToggleToday}
              onOpenEdit={onOpenEdit}
              isDragging={dragId === h.id}
              dragProps={{ onPointerDown: (e) => onDragStart(h.id, e) }}
            />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

// ---- dashboard tab --------------------------------------------------

function DashboardTab({ habits, onToggleToday }) {
  const todaysKey = todayKey();
  const buildHabits = habits.filter((h) => h.type === "build");
  const breakHabits = habits.filter((h) => h.type === "break");
  const pendingBuild = buildHabits.filter((h) => !h.entries[todaysKey]);
  const pendingBreak = breakHabits.filter((h) => !h.entries[todaysKey]);

  const totalCount = habits.length;
  const doneCount = habits.filter((h) => h.entries[todaysKey]).length;
  const pct = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  const atRisk = useMemo(() => {
    const candidates = habits
      .filter((h) => !h.entries[todaysKey])
      .map((h) => ({ habit: h, current: computeStreaks(h.entries).current }))
      .filter((x) => x.current > 0)
      .sort((a, b) => b.current - a.current);
    return candidates[0] || null;
  }, [habits, todaysKey]);

  if (totalCount === 0) {
    return (
      <div className="text-center py-16 bg-white/[0.045] backdrop-blur-xl border border-white/[0.08] rounded-2xl">
        <p className="text-[#8A8A94] text-[14px]">Add a habit in the Habits tab to get started.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-white/[0.045] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] font-medium text-[#B4B4C0]">Today's score</span>
          <span className="text-white text-[20px] font-bold">{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-[#0F0F13] overflow-hidden">
          <div className="h-full rounded-full bg-[#F2C230] transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[11px] text-[#6B6B75] mt-2">{doneCount} of {totalCount} across everything</p>
      </div>

      {atRisk && (
        <div className="bg-white/[0.045] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 border-l-2" style={{ borderColor: PALETTE.find((p) => p.name === atRisk.habit.color)?.fill || "#F2C230" }}>
          <p className="text-[12px] text-[#8A8A94] mb-2">Don't lose this streak</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-[14px] font-semibold uppercase tracking-wide">{atRisk.habit.name}</p>
              <p className="text-[12px] mt-0.5" style={{ color: PALETTE.find((p) => p.name === atRisk.habit.color)?.fill }}>
                {atRisk.current} {atRisk.habit.type === "break" ? "days clean" : "day streak"}
              </p>
            </div>
            <button onClick={() => onToggleToday(atRisk.habit.id)} className="px-3 py-1.5 rounded-full bg-white text-black text-[12px] font-semibold">
              {atRisk.habit.type === "break" ? "Stayed clean" : "Mark done"}
            </button>
          </div>
        </div>
      )}

      {pendingBuild.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[11px] tracking-[0.1em] uppercase text-[#6B6B75] font-medium px-1">Still building today</p>
          {pendingBuild.map((h) => <QuickRow key={h.id} habit={h} onToggleToday={onToggleToday} />)}
        </div>
      )}

      {pendingBreak.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[11px] tracking-[0.1em] uppercase text-[#6B6B75] font-medium px-1">Still need to confirm</p>
          {pendingBreak.map((h) => <QuickRow key={h.id} habit={h} onToggleToday={onToggleToday} />)}
        </div>
      )}

      {pendingBuild.length === 0 && pendingBreak.length === 0 && (
        <div className="text-center py-8 bg-white/[0.045] backdrop-blur-xl border border-white/[0.08] rounded-2xl">
          <p className="text-white text-[14px] font-semibold">All clear today 🎉</p>
        </div>
      )}
    </div>
  );
}

// ---- stats tab --------------------------------------------------

function StatsSection({ title, habits, isBreak }) {
  if (habits.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] tracking-[0.1em] uppercase text-[#6B6B75] font-medium px-1">{title}</p>
      {habits.map((h) => {
        const color = PALETTE.find((p) => p.name === h.color) || PALETTE[0];
        const Icon = ALL_ICONS[h.icon] || Dumbbell;
        const { current, longest } = computeStreaks(h.entries);
        const data = last30(h.entries);

        return (
          <div key={h.id} className="bg-white/[0.045] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: color.dim }}>
                <Icon size={13} style={{ color: color.fill }} />
              </div>
              <h3 className="text-white text-[13px] font-semibold uppercase tracking-wide">{h.name}</h3>
            </div>
            <div className="flex gap-4 mb-2 text-[12px]">
              <span style={{ color: color.fill }}>{current} {isBreak ? "days clean" : "day streak"}</span>
              <span className="text-[#6B6B75]">{longest} day best</span>
            </div>
            <div className="h-[60px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <XAxis dataKey="date" hide />
                  <YAxis hide domain={[0, 1]} />
                  <Tooltip contentStyle={{ background: "#0F0F13", border: "none", borderRadius: 8, fontSize: 11 }} labelStyle={{ color: "#8A8A94" }} itemStyle={{ color: color.fill }} />
                  <Line type="stepAfter" dataKey="value" stroke={color.fill} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatsTab({ habits }) {
  const weeklyPct = useMemo(() => {
    if (habits.length === 0) return 0;
    let done = 0, possible = 0;
    for (let i = 0; i < 7; i++) {
      const key = addDays(todayKey(), -i);
      habits.forEach((h) => { possible += 1; if (h.entries[key]) done += 1; });
    }
    return possible === 0 ? 0 : Math.round((done / possible) * 100);
  }, [habits]);

  if (habits.length === 0) {
    return (
      <div className="text-center py-16 bg-white/[0.045] backdrop-blur-xl border border-white/[0.08] rounded-2xl">
        <p className="text-[#8A8A94] text-[14px]">Add a habit to start seeing stats.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white/[0.045] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4">
        <p className="text-[13px] text-[#B4B4C0] mb-1">This week, across everything</p>
        <p className="text-white text-[28px] font-bold">{weeklyPct}%</p>
      </div>
      <StatsSection title="Building" habits={habits.filter((h) => h.type === "build")} isBreak={false} />
      <StatsSection title="Breaking" habits={habits.filter((h) => h.type === "break")} isBreak={true} />
    </div>
  );
}

// ---- settings tab --------------------------------------------------

function SettingsTab({ reminderTime, saveReminderTime, enableReminders, notifStatus, onResetData }) {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-white/[0.045] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 flex flex-col gap-3">
        <h3 className="text-white text-[13px] font-semibold uppercase tracking-wide">Reminders</h3>
        {notifStatus === "granted" ? (
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[#B4B4C0]">Remind me daily at</span>
            <input type="time" value={reminderTime || "09:00"} onChange={(e) => saveReminderTime(e.target.value)}
              className="bg-[#0F0F13] border border-[#2A2A32] rounded-lg px-2 py-1 text-[13px] text-white focus:outline-none" />
          </div>
        ) : (
          <button onClick={enableReminders} className="self-start px-3 py-1.5 rounded-full bg-white text-black text-[13px] font-medium">Enable reminders</button>
        )}
        <p className="text-[11px] text-[#6B6B75]">
          Reminders fire while the app is installed and recently opened. iOS may not deliver them if the app has been fully closed for a while.
        </p>
      </div>

      <div className="bg-white/[0.045] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 flex flex-col gap-3">
        <h3 className="text-white text-[13px] font-semibold uppercase tracking-wide">Data</h3>
        {!confirmReset ? (
          <button onClick={() => setConfirmReset(true)} className="self-start text-[13px] text-[#8A8A94] hover:text-[#F24E4E] flex items-center gap-1">
            <Trash2 size={13} /> Reset all data
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#F24E4E]">This deletes everything. Sure?</span>
            <button onClick={() => { onResetData(); setConfirmReset(false); }} className="text-[12px] font-medium text-white bg-[#F24E4E] px-2 py-1 rounded">Yes</button>
            <button onClick={() => setConfirmReset(false)} className="text-[12px] text-[#8A8A94]">Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- bottom tab bar --------------------------------------------------

function TabBar({ active, onChange }) {
  const tabs = [
    { key: "dashboard", label: "Dashboard", icon: Home },
    { key: "habits", label: "Habits", icon: ListChecks },
    { key: "stats", label: "Stats", icon: BarChart3 },
    { key: "settings", label: "Settings", icon: SettingsIcon },
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0C]/95 backdrop-blur border-t border-[#1A1A1F]" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 10px)" }}>
      <div className="max-w-md mx-auto flex items-stretch">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = active === t.key;
          return (
            <button key={t.key} onClick={() => onChange(t.key)} className="flex-1 flex flex-col items-center gap-1 py-2.5">
              <Icon size={19} color={isActive ? "#F2C230" : "#6B6B75"} />
              <span className="text-[10px] font-medium" style={{ color: isActive ? "#F2C230" : "#6B6B75" }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---- main app ------------------------------------------------------

const STORAGE_KEY = "habits-v5";

export default function HabitTracker() {
  const [habits, setHabits, error] = useLocalStorage(STORAGE_KEY, []);
  const [tab, setTab] = useState("dashboard");
  const [habitsSubview, setHabitsSubview] = useState("build");
  const [showAdd, setShowAdd] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [reminderTime, setReminderTime] = useLocalStorage("reminder-time", "");
  const [notifStatus, setNotifStatus] = useState(typeof Notification !== "undefined" ? Notification.permission : "unsupported");
  const [milestone, setMilestone] = useState(null);

  useEffect(() => {
    if (!reminderTime || notifStatus !== "granted") return;
    let timeoutId;
    const scheduleNext = () => {
      const [h, m] = reminderTime.split(":").map(Number);
      const now = new Date();
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
      if (next <= now) next.setDate(next.getDate() + 1);
      timeoutId = setTimeout(() => {
        const undone = (habits || []).filter((hb) => !hb.entries[todayKey()]);
        if (undone.length > 0) {
          new Notification("Habit reminder", { body: `${undone.length} habit${undone.length === 1 ? "" : "s"} still waiting today.` });
        }
        scheduleNext();
      }, next.getTime() - now.getTime());
    };
    scheduleNext();
    return () => clearTimeout(timeoutId);
  }, [reminderTime, notifStatus, habits]);

  const enableReminders = async () => {
    if (typeof Notification === "undefined") return;
    const perm = await Notification.requestPermission();
    setNotifStatus(perm);
    if (perm === "granted" && !reminderTime) setReminderTime("09:00");
  };

  const usedColors = habits.map((h) => h.color);

  const addHabit = (data) => {
    setHabits([...habits, { id: crypto.randomUUID(), ...data, entries: {} }]);
    setShowAdd(false);
  };
  const quickAddPreset = (preset) => {
    setHabits([...habits, { id: crypto.randomUUID(), type: habitsSubview, name: preset.name, subtitle: "", notes: "", category: preset.category, icon: preset.icon, color: preset.color, entries: {} }]);
  };
  const updateHabit = (data) => {
    setHabits(habits.map((h) => (h.id === editingHabit.id ? { ...h, ...data } : h)));
    setEditingHabit(null);
  };
  const deleteHabit = (id) => {
    setHabits(habits.filter((h) => h.id !== id));
    setEditingHabit(null);
  };
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
    const habit = habits.find((h) => h.id === id);
    const wasBefore = computeStreaks(habit.entries).current;

    const next = habits.map((h) => (h.id === id ? { ...h, entries: { ...h.entries, [key]: !h.entries[key] || undefined } } : h));
    next.forEach((h) => { Object.keys(h.entries).forEach((k) => { if (!h.entries[k]) delete h.entries[k]; }); });
    setHabits(next);

    const updated = next.find((h) => h.id === id);
    const nowAfter = computeStreaks(updated.entries).current;
    if (nowAfter > wasBefore && MILESTONES.includes(nowAfter)) {
      setMilestone({ habitName: habit.name, days: nowAfter, isBreak: habit.type === "break" });
      buzz(30);
    }
  };

  const reorder = useCallback((draggedId, targetId) => {
    const fromIdx = habits.findIndex((h) => h.id === draggedId);
    const toIdx = habits.findIndex((h) => h.id === targetId);
    if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;
    const next = [...habits];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setHabits(next);
  }, [habits]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetData = () => {
    setHabits([]);
    setReminderTime("");
  };

  const tabTitles = { dashboard: "Dashboard", habits: "Habits", stats: "Stats", settings: "Settings" };

  return (
    <div className="min-h-screen bg-black" style={{ fontFamily: "ui-rounded, -apple-system, 'SF Pro Rounded', 'Segoe UI', system-ui, sans-serif" }}>
      <div className="max-w-md mx-auto px-4 pb-28" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 2rem)" }}>
        <header className="mb-5">
          <p className="text-[11px] tracking-[0.15em] uppercase text-[#6B6B75] font-medium mb-1">
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="text-[24px] font-bold text-white tracking-tight">{tabTitles[tab]}</h1>
        </header>

        {error && (
          <div className="mb-4 text-[13px] text-[#F24E4E] bg-[#2A1717] border border-[#F24E4E]/30 rounded-lg px-3 py-2">{error}</div>
        )}

        {tab === "dashboard" && <DashboardTab habits={habits} onToggleToday={toggleToday} />}
        {tab === "habits" && (
          <HabitsTab
            habits={habits}
            subview={habitsSubview}
            onSubviewChange={setHabitsSubview}
            onToggleToday={toggleToday}
            onOpenEdit={setEditingHabit}
            onReorder={reorder}
            onQuickAdd={quickAddPreset}
            onOpenAdd={() => setShowAdd(true)}
          />
        )}
        {tab === "stats" && <StatsTab habits={habits} />}
        {tab === "settings" && (
          <SettingsTab reminderTime={reminderTime} saveReminderTime={setReminderTime} enableReminders={enableReminders} notifStatus={notifStatus} onResetData={resetData} />
        )}
      </div>

      {tab === "habits" && habits.filter((h) => h.type === habitsSubview).length > 0 && (
        <button onClick={() => setShowAdd(true)}
          className="fixed left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_24px_rgba(255,255,255,0.25)] active:scale-95 transition-transform"
          style={{ bottom: "calc(80px + env(safe-area-inset-bottom, 0px))" }}
          aria-label="Add habit">
          <Plus size={22} />
        </button>
      )}

      <TabBar active={tab} onChange={setTab} />

      {showAdd && <HabitForm defaultType={habitsSubview} onSave={addHabit} onCancel={() => setShowAdd(false)} usedColors={usedColors} />}
      {editingHabit && (
        <HabitForm initial={editingHabit} onSave={updateHabit} onCancel={() => setEditingHabit(null)} onDelete={deleteHabit} onBackfill={backfillEntry} usedColors={usedColors} />
      )}
      {milestone && <MilestoneToast habitName={milestone.habitName} days={milestone.days} isBreak={milestone.isBreak} onDone={() => setMilestone(null)} />}
    </div>
  );
}
