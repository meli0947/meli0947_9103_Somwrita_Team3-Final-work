let stars = [];
let schools = [];
let plants = [];
let startTime;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(RGB);
  startTime = millis();
  initScene();
}

function initScene() {
  stars = [];
  schools = [];
  plants = [];

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

  // 沿底部生成植物
  let cols = floor(width / 38);
  for (let i = 0; i < cols; i++) {
    let x = random(i * 38, (i + 1) * 38);
    let type = floor(random(3)); // 0=海草, 1=海带, 2=珊瑚
    let maxH = random(0.22, 0.48) * height; // 最高占屏幕高度22%-48%
    let segments = type === 1 ? floor(random(4, 8)) : floor(random(3, 6));
    plants.push({
      x, type, maxH, segments,
      spawnTime: random(0, 20000), // 错开出场时间（毫秒）
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

function drawFish(x, y, sz, col) {
  stroke(col);
  strokeWeight(0.8);
  noFill();
  beginShape();
  vertex(x - sz, y);
  bezierVertex(x - sz * 0.5, y - sz * 0.5, x + sz * 0.5, y - sz * 0.4, x + sz, y);
  bezierVertex(x + sz * 0.5, y + sz * 0.4, x - sz * 0.5, y + sz * 0.5, x - sz, y);
  endShape(CLOSE);
  beginShape();
  vertex(x - sz, y);
  vertex(x - sz * 1.5, y - sz * 0.6);
  vertex(x - sz * 1.5, y + sz * 0.6);
  endShape(CLOSE);
}

function drawPlant(pl, elapsed) {
  let age = elapsed - pl.spawnTime;
  if (age <= 0) return;

  // 20秒内从零长到最大高度
  let growFrac = constrain(age / 20000, 0, 1);
  let curH = pl.maxH * growFrac;
  let base = height;
  let sway = sin(frameCount * pl.swaySpeed + pl.swayOffset);

  noStroke();

  if (pl.type === 0) {
    // 海草：多片细叶从底部长出
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
    // 海带：分段茎干 + 侧叶，逐节向上生长
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

      // 每隔一段长一片侧叶
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
    // 珊瑚：递归分叉树形
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
    // 顶端小圆点
    noStroke();
    fill(red(col) + 30, green(col) + 20, blue(col), 200);
    ellipse(ex, ey, thick * 2.5 * growFrac, thick * 2.5 * growFrac);
  }
}

function draw() {
  let elapsed = millis() - startTime;

  // 背景渐变
  for (let y = 0; y < height; y++) {
    let t = y / height;
    stroke(lerp(2, 1, t), lerp(8, 18, t), lerp(45, 14, t));
    line(0, y, width, y);
  }
  noStroke();

  // 星星 / 气泡
  for (let s of stars) {
    let tw = sin(frameCount * s.twinkleSpeed + s.twinkleOffset);
    let alpha = map(tw, -1, 1, 80, s.bright);
    let sz = s.size + map(tw, -1, 1, 0, 0.8);
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

  // 植物（在鱼群后面渲染）
  for (let pl of plants) {
    drawPlant(pl, elapsed);
  }

  // 鱼群
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
}