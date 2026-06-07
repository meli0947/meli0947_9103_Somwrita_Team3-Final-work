let stars = [];
let schools = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(RGB);
  initScene();
  initPerlin(stars);
}

function initScene() {
  stars = [];
  schools = [];

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
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initScene();
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
  updatePerlin(stars);
  for (let s of stars) {
    let tw = sin(frameCount * s.twinkleSpeed + s.twinkleOffset);
    let alpha = map(tw, -1, 1, 80, s.bright);
    let sz = s.size + map(tw, -1, 1, 0, 0.8);
    if (s.size > 1.8) {
      fill(200, 220, 255, 18);
      ellipse(s.x + s.px, s.y + s.py, sz * 4, sz * 4);
    }
    fill(210, 225, 255, alpha);
    ellipse(s.x + s.px, s.y + s.py, sz, sz);
    if (s.size > 2.2 && tw > 0.5) {
    let armLen = sz * map(tw, 0.5, 1, 1, 4);
    for (let a = 0; a < 4; a++) {
      let angle = a * HALF_PI + PI / 4;
      let x1 = s.x + s.px + cos(angle) * sz * 0.5;
      let y1 = s.y + s.py + sin(angle) * sz * 0.5;
      let x2 = s.x + s.px + cos(angle) * armLen;
      let y2 = s.y + s.py + sin(angle) * armLen;
      stroke(220, 235, 255, alpha * map(tw, 0.5, 1, 0.2, 0.8));
      strokeWeight(map(tw, 0.5, 1, 0.3, 0.8));
      line(x1, y1, x2, y2);
      }
      noStroke();
    }
  }
}