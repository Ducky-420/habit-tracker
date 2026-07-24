import { exportHabitsToFile, importHabitsFromFile, loadSettings, saveSettings } from '../storage.js';

export function renderSettings(habits = []){
  const settings = loadSettings();
  const archived = habits.filter(h => h.archived);
  return `
  ${archived.length ? `
  <p class="eyebrow">Archived Habits (${archived.length})</p>
  <div class="glass" style="margin-bottom:18px; overflow:hidden;">
    ${archived.map((h, i) => `
    <div class="js-unarchive-row ${i < archived.length - 1 ? 'hairline' : ''}" data-id="${h.id}" style="display:flex; align-items:center; justify-content:space-between; padding:18px 20px; cursor:pointer;">
      <span style="font:600 13px sans-serif; color:#fff;">${h.title}</span>
      <span style="font:600 11px sans-serif; color:#C4A4FF;">Restore</span>
    </div>`).join('')}
  </div>` : ''}

  <p class="eyebrow">Data &amp; Backup</p>
  <div class="glass" style="margin-bottom:18px; overflow:hidden;">
    <div id="btn-export" class="hairline" style="display:flex; align-items:center; justify-content:space-between; padding:18px 20px; cursor:pointer;">
      <span style="font:600 13px sans-serif; color:#fff;">Export Data (JSON)</span>
      <span id="export-status" style="font:600 11px sans-serif; color:#C4A4FF;"></span>
    </div>
    <div id="btn-import" class="hairline" style="display:flex; align-items:center; justify-content:space-between; padding:18px 20px; cursor:pointer;">
      <span style="font:600 13px sans-serif; color:#fff;">Import Data</span>
      <span id="import-status" style="font:600 11px sans-serif; color:#8B84A0;">No file</span>
    </div>
    <input type="file" id="file-input" accept="application/json" style="display:none;">
    <div id="reset-row" style="display:flex; align-items:center; justify-content:space-between; padding:18px 20px; cursor:pointer;">
      <span style="font:600 13px sans-serif; color:#fca5a5;">Clear / Reset All Data</span>
    </div>
    <div id="reset-confirm" style="display:none; padding:18px 20px; background:rgba(239,68,68,0.06); border-top:1px solid rgba(255,255,255,0.07);">
      <p style="font:600 12px sans-serif; color:#fca5a5; margin:0 0 10px;">Delete all habits and history? This can't be undone.</p>
      <div style="display:flex; gap:8px;">
        <span id="reset-cancel" style="flex:1; text-align:center; padding:8px 0; border-radius:10px; background:rgba(255,255,255,0.06); color:#e4dff0; font:600 12px sans-serif; cursor:pointer;">Cancel</span>
        <span id="reset-confirm-btn" style="flex:1; text-align:center; padding:8px 0; border-radius:10px; background:linear-gradient(155deg,#f87171,#dc2626); color:#fff; font:700 12px sans-serif; cursor:pointer;">Reset All Data</span>
      </div>
    </div>
  </div>

  <p class="eyebrow">Appearance &amp; Aesthetics</p>
  <div class="glass" style="margin-bottom:18px; padding:18px 20px;">
    <p style="font:600 13px sans-serif; color:#fff; margin:0 0 10px;">Default View Mode</p>
    <div style="display:flex; gap:4px; padding:4px; border-radius:14px; background:rgba(0,0,0,0.25); margin-bottom:16px;">
      <span id="view-pill" data-mode="pill" style="flex:1; text-align:center; padding:9px 0; border-radius:11px; font:700 12px sans-serif; cursor:pointer;
        background:${settings.defaultViewMode==='pill'?'#fff':'transparent'}; color:${settings.defaultViewMode==='pill'?'#151022':'#8B84A0'};">Weekly Pill</span>
      <span id="view-mosaic" data-mode="mosaic" style="flex:1; text-align:center; padding:9px 0; border-radius:11px; font:700 12px sans-serif; cursor:pointer;
        background:${settings.defaultViewMode==='mosaic'?'#fff':'transparent'}; color:${settings.defaultViewMode==='mosaic'?'#151022':'#8B84A0'};">Scorecard Mosaic</span>
    </div>
    <div style="display:flex; align-items:center; justify-content:space-between;">
      <div>
        <p style="font:700 13px sans-serif; color:#fff; margin:0 0 2px;">Glow Effects</p>
        <p style="font:500 11px sans-serif; color:#8B84A0; margin:0;">Ambient violet background glow</p>
      </div>
      <div id="glow-switch" style="width:44px; height:26px; border-radius:99px; cursor:pointer; position:relative; flex:none; background:${settings.glowOn?'var(--grad-primary)':'rgba(255,255,255,0.1)'};">
        <div style="position:absolute; top:2px; left:${settings.glowOn?'20px':'2px'}; width:22px; height:22px; border-radius:50%; background:#fff; transition:left .18s ease;"></div>
      </div>
    </div>
  </div>

  <p class="eyebrow">App Information</p>
  <div class="glass" style="overflow:hidden;">
    <div class="hairline" style="display:flex; align-items:center; justify-content:space-between; padding:18px 20px;">
      <span style="font:600 13px sans-serif; color:#fff;">Version</span>
      <span style="font:600 12px sans-serif; color:#8B84A0;">v2.0.0 (Glass Edition)</span>
    </div>
    <div class="hairline" style="display:flex; align-items:center; justify-content:space-between; padding:18px 20px;">
      <span style="font:600 13px sans-serif; color:#fff;">GitHub Repo</span>
      <a href="#" style="font:600 12px sans-serif; text-decoration:none;">View source ↗</a>
    </div>
    <div style="display:flex; align-items:center; justify-content:space-between; padding:18px 20px;">
      <span style="font:600 13px sans-serif; color:#fff;">PWA Install</span>
      <span style="display:flex; align-items:center; gap:6px; font:600 12px sans-serif; color:#6ee7b7;"><span style="width:6px; height:6px; border-radius:50%; background:#6ee7b7; box-shadow:0 0 6px #6ee7b7;"></span>Installed</span>
    </div>
  </div>`;
}

export function bindSettingsEvents(root, { getHabits, onGlowToggle, onUnarchive }){
  const settings = loadSettings();
  root.querySelectorAll('.js-unarchive-row').forEach(el => el.addEventListener('click', () => onUnarchive?.(Number(el.dataset.id))));
  root.querySelector('#btn-export').addEventListener('click', () => {
    exportHabitsToFile(getHabits());
    root.querySelector('#export-status').textContent = 'Downloaded ✓';
  });
  root.querySelector('#btn-import').addEventListener('click', () => root.querySelector('#file-input').click());
  root.querySelector('#file-input').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try { await importHabitsFromFile(file); root.querySelector('#import-status').textContent = `Loaded ${file.name} ✓`; }
    catch { root.querySelector('#import-status').textContent = 'Invalid JSON'; }
  });
  root.querySelector('#reset-row').addEventListener('click', () => { root.querySelector('#reset-confirm').style.display = 'block'; });
  root.querySelector('#reset-cancel').addEventListener('click', () => { root.querySelector('#reset-confirm').style.display = 'none'; });
  root.querySelector('#reset-confirm-btn').addEventListener('click', () => {
    localStorage.removeItem('habits.app.data.v1');
    root.querySelector('#reset-confirm').style.display = 'none';
    root.querySelector('#import-status').textContent = 'All data cleared';
  });
  ['pill','mosaic'].forEach(mode => {
    root.querySelector(`#view-${mode}`).addEventListener('click', () => {
      settings.defaultViewMode = mode; saveSettings(settings);
      root.querySelector('#view-pill').style.background = mode==='pill' ? '#fff' : 'transparent';
      root.querySelector('#view-pill').style.color = mode==='pill' ? '#151022' : '#8B84A0';
      root.querySelector('#view-mosaic').style.background = mode==='mosaic' ? '#fff' : 'transparent';
      root.querySelector('#view-mosaic').style.color = mode==='mosaic' ? '#151022' : '#8B84A0';
    });
  });
  root.querySelector('#glow-switch').addEventListener('click', () => {
    settings.glowOn = !settings.glowOn; saveSettings(settings);
    const sw = root.querySelector('#glow-switch');
    sw.style.background = settings.glowOn ? 'var(--grad-primary)' : 'rgba(255,255,255,0.1)';
    sw.firstElementChild.style.left = settings.glowOn ? '20px' : '2px';
    onGlowToggle(settings.glowOn);
  });
}
