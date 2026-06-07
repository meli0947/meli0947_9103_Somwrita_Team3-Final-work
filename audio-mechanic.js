// =============================================================
// audio-mechanic.js
// Audio Mechanic — Xuanning Jin
// -------------------------------------------------------------
// This module controls the sound-reactive atmosphere of the
// Starry Deep-Sea Aquarium.
// It uses p5.sound amplitude analysis to make the background,
// stars, and bubbles respond to audio.
// =============================================================


// Background music for the main ocean atmosphere
let bgm;

// Separate bubble sound used to trigger bubble visuals
let bubbleSound;


// Amplitude analysers from the p5.sound library.
// p5.Amplitude measures the volume level of an audio source.
// Reference: https://p5js.org/reference/p5.sound/p5.Amplitude/
let bgmAnalyser;
let bubbleAnalyser;


// Button used to start and stop the ocean soundscape
let audioButton;


// These values are shared with sketch.js.
// audioLevel controls the background and star brightness.
// bubbleLevel controls the bubble spawning and bubble size.
let audioLevel = 0;
let bubbleLevel = 0;


// Load audio files before setup() runs.
// This is called from preload() in sketch.js.
function preloadAudio() {
  bgm = loadSound("assets/bgm.mp3");
  bubbleSound = loadSound("assets/bubble.mp3");
}


// Set up audio analysers and the audio start button.
function setupAudio() {
  // Analyse the background music.
  bgmAnalyser = new p5.Amplitude();
  bgmAnalyser.setInput(bgm);

  // Analyse the bubble sound separately so bubbles can react
  // independently from the background music.
  bubbleAnalyser = new p5.Amplitude();
  bubbleAnalyser.setInput(bubbleSound);

  // Browser autoplay rules require user interaction before sound plays,
  // so this button starts the audio experience.
  audioButton = createButton("Enter Ocean");
  audioButton.position(20, 20);
  audioButton.mousePressed(toggleAudio);
}


// Read audio levels every frame.
// Instead of changing instantly, the values move smoothly toward
// the current audio level using lerp(), which creates a softer,
// more atmospheric transition.
function drawAudio() {
  let targetAudioLevel = 0;
  let targetBubbleLevel = 0;

  if (bgm.isPlaying()) {
    targetAudioLevel = bgmAnalyser.getLevel();
  }

  if (bubbleSound.isPlaying()) {
    targetBubbleLevel = bubbleAnalyser.getLevel();
  }

  // Smoothly move current levels towards target levels.
  // A smaller lerp amount makes the reaction slower and calmer.
  audioLevel = lerp(audioLevel, targetAudioLevel, 0.08);
  bubbleLevel = lerp(bubbleLevel, targetBubbleLevel, 0.08);
}


// Start or stop both sound files.
// The bubble sound is played together with the background music,
// but analysed separately.
function toggleAudio() {
  if (bgm.isPlaying()) {
    bgm.stop();
    bubbleSound.stop();

    // Reset audio reaction when sound stops.
    audioLevel = 0;
    bubbleLevel = 0;
  } else {
    bgm.loop();
    bubbleSound.loop();
  }
}


// Draw and update bubbles.
// This works like a simple particle system: new bubble objects
// are added to the bubbles array, then each bubble moves upward,
// drifts slightly sideways, fades out, and is removed.
function drawBubbles() {
  // Only create new bubbles when the bubble sound is playing.
  if (bubbleSound.isPlaying()) {
    if (bubbleLevel > 0.02 && random(1) < 0.12) {
      bubbles.push({
        x: random(width),
        y: height + 20,
        drift: random(-0.3, 0.3),
        size: random(18, 55) + bubbleLevel * 300,
        speed: random(1, 3),
        alpha: random(80, 180)
      });
    }
  }

  // Draw and move existing bubbles backwards through the array.
  // This makes it safe to remove bubbles with splice().
  for (let i = bubbles.length - 1; i >= 0; i--) {
    let b = bubbles[i];

    // Very soft outer glow
    noStroke();
    fill(220, 235, 255, b.alpha * 0.025);
    ellipse(b.x, b.y, b.size * 1.6);

    // Transparent bubble body
    fill(220, 235, 255, b.alpha * 0.08);
    ellipse(b.x, b.y, b.size);

    // Subtle bubble edge
    noFill();
    stroke(220, 235, 255, b.alpha * 0.28);
    strokeWeight(0.8);
    ellipse(b.x, b.y, b.size);

    // Small highlight to make the bubble feel more dimensional
    noStroke();
    fill(255, 255, 255, b.alpha * 0.28);
    ellipse(
      b.x - b.size * 0.18,
      b.y - b.size * 0.18,
      b.size * 0.12
    );

    // Move bubble upward and let it drift slightly sideways.
    b.y -= b.speed;
    b.x += b.drift;

    // Fade out over time.
    b.alpha -= 0.5;

    // Remove invisible bubbles from the array.
    if (b.alpha <= 0) {
      bubbles.splice(i, 1);
    }
  }
}