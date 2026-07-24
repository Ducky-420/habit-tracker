const HABITS_KEY = 'habits.app.data.v1';
const SETTINGS_KEY = 'habits.app.settings.v1';

const ICON_BASE = 'https://unpkg.com/lucide-static@0.469.0/icons/';
export const SYMBOL_ICONS = ['dumbbell','droplet','book-open','brain','zap','heart','flame','wallet','code','target','moon','music','coffee','globe','shield','trophy','star','clock','sparkles','leaf','footprints','apple','bed','pill'];
export const THEME_GRADIENTS = [
  { name:'Electric Violet', a:'#a78bfa', b:'#7c3aed' },
  { name:'Cyber Magenta', a:'#f0abfc', b:'#c026d3' },
  { name:'Neon Cyan', a:'#67e8f9', b:'#0891b2' },
  { name:'Sunset Orange', a:'#fdba74', b:'#ea580c' },
  { name:'Emerald Green', a:'#6ee7b7', b:'#059669' },
  { name:'Solar Gold', a:'#fde047', b:'#ca8a04' },
  { name:'Deep Obsidian Blue', a:'#93c5fd', b:'#1d4ed8' },
  { name:'Crimson Red', a:'#fca5a5', b:'#dc2626' },
  { name:'Royal Purple', a:'#c4b5fd', b:'#6d28d9' },
];
export const CATEGORIES = ['Fitness','Health','Productivity','Mindset','Finance','Learning','Lifestyle','Social','Nutrition'];
export function iconUrl(name){ return ICON_BASE + name + '.svg'; }
export function gradient(idx){ const t = THEME_GRADIENTS[idx] || THEME_GRADIENTS[0]; return `linear-gradient(155deg,${t.a},${t.b})`; }

function makeHistory(density){
  return Array.from({length:56}, () => (Math.random() < density ? Math.round(Math.random()*2)+1 : 0));
}

function defaultHabits(){
  return [
    { id:1, title:'Gym', desc:'', icon:'dumbbell', themeIdx:0, category:'Fitness', freq:'daily', freqN:1, goal:false, goalN:30, expanded:true, viewMode:'pill', history: makeHistory(0.6) },
    { id:2, title:'Meditate', desc:'10 minutes, mornings', icon:'brain', themeIdx:2, category:'Mindset', freq:'daily', freqN:1, goal:true, goalN:21, expanded:false, viewMode:'pill', history: makeHistory(0.65) },
    { id:3, title:'Side Project', desc:'', icon:'code', themeIdx:1, category:'Productivity', freq:'perday', freqN:2, goal:false, goalN:30, expanded:false, viewMode:'mosaic', history: makeHistory(0.55) },
  ];
}

export function loadHabits(){
  try {
    const raw = localStorage.getItem(HABITS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  const habits = defaultHabits();
  saveHabits(habits);
  return habits;
}
export function saveHabits(habits){ localStorage.setItem(HABITS_KEY, JSON.stringify(habits)); }
export function resetHabits(){ localStorage.removeItem(HABITS_KEY); return loadHabits(); }

export function loadSettings(){
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { defaultViewMode:'pill', glowOn:true };
}
export function saveSettings(settings){ localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }

export function exportHabitsToFile(habits){
  const payload = { habits, exportedAt:new Date().toISOString(), version:'2.0.0' };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type:'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'habits-export.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

export function importHabitsFromFile(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data.habits)) throw new Error('Missing habits array');
        saveHabits(data.habits);
        resolve(data.habits);
      } catch (e) { reject(e); }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export function bestStreak(history){
  let best = 0, cur = 0;
  for (const v of history) { if (v > 0) { cur++; best = Math.max(best, cur); } else cur = 0; }
  return best;
}
export function todayCount(habit){ return habit.history[habit.history.length - 1]; }
