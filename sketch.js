// =============================================================
// sketch.js  —  Main entry point
// Starry Deep-Sea Aquarium  |  IDEA9103 Team 3
// =============================================================
// Coordinates all mechanic modules:
//   audio-mechanic.js  (Xuanning Jin)  ← sound reactivity
//   time-based.js      (Yuzhu Wei)     ← time-based plant growth
//   perlin.js          (Zihan Zhong)   ← organic star movement
//   input-controls.js  (Menghao Li)    ← user input
// =============================================================
// This code was developed with the assistance of Claude (Anthropic).
// Claude assisted with the zone-boundary bounce logic in
// _updateAndDrawSchools(), the _buildMembers() placement algorithm,
// and the overall module coordination structure.
// =============================================================

let stars   = [];
let schools = [];
let bubbles = [];

// ── Per-species config ────────────────────────────────────────
const SPECIES_CONFIG = {
  1: { count: 9, minGap: 48 }, // Small Fish
  2: { count: 6, minGap: 68 }, // Manta Ray
  3: { count: 7, minGap: 58 }  // Jellyfish
};

// Canvas is divided into 4 zones (2×2 grid).
// Each school is assigned one zone and bounces only within it.
// Zone layout:
//   zone 0 (top-left)     | zone 1 (top-right)
//   ──────────────────────────────────────────
//   zone 2 (bottom-left)  | zone 3 (bottom-right)
let zones = [];

const ZONE_PADDING = 80;

function preload() {
  preloadAudio();
}


// ── Setup ─────────────────────────────────────────────────────

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(RGB);

  initInputControls();
  initScene();
  setupAudio();
}


// ── Scene initialisation ──────────────────────────────────────

function initScene() {
  stars   = [];
  schools = [];
  zones   = [];

  // ── Populate stars ─────────────────────────────────────────
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
  initPerlin(stars); // from perlin.js

  // ── Initialise plants (from plants.js) ─────────────────────
  initPlants();

  // ── Build 4 zones (2×2 grid) ──────────────────────────────
  let hw = width  / 2;
  let hh = height / 2;

  zones = [
    { x1: 0,  y1: 0,  x2: hw,   y2: hh     }, // top-left
    { x1: hw, y1: 0,  x2: width, y2: hh     }, // top-right
    { x1: 0,  y1: hh, x2: hw,   y2: height  }, // bottom-left
    { x1: hw, y1: hh, x2: width, y2: height  }  // bottom-right
  ];

  // ── Four schools, one per zone ─────────────────────────────
  // Use getCurrentSpecies() so windowResized() respects the current species
  // instead of always resetting back to Small Fish (species 1).
  let cfg = SPECIES_CONFIG[getCurrentSpecies()];
  for (let s = 0; s < 4; s++) {
    let z   = zones[s];
    let dir = random(TWO_PI);
    let cx  = random(z.x1 + ZONE_PADDING, z.x2 - ZONE_PADDING);
    let cy  = random(z.y1 + ZONE_PADDING, z.y2 - ZONE_PADDING);
    schools.push({
      cx, cy,
      vx:           cos(dir) * 0.45,
      vy:           sin(dir) * 0.18,
      zoneId:       s,
      fish:         _buildMembers(cfg),
      frightTimer:  0,    // frames remaining in fright state (ripple hit)
      fedTimer:     0,    // frames remaining in fed state (just ate food)
      clusterScale: 1.0   // current offset scale — lerped toward target each frame
    });
  }
}

/**
 * rebuildSchools() — called by input-controls.js on species switch.
 */
function rebuildSchools() {
  schools = [];
  let cfg = SPECIES_CONFIG[getCurrentSpecies()];
  for (let s = 0; s < 4; s++) {
    let z   = zones[s];
    let dir = random(TWO_PI);
    let cx  = random(z.x1 + ZONE_PADDING, z.x2 - ZONE_PADDING);
    let cy  = random(z.y1 + ZONE_PADDING, z.y2 - ZONE_PADDING);
    schools.push({
      cx, cy,
      vx:           cos(dir) * 0.45,
      vy:           sin(dir) * 0.18,
      zoneId:       s,
      fish:         _buildMembers(cfg),
      frightTimer:  0,
      fedTimer:     0,
      clusterScale: 1.0
    });
  }
}

function _buildMembers(cfg) {
  let members  = [];
  let { count, minGap } = cfg;
  let spread   = minGap * sqrt(count) * 0.85;
  let maxTries = 200;

  for (let i = 0; i < count; i++) {
    let placed = false;
    for (let attempt = 0; attempt < maxTries; attempt++) {
      let angle = random(TWO_PI);
      let r     = random(0, spread);
      let ox    = cos(angle) * r;
      let oy    = sin(angle) * r;
      let tooClose = false;
      for (let m of members) {
        if (dist(ox, oy, m.offsetX, m.offsetY) < minGap) { tooClose = true; break; }
      }
      if (!tooClose) {
        members.push({
          offsetX: ox,
          offsetY: oy,
          size:    random(8, 13),
          speed:   random(0.35, 0.75),
          alpha:   random(160, 210)  // fixed per-member — avoids per-frame flicker
        });
        placed = true;
        break;
      }
    }
    if (!placed) {
      members.push({
        offsetX: random(-spread * 1.4, spread * 1.4),
        offsetY: random(-spread * 1.4, spread * 1.4),
        size:    random(8, 13),
        speed:   random(0.35, 0.75),
        alpha:   random(160, 210)  // fixed per-member — avoids per-frame flicker
      });
    }
  }
  return members;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initScene();
}


// ── Draw loop ─────────────────────────────────────────────────

function draw() {
  drawAudio();

  _drawBackground();
  _drawStars();

  updatePlants();
  updateInputLayer();
  _updateAndDrawSchools();

  drawBubbles();
}


// ── Background gradient ───────────────────────────────────────

function _drawBackground() {
  let bgPulse = map(audioLevel, 0, 0.08, 0, 25);

  for (let y = 0; y < height; y++) {
    let t = y / height;

    let r = lerp(2, 1, t);
    let g = lerp(8, 18, t) + bgPulse;
    let b = lerp(45, 14, t) + bgPulse;

    stroke(r, g, b);
    line(0, y, width, y);
  }
}

// ── Star field ────────────────────────────────────────────────

function _drawStars() {
  noStroke();
  updatePerlin(stars);

  for (let s of stars) {
    let tw    = sin(frameCount * s.twinkleSpeed + s.twinkleOffset);
    let audioBoost = map(audioLevel, 0, 0.3, 0, 160);

    let alpha = map(tw, -1, 1, 80, s.bright) + audioBoost;
    alpha = constrain(alpha, 0, 255);

    let sz = s.size + map(tw, -1, 1, 0, 0.8) + audioLevel * 30;

    if (s.size > 1.8) {
      fill(200, 220, 255, 18);
      ellipse(s.x + s.px, s.y + s.py, sz * 4, sz * 4);
    }
    fill(210, 225, 255, alpha);
    ellipse(s.x + s.px, s.y + s.py, sz, sz);

    if (s.size > 2.2 && tw > 0.5) {
      stroke(220, 235, 255, alpha * 0.6);
      strokeWeight(0.5);
      let arm = sz * 2.5;
      line(s.x + s.px - arm, s.y + s.py, s.x + s.px + arm, s.y + s.py);
      line(s.x + s.px, s.y + s.py - arm, s.x + s.px, s.y + s.py + arm);
      noStroke();
    }
  }
}


// ── Schools ───────────────────────────────────────────────────

function _updateAndDrawSchools() {
  let food    = getFoodParticles();
  let ripps   = getRipples();
  let species = getCurrentSpecies();

  for (let sc of schools) {
    let z = zones[sc.zoneId];

    // ── Tick state timers ────────────────────────────────────
    if (sc.frightTimer > 0) sc.frightTimer--;
    if (sc.fedTimer    > 0) sc.fedTimer--;

    // ── Food attraction ──────────────────────────────────────
    let nearest     = null;
    let nearestDist = Infinity;
    for (let f of food) {
      if (f.x < z.x1 || f.x > z.x2 || f.y < z.y1 || f.y > z.y2) continue;
      let d = dist(sc.cx, sc.cy, f.x, f.y);
      if (d < nearestDist) { nearest = f; nearestDist = d; }
    }
    if (nearest) {
      let strength = map(nearestDist, 0, min(z.x2 - z.x1, z.y2 - z.y1), 0.012, 0.003);
      sc.vx = lerp(sc.vx, sc.vx + (nearest.x - sc.cx) * strength, 0.22);
      sc.vy = lerp(sc.vy, sc.vy + (nearest.y - sc.cy) * strength, 0.22);
      // When the school centre is close enough, "eat" the pellet —
      // consume() is defined in input-controls.js and drains life quickly.
      if (nearestDist < 40) {
        nearest.consume();
        sc.fedTimer = 90; // stay in "fed" state for ~1.5 s at 60fps
      }
    }

    // ── Ripple repulsion + fright ────────────────────────────
    for (let r of ripps) {
      let d = dist(sc.cx, sc.cy, r.x, r.y);
      if (d < RIPPLE_DISTURB_RADIUS && d > 0.1) {
        let force = map(d, 0, RIPPLE_DISTURB_RADIUS, 0.9, 0);
        sc.vx += ((sc.cx - r.x) / d) * force * 0.05;
        sc.vy += ((sc.cy - r.y) / d) * force * 0.05;
        // A strong ripple hit triggers fright — school briefly darts away faster
        if (force > 0.5 && sc.frightTimer === 0) {
          sc.frightTimer = 50;
          sc.vx *= 2.2;
          sc.vy *= 2.2;
        }
      }
    }

    // ── Speed cap — frightened schools move faster ────────────
    // Fright multiplies the cap; fed schools slow down slightly (contentment)
    let baseSpd = species === 3 ? 0.6 : 1.6;
    let maxSpd  = sc.frightTimer > 0
      ? baseSpd * map(sc.frightTimer, 50, 0, 2.8, 1.0)  // ramp back down as timer expires
      : sc.fedTimer > 0
        ? baseSpd * 0.55   // slow, lazy drift after eating
        : baseSpd;

    sc.vx = constrain(sc.vx, -maxSpd, maxSpd);
    sc.vy = constrain(sc.vy, -maxSpd * 0.5, maxSpd * 0.5);
    sc.cx += sc.vx;
    sc.cy += sc.vy;
    if (sc.cx < z.x1 + ZONE_PADDING) { sc.cx = z.x1 + ZONE_PADDING; sc.vx *= -1; }
    if (sc.cx > z.x2 - ZONE_PADDING) { sc.cx = z.x2 - ZONE_PADDING; sc.vx *= -1; }
    if (sc.cy < z.y1 + ZONE_PADDING) { sc.cy = z.y1 + ZONE_PADDING; sc.vy *= -1; }
    if (sc.cy > z.y2 - ZONE_PADDING) { sc.cy = z.y2 - ZONE_PADDING; sc.vy *= -1; }

    // ── Draw members ──────────────────────────────────────────
    let facingRight = sc.vx >= 0;
    let speed       = sqrt(sc.vx * sc.vx + sc.vy * sc.vy);

    // Update clusterScale once per school per frame (NOT inside the member loop).
    // lerp factor 0.018 ≈ 1.5s to fully settle — smooth huddle and expand.
    let targetScale = sc.fedTimer > 0 ? 0.55 : 1.0;
    sc.clusterScale = lerp(sc.clusterScale, targetScale, 0.018);

    for (let f of sc.fish) {
      let t  = frameCount * f.speed * 0.01;

      // Swim wobble amplitude scales with school speed — faster = more tail-wag
      let wobbleX = map(speed, 0, baseSpd * 2.8, 2, 9);
      let wobbleY = map(speed, 0, baseSpd * 2.8, 1, 5);

      let fx = sc.cx + f.offsetX * sc.clusterScale + sin(t + f.offsetX * 0.05) * wobbleX;
      let fy = sc.cy + f.offsetY * sc.clusterScale + cos(t * 1.2 + f.offsetY * 0.05) * wobbleY;

      // Per-member "breath" — alpha pulses gently on a slow per-member sine wave.
      // Frightened: members flash brighter. Fed: members dim slightly (relaxed).
      let breathCycle = sin(frameCount * 0.018 + f.offsetX * 0.12);
      let breathAlpha = f.alpha + map(breathCycle, -1, 1, -18, 18);
      if (sc.frightTimer > 0) breathAlpha += map(sc.frightTimer, 50, 0, 55, 0);
      if (sc.fedTimer    > 0) breathAlpha -= map(sc.fedTimer,    90, 0, 30, 0);
      breathAlpha = constrain(breathAlpha, 60, 255);

      let col = color(200, 220, 255, breathAlpha);

      if (species === 3) {
        fy += sin(frameCount * 0.025 + f.offsetX * 0.06) * 6;
        drawJellyfish(fx, fy, f.size, col);
      } else if (species === 2) {
        drawMantaRay(fx, fy, f.size, col, facingRight);
      } else {
        drawSmallFish(fx, fy, f.size, col, facingRight);
      }
    }
  }
}

// mousePressed / mouseDragged / keyPressed → defined in input-controls.js