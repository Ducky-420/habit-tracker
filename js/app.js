import { loadHabits, saveHabits, loadSettings, todayCount, bestStreak } from './storage.js';
import { renderHeader, bindHeaderEvents } from './components/Header.js';
import { renderHabitCard, bindHabitCardEvents } from './components/HabitCard.js';
import { HabitModal } from './components/HabitModal.js';
import { renderSettings, bindSettingsEvents } from './components/Settings.js';

let habits = loadHabits();
let activeTab = 'dashboard';

const $ = (sel) => document.querySelector(sel);
const pages = { dashboard: $('#page-dashboard'), habits: $('#page-habits'), stats: $('#page-stats'), settings: $('#page-settings') };
const modal = new HabitModal($('#habit-modal-inner'), (id, data) => {
  if (id) {
    const h = habits.find(x => x.id === id);
    Object.assign(h, data);
  } else {
    habits.push({ id: Date.now(), ...data, expanded: true, viewMode: loadSettings().defaultViewMode, history: Array(56).fill(0) });
  }
  saveHabits(habits);
  renderAll();
});

function applyGlow(on){ document.documentElement.classList.toggle('glow-on', on); document.documentElement.classList.toggle('glow-off', !on); }
applyGlow(loadSettings().glowOn);

function fmtDate(){
  return new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' }).toUpperCase();
}

function renderDashboard(){
  const total = habits.length;
  const completed = habits.filter(h => todayCount(h) > 0).length;
  const streak = Math.max(0, ...habits.map(h => bestStreak(h.history)));
  pages.dashboard.innerHTML = renderHeader({ dateLabel: fmtDate(), completed, total, streak });
  bindHeaderEvents(pages.dashboard, {
    onViewToggle: () => { habits.forEach(h => h.viewMode = h.viewMode === 'pill' ? 'mosaic' : 'pill'); saveHabits(habits); renderAll(); },
    onSettings: () => showTab('settings'),
  });
}

function renderHabitsPage(){
  pages.habits.querySelector('#habits-list').innerHTML = habits.map(renderHabitCard).join('');
  bindHabitCardEvents(pages.habits, {
    onToggleExpand: (id) => { const h = habits.find(x=>x.id===id); h.expanded = !h.expanded; saveHabits(habits); renderAll(); },
    onToggleDone: (id) => { const h = habits.find(x=>x.id===id); const last = h.history.length-1; h.history[last] = h.history[last] > 0 ? 0 : (h.freqN||1); saveHabits(habits); renderAll(); },
    onEdit: (id) => modal.open(habits.find(x=>x.id===id)),
  });
}

function renderStats(){
  const total = habits.length;
  const completed = habits.filter(h => todayCount(h) > 0).length;
  const pct = total ? Math.round(completed/total*100) : 0;
  const streak = Math.max(0, ...habits.map(h => bestStreak(h.history)));
  pages.stats.querySelector('#stats-body').innerHTML = `
    <div class="glass" style="padding:20px; margin-bottom:14px; display:flex; gap:10px;">
      <div style="flex:1;"><p style="font:700 26px sans-serif; color:#fff; margin:0;">${total}</p><p class="body-sm">Active habits</p></div>
      <div style="flex:1; border-left:1px solid rgba(255,255,255,0.14); padding-left:12px;"><p style="font:700 26px sans-serif; color:var(--violet-light); margin:0;">${pct}%</p><p class="body-sm">Overall completion</p></div>
    </div>
    <div class="glass" style="padding:20px;"><p class="eyebrow">Longest streak overall</p><p style="font:700 34px sans-serif; color:#fff; margin:0;">${streak} days</p></div>`;
}

function renderSettingsPage(){
  pages.settings.querySelector('#settings-body').innerHTML = renderSettings();
  bindSettingsEvents(pages.settings, {
    getHabits: () => habits,
    onGlowToggle: applyGlow,
  });
}

function renderAll(){
  renderDashboard(); renderHabitsPage(); renderStats(); renderSettingsPage();
}

function showTab(tab){
  activeTab = tab;
  Object.entries(pages).forEach(([k, el]) => el.classList.toggle('active', k === tab));
  document.querySelectorAll('nav.tabbar button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
}

document.querySelectorAll('nav.tabbar button').forEach(b => b.addEventListener('click', () => showTab(b.dataset.tab)));
$('#fab-add').addEventListener('click', () => modal.open(null));
$('#modal-backdrop-close').addEventListener('click', () => modal.close());

renderAll();
showTab('dashboard');

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(()=>{}));
}
