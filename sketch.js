let stars = [];
let audioGlow = 120;
let bubbles = [];

function preload() {
  preloadAudio();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(RGB);

  initScene();
  setupAudio();
}

function initScene() {
  stars = [];

  for (let i = 0; i < 280; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      size: random(0.5, 2.8),
      bright: random(150, 255),
      twinkleSpeed: random(0.01, 0.04),
      twinkleOffset: random(TWO_PI)
    });
  }
}

function draw() {
  drawAudio();

  let bgPulse = map(audioLevel, 0, 0.08, 0, 25);

  for (let y = 0; y < height; y++) {
    let t = y / height;

    let r = lerp(2, 1, t);
    let g = lerp(8, 18, t) + bgPulse;
    let b = lerp(45, 14, t) + bgPulse;

    stroke(r, g, b);
    line(0, y, width, y);
  }

  noStroke();

  for (let s of stars) {
    let tw = sin(frameCount * s.twinkleSpeed + s.twinkleOffset);

    let audioBoost = map(audioLevel, 0, 0.3, 0, 160);
    let alpha = map(tw, -1, 1, 80, s.bright) + audioBoost;
    alpha = constrain(alpha, 0, 255);

    let sz = s.size + map(tw, -1, 1, 0, 0.8) + audioLevel * 30;

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

  drawBubbles();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initScene();
}