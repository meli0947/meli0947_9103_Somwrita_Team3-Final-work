function initPerlin(starsArray) {
  for (let s of starsArray) {
    s.px = 0;
    s.py = 0;
    s.noiseOffset = random(1000);
  }
}

function updatePerlin(starsArray) {
  for (let s of starsArray) {
    // Free drifting
    s.px = map(noise(s.noiseOffset + frameCount * 0.003), 0, 1, -150, 150);
    s.py = map(noise(s.noiseOffset + 100 + frameCount * 0.003), 0, 1, -80, 80);

    // Mouse disturbance
    let d = dist(mouseX, mouseY, s.x + s.px, s.y + s.py);
    let influence = map(d, 0, 200, 20, 0, true);
    let angle = noise(s.noiseOffset + frameCount * 0.01) * TWO_PI;
    s.px += cos(angle) * influence;
    s.py += sin(angle) * influence;
  }
}