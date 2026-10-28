# 🏰 Manor of Shadows: 3D Multiplayer Clue & Chills (v4.0)

**Manor of Shadows** is a zero-dependency, single-file 3D turn-based horror mystery board game built with **Three.js (WebGL)**, **Tailwind CSS (Material Design 3 Dark Theme)**, **Web Audio API**, and **PeerJS (WebRTC)**. 

Blending the deduction mechanics of *Clue* with the cat-and-mouse tension of *Pac-Man* and the charm of *Luigi's Mansion*, players explore a haunted Victorian estate, search misbehaving 3D furniture for overlapping evidence, unlock disguised secret passages, and deduce the true identity of the resident Phantom to rescue their trapped family from the Central Ritual Vault.

---

## 🎮 Live Play & Deployment (GitHub Pages)

Because the entire game—including 3D models, procedural textures, synthesized sound effects, and WebRTC multiplayer—lives inside a single `index.html` file, deploying to GitHub Pages takes less than 60 seconds:

1. Create a new GitHub repository and upload `index.html`.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch** → `main` (root `/`).
4. Open your live `https://<your-username>.github.io/<repo-name>/` URL on any phone, tablet, or desktop browser.

---

## 🌟 Core Gameplay Overview

### 1. The Premise: A Family Rescue Operation
Seeking shelter during a violent thunderstorm, four young heroes enter the estate—only for spectral chains to seal the doors. A shadowy vortex drags the unchosen heroes into the **Central Ritual Vault** at the heart of the mansion. The remaining sleuth(s) must uncover **3 Ghost Clues**, identify the culprit's living portrait on the mansion walls, unseal the Vault, and sprint for the Front Door before the Dread Meter hits 100%.

### 2. Triple-Mode Multiplayer (1 to 4 Players)
- **Solo Sleuth (1P):** Play as 1 hero while the other 3 characters are visibly trapped inside the Central Ritual Vault.
- **Pass & Play Hot-Seat (2–4P on Same Device):** Pass a phone, tablet, or laptop around the couch. Includes an automatic **Turn Handoff Privacy Screen** between turns so your discovered Clues and Pocket Gadgets remain secret from rival players.
- **Online Room Code (2–4P Across Separate Devices):** Powered by serverless **PeerJS WebRTC**. One player clicks **Host Room** to generate a code (`GHOST-XXXX`), and up to 3 friends on their own phones, tablets, or PCs enter the code to sync moves, dice rolls, and board state live.

### 3. Two Selectable Mansion Architectures
- **🏛️ Blackwood Manor (1-Story Classic):** A sprawling single-floor Victorian layout with 6 grand rooms (*Conservatory, Formal Dining, Gourmet Kitchen, Grand Ballroom, Two-Story Library, Master Study*), the *North Gallery*, *Grand Foyer*, and *Central Ritual Vault*.
- **🕰️ Ravenwood Clocktower Estate (2-Story Vertical Mansion):** An 8-room, two-story estate! Climb the **Grand Foyer Staircase** or **West Wing Service Stairs** (`E` key or 1-tap floating button) to move between the **1F Ground Floor** and **2F Upper Floor** (*2F Clocktower Attic, 2F Alchemy Lab, 2F Master Study, 2F Upper Landing*). Use the top `[1F / 2F / Auto]` camera toggle to peek upstairs or downstairs at any time.

---

## 🕵️ Playable Character Roster

Any heroes not selected by human players appear physically inside the locked **Central Ritual Vault** and can bang on the pipes once per game to lure the Ghost away!

| Hero | Passive Trait | Active Skill (3-Turn Cooldown) |
| :--- | :--- | :--- |
| **🕵️ Milo the Sleuth** | **+1 to every Dice Roll** & searches props from **2 tiles away** | **Eagle Eye:** Highlights an unsearched True Clue prop in gold across the mansion. |
| **👟 Zoe the Sprinter** | **Minimum Dice Roll of 3** (never rolls a 1 or 2) | **Turbo Dash:** Instantly grants **+3 Bonus Action Points (AP)** for the current turn. |
| **🔮 Luna the Medium** | Starts with **4 Hearts (Chances)** instead of 3 | **Ecto Ward:** Banishes the Ghost to the far corner of the mansion & reduces Vault Dread by **-30%**. |
| **🥽 Theo the Inventor** | Starts with a free **Pocket Salt** gadget & spots Secret Passages from **3 tiles away** | **Gadget Craft:** Instantly crafts a random **Haunted Pocket Gadget**. |

---

## 🧩 8-Suspect Overlapping Deduction Matrix

Unlike basic elimination games where a single clue gives away the culprit, **Manor of Shadows v4.0** uses an **8-Suspect Overlapping Binary Matrix** across three trait categories (**Era**, **Elemental Sign**, and **Haunted Relic**):

- **1st Clue Found:** Narrows the pool from **8 suspects → 4 suspects**.
- **2nd Clue Found:** Narrows the pool from **4 suspects → 2 suspects**.
- **3rd Clue Found:** Pinpoints the **1 exact Ghost**!

| Suspect | Assigned Room | Era | Elemental Sign | Haunted Relic |
| :--- | :--- | :--- | :--- | :--- |
| **🌿 Lady Evelyn** (*The Poison Botanist*) | Conservatory | Colonial 1700s | Freezing Frost | Silver Locket |
| **🎩 Lord Alistair** (*The Greedy Aristocrat*) | Formal Dining | Colonial 1700s | Freezing Frost | Crystal Vial |
| **👨‍🍳 Chef Marcel** (*The Phantom Sous-Chef*) | Gourmet Kitchen | Colonial 1700s | Cursed Melody | Silver Locket |
| **🎼 Maestro Victor** (*The Midnight Composer*) | Grand Ballroom | Colonial 1700s | Cursed Melody | Crystal Vial |
| **👓 Professor Vance** (*The Occult Archivist*) | Grand Library | Victorian 1800s | Freezing Frost | Silver Locket |
| **⚓ Captain Sterling** (*The Cursed Navigator*) | Master Study | Victorian 1800s | Freezing Frost | Crystal Vial |
| **🕰️ Duchess Helena** (*The Clocktower Heiress*) | 2F Clocktower *(or Foyer)* | Victorian 1800s | Cursed Melody | Silver Locket |
| **🧪 Dr. Mordecai** (*The Mad Alchemist*) | 2F Alchemy Lab *(or Gallery)* | Victorian 1800s | Cursed Melody | Crystal Vial |

---

## 🏆 Competitive Sleuth Points & Secondary Objectives

Even in cooperative escape or defeat, players compete for the **1st–4th Place Sleuth Trophy Leaderboard**:

- **+50 pts:** Searching any haunted furniture prop (`1 AP`)
- **+75 pts:** Triggering the Trapped Family Vault Pipe Distraction
- **+100 pts:** High-Fiving / **Sharing Intel** with another player while standing in the same room (syncs both players' Case File clues!)
- **+150 pts:** Discovering an Architect Blueprint or unlocking a disguised Secret Passage (`1 AP`)
- **+250 pts:** Finding a **True Ghost Clue** (+1 Bonus AP & -20% Vault Dread)
- **+300 pts:** Finding one of the **3 Bonus Golden Heirlooms** (*The Stolen Blackwood Will*, *Gilded Starlight Music Box*, *Vial of Eternal Aether*)
- **+500 pts:** Making the correct **Portrait Accusation** inside the culprit's room
- **+300 pts:** Completing the **Final Escape Sprint** out the Foyer Front Door after the Vault unseals
- **-100 pts:** Getting ambushed by the Ghost (-200 pts for a false Portrait Accusation)

---

## 🔦 Tactical Light, Gadgets & Jump Scare Settings

- **Flashlight Toggle (`L` Key / 0 AP):** Keep your 3D volumetric flashlight **ON** for full illumination and secret-passage detection, or switch to **Stealth Mode (OFF)** to blend into the shadows.
- **Moonlight Window Tiles:** Exterior arched windows cast natural moonlight onto perimeter floor tiles, allowing safe inspection even with your flashlight off.
- **Haunted Pocket Gadgets (`G` Key):**
  - **🧂 Pocket Salt:** Drops a protective salt ward on your current tile that blocks the Ghost for 3 turns.
  - **🛼 Winged Skates:** Grants **+4 Bonus Action Points** immediately.
  - **📻 Ghost Decoy:** Lures the Ghost toward the Central Vault for 2 turns.
- **Customizable Jump Scare Intensity:** Toggle between **🎃 Spooky Fun** (family-friendly cartoon spook) and **💀 Full Fright** (lunging spectral fangs, screen-shake, strobe flash, and full synthesized shriek) right in the game lobby.

---

## 📱 Controls (Mobile, Tablet & Desktop PC)

| Action | Mobile / Tablet Touch | Desktop Keyboard / Mouse |
| :--- | :--- | :--- |
| **Move Character** | **Tap any glowing 3D teal floor square** or use On-Screen D-Pad | `W A S D` or `Arrow Keys` (Camera-Relative) or Click 3D Tile |
| **Rotate / Zoom 3D Camera** | 1-Finger Drag to Orbit • 2-Finger Pinch to Zoom | Left-Click Drag to Orbit • Right-Click Drag to Pan • Scroll |
| **Roll Dice** | Tap **ROLL DICE** button | `Spacebar` |
| **Search Haunted Prop** | Tap floating **`🔍 Search Prop`** pill or tap the 3D furniture | `F` or `Enter` |
| **Use Stairs / Secret Passage** | Tap floating **`🪜 Stairs / Lever`** pill or tap the 3D stairs | `E` |
| **Open Suspect Matrix** | Tap **`Matrix (R)`** or tap any 3D Wall Portrait | `R` |
| **Toggle Flashlight** | Tap **`Light ON / Stealth`** button | `L` |
| **Use Pocket Gadget** | Tap **`Gadget`** button | `G` |
| **End Turn** | Tap **`End`** button | `X` |

---

## 📜 Version History & Feature Log

### **Version 4.0 — The Multiplayer, Two-Story & Mobile Overhaul (Current)**
- **Added:** **Ravenwood Clocktower Estate** selectable 2-story mansion map with 3D staircases, vertical dumbwaiter shaft, and `[1F / 2F / Auto]` floor switcher.
- **Added:** **Triple-Mode Lobby** supporting 1P Solo, 2–4P Pass & Play (with turn-handoff privacy screen), and 2–4P Online Room Codes via PeerJS WebRTC.
- **Added:** **4th Playable Hero** (**Theo the Inventor**) with steampunk goggles, starting Pocket Salt, and extended blueprint detection.
- **Added:** **3D Floating Room Nameplates** hovering directly over every room on the board for instant spatial orientation.
- **Added:** **8-Suspect Overlapping Trait Matrix** (*Era • Sign • Relic*) requiring multi-clue deduction + **Share Intel** room high-fives (+100 pts).
- **Added:** **Sleuth Points System**, **3 Golden Heirloom** secondary objectives (+300 pts each), **Haunted Pocket Gadgets**, and **Final Escape Sprint** phase.
- **Added:** **Full-Screen Jump Scare Overlay** with selectable **Spooky Fun** vs. **Full Fright** intensity modes.
- **Added:** **Mobile-First Responsive UX** with 1-tap floating context action pills and a collapsible slide-up Case File drawer.

### **Version 3.0 — Bespoke 3D Room Architecture & Disguised Secret Passages**
- **Added:** High-resolution procedural Canvas textures for marble, herringbone oak, checkerboard tile, parquet, and mossy conservatory floors.
- **Added:** Multi-part 3D furniture centerpieces with active poltergeist tells (Grand Piano with floating music notes, Billiards Table with rolling pool balls, Cauldron Stove, Snapping Venus Flytrap, Bookcases with flying books).
- **Added:** Custom-painted 2D-on-3D Suspect Portraits mounted in gold frames on each room's North Wall.
- **Added:** Disguised 3D Secret Passages with floor scrape marks, Architect Blueprint clues, and hinged 3D wall triggers (`E`).
- **Added:** Web Audio API procedural sound synthesizer (surface-reactive footsteps, dice clatter, secret mechanisms, and victory chimes).

### **Version 2.0 — The 3D Dollhouse & Family Rescue Upgrade**
- **Added:** Full Three.js 3D mansion rendering with `OrbitControls`, camera presets (*45° Dollhouse, Top-Down 3D, Follow Cam*), and Sims-style automatic cutaway walls.
- **Added:** **Central Hidden Ritual Vault** housing the unchosen playable characters as trapped family members who provide periodic hints and a 1x Pipe Bang distraction.
- **Added:** Tactical 3D volumetric Flashlight cone (`L`), Moonlight Window safe tiles, and Standard vs. Nightmare Fog-of-War difficulty modes.

### **Version 1.0 — Original 2D Prototype**
- Initial top-down 2D gridded mansion with 3 characters (Milo, Zoe, Luna), turn-based dice movement, 6 rooms, basic clue collection, and Material Design 3 dark UI.