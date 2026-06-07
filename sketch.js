let plants = [];
let startTime;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(RGB);
  startTime = millis();
  initScene();
}

function initScene() {
  plants = [];

  let cols = floor(width / 38);
  for (let i = 0; i < cols; i++) {
    let x = random(i * 38, (i + 1) * 38);
    let type = floor(random(3));
    let maxH = random(0.22, 0.48) * height;
    let segments = type === 1 ? floor(random(4, 8)) : floor(random(3, 6));
    plants.push({
      x, type, maxH, segments,
      spawnTime: random(0, 20000),
      swayOffset: random(TWO_PI),
      swaySpeed: random(0.008, 0.018),
      col: type === 2
        ? color(random(180, 220), random(60, 130), random(80, 160), 200)
        : color(random(30, 90), random(160, 220), random(100, 160), 200)
    });
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  startTime = millis();
  initScene();
}

function drawPlant(pl, elapsed) {
  let age = elapsed - pl.spawnTime;
  if (age <= 0) return;

  let growFrac = constrain(age / 20000, 0, 1);
  let curH = pl.maxH * growFrac;
  let base = height;
  let sway = sin(frameCount * pl.swaySpeed + pl.swayOffset);

  noStroke();

  if (pl.type === 0) {
    for (let b = -1; b <= 1; b++) {
      let bx = pl.x + b * 5;
      let lean = sway * 12 * growFrac + b * 6;
      fill(red(pl.col), green(pl.col), blue(pl.col), alpha(pl.col));
      beginShape();
      vertex(bx - 2, base);
      bezierVertex(bx - 2 + lean * 0.3, base - curH * 0.5, bx + lean * 0.7, base - curH * 0.8, bx + lean, base - curH);
      bezierVertex(bx + lean + 2, base - curH * 0.8, bx + 2 + lean * 0.4, base - curH * 0.4, bx + 2, base);
      endShape(CLOSE);
    }

  } else if (pl.type === 1) {
    let segH = curH / pl.segments;
    strokeWeight(2.5);
    for (let seg = 0; seg < pl.segments; seg++) {
      let frac = (seg + 1) / pl.segments;
      if (frac > growFrac) break;
      let sy0 = base - seg * segH;
      let sy1 = base - (seg + 1) * segH;
      let lean0 = sin(frameCount * pl.swaySpeed + pl.swayOffset + seg * 0.4) * 8 * growFrac;
      let lean1 = sin(frameCount * pl.swaySpeed + pl.swayOffset + (seg + 1) * 0.4) * 8 * growFrac;
      let sx0 = pl.x + lean0 * seg * 0.15;
      let sx1 = pl.x + lean1 * (seg + 1) * 0.15;
      stroke(red(pl.col), green(pl.col), blue(pl.col), 220);
      line(sx0, sy0, sx1, sy1);

      if (seg % 2 === 0) {
        let leafLen = random(10, 18) * growFrac;
        let dir = (seg % 4 === 0) ? 1 : -1;
        noStroke();
        fill(red(pl.col) - 20, green(pl.col) + 10, blue(pl.col), 180);
        beginShape();
        vertex(sx1, sy1);
        bezierVertex(sx1 + dir * leafLen * 0.5, sy1 - leafLen * 0.3, sx1 + dir * leafLen, sy1 - leafLen * 0.5, sx1 + dir * leafLen * 0.8, sy1 + leafLen * 0.2);
        bezierVertex(sx1 + dir * leafLen * 0.3, sy1 + leafLen * 0.1, sx1 + dir * 2, sy1 + 2, sx1, sy1);
        endShape(CLOSE);
      }
    }

  } else {
    noStroke();
    drawBranch(pl.x, base, 0, -curH, 0, pl.col, growFrac, sway, 0);
  }
}

function drawBranch(x, y, dx, dy, depth, col, growFrac, sway, phase) {
  if (depth > 4) return;
  let len = sqrt(dx * dx + dy * dy);
  if (len < 2) return;

  let angle = atan2(dy, dx);
  let swaySub = sway * 0.08 * (1 + depth * 0.5);
  let thick = max(1, 5 - depth * 0.9);

  stroke(red(col), green(col), blue(col), 200);
  strokeWeight(thick * growFrac);
  line(x, y, x + dx + swaySub * len, y + dy);

  let ex = x + dx + swaySub * len;
  let ey = y + dy;

  if (depth < 3) {
    let spread = radians(25 + depth * 5);
    let newLen = len * 0.68;
    drawBranch(ex, ey, cos(angle - spread) * newLen, sin(angle - spread) * newLen, depth + 1, col, growFrac, sway, phase + 1);
    drawBranch(ex, ey, cos(angle + spread) * newLen, sin(angle + spread) * newLen, depth + 1, col, growFrac, sway, phase + 2);
  } else {
    noStroke();
    fill(red(col) + 30, green(col) + 20, blue(col), 200);
    ellipse(ex, ey, thick * 2.5 * growFrac, thick * 2.5 * growFrac);
  }
}

function draw() {
  let elapsed = millis() - startTime;

  for (let y = 0; y < height; y++) {
    let t = y / height;
    stroke(lerp(2, 1, t), lerp(8, 18, t), lerp(45, 14, t));
    line(0, y, width, y);
  }
  noStroke();

  for (let pl of plants) {
    drawPlant(pl, elapsed);
  }
}