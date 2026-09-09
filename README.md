# Origami Fold Simulator

An interactive paper-folding toy built with vanilla HTML, CSS, and JavaScript — using real nested 3D transforms instead of a flat visual trick.

## What it does

Drag the two grab-tabs (⇤ on the right edge, ⇓ on the top edge) to fold a virtual square of paper, just like folding a real napkin into a quarter. Each flap hinges around its actual crease line and correctly carries whatever is folded onto it — a true nested fold, not a pre-baked animation.

- **Drag to fold** — grab either handle and drag to control the fold angle in real time
- **Snap-to-crease** — release near flat or fully folded and it snaps cleanly into place
- **Sliders** — precise manual control over both fold angles (0°–180°)
- **Auto-fold** — watch it fold itself in sequence
- **Unfold all** — flattens the paper back out
- **Crease guides** — toggle dashed lines showing where the folds are
- **4 paper colors** — see the reverse side of the paper revealed as you fold

## How it works

The paper is split into a 2×2 grid of quadrants, grouped into a top pair and a bottom pair:

```
paper
├── group-top (hinges down via rotateX — the horizontal fold)
│   ├── quad-top-left   (static)
│   └── quad-top-right  (hinges via rotateY — the vertical fold)
└── group-bottom (static base)
    ├── quad-bottom-left  (static)
    └── quad-bottom-right (hinges via rotateY — same vertical fold)
```

Because every group and quadrant uses `transform-style: preserve-3d`, a parent's rotation automatically carries its children along with it — exactly like folding a real sheet of paper carries along whatever's already folded into it. That nesting is what makes this a genuine simulation rather than a flat animation.

Each foldable quadrant has two stacked faces (front pattern, back color) using `backface-visibility: hidden`, so the correct side becomes visible the moment the fold passes 90°.

Dragging converts mouse movement into a live rotation angle; releasing snaps to 0° or 180° if you're close enough, using CSS transitions for the settle animation.

## Running it

No build step needed — just open `index.html` in a browser, or serve the folder locally:

```bash
python3 -m http.server 8000
```

## Files

- `index.html` — structure: nested fold groups, handles, controls
- `style.css` — 3D transform setup, hinge origins, visual styling
- `script.js` — drag interaction, fold state, snapping, palette logic

## Ideas for extending it

- Add a diagonal corner fold using `rotate3d()` around an arbitrary axis
- Chain fold presets into a guided "fold a paper boat" tutorial
- Add subtle paper-crease shading (darker gradient near active creases)
- Sound effect on snap (paper crease "crinkle")
