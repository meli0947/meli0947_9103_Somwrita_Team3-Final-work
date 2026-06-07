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
// Species drawing functions use filled silhouettes to match
// the provided reference images (solid white on dark background).
// =============================================================


// ── Module state ──────────────────────────────────────────────

let foodParticles  = [];
let ripples        = [];
let currentSpecies = 1;  // 1 = Small Fish, 2 = Manta Ray, 3 = Jellyfish

const FOOD_ATTRACT_RADIUS   = 180;
const RIPPLE_DISTURB_RADIUS = 130;


// ── Init ──────────────────────────────────────────────────────

function initInputControls() {
  console.log('[input-controls] ready — species 1 (Small Fish)');
}


// ── Public API ────────────────────────────────────────────────

function updateInputLayer() {
  _updateFood();
  _updateRipples();
}

function getFoodParticles()  { return foodParticles;  }
function getRipples()        { return ripples;        }
function getCurrentSpecies() { return currentSpecies; }


// ── p5 Event Callbacks ────────────────────────────────────────

function mousePressed() {
  foodParticles.push(new FoodParticle(mouseX, mouseY));
}

function mouseDragged() {
  if (dist(mouseX, mouseY, pmouseX, pmouseY) > 8) {
    ripples.push(new Ripple(mouseX, mouseY));
  }
}

function keyPressed() {
  // Switch species and rebuild schools with new random positions.
  // initScene() is defined in sketch.js and resets both stars and schools.
  // We only want to reset schools, so we call the dedicated helper instead.
  if (key === '1' && currentSpecies !== 1) {
    currentSpecies = 1;
    rebuildSchools(); // defined in sketch.js — repositions all 4 schools randomly
    console.log('[input-controls] → Small Fish');
  }
  if (key === '2' && currentSpecies !== 2) {
    currentSpecies = 2;
    rebuildSchools();
    console.log('[input-controls] → Manta Ray');
  }
  if (key === '3' && currentSpecies !== 3) {
    currentSpecies = 3;
    rebuildSchools();
    console.log('[input-controls] → Jellyfish');
  }
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

class FoodParticle {
  constructor(x, y) {
    this.x    = x;
    this.y    = y;
    this.vx   = random(-0.35, 0.35);
    this.vy   = random(0.25, 0.6);
    this.size = random(3.5, 5.5);
    this.life = 255;
  }

  update() {
    this.x   += this.vx;
    this.vx  += random(-0.04, 0.04);
    this.vx   = constrain(this.vx, -0.5, 0.5);
    this.y   += this.vy;
    this.life -= 1.1;
  }

  draw() {
    let a = map(this.life, 255, 0, 220, 0);
    push();
    noStroke();
    fill(190, 235, 160, a * 0.22);
    ellipse(this.x, this.y, this.size * 4, this.size * 4);
    fill(190, 240, 160, a);
    ellipse(this.x, this.y, this.size, this.size);
    pop();
  }

  isDead() { return this.life <= 0 || this.y > height + 20; }
}


// ── Class: Ripple ─────────────────────────────────────────────

class Ripple {
  constructor(x, y) {
    this.x     = x;
    this.y     = y;
    this.r     = 5;
    this.maxR  = random(55, RIPPLE_DISTURB_RADIUS);
    this.speed = random(1.8, 3.0);
    this.alpha = 150;
  }

  update() {
    this.r    += this.speed;
    this.alpha = map(this.r, 5, this.maxR, 150, 0);
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
// All species are drawn as FILLED silhouettes (noStroke, fill only)
// matching the solid white reference images.
// A dark detail layer (eye, fins) is drawn on top at reduced opacity.


// ── Species 1: Small Fish ─────────────────────────────────────
// Reference: little_fish.png
// Round belly, dorsal fin, pelvic fin, forked tail, round eye.
function drawSmallFish(x, y, sz, col, facingRight = true) {
  let d = facingRight ? 1 : -1;
  push();
  translate(x, y);
  scale(d, 1);

  // ── Body silhouette (filled, no stroke) ──
  noStroke();
  fill(col);

  // Main body
  beginShape();
  vertex(-sz * 1.1, 0);
  bezierVertex(-sz * 0.9, -sz * 0.65, sz * 0.5, -sz * 0.6, sz * 1.0, 0);
  bezierVertex(sz * 0.5,  sz * 0.6,  -sz * 0.9,  sz * 0.65, -sz * 1.1, 0);
  endShape(CLOSE);

  // Dorsal fin
  beginShape();
  vertex(-sz * 0.05, -sz * 0.58);
  bezierVertex(sz * 0.1, -sz * 1.0, sz * 0.55, -sz * 0.88, sz * 0.55, -sz * 0.58);
  endShape(CLOSE);

  // Pelvic fin
  beginShape();
  vertex(-sz * 0.1,  sz * 0.56);
  vertex(sz * 0.0,   sz * 0.88);
  vertex(sz * 0.18,  sz * 0.56);
  endShape(CLOSE);

  // Anal fin
  beginShape();
  vertex(-sz * 0.5, sz * 0.56);
  vertex(-sz * 0.4, sz * 0.78);
  vertex(-sz * 0.25, sz * 0.56);
  endShape(CLOSE);

  // Forked tail
  beginShape();
  vertex(-sz * 1.1, 0);
  vertex(-sz * 1.55, -sz * 0.52);
  vertex(-sz * 1.32, 0);
  vertex(-sz * 1.55,  sz * 0.52);
  endShape(CLOSE);

  // ── Dark detail layer: eye + mouth ──
  // Eye — dark circle punched into the silhouette
  let eyeCol = color(
    red(col)   * 0.15,
    green(col) * 0.15,
    blue(col)  * 0.15,
    alpha(col)
  );
  fill(eyeCol);
  ellipse(sz * 0.55, -sz * 0.08, sz * 0.22, sz * 0.22);

  // Smile arc — thin dark curve
  noFill();
  stroke(eyeCol);
  strokeWeight(sz * 0.06);
  arc(sz * 0.38, sz * 0.08, sz * 0.28, sz * 0.22, 0, PI * 0.65);

  pop();
}


// ── Species 2: Manta Ray ──────────────────────────────────────
// Reference: 蝠鲼.png
// Wide diamond wings, two cephalic horns, round eye, long whip tail.
function drawMantaRay(x, y, sz, col, facingRight = true) {
  let d = facingRight ? 1 : -1;
  push();
  translate(x, y);
  scale(d, 1);

  noStroke();
  fill(col);

  // Main wing body
  beginShape();
  vertex(sz * 0.9, 0);
  bezierVertex(sz * 0.7, -sz * 0.25, sz * 0.1, -sz * 1.1, -sz * 0.8, -sz * 0.6);
  bezierVertex(-sz * 1.0, -sz * 0.35, -sz * 1.05, sz * 0.1, -sz * 0.8, sz * 0.5);
  bezierVertex(-sz * 0.5,  sz * 0.75,  sz * 0.4,  sz * 0.8,  sz * 0.8, sz * 0.35);
  bezierVertex(sz * 0.95, sz * 0.15, sz * 1.0, -sz * 0.1, sz * 0.9, 0);
  endShape(CLOSE);

  // Left cephalic horn
  beginShape();
  vertex(sz * 0.75, -sz * 0.15);
  bezierVertex(sz * 0.85, -sz * 0.4, sz * 0.7, -sz * 0.6, sz * 0.5, -sz * 0.5);
  bezierVertex(sz * 0.6, -sz * 0.35, sz * 0.72, -sz * 0.18, sz * 0.75, -sz * 0.15);
  endShape(CLOSE);

  // Right cephalic horn
  beginShape();
  vertex(sz * 0.75,  sz * 0.12);
  bezierVertex(sz * 0.9,  sz * 0.35, sz * 0.75, sz * 0.55, sz * 0.55, sz * 0.5);
  bezierVertex(sz * 0.65, sz * 0.35, sz * 0.72, sz * 0.16, sz * 0.75, sz * 0.12);
  endShape(CLOSE);

  // Whip tail
  noFill();
  stroke(col);
  strokeWeight(sz * 0.1);
  strokeCap(ROUND);
  beginShape();
  vertex(-sz * 1.0, sz * 0.1);
  bezierVertex(-sz * 1.4, sz * 0.3, -sz * 1.9, sz * 0.55, -sz * 2.3, sz * 0.85);
  endShape();

  // Eye
  noStroke();
  let eyeCol = color(
    red(col)   * 0.15,
    green(col) * 0.15,
    blue(col)  * 0.15,
    alpha(col)
  );
  fill(eyeCol);
  ellipse(sz * 0.52, -sz * 0.12, sz * 0.2, sz * 0.2);

  pop();
}


// ── Species 3: Jellyfish ──────────────────────────────────────
// Reference: 水母.png
// Dome bell (filled), inner mantle arc, round eye, 5 tentacles.
// Symmetric — facingRight ignored. Bob animation handled in sketch.js.
function drawJellyfish(x, y, sz, col) {
  push();
  translate(x, y);

  // ── Bell (filled dome) ──
  noStroke();
  fill(col);
  // Draw upper dome as a filled arc shape
  beginShape();
  // Top arc of the bell (left to right, upper half)
  let steps = 24;
  for (let i = 0; i <= steps; i++) {
    let angle = PI + (i / steps) * PI;  // PI → TWO_PI (top half)
    let bx = cos(angle) * sz * 1.1;
    let by = sin(angle) * sz * 0.8;
    vertex(bx, by);
  }
  // Close the bottom with a straight line back to start
  endShape(CLOSE);

  // Inner mantle arc (dark, drawn on top of bell)
  noFill();
  let eyeCol = color(
    red(col)   * 0.15,
    green(col) * 0.15,
    blue(col)  * 0.15,
    alpha(col)
  );
  stroke(eyeCol);
  strokeWeight(sz * 0.08);
  arc(0, sz * 0.05, sz * 1.5, sz * 0.65, PI * 0.12, PI * 0.88);

  // Eye
  noStroke();
  fill(eyeCol);
  ellipse(-sz * 0.2, -sz * 0.25, sz * 0.22, sz * 0.22);

  // ── 5 tentacles (filled thick strokes from bell base) ──
  stroke(col);
  strokeWeight(sz * 0.13);
  strokeCap(ROUND);
  noFill();
  let tentacleCount = 5;
  for (let i = 0; i < tentacleCount; i++) {
    let t    = i / (tentacleCount - 1);
    let bx   = lerp(-sz * 0.88, sz * 0.88, t);
    let endX = bx * 1.15;
    let endY = sz * 1.85;
    line(bx, sz * 0.02, endX, endY);
  }

  pop();
}