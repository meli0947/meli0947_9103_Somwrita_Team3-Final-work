
// =============================================================
// sketch.js  —  Main entry point
// Starry Deep-Sea Aquarium  |  IDEA9103 Team 3
// =============================================================
// This file sets up the canvas and calls each mechanic module
// every frame. It also handles the communication between modules:
//   - input-controls.js  (Zihan Zhong)   ← YOU ARE HERE
//   - perlin-layer.js    (Xuanning Jin)   ← fish movement
//   - time-mechanic.js   (Menghao Li)     ← day/night cycle
//   - audio-mechanic.js  (Yuzhu Wei)      ← sound reactivity
// =============================================================
 
let stars   = [];
let schools = [];
 
function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(RGB);
 
  // Initialise the user-input mechanic (input-controls.js)
  initInputControls();
 
  initScene();
}
 
function initScene() {
  stars   = [];
  schools = [];
 
  // ── Starfield ─────────────────────────────────────────────
  for (let i = 0; i < 280; i++) {
    stars.push({
      x:            random(width),
      y:            random(height),
      size:         random(0.5, 2.8),
      bright:       random(150, 255),
      twinkleSpeed: random(0.01, 0.04),
      twinkleOffset: random(TWO_PI)
    });
  }
 
  // ── Fish schools ──────────────────────────────────────────
  // Spawned with default species (1 = small fish).
  // getCurrentSpecies() is checked each frame so pressing 1/2/3
  // changes what drawFish function is used immediately.
  for (let s = 0; s < 3; s++) {
    let cx  = random(80, width - 80);
    let cy  = random(100, height - 100);
    let dir = random(TWO_PI);
 
    let school = [];
    for (let i = 0; i < random(18, 30); i++) {
      school.push({
        offsetX:      random(-60, 60),
        offsetY:      random(-30, 30),
        size:         random(5, 10),
        speed:        random(0.4, 0.9),
        facingRight:  true  // updated each frame from velocity
      });
    }
 
    schools.push({
      cx, cy,
      vx: cos(dir) * 0.5,
      vy: sin(dir) * 0.2,
      fish: school
    });
  }
}
 
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initScene();
}
 
// ── Draw loop ─────────────────────────────────────────────────
function draw() {
 
  // 1. Background gradient (deep navy)
  _drawBackground();
 
  // 2. Starfield
  _drawStars();
 
  // 3. Input layer — food pellets + ripples
  //    Must be drawn BEFORE fish so pellets appear under them
  updateInputLayer();
 
  // 4. Fish schools
  //    Attraction toward food & repulsion from ripples applied here
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
 
// ── Stars ─────────────────────────────────────────────────────
function _drawStars() {
  noStroke();
  for (let s of stars) {
    let tw    = sin(frameCount * s.twinkleSpeed + s.twinkleOffset);
    let alpha = map(tw, -1, 1, 80, s.bright);
    let sz    = s.size + map(tw, -1, 1, 0, 0.8);
 
    if (s.size > 1.8) {
      fill(200, 220, 255, 18);
      ellipse(s.x, s.y, sz * 4, sz * 4);
    }
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
  let food   = getFoodParticles();   // from input-controls.js
  let ripps  = getRipples();         // from input-controls.js
  let species = getCurrentSpecies(); // 1, 2, or 3
 
  // Pick the correct draw function for the active species
  // (defined in input-controls.js)
  let drawFn;
  if      (species === 2) drawFn = drawShark;
  else if (species === 3) drawFn = drawRay;
  else                    drawFn = drawSmallFish;
 
  for (let sc of schools) {
 
    // ── Food attraction ──────────────────────────────────────
    // If any food pellet is within FOOD_ATTRACT_RADIUS of this
    // school's centre, steer gently toward the nearest one.
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
      // Ease toward the food pellet
      let ax = (nearest.x - sc.cx) * 0.003;
      let ay = (nearest.y - sc.cy) * 0.003;
      sc.vx  = lerp(sc.vx, sc.vx + ax, 0.15);
      sc.vy  = lerp(sc.vy, sc.vy + ay, 0.15);
    }
 
    // ── Ripple repulsion ─────────────────────────────────────
    // Active ripples push the school away from their centre.
    for (let r of ripps) {
      let d = dist(sc.cx, sc.cy, r.x, r.y);
      if (d < RIPPLE_DISTURB_RADIUS && d > 0.1) {
        // Push direction: away from ripple centre
        let pushX = (sc.cx - r.x) / d;
        let pushY = (sc.cy - r.y) / d;
        let force = map(d, 0, RIPPLE_DISTURB_RADIUS, 0.8, 0);
        sc.vx += pushX * force * 0.04;
        sc.vy += pushY * force * 0.04;
      }
    }
 
    // ── Velocity cap + boundary bounce ───────────────────────
    let maxSpd = 1.8;
    sc.vx = constrain(sc.vx, -maxSpd, maxSpd);
    sc.vy = constrain(sc.vy, -maxSpd * 0.5, maxSpd * 0.5);
 
    sc.cx += sc.vx;
    sc.cy += sc.vy;
 
    if (sc.cx < 60 || sc.cx > width - 60)  sc.vx *= -1;
    if (sc.cy < 80 || sc.cy > height - 80) sc.vy *= -1;
 
    // ── Draw each fish in the school ──────────────────────────
    let facingRight = sc.vx >= 0;
 
    for (let f of sc.fish) {
      let t  = frameCount * f.speed * 0.012;
      let fx = sc.cx + f.offsetX + sin(t + f.offsetX) * 8;
      let fy = sc.cy + f.offsetY + cos(t * 1.3 + f.offsetY) * 5;
      let col = color(200, 220, 255, random(140, 200));
 
      drawFn(fx, fy, f.size, col, facingRight);
    }
  }
}
 
// ── p5 input callbacks are defined in input-controls.js ──────
// mousePressed(), mouseDragged(), keyPressed() all live there.