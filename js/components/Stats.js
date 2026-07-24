import { bestStreak, todayCount, CATEGORIES } from '../storage.js';

function dayCompletionRatios(habits, days){
  const total = habits.length;
  if (!total) return Array(days).fill(0);
  const slices = habits.map(h => h.history.slice(-days));
  return Array.from({ length: days }, (_, d) => slices.filter(arr => arr[d] > 0).length / total);
}

function activityMatrixHTML(habits, days){
  const ratios = dayCompletionRatios(habits, days);
  const cols = days === 7 ? 7 : 10;
  const cells = ratios.map(r => {
    const on = r > 0;
    const alpha = (0.18 + r * 0.72).toFixed(2);
    return `<div style="aspect-ratio:1; border-radius:6px; background:${on ? `rgba(139,92,246,${alpha})` : 'rgba(255,255,255,0.06)'}; ${on ? `box-shadow:0 0 6px rgba(139,92,246,${(r * 0.5).toFixed(2)});` : ''}"></div>`;
  }).join('');
  return `
  <div class="glass" style="padding:18px 20px; margin-bottom:16px;">
    <p class="eyebrow">${days}-Day Activity</p>
    <div style="display:grid; grid-template-columns:repeat(${cols},1fr); gap:5px;">${cells}</div>
  </div>`;
}

function categoryDistributionHTML(habits){
  const total = habits.length;
  const counts = CATEGORIES
    .map(c => ({ name: c, count: habits.filter(h => h.category === c).length }))
    .filter(c => c.count > 0);
  if (!counts.length) return '';
  const rows = counts.map(c => {
    const pct = total ? Math.round(c.count / total * 100) : 0;
    return `
    <div style="margin-bottom:10px;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:5px;">
        <span style="font:600 12px sans-serif; color:#e4dff0;">${c.name}</span>
        <span style="font:600 11px sans-serif; color:#8B84A0;">${c.count} habit${c.count === 1 ? '' : 's'}</span>
      </div>
      <div style="height:8px; border-radius:99px; background:rgba(255,255,255,0.06); overflow:hidden;">
        <div style="height:100%; width:${pct}%; border-radius:99px; background:var(--grad-primary);"></div>
      </div>
    </div>`;
  }).join('');
  return `
  <div class="glass" style="padding:18px 20px; margin-bottom:16px;">
    <p class="eyebrow">Category Distribution</p>
    ${rows}
  </div>`;
}

export function renderStats(habits, timeframe = 30){
  const total = habits.length;
  const completedToday = habits.filter(h => todayCount(h) > 0).length;
  const pctToday = total ? Math.round(completedToday / total * 100) : 0;
  const streak = Math.max(0, ...habits.map(h => bestStreak(h.history)));

  const rangeRatios = dayCompletionRatios(habits, timeframe);
  const rangePct = rangeRatios.length ? Math.round(rangeRatios.reduce((a, b) => a + b, 0) / rangeRatios.length * 100) : 0;

  return `
    <div class="glass" style="padding:18px 20px; margin-bottom:16px; display:flex; gap:10px;">
      <div style="flex:1;"><p style="font:700 26px sans-serif; color:#fff; margin:0;">${total}</p><p class="body-sm">Active habits</p></div>
      <div style="flex:1; border-left:1px solid rgba(255,255,255,0.14); padding-left:12px;"><p style="font:700 26px sans-serif; color:var(--violet-light); margin:0;">${pctToday}%</p><p class="body-sm">Overall completion</p></div>
    </div>
    <div class="glass" style="padding:18px 20px; margin-bottom:16px;"><p class="eyebrow">Longest streak overall</p><p style="font:700 34px sans-serif; color:#fff; margin:0;">${streak} days</p></div>
    <div class="glass" style="padding:18px 20px; margin-bottom:16px;"><p class="eyebrow">${timeframe}-Day completion rate</p><p style="font:700 34px sans-serif; color:#fff; margin:0 0 4px;">${rangePct}%</p><p class="body-sm">Last ${timeframe} days, across all habits</p></div>
    ${activityMatrixHTML(habits, timeframe)}
    ${categoryDistributionHTML(habits)}`;
}
