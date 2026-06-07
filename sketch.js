let stars = [];
let schools = [];
let audioGlow = 120;

function preload() {
  preloadAudio();
}

function setup() {
  createCanvas(600, 750);
  colorMode(RGB);

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

  for (let s = 0; s < 3; s++) {
    let school = [];
    let cx = random(80, width - 80);
    let cy = random(100, height - 100);
    let dir = random(TWO_PI);
    for (let i = 0; i < random(18, 30); i++) {
      school.push({
        offsetX: random(-60, 60),
        offsetY: random(-30, 30),
        size: random(5, 10),
        speed: random(0.4, 0.9)
      });
    }
    schools.push({
      cx, cy,
      vx: cos(dir) * 0.5,
      vy: sin(dir) * 0.2,
      fish: school
    });
  }
setupAudio();
}

function drawFish(x, y, sz, col) {
  stroke(col);
  strokeWeight(0.8);
  noFill();
  beginShape();
  vertex(x - sz, y);
  bezierVertex(x - sz*0.5, y - sz*0.5, x + sz*0.5, y - sz*0.4, x + sz, y);
  bezierVertex(x + sz*0.5, y + sz*0.4, x - sz*0.5, y + sz*0.5, x - sz, y);
  endShape(CLOSE);
  beginShape();
  vertex(x - sz, y);
  vertex(x - sz*1.5, y - sz*0.6);
  vertex(x - sz*1.5, y + sz*0.6);
  endShape(CLOSE);
}

function draw() {
  for (let y = 0; y < height; y++) {
    let t = y / height;
    stroke(lerp(2,1,t), lerp(8,18,t), lerp(45,14,t));
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

  for (let sc of schools) {
    sc.cx += sc.vx;
    sc.cy += sc.vy;
    if (sc.cx < 60 || sc.cx > width - 60) sc.vx *= -1;
    if (sc.cy < 80 || sc.cy > height - 80) sc.vy *= -1;
    for (let f of sc.fish) {
      let t = frameCount * f.speed * 0.012;
      let fx = sc.cx + f.offsetX + sin(t + f.offsetX) * 8;
      let fy = sc.cy + f.offsetY + cos(t * 1.3 + f.offsetY) * 5;
      drawFish(fx, fy, f.size, color(200, 220, 255, random(140, 200)));
    }
  }
drawAudio();
}