const quadTR = document.getElementById('quadTR');
const quadBR = document.getElementById('quadBR');
const groupTop = document.getElementById('groupTop');

const handleV = document.getElementById('handleV');
const handleH = document.getElementById('handleH');

const foldVSlider = document.getElementById('foldVSlider');
const foldHSlider = document.getElementById('foldHSlider');

let foldV = 0; // 0 = flat, 180 = fully folded (vertical crease, right onto left)
let foldH = 0; // 0 = flat, 180 = fully folded (horizontal crease, top onto bottom)

function applyTransforms() {
  const vTransform = `rotateY(${-foldV}deg)`;
  quadTR.style.transform = vTransform;
  quadBR.style.transform = vTransform;
  groupTop.style.transform = `rotateX(${-foldH}deg)`;
}

function setFoldV(value) {
  foldV = Math.max(0, Math.min(180, value));
  foldVSlider.value = foldV;
  applyTransforms();
}

function setFoldH(value) {
  foldH = Math.max(0, Math.min(180, value));
  foldHSlider.value = foldH;
  applyTransforms();
}

function snapFold(value) {
  if (value < 35) return 0;
  if (value > 145) return 180;
  return value;
}

function setTransitionsEnabled(enabled) {
  const t = enabled ? '' : 'none';
  quadTR.style.transition = t;
  quadBR.style.transition = t;
  groupTop.style.transition = t;
}

// ---- Drag: vertical fold handle ----
let draggingV = false;
let startX = 0;
let startFoldV = 0;

handleV.addEventListener('mousedown', (e) => {
  draggingV = true;
  startX = e.clientX;
  startFoldV = foldV;
  setTransitionsEnabled(false);
  e.preventDefault();
});

window.addEventListener('mousemove', (e) => {
  if (!draggingV) return;
  const delta = startX - e.clientX;
  setFoldV(startFoldV + delta * 1.2);
});

window.addEventListener('mouseup', () => {
  if (!draggingV) return;
  draggingV = false;
  setTransitionsEnabled(true);
  setFoldV(snapFold(foldV));
});

// ---- Drag: horizontal fold handle ----
let draggingH = false;
let startY = 0;
let startFoldH = 0;

handleH.addEventListener('mousedown', (e) => {
  draggingH = true;
  startY = e.clientY;
  startFoldH = foldH;
  setTransitionsEnabled(false);
  e.preventDefault();
});

window.addEventListener('mousemove', (e) => {
  if (!draggingH) return;
  const delta = e.clientY - startY;
  setFoldH(startFoldH + delta * 1.2);
});

window.addEventListener('mouseup', () => {
  if (!draggingH) return;
  draggingH = false;
  setTransitionsEnabled(true);
  setFoldH(snapFold(foldH));
});

// ---- Touch support ----
handleV.addEventListener('touchstart', (e) => {
  draggingV = true;
  startX = e.touches[0].clientX;
  startFoldV = foldV;
  setTransitionsEnabled(false);
}, { passive: true });

handleH.addEventListener('touchstart', (e) => {
  draggingH = true;
  startY = e.touches[0].clientY;
  startFoldH = foldH;
  setTransitionsEnabled(false);
}, { passive: true });

window.addEventListener('touchmove', (e) => {
  if (draggingV) {
    const delta = startX - e.touches[0].clientX;
    setFoldV(startFoldV + delta * 1.2);
  }
  if (draggingH) {
    const delta = e.touches[0].clientY - startY;
    setFoldH(startFoldH + delta * 1.2);
  }
}, { passive: true });

window.addEventListener('touchend', () => {
  if (draggingV) {
    draggingV = false;
    setTransitionsEnabled(true);
    setFoldV(snapFold(foldV));
  }
  if (draggingH) {
    draggingH = false;
    setTransitionsEnabled(true);
    setFoldH(snapFold(foldH));
  }
});

// ---- Sliders (manual precision control) ----
foldVSlider.addEventListener('input', () => setFoldV(parseFloat(foldVSlider.value)));
foldHSlider.addEventListener('input', () => setFoldH(parseFloat(foldHSlider.value)));

// ---- Auto-fold sequence ----
document.getElementById('autoFoldBtn').addEventListener('click', () => {
  setTransitionsEnabled(true);
  setFoldV(180);
  setTimeout(() => setFoldH(180), 550);
});

// ---- Unfold all ----
document.getElementById('unfoldBtn').addEventListener('click', () => {
  setTransitionsEnabled(true);
  setFoldH(0);
  setFoldV(0);
});

// ---- Crease guide toggle ----
const creaseToggleBtn = document.getElementById('creaseToggleBtn');
let creasesVisible = true;
creaseToggleBtn.addEventListener('click', () => {
  creasesVisible = !creasesVisible;
  document.querySelectorAll('.crease').forEach(c => c.classList.toggle('hidden-crease', !creasesVisible));
  creaseToggleBtn.textContent = creasesVisible ? 'Hide crease guides' : 'Show crease guides';
});

// ---- Paper color palette ----
document.querySelectorAll('.palette-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.palette-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const color = btn.dataset.back;
    document.querySelectorAll('.face-back').forEach(f => {
      f.style.background = color;
    });
  });
});

applyTransforms();
