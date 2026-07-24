import { iconUrl, gradient, bestStreak, todayCount } from '../storage.js';

function weekPillHTML(habit){
  const labels = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
  const last7 = habit.history.slice(-7);
  const grad = gradient(habit.themeIdx);
  const cells = last7.map((count,i) => {
    const on = count > 0;
    return `<div style="display:flex; flex-direction:column; align-items:center; gap:5px;">
      <div style="width:26px; height:30px; border-radius:9px; display:flex; align-items:center; justify-content:center;
        background:${on ? grad : 'rgba(255,255,255,0.06)'}; box-shadow:${on ? '0 0 8px rgba(139,92,246,0.5)' : 'none'};">
        <span style="font:700 11px sans-serif; color:${on ? '#fff' : '#6b6480'};">${count}</span>
      </div>
      <span style="font:700 8px sans-serif; letter-spacing:.04em; color:#6b6480;">${labels[i]}</span>
    </div>`;
  }).join('');
  return `<div style="margin-top:12px; padding:12px 8px; border-radius:14px; background:rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; justify-content:space-between;">${cells}</div>`;
}

function mosaicHTML(habit){
  const grad = gradient(habit.themeIdx);
  const cells = habit.history.map(count => {
    const on = count > 0;
    return `<div style="aspect-ratio:1; border-radius:2.5px; background:${on ? grad : 'rgba(255,255,255,0.07)'}; box-shadow:${on ? '0 0 3px rgba(217,70,239,0.5)' : 'none'};"></div>`;
  }).join('');
  return `<div style="margin-top:12px; padding:10px; border-radius:14px; background:rgba(0,0,0,0.28); border:1px solid rgba(255,255,255,0.06);">
    <div style="display:grid; grid-template-columns:repeat(14,1fr); gap:3px;">${cells}</div>
  </div>`;
}

export function renderHabitCard(habit){
  const grad = gradient(habit.themeIdx);
  const done = todayCount(habit) > 0;
  const streak = bestStreak(habit.history);
  const goalText = habit.goal ? `Goal reached: ${todayCount(habit)} of ${habit.freqN || 1} today` : `${habit.category}`;

  if (!habit.expanded) {
    const last7 = habit.history.slice(-7);
    const bars = last7.map(c => {
      const on = c > 0;
      return `<div style="width:3px; height:${on?'100%':'40%'}; border-radius:2px; background:${on?grad:'rgba(255,255,255,0.1)'};"></div>`;
    }).join('');
    return `
    <div class="glass" data-id="${habit.id}" style="height:56px; padding:0 14px; margin-bottom:14px; display:flex; align-items:center; gap:11px;">
      <div class="js-toggle-expand" style="flex:1; display:flex; align-items:center; gap:11px; cursor:pointer; min-width:0;">
        <div style="width:34px; height:34px; border-radius:10px; background:${grad}22; display:flex; align-items:center; justify-content:center; flex:none;">
          <span class="icon-mask" style="width:15px; height:15px; -webkit-mask-image:url(${iconUrl(habit.icon)}); mask-image:url(${iconUrl(habit.icon)}); color:${grad.match(/#\w+/)[0]};"></span>
        </div>
        <div style="min-width:0;">
          <p class="title-card" style="font-size:13.5px;">${habit.title}</p>
          <p style="font:500 10.5px sans-serif; color:#8B84A0; margin:1px 0 0;">${habit.category}</p>
        </div>
      </div>
      <div style="display:flex; align-items:flex-end; gap:2.5px; height:18px; flex:none;">${bars}</div>
      <button class="js-toggle-done" style="width:27px; height:27px; border-radius:50%; border:1.5px solid rgba(255,255,255,0.18); background:${done?grad:'rgba(255,255,255,0.03)'}; box-shadow:${done?'0 0 10px rgba(139,92,246,0.5)':'none'}; flex:none; cursor:pointer; color:#fff; font:700 11px sans-serif;">${done?'✓':''}</button>
      <span class="js-toggle-expand" style="width:12px; color:#8B84A0; font-size:11px; transform:rotate(-90deg); display:inline-block; cursor:pointer;">⌄</span>
    </div>`;
  }

  return `
  <div class="glass" data-id="${habit.id}" style="padding:14px; margin-bottom:14px;">
    <div class="js-toggle-expand" style="display:flex; align-items:center; gap:11px; cursor:pointer;">
      <div style="width:36px; height:36px; border-radius:11px; background:${grad}22; display:flex; align-items:center; justify-content:center; flex:none;">
        <span class="icon-mask" style="width:16px; height:16px; -webkit-mask-image:url(${iconUrl(habit.icon)}); mask-image:url(${iconUrl(habit.icon)}); color:#fff;"></span>
      </div>
      <div style="flex:1; min-width:0;">
        <p class="title-card">${habit.title}</p>
        <p style="font:500 11px sans-serif; color:#8B84A0; margin:2px 0 0;">${habit.category}</p>
      </div>
      <div style="position:relative; width:30px; height:30px; border-radius:50%; background:${grad}; box-shadow:0 0 12px rgba(139,92,246,0.55); flex:none;" class="js-toggle-done">
        <span style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:#fff; font:700 13px sans-serif;">${done?'✓':''}</span>
      </div>
      <span style="width:13px; color:#8B84A0; font-size:11px;">⌄</span>
    </div>
    ${habit.viewMode === 'mosaic' ? mosaicHTML(habit) : weekPillHTML(habit)}
    <div style="display:flex; align-items:center; justify-content:space-between; margin-top:10px;">
      <div>
        <p style="font:600 11px sans-serif; color:#c9c2dd; margin:0 0 2px;">${goalText}</p>
        <p style="font:600 11px sans-serif; color:#C4A4FF; margin:0;">${streak} day streak</p>
      </div>
      <button class="js-edit-habit" style="font:600 11px sans-serif; color:#e4dff0; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); padding:6px 14px; border-radius:99px; cursor:pointer;">Edit</button>
    </div>
  </div>`;
}

export function bindHabitCardEvents(root, { onToggleExpand, onToggleDone, onEdit }){
  root.querySelectorAll('[data-id]').forEach(card => {
    const id = Number(card.dataset.id);
    card.querySelectorAll('.js-toggle-expand').forEach(el => el.addEventListener('click', () => onToggleExpand(id)));
    card.querySelectorAll('.js-toggle-done').forEach(el => el.addEventListener('click', (e) => { e.stopPropagation(); onToggleDone(id); }));
    card.querySelectorAll('.js-edit-habit').forEach(el => el.addEventListener('click', (e) => { e.stopPropagation(); onEdit(id); }));
  });
}
