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

**Perlin noise star field** — 280 star particles each carry a unique `noiseOffset` seed and an individual `driftSpeed`, both randomised at initialisation. Every frame, `noise()` maps each star's position to a smooth, continuous drift (`px`, `py`), giving the star field a slow, breathing quality that feels organic rather than mechanical. The mouse adds a secondary disturbance: stars within 200px of the cursor receive an additional Perlin-derived, angle-driven nudge, creating gentle, unpredictable ripples through the field. Twinkle is handled separately with a per-star `sin()` oscillator.

**Time-based plant growth** — three plant species (seagrass blades, segmented kelp, branching coral) each grow from `height` upward using `millis()` so growth speed is frame-rate independent. A `growFrac` value (0 → 1 over 20 seconds) scales both height and stroke weight, giving a slow organic reveal. Coral uses a recursive `_drawBranch()` function capped at depth 4.  
- **`millis()`-based growth** — `growFrac = constrain(age / 20000, 0, 1)` drives all size scaling, independent of frame rate
- **`sin()`-based sway** — each plant has its own `swayOffset` and `swaySpeed` so nothing moves in sync
- **Pre-generated `leafLens[]` array** — kelp leaf lengths are fixed at `initPlants()` time rather than calling `random()` every frame, preventing per-frame jitter
- **`oceanStarted` flag** — kelp leaves remain static before the user clicks Enter Ocean; once audio starts, leaves switch to `random()` per-frame motion, making the scene feel responsive to user interaction
- **Recursive branching** — coral uses depth-limited recursion with spread angle and length decay (`len * 0.68`) to produce natural-looking tree growth
- **Irregular polygon rocks** — vertices are distributed around an ellipse with per-vertex random radius variation, plus shadow and highlight passes for depth
- **Layered `sin()` tentacles** — each anemone tentacle combines a global sway with a per-tentacle phase offset for organic, non-uniform motion
- **Curvevertex caustics** — caustic rings use `curveVertex()` with per-vertex radius modulated by multiple overlapping `sin()`/`cos()` waves, drifting slowly across the scene


**Audio amplitude analysis** — This mechanic uses the `p5.sound` library and amplitude analysis to create a responsive underwater atmosphere. Two p5.Amplitude analysers run in parallel: one for the background music track and one for the looping bubble sound. Their levels (`audioLevel`, `bubbleLevel`) are smoothed using `lerp()` each frame and used to control background brightness, star glow, bubble spawn rate, and bubble size in real time.
The `p5.sound` library was chosen because it supports real-time audio analysis and integrates smoothly with generative visual systems. All audio playback is triggered through a user interaction button to comply with browser autoplay policies.
A bubble particle system was also implemented. Bubble particles are continuously generated, animated, faded out, and removed from the array to simulate natural underwater movement. Smooth interpolation using `lerp()` was used throughout the mechanic to create softer visual transitions and a calmer atmosphere.
`FFT` analysis was also briefly tested during development, but the visual response felt too aggressive for the calm underwater atmosphere. The final system instead uses smoothed amplitude analysis with `lerp()` to create softer and more immersive reactions.

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
Responsible for designing and implementing the sound-reactive atmosphere system for the aquarium environment.
Background music playback and browser-compatible audio interaction button
Real-time audio analysis using the `p5.sound` library and `p5.Amplitude`
Audio-reactive background brightness changes
Dynamic star glow and pulsing effects linked to music volume
Floating bubble particle system driven by a separate bubble audio layer
Smooth visual transitions using `lerp()` interpolation
Integration of the audio system into the final combined project structure and merge workflow

### Time-Based — Yuzhu Wei (`time-based.js`)
Plants grow from the sea floor over time using `millis()`. Three types appear: **seagrass blades** (bezier-curve filled shapes that sway with `sin()`), **segmented kelp** (jointed stem with alternating side leaves), and **branching coral** (recursive tree, depth 4). Each plant has a random `spawnTime` offset so they don't all appear at once. Growth fraction (`growFrac`) scales from 0 to 1 over 20 seconds and controls both height and stroke weight.



### Perlin Noise & Randomness — Zihan Zhong (`perlin.js`)
The interaction is built on two layers. 
- **Autonomous Drift** — Every star moves independently using Perlin noise, with its position offset (`px`, `py`) calculated each frame from `noise()`. Because each star has a unique `noiseOffset` seed and a randomised `driftSpeed`, no two stars move in the same rhythm — the overall motion feels like a living, breathing field rather than a uniform animation. 
- **Mouse Disturbance** — When the cursor moves within 200px of a star, a secondary Perlin-derived force is applied in a noise-driven angular direction, pushing the star off its natural drift path. The closer the cursor, the stronger the push. Once the cursor moves away, the star gradually returns to its Perlin-driven trajectory.
Randomness initialises the system — each star's seed, speed, size, brightness, and twinkle phase are all randomised at setup. Perlin noise then governs the ongoing behaviour, ensuring movement is smooth and continuous rather than jumpy or chaotic. The combination produces a star field that feels simultaneously unpredictable and serene.

### User Input — Menghao Li (`input-controls.js`)

This mechanic turns the viewer into a participant. Three input channels — 
click, drag, and number keys — drive both the immediate action and a 
chain of school responses.
- **Mouse click — feeding the fish.** A green pellet drops and slowly 
tumbles downward (`FoodParticle`). The nearest school steers toward it, 
and when close enough, `consume()` is called and the pellet fades. The 
school then enters a *fed* state for ~1.5s: speed drops to 55% and 
members huddle inward (`clusterScale` lerps 1.0 → 0.55 → 1.0).
- **Mouse drag — disturbing the water.** Each drag leaves expanding double 
ripple rings (`Ripple`). Schools within range are pushed away; a strong 
hit also triggers *fright* — the school darts at 2.8× speed, members 
flash brighter, and the burst ramps back to baseline over ~50 frames.
- **Keys 1 / 2 / 3 — switching species.** Swaps the aquarium between Small 
Fish, Manta Ray, and Jellyfish. A brief dark overlay (`switchFade`) 
softens the transition, then `rebuildSchools()` repositions all four 
schools randomly.

**Under the hood.** The mechanic uses p5's input callbacks 
(`mousePressed`, `mouseDragged`, `keyPressed`) as entry points, with two 
particle classes (`FoodParticle`, `Ripple`) managing their own life cycle 
through `update()` / `draw()` / `isDead()` and array splicing. Distance 
checks via `dist()` drive food attraction, ripple repulsion, and the 
"close enough to eat" trigger. Food pellets rotate using `translate()` + 
`rotate()` inside a `push/pop` pair. The species-switch flash is a 
full-canvas semi-transparent `rect()` drawn each frame while `switchFade > 0`.

All transitions use `lerp()` so the schools feel like living organisms 
rather than state machines snapping between values.
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

### Visual & Concept Inspiration

- **Cakir, A. (2022).** *Cosmic Ocean* [Digital illustration]. Displate. https://displate.com/displate/5491899 — Core visual reference for the deep blue / silver-line starry aquarium aesthetic.
- **Musée du Louvre. (n.d.).** Online tours. https://www.louvre.fr/en/online-tours — Inspiration for the immersive single-window exhibition format.
- **SEA LIFE Melbourne Aquarium. (2025).** Journey through living light with Submerged. https://www.visitsealife.com/melbourne/information/news/journey-through-living-light-with-submerged-at-sea-life-melbourne-aquarium/ — Reference for bioluminescent and glowing underwater aesthetics.

### Technical References (code techniques used outside course material)

- **Reynolds, C. (1987).** Flocks, herds and schools: A distributed behavioral model. *ACM SIGGRAPH Computer Graphics*, 21(4), 25–34. https://www.red3d.com/cwr/boids/ — The simplified Boids algorithm underpins the food-attraction and ripple-repulsion steering behaviour in `sketch.js` (`_updateAndDrawSchools`). This technique is also commented in the code.

- **Shiffman, D. (2024).** *The Nature of Code*, Chapter 0: Randomness & Perlin Noise. https://natureofcode.com/random/ — The dual-axis independent noise sampling pattern used in `perlin.js` (`updatePerlin`) to generate smooth 2D star drift is drawn from this reference. This technique is also commented in the code.

- **Shiffman, D. (2024).** *The Nature of Code*, Chapter 8: Fractals. https://natureofcode.com/fractals/ — The recursive `_drawBranch()` coral structure in `time-based.js` is based on the recursive fractal tree algorithm described here. This technique is also commented in the code.

- **p5.js Reference — `bezierVertex()`.** https://p5js.org/reference/p5/bezierVertex/ — Used extensively in `input-controls.js` to construct filled biological silhouettes (fish body, manta ray wings, jellyfish bell) via `beginShape` / `bezierVertex` / `endShape`.

- **p5.sound Reference — `p5.Amplitude`.** https://p5js.org/reference/p5.sound/p5.Amplitude/ — Used in `audio-mechanic.js` to analyse real-time amplitude of two audio tracks and drive visual responses (star glow, background pulse, bubble spawn rate).

- p5.js Reference — `lerp()`. https://p5js.org/reference/p5/lerp/ — 
Used throughout `input-controls.js` and `sketch.js` for smooth state 
transitions (cluster scale, fade overlay, audio level smoothing).

---

## Interaction Instructions

1. **Open `index.html`** in a modern browser (Chrome or Firefox recommended).
2. **Click `Enter Ocean`** (top-left button) to start the background music and bubble soundscape. The aquarium reacts dynamically to the audio — the background subtly shifts in brightness, stars pulse with the music, and bubbles rise through the scene. When the audio stops, the environment gradually returns to its original state while existing bubbles continue drifting upward and fading away.
3. **Click anywhere** on the canvas to drop food pellets (small spinning 
green pellets). Nearby fish schools will steer toward the food, and visibly cluster together for a moment after eating it.
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
├── audio-mechanic.js     # Audio mechanic (Xuanning Jin)
├── time-based.js         # Time-based plant growth mechanic (Yuzhu Wei)
├── Perlin noise.js       # Perlin noise star drift mechanic (Zihan Zhong)
├── User input.js     # User input mechanic (Menghao Li)
└── libraries/
    ├── p5.min.js
    └── p5.sound.min.js
```