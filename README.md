# 🏰 Manor of Shadows 4.2: 3D Multiplayer Clue & Chills

**Manor of Shadows** is a zero-build, family-friendly 3D haunted mansion mystery board game built with **Three.js (WebGL)**, **Tailwind CSS**, **PeerJS (WebRTC Online Multiplayer)**, and a procedural **Web Audio API** sound synthesizer.

Play **1-Player Solo**, **2–4 Player Local Pass & Play**, or **2–4 Player Online Room Codes** across phones, tablets, and desktops—either hosted directly on **GitHub Pages** or opened offline via double-clicking `index.html`.

---

## 📁 Modular GitHub Repository Structure

This project is organized as a clean, zero-build multi-file web package that works **both** when deployed to **GitHub Pages (`https://`)** and when double-clicked locally (`file://`) without any bundler or `npm` step required:

```text
Manor of Shadows/
├── index.html          # Main 3D viewport, responsive HUD, Clean View & game modals
├── README.md           # Documentation, rules, controls & version history
├── .gitignore          # Standard Git ignore rules
├── css/
│   └── styles.css      # Custom keyframe animations, Material elevation & scrollbars
└── js/
    ├── audio.js        # Web Audio API synth (footsteps, thunder rumbles, chimes, scares)
    ├── config.js       # 4 Heroes, 8 Suspects, Gadgets, Heirlooms & 2 Mansion Maps
    ├── state-net.js    # Game state, Pass & Play handoff & PeerJS WebRTC multiplayer
    ├── textures-3d.js  # Procedural floor/wall canvases, storm windows & North-Wall headers
    ├── mansion-3d.js   # 3D mansion builder, Gothic windows, dust motes & articulated models
    ├── gameplay-ai.js  # Movement, clues, light switches, Vault Wall Breaker & Smart Ghost AI
    └── ui-loop.js      # HUD sync, lightning storm system, auto-fade labels & 60fps loop
```

### 🚀 How to Run or Deploy to GitHub Pages
1. **Play Locally (Offline / Zero Server)**: Simply double-click `index.html` in any modern web browser.
2. **Deploy to GitHub Pages**:
   - Push this folder to a GitHub repository.
   - Go to **Settings → Pages → Build and deployment**, select **Deploy from a branch (`main` / root)**, and save.
   - Share your live GitHub Pages URL with family and friends to play together on any phone, tablet, or computer!

---

## 🌟 What's New in Version 4.2

### 1. 🏷️ Non-Intrusive North-Wall Room Headers + Auto-Fade
- **North-Wall Architectural Placement**: Room labels are now sleek **Brass Architectural Headers** pinned high along each room's back North wall (`z = room.y1 - 0.44`) instead of floating over the center of the room where chandeliers and 3D furniture sit.
- **Smart Auto-Fade (25% Opacity)**: When the active player steps inside a room, that room's nameplate automatically fades to **25% opacity** so it never blocks gameplay or props. You can also toggle headers anytime via the **`🏷️ Labels`** button on the bottom-left camera bar.

### 2. ⚡ Wall-Mounted Vault Circuit Breaker (Zero Hallway Obstruction)
- **Bolted Flush on the Central Ritual Vault's West Exterior Wall (`7, 7`)**: The Master Circuit Breaker cabinet is mounted flush onto the stone exterior wall of the Central Ritual Vault facing corridor tile `(7, 7)`, keeping the hallway walking path **100% clear and unobstructed**.
- **Global Panic Reset (`1 AP`)**: Pulling the Vault Wall Breaker floods every room in the mansion with Ghost-proof chandelier light for **2 full rounds**, awards **+100 Sleuth Points**, triggers an electrical storm flash, and banishes the Ghost to a random room **8+ tiles away**!

### 3. ⛈️ Visuals & Atmosphere Overhaul
- **Dynamic Thunderstorm & Lightning Window Shafts**: 3D Gothic leaded-glass windows with diagonal rain streaks line the outer walls, casting volumetric moonlight beams across the floor and flashing with multi-pulse lightning and distant thunder rumbles every ~15–22 seconds.
- **Ambient Dust Motes, Flickering Wall Sconces & Ectoplasm Vortex**: 44 golden/teal spectral dust motes drift through the mansion air alongside warm flickering wall sconces and a swirling ectoplasm vortex ring beneath the Ghost.
- **Expressive 3D Hero & Ghost Animations**:
  - Heroes smoothly rotate (`visualRotY`) to face their walking direction, sweeping their volumetric 3D flashlight beam naturally ahead of them, and visibly **shiver/tremble** when the Ghost is within 4 tiles!
  - The 3D Phantom features articulated floating arms, rippling tattered hem spheres, and a swinging spectral lantern.

### 4. 🧠 Smarter Co-op Ghost AI & Ectoplasm Footprints
- **Far-Away Randomized Spawn & Respawn (`8+ Tiles Away`)**: At the start of every match—and whenever banished by a Room Light, the Vault Wall Breaker, Luna's Ecto Ward, or after catching a player—the Ghost calculates distances to all players and spawns in a random unlit room at least **8+ tiles away**.
- **Beam Hunt vs. Clue Patrol AI**:
  - **Flashlight Beam ON (`HUNTING BEAM`)**: If any player outside a Lit Safe Room has their Flashlight ON, the Ghost locks onto the nearest beam and hunts them.
  - **Stealth Mode (`PATROLLING CLUES`)**: When all Flashlights are OFF, the Ghost intelligently patrols from one **unsearched True Clue room** to the next!
- **Glowing 3D Ectoplasm Footprints & Poltergeist Rattle**: Every step the Ghost takes leaves a glowing **3D Ectoplasm Footprint** on the floor for 1 round and violently rattles nearby unsearched furniture with a spooky audio tell so observant families can track its trail.

---

## 🎮 Controls & Shortcuts

| Action | Mobile / Tablet (Touch) | Desktop (Keyboard / Mouse) |
| :--- | :--- | :--- |
| **Roll Dice** | Tap **`🎲 Roll Dice`** on bottom pill | `Spacebar` or click **ROLL DICE** |
| **Move Sleuth** | Tap **glowing 3D floor tiles** or use D-Pad | Click **3D floor tiles** or `WASD` / `Arrow Keys` |
| **Flip Room Light Switch** | Tap floating **`💡 Flip Room Switch`** pill or 3D chandelier | `K` or click the **3D Room Switch / Chandelier** |
| **Pull Vault Wall Breaker** | Walk to `(7,7)` by the Central Vault & tap **`⚡ Pull Vault Wall Breaker`** | Click the **3D Red Breaker Box on the Vault Wall** |
| **Search Haunted Prop** | Tap floating **`🔍 Search Prop`** pill or tap 3D furniture | `F` or `Enter` |
| **Use Stairs / Secret Passage** | Tap floating **`🪜 Stairs / Lever`** pill or tap 3D stairs | `E` |
| **Open Suspect Matrix** | Tap **`Matrix (R)`** or tap any 3D Wall Portrait | `R` |
| **Toggle Clean 3D Viewport** | Tap **`👁️ Clean View`** (expands 3D view to 92%+ of screen) | Click **`👁️ Clean View`** |
| **Toggle Room Headers** | Tap **`🏷️ Labels`** on bottom-left bar | Click **`🏷️ Labels`** |
| **Toggle Personal Flashlight** | Tap **`Beam ON / Stealth`** button | `L` |
| **Use Pocket Gadget** | Tap **`Gadget`** button | `G` |
| **End Turn** | Tap **`⏭️ End Turn`** button | `X` |

---

## 📜 Version History & Feature Log

### **Version 4.2 — Modular GitHub Package, Storm FX, Smarter Ghost AI & Architectural Polish (Current)**
- **Added:** **Modular Zero-Build GitHub Package** (`index.html`, `css/styles.css`, and 6 modular `js/*.js` files) compatible with both **GitHub Pages** and local `file://` double-click execution.
- **Added:** **Slim Brass North-Wall Room Headers** with automatic **25% opacity fade** when the active player is inside that room + a `🏷️ Labels` toggle button.
- **Added:** **Wall-Mounted Master Circuit Breaker** bolted flush onto the Central Ritual Vault's West Exterior Stone Wall at `(7, 7)` so the hallway walking path remains 100% clear.
- **Added:** **Dynamic Thunderstorm & Lightning Window Shafts** with 3D Gothic rain-streaked windows, volumetric floor light beams, and periodic lightning flashes + thunder rumbles.
- **Added:** **Floating Spectral Dust Motes, Flickering Wall Sconces, and Expressive 3D Hero/Ghost Animations** (smooth directional rotation, proximity shivering within 4 tiles, articulated Ghost arms & swinging lantern).
- **Added:** **Smarter Co-op Ghost AI** with **Far-Away Randomized Spawns (`8+ tiles`)**, **Unsearched Clue Room Patrols** during Stealth, **Glowing 3D Ectoplasm Footprints**, and **Poltergeist Furniture Rattling**.

### **Version 4.1 — Room Light Switches, Master Breaker, 2F Framing & Clean Viewport**
- **Added:** **Room Light Switches (`K` Key / 1-Tap Pill)** with **One-Flip-Per-Turn Rule**: flip room chandeliers **ON** to create a Ghost-proof safe zone, or **OFF** to see and search paranormal Clues.
- **Added:** **1F Master Circuit Breaker (`1 AP`)**: global panic lever that floods every room in the mansion with light for 2 rounds and banishes the Ghost (+100 pts).
- **Added:** **2F Architectural Mezzanine Trim & Balustrade** on Ravenwood Clocktower (`2F UPPER DECK` corner badges & `1F GROUND FLOOR` indigo foundation trim).
- **Added:** **Two Dedicated 1F ⇅ 2F Vertical Secret Passages** (*West Wing Kitchen Dumbwaiter ⇅ 2F Alchemy Hatch* and *East Wing Library Bookcase ⇅ 2F Clocktower Pendulum Trapdoor*) with glowing 3D dotted vertical light-tubes.
- **Added:** **Mobile & Tablet "Clean Viewport" HUD + Brighter Default Lighting** (`#120d22`) and **Main Menu Story & Rules Explainer Banner**.

### **Version 4.0 — The Multiplayer, Two-Story & Mobile Overhaul**
- **Added:** **Ravenwood Clocktower Estate** selectable 2-story mansion map, **Triple-Mode Lobby** (1P Solo, 2–4P Pass & Play, 2–4P Online WebRTC), **Theo the Inventor**, **8-Suspect Overlapping Trait Matrix**, **Sleuth Points**, **3 Golden Heirlooms**, and **Full-Screen Jump Scare Overlay**.

### **Version 3.0 — Bespoke 3D Room Architecture & Disguised Secret Passages**
- **Added:** Procedural Canvas textures, multi-part 3D furniture centerpieces, custom-painted 2D-on-3D Suspect Portraits, disguised 3D Secret Passages, and Web Audio API sound synthesizer.

### **Version 2.0 — The 3D Dollhouse & Family Rescue Upgrade**
- **Added:** Full Three.js 3D mansion rendering with `OrbitControls`, Central Hidden Ritual Vault with trapped family members, and volumetric Flashlight cone.

### **Version 1.0 — Original 2D Prototype**
- Initial top-down 2D gridded mansion prototype.
