// =============================================================
// perlin.js
// Perlin Noise & Randomness Mechanic — Organic Star Movement
// Creative Director: Zihan Zhong
// =============================================================
// Each star receives a unique random noiseOffset seed at init.
// Every frame, two independent noise() calls produce smooth px/py
// drift values. A third noise() call generates a random angle
// used for mouse-proximity disturbance, so stars near the cursor
// scatter organically rather than in a fixed direction.
// Random values control each star's size, brightness, twinkle
// speed, and twinkle phase so no two stars behave identically.
// =============================================================
// Public API (called from sketch.js):
//   initPerlin(starsArray)    — call inside initScene()
//   updatePerlin(starsArray)  — call inside _drawStars()
// =============================================================
// This code was developed with the assistance of Claude (Anthropic).
// Claude assisted with the dual-axis noise drift pattern and the
// mouse-disturbance angle derivation using noise() * TWO_PI.
// =============================================================

function initPerlin(starsArray) {
  for (let s of starsArray) {
    s.px = 0;
    s.py = 0;
    s.noiseOffset = random(1000);      // random noise seed
    s.driftSpeed  = random(0.0005, 0.002); // random drift speed per star
  }
}

function updatePerlin(starsArray) {
  for (let s of starsArray) {
    // Free drifting
    s.px = map(noise(s.noiseOffset + frameCount * s.driftSpeed), 0, 1, -150, 150);
    s.py = map(noise(s.noiseOffset + 100 + frameCount * s.driftSpeed), 0, 1, -80, 80);

    // Mouse disturbance
    let d = dist(mouseX, mouseY, s.x + s.px, s.y + s.py);
    let influence = map(d, 0, 200, 20, 0, true);
    let angle = noise(s.noiseOffset + frameCount * 0.01) * TWO_PI;
    s.px += cos(angle) * influence;
    s.py += sin(angle) * influence;
  }
}