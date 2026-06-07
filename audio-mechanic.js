// audio-mechanic.js

let song;
let analyser;
let playButton;
let audioLevel = 0;

function preloadAudio() {
  song = loadSound("assets/bgm.mp3");
}

function setupAudio() {
  analyser = new p5.Amplitude();
  analyser.setInput(song);

  playButton = createButton("Enter Ocean");
  playButton.position(20, 20);
  playButton.mousePressed(toggleAudio);
}

function drawAudio() {
   audioLevel = analyser.getLevel();
let volume = audioLevel;

  let glowSize = map(volume, 0, 0.3, 100, 350);

}

function toggleAudio() {
  if (song.isPlaying()) {
    song.stop();
  } else {
    song.loop();
  }
}