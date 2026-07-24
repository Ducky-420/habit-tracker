import { loadHabits, saveHabits, loadSettings, todayCount, bestStreak, CATEGORIES } from './storage.js';
import { renderTopBar, bindTopBarEvents, renderGoalSummary, renderCategoryFilter, bindCategoryFilterEvents } from './components/Header.js';
import { renderHabitCard, bindHabitCardEvents } from './components/HabitCard.js';
import { HabitModal } from './components/HabitModal.js';
import { renderStats } from './components/Stats.js';
import { renderSettings, bindSettingsEvents } from './components/Settings.js';

let habits = loadHabits();
let activeTab = 'dashboard';
let dashboardFilter = 'All';
let habitsModeFilter = 'build';

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

// FLIP-technique card resize: capture the pre-toggle size, let the state
// change + full re-render happen (this app always renders via innerHTML
// replacement, so there's no persistent node to transition), then apply an
// inverted transform on the freshly-rendered node and animate it to
// identity. Works within the existing render architecture without a bigger
// rewrite.
function flipToggle(container, id, action){
  const oldEl = container.querySelector(`[data-id="${id}"]`);
  const firstRect = oldEl ? oldEl.getBoundingClientRect() : null;
  action();
  if (!firstRect) return;
  const newEl = container.querySelector(`[data-id="${id}"]`);
  if (!newEl || firstRect.height === 0) return;
  const lastRect = newEl.getBoundingClientRect();
  if (lastRect.height === 0) return;
  const scaleY = firstRect.height / lastRect.height;
  newEl.style.transformOrigin = 'top';
  newEl.style.transition = 'none';
  newEl.style.transform = `scaleY(${scaleY})`;
  newEl.style.opacity = '0.55';
  newEl.getBoundingClientRect(); // force reflow so the transition below actually animates
  requestAnimationFrame(() => {
    newEl.style.transition = 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease';
    newEl.style.transform = 'scaleY(1)';
    newEl.style.opacity = '1';
  });
  newEl.addEventListener('transitionend', () => {
    newEl.style.transition = ''; newEl.style.transform = ''; newEl.style.opacity = '';
  }, { once: true });
}

// Only celebrates on the specific click that just marked a habit
// done/clean — never replays on unrelated re-renders, and never fires when
// un-marking (toggling back off).
function celebrateToggle(container, id, action){
  action();
  const h = habits.find(x => x.id === id);
  if (!h || todayCount(h) <= 0) return;
  const btn = container.querySelector(`[data-id="${id}"] .js-toggle-done`);
  if (!btn) return;
  btn.style.setProperty('--pulse-color', h.type === 'break' ? 'rgba(244,63,94,0.55)' : 'rgba(139,92,246,0.55)');
  btn.classList.add('celebrate');
  btn.addEventListener('animationend', () => btn.classList.remove('celebrate'), { once: true });
}

function emptyStateHTML(kind){
  const isBreak = kind === 'break';
  return `<div class="glass" style="padding:32px 24px; text-align:center;">
    <p style="font:700 15px sans-serif; color:#fff; margin:0 0 6px;">No ${isBreak ? 'breaking' : 'building'} habits yet</p>
    <p class="body-sm" style="margin:0 0 18px;">${isBreak ? "Track something you're working to quit." : 'Start something worth building.'}</p>
    <button class="js-empty-add btn-primary" style="${isBreak ? 'background:linear-gradient(155deg,#fb7185,#e11d48); box-shadow:0 6px 18px rgba(225,29,72,0.35), inset 0 1px 1px rgba(255,255,255,0.35);' : ''}">+ Add a ${isBreak ? 'Breaking' : 'Building'} Habit</button>
  </div>`;
}

function renderDashboard(){
  const activeHabits = habits.filter(h => !h.archived);
  const total = activeHabits.length;
  const completed = activeHabits.filter(h => todayCount(h) > 0).length;
  const streak = Math.max(0, ...activeHabits.map(h => bestStreak(h.history)));

  const usedCategories = new Set(activeHabits.map(h => h.category));
  if (dashboardFilter !== 'All') usedCategories.add(dashboardFilter);
  const categoriesInUse = CATEGORIES.filter(c => usedCategories.has(c));

  const filtered = dashboardFilter === 'All' ? activeHabits : activeHabits.filter(h => h.category === dashboardFilter);
  const feedHTML = filtered.length
    ? filtered.map(renderHabitCard).join('')
    : (dashboardFilter !== 'All'
        ? `<div class="glass" style="padding:24px; text-align:center;"><p class="body-sm" style="margin:0;">No habits in ${dashboardFilter} yet</p></div>`
        : '');

  const headerEl = document.getElementById('dashboard-header');
  const scrollEl = document.getElementById('dashboard-scroll');

  headerEl.innerHTML = renderTopBar({ dateLabel: fmtDate() });
  scrollEl.innerHTML =
    renderGoalSummary({ completed, total, streak }) +
    renderCategoryFilter(categoriesInUse, dashboardFilter) +
    feedHTML;

  bindTopBarEvents(headerEl, {
    onViewToggle: () => { habits.forEach(h => h.viewMode = h.viewMode === 'pill' ? 'mosaic' : 'pill'); saveHabits(habits); renderAll(); },
    onSettings: () => showTab('settings'),
  });
  bindCategoryFilterEvents(scrollEl, {
    onSelect: (cat) => { dashboardFilter = cat; renderDashboard(); },
  });
  bindHabitCardEvents(scrollEl, {
    onToggleExpand: (id) => flipToggle(scrollEl, id, () => { const h = habits.find(x=>x.id===id); h.expanded = !h.expanded; saveHabits(habits); renderAll(); }),
    onToggleDone: (id) => celebrateToggle(scrollEl, id, () => { const h = habits.find(x=>x.id===id); const last = h.history.length-1; h.history[last] = h.history[last] > 0 ? 0 : (h.freqN||1); saveHabits(habits); renderAll(); }),
    onEdit: (id) => modal.open(habits.find(x=>x.id===id)),
    onRelapse: (id) => { const h = habits.find(x=>x.id===id); h.history[h.history.length-1] = 0; saveHabits(habits); renderAll(); },
  });
}

function renderHabitsPage(){
  const activeHabits = habits.filter(h => !h.archived);
  const filtered = activeHabits.filter(h => (h.type || 'build') === habitsModeFilter);
  const modeToggleHTML = `
    <div class="glass" style="padding:5px; margin-bottom:16px; display:flex; gap:4px;">
      <span class="js-habits-mode" data-mode="build" style="flex:1; text-align:center; padding:10px 0; border-radius:14px; cursor:pointer; font:700 12px sans-serif;
        background:${habitsModeFilter==='build'?'var(--grad-primary)':'transparent'}; color:${habitsModeFilter==='build'?'#fff':'#8B84A0'};">Building</span>
      <span class="js-habits-mode" data-mode="break" style="flex:1; text-align:center; padding:10px 0; border-radius:14px; cursor:pointer; font:700 12px sans-serif;
        background:${habitsModeFilter==='break'?'linear-gradient(155deg,#fb7185,#e11d48)':'transparent'}; color:${habitsModeFilter==='break'?'#fff':'#8B84A0'};">Breaking</span>
    </div>`;
  const listHTML = filtered.length ? filtered.map(renderHabitCard).join('') : emptyStateHTML(habitsModeFilter);

  pages.habits.querySelector('#habits-list').innerHTML = modeToggleHTML + listHTML;
  pages.habits.querySelectorAll('.js-habits-mode').forEach(el => el.addEventListener('click', () => { habitsModeFilter = el.dataset.mode; renderHabitsPage(); }));
  pages.habits.querySelector('.js-empty-add')?.addEventListener('click', () => modal.open(null, habitsModeFilter));
  bindHabitCardEvents(pages.habits, {
    onToggleExpand: (id) => flipToggle(pages.habits, id, () => { const h = habits.find(x=>x.id===id); h.expanded = !h.expanded; saveHabits(habits); renderAll(); }),
    onToggleDone: (id) => celebrateToggle(pages.habits, id, () => { const h = habits.find(x=>x.id===id); const last = h.history.length-1; h.history[last] = h.history[last] > 0 ? 0 : (h.freqN||1); saveHabits(habits); renderAll(); }),
    onEdit: (id) => modal.open(habits.find(x=>x.id===id)),
    onRelapse: (id) => { const h = habits.find(x=>x.id===id); h.history[h.history.length-1] = 0; saveHabits(habits); renderAll(); },
  });
}

function renderStatsPage(){
  pages.stats.querySelector('#stats-body').innerHTML = renderStats(habits.filter(h => !h.archived));
}

function renderSettingsPage(){
  pages.settings.querySelector('#settings-body').innerHTML = renderSettings(habits);
  bindSettingsEvents(pages.settings, {
    getHabits: () => habits,
    onGlowToggle: applyGlow,
    onUnarchive: (id) => { const h = habits.find(x=>x.id===id); if (h) h.archived = false; saveHabits(habits); renderAll(); },
  });
}

function renderAll(){
  renderDashboard(); renderHabitsPage(); renderStatsPage(); renderSettingsPage();
}

function showTab(tab){
  activeTab = tab;
  Object.entries(pages).forEach(([k, el]) => el.classList.toggle('active', k === tab));
  document.querySelectorAll('nav.tabbar button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
}

document.querySelectorAll('nav.tabbar button').forEach(b => b.addEventListener('pointerdown', () => showTab(b.dataset.tab)));
$('#fab-add').addEventListener('click', () => modal.open(null, habitsModeFilter));
$('#modal-backdrop-close').addEventListener('click', () => modal.close());

renderAll();
showTab('dashboard');

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(()=>{}));
}
