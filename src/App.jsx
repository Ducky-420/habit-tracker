import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Plus, Flame, Check, Trash2, X, GripVertical,
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
import { ACCENT, glass } from "./styles/glass";

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
const isoWeekMonday = (dateKey) => {
  const d = new Date(dateKey + "T00:00:00");
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
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

const DAILY_TARGET = { kind: "daily" };

const BUILD_PRESETS = [
  { name: "Drink water", category: "hygiene", icon: "droplet", color: "blue", target: DAILY_TARGET },
  { name: "Move your body", category: "health", icon: "dumbbell", color: "gold", target: DAILY_TARGET },
  { name: "Read 10 minutes", category: "learning", icon: "book", color: "teal", target: DAILY_TARGET },
];
const BREAK_PRESETS = [
  { name: "No smoking", category: "quit", icon: "cigarette", color: "crimson", target: DAILY_TARGET },
  { name: "No social media before bed", category: "quit", icon: "phone", color: "slate", target: DAILY_TARGET },
  { name: "No junk food", category: "quit", icon: "candy", color: "amber", target: DAILY_TARGET },
];

const MILESTONES = [7, 30, 100];

// ---- storage migration ------------------------------------------------

const STORAGE_KEY = "habits-v6";

function migrateV5toV6() {
  try {
    if (window.localStorage.getItem(STORAGE_KEY) !== null) return;
    const v5 = window.localStorage.getItem("habits-v5");
    if (v5 === null) return;
    const parsed = JSON.parse(v5);
    const migrated = parsed.map((h) => ({ ...h, target: h.target || DAILY_TARGET }));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
  } catch {
    // best-effort — if migration fails the app just starts fresh on v6
  }
}

// ---- target-aware streak math ----------------------------------------

function isDayDone(habit, dateKey) {
  const v = habit.entries[dateKey];
  if (habit.target.kind === "count") return (v || 0) >= habit.target.per;
  return !!v;
}

function computeDailyStreak(habit) {
  const dates = Object.keys(habit.entries).filter((k) => isDayDone(habit, k)).sort();
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

function computeWeeklyStreak(habit) {
  const per = habit.target.per || 1;
  const doneDates = Object.keys(habit.entries).filter((k) => !!habit.entries[k]);
  const weekCounts = {};
  doneDates.forEach((k) => {
    const wk = isoWeekMonday(k);
    weekCounts[wk] = (weekCounts[wk] || 0) + 1;
  });
  const metWeeks = new Set(Object.keys(weekCounts).filter((wk) => weekCounts[wk] >= per));
  if (metWeeks.size === 0) return { current: 0, longest: 0 };

  const sortedWeeks = Array.from(metWeeks).sort();
  let longest = 1, run = 1;
  for (let i = 1; i < sortedWeeks.length; i++) {
    if (addDays(sortedWeeks[i - 1], 7) === sortedWeeks[i]) run += 1;
    else run = 1;
    longest = Math.max(longest, run);
  }

  let cursorWeek = isoWeekMonday(todayKey());
  if (!metWeeks.has(cursorWeek)) cursorWeek = addDays(cursorWeek, -7);
  let current = 0;
  while (metWeeks.has(cursorWeek)) {
    current += 1;
    cursorWeek = addDays(cursorWeek, -7);
  }
  return { current, longest };
}

function habitStreak(habit) {
  return habit.target.kind === "weekly" ? computeWeeklyStreak(habit) : computeDailyStreak(habit);
}

function doneDaysThisWeek(habit) {
  const wk = isoWeekMonday(todayKey());
  let count = 0;
  for (let i = 0; i < 7; i++) {
    if (habit.entries[addDays(wk, i)]) count += 1;
  }
  return count;
}

function subtitleFor(habit, streakCurrent) {
  const isBreak = habit.type === "break";
  if (habit.target.kind === "count") {
    const per = habit.target.per;
    const todayCount = habit.entries[todayKey()] || 0;
    return `${todayCount}/${per} today · ${streakCurrent} day${streakCurrent === 1 ? "" : "s"} streak`;
  }
  if (habit.target.kind === "weekly") {
    const per = habit.target.per;
    const done = doneDaysThisWeek(habit);
    return `${done}/${per} this week · ${streakCurrent} week${streakCurrent === 1 ? "" : "s"} streak`;
  }
  if (isBreak) return `${streakCurrent} day${streakCurrent === 1 ? "" : "s"} clean`;
  return `${streakCurrent} day${streakCurrent === 1 ? "" : "s"}`;
}

function last30(habit) {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const key = addDays(todayKey(), -i);
    days.push({ date: key.slice(5), value: isDayDone(habit, key) ? 1 : 0 });
  }
  return days;
}

function buzz(ms = 15) {
  if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(ms);
}

// ---- grids --------------------------------------------------

function StreakGrid({ habit, color, rows = 6, cols = 15 }) {
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
            const on = isDayDone(habit, key);
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

function WeeklyPips({ habit, onToggleToday }) {
  const wkMonday = isoWeekMonday(todayKey());
  const today = todayKey();
  const color = PALETTE.find((p) => p.name === habit.color) || PALETTE[0];
  const labels = ["M", "T", "W", "T", "F", "S", "S"];
  const days = [];
  for (let i = 0; i < 7; i++) days.push(addDays(wkMonday, i));

  return (
    <div className="flex gap-1.5 mt-2">
      {days.map((d, i) => {
        const done = !!habit.entries[d];
        const isToday = d === today;
        return (
          <button
            key={d}
            type="button"
            disabled={!isToday}
            onClick={() => onToggleToday(habit.id)}
            className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-semibold transition-all"
            style={{
              background: done ? color.fill : "rgba(255,255,255,0.06)",
              color: done ? "#141417" : "#6B6B75",
              border: isToday ? `1.5px solid ${color.fill}` : "1px solid transparent",
              cursor: isToday ? "pointer" : "default",
            }}
          >
            {labels[i]}
          </button>
        );
      })}
    </div>
  );
}

function IconTile({ Icon, color, glowing }) {
  return (
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
      style={{
        background: color.dim,
        boxShadow: glowing ? `0 0 14px ${color.fill}66` : "none",
        animation: glowing ? "glowPulse 2.2s ease-in-out infinite" : "none",
      }}
    >
      <Icon size={15} style={{ color: color.fill }} />
    </div>
  );
}

function ConfettiBurst({ color }) {
  const dots = Array.from({ length: 6 });
  return (
    <div className="pointer-events-none absolute" style={{ right: 10, top: 10, width: 0, height: 0 }}>
      {dots.map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const dist = 28;
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist;
        return (
          <span
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{ background: color, left: 0, top: 0, "--tx": `${tx}px`, "--ty": `${ty}px`, animation: "confettiPop 700ms ease-out forwards" }}
          />
        );
      })}
    </div>
  );
}

function BigCheckButton({ habit, onPress }) {
  const color = PALETTE.find((p) => p.name === habit.color) || PALETTE[0];
  const isBreak = habit.type === "break";
  const isCount = habit.target.kind === "count";
  const per = isCount ? habit.target.per : 1;
  const count = isCount ? (habit.entries[todayKey()] || 0) : (isDayDone(habit, todayKey()) ? 1 : 0);
  const complete = isCount ? count >= per : isDayDone(habit, todayKey());
  const inProgress = isCount && count > 0 && !complete;

  return (
    <button
      onClick={() => onPress(habit.id)}
      className="relative shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90"
      style={{
        background: complete ? color.fill : "transparent",
        border: complete ? "2px solid #fff" : inProgress ? `2px solid ${color.fill}80` : "1.5px solid rgba(255,255,255,0.15)",
      }}
      aria-label={isCount ? `${count}/${per} today` : "Mark today"}
    >
      {complete ? (
        <Check size={16} color="#fff" />
      ) : isCount && count > 0 ? (
        <span className="text-[12px] font-bold" style={{ color: color.fill }}>{count}</span>
      ) : isBreak ? (
        <ShieldCheck size={15} color="#4A4A54" />
      ) : (
        <Check size={16} color="#4A4A54" />
      )}
    </button>
  );
}

// ---- quick row (dashboard) --------------------------------------------

function QuickRow({ habit, onToggleToday }) {
  const color = PALETTE.find((p) => p.name === habit.color) || PALETTE[0];
  const Icon = ALL_ICONS[habit.icon] || Dumbbell;
  const done = isDayDone(habit, todayKey());
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

// ---- draggable "Liquid Glass" habit card --------------------------------

function HabitRow({ habit, onToggleToday, onOpenEdit, dragProps, isDragging, justCompleted }) {
  const color = PALETTE.find((p) => p.name === habit.color) || PALETTE[0];
  const Icon = ALL_ICONS[habit.icon] || Dumbbell;
  const isBreak = habit.type === "break";
  const isWeekly = habit.target.kind === "weekly";
  const { current } = useMemo(() => habitStreak(habit), [habit]);
  const glowing = current >= 7;

  return (
    <div
      className="relative flex items-start gap-3 p-3.5 select-none"
      style={{
        ...glass(22),
        transform: isDragging ? "scale(1.02)" : "scale(1)",
        transition: "transform 200ms ease",
        boxShadow: isDragging ? "0 8px 24px rgba(0,0,0,0.4)" : glass(22).boxShadow,
        borderLeft: isBreak ? "2px solid #DC2626" : glass(22).border,
        zIndex: isDragging ? 10 : 1,
      }}
    >
      <button
        {...dragProps}
        className="text-[#4A4A54] shrink-0 cursor-grab active:cursor-grabbing touch-none p-2.5 -m-2.5"
        aria-label="Drag to reorder"
      >
        <GripVertical size={15} />
      </button>

      <IconTile Icon={Icon} color={color} glowing={glowing} />

      <div className="flex-1 min-w-0">
        <button onClick={() => onOpenEdit(habit)} className="text-left block w-full">
          <h3 className="text-white text-[13px] font-semibold tracking-wide uppercase truncate">{habit.name}</h3>
        </button>

        <div className="flex items-center gap-1 mt-1">
          {isBreak ? <ShieldCheck size={11} style={{ color: color.fill }} /> : <Flame size={11} style={{ color: color.fill }} />}
          <span className="text-[11px] font-medium" style={{ color: color.fill }}>
            {subtitleFor(habit, current)}
          </span>
        </div>

        {isWeekly ? (
          <WeeklyPips habit={habit} onToggleToday={onToggleToday} />
        ) : (
          <>
            <div className="pt-2.5">
              <StreakGrid habit={habit} color={color} />
            </div>
            <button onClick={() => onOpenEdit(habit)} className="mt-2.5 px-3 py-1 rounded-full bg-[#25252C] text-[12px] font-medium text-white">
              Edit
            </button>
          </>
        )}
      </div>

      {!isWeekly && <BigCheckButton habit={habit} onPress={onToggleToday} />}
      {justCompleted && <ConfettiBurst color={color.fill} />}
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
        {isBreak ? <ShieldCheck size={18} className="text-[#DC2626]" /> : <Sparkles size={18} style={{ color: ACCENT }} />}
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

const TARGET_OPTIONS = [
  { key: "daily", label: "Daily" },
  { key: "count", label: "N×/day" },
  { key: "weekly", label: "N×/week" },
];

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
  const [targetKind, setTargetKind] = useState(initial?.target?.kind || "daily");
  const [targetPer, setTargetPer] = useState(initial?.target?.per || (initial?.target?.kind === "weekly" ? 3 : 2));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [backfillDate, setBackfillDate] = useState(todayKey());
  const activeCategory = CATEGORIES.find((c) => c.key === category) || CATEGORIES[0];

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, []);

  const perBounds = targetKind === "count" ? [2, 6] : [1, 7];

  return (
    <div className="fixed inset-0 z-40 bg-black/70 flex items-end sm:items-center justify-center" onClick={onCancel}>
      <div className="w-full sm:max-w-md p-4 max-h-[85vh] overflow-y-auto" style={{ ...glass(22), borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} onClick={(e) => e.stopPropagation()}>
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
                style={{ background: type === "break" ? "rgba(220,38,38,0.16)" : "transparent", color: type === "break" ? "#FF6B6B" : "#6B6B75" }}>
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

          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-wide text-[#8A8A94]">Target</span>
            <div className="flex rounded-full p-1" style={glass(17)}>
              {TARGET_OPTIONS.map((opt) => (
                <button key={opt.key} type="button" onClick={() => setTargetKind(opt.key)}
                  className="flex-1 py-1.5 rounded-full text-[12px] font-semibold transition-colors"
                  style={{ background: targetKind === opt.key ? "#25252C" : "transparent", color: targetKind === opt.key ? "#fff" : "#6B6B75" }}>
                  {opt.label}
                </button>
              ))}
            </div>
            {targetKind !== "daily" && (
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-[#B4B4C0]">{targetKind === "count" ? "Times per day" : "Times per week"}</span>
                <div className="flex items-center gap-2 ml-auto">
                  <button type="button" onClick={() => setTargetPer((n) => Math.max(perBounds[0], n - 1))}
                    className="w-7 h-7 rounded-full bg-[#0F0F13] text-white flex items-center justify-center">−</button>
                  <span className="text-white text-[14px] font-semibold w-5 text-center">{targetPer}</span>
                  <button type="button" onClick={() => setTargetPer((n) => Math.min(perBounds[1], n + 1))}
                    className="w-7 h-7 rounded-full bg-[#0F0F13] text-white flex items-center justify-center">+</button>
                </div>
              </div>
            )}
          </div>

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
                {isDayDone(initial, backfillDate) ? "Unmark" : "Mark done"}
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
                onClick={() => {
                  if (!name.trim()) return;
                  const target = targetKind === "daily" ? { kind: "daily" } : { kind: targetKind, per: targetPer };
                  onSave({ type, name: name.trim(), subtitle: subtitle.trim(), notes: notes.trim(), category, icon: iconKey, color: colorName, target });
                }}
                className="px-3 py-1.5 text-sm font-medium rounded-lg text-black"
                style={{ background: ACCENT }}>
                {isEdit ? "Save" : "Add habit"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- empty state -----------------------------------------------------

function EmptyState({ heading, copy, ctaLabel, onCta, presets, onQuickAdd }) {
  return (
    <div className="text-center py-10 px-5" style={glass(22)}>
      <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: `${ACCENT}22` }}>
        <Sparkles size={20} style={{ color: ACCENT }} />
      </div>
      <p className="text-white text-[16px] font-semibold mb-1">{heading}</p>
      <p className="text-[#8A8A94] text-[13px] mb-5">{copy}</p>
      <button onClick={onCta} className="px-5 py-2.5 rounded-full text-[13px] font-semibold text-black mb-4" style={{ background: ACCENT }}>
        {ctaLabel}
      </button>
      {presets && presets.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
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
      )}
    </div>
  );
}

// ---- habits tab (build/break sub-views) --------------------------------

function HabitsTab({ habits, subview, onSubviewChange, onToggleToday, onOpenEdit, onReorder, onQuickAdd, onOpenAdd, justCompleted }) {
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

  const doneCount = filtered.filter((h) => isDayDone(h, todayKey())).length;
  const total = filtered.length;
  const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);
  const isBreak = subview === "break";

  return (
    <>
      <div className="flex rounded-full p-1 mb-4" style={glass(17)}>
        <button onClick={() => onSubviewChange("build")} className="flex-1 py-2 rounded-full text-[13px] font-semibold transition-colors"
          style={{ background: subview === "build" ? "#25252C" : "transparent", color: subview === "build" ? "#fff" : "#6B6B75" }}>
          Building
        </button>
        <button onClick={() => onSubviewChange("break")} className="flex-1 py-2 rounded-full text-[13px] font-semibold transition-colors"
          style={{ background: subview === "break" ? "rgba(220,38,38,0.16)" : "transparent", color: subview === "break" ? "#FF6B6B" : "#6B6B75" }}>
          Breaking
        </button>
      </div>

      {total > 0 && (
        <div className="p-4 mb-3" style={glass(22)}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-medium text-[#B4B4C0]">
              {doneCount} of {total} {isBreak ? "clean" : "done"} today
            </span>
            <span className="text-[13px] font-semibold text-white">{pct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[#0F0F13] overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: isBreak ? "#DC2626" : ACCENT }} />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        {total === 0 && (
          <EmptyState
            heading={subview === "break" ? "What are you ready to quit?" : "Let's start with one thing"}
            copy="Pick one below, or make your own."
            ctaLabel="Create a custom habit"
            onCta={onOpenAdd}
            presets={subview === "break" ? BREAK_PRESETS : BUILD_PRESETS}
            onQuickAdd={onQuickAdd}
          />
        )}

        {filtered.map((h) => (
          <div key={h.id} ref={(el) => (cardRefs.current[h.id] = el)} className="animate-[fadeIn_0.25s_ease-out]">
            <HabitRow
              habit={h}
              onToggleToday={onToggleToday}
              onOpenEdit={onOpenEdit}
              isDragging={dragId === h.id}
              dragProps={{ onPointerDown: (e) => onDragStart(h.id, e) }}
              justCompleted={!!justCompleted[h.id]}
            />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes glowPulse {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.4); }
        }
        @keyframes confettiPop {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0.3); opacity: 0; }
        }
      `}</style>
    </>
  );
}

// ---- dashboard tab (micro-dashboard) --------------------------------

function BarRow({ values }) {
  return (
    <div className="flex items-end gap-1.5 mt-2">
      {values.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full h-10 rounded-md overflow-hidden flex items-end bg-white/[0.06]">
            <div className="w-full rounded-md" style={{ height: `${Math.max(6, v.pct)}%`, background: v.isToday ? ACCENT : "rgba(255,255,255,0.35)" }} />
          </div>
          <span className="text-[9px] text-[#6B6B75]">{v.label}</span>
        </div>
      ))}
    </div>
  );
}

function DashboardTab({ habits, onToggleToday, onGoAddHabit }) {
  const todaysKey = todayKey();
  const buildHabits = habits.filter((h) => h.type === "build");
  const breakHabits = habits.filter((h) => h.type === "break");
  const pendingBuild = buildHabits.filter((h) => !isDayDone(h, todaysKey));
  const pendingBreak = breakHabits.filter((h) => !isDayDone(h, todaysKey));

  const totalCount = habits.length;
  const doneCount = habits.filter((h) => isDayDone(h, todaysKey)).length;
  const completionPct = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);
  const bestStreak = totalCount === 0 ? 0 : Math.max(0, ...habits.map((h) => habitStreak(h).current));

  const eligibleHabits = useMemo(() => habits.filter((h) => h.target.kind !== "weekly"), [habits]);
  const last7 = useMemo(() => {
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const key = addDays(todaysKey, -i);
      const label = new Date(key + "T00:00:00").toLocaleDateString(undefined, { weekday: "narrow" });
      const done = eligibleHabits.filter((h) => isDayDone(h, key)).length;
      const pct = eligibleHabits.length === 0 ? 0 : Math.round((done / eligibleHabits.length) * 100);
      out.push({ label, pct, isToday: key === todaysKey });
    }
    return out;
  }, [eligibleHabits, todaysKey]);

  const atRisk = useMemo(() => {
    const candidates = habits
      .filter((h) => h.target.kind !== "weekly" && !isDayDone(h, todaysKey))
      .map((h) => ({ habit: h, current: habitStreak(h).current }))
      .filter((x) => x.current > 0)
      .sort((a, b) => b.current - a.current);
    return candidates[0] || null;
  }, [habits, todaysKey]);

  if (totalCount === 0) {
    return (
      <EmptyState
        heading="Nothing tracked yet"
        copy="Add your first habit and it'll show up here every day."
        ctaLabel="Add a habit"
        onCta={onGoAddHabit}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="p-4" style={glass(22)}>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[13px] font-medium text-[#B4B4C0]">Completion today</span>
            <p className="text-white text-[24px] font-bold">{completionPct}%</p>
          </div>
          <div className="w-px h-9" style={{ background: "rgba(255,255,255,0.12)" }} />
          <div className="text-right">
            <span className="text-[13px] font-medium text-[#B4B4C0]">Best streak</span>
            <p className="text-[24px] font-bold" style={{ color: ACCENT }}>{bestStreak}</p>
          </div>
        </div>
        <p className="text-[11px] tracking-[0.1em] uppercase text-[#6B6B75] font-medium mt-3">Last 7 days</p>
        <BarRow values={last7} />
      </div>

      {atRisk && (
        <div className="p-4" style={{ ...glass(22), borderLeft: `2px solid ${PALETTE.find((p) => p.name === atRisk.habit.color)?.fill || ACCENT}` }}>
          <p className="text-[12px] text-[#8A8A94] mb-2">Don't lose this streak</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-[14px] font-semibold uppercase tracking-wide">{atRisk.habit.name}</p>
              <p className="text-[12px] mt-0.5" style={{ color: PALETTE.find((p) => p.name === atRisk.habit.color)?.fill }}>
                {atRisk.current} {atRisk.habit.type === "break" ? "days clean" : "day streak"}
              </p>
            </div>
            <button onClick={() => onToggleToday(atRisk.habit.id)} className="px-3 py-1.5 rounded-full text-black text-[12px] font-semibold" style={{ background: ACCENT }}>
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
        <div className="text-center py-8" style={glass(22)}>
          <p className="text-white text-[14px] font-semibold">All clear today 🎉</p>
        </div>
      )}
    </div>
  );
}

// ---- stats tab --------------------------------------------------

function WeeklyBars({ habit, color }) {
  const per = habit.target.per;
  const thisMonday = isoWeekMonday(todayKey());
  const weeks = [];
  for (let i = 7; i >= 0; i--) {
    const wk = addDays(thisMonday, -7 * i);
    let done = 0;
    for (let d = 0; d < 7; d++) { if (habit.entries[addDays(wk, d)]) done += 1; }
    weeks.push({ pct: Math.min(100, Math.round((done / per) * 100)) });
  }
  return (
    <div className="flex items-end gap-1 h-[60px]">
      {weeks.map((w, i) => (
        <div key={i} className="flex-1 h-full flex items-end">
          <div className="w-full rounded-sm" style={{ height: `${Math.max(6, w.pct)}%`, background: color.fill }} />
        </div>
      ))}
    </div>
  );
}

function StatsSection({ title, habits, isBreak }) {
  if (habits.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] tracking-[0.1em] uppercase text-[#6B6B75] font-medium px-1">{title}</p>
      {habits.map((h) => {
        const color = PALETTE.find((p) => p.name === h.color) || PALETTE[0];
        const Icon = ALL_ICONS[h.icon] || Dumbbell;
        const { current, longest } = habitStreak(h);
        const isWeekly = h.target.kind === "weekly";
        const unit = isWeekly ? "week" : "day";

        return (
          <div key={h.id} className="p-4" style={glass(22)}>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: color.dim }}>
                <Icon size={13} style={{ color: color.fill }} />
              </div>
              <h3 className="text-white text-[13px] font-semibold uppercase tracking-wide">{h.name}</h3>
            </div>
            <div className="flex gap-4 mb-2 text-[12px]">
              <span style={{ color: color.fill }}>{current} {unit}{current === 1 ? "" : "s"} {isBreak ? "clean" : "streak"}</span>
              <span className="text-[#6B6B75]">{longest} {unit} best</span>
            </div>
            {isWeekly ? (
              <WeeklyBars habit={h} color={color} />
            ) : (
              <div className="h-[60px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={last30(h)}>
                    <XAxis dataKey="date" hide />
                    <YAxis hide domain={[0, 1]} />
                    <Tooltip contentStyle={{ background: "#0F0F13", border: "none", borderRadius: 8, fontSize: 11 }} labelStyle={{ color: "#8A8A94" }} itemStyle={{ color: color.fill }} />
                    <Line type="stepAfter" dataKey="value" stroke={color.fill} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatsTab({ habits }) {
  const weeklyPct = useMemo(() => {
    const eligible = habits.filter((h) => h.target.kind !== "weekly");
    if (eligible.length === 0) return 0;
    let done = 0, possible = 0;
    for (let i = 0; i < 7; i++) {
      const key = addDays(todayKey(), -i);
      eligible.forEach((h) => { possible += 1; if (isDayDone(h, key)) done += 1; });
    }
    return possible === 0 ? 0 : Math.round((done / possible) * 100);
  }, [habits]);

  if (habits.length === 0) {
    return (
      <div className="text-center py-16" style={glass(22)}>
        <p className="text-[#8A8A94] text-[14px]">Add a habit to start seeing stats.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4" style={glass(22)}>
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
      <div className="p-4 flex flex-col gap-3" style={glass(22)}>
        <h3 className="text-white text-[13px] font-semibold uppercase tracking-wide">Reminders</h3>
        {notifStatus === "granted" ? (
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[#B4B4C0]">Remind me daily at</span>
            <input type="time" value={reminderTime || "09:00"} onChange={(e) => saveReminderTime(e.target.value)}
              className="bg-[#0F0F13] border border-[#2A2A32] rounded-lg px-2 py-1 text-[13px] text-white focus:outline-none" />
          </div>
        ) : (
          <button onClick={enableReminders} className="self-start px-3 py-1.5 rounded-full text-black text-[13px] font-medium" style={{ background: ACCENT }}>Enable reminders</button>
        )}
        <p className="text-[11px] text-[#6B6B75]">
          Reminders fire while the app is installed and recently opened. iOS may not deliver them if the app has been fully closed for a while.
        </p>
      </div>

      <div className="p-4 flex flex-col gap-3" style={glass(22)}>
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
              <Icon size={19} color={isActive ? ACCENT : "#6B6B75"} />
              <span className="text-[10px] font-medium" style={{ color: isActive ? ACCENT : "#6B6B75" }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---- main app ------------------------------------------------------

export default function HabitTracker() {
  const migratedRef = useRef(false);
  if (!migratedRef.current) {
    migrateV5toV6();
    migratedRef.current = true;
  }

  const [habits, setHabits, error] = useLocalStorage(STORAGE_KEY, []);
  const [tab, setTab] = useState("dashboard");
  const [habitsSubview, setHabitsSubview] = useState("build");
  const [showAdd, setShowAdd] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [reminderTime, setReminderTime] = useLocalStorage("reminder-time", "");
  const [notifStatus, setNotifStatus] = useState(typeof Notification !== "undefined" ? Notification.permission : "unsupported");
  const [milestone, setMilestone] = useState(null);
  const [justCompleted, setJustCompleted] = useState({});

  useEffect(() => {
    if (!reminderTime || notifStatus !== "granted") return;
    let timeoutId;
    const scheduleNext = () => {
      const [h, m] = reminderTime.split(":").map(Number);
      const now = new Date();
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
      if (next <= now) next.setDate(next.getDate() + 1);
      timeoutId = setTimeout(() => {
        const undone = (habits || []).filter((hb) => !isDayDone(hb, todayKey()));
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
    setHabits([...habits, { id: crypto.randomUUID(), type: habitsSubview, name: preset.name, subtitle: "", notes: "", category: preset.category, icon: preset.icon, color: preset.color, target: preset.target, entries: {} }]);
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
      const wasDone = isDayDone(h, dateKey);
      if (wasDone) delete entries[dateKey];
      else if (h.target.kind === "count") entries[dateKey] = h.target.per;
      else entries[dateKey] = true;
      return { ...h, entries };
    });
    setHabits(next);
    const updated = next.find((h) => h.id === id);
    if (updated) setEditingHabit(updated);
  };

  const fireConfetti = (id) => {
    setJustCompleted((m) => ({ ...m, [id]: true }));
    setTimeout(() => {
      setJustCompleted((m) => {
        const n = { ...m };
        delete n[id];
        return n;
      });
    }, 700);
  };

  const toggleToday = (id) => {
    const key = todayKey();
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;
    const wasStreak = habitStreak(habit).current;
    const wasDoneToday = isDayDone(habit, key);

    let nextEntries;
    if (habit.target.kind === "count") {
      const per = habit.target.per;
      const cur = habit.entries[key] || 0;
      const nextVal = cur >= per ? 0 : cur + 1;
      nextEntries = { ...habit.entries };
      if (nextVal === 0) delete nextEntries[key];
      else nextEntries[key] = nextVal;
    } else {
      nextEntries = { ...habit.entries };
      if (nextEntries[key]) delete nextEntries[key];
      else nextEntries[key] = true;
    }

    const nextHabit = { ...habit, entries: nextEntries };
    const next = habits.map((h) => (h.id === id ? nextHabit : h));
    setHabits(next);

    const isDoneNow = isDayDone(nextHabit, key);
    if (!wasDoneToday && isDoneNow) {
      fireConfetti(id);
      buzz(20);
    }

    const nowStreak = habitStreak(nextHabit).current;
    if (nowStreak > wasStreak && MILESTONES.includes(nowStreak)) {
      setMilestone({ habitName: habit.name, days: nowStreak, isBreak: habit.type === "break" });
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
    <div className="min-h-screen bg-[oklch(0.17_0.018_55)]" style={{ fontFamily: "ui-rounded, -apple-system, 'SF Pro Rounded', 'Segoe UI', system-ui, sans-serif" }}>
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

        {tab === "dashboard" && (
          <DashboardTab habits={habits} onToggleToday={toggleToday} onGoAddHabit={() => { setTab("habits"); setShowAdd(true); }} />
        )}
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
            justCompleted={justCompleted}
          />
        )}
        {tab === "stats" && <StatsTab habits={habits} />}
        {tab === "settings" && (
          <SettingsTab reminderTime={reminderTime} saveReminderTime={setReminderTime} enableReminders={enableReminders} notifStatus={notifStatus} onResetData={resetData} />
        )}
      </div>

      {tab === "habits" && habits.filter((h) => h.type === habitsSubview).length > 0 && (
        <button onClick={() => setShowAdd(true)}
          className="fixed left-1/2 -translate-x-1/2 w-14 h-14 rounded-full text-black flex items-center justify-center shadow-[0_0_24px_rgba(255,122,80,0.35)] active:scale-95 transition-transform"
          style={{ bottom: "calc(80px + env(safe-area-inset-bottom, 0px))", background: ACCENT }}
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
