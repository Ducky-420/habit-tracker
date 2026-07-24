export function renderHeader({ dateLabel, completed, total, streak }){
  const pct = total ? Math.round(completed/total*100) : 0;
  const ringA = 251, offA = ringA - (ringA * pct/100);
  const ringB = 182, offB = ringB - (ringB * Math.min(streak/14,1));
  return `
  <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
    <div>
      <p class="eyebrow" style="margin:0 0 4px;">${dateLabel}</p>
      <h2 class="title-lg">Dashboard</h2>
    </div>
    <div style="display:flex; gap:8px;">
      <button id="btn-view-toggle" class="glass" style="width:36px; height:36px; border-radius:12px; border:1px solid rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center; color:#c9c2dd; cursor:pointer;">▦</button>
      <button id="btn-settings-shortcut" class="glass" style="width:36px; height:36px; border-radius:12px; border:1px solid rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center; color:#c9c2dd; cursor:pointer;">⚙</button>
    </div>
  </div>
  <div class="glass" style="padding:20px; display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:14px;">
    <div>
      <p class="eyebrow">Goal Summary</p>
      <p style="font:700 18px sans-serif; color:#fff; margin:0 0 4px;">${completed} of ${total} completed today</p>
      <p style="font:700 13px sans-serif; color:var(--violet-light); margin:0 0 14px;">${pct}% completion</p>
      <p style="font:600 12px sans-serif; color:#f0abfc; margin:0;">${streak} day streak</p>
    </div>
    <svg width="92" height="92" viewBox="0 0 92 92" style="flex:none; filter:drop-shadow(0 0 8px rgba(139,92,246,0.35));">
      <circle cx="46" cy="46" r="40" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="7"/>
      <circle cx="46" cy="46" r="40" fill="none" stroke="url(#ringA)" stroke-width="7" stroke-linecap="round" stroke-dasharray="${ringA}" stroke-dashoffset="${offA}" transform="rotate(-90 46 46)"/>
      <circle cx="46" cy="46" r="29" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="7"/>
      <circle cx="46" cy="46" r="29" fill="none" stroke="url(#ringB)" stroke-width="7" stroke-linecap="round" stroke-dasharray="${ringB}" stroke-dashoffset="${offB}" transform="rotate(-90 46 46)"/>
      <defs>
        <linearGradient id="ringA" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#c4a4ff"/><stop offset="100%" stop-color="#7c3aed"/></linearGradient>
        <linearGradient id="ringB" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f0abfc"/><stop offset="100%" stop-color="#c026d3"/></linearGradient>
      </defs>
    </svg>
  </div>`;
}

export function bindHeaderEvents(root, { onViewToggle, onSettings }){
  root.querySelector('#btn-view-toggle')?.addEventListener('click', onViewToggle);
  root.querySelector('#btn-settings-shortcut')?.addEventListener('click', onSettings);
}

export function renderCategoryFilter(categories, active){
  const pills = ['All', ...categories];
  const chips = pills.map(c => `
    <span class="js-filter-pill" data-cat="${c}" style="padding:9px 16px; border-radius:99px; font:600 12px sans-serif; cursor:pointer; white-space:nowrap; flex:none;
      background:${c===active?'var(--grad-primary)':'rgba(255,255,255,0.04)'}; color:${c===active?'#fff':'#d8d1ec'}; border:1px solid ${c===active?'transparent':'rgba(255,255,255,0.12)'};
      box-shadow:${c===active?'0 4px 14px rgba(124,58,237,0.4)':'none'};">${c}</span>`).join('');
  return `<div class="glass" style="padding:10px; margin-bottom:14px; overflow-x:auto;">
    <div style="display:flex; gap:8px; width:max-content;">${chips}</div>
  </div>`;
}

export function bindCategoryFilterEvents(root, { onSelect }){
  root.querySelectorAll('.js-filter-pill').forEach(el => el.addEventListener('click', () => onSelect(el.dataset.cat)));
}
