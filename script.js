const quadTR = document.getElementById('quadTR');
const quadBR = document.getElementById('quadBR');
const groupTop = document.getElementById('groupTop');
const cornerFlap = document.getElementById('cornerFlap');
const scene = document.getElementById('scene');
const statusLine = document.getElementById('statusLine');
const paperShadow = document.getElementById('paperShadow');

const handleV = document.getElementById('handleV');
const handleH = document.getElementById('handleH');
const orbitKnob = document.getElementById('orbitKnob');

const foldVSlider = document.getElementById('foldVSlider');
const foldHSlider = document.getElementById('foldHSlider');
const foldCSlider = document.getElementById('foldCSlider');

let foldV = 0;   // vertical crease, 0-180
let foldH = 0;   // horizontal crease, 0-180
let foldC = 0;   // diagonal corner crease, 0-180
let orbitX = -18; // scene tilt (starts slightly tilted for a nicer default view)
let orbitY = 20;

function applyTransforms() {
  const vTransform = `rotateY(${-foldV}deg)`;
  quadTR.style.transform = vTransform;
  quadBR.style.transform = vTransform;
  groupTop.style.transform = `rotateX(${-foldH}deg)`;
  // Diagonal fold uses an arbitrary rotation axis (1, -1, 0) along the
  // anti-diagonal of the quadrant, instead of the plain X/Y axes above.
  cornerFlap.style.transform = `rotate3d(1, -1, 0, ${foldC}deg)`;
  updateShadow();
  updateStatus();
}

function updateShadow() {
  const progress = (foldV + foldH) / 360; // 0 (flat) -> 1 (fully folded)
  const scale = 1 - progress * 0.55;
  const opacity = 0.5 + progress * 0.3;
  paperShadow.style.transform =
    `translate(-50%, -50%) translateZ(-140px) rotateX(90deg) scale(${scale})`;
  paperShadow.style.opacity = opacity.toFixed(2);
}

function updateStatus() {
  if (foldV === 0 && foldH === 0 && foldC === 0) {
    statusLine.textContent = 'Flat sheet';
  } else if (foldV === 180 && foldH === 180 && foldC === 180) {
    statusLine.textContent = 'Fully folded — corner tucked';
  } else if (foldV === 180 && foldH === 180) {
    statusLine.textContent = 'Folded into a quarter square';
  } else if (foldV === 180) {
    statusLine.textContent = 'Folded in half (vertical)';
  } else if (foldH === 180) {
    statusLine.textContent = 'Folded in half (horizontal)';
  } else {
    statusLine.textContent = 'Mid-fold';
  }
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

function setFoldC(value) {
  foldC = Math.max(0, Math.min(180, value));
  foldCSlider.value = foldC;
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
  cornerFlap.style.transition = t;
}

// ---- Sound engine (Web Audio, synthesized paper crinkle) ----
let audioCtx = null;
let soundOn = false;

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playCrinkle() {
  if (!soundOn || !audioCtx) return;
  const duration = 0.18;
  const bufferSize = audioCtx.sampleRate * duration;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 1800 + Math.random() * 1200;

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);
  noise.start();
}

document.getElementById('soundBtn').addEventListener('click', (e) => {
  soundOn = !soundOn;
  if (soundOn) initAudio();
  e.target.textContent = soundOn ? 'Sound: on' : 'Sound: off';
  e.target.classList.toggle('active', soundOn);
});

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
  e.stopPropagation();
});

window.addEventListener('mousemove', (e) => {
  if (draggingV) {
    const delta = startX - e.clientX;
    setFoldV(startFoldV + delta * 1.2);
  }
  if (draggingH) {
    const delta = e.clientY - startY;
    setFoldH(startFoldH + delta * 1.2);
  }
  if (draggingOrbit) {
    const dx = e.clientX - orbitStartX;
    const dy = e.clientY - orbitStartY;
    setOrbit(orbitStartValX + dy * 0.4, orbitStartValY + dx * 0.4);
  }
});

window.addEventListener('mouseup', () => {
  if (draggingV) {
    draggingV = false;
    setTransitionsEnabled(true);
    const snapped = snapFold(foldV);
    if (snapped !== foldV) playCrinkle();
    setFoldV(snapped);
  }
  if (draggingH) {
    draggingH = false;
    setTransitionsEnabled(true);
    const snapped = snapFold(foldH);
    if (snapped !== foldH) playCrinkle();
    setFoldH(snapped);
  }
  draggingOrbit = false;
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
  e.stopPropagation();
});

// ---- Drag: orbit knob (rotate the whole scene) ----
let draggingOrbit = false;
let orbitStartX = 0;
let orbitStartY = 0;
let orbitStartValX = 0;
let orbitStartValY = 0;

function setOrbit(x, y) {
  orbitX = Math.max(-70, Math.min(70, x));
  orbitY = Math.max(-90, Math.min(90, y));
  scene.style.transform = `rotateX(${orbitX}deg) rotateY(${orbitY}deg)`;
}

orbitKnob.addEventListener('mousedown', (e) => {
  draggingOrbit = true;
  orbitStartX = e.clientX;
  orbitStartY = e.clientY;
  orbitStartValX = orbitX;
  orbitStartValY = orbitY;
  scene.style.transition = 'none';
  e.preventDefault();
});

window.addEventListener('mouseup', () => {
  if (draggingOrbit) {
    scene.style.transition = 'transform 0.4s ease';
  }
});

document.getElementById('resetViewBtn').addEventListener('click', () => {
  scene.style.transition = 'transform 0.4s ease';
  setOrbit(-18, 20);
});

// ---- Touch support (fold handles) ----
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

orbitKnob.addEventListener('touchstart', (e) => {
  draggingOrbit = true;
  orbitStartX = e.touches[0].clientX;
  orbitStartY = e.touches[0].clientY;
  orbitStartValX = orbitX;
  orbitStartValY = orbitY;
  scene.style.transition = 'none';
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
  if (draggingOrbit) {
    const dx = e.touches[0].clientX - orbitStartX;
    const dy = e.touches[0].clientY - orbitStartY;
    setOrbit(orbitStartValX + dy * 0.4, orbitStartValY + dx * 0.4);
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
  if (draggingOrbit) {
    draggingOrbit = false;
    scene.style.transition = 'transform 0.4s ease';
  }
});

// ---- Sliders (manual precision control) ----
foldVSlider.addEventListener('input', () => setFoldV(parseFloat(foldVSlider.value)));
foldHSlider.addEventListener('input', () => setFoldH(parseFloat(foldHSlider.value)));
foldCSlider.addEventListener('input', () => setFoldC(parseFloat(foldCSlider.value)));

// ---- Guided auto-fold sequence ----
document.getElementById('autoFoldBtn').addEventListener('click', () => {
  setTransitionsEnabled(true);
  statusLine.textContent = 'Step 1: folding vertically…';
  setFoldV(180);
  setTimeout(() => {
    playCrinkle();
    statusLine.textContent = 'Step 2: folding horizontally…';
    setFoldH(180);
  }, 550);
  setTimeout(() => {
    playCrinkle();
    statusLine.textContent = 'Step 3: tucking the corner…';
    setFoldC(180);
  }, 1150);
  setTimeout(() => {
    playCrinkle();
    updateStatus();
  }, 1700);
});

// ---- Unfold all ----
document.getElementById('unfoldBtn').addEventListener('click', () => {
  setTransitionsEnabled(true);
  setFoldC(0);
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

setOrbit(orbitX, orbitY);
applyTransforms();
