/* preview3d.js — a rotatable blocky avatar wearing the current design.
   Each body-cube face is textured from the matching panel snapshot (front /
   back / arms), exactly like Roblox wraps classic clothing. Three.js is
   loaded on demand (still same-origin/local — no third-party calls). */
window.RCS = window.RCS || {};

RCS.Preview3D = (function () {
  let renderer, scene, camera, group, animId;
  let dragging = false, lastX = 0, autoSpin = 0.005;
  let wired = false;

  function loadThree() {
    return new Promise((res, rej) => {
      if (window.THREE) return res();
      const s = document.createElement('script');
      s.src = 'vendor/three.min.js';
      s.onload = () => res();
      s.onerror = () => rej(new Error('3D failed to load'));
      document.head.appendChild(s);
    });
  }

  function tex(cv) {
    const t = new THREE.CanvasTexture(cv);
    t.encoding = THREE.sRGBEncoding;
    t.magFilter = THREE.NearestFilter;
    t.anisotropy = 4;
    return t;
  }
  const colMat = c => new THREE.MeshBasicMaterial({ color: new THREE.Color(c) });
  const texMat = cv => new THREE.MeshBasicMaterial({ map: tex(cv) });
  // face order: +X, -X, +Y, -Y, +Z, -Z
  const mats = f => [f.px, f.nx, f.py, f.ny, f.pz, f.nz].map(x => (x && x.nodeName === 'CANVAS') ? texMat(x) : colMat(x));
  const boxMesh = (w, h, d, f) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats(f));

  function headCanvas() {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d');
    x.fillStyle = '#FFE0A3'; x.fillRect(0, 0, 128, 128);
    x.fillStyle = '#232A45';
    x.beginPath(); x.arc(46, 54, 9, 0, 7); x.fill();
    x.beginPath(); x.arc(82, 54, 9, 0, 7); x.fill();
    x.strokeStyle = '#232A45'; x.lineWidth = 8; x.lineCap = 'round';
    x.beginPath(); x.arc(64, 72, 20, 0.15 * Math.PI, 0.85 * Math.PI); x.stroke();
    return c;
  }

  function build(state) {
    const s = state.snaps, base = state.baseColor;
    const isPants = state.garment === 'pants', isTee = state.garment === 'tshirt';
    const skin = '#FFE0A3', legGrey = '#5B6473';
    const g = new THREE.Group();

    // torso 2x2x1
    const frontCv = isTee ? s.graphic : s.front;
    const backCv = isTee ? null : s.back;
    g.add(boxMesh(2, 2, 1, { px: base, nx: base, py: base, ny: base, pz: frontCv || base, nz: backCv || base }));

    // head
    const head = boxMesh(1.4, 1.4, 1.4, { px: skin, nx: skin, py: skin, ny: skin, pz: headCanvas(), nz: skin });
    head.position.y = 1.7; g.add(head);

    // arms
    const armFace = (!isPants && s.arms) ? s.arms : null;
    const armCol = isPants ? skin : base;
    const arm = x => {
      const f = armFace ? { px: armFace, nx: armFace, py: armCol, ny: armCol, pz: armFace, nz: armFace }
                        : { px: armCol, nx: armCol, py: armCol, ny: armCol, pz: armCol, nz: armCol };
      const m = boxMesh(1, 2, 1, f); m.position.set(x, 0, 0); return m;
    };
    g.add(arm(-1.5)); g.add(arm(1.5));

    // legs
    const legFace = (isPants && s.arms) ? s.arms : null;
    const legCol = isPants ? base : legGrey;
    const leg = x => {
      const f = legFace ? { px: legFace, nx: legFace, py: legCol, ny: legCol, pz: legFace, nz: legFace }
                        : { px: legCol, nx: legCol, py: legCol, ny: legCol, pz: legCol, nz: legCol };
      const m = boxMesh(1, 2, 1, f); m.position.set(x, -2, 0); return m;
    };
    g.add(leg(-0.5)); g.add(leg(0.5));

    g.position.y = 0.3; // centre the figure vertically
    return g;
  }

  function stage() { return document.querySelector('#viewer3d .v3d-stage'); }
  function sizeRenderer() {
    const st = stage(); if (!st) return;
    const w = st.clientWidth, h = st.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }

  function animate() {
    animId = requestAnimationFrame(animate);
    if (group && !dragging) group.rotation.y += autoSpin;
    renderer.render(scene, camera);
  }

  function disposeGroup(g) {
    g.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
    });
  }

  async function open(state) {
    try { await loadThree(); }
    catch (e) { alert('Could not load the 3D view.'); return; }

    if (!renderer) {
      const canvas = document.getElementById('c3d');
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputEncoding = THREE.sRGBEncoding;
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      camera.position.set(0, 0, 9);
    }
    if (!wired) {
      wired = true;
      const canvas = document.getElementById('c3d');
      const getX = e => e.touches ? e.touches[0].clientX : e.clientX;
      const down = e => { dragging = true; lastX = getX(e); };
      const move = e => { if (!dragging || !group) return; const x = getX(e); group.rotation.y += (x - lastX) * 0.01; lastX = x; };
      const up = () => { dragging = false; };
      canvas.addEventListener('mousedown', down);
      canvas.addEventListener('touchstart', down, { passive: true });
      window.addEventListener('mousemove', move);
      window.addEventListener('touchmove', move, { passive: true });
      window.addEventListener('mouseup', up);
      window.addEventListener('touchend', up);
      window.addEventListener('resize', () => { if (document.getElementById('viewer3d').classList.contains('open')) sizeRenderer(); });
    }

    if (group) { scene.remove(group); disposeGroup(group); }
    group = build(state); group.rotation.y = -0.4; scene.add(group); // start on a 3/4 front view

    document.getElementById('viewer3d').classList.add('open');
    document.getElementById('backdrop').classList.add('open');
    if (animId) { cancelAnimationFrame(animId); animId = null; } // never stack loops
    requestAnimationFrame(() => { sizeRenderer(); animate(); });
  }

  function close() {
    const v = document.getElementById('viewer3d');
    if (v) v.classList.remove('open');
    if (animId) { cancelAnimationFrame(animId); animId = null; }
  }

  return { open, close };
})();
