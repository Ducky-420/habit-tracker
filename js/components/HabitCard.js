import { iconUrl, gradient, bestStreak, currentStreak, todayCount } from '../storage.js';

const BREAK_GRAD = 'linear-gradient(155deg,#fb7185,#e11d48)';
const BREAK_GLOW = 'rgba(244,63,94,0.5)';

function weekPillHTML(habit, isBreak){
  const labels = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
  const last7 = habit.history.slice(-7);
  const grad = habit.customColor || gradient(habit.themeIdx);
  const glow = isBreak ? BREAK_GLOW : 'rgba(139,92,246,0.5)';
  const cells = last7.map((count,i) => {
    const on = count > 0;
    return `<div style="display:flex; flex-direction:column; align-items:center; gap:5px; flex-shrink:0;">
      <div style="width:26px; height:30px; border-radius:9px; display:flex; align-items:center; justify-content:center; flex-shrink:0;
        background:${on ? grad : 'rgba(255,255,255,0.06)'}; box-shadow:${on ? `0 0 8px ${glow}` : 'none'};">
        <span style="font:700 11px sans-serif; color:${on ? '#fff' : '#6b6480'};">${count}</span>
      </div>
      <span style="font:700 8px sans-serif; letter-spacing:.04em; color:#6b6480;">${labels[i]}</span>
    </div>`;
  }).join('');
  return `<div style="margin-top:12px; padding:12px 8px; border-radius:14px; background:rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; justify-content:space-between; gap:6px; overflow-x:auto; -webkit-overflow-scrolling:touch;">${cells}</div>`;
}

function streakBadgeHTML(habit, isBreak){
  const n = isBreak ? currentStreak(habit.history) : bestStreak(habit.history);
  if (n <= 0) return '';
  const icon = isBreak ? 'shield' : 'flame';
  const color = isBreak ? '#fb7185' : '#facc15';
  const glow = isBreak ? 'rgba(244,63,94,0.5)' : 'rgba(250,204,21,0.5)';
  return `<span style="display:inline-flex; align-items:center; gap:2px; flex-shrink:0; margin-left:6px; padding:2px 6px; border-radius:99px; background:rgba(255,255,255,0.06);">
    <span class="icon-mask" style="width:10px;height:10px; -webkit-mask-image:url(${iconUrl(icon)}); mask-image:url(${iconUrl(icon)}); color:${color}; filter:drop-shadow(0 0 3px ${glow});"></span>
    <span style="font:800 10px sans-serif; color:${color};">${n}</span>
  </span>`;
}

function mosaicHTML(habit, isBreak){
  const grad = habit.customColor || gradient(habit.themeIdx);
  const glow = isBreak ? 'rgba(244,63,94,0.5)' : 'rgba(217,70,239,0.5)';
  const cells = habit.history.map(count => {
    const on = count > 0;
    return `<div style="aspect-ratio:1; border-radius:2.5px; background:${on ? grad : 'rgba(255,255,255,0.07)'}; box-shadow:${on ? `0 0 3px ${glow}` : 'none'};"></div>`;
  }).join('');
  return `<div style="margin-top:12px; padding:10px; border-radius:14px; background:rgba(0,0,0,0.28); border:1px solid rgba(255,255,255,0.06);">
    <div style="display:grid; grid-template-columns:repeat(14,1fr); gap:3px;">${cells}</div>
  </div>`;
}

export function renderHabitCard(habit){
  const isBreak = habit.type === 'break';
  const grad = habit.customColor || gradient(habit.themeIdx);
  const done = todayCount(habit) > 0;
  const cardSkin = isBreak
    ? 'background:rgba(225,29,72,0.2); border-color:rgba(244,63,94,0.4); box-shadow:inset 0 1px 0 rgba(255,255,255,0.25), 0 12px 30px rgba(0,0,0,0.45), 0 10px 25px rgba(244,63,94,0.15);'
    : '';

  if (!habit.expanded) {
    const last7 = habit.history.slice(-7);
    const barGlow = isBreak ? BREAK_GRAD : grad;
    const bars = last7.map(c => {
      const on = c > 0;
      return `<div style="width:3px; height:${on?'100%':'40%'}; border-radius:2px; background:${on?barGlow:'rgba(255,255,255,0.1)'};"></div>`;
    }).join('');
    const actionContent = isBreak
      ? (done ? `<span class="icon-mask" style="width:14px;height:14px; -webkit-mask-image:url(${iconUrl('shield')}); mask-image:url(${iconUrl('shield')}); color:#fff;"></span>` : '')
      : (done ? '✓' : '');
    const actionBg = done ? (isBreak ? BREAK_GRAD : grad) : 'rgba(255,255,255,0.03)';
    const actionGlow = done ? `0 0 10px ${isBreak ? BREAK_GLOW : 'rgba(139,92,246,0.5)'}` : 'none';
    return `
    <div class="glass" data-id="${habit.id}" style="height:56px; padding:0 14px; margin-bottom:16px; display:flex; align-items:center; gap:11px; ${cardSkin}">
      <div class="js-toggle-expand" style="flex:1; display:flex; align-items:center; gap:11px; cursor:pointer; min-width:0;">
        <div style="width:34px; height:34px; border-radius:10px; background:${isBreak ? 'rgba(225,29,72,0.2)' : grad+'22'}; display:flex; align-items:center; justify-content:center; flex:none;">
          <span class="icon-mask" style="width:15px; height:15px; -webkit-mask-image:url(${iconUrl(habit.icon)}); mask-image:url(${iconUrl(habit.icon)}); color:${isBreak ? '#fb7185' : grad.match(/#\w+/)[0]};"></span>
        </div>
        <div style="min-width:0;">
          <p class="title-card" style="font-size:13.5px; display:flex; align-items:center; min-width:0;">
            <span style="max-width:60%; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex-shrink:1;">${habit.title}</span>${streakBadgeHTML(habit, isBreak)}
          </p>
          <p style="font:500 10.5px sans-serif; color:#8B84A0; margin:1px 0 0;">${habit.category}</p>
        </div>
      </div>
      <div style="display:flex; align-items:flex-end; gap:2.5px; height:18px; flex:none;">${bars}</div>
      <button class="js-toggle-done" style="width:27px; height:27px; border-radius:50%; border:1.5px solid rgba(255,255,255,0.18); background:${actionBg}; box-shadow:${actionGlow}; flex:none; cursor:pointer; color:#fff; font:700 11px sans-serif; display:flex; align-items:center; justify-content:center;">${actionContent}</button>
      <span class="js-toggle-expand" style="width:12px; color:#8B84A0; font-size:11px; transform:rotate(-90deg); display:inline-block; cursor:pointer;">⌄</span>
    </div>`;
  }

  const metricLabel = isBreak
    ? `Days Clean: ${currentStreak(habit.history)}`
    : (habit.goal ? `Goal reached: ${todayCount(habit)} of ${habit.freqN || 1} today` : `${habit.category}`);
  const streakLabel = isBreak
    ? `Clean Record: ${bestStreak(habit.history)} days`
    : `${bestStreak(habit.history)} day streak`;
  const actionIcon = isBreak
    ? `<span class="icon-mask" style="width:16px;height:16px; -webkit-mask-image:url(${iconUrl('shield')}); mask-image:url(${iconUrl('shield')}); color:#fff;"></span>`
    : `<span style="color:#fff; font:700 13px sans-serif;">${done?'✓':''}</span>`;

  return `
  <div class="glass" data-id="${habit.id}" style="padding:18px 20px; margin-bottom:16px; ${cardSkin}">
    <div class="js-toggle-expand" style="display:flex; align-items:center; gap:11px; cursor:pointer;">
      <div style="width:36px; height:36px; border-radius:11px; background:${isBreak ? 'rgba(225,29,72,0.2)' : grad+'22'}; display:flex; align-items:center; justify-content:center; flex:none;">
        <span class="icon-mask" style="width:16px; height:16px; -webkit-mask-image:url(${iconUrl(habit.icon)}); mask-image:url(${iconUrl(habit.icon)}); color:#fff;"></span>
      </div>
      <div style="flex:1; min-width:0;">
        <p class="title-card" style="display:flex; align-items:center; min-width:0;">
          <span style="max-width:60%; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex-shrink:1;">${habit.title}</span>${streakBadgeHTML(habit, isBreak)}
        </p>
        <p style="font:500 11px sans-serif; color:#8B84A0; margin:2px 0 0;">${habit.category}</p>
      </div>
      <div style="position:relative; width:30px; height:30px; border-radius:50%; background:${isBreak ? BREAK_GRAD : grad}; box-shadow:0 0 12px ${isBreak ? BREAK_GLOW : 'rgba(139,92,246,0.55)'}; flex:none; display:flex; align-items:center; justify-content:center;${isBreak && !done ? ' opacity:0.55;' : ''}" class="js-toggle-done">
        ${isBreak ? (done ? actionIcon : '') : `<span style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:#fff; font:700 13px sans-serif;">${done?'✓':''}</span>`}
      </div>
      <span style="width:13px; color:#8B84A0; font-size:11px;">⌄</span>
    </div>
    ${habit.viewMode === 'mosaic' ? mosaicHTML(habit, isBreak) : weekPillHTML(habit, isBreak)}
    <div style="display:flex; align-items:center; justify-content:space-between; margin-top:10px; flex-wrap:wrap; gap:8px;">
      <div>
        <p style="font:600 11px sans-serif; color:#c9c2dd; margin:0 0 2px;">${metricLabel}</p>
        <p style="font:600 11px sans-serif; color:${isBreak ? '#fb7185' : '#C4A4FF'}; margin:0;">${streakLabel}</p>
      </div>
      <div style="display:flex; gap:8px;">
        ${isBreak ? `<button class="js-relapse" style="font:600 11px sans-serif; color:#fca5a5; background:rgba(225,29,72,0.12); border:1px solid rgba(244,63,94,0.3); padding:6px 14px; border-radius:99px; cursor:pointer;">Relapsed</button>` : ''}
        <button class="js-edit-habit" style="font:600 11px sans-serif; color:#e4dff0; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); padding:6px 14px; border-radius:99px; cursor:pointer;">Edit</button>
      </div>
    </div>
  </div>`;
}

export function bindHabitCardEvents(root, { onToggleExpand, onToggleDone, onEdit, onRelapse }){
  root.querySelectorAll('[data-id]').forEach(card => {
    const id = Number(card.dataset.id);
    card.querySelectorAll('.js-toggle-expand').forEach(el => el.addEventListener('click', () => onToggleExpand(id)));
    card.querySelectorAll('.js-toggle-done').forEach(el => el.addEventListener('click', (e) => { e.stopPropagation(); onToggleDone(id); }));
    card.querySelectorAll('.js-edit-habit').forEach(el => el.addEventListener('click', (e) => { e.stopPropagation(); onEdit(id); }));
    card.querySelectorAll('.js-relapse').forEach(el => el.addEventListener('click', (e) => { e.stopPropagation(); onRelapse?.(id); }));
  });
}
