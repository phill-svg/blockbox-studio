/* app.js — Blockbox Studio orchestration.
   Single interactive Fabric canvas (the "stage") represents the active panel.
   Other panels live as serialized JSON + snapshot canvases used for the live
   avatar preview and the final export. No frameworks, no network at runtime. */
(function () {
  const S = RCS.EDIT_SCALE;
  const PROPS = ['rcsRole', 'custom', 'rcsSticker', 'globalCompositeOperation'];
  const $ = (id) => document.getElementById(id);

  const FONTS = [
    { name: 'Chunky',  css: '"Fredoka", sans-serif' },
    { name: 'Comic',   css: '"Comic Sans MS", "Comic Sans", cursive' },
    { name: 'Impact',  css: 'Impact, Haettenschweiler, sans-serif' },
    { name: 'Rounded', css: '"Trebuchet MS", sans-serif' },
    { name: 'Classic', css: 'Georgia, "Times New Roman", serif' }
  ];
  const PALETTE = ['#FF6B6B', '#FF9F45', '#FFC642', '#22C39A', '#4CB8FF', '#6C5CE7',
                   '#FF7AC6', '#8B5E3C', '#ffffff', '#B8C0D0', '#232A45', '#000000'];

  const state = {
    garment: 'shirt', baseColor: '#4CB8FF', activePanel: 'front',
    activeColor: '#6C5CE7', color2: '#ffffff', previewSide: 'front',
    brushMode: 'paint', brushSize: 14,
    panels: {}, snaps: {}
  };

  let canvas;               // fabric.Canvas
  let history = [], hIdx = -1, restoring = false, warnedUpload = false;

  /* ---------- panels ---------- */
  function panelList() { return state.garment === 'tshirt' ? ['graphic'] : ['front', 'back', 'arms']; }
  function panelDims(p) {
    if (p === 'graphic') return { w: 384, h: 384 };
    const P = RCS.PANELS[p]; return { w: P.w * S, h: P.h * S };
  }
  function serialize(cv) { return cv.toJSON(PROPS); }
  function getBg(cv) { return cv.getObjects().find(o => o.rcsRole === 'bg'); }

  function makeBg(w, h, fill) {
    return new fabric.Rect({
      left: 0, top: 0, width: w, height: h, fill: fill,
      selectable: false, evented: false, hoverCursor: 'default',
      rcsRole: 'bg', custom: false
    });
  }
  function freshPanel(p) {
    const d = panelDims(p);
    const cEl = document.createElement('canvas');
    const oc = new fabric.StaticCanvas(cEl, { width: d.w, height: d.h });
    oc.add(makeBg(d.w, d.h, state.baseColor));
    const j = serialize(oc); oc.dispose(); return j;
  }

  /* ---------- display sizing (keeps internal resolution, scales CSS only) ---------- */
  function fitCanvasDisplay() {
    const d = panelDims(state.activePanel);
    const maxW = Math.min(250, Math.max(140, window.innerWidth * 0.44));
    const maxH = Math.min(360, Math.max(200, window.innerHeight * 0.46));
    const fw = 128 * S;
    const refW = Math.round(fw * Math.min(maxW / fw, maxH / fw));
    const le = document.querySelector('.live-editor');
    if (le) le.style.setProperty('--le-w', refW + 'px');
    // Fit the editable panel into the box for the limb it represents (keeps aspect).
    let boxW, boxH;
    if (state.activePanel === 'arms') {
      if (state.garment === 'pants') { boxW = refW * 0.46; boxH = refW * 0.82; }
      else { boxW = refW * 0.5; boxH = refW; }
    } else { boxW = refW; boxH = refW; }
    const scale = Math.min(boxW / d.w, boxH / d.h);
    canvas.setDimensions({ width: Math.round(d.w * scale) + 'px', height: Math.round(d.h * scale) + 'px' }, { cssOnly: true });
    canvas.calcOffset();
  }

  /* ---------- snapshots ---------- */
  function snapActive() { state.snaps[state.activePanel] = canvas.toCanvasElement(); }

  function renderOffscreen(p, cb) {
    const d = panelDims(p);
    const cEl = document.createElement('canvas');
    const oc = new fabric.StaticCanvas(cEl, { width: d.w, height: d.h });
    oc.loadFromJSON(state.panels[p] || freshPanel(p), () => {
      const bg = getBg(oc); if (bg && !bg.custom) bg.set('fill', state.baseColor);
      oc.renderAll();
      state.snaps[p] = oc.toCanvasElement();
      state.panels[p] = serialize(oc);
      oc.dispose(); cb && cb();
    });
  }
  function refreshInactive(cb) {
    const ps = panelList().filter(p => p !== state.activePanel);
    let n = ps.length; if (!n) return cb && cb();
    ps.forEach(p => renderOffscreen(p, () => { if (--n === 0) cb && cb(); }));
  }
  function setDecoEl(el, img, color) {
    if (!el) return;
    el.style.backgroundColor = color;
    el.style.backgroundImage = img ? 'url(' + img + ')' : 'none';
    el.style.boxShadow = '';
  }
  // Which body cell currently holds the editable canvas.
  function activeCell() {
    if (state.activePanel === 'arms') return document.querySelector(state.garment === 'pants' ? '.le-leg-l' : '.le-left');
    return document.querySelector('.le-torso');
  }
  // Move the canvas onto the limb being edited, and paint the rest of the body live.
  function drawPreview() {
    const s = state.snaps;
    const isPants = state.garment === 'pants';
    const front = s.front ? s.front.toDataURL() : null;
    const arm = s.arms ? s.arms.toDataURL() : null;
    const active = activeCell();
    const wrap = canvas.wrapperEl;
    if (wrap && active && wrap.parentElement !== active) { active.appendChild(wrap); canvas.calcOffset(); }
    const decos = [
      ['.le-torso', front, state.baseColor],
      ['.le-left', isPants ? null : arm, isPants ? '#FFE0A3' : state.baseColor],
      ['.le-right', isPants ? null : arm, isPants ? '#FFE0A3' : state.baseColor],
      ['.le-leg-l', isPants ? arm : null, isPants ? state.baseColor : '#5B6473'],
      ['.le-leg-r', isPants ? arm : null, isPants ? state.baseColor : '#5B6473']
    ];
    decos.forEach(([sel, img, color]) => {
      const el = document.querySelector(sel);
      if (!el) return;
      if (el === active) { el.style.backgroundImage = 'none'; el.style.backgroundColor = 'transparent'; el.style.boxShadow = 'none'; }
      else setDecoEl(el, img, color);
    });
  }

  /* ---------- change lifecycle ---------- */
  function afterChange() {
    snapActive();
    state.panels[state.activePanel] = serialize(canvas);
    drawPreview();
    try { localStorage.setItem('rcs_project', JSON.stringify(projectData())); } catch (e) {}
  }
  function pushHistory() {
    if (restoring) return;
    history = history.slice(0, hIdx + 1);
    history.push(JSON.stringify(serialize(canvas)));
    if (history.length > 40) history.shift();
    hIdx = history.length - 1;
    updateUndoUI();
  }
  function loadHistory(i) {
    restoring = true;
    canvas.loadFromJSON(history[i], () => {
      const bg = getBg(canvas); if (bg && !bg.custom) bg.set('fill', state.baseColor);
      canvas.renderAll(); restoring = false; afterChange(); updateUndoUI();
    });
  }
  function undo() { if (hIdx > 0) { hIdx--; loadHistory(hIdx); } }
  function redo() { if (hIdx < history.length - 1) { hIdx++; loadHistory(hIdx); } }
  function updateUndoUI() {
    $('btnUndo').disabled = hIdx <= 0;
    $('btnRedo').disabled = hIdx >= history.length - 1;
  }

  function addObject(o) {
    canvas.add(o); canvas.setActiveObject(o); canvas.requestRenderAll();
    pushHistory(); afterChange();
  }

  /* ---------- tools ---------- */
  function addSticker(id) {
    const svg = RCS.Stickers.svgFor(id, state.activeColor);
    fabric.loadSVGFromString(svg, (objs, opts) => {
      const g = fabric.util.groupSVGElements(objs, opts);
      const d = panelDims(state.activePanel);
      const sc = (Math.min(d.w, d.h) * 0.42) / Math.max(g.width || 100, g.height || 100);
      g.set({ left: d.w / 2, top: d.h / 2, originX: 'center', originY: 'center',
              scaleX: sc, scaleY: sc, rcsSticker: id });
      addObject(g);
    });
  }
  function addText() {
    const d = panelDims(state.activePanel);
    const t = new fabric.IText('YOUR TEXT', {
      left: d.w / 2, top: d.h / 2, originX: 'center', originY: 'center',
      fontFamily: FONTS[0].css, fill: state.activeColor, fontSize: Math.round(d.h * 0.15),
      textAlign: 'center', stroke: '#ffffff', strokeWidth: 0, paintFirst: 'stroke', fontWeight: 700
    });
    canvas.add(t); canvas.setActiveObject(t); t.enterEditing(); t.selectAll();
    pushHistory(); afterChange(); renderDrawer('text');
  }
  function activeText() {
    const o = canvas.getActiveObject();
    return o && o.type === 'i-text' ? o : null;
  }
  function applyImageFile(file) {
    const reader = new FileReader();
    reader.onload = e => {
      fabric.Image.fromURL(e.target.result, img => {
        const d = panelDims(state.activePanel);
        const sc = (Math.min(d.w, d.h) * 0.7) / Math.max(img.width, img.height);
        img.set({ left: d.w / 2, top: d.h / 2, originX: 'center', originY: 'center', scaleX: sc, scaleY: sc });
        addObject(img);
      });
    };
    reader.readAsDataURL(file);
  }
  function applyPattern(id) {
    const tile = RCS.Patterns.build(id, state.activeColor, state.color2);
    if (!tile) return;
    const imgEl = new Image();
    imgEl.onload = () => {
      const pat = new fabric.Pattern({ source: imgEl, repeat: 'repeat' });
      const bg = getBg(canvas); bg.set({ fill: pat, custom: true });
      canvas.requestRenderAll(); pushHistory(); afterChange();
    };
    imgEl.src = tile.toDataURL();
  }
  function applyGradient() {
    const d = panelDims(state.activePanel);
    const g = new fabric.Gradient({
      type: 'linear', coords: { x1: 0, y1: 0, x2: d.w, y2: d.h },
      colorStops: [{ offset: 0, color: state.activeColor }, { offset: 1, color: state.color2 }]
    });
    const bg = getBg(canvas); bg.set({ fill: g, custom: true });
    canvas.requestRenderAll(); pushHistory(); afterChange();
  }
  function fillPart() {
    const bg = getBg(canvas); bg.set({ fill: state.activeColor, custom: true });
    canvas.requestRenderAll(); pushHistory(); afterChange();
  }
  function clearPart() {
    canvas.getObjects().slice().forEach(o => { if (o.rcsRole !== 'bg') canvas.remove(o); });
    const bg = getBg(canvas); bg.set({ fill: state.baseColor, custom: false });
    canvas.requestRenderAll(); pushHistory(); afterChange();
  }
  function ensureBrush() {
    if (!canvas.freeDrawingBrush) canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    const b = canvas.freeDrawingBrush;
    b.width = state.brushSize;
    b.color = state.brushMode === 'erase' ? 'rgba(0,0,0,1)' : state.activeColor;
  }
  function setDrawing(on) {
    canvas.isDrawingMode = on;
    if (on) { ensureBrush(); canvas.discardActiveObject(); canvas.requestRenderAll(); }
  }
  function deleteActive() {
    const o = canvas.getActiveObject();
    if (o && o.rcsRole !== 'bg') { canvas.remove(o); canvas.discardActiveObject(); pushHistory(); afterChange(); }
  }
  function setBaseColor(c) {
    state.baseColor = c;
    const bg = getBg(canvas); if (bg && !bg.custom) { bg.set('fill', c); canvas.requestRenderAll(); }
    snapActive();
    refreshInactive(drawPreview);
    try { localStorage.setItem('rcs_project', JSON.stringify(projectData())); } catch (e) {}
    document.documentElement.style.setProperty('--base', c);
  }

  /* ---------- panel + garment switching ---------- */
  function loadPanel(p, cb) {
    state.activePanel = p;
    const d = panelDims(p);
    canvas.setDimensions({ width: d.w, height: d.h });
    canvas.loadFromJSON(state.panels[p] || freshPanel(p), () => {
      const bg = getBg(canvas); if (bg && !bg.custom) bg.set('fill', state.baseColor);
      fitCanvasDisplay();
      canvas.renderAll();
      history = []; hIdx = -1; pushHistory();
      snapActive(); drawPreview(); updatePanelTabs();
      if (currentTool === 'brush') setDrawing(true);
      cb && cb();
    });
  }
  function switchPanel(p) {
    if (p === state.activePanel) return;
    state.panels[state.activePanel] = serialize(canvas); snapActive();
    loadPanel(p);
  }
  function setGarment(g) {
    if (g === state.garment) return;
    state.panels[state.activePanel] = serialize(canvas);
    state.garment = g; state.panels = {}; state.snaps = {};
    buildPanelTabs();
    document.querySelectorAll('[data-garment]').forEach(b => b.classList.toggle('on', b.dataset.garment === g));
    const first = panelList()[0];
    loadPanel(first, () => refreshInactive(drawPreview));
  }

  /* ---------- presets ---------- */
  function applyPreset(pr) {
    setGarment(pr.garment);
    state.baseColor = pr.base;
    document.documentElement.style.setProperty('--base', pr.base);
    state.panels = {};
    // Build each panel from preset data via offscreen canvases.
    const names = panelList();
    let n = names.length;
    names.forEach(name => {
      const d = panelDims(name);
      const cEl = document.createElement('canvas');
      const oc = new fabric.StaticCanvas(cEl, { width: d.w, height: d.h });
      const spec = pr[name] || {};
      const bg = makeBg(d.w, d.h, pr.base); oc.add(bg);
      const done = () => {
        // optional chest text
        if (spec.text) {
          const t = new fabric.IText(spec.text.str, {
            left: d.w / 2, top: d.h / 2, originX: 'center', originY: 'center',
            fontFamily: spec.text.font, fill: spec.text.fill, fontWeight: 700,
            stroke: spec.text.stroke, strokeWidth: spec.text.stroke ? 6 : 0, paintFirst: 'stroke',
            fontSize: Math.round(d.h * (spec.text.size || 0.3)), textAlign: 'center'
          });
          oc.add(t);
        }
        oc.renderAll();
        state.panels[name] = serialize(oc);
        state.snaps[name] = oc.toCanvasElement();
        oc.dispose();
        if (--n === 0) loadPanel(panelList()[0], drawPreview);
      };
      if (spec.pattern) {
        const tile = RCS.Patterns.build(spec.pattern.id, spec.pattern.c1, spec.pattern.c2);
        const im = new Image();
        im.onload = () => { bg.set({ fill: new fabric.Pattern({ source: im, repeat: 'repeat' }), custom: true }); done(); };
        im.src = tile.toDataURL();
      } else { done(); }
    });
    closeModals();
  }

  /* ---------- save / load / export ---------- */
  function projectData() {
    state.panels[state.activePanel] = serialize(canvas);
    return { v: 1, garment: state.garment, baseColor: state.baseColor, panels: state.panels };
  }
  function loadProject(data) {
    if (!data || !data.panels) return;
    state.garment = data.garment || 'shirt';
    state.baseColor = data.baseColor || '#4CB8FF';
    state.panels = data.panels; state.snaps = {};
    document.documentElement.style.setProperty('--base', state.baseColor);
    buildPanelTabs();
    document.querySelectorAll('[data-garment]').forEach(b => b.classList.toggle('on', b.dataset.garment === state.garment));
    loadPanel(panelList()[0], () => refreshInactive(drawPreview));
  }
  function doExport() {
    state.panels[state.activePanel] = serialize(canvas); snapActive();
    refreshInactive(() => {
      const c = RCS.Export.build(state);
      const name = state.garment + '-' + Date.now() + '.png';
      RCS.Export.download(c, name);
      openModal('uploadModal');
    });
  }

  /* ---------- UI: drawer ---------- */
  function swatchRow(colors, current, onPick) {
    const wrap = document.createElement('div'); wrap.className = 'swatches';
    colors.forEach(c => {
      const b = document.createElement('button');
      b.className = 'swatch' + (c.toLowerCase() === (current || '').toLowerCase() ? ' on' : '');
      b.style.background = c; b.title = c;
      b.onclick = () => onPick(c);
      wrap.appendChild(b);
    });
    return wrap;
  }
  function renderDrawer(tool) {
    const d = $('drawer'); d.innerHTML = '';
    const head = document.createElement('div'); head.className = 'drawer-head';
    d.appendChild(head);

    if (tool === 'colors') {
      head.textContent = 'Colours';
      d.appendChild(label('Paint colour (stickers, text, fill)'));
      d.appendChild(swatchRow(PALETTE, state.activeColor, c => { state.activeColor = c; renderDrawer('colors'); }));
      d.appendChild(customColor(state.activeColor, c => { state.activeColor = c; renderDrawer('colors'); }));
      d.appendChild(bigBtn('Fill this part', 'fill', fillPart));
      d.appendChild(label('Whole outfit base'));
      d.appendChild(swatchRow(PALETTE, state.baseColor, c => { setBaseColor(c); renderDrawer('colors'); }));
      d.appendChild(customColor(state.baseColor, c => { setBaseColor(c); renderDrawer('colors'); }));
    }

    if (tool === 'brush') {
      head.textContent = 'Paint brush';
      const modeRow = document.createElement('div'); modeRow.className = 'chips';
      [['paint', '🖌️ Brush'], ['erase', '🧽 Rubber']].forEach(([m, lbl]) => {
        const b = document.createElement('button'); b.className = 'chip big-chip' + (state.brushMode === m ? ' on' : '');
        b.textContent = lbl;
        b.onclick = () => { state.brushMode = m; ensureBrush(); renderDrawer('brush'); };
        modeRow.appendChild(b);
      });
      d.appendChild(modeRow);
      if (state.brushMode === 'paint') {
        d.appendChild(label('Brush colour'));
        d.appendChild(swatchRow(PALETTE, state.activeColor, c => { state.activeColor = c; ensureBrush(); renderDrawer('brush'); }));
        d.appendChild(customColor(state.activeColor, c => { state.activeColor = c; ensureBrush(); renderDrawer('brush'); }));
      }
      d.appendChild(label('Brush size'));
      const srow = document.createElement('div'); srow.className = 'chips';
      [['Fine', 7], ['Small', 14], ['Big', 26], ['Huge', 44]].forEach(([lbl, px]) => {
        const b = document.createElement('button'); b.className = 'chip' + (state.brushSize === px ? ' on' : '');
        b.textContent = lbl; b.onclick = () => { state.brushSize = px; ensureBrush(); renderDrawer('brush'); };
        srow.appendChild(b);
      });
      d.appendChild(srow);
      const p = document.createElement('p'); p.className = 'hint';
      p.innerHTML = 'Draw right on the shirt! 🎨<br>Use the <b>tabs</b> to draw on Front, Back or Sleeves. Pick another tool to move or delete your drawings.';
      d.appendChild(p);
    }

    if (tool === 'patterns') {
      head.textContent = 'Patterns';
      d.appendChild(label('Colour 1'));
      d.appendChild(swatchRow(PALETTE, state.activeColor, c => { state.activeColor = c; renderDrawer('patterns'); }));
      d.appendChild(label('Colour 2'));
      d.appendChild(swatchRow(PALETTE, state.color2, c => { state.color2 = c; renderDrawer('patterns'); }));
      const grid = document.createElement('div'); grid.className = 'thumb-grid';
      RCS.Patterns.catalog.forEach(pat => {
        const b = document.createElement('button'); b.className = 'thumb'; b.title = pat.name;
        const tile = RCS.Patterns.build(pat.id, state.activeColor, state.color2);
        b.style.backgroundImage = 'url(' + tile.toDataURL() + ')';
        b.onclick = () => applyPattern(pat.id);
        const cap = document.createElement('span'); cap.textContent = pat.name; b.appendChild(cap);
        grid.appendChild(b);
      });
      d.appendChild(grid);
      d.appendChild(bigBtn('Gradient fade', 'grad', applyGradient));
    }

    if (tool === 'stickers') {
      head.textContent = 'Stickers';
      d.appendChild(label('Sticker colour'));
      d.appendChild(swatchRow(PALETTE, state.activeColor, c => { state.activeColor = c; renderDrawer('stickers'); }));
      const grid = document.createElement('div'); grid.className = 'thumb-grid stickers';
      RCS.Stickers.catalog.forEach(st => {
        const b = document.createElement('button'); b.className = 'thumb'; b.title = st.name;
        const svg = RCS.Stickers.svgFor(st.id, state.activeColor);
        b.style.backgroundImage = 'url("data:image/svg+xml;utf8,' + encodeURIComponent(svg) + '")';
        b.onclick = () => addSticker(st.id);
        grid.appendChild(b);
      });
      d.appendChild(grid);
    }

    if (tool === 'text') {
      head.textContent = 'Text';
      d.appendChild(bigBtn('➕  Add text', 'add', addText));
      const t = activeText();
      const note = document.createElement('p'); note.className = 'hint';
      note.textContent = t ? 'Editing your selected text:' : 'Add text, then tap it to change these.';
      d.appendChild(note);
      // Font
      d.appendChild(label('Font'));
      const frow = document.createElement('div'); frow.className = 'chips';
      FONTS.forEach(f => {
        const b = document.createElement('button'); b.className = 'chip'; b.textContent = f.name;
        b.style.fontFamily = f.css;
        if (t && t.fontFamily === f.css) b.classList.add('on');
        b.onclick = () => { if (activeText()) { activeText().set('fontFamily', f.css); commitText(); renderDrawer('text'); } };
        frow.appendChild(b);
      });
      d.appendChild(frow);
      d.appendChild(label('Text colour'));
      d.appendChild(swatchRow(PALETTE, t ? t.fill : state.activeColor, c => {
        state.activeColor = c; if (activeText()) { activeText().set('fill', c); commitText(); } renderDrawer('text');
      }));
      d.appendChild(label('Outline'));
      const orow = document.createElement('div'); orow.className = 'chips';
      const offB = document.createElement('button'); offB.className = 'chip' + (t && !t.strokeWidth ? ' on' : ''); offB.textContent = 'None';
      offB.onclick = () => { if (activeText()) { activeText().set({ strokeWidth: 0 }); commitText(); renderDrawer('text'); } };
      orow.appendChild(offB);
      ['#ffffff', '#232A45', '#FF6B6B'].forEach(col => {
        const b = document.createElement('button'); b.className = 'chip'; b.textContent = ' ';
        b.style.background = col; b.style.minWidth = '34px';
        b.onclick = () => { if (activeText()) { activeText().set({ stroke: col, strokeWidth: 4, paintFirst: 'stroke' }); commitText(); renderDrawer('text'); } };
        orow.appendChild(b);
      });
      d.appendChild(orow);
    }

    if (tool === 'upload') {
      head.textContent = 'Upload image';
      const p = document.createElement('p'); p.className = 'hint';
      p.innerHTML = 'Add your own picture or logo.<br><b>Only use art you are allowed to use</b> — Roblox may reject copyrighted images.';
      d.appendChild(p);
      d.appendChild(bigBtn('📷  Choose a picture', 'pick', () => {
        if (!warnedUpload) { warnedUpload = true; openModal('warnModal'); }
        else $('fileImg').click();
      }));
    }
  }
  function commitText() { canvas.requestRenderAll(); pushHistory(); afterChange(); }
  function label(txt) { const l = document.createElement('div'); l.className = 'field-label'; l.textContent = txt; return l; }
  function bigBtn(txt, k, fn) { const b = document.createElement('button'); b.className = 'big-btn ' + k; b.textContent = txt; b.onclick = fn; return b; }
  function customColor(val, fn) {
    const wrap = document.createElement('label'); wrap.className = 'custom-color';
    wrap.innerHTML = '<span>Custom</span>';
    const inp = document.createElement('input'); inp.type = 'color'; inp.value = toHex(val);
    inp.oninput = () => fn(inp.value); wrap.appendChild(inp); return wrap;
  }
  function toHex(c) { return /^#([0-9a-f]{6})$/i.test(c) ? c : '#6C5CE7'; }

  /* ---------- UI: tabs ---------- */
  function buildPanelTabs() {
    const wrap = $('panelTabs'); wrap.innerHTML = '';
    const labels = RCS.LABELS[state.garment] || {};
    panelList().forEach(p => {
      const b = document.createElement('button'); b.className = 'tab'; b.dataset.panel = p;
      b.textContent = state.garment === 'tshirt' ? 'Design' : (labels[p] || p);
      b.onclick = () => { switchPanel(p); updatePanelTabs(); };
      wrap.appendChild(b);
    });
    updatePanelTabs();
  }
  function updatePanelTabs() {
    document.querySelectorAll('#panelTabs .tab').forEach(b => b.classList.toggle('on', b.dataset.panel === state.activePanel));
  }

  /* ---------- modals ---------- */
  function openModal(id) { $('backdrop').classList.add('open'); $(id).classList.add('open'); }
  function closeModals() { $('backdrop').classList.remove('open'); document.querySelectorAll('.modal').forEach(m => m.classList.remove('open')); }

  /* ---------- init ---------- */
  function init() {
    canvas = new fabric.Canvas('stage', { backgroundColor: 'transparent', preserveObjectStacking: true, selection: true });
    canvas.on('path:created', (e) => {
      const path = e.path;
      if (state.brushMode === 'erase') path.set({ globalCompositeOperation: 'destination-out', selectable: false, evented: false });
      canvas.renderAll(); pushHistory(); afterChange();
    });
    canvas.on('object:modified', () => { pushHistory(); afterChange(); });
    canvas.on('object:removed', () => { if (!restoring) afterChange(); });
    canvas.on('text:changed', () => afterChange());
    canvas.on('text:editing:exited', () => { pushHistory(); afterChange(); });
    canvas.on('selection:created', () => { if (currentTool === 'text') renderDrawer('text'); });
    canvas.on('selection:updated', () => { if (currentTool === 'text') renderDrawer('text'); });

    document.documentElement.style.setProperty('--base', state.baseColor);

    // tool rail
    let firstTool = 'colors';
    document.querySelectorAll('[data-tool]').forEach(b => {
      b.onclick = () => selectTool(b.dataset.tool);
    });
    // garment toggle
    document.querySelectorAll('[data-garment]').forEach(b => { b.onclick = () => setGarment(b.dataset.garment); });
    document.querySelector('[data-garment="shirt"]').classList.add('on');

    // top actions
    $('btnUndo').onclick = undo; $('btnRedo').onclick = redo;
    $('btnDelete').onclick = deleteActive;
    $('btnClear').onclick = () => { if (confirm('Clear everything on this part?')) clearPart(); };
    $('btnExport').onclick = doExport;
    $('btnExportTop').onclick = doExport;
    $('btnHelp').onclick = () => openModal('helpModal');
    $('btnUploadHelp').onclick = () => openModal('uploadModal');
    $('btnSave').onclick = () => {
      const blob = new Blob([JSON.stringify(projectData())], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = 'my-design.blockbox.json'; a.click(); URL.revokeObjectURL(a.href);
    };
    $('btnLoad').onclick = () => $('fileProj').click();
    $('fileProj').onchange = e => {
      const f = e.target.files[0]; if (!f) return;
      const r = new FileReader(); r.onload = ev => { try { loadProject(JSON.parse(ev.target.result)); } catch (x) { alert('That file could not be opened.'); } };
      r.readAsDataURL ? r.readAsText(f) : r.readAsText(f);
      e.target.value = '';
    };
    $('fileImg').onchange = e => { const f = e.target.files[0]; if (f) applyImageFile(f); e.target.value = ''; };

    // presets
    const pl = $('presetList');
    RCS.Presets.forEach(pr => {
      const b = document.createElement('button'); b.className = 'preset';
      b.innerHTML = '<span class="pe">' + pr.emoji + '</span>' + pr.name;
      b.onclick = () => applyPreset(pr);
      pl.appendChild(b);
    });

    // modal closers
    document.querySelectorAll('[data-close]').forEach(b => b.onclick = closeModals);
    $('backdrop').onclick = closeModals;
    $('warnOk').onclick = () => { closeModals(); $('fileImg').click(); };

    let rz;
    window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(fitCanvasDisplay, 120); });

    buildPanelTabs();
    selectTool('colors');

    // restore autosave if present
    let restored = false;
    try {
      const saved = localStorage.getItem('rcs_project');
      if (saved) { loadProject(JSON.parse(saved)); restored = true; }
    } catch (e) {}
    if (!restored) loadPanel('front', () => refreshInactive(drawPreview));

    updateUndoUI();
  }

  let currentTool = 'colors';
  function selectTool(tool) {
    currentTool = tool;
    document.querySelectorAll('[data-tool]').forEach(b => b.classList.toggle('on', b.dataset.tool === tool));
    setDrawing(tool === 'brush');
    renderDrawer(tool);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
