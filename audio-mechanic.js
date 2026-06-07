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
  audioLevel = bgmAnalyser.getLevel();
  bubbleLevel = bubbleAnalyser.getLevel();
}

function toggleAudio() {
  if (bgm.isPlaying()) {
    bgm.stop();
    bubbleSound.stop();
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
        size: random(8, 18) + bubbleLevel * 200,
        speed: random(1, 3),
        alpha: random(80, 180)
      });

    }

  }

  // Draw and move existing bubbles
  for (let i = bubbles.length - 1; i >= 0; i--) {

    let b = bubbles[i];

    noFill();
    stroke(220, 235, 255, b.alpha);
    strokeWeight(1);

    ellipse(b.x, b.y, b.size);

    b.y -= b.speed;

    b.alpha -= 0.5;

    if (b.alpha <= 0) {
      bubbles.splice(i, 1);
    }
  }
}