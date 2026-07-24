import { SYMBOL_ICONS, THEME_GRADIENTS, CATEGORIES, iconUrl, gradient } from '../storage.js';

export class HabitModal {
  constructor(root, onSave){
    this.root = root;
    this.onSave = onSave;
    this.state = null;
  }

  open(habit, defaultType){
    this.editingId = habit ? habit.id : null;
    this.state = habit
      ? { title: habit.title, desc: habit.desc, icon: habit.icon, themeIdx: habit.themeIdx, customColor: habit.customColor || null, category: habit.category, freq: habit.freq, freqN: habit.freqN, goal: habit.goal, goalN: habit.goalN, type: habit.type || 'build', archived: habit.archived || false }
      : { title:'', desc:'', icon: SYMBOL_ICONS[0], themeIdx: defaultType==='break'?7:0, customColor: null, category: CATEGORIES[0], freq:'daily', freqN:1, goal:false, goalN:30, type: defaultType || 'build', archived:false };
    this.pickerOpen = false;
    this.render();
    this.root.parentElement.classList.add('open');
  }
  close(){ this.root.parentElement.classList.remove('open'); }

  render(){
    const s = this.state;
    const grad = s.customColor || gradient(s.themeIdx);
    const symbolTiles = SYMBOL_ICONS.map((icon,i) => `
      <div class="js-pick-icon" data-icon-idx="${i}" style="aspect-ratio:1; border-radius:10px; cursor:pointer; display:flex; align-items:center; justify-content:center;
        background:${icon===s.icon?grad:'rgba(255,255,255,0.04)'}; border:1px solid ${icon===s.icon?'transparent':'rgba(255,255,255,0.08)'};">
        <span class="icon-mask" style="width:16px;height:16px; -webkit-mask-image:url(${iconUrl(icon)}); mask-image:url(${iconUrl(icon)}); color:${icon===s.icon?'#fff':'#8f86a3'};"></span>
      </div>`).join('');
    const themeSwatches = THEME_GRADIENTS.map((t,i) => `
      <div class="js-pick-theme" data-theme-idx="${i}" style="width:34px; height:34px; border-radius:50%; cursor:pointer; flex:none; display:flex; align-items:center; justify-content:center; color:#fff; font:700 12px sans-serif;
        background:linear-gradient(155deg,${t.a},${t.b}); box-shadow:0 0 10px ${t.b}99; border:2px solid ${!s.customColor && i===s.themeIdx?'#fff':'transparent'};">${!s.customColor && i===s.themeIdx?'✓':''}</div>`).join('');
    const customSwatch = `
      <div id="custom-color-trigger" style="width:34px; height:34px; border-radius:50%; cursor:pointer; flex:none; display:flex; align-items:center; justify-content:center; color:#fff; font:700 14px sans-serif;
        background:${s.customColor || 'conic-gradient(from 0deg,#f87171,#facc15,#4ade80,#38bdf8,#a78bfa,#f87171)'}; box-shadow:${s.customColor ? `0 0 10px ${s.customColor}99` : 'none'}; border:2px solid ${s.customColor?'#fff':'rgba(255,255,255,0.3)'};">${s.customColor?'✓':'+'}</div>
      <input type="color" id="custom-color-input" value="${s.customColor || '#8B5CF6'}" style="position:absolute; width:1px; height:1px; opacity:0; pointer-events:none;">`;
    const categoryPills = CATEGORIES.map(c => `
      <span class="js-pick-category" data-cat="${c}" style="padding:8px 14px; border-radius:99px; font:600 11.5px sans-serif; cursor:pointer; white-space:nowrap; flex:none;
        background:${c===s.category?grad:'rgba(255,255,255,0.03)'}; color:${c===s.category?'#fff':'#d8d1ec'}; border:1px solid ${c===s.category?'transparent':'rgba(255,255,255,0.12)'};">${c}</span>`).join('');
    const modes = [{k:'daily',l:'Daily'},{k:'perday',l:'N×/day'},{k:'perweek',l:'N×/week'}];
    const targetPills = modes.map(m => `
      <span class="js-pick-target" data-mode="${m.k}" style="flex:1; text-align:center; padding:10px 0; border-radius:14px; cursor:pointer; font:700 12px sans-serif;
        background:${s.freq===m.k?'#fff':'transparent'}; color:${s.freq===m.k?'#151022':'#8B84A0'};">${m.l}</span>`).join('');
    const habitModes = [{k:'build',l:'Build (Good Habit)'},{k:'break',l:'Break (Bad Habit)'}];
    const habitModeTiles = habitModes.map(m => `
      <span class="js-pick-habit-mode" data-habit-mode="${m.k}" style="flex:1; text-align:center; padding:12px 0; border-radius:14px; cursor:pointer; font:700 12px sans-serif;
        background:${s.type===m.k ? (m.k==='break' ? 'linear-gradient(155deg,#fb7185,#e11d48)' : 'var(--grad-primary)') : 'transparent'}; color:${s.type===m.k?'#fff':'#8B84A0'};">${m.l}</span>`).join('');
    const freqUnit = s.freq === 'perweek' ? '/ week' : '/ day';
    const activeIconName = s.icon.replace(/-/g,' ').replace(/\b\w/g, c=>c.toUpperCase());

    this.root.innerHTML = `
    <div style="padding:calc(18px + env(safe-area-inset-top)) 18px calc(40px + env(safe-area-inset-bottom)); max-width:460px; margin:0 auto;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:22px;">
        <button id="modal-close" style="width:34px; height:34px; border-radius:50%; border:1px solid rgba(255,255,255,0.16); background:rgba(255,255,255,0.06); color:#e4dff0; font:600 15px sans-serif; cursor:pointer;">×</button>
        <p style="font:700 14px sans-serif; color:#fff; margin:0;">${this.editingId ? 'Edit Habit' : 'New Habit'}</p>
        <button id="modal-save" style="width:34px; height:34px; border-radius:50%; border:none; background:${grad}; box-shadow:0 0 12px ${s.type==='break'?'rgba(244,63,94,0.5)':'rgba(139,92,246,0.5)'}; color:#fff; font:700 13px sans-serif; cursor:pointer;">✓</button>
      </div>

      <p class="eyebrow">Habit Mode</p>
      <div class="glass" style="padding:5px; margin-bottom:14px; display:flex; gap:4px;">${habitModeTiles}</div>

      <p class="eyebrow">Details</p>
      <div class="glass glass-tight" style="margin-bottom:14px;">
        <div class="hairline" style="padding:8px 0;"><input id="f-title" placeholder="Title" value="${s.title}" style="width:100%; background:none; border:none; outline:none; color:#fff; font:700 14px sans-serif;"></div>
        <div style="padding:8px 0;"><input id="f-desc" placeholder="Description (optional)" value="${s.desc}" style="width:100%; background:none; border:none; outline:none; color:#d8d1ec; font:500 12.5px sans-serif;"></div>
      </div>

      <p class="eyebrow">Symbol</p>
      <div class="glass" style="padding:18px 20px; margin-bottom:14px;">
        <div id="symbol-trigger" style="display:flex; align-items:center; gap:11px; cursor:pointer;">
          <div style="width:34px; height:34px; border-radius:10px; background:${grad}; box-shadow:0 0 10px ${THEME_GRADIENTS[s.themeIdx].b}88; display:flex; align-items:center; justify-content:center; flex:none;">
            <span class="icon-mask" style="width:16px;height:16px; -webkit-mask-image:url(${iconUrl(s.icon)}); mask-image:url(${iconUrl(s.icon)}); color:#fff;"></span>
          </div>
          <p style="flex:1; font:600 12.5px sans-serif; color:#e4dff0; margin:0;">${activeIconName}</p>
          <span style="font:600 11.5px sans-serif; color:#C4A4FF;">Icon Picker ›</span>
        </div>
        ${this.pickerOpen ? `<div style="display:grid; grid-template-columns:repeat(6,1fr); gap:7px; margin-top:12px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.07);">${symbolTiles}</div>` : ''}
      </div>

      <p class="eyebrow">Theme</p>
      <div class="glass" style="padding:18px 20px; margin-bottom:14px; overflow-x:auto; position:relative;">
        <div style="display:flex; gap:12px; width:max-content; align-items:center;">${themeSwatches}
          <span style="width:1px; align-self:stretch; background:rgba(255,255,255,0.1); flex:none;"></span>
          ${customSwatch}
        </div>
      </div>

      <p class="eyebrow">Category</p>
      <div class="glass" style="padding:18px 20px; margin-bottom:14px; overflow-x:auto;">
        <div style="display:flex; gap:8px; width:max-content;">${categoryPills}</div>
      </div>

      <p class="eyebrow">Target</p>
      <div class="glass" style="padding:5px; margin-bottom:10px; display:flex; gap:4px;">${targetPills}</div>
      ${s.freq !== 'daily' ? `
      <div style="display:flex; align-items:center; justify-content:center; gap:16px; padding:6px 0 18px;">
        <button id="freq-dec" style="width:30px; height:30px; border-radius:50%; border:1px solid rgba(255,255,255,0.14); background:rgba(255,255,255,0.05); color:#fff; font:700 15px sans-serif; cursor:pointer;">−</button>
        <span style="font:700 13px sans-serif; color:#fff; min-width:70px; text-align:center;">${s.freqN} ${freqUnit}</span>
        <button id="freq-inc" style="width:30px; height:30px; border-radius:50%; border:1px solid rgba(255,255,255,0.14); background:rgba(255,255,255,0.05); color:#fff; font:700 15px sans-serif; cursor:pointer;">+</button>
      </div>` : ''}

      <div class="glass" style="padding:18px 20px; margin-top:8px; display:flex; align-items:center; justify-content:space-between;">
        <div>
          <p style="font:700 13px sans-serif; color:#fff; margin:0 0 3px;">Personal Goal</p>
          <p style="font:500 11px sans-serif; color:#8B84A0; margin:0; max-width:230px;">Set a target count for this habit.</p>
        </div>
        <div id="goal-switch" style="width:44px; height:26px; border-radius:99px; cursor:pointer; position:relative; flex:none; background:${s.goal?grad:'rgba(255,255,255,0.1)'};">
          <div style="position:absolute; top:2px; left:${s.goal?'20px':'2px'}; width:22px; height:22px; border-radius:50%; background:#fff; transition:left .18s ease;"></div>
        </div>
      </div>
      ${s.goal ? `
      <div style="display:flex; align-items:center; justify-content:center; gap:16px; padding:14px 0 0;">
        <button id="goal-dec" style="width:30px; height:30px; border-radius:50%; border:1px solid rgba(255,255,255,0.14); background:rgba(255,255,255,0.05); color:#fff; font:700 15px sans-serif; cursor:pointer;">−</button>
        <span style="font:700 13px sans-serif; color:#fff; min-width:70px; text-align:center;">${s.goalN} days</span>
        <button id="goal-inc" style="width:30px; height:30px; border-radius:50%; border:1px solid rgba(255,255,255,0.14); background:rgba(255,255,255,0.05); color:#fff; font:700 15px sans-serif; cursor:pointer;">+</button>
      </div>` : ''}
      ${this.editingId ? `
      <div id="archive-row" class="glass" style="padding:14px 20px; margin-top:14px; display:flex; align-items:center; justify-content:space-between; cursor:pointer;">
        <span style="font:600 13px sans-serif; color:#e4dff0;">${s.archived ? 'Unarchive Habit' : 'Archive Habit'}</span>
        <span class="icon-mask" style="width:16px;height:16px; -webkit-mask-image:url(${iconUrl('archive')}); mask-image:url(${iconUrl('archive')}); color:#8B84A0;"></span>
      </div>` : ''}
    </div>`;

    this.bindEvents();
  }

  bindEvents(){
    const s = this.state;
    this.root.querySelector('#modal-close').addEventListener('click', () => this.close());
    this.root.querySelector('#modal-save').addEventListener('click', () => {
      s.title = this.root.querySelector('#f-title').value.trim() || 'Untitled';
      s.desc = this.root.querySelector('#f-desc').value.trim();
      this.onSave(this.editingId, s);
      this.close();
    });
    this.root.querySelector('#symbol-trigger').addEventListener('click', () => { this.pickerOpen = !this.pickerOpen; this.render(); });
    this.root.querySelectorAll('.js-pick-icon').forEach(el => el.addEventListener('click', () => { s.icon = SYMBOL_ICONS[Number(el.dataset.iconIdx)]; this.render(); }));
    this.root.querySelectorAll('.js-pick-theme').forEach(el => el.addEventListener('click', () => { s.themeIdx = Number(el.dataset.themeIdx); s.customColor = null; this.render(); }));
    this.root.querySelectorAll('.js-pick-habit-mode').forEach(el => el.addEventListener('click', () => {
      const wasUntouched = s.themeIdx === 0 && !s.customColor;
      s.type = el.dataset.habitMode;
      if (s.type === 'break' && wasUntouched) s.themeIdx = 7; // Crimson Red preset — smart default for a fresh, uncustomized habit
      this.render();
    }));
    this.root.querySelector('#custom-color-trigger').addEventListener('click', () => this.root.querySelector('#custom-color-input').click());
    this.root.querySelector('#custom-color-input').addEventListener('input', (e) => { s.customColor = e.target.value; this.render(); });
    this.root.querySelectorAll('.js-pick-category').forEach(el => el.addEventListener('click', () => { s.category = el.dataset.cat; this.render(); }));
    this.root.querySelectorAll('.js-pick-target').forEach(el => el.addEventListener('click', () => { s.freq = el.dataset.mode; this.render(); }));
    this.root.querySelector('#freq-inc')?.addEventListener('click', () => { s.freqN++; this.render(); });
    this.root.querySelector('#freq-dec')?.addEventListener('click', () => { s.freqN = Math.max(1, s.freqN-1); this.render(); });
    this.root.querySelector('#goal-switch').addEventListener('click', () => { s.goal = !s.goal; this.render(); });
    this.root.querySelector('#goal-inc')?.addEventListener('click', () => { s.goalN++; this.render(); });
    this.root.querySelector('#goal-dec')?.addEventListener('click', () => { s.goalN = Math.max(1, s.goalN-1); this.render(); });
    this.root.querySelector('#archive-row')?.addEventListener('click', () => {
      s.archived = !s.archived;
      this.onSave(this.editingId, s);
      this.close();
    });
  }
}
