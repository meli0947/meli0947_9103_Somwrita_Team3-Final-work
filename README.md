# Starry Deep-Sea Aquarium
### IDEA9103 Creative Coding — Major Project | Team 3

An interactive deep-sea aquarium built with p5.js, blurring the boundary between ocean and cosmos. Silver-line sea creatures drift through a starry dark-blue field, responding to music, time, organic noise, and the viewer's hand.

---

## Inspiration

Our visual starting point is a "starry aquarium" illustration — a deep navy field populated with silver-line silhouettes of whales, sharks, jellyfish, rays, and turtles, scattered with dense points of white light. The mood sits exactly between a real aquarium tank and a night sky, and that ambiguity became the theme of the whole project.

Two further inspirations shaped how we turned a static image into an interactive experience:

- **The British Museum's *Museum of the World*** (built with Google) — an interactive timeline where users explore artefacts across time and geography from a single browser window. We borrowed its "exhibition through one window" logic: everything the visitor needs lives inside one canvas, and time is a dimension of the experience, not just a setting.
- **The Louvre's 360-degree virtual tours** (louvre.fr / Google Arts & Culture) — immersive single-window gallery walkthroughs where the viewer has full agency. This reinforced our decision to let the user actively participate — feeding fish, disturbing the water — rather than just watch.

The result is a virtual underwater exhibition hall where music, time, organic noise, and the viewer's hand all leave visible traces on the water.

---

## Techniques

The project is built entirely in p5.js (global mode) with p5.sound for audio analysis. Key technical approaches:

**Background gradient** — drawn line by line each frame so it can pulse in response to audio amplitude (`audioLevel` shifts the green and blue channels). This avoids redraw artifacts while keeping the gradient reactive.

**Perlin noise star field** — 280 star particles each carry a `noiseOffset` seed. Every frame, `noise()` maps their position to a smooth drift (`px`, `py`). The mouse adds a secondary disturbance: stars within 200px of the cursor receive an additional angle-driven nudge, also Perlin-derived. Twinkle is handled separately with a per-star `sin()` oscillator.

**Time-based plant growth** — three plant species (seagrass blades, segmented kelp, branching coral) each grow from `height` upward using `millis()` so growth speed is frame-rate independent. A `growFrac` value (0 → 1 over 20 seconds) scales both height and stroke weight, giving a slow organic reveal. Coral uses a recursive `_drawBranch()` function capped at depth 4.

**Audio amplitude analysis** — two `p5.Amplitude` analysers run in parallel: one for the background music track, one for the looping bubble sound. Their levels (`audioLevel`, `bubbleLevel`) are smoothed with `lerp()` each frame and used to modulate star glow, background pulse, bubble spawn rate, and bubble size. All audio is gated behind a user gesture button to comply with browser autoplay policy.

**School flocking system** — the canvas is divided into a 2×2 zone grid. Each of the four schools is assigned one zone and bounces within it. Food particles attract the nearest school centroid; ripple rings repel it. Individual members orbit the centroid using per-member `offsetX/Y` and a `sin()`-based swim wobble. Three species are selectable (small fish, manta ray, jellyfish) with different silhouette drawing functions.

**Species silhouettes** — each species (`drawSmallFish`, `drawMantaRay`, `drawJellyfish`) is drawn as a filled `beginShape/bezierVertex` silhouette with a dark detail layer (eye, fins, tentacles) painted on top. The `facingRight` flag mirrors the shape horizontally using `scale(-1, 1)` inside a `push/pop` pair.

---

## Mechanic Ownership

| Team Member | Mechanic | File |
|---|---|---|
| Xuanning Jin | Audio | `audio-mechanic.js` |
| Yuzhu Wei | Time-Based | `time-based.js` |
| Zihan Zhong | Perlin Noise & Randomness | `perlin.js` |
| Menghao Li | User Input | `input-controls.js` |

### Audio — Xuanning Jin (`audio-mechanic.js`)
Two audio tracks are analysed with `p5.Amplitude` in real time. The background music level (`audioLevel`) drives star brightness boosts, background colour pulsing, and star size expansion. The bubble sound level (`bubbleLevel`) controls bubble spawn rate and bubble radius. Both levels are smoothed with `lerp()` to prevent jittery jumps. All audio is activated by a single "Enter Ocean" button.

### Time-Based — Yuzhu Wei (`time-based.js`)
Plants grow from the sea floor over time using `millis()`. Three types appear: **seagrass blades** (bezier-curve filled shapes that sway with `sin()`), **segmented kelp** (jointed stem with alternating side leaves), and **branching coral** (recursive tree, depth 4). Each plant has a random `spawnTime` offset so they don't all appear at once. Growth fraction (`growFrac`) scales from 0 to 1 over 20 seconds and controls both height and stroke weight.

### Perlin Noise & Randomness — Zihan Zhong (`perlin.js`)
Each star receives a unique `noiseOffset` seed at initialisation. Every frame, two independent noise calls (offset by 100) generate smooth `px` and `py` drift values. A third noise call produces a random angle for mouse-proximity disturbance. Random values also control star size, brightness, twinkle speed, and twinkle phase offset, ensuring no two stars behave the same way. The `random()` calls in school member placement (`_buildMembers`) use random seeds implicitly through p5's internal state.

### User Input — Menghao Li (`input-controls.js`)
- **Mouse click** — spawns a `FoodParticle` that drifts downward with slight horizontal wobble. Schools within the same zone detect the nearest food particle and steer toward it.
- **Mouse drag** — spawns `Ripple` rings that expand outward. Any school centroid within `RIPPLE_DISTURB_RADIUS` is pushed away from the ring's origin.
- **Keys 1 / 2 / 3** — switch the active species (Small Fish / Manta Ray / Jellyfish) and call `rebuildSchools()` to reposition all four schools in fresh random locations.

---

## AI Acknowledgement

This project was developed with the assistance of **Claude (Anthropic)**. AI assistance was used for:

- Designing the species silhouette drawing functions (`drawSmallFish`, `drawMantaRay`, `drawJellyfish` in `input-controls.js`) — generating the bezier vertex shapes for body, fins, tail, and eye placement.
- Debugging the zone-boundary bounce logic in `sketch.js`.
- Structuring the plant growth system and the recursive `_drawBranch` coral function in `time-based.js`.
- Drafting and formatting this README.

All AI-generated sections are commented in the relevant source files with `// This code was developed with the assistance of Claude (Anthropic)`.

---

## External References

- **Cakir, A. (2022).** *Cosmic Ocean* [Digital illustration]. Displate. https://displate.com/displate/5491899 — Core visual reference for the deep blue / silver-line starry aquarium aesthetic.
- **Musée du Louvre. (n.d.).** Online tours. https://www.louvre.fr/en/online-tours — Inspiration for the immersive single-window exhibition format.
- **Ramalho, D. (2022).** Perlin Noise – flow field. David's Raging Nexus. https://ragingnexus.com/creative-code-lab/experiments/perlin-noise-flow-field/ — Reference for applying Perlin noise to particle drift.
- **SEA LIFE Melbourne Aquarium. (2025).** Journey through living light with Submerged. https://www.visitsealife.com/melbourne/information/news/journey-through-living-light-with-submerged-at-sea-life-melbourne-aquarium/ — Reference for bioluminescent and glowing underwater aesthetics.
- **Williams, M. (2023).** How to create timeless sonic branding. Creative Review. https://www.creativereview.co.uk/sonic-branding-molecular-sound/ — Reference for music-reactive visual systems.
- **p5.js Reference.** https://p5js.org/reference/ — Core library documentation used throughout development.

---

## Interaction Instructions

1. **Open `index.html`** in a modern browser (Chrome or Firefox recommended).
2. **Click "Enter Ocean"** (top-left button) to start the background music and bubble soundscape. The aquarium reacts to the audio immediately — watch the stars pulse and bubbles rise.
3. **Click anywhere** on the canvas to drop food pellets (small green dots). Nearby fish schools will steer toward the food.
4. **Click and drag** to create ripple rings that disturb the water and push fish schools away.
5. **Press 1** to switch to Small Fish schools.
6. **Press 2** to switch to Manta Ray schools.
7. **Press 3** to switch to Jellyfish schools.
8. **Watch and wait** — sea-floor plants (seagrass, kelp, coral) grow slowly upward from the bottom over the first few minutes. Stars drift gently and twinkle independently.

> **Tip:** Move your mouse slowly across the screen to create a gravitational disturbance in the star field.

---

## File Structure

```
project/
├── index.html            # Entry point — loads all scripts
├── style.css             # Base styles (full-screen canvas)
├── sketch.js             # Main p5.js sketch — coordinates all modules
├── audio-mechanic.js     # Audio mechanic (Yuzhu Wei)
├── time-based.js         # Time-based plant growth mechanic (Menghao Li)
├── perlin.js             # Perlin noise star drift mechanic (Xuanning Jin)
├── input-controls.js     # User input mechanic (Zihan Zhong)
└── libraries/
    ├── p5.min.js
    └── p5.sound.min.js
```