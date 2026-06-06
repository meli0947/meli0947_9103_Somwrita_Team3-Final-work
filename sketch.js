// =============================================================
// sketch.js  —  Main entry point
// Starry Deep-Sea Aquarium  |  IDEA9103 Team 3
// =============================================================
// Loads and coordinates all mechanic modules:
//   input-controls.js  (Zihan Zhong)   ← user input
//   perlin-layer.js    (Xuanning Jin)   ← organic movement (TBD)
//   time-mechanic.js   (Menghao Li)     ← day/night cycle (TBD)
//   audio-mechanic.js  (Yuzhu Wei)      ← sound reactivity (TBD)
// =============================================================

let stars   = [];
let schools = [];

// How many individuals per school for each species
const SCHOOL_COUNTS = { 1: 22, 2: 10, 3: 12 };

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(RGB);
  initInputControls();  // from input-controls.js
  initScene();
}

function initScene() {
  stars   = [];
  schools = [];

  // ── Starfield ─────────────────────────────────────────────
  for (let i = 0; i < 280; i++) {
    stars.push({
      x:             random(width),
      y:             random(height),
      size:          random(0.5, 2.8),
      bright:        random(150, 255),
      twinkleSpeed:  random(0.01, 0.04),
      twinkleOffset: random(TWO_PI)
    });
  }

  // ── Three schools, spread far apart so they don't overlap ──
  // We place them in three different regions of the canvas.
  let regions = [
    { cx: width * 0.2,  cy: height * 0.3 },
    { cx: width * 0.65, cy: height * 0.55 },
    { cx: width * 0.4,  cy: height * 0.75 }
  ];

  for (let s = 0; s < 3; s++) {
    let dir    = random(TWO_PI);
    let count  = SCHOOL_COUNTS[1]; // default species 1 count
    let members = _buildMembers(count);

    schools.push({
      cx:   regions[s].cx,
      cy:   regions[s].cy,
      vx:   cos(dir) * 0.5,
      vy:   sin(dir) * 0.2,
      fish: members
    });
  }
}

/**
 * Build the individual member offsets for a school.
 * Members are arranged in a loose grid so they don't stack on top
 * of each other. The grid spacing is proportional to species size.
 */
function _buildMembers(count) {
  let members = [];
  // Arrange in a rough grid: columns of ~5
  let cols    = 5;
  let spacingX = 28;
  let spacingY = 20;
  for (let i = 0; i < count; i++) {
    let col = i % cols;
    let row = floor(i / cols);
    members.push({
      // Offset from school centre, with a little noise so it's not a perfect grid
      offsetX:  (col - cols / 2) * spacingX + random(-6, 6),
      offsetY:  (row - 1.5)      * spacingY + random(-4, 4),
      size:     random(7, 12),
      speed:    random(0.4, 0.8),
    });
  }
  return members;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initScene();
}


// ── Draw loop ─────────────────────────────────────────────────

function draw() {
  _drawBackground();
  _drawStars();
  updateInputLayer();        // food pellets + ripples (input-controls.js)
  _updateAndDrawSchools();
}


// ── Background ────────────────────────────────────────────────

function _drawBackground() {
  for (let y = 0; y < height; y++) {
    let t = y / height;
    stroke(lerp(2, 1, t), lerp(8, 18, t), lerp(45, 14, t));
    line(0, y, width, y);
  }
}


// ── Starfield ─────────────────────────────────────────────────

function _drawStars() {
  noStroke();
  for (let s of stars) {
    let tw    = sin(frameCount * s.twinkleSpeed + s.twinkleOffset);
    let alpha = map(tw, -1, 1, 80, s.bright);
    let sz    = s.size + map(tw, -1, 1, 0, 0.8);
    if (s.size > 1.8) { fill(200, 220, 255, 18); ellipse(s.x, s.y, sz * 4, sz * 4); }
    fill(210, 225, 255, alpha);
    ellipse(s.x, s.y, sz, sz);
    if (s.size > 2.2 && tw > 0.5) {
      stroke(220, 235, 255, alpha * 0.6);
      strokeWeight(0.5);
      let arm = sz * 2.5;
      line(s.x - arm, s.y, s.x + arm, s.y);
      line(s.x, s.y - arm, s.x, s.y + arm);
      noStroke();
    }
  }
}


// ── Schools ───────────────────────────────────────────────────

function _updateAndDrawSchools() {
  let food    = getFoodParticles();   // from input-controls.js
  let ripps   = getRipples();         // from input-controls.js
  let species = getCurrentSpecies();  // 1, 2, or 3

  // Pick the correct draw function
  let drawFn;
  if      (species === 2) drawFn = drawMantaRay;
  else if (species === 3) drawFn = drawJellyfish;
  else                    drawFn = drawSmallFish;

  for (let sc of schools) {

    // ── Food attraction ──────────────────────────────────────
    // Find the nearest food pellet within attract radius
    let nearest     = null;
    let nearestDist = Infinity;
    for (let f of food) {
      let d = dist(sc.cx, sc.cy, f.x, f.y);
      if (d < FOOD_ATTRACT_RADIUS && d < nearestDist) {
        nearest     = f;
        nearestDist = d;
      }
    }

    if (nearest) {
      // Steer toward food — stronger pull the closer it is
      let strength = map(nearestDist, 0, FOOD_ATTRACT_RADIUS, 0.006, 0.002);
      let ax = (nearest.x - sc.cx) * strength;
      let ay = (nearest.y - sc.cy) * strength;
      sc.vx  = lerp(sc.vx, sc.vx + ax, 0.18);
      sc.vy  = lerp(sc.vy, sc.vy + ay, 0.18);
    }

    // ── Ripple repulsion ─────────────────────────────────────
    for (let r of ripps) {
      let d = dist(sc.cx, sc.cy, r.x, r.y);
      if (d < RIPPLE_DISTURB_RADIUS && d > 0.1) {
        let force = map(d, 0, RIPPLE_DISTURB_RADIUS, 0.9, 0);
        sc.vx += ((sc.cx - r.x) / d) * force * 0.05;
        sc.vy += ((sc.cy - r.y) / d) * force * 0.05;
      }
    }

    // ── Anti-overlap: push schools away from each other ──────
    // Each school repels other schools if centres come too close.
    for (let other of schools) {
      if (other === sc) continue;
      let d = dist(sc.cx, sc.cy, other.cx, other.cy);
      let minDist = 220; // minimum distance between school centres
      if (d < minDist && d > 0.1) {
        let push = map(d, 0, minDist, 0.6, 0);
        sc.vx += ((sc.cx - other.cx) / d) * push * 0.04;
        sc.vy += ((sc.cy - other.cy) / d) * push * 0.04;
      }
    }

    // ── Velocity cap + boundary bounce ───────────────────────
    let maxSpd = species === 3 ? 0.7 : 1.6; // jellyfish drift slower
    sc.vx = constrain(sc.vx, -maxSpd, maxSpd);
    sc.vy = constrain(sc.vy, -maxSpd * 0.5, maxSpd * 0.5);

    sc.cx += sc.vx;
    sc.cy += sc.vy;

    if (sc.cx < 80  || sc.cx > width  - 80)  sc.vx *= -1;
    if (sc.cy < 100 || sc.cy > height - 100)  sc.vy *= -1;

    // ── Draw each member ──────────────────────────────────────
    let facingRight = sc.vx >= 0;

    for (let f of sc.fish) {
      let t  = frameCount * f.speed * 0.012;
      let fx = sc.cx + f.offsetX + sin(t + f.offsetX * 0.1) * 6;
      let fy = sc.cy + f.offsetY + cos(t * 1.3 + f.offsetY * 0.1) * 4;
      let alpha = random(140, 200);
      let col   = color(200, 220, 255, alpha);

      if (species === 3) {
        // Jellyfish bob up and down (different phase per member)
        fy += sin(frameCount * 0.03 + f.offsetX * 0.05) * 8;
        drawJellyfish(fx, fy, f.size, col);
      } else if (species === 2) {
        drawMantaRay(fx, fy, f.size, col, facingRight);
      } else {
        drawSmallFish(fx, fy, f.size, col, facingRight);
      }
    }
  }
}

// ── Input callbacks live in input-controls.js ─────────────────
// mousePressed(), mouseDragged(), keyPressed() are defined there.