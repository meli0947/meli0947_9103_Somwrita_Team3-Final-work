// =============================================================
// input-controls.js
// User Input Mechanic — Interactive Feeding & Species Switching
// Creative Director: Zihan Zhong
// =============================================================
// Interactions:
//   Mouse Click  → Drop food pellets; nearby schools are attracted
//   Mouse Drag   → Create expanding ripple rings that repel schools
//   Keyboard 1   → Switch to Small Fish school
//   Keyboard 2   → Switch to Manta Ray school
//   Keyboard 3   → Switch to Jellyfish school
// =============================================================
// This code was developed with the assistance of Claude (Anthropic).
// Species drawing functions (drawSmallFish, drawMantaRay, drawJellyfish)
// are hand-crafted in p5.js to match the provided reference silhouettes.
// =============================================================


// ── Module state ──────────────────────────────────────────────

let foodParticles = [];  // Active food pellets
let ripples       = [];  // Active ripple rings
let currentSpecies = 1;  // 1 = Small Fish, 2 = Manta Ray, 3 = Jellyfish

// Radius within which a school centre is attracted to food
const FOOD_ATTRACT_RADIUS = 180;

// Radius within which ripples push schools away
const RIPPLE_DISTURB_RADIUS = 130;


// ── Init ──────────────────────────────────────────────────────

/**
 * Call once from sketch.js setup().
 * p5 event functions (mousePressed, mouseDragged, keyPressed)
 * are defined globally below and picked up automatically by p5.
 */
function initInputControls() {
  console.log('[input-controls] ready — species 1 (Small Fish)');
}


// ── Public API ────────────────────────────────────────────────

/** Call inside draw() each frame to update + render food & ripples. */
function updateInputLayer() {
  _updateFood();
  _updateRipples();
}

/** Returns live food pellet array (used by sketch.js for attraction). */
function getFoodParticles() { return foodParticles; }

/** Returns live ripple array (used by sketch.js for repulsion). */
function getRipples() { return ripples; }

/** Returns current species index: 1, 2, or 3. */
function getCurrentSpecies() { return currentSpecies; }


// ── p5 Event Callbacks ────────────────────────────────────────

function mousePressed() {
  // Spawn one food pellet at click position
  foodParticles.push(new FoodParticle(mouseX, mouseY));
}

function mouseDragged() {
  // Spawn ripples along drag path, spaced every 8px of travel
  if (dist(mouseX, mouseY, pmouseX, pmouseY) > 8) {
    ripples.push(new Ripple(mouseX, mouseY));
  }
}

function keyPressed() {
  if (key === '1') { currentSpecies = 1; console.log('[input-controls] → Small Fish'); }
  if (key === '2') { currentSpecies = 2; console.log('[input-controls] → Manta Ray');  }
  if (key === '3') { currentSpecies = 3; console.log('[input-controls] → Jellyfish');  }
}


// ── Internal updaters ─────────────────────────────────────────

function _updateFood() {
  for (let i = foodParticles.length - 1; i >= 0; i--) {
    foodParticles[i].update();
    foodParticles[i].draw();
    if (foodParticles[i].isDead()) foodParticles.splice(i, 1);
  }
}

function _updateRipples() {
  for (let i = ripples.length - 1; i >= 0; i--) {
    ripples[i].update();
    ripples[i].draw();
    if (ripples[i].isDead()) ripples.splice(i, 1);
  }
}


// ── Class: FoodParticle ───────────────────────────────────────

/**
 * A glowing food pellet that sinks and fades.
 * Fish schools steer toward any pellet within FOOD_ATTRACT_RADIUS.
 */
class FoodParticle {
  constructor(x, y) {
    this.x    = x;
    this.y    = y;
    this.vx   = random(-0.35, 0.35);
    this.vy   = random(0.25, 0.6);   // sinks downward
    this.size = random(3.5, 5.5);
    this.life = 255;                  // counts down to 0
  }

  update() {
    this.x   += this.vx;
    this.vx  += random(-0.04, 0.04); // gentle horizontal wobble
    this.vx   = constrain(this.vx, -0.5, 0.5);
    this.y   += this.vy;
    this.life -= 1.1;
  }

  draw() {
    let a = map(this.life, 255, 0, 220, 0);
    push();
    noStroke();
    // Soft glow halo
    fill(190, 235, 160, a * 0.22);
    ellipse(this.x, this.y, this.size * 4, this.size * 4);
    // Core pellet
    fill(190, 240, 160, a);
    ellipse(this.x, this.y, this.size, this.size);
    pop();
  }

  isDead() { return this.life <= 0 || this.y > height + 20; }
}


// ── Class: Ripple ─────────────────────────────────────────────

/**
 * An expanding ring from mouse drag.
 * Schools within RIPPLE_DISTURB_RADIUS are pushed away.
 */
class Ripple {
  constructor(x, y) {
    this.x      = x;
    this.y      = y;
    this.r      = 5;
    this.maxR   = random(55, RIPPLE_DISTURB_RADIUS);
    this.speed  = random(1.8, 3.0);
    this.alpha  = 150;
  }

  update() {
    this.r     += this.speed;
    this.alpha  = map(this.r, 5, this.maxR, 150, 0);
  }

  draw() {
    push();
    noFill();
    stroke(160, 200, 255, this.alpha * 0.3);
    strokeWeight(2.5);
    ellipse(this.x, this.y, this.r * 2.2, this.r * 2.2);
    stroke(210, 230, 255, this.alpha);
    strokeWeight(1);
    ellipse(this.x, this.y, this.r * 2, this.r * 2);
    pop();
  }

  isDead() { return this.r >= this.maxR; }
}


// ── Species Drawing Functions ─────────────────────────────────
// Each function draws ONE creature at (x, y), size sz, colour col.
// sketch.js calls the correct one based on getCurrentSpecies().
// All functions are direction-aware: facingRight flips horizontally.
// Jellyfish ignores facingRight (symmetric).


// ── Species 1: Small Fish ────────────────────────────────────
/**
 * Matches little_fish.png:
 * Round-bellied body, round eye, smile line, dorsal fin (top),
 * pelvic + anal fin (bottom), forked tail.
 */
function drawSmallFish(x, y, sz, col, facingRight = true) {
  let d = facingRight ? 1 : -1;
  push();
  translate(x, y);
  scale(d, 1);
  stroke(col);
  strokeWeight(0.8);
  noFill();

  // Main body — wide oval, slightly pointed nose
  beginShape();
  vertex(-sz * 1.1, 0);
  bezierVertex(-sz * 0.9, -sz * 0.65, sz * 0.5, -sz * 0.6, sz * 1.0, 0);
  bezierVertex(sz * 0.5,  sz * 0.6, -sz * 0.9,  sz * 0.65, -sz * 1.1, 0);
  endShape(CLOSE);

  // Dorsal fin (top centre, triangular with curved leading edge)
  beginShape();
  vertex(-sz * 0.05, -sz * 0.6);
  bezierVertex(sz * 0.1, -sz * 1.05, sz * 0.55, -sz * 0.9, sz * 0.55, -sz * 0.6);
  endShape();

  // Pelvic fin (bottom, small)
  beginShape();
  vertex(-sz * 0.2, sz * 0.58);
  vertex(-sz * 0.05, sz * 0.9);
  vertex(sz * 0.15,  sz * 0.58);
  endShape(CLOSE);

  // Anal fin (bottom, smaller, rear)
  beginShape();
  vertex(-sz * 0.55, sz * 0.58);
  vertex(-sz * 0.45, sz * 0.82);
  vertex(-sz * 0.3,  sz * 0.58);
  endShape(CLOSE);

  // Forked tail
  beginShape();
  vertex(-sz * 1.1, 0);
  vertex(-sz * 1.55, -sz * 0.55);
  vertex(-sz * 1.35, 0);
  vertex(-sz * 1.55,  sz * 0.55);
  endShape(CLOSE);

  // Eye (filled circle)
  noStroke();
  fill(col);
  ellipse(sz * 0.55, -sz * 0.08, sz * 0.22, sz * 0.22);

  // Smile line
  noFill();
  stroke(col);
  strokeWeight(0.7);
  arc(sz * 0.38, sz * 0.08, sz * 0.28, sz * 0.22, 0, PI * 0.65);

  pop();
}


// ── Species 2: Manta Ray ─────────────────────────────────────
/**
 * Matches 蝠鲼.png:
 * Wide diamond/kite wings, two cephalic horns at front,
 * round eye, short body lobe at rear, long whip tail.
 */
function drawMantaRay(x, y, sz, col, facingRight = true) {
  let d = facingRight ? 1 : -1;
  push();
  translate(x, y);
  scale(d, 1);
  stroke(col);
  strokeWeight(0.8);
  noFill();

  // Main wing body — wide kite, pointed wingtips
  beginShape();
  vertex(sz * 0.9, 0);                                        // nose centre
  bezierVertex(sz * 0.7, -sz * 0.25, sz * 0.1, -sz * 1.1, -sz * 0.8, -sz * 0.6); // left wing
  bezierVertex(-sz * 1.0, -sz * 0.35, -sz * 1.05, sz * 0.1, -sz * 0.8, sz * 0.5); // rear-left
  bezierVertex(-sz * 0.5, sz * 0.75, sz * 0.4, sz * 0.8, sz * 0.8, sz * 0.35);    // right wing
  bezierVertex(sz * 0.95, sz * 0.15, sz * 1.0, -sz * 0.1, sz * 0.9, 0);           // back to nose
  endShape(CLOSE);

  // Left cephalic horn (top-left of head)
  beginShape();
  vertex(sz * 0.75, -sz * 0.15);
  bezierVertex(sz * 0.85, -sz * 0.4, sz * 0.7, -sz * 0.6, sz * 0.5, -sz * 0.5);
  endShape();

  // Right cephalic horn (bottom-right of head)
  beginShape();
  vertex(sz * 0.75, sz * 0.12);
  bezierVertex(sz * 0.9,  sz * 0.35, sz * 0.75, sz * 0.55, sz * 0.55, sz * 0.5);
  endShape();

  // Long whip tail from rear
  beginShape();
  vertex(-sz * 1.0, sz * 0.1);
  bezierVertex(-sz * 1.4, sz * 0.3, -sz * 1.9, sz * 0.55, -sz * 2.3, sz * 0.85);
  endShape();

  // Eye (filled)
  noStroke();
  fill(col);
  ellipse(sz * 0.52, -sz * 0.12, sz * 0.2, sz * 0.2);

  pop();
}


// ── Species 3: Jellyfish ─────────────────────────────────────
/**
 * Matches 水母.png:
 * Dome bell (top half ellipse), round eye, curved mouth line,
 * 5 straight tentacles hanging down with slight spread.
 * Jellyfish drift vertically, so facingRight is ignored.
 * A gentle pulsing bob is applied via frameCount in sketch.js.
 */
function drawJellyfish(x, y, sz, col) {
  push();
  translate(x, y);
  stroke(col);
  strokeWeight(0.85);
  noFill();

  // Bell — upper dome (top half of ellipse)
  arc(0, 0, sz * 2.2, sz * 1.6, PI, TWO_PI, CHORD);

  // Inner mantle curve (the curved lip at bell opening)
  noFill();
  arc(0, sz * 0.05, sz * 1.7, sz * 0.7, PI * 0.15, PI * 0.85);

  // Eye (filled dot, slightly left of centre)
  noStroke();
  fill(col);
  ellipse(-sz * 0.18, -sz * 0.28, sz * 0.22, sz * 0.22);

  // 5 tentacles, spread evenly, hanging from bell bottom
  noFill();
  stroke(col);
  strokeWeight(0.8);
  let tentacleCount = 5;
  let spreadHalf = sz * 0.85; // half-width of spread at base
  for (let i = 0; i < tentacleCount; i++) {
    let t    = i / (tentacleCount - 1);      // 0 → 1
    let bx   = lerp(-spreadHalf, spreadHalf, t); // base x
    let endX = bx * 1.2;                     // tips spread wider
    let endY = sz * 2.0 + random(-2, 2);     // length varies slightly per frame
    line(bx, sz * 0.05, endX, endY);
  }

  pop();
}