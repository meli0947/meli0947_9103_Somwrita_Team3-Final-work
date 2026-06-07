// audio-mechanic.js

let bgm;
let bubbleSound;

let bgmAnalyser;
let bubbleAnalyser;

let audioButton;

let audioLevel = 0;
let bubbleLevel = 0;

function preloadAudio() {
  bgm = loadSound("assets/bgm.mp3");
  bubbleSound = loadSound("assets/bubble.mp3");
}

function setupAudio() {
  // Analyse the background music
  bgmAnalyser = new p5.Amplitude();
  bgmAnalyser.setInput(bgm);

  // Analyse the bubble sound separately
  bubbleAnalyser = new p5.Amplitude();
  bubbleAnalyser.setInput(bubbleSound);

  audioButton = createButton("Enter Ocean");
  audioButton.position(20, 20);
  audioButton.mousePressed(toggleAudio);
}

function drawAudio() {
  let targetAudioLevel = 0;
  let targetBubbleLevel = 0;

  if (bgm.isPlaying()) {
    targetAudioLevel = bgmAnalyser.getLevel();
  }

  if (bubbleSound.isPlaying()) {
    targetBubbleLevel = bubbleAnalyser.getLevel();
  }

  // Smoothly move current levels towards target levels
  audioLevel = lerp(audioLevel, targetAudioLevel, 0.08);
  bubbleLevel = lerp(bubbleLevel, targetBubbleLevel, 0.08);
}

function toggleAudio() {
  if (bgm.isPlaying()) {

    bgm.stop();
    bubbleSound.stop();

    // Reset audio reaction
    audioLevel = 0;
    bubbleLevel = 0;

  } else {

    bgm.loop();
    bubbleSound.loop();

  }
}

function drawBubbles() {

  // Only create new bubbles when sound is playing
  if (bubbleSound.isPlaying()) {

    if (bubbleLevel > 0.02 && random(1) < 0.12) {

      bubbles.push({
      x: random(width),
      y: height + 20,
      drift: random(-0.3, 0.3),
      size: random(8, 18) + bubbleLevel * 200,
      speed: random(1, 3),
      alpha: random(80, 180)
  });

    }

  }

  // Draw and move existing bubbles
  for (let i = bubbles.length - 1; i >= 0; i--) {

    let b = bubbles[i];

   // Very soft outer glow
noStroke();
fill(220, 235, 255, b.alpha * 0.025);
ellipse(b.x, b.y, b.size * 1.6);

// Transparent bubble body
fill(220, 235, 255, b.alpha * 0.08);
ellipse(b.x, b.y, b.size);

// Subtle edge
noFill();
stroke(220, 235, 255, b.alpha * 0.28);
strokeWeight(0.8);
ellipse(b.x, b.y, b.size);

// Small highlight
noStroke();
fill(255, 255, 255, b.alpha * 0.28);
ellipse(
  b.x - b.size * 0.18,
  b.y - b.size * 0.18,
  b.size * 0.12
);

    b.y -= b.speed;
    b.x += b.drift;

    b.alpha -= 0.5;

    if (b.alpha <= 0) {
      bubbles.splice(i, 1);
    }
  }
}