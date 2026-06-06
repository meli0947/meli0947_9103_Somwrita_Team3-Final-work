// =============================================================
// input-controls.js
// User Input Mechanic — Interactive Feeding & Fish School System
// Creative Director: Zihan Zhong
// =============================================================
// Interactions:
//   Mouse Click  → Drop food pellets; nearby fish are attracted
//   Mouse Drag   → Create ripple disturbances in the water
//   Keyboard 1/2/3 → Switch the fish school species:
//                    1 = Small Fish (default, diamond/spindle shape)
//                    2 = Shark School (with dorsal fin)
//                    3 = Ray School  (triangular, gliding)
// =============================================================
// This code was developed with the assistance of Claude (Anthropic).
// It implements FoodParticle and Ripple classes, plus keyboard-driven
// species switching, designed to integrate with sketch.js and the
// Perlin-noise fish school system.
// =============================================================


// ── Module-level state ────────────────────────────────────────

let foodParticles = [];   // Active food pellets on screen
let ripples       = [];   // Active ripple rings from dragging
let currentSpecies = 1;   // 1 = small fish, 2 = shark, 3 = ray

// How close (px) a school centre must be to a food pellet
// to be "attracted" — read by sketch.js via getFoodParticles()
const FOOD_ATTRACT_RADIUS = 180;

// Ripple disturbance radius exposed for Perlin fish steering
const RIPPLE_DISTURB_RADIUS = 130;


// ── Initialise: attach p5 event callbacks ─────────────────────

/**
 * Call once from sketch.js setup().
 * Registers mouse and keyboard handlers on the p5 canvas.
 */
function initInputControls() {
  // p5 global callbacks are defined below as standalone functions.
  // Nothing extra needed here, but the function is provided so
  // sketch.js has a clear, explicit initialisation call.
  console.log("[input-controls] initialised — species:", currentSpecies);
}


// ── Public API (called by sketch.js each frame) ───────────────

/**
 * Update and draw all input-layer elements.
 * Call this inside draw(), after the background, before other layers.
 */
function updateInputLayer() {
  _updateFoodParticles();
  _updateRipples();
}

/** Returns the live array of FoodParticle objects. */
function getFoodParticles() {
  return foodParticles;
}

/** Returns the live array of Ripple objects. */
function getRipples() {
  return ripples;
}

/** Returns the current species index (1, 2, or 3). */
function getCurrentSpecies() {
  return currentSpecies;
}


// ── p5 Event Callbacks ────────────────────────────────────────

/** Click → spawn a food pellet at the cursor. */
function mousePressed() {
  foodParticles.push(new FoodParticle(mouseX, mouseY));
}

/** Drag → continuously emit ripple rings along the drag path. */
function mouseDragged() {
  // Only spawn a new ripple every 6 pixels of travel to avoid clutter
  let d = dist(mouseX, mouseY, pmouseX, pmouseY);
  if (d > 6) {
    ripples.push(new Ripple(mouseX, mouseY));
  }
}

/**
 * Keyboard → switch fish school species.
 * '1' = small fish  '2' = shark  '3' = ray
 */
function keyPressed() {
  if (key === '1') { currentSpecies = 1; _logSpeciesChange(); }
  if (key === '2') { currentSpecies = 2; _logSpeciesChange(); }
  if (key === '3') { currentSpecies = 3; _logSpeciesChange(); }
}

function _logSpeciesChange() {
  const names = { 1: "Small Fish", 2: "Shark School", 3: "Ray School" };
  console.log("[input-controls] switched to species:", names[currentSpecies]);
}


// ── Internal update helpers ───────────────────────────────────

function _updateFoodParticles() {
  for (let i = foodParticles.length - 1; i >= 0; i--) {
    foodParticles[i].update();
    foodParticles[i].draw();
    if (foodParticles[i].isDead()) {
      foodParticles.splice(i, 1);
    }
  }
}

function _updateRipples() {
  for (let i = ripples.length - 1; i >= 0; i--) {
    ripples[i].update();
    ripples[i].draw();
    if (ripples[i].isDead()) {
      ripples.splice(i, 1);
    }
  }
}


// ── Class: FoodParticle ───────────────────────────────────────

/**
 * A single food pellet dropped by a mouse click.
 * Sinks slowly, fades out, then disappears.
 * Fish schools within FOOD_ATTRACT_RADIUS will steer toward it.
 */
class FoodParticle {
  constructor(x, y) {
    this.x     = x;
    this.y     = y;
    this.vx    = random(-0.4, 0.4);  // slight horizontal drift
    this.vy    = random(0.3, 0.7);   // sinks downward
    this.alpha = 220;                // starting opacity
    this.size  = random(3, 5.5);     // pellet radius
    this.life  = 255;                // countdown to death
  }

  update() {
    // Drift and sink
    this.x    += this.vx;
    this.y    += this.vy;

    // Gentle wobble (mimics water resistance)
    this.vx   += random(-0.05, 0.05);
    this.vx    = constrain(this.vx, -0.6, 0.6);

    // Fade out over time
    this.life  -= 1.2;
    this.alpha  = map(this.life, 255, 0, 220, 0);
  }

  draw() {
    push();
    noStroke();

    // Soft glow halo
    fill(200, 230, 180, this.alpha * 0.25);
    ellipse(this.x, this.y, this.size * 3.5, this.size * 3.5);

    // Core pellet — warm white-green to match bioluminescent theme
    fill(190, 235, 170, this.alpha);
    ellipse(this.x, this.y, this.size, this.size);
    pop();
  }

  /** True when the pellet has fully faded or sunk off-screen. */
  isDead() {
    return this.life <= 0 || this.y > height + 20;
  }
}


// ── Class: Ripple ─────────────────────────────────────────────

/**
 * A single expanding ring created by mouse dragging.
 * Fish within RIPPLE_DISTURB_RADIUS are pushed away from
 * the ripple centre (handled in sketch.js / Perlin module).
 */
class Ripple {
  constructor(x, y) {
    this.x      = x;
    this.y      = y;
    this.radius = 6;          // starts small
    this.maxR   = random(50, RIPPLE_DISTURB_RADIUS);
    this.alpha  = 160;
    this.speed  = random(1.8, 3.2);  // expansion speed
  }

  update() {
    this.radius += this.speed;
    // Fade linearly as it expands
    this.alpha = map(this.radius, 6, this.maxR, 160, 0);
  }

  draw() {
    push();
    noFill();
    // Outer soft ring
    stroke(160, 200, 255, this.alpha * 0.35);
    strokeWeight(2.5);
    ellipse(this.x, this.y, this.radius * 2.2, this.radius * 2.2);

    // Inner crisp ring
    stroke(200, 225, 255, this.alpha);
    strokeWeight(1);
    ellipse(this.x, this.y, this.radius * 2, this.radius * 2);
    pop();
  }

  /** True when the ring has expanded to its maximum radius. */
  isDead() {
    return this.radius >= this.maxR;
  }
}


// ── Fish Species Draw Functions ───────────────────────────────
// Each function draws ONE fish at (x, y) with size sz and colour col.
// sketch.js picks the correct draw function based on getCurrentSpecies().

/**
 * Species 1 — Small Fish
 * Classic spindle body + forked tail (matches existing drawFish style).
 */
function drawSmallFish(x, y, sz, col, facingRight = true) {
  let dir = facingRight ? 1 : -1;
  push();
  translate(x, y);
  scale(dir, 1);

  stroke(col);
  strokeWeight(0.8);
  noFill();

  // Body
  beginShape();
  vertex(-sz, 0);
  bezierVertex(-sz * 0.5, -sz * 0.5, sz * 0.5, -sz * 0.4, sz, 0);
  bezierVertex(sz * 0.5, sz * 0.4, -sz * 0.5, sz * 0.5, -sz, 0);
  endShape(CLOSE);

  // Forked tail
  beginShape();
  vertex(-sz, 0);
  vertex(-sz * 1.55, -sz * 0.6);
  vertex(-sz * 1.55, sz * 0.6);
  endShape(CLOSE);

  pop();
}

/**
 * Species 2 — Shark
 * Streamlined torpedo body with prominent dorsal fin and lunate tail.
 */
function drawShark(x, y, sz, col, facingRight = true) {
  let dir = facingRight ? 1 : -1;
  push();
  translate(x, y);
  scale(dir, 1);

  stroke(col);
  strokeWeight(0.9);
  noFill();

  // Main body — elongated and pointed
  beginShape();
  vertex(-sz * 1.2, 0);
  bezierVertex(-sz * 0.6, -sz * 0.55, sz * 0.8, -sz * 0.35, sz * 1.2, 0);
  bezierVertex(sz * 0.8,  sz * 0.35, -sz * 0.6,  sz * 0.55, -sz * 1.2, 0);
  endShape(CLOSE);

  // Dorsal fin (top)
  beginShape();
  vertex(-sz * 0.1, -sz * 0.35);
  vertex(sz * 0.1, -sz * 0.9);  // apex
  vertex(sz * 0.5, -sz * 0.35);
  endShape(CLOSE);

  // Lunate (crescent) tail
  beginShape();
  vertex(-sz * 1.2, 0);
  vertex(-sz * 1.7, -sz * 0.7);
  vertex(-sz * 1.45, 0);
  vertex(-sz * 1.7, sz * 0.7);
  endShape(CLOSE);

  pop();
}

/**
 * Species 3 — Ray (Manta-style)
 * Wide triangular wingspan + long slender tail.
 */
function drawRay(x, y, sz, col, facingRight = true) {
  let dir = facingRight ? 1 : -1;
  push();
  translate(x, y);
  scale(dir, 1);

  stroke(col);
  strokeWeight(0.8);
  noFill();

  // Wing body — flat diamond/delta shape
  beginShape();
  vertex(sz * 0.8, 0);             // nose
  vertex(0, -sz * 1.1);            // left wingtip
  vertex(-sz * 0.9, 0);            // rear body
  vertex(0, sz * 1.1);             // right wingtip
  endShape(CLOSE);

  // Long whip tail
  noFill();
  beginShape();
  vertex(-sz * 0.9, 0);
  bezierVertex(-sz * 1.3, sz * 0.1, -sz * 1.8, sz * 0.3, -sz * 2.2, sz * 0.5);
  endShape();

  pop();
}