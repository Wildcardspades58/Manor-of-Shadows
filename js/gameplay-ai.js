/* ============================================================================
 * 7. LOBBY, MOVEMENT, LIGHT SWITCHES, BREAKER & SMARTER CO-OP GHOST AI
 * ============================================================================ */
let selectedCharIdsByPlayer = ['sleuth', 'sprinter', 'medium', 'inventor'];

// v4.2 Far-Away Randomized Ghost Spawn & Respawn (Always >= 8 tiles from all players!)
function pickRandomGhostSpawnFarFromPlayers(minDist = 8) {
    const mapDef = getCurrentMap();
    const candidates = [];

    for (const room of mapDef.rooms) {
        if (room.isLockedVault || room.id === 'foyer') continue;
        if (state.roomLights && state.roomLights[room.id]) continue;

        for (let gx = room.x1; gx <= room.x2; gx++) {
            for (let gy = room.y1; gy <= room.y2; gy++) {
                const blockedByProp = state.props && state.props.some(pr => pr.floor === room.floor && pr.x === gx && pr.y === gy);
                if (blockedByProp) continue;

                let minPlayerDist = 999;
                if (state.players && state.players.length > 0) {
                    for (const pl of state.players) {
                        const floorPenalty = pl.floor !== room.floor ? 6 : 0;
                        const d = Math.abs(pl.x - gx) + Math.abs(pl.y - gy) + floorPenalty;
                        if (d < minPlayerDist) minPlayerDist = d;
                    }
                } else {
                    minPlayerDist = Math.abs(9 - gx) + Math.abs(12 - gy);
                }

                candidates.push({ floor: room.floor, x: gx, y: gy, roomId: room.id, roomName: room.name, dist: minPlayerDist });
            }
        }
    }

    if (candidates.length === 0) {
        return { floor: 0, x: 3, y: 2, roomId: 'conservatory', roomName: 'Conservatory', dist: 12 };
    }

    const farOnes = candidates.filter(c => c.dist >= minDist);
    if (farOnes.length > 0) {
        return farOnes[Math.floor(Math.random() * farOnes.length)];
    }

    candidates.sort((a, b) => b.dist - a.dist);
    const topPool = candidates.slice(0, Math.max(1, Math.ceil(candidates.length * 0.25)));
    return topPool[Math.floor(Math.random() * topPool.length)];
}

function selectLobbyMode(mode) {
    state.lobbyMode = mode;
    SoundFX.clickSwitch();

    document.getElementById('modeBtnSolo').className = mode === 'solo'
        ? 'p-2.5 rounded-xl border-2 text-left transition-all bg-md-surface3 border-teal-400'
        : 'p-2.5 rounded-xl border-2 text-left transition-all bg-md-surface1 border-purple-800/50 hover:border-purple-500';
    document.getElementById('modeBtnPass').className = mode === 'pass'
        ? 'p-2.5 rounded-xl border-2 text-left transition-all bg-md-surface3 border-amber-400'
        : 'p-2.5 rounded-xl border-2 text-left transition-all bg-md-surface1 border-purple-800/50 hover:border-purple-500';
    document.getElementById('modeBtnOnline').className = mode === 'online'
        ? 'p-2.5 rounded-xl border-2 text-left transition-all bg-md-surface3 border-purple-400'
        : 'p-2.5 rounded-xl border-2 text-left transition-all bg-md-surface1 border-purple-800/50 hover:border-purple-500';

    const onlinePanel = document.getElementById('onlineSubPanel');
    if (mode === 'solo') {
        setPlayerCount(1);
        onlinePanel.classList.add('hidden');
        onlinePanel.classList.remove('flex');
    } else if (mode === 'pass') {
        if (state.playerCount < 2) setPlayerCount(2);
        onlinePanel.classList.add('hidden');
        onlinePanel.classList.remove('flex');
    } else {
        if (state.playerCount < 2) setPlayerCount(2);
        onlinePanel.classList.remove('hidden');
        onlinePanel.classList.add('flex');
    }
}

function setPlayerCount(count) {
    state.playerCount = count;
    SoundFX.clickSwitch();
    [1, 2, 3, 4].forEach(n => {
        const btn = document.getElementById('pCountBtn' + n);
        btn.className = n === count
            ? 'px-3 py-1 rounded-lg text-xs font-bold bg-teal-400 text-slate-950'
            : 'px-3 py-1 rounded-lg text-xs font-bold bg-md-surface3 text-purple-200';
    });
    renderCharacterSelectionCards();
}

function selectMansionMap(mapId) {
    state.mapId = mapId;
    SoundFX.clickSwitch();
    document.getElementById('mapCardBlackwood').className = mapId === 'blackwood'
        ? 'cursor-pointer p-3 rounded-xl border-2 transition-all bg-md-surface3 border-amber-400 flex flex-col justify-between'
        : 'cursor-pointer p-3 rounded-xl border-2 transition-all bg-md-surface1 border-purple-800/50 hover:border-purple-500 flex flex-col justify-between';
    document.getElementById('mapCardRavenwood').className = mapId === 'ravenwood'
        ? 'cursor-pointer p-3 rounded-xl border-2 transition-all bg-md-surface3 border-teal-400 flex flex-col justify-between'
        : 'cursor-pointer p-3 rounded-xl border-2 transition-all bg-md-surface1 border-purple-800/50 hover:border-purple-500 flex flex-col justify-between';
}

function setScareMode(mode) {
    state.scareMode = mode;
    SoundFX.clickSwitch();
    document.getElementById('scareBtnFun').className = mode === 'fun'
        ? 'px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 transition-all'
        : 'px-2.5 py-1 rounded-lg text-purple-200 hover:text-white transition-all';
    document.getElementById('scareBtnFull').className = mode === 'full'
        ? 'px-2.5 py-1 rounded-lg bg-rose-500 text-white transition-all'
        : 'px-2.5 py-1 rounded-lg text-purple-200 hover:text-white transition-all';
}

function setDifficultyMode(mode) {
    state.difficulty = mode;
    SoundFX.clickSwitch();
    document.getElementById('diffBtnStandard').className = mode === 'standard'
        ? 'px-2.5 py-1 rounded-lg bg-teal-400 text-slate-950 transition-all'
        : 'px-2.5 py-1 rounded-lg text-purple-200 hover:text-white transition-all';
    document.getElementById('diffBtnNightmare').className = mode === 'nightmare'
        ? 'px-2.5 py-1 rounded-lg bg-rose-500 text-white transition-all'
        : 'px-2.5 py-1 rounded-lg text-purple-200 hover:text-white transition-all';
}

function selectHeroForP1(charId) {
    const idx = selectedCharIdsByPlayer.indexOf(charId);
    if (idx > 0) {
        const temp = selectedCharIdsByPlayer[0];
        selectedCharIdsByPlayer[0] = charId;
        selectedCharIdsByPlayer[idx] = temp;
    }
    SoundFX.step();
    renderCharacterSelectionCards();
}

function renderCharacterSelectionCards() {
    const container = document.getElementById('characterCardsGrid');
    container.innerHTML = CHARACTERS.map(c => {
        const slotIdx = selectedCharIdsByPlayer.indexOf(c.id);
        const isActiveHuman = slotIdx < state.playerCount;
        const slotBadge = isActiveHuman
            ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-400 text-slate-950">PLAYER ${slotIdx + 1}</span>`
            : `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-500/30">Trapped in Vault</span>`;

        return `
            <div onclick="selectHeroForP1('${c.id}')" class="cursor-pointer rounded-2xl p-3.5 border-2 transition-all ${
                isActiveHuman
                    ? 'bg-md-surface3 border-teal-400 shadow-lg'
                    : 'bg-md-surface2 border-purple-800/40 opacity-75 hover:opacity-100'
            }">
                <div class="flex items-center justify-between mb-1.5">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center text-2xl bg-md-surface1 border border-purple-600/30">
                        ${c.emoji}
                    </div>
                    ${slotBadge}
                </div>
                <h4 class="font-cartoon text-sm font-bold text-white">${c.name}</h4>
                <span class="text-[10px] text-amber-300 font-semibold block mb-1">${c.badge}</span>
                <p class="text-[11px] text-purple-200/80 leading-snug">${c.description}</p>
            </div>
        `;
    }).join('');
}

function openLobbyModal() {
    renderCharacterSelectionCards();
    document.getElementById('endGameModal').classList.add('hidden');
    document.getElementById('endGameModal').classList.remove('flex');
    document.getElementById('lobbyModal').classList.remove('hidden');
    document.getElementById('lobbyModal').classList.add('flex');
}

function startMatchFromLobby() {
    SoundFX.init();
    SoundFX.dice();
    document.getElementById('lobbyModal').classList.add('hidden');
    document.getElementById('lobbyModal').classList.remove('flex');
    const sprintBanner = document.getElementById('escapeSprintBanner');
    if (sprintBanner) {
        sprintBanner.classList.add('hidden');
        sprintBanner.classList.remove('flex');
    }

    clearAllGhostFootprints3D();
    buildMansionArchitecture3D();

    const startCoords = [
        { x: 8, y: 12 }, { x: 10, y: 12 }, { x: 8, y: 13 }, { x: 10, y: 13 }
    ];
    state.players = [];
    for (let i = 0; i < state.playerCount; i++) {
        const cObj = CHARACTERS.find(c => c.id === selectedCharIdsByPlayer[i]) || CHARACTERS[i];
        const sc = startCoords[i];
        state.players.push({
            index: i,
            name: `Player ${i + 1}`,
            char: cObj,
            floor: 0,
            x: sc.x,
            y: sc.y,
            visualX: sc.x,
            visualY: sc.y,
            visualFloor: 0,
            rotY: Math.PI,
            visualRotY: Math.PI,
            hearts: cObj.maxHearts,
            maxHearts: cObj.maxHearts,
            score: 0,
            skillCooldown: 0,
            flashlightOn: true,
            gadget: cObj.id === 'inventor' ? { ...POCKET_GADGETS[0] } : null,
            discoveredClues: [],
            heirlooms: [],
            crossedOffSuspectIds: [],
            escaped: false
        });
    }

    state.trappedFamily = [];
    for (let i = state.playerCount; i < 4; i++) {
        const cObj = CHARACTERS.find(c => c.id === selectedCharIdsByPlayer[i]);
        if (cObj) state.trappedFamily.push(cObj);
    }
    if (state.trappedFamily.length === 0) {
        state.trappedFamily = [CHARACTERS[2]];
    }

    state.activePlayerIndex = 0;
    state.ap = 0;
    state.turnPhase = 'ROLL';
    state.turnNumber = 1;
    state.dread = 0;
    state.familyDistractAvailable = true;
    state.ghostLuredToVaultTurns = 0;
    state.vaultUnlocked = false;
    state.escapeRoundsLeft = 0;
    state.discoveredBlueprints = [];
    state.openedPassages = { pairA: false, pairB: false };
    state.viewFloor = 'auto';

    // Initialize Room Light Switches (all OFF at start) & Master Breaker
    state.roomLights = {};
    getCurrentMap().rooms.forEach(r => {
        if (!r.isLockedVault) state.roomLights[r.id] = false;
    });
    state.lightFlippedThisTurn = {};
    state.masterBreakerRoundsLeft = 0;

    // Populate 14 Props across current map: 6 True Clues, 3 Bonus Golden Heirlooms, 2 Blueprints, 3 Pocket Gadgets
    const mapProps = getCurrentMap().props;
    const shuffled = [...mapProps].sort(() => Math.random() - 0.5);
    const clueCats = ['era', 'curse', 'relic', 'era', 'curse', 'relic'];

    state.props = mapProps.map(t => {
        const idx = shuffled.findIndex(p => p.id === t.id);
        return {
            ...t,
            searched: false,
            hasClue: idx < 6,
            clueCategory: idx < 6 ? clueCats[idx] : null,
            heirloom: (idx >= 6 && idx < 9) ? BONUS_HEIRLOOMS[idx - 6] : null,
            blueprintPairId: idx === 9 ? 'pairA' : idx === 10 ? 'pairB' : null,
            gadgetReward: idx >= 11 ? POCKET_GADGETS[idx % POCKET_GADGETS.length] : null,
            revealedBySleuth: false
        };
    });

    state.trueSuspect = SUSPECTS[Math.floor(Math.random() * SUSPECTS.length)];

    // v4.2 Far-Away Randomized Ghost Starting Position (>= 8 tiles from all players!)
    const startGhostPos = pickRandomGhostSpawnFarFromPlayers(8);
    state.ghost = {
        floor: startGhostPos.floor,
        x: startGhostPos.x,
        y: startGhostPos.y,
        visualX: startGhostPos.x,
        visualY: startGhostPos.y,
        visualFloor: startGhostPos.floor,
        rotY: 0,
        visualRotY: 0,
        mode: 'PATROLLING CLUES',
        targetRoomId: null
    };

    rebuildDynamic3DEntities();
    updateFloorSwitcherUI();
    syncAllUI();

    showToast(`${getCurrentMap().name} loaded! Ghost spawned far away in ${startGhostPos.roomName}—Roll Dice!`, 'castle');
    broadcastOnlineState();
}

function rebuildDynamic3DEntities() {
    playerMeshes.forEach(m => scene.remove(m));
    playerMeshes = [];
    if (ghostGroup) scene.remove(ghostGroup);
    trappedFamilyGroups.forEach(g => scene.remove(g));
    trappedFamilyGroups = [];
    Object.values(propMeshes).forEach(m => {
        if (m.parent) m.parent.remove(m);
    });
    propMeshes = {};

    state.players.forEach(p => {
        const pMesh = buildCartoonHeroMesh(p.char, true);
        const pos = gridToWorld(p.x, p.y, p.floor);
        pMesh.position.set(pos.x, pos.y, pos.z);
        scene.add(pMesh);
        playerMeshes.push(pMesh);
    });

    state.trappedFamily.forEach((famChar, idx) => {
        const famMesh = buildCartoonHeroMesh(famChar, false);
        const fPos = gridToWorld(8.5 + idx * 0.9, 6.5, 0);
        famMesh.position.set(fPos.x, 0, fPos.z);
        famMesh.userData = { ...famMesh.userData, baseX: fPos.x, baseZ: fPos.z, offset: idx * Math.PI };
        floorGroups[0].add(famMesh);
        trappedFamilyGroups.push(famMesh);
    });

    ghostGroup = buildCartoonGhostMesh();
    const gPos = gridToWorld(state.ghost.x, state.ghost.y, state.ghost.floor);
    ghostGroup.position.set(gPos.x, gPos.y, gPos.z);
    scene.add(ghostGroup);

    for (const prop of state.props) {
        const pMesh = buildHauntedProp3D(prop);
        const pos = gridToWorld(prop.x, prop.y, prop.floor);
        pMesh.position.set(pos.x, pos.y, pos.z);
        floorGroups[prop.floor].add(pMesh);
        propMeshes[prop.id] = pMesh;
    }
}

/* ============================================================================
 * 8. MOVEMENT, STAIRS (1F <-> 2F), SECRET PASSAGES, CLUES & GADGETS
 * ============================================================================ */
function movePlayerCameraRelative(inputX, inputY) {
    if (state.turnPhase !== 'MOVE') {
        if (state.turnPhase === 'ROLL') showToast('Tap ROLL DICE first!', 'casino');
        return;
    }
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    if (forward.lengthSq() < 0.001) forward.set(0, 0, -1);
    forward.normalize();

    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
    const moveVec = new THREE.Vector3().addScaledVector(right, inputX).addScaledVector(forward, -inputY);

    let dx = 0, dy = 0;
    if (Math.abs(moveVec.x) > Math.abs(moveVec.z)) dx = Math.sign(moveVec.x);
    else dy = Math.sign(moveVec.z);

    movePlayerGrid(dx, dy);
}

function movePlayerGrid(dx, dy) {
    if (state.lobbyMode === 'online' && !Net.isHost && state.activePlayerIndex === Net.myPlayerIndex) {
        Net.hostConn.send({ type: 'REMOTE_ACTION', action: 'MOVE', dx, dy });
        return;
    }
    if (state.turnPhase !== 'MOVE') return;
    if (state.ap <= 0) {
        showToast('0 AP remaining! Tap End Turn or use a Gadget.', 'hourglass_empty');
        return;
    }

    const p = getActivePlayer();
    const targetX = p.x + dx;
    const targetY = p.y + dy;
    p.rotY = Math.atan2(dx, dy);

    const propAtTarget = state.props.find(pr => pr.floor === p.floor && pr.x === targetX && pr.y === targetY && !pr.searched);
    if (propAtTarget) {
        interactWithSpecificProp(propAtTarget);
        return;
    }

    if (!canMoveBetween(p.floor, p.x, p.y, targetX, targetY)) {
        SoundFX.playTone(110, 'sine', 0.06, 0.05);
        return;
    }

    p.x = targetX;
    p.y = targetY;
    state.ap--;

    const enteredRoom = getRoomAt(p.floor, targetX, targetY);
    SoundFX.step(enteredRoom ? enteredRoom.floorType : 'hallway');
    if (enteredRoom) state.exploredRooms.add(enteredRoom.id);

    if (state.vaultUnlocked && p.floor === 0 && enteredRoom && enteredRoom.id === 'foyer' && !p.escaped) {
        p.escaped = true;
        p.score += 300;
        SoundFX.victory();
        showToast(`${p.char.shortName} escaped out the Front Door! +300 Escape Bonus Points!`, 'door_open');
        if (state.players.every(pl => pl.escaped)) {
            finishMatchWithLeaderboard(true, 'Every sleuth escaped Blackwood Manor with the rescued family!');
            return;
        }
    }

    if (p.floor === state.ghost.floor && p.x === state.ghost.x && p.y === state.ghost.y) {
        triggerGhostCatch(p);
        return;
    }

    syncAllUI();
    rebuildStepHighlights3D();
    broadcastOnlineState();
}

function handle3DViewportClick(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouseVec.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseVec.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouseVec, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    const p = getActivePlayer();

    for (const hit of intersects) {
        let obj = hit.object;
        while (obj) {
            if (obj.userData && obj.userData.isPortrait) {
                inspectCurrentRoomPortrait();
                return;
            }
            if (obj.userData && obj.userData.isRoomLightSwitch) {
                flipCurrentRoomLight();
                return;
            }
            if (obj.userData && obj.userData.isMasterBreaker) {
                pullMasterCircuitBreaker();
                return;
            }
            if (obj.userData && (obj.userData.isSecretPassage || obj.userData.isStairs)) {
                useSecretPassageOrStairs();
                return;
            }
            if (obj.userData && obj.userData.propId) {
                const prop = state.props.find(pr => pr.id === obj.userData.propId);
                if (prop && !prop.searched && prop.floor === p.floor) {
                    const dist = Math.abs(prop.x - p.x) + Math.abs(prop.y - p.y);
                    if (dist <= p.char.searchRange + 1) {
                        interactWithSpecificProp(prop);
                        return;
                    }
                }
            }
            if (obj.userData && obj.userData.isFloor && obj.userData.floor === p.floor) {
                const gx = obj.userData.gx;
                const gy = obj.userData.gy;
                const dx = gx - p.x;
                const dy = gy - p.y;
                if (Math.abs(dx) + Math.abs(dy) === 1) {
                    movePlayerGrid(dx, dy);
                    return;
                }
            }
            obj = obj.parent;
        }
    }
}

function handleRollDice() {
    if (state.lobbyMode === 'online' && !Net.isHost && state.activePlayerIndex === Net.myPlayerIndex) {
        Net.hostConn.send({ type: 'REMOTE_ACTION', action: 'ROLL' });
        return;
    }
    if (state.turnPhase !== 'ROLL') return;
    SoundFX.dice();

    const p = getActivePlayer();
    const diceEl = document.getElementById('diceVisual');
    document.getElementById('btnRollDice').disabled = true;
    diceEl.classList.add('dice-rolling');

    let ticks = 0;
    const rollAnim = setInterval(() => {
        diceEl.textContent = Math.floor(Math.random() * 6) + 1;
        ticks++;
        if (ticks >= 7) {
            clearInterval(rollAnim);
            diceEl.classList.remove('dice-rolling');

            const rawRoll = Math.max(p.char.minRoll, Math.floor(Math.random() * 6) + 1);
            const totalAP = rawRoll + p.char.diceBonus;
            diceEl.textContent = rawRoll + (p.char.diceBonus ? `+${p.char.diceBonus}` : '');

            state.ap = totalAP;
            state.turnPhase = 'MOVE';
            state.searchedThisTurn = false;

            syncAllUI();
            rebuildStepHighlights3D();
            broadcastOnlineState();
        }
    }, 45);
}

function getInteractableProp() {
    const p = getActivePlayer();
    if (!p) return null;
    let best = null, bestDist = 999;
    for (const pr of state.props) {
        if (pr.searched || pr.floor !== p.floor) continue;
        const dist = Math.abs(pr.x - p.x) + Math.abs(pr.y - p.y);
        const cheb = Math.max(Math.abs(pr.x - p.x), Math.abs(pr.y - p.y));
        if (dist <= p.char.searchRange || cheb <= 1) {
            if (dist < bestDist) {
                bestDist = dist;
                best = pr;
            }
        }
    }
    return best;
}

function interactWithNearbyProp() {
    const prop = getInteractableProp();
    if (prop) interactWithSpecificProp(prop);
}

function interactWithSpecificProp(prop) {
    if (state.lobbyMode === 'online' && !Net.isHost && state.activePlayerIndex === Net.myPlayerIndex) {
        Net.hostConn.send({ type: 'REMOTE_ACTION', action: 'SEARCH' });
        return;
    }
    if (state.turnPhase !== 'MOVE' || state.ap < 1 || prop.searched) return;

    // Light vs. Dark Rule: Cannot search props while the Room Light is ON!
    if (state.roomLights[prop.roomId]) {
        SoundFX.clickSwitch();
        showToast('💡 Room Light is ON! Bright electric glare washes out paranormal energy—flip the Room Switch OFF to search for Clues!', 'light_off');
        return;
    }

    const p = getActivePlayer();
    state.ap--;
    state.searchedThisTurn = true;
    prop.searched = true;
    p.score += 50;

    const pWorld = gridToWorld(prop.x, prop.y, prop.floor);

    if (prop.heirloom) {
        p.heirlooms.push(prop.heirloom);
        p.score += 300;
        SoundFX.victory();
        spawnSoundRipple3D(pWorld.x, pWorld.y, pWorld.z, 0xfbbf24);
        showToast(`👑 BONUS HEIRLOOM FOUND: ${prop.heirloom.name}! (+350 Sleuth Points!)`, 'emoji_events');
    } else if (prop.hasClue) {
        const cats = [
            { key: 'era', label: 'Era' },
            { key: 'curse', label: 'Sign' },
            { key: 'relic', label: 'Relic' }
        ];
        const missing = cats.filter(c => !p.discoveredClues.some(dc => dc.category === c.key));
        const chosenCat = missing.length > 0 ? missing[0] : cats[Math.floor(Math.random() * cats.length)];
        const val = state.trueSuspect.traits[chosenCat.key];

        if (!p.discoveredClues.some(dc => dc.category === chosenCat.key)) {
            p.discoveredClues.push({ category: chosenCat.key, label: chosenCat.label, value: val });
        }
        p.score += 250;
        state.ap += 1;
        addDread(-20);
        SoundFX.clueFound();
        spawnSoundRipple3D(pWorld.x, pWorld.y, pWorld.z, 0x2dd4bf);
        showToast(`🔍 PRIVATE CLUE FOUND: ${chosenCat.label} is "${val}"! (+300 pts & +1 AP)`, 'auto_awesome');
    } else if (prop.blueprintPairId) {
        if (!state.discoveredBlueprints.includes(prop.blueprintPairId)) {
            state.discoveredBlueprints.push(prop.blueprintPairId);
        }
        p.score += 150;
        SoundFX.secretMechanism();
        spawnSoundRipple3D(pWorld.x, pWorld.y, pWorld.z, 0x38bdf8);
        showToast(`📐 Architect Blueprint Found! Secret Passage unlocked (+200 pts)!`, 'architecture');
    } else if (prop.gadgetReward) {
        p.gadget = { ...prop.gadgetReward };
        p.score += 100;
        SoundFX.clueFound();
        showToast(`${prop.gadgetReward.emoji} Found Gadget: ${prop.gadgetReward.name}! (+150 pts)`, 'backpack');
    }

    syncAllUI();
    rebuildStepHighlights3D();
    broadcastOnlineState();
}

function useSecretPassageOrStairs() {
    if (state.lobbyMode === 'online' && !Net.isHost && state.activePlayerIndex === Net.myPlayerIndex) {
        Net.hostConn.send({ type: 'REMOTE_ACTION', action: 'PASSAGE' });
        return;
    }
    if (state.turnPhase !== 'MOVE' || state.ap < 1) {
        showToast('Need 1 AP during your Move phase!', 'warning');
        return;
    }

    const p = getActivePlayer();

    const nearStair = getNearbyStaircase(p);
    if (nearStair) {
        state.ap--;
        p.floor = nearStair.targetFloor;
        p.x = nearStair.targetX;
        p.y = nearStair.targetY;
        SoundFX.secretMechanism();
        updateFloorSwitcherUI();
        syncAllUI();
        rebuildStepHighlights3D();
        showToast(`${p.char.shortName} used ${nearStair.stair.name} -> ${p.floor === 1 ? '2F Upper Floor' : '1F Ground Floor'}!`, 'stairs');
        broadcastOnlineState();
        return;
    }

    const nearSecret = getNearbySecretPassageEndpoint(p);
    if (nearSecret) {
        state.ap--;
        const { pair, ep } = nearSecret;
        if (!state.openedPassages[pair.pairId]) {
            p.score += 150;
        }
        state.openedPassages[pair.pairId] = true;
        if (!state.discoveredBlueprints.includes(pair.pairId)) {
            state.discoveredBlueprints.push(pair.pairId);
        }
        p.floor = ep.targetFloor;
        p.x = ep.targetX;
        p.y = ep.targetY;
        SoundFX.secretMechanism();
        updateFloorSwitcherUI();
        syncAllUI();
        rebuildStepHighlights3D();
        showToast(`Triggered ${ep.triggerName}! Warped to ${ep.targetFloor === 1 ? '2F' : '1F'} (+150 pts)!`, 'door_sliding');
        broadcastOnlineState();
    }
}

function usePocketGadget() {
    const p = getActivePlayer();
    if (!p || !p.gadget) return;
    const g = p.gadget;
    p.gadget = null;
    SoundFX.clueFound();

    if (g.id === 'skates') {
        if (state.turnPhase === 'ROLL') state.turnPhase = 'MOVE';
        state.ap += 4;
        showToast(`🛼 Winged Skates used! +4 Bonus Action Points!`, 'sprint');
    } else if (g.id === 'salt') {
        state.saltWards.push({ floor: p.floor, x: p.x, y: p.y, turnsLeft: 3 });
        showToast(`🧂 Salt Barrier dropped! The Ghost cannot cross this tile for 3 turns!`, 'shield');
    } else if (g.id === 'decoy') {
        state.ghostLuredToVaultTurns = 2;
        showToast(`📻 Ghost Decoy thrown! The Ghost is lured toward the Central Vault!`, 'radio');
    }
    syncAllUI();
    rebuildStepHighlights3D();
}

function shareIntelWithRoommate() {
    const p = getActivePlayer();
    const myRoom = getRoomAt(p.floor, p.x, p.y);
    if (!myRoom) {
        showToast('Stand inside a Room with another player to Share Intel!', 'meeting_room');
        return;
    }
    const roommates = state.players.filter(other =>
        other.index !== p.index &&
        other.floor === p.floor &&
        getRoomAt(other.floor, other.x, other.y)?.id === myRoom.id
    );
    if (roommates.length === 0) {
        showToast('No other player is in this room right now! Meet up to Share Intel (+100 pts)!', 'group');
        return;
    }

    roommates.forEach(rm => {
        p.discoveredClues.forEach(c => {
            if (!rm.discoveredClues.some(rc => rc.category === c.category)) {
                rm.discoveredClues.push({ ...c });
            }
        });
        rm.discoveredClues.forEach(c => {
            if (!p.discoveredClues.some(pc => pc.category === c.category)) {
                p.discoveredClues.push({ ...c });
            }
        });
        rm.score += 100;
    });
    p.score += 100;
    SoundFX.victory();
    showToast(`🤝 High-Five in ${myRoom.name}! Synced Case Files & earned +100 Teamwork Points!`, 'handshake');
    syncAllUI();
    if (!document.getElementById('suspectsModal').classList.contains('hidden')) {
        openSuspectsModal();
    }
}

function toggleFlashlight() {
    const p = getActivePlayer();
    p.flashlightOn = !p.flashlightOn;
    SoundFX.clickSwitch();
    syncAllUI();
}

// Room Light Switch Mechanic (0 AP, Once-Per-Turn Rule per Room!)
function flipCurrentRoomLight() {
    if (state.lobbyMode === 'online' && !Net.isHost && state.activePlayerIndex === Net.myPlayerIndex) {
        Net.hostConn.send({ type: 'REMOTE_ACTION', action: 'FLIP_LIGHT' });
        return;
    }
    if (state.turnPhase !== 'MOVE' && state.turnPhase !== 'ROLL') return;

    const p = getActivePlayer();
    const currentRoom = getRoomAt(p.floor, p.x, p.y);
    if (!currentRoom || currentRoom.isLockedVault) {
        showToast('Step inside a Room first to flip its Chandelier Light Switch!', 'lightbulb');
        return;
    }

    if (state.lightFlippedThisTurn[currentRoom.id]) {
        SoundFX.playTone(150, 'sawtooth', 0.12, 0.09);
        showToast(`⚠️ One-Flip-Per-Turn Rule! You already flipped ${currentRoom.name}'s light switch this turn—you must commit until your next turn!`, 'lock_clock');
        return;
    }

    const newState = !state.roomLights[currentRoom.id];
    state.roomLights[currentRoom.id] = newState;
    state.lightFlippedThisTurn[currentRoom.id] = true;
    SoundFX.roomLightSwitch(newState);

    const pWorld = gridToWorld(p.x, p.y, p.floor);
    spawnSoundRipple3D(pWorld.x, pWorld.y, pWorld.z, newState ? 0xfbbf24 : 0x2dd4bf);

    if (newState) {
        const ghostRoom = getRoomAt(state.ghost.floor, state.ghost.x, state.ghost.y);
        if (ghostRoom && ghostRoom.id === currentRoom.id) {
            const banishSpot = pickRandomGhostSpawnFarFromPlayers(8);
            state.ghost.floor = banishSpot.floor;
            state.ghost.x = banishSpot.x;
            state.ghost.y = banishSpot.y;
            showToast(`💡 ${currentRoom.name} Lights ON! Blinding chandelier glare banished the Ghost to ${banishSpot.roomName}!`, 'wb_incandescent');
        } else {
            showToast(`💡 ${currentRoom.name} Lights ON (Safe Zone)! The Ghost cannot enter, but bright glare hides Clues until flipped OFF!`, 'lightbulb');
        }
    } else {
        showToast(`🌑 ${currentRoom.name} Lights OFF! Paranormal furniture tells & Clues are visible again—watch out for the Ghost!`, 'flashlight_on');
    }

    syncAllUI();
    rebuildStepHighlights3D();
    broadcastOnlineState();
}

// v4.2 Wall-Mounted Master Circuit Breaker (Bolted Flush on Central Ritual Vault Exterior Wall at (7,7))
function pullMasterCircuitBreaker() {
    if (state.lobbyMode === 'online' && !Net.isHost && state.activePlayerIndex === Net.myPlayerIndex) {
        Net.hostConn.send({ type: 'REMOTE_ACTION', action: 'MASTER_BREAKER' });
        return;
    }
    const p = getActivePlayer();
    if (!isNearMasterBreaker(p)) {
        showToast('Walk to the ⚡ Vault Wall Circuit Breaker (outside the Central Ritual Vault West Wall at 7,7) to pull it!', 'bolt');
        return;
    }
    if (state.turnPhase !== 'MOVE' || state.ap < 1) {
        showToast('Need 1 AP during your Move phase to pull the Master Circuit Breaker!', 'warning');
        return;
    }
    if (state.masterBreakerRoundsLeft > 0) {
        showToast(`Master Circuit Breaker is already active (${state.masterBreakerRoundsLeft} rounds left)!`, 'bolt');
        return;
    }

    state.ap--;
    p.score += 100;
    state.masterBreakerRoundsLeft = 2;

    getCurrentMap().rooms.forEach(r => {
        if (!r.isLockedVault) {
            state.roomLights[r.id] = true;
            state.lightFlippedThisTurn[r.id] = true;
        }
    });

    // Banish Ghost to a randomized far-away spot (>= 8 tiles from players)
    const banishSpot = pickRandomGhostSpawnFarFromPlayers(8);
    state.ghost.floor = banishSpot.floor;
    state.ghost.x = banishSpot.x;
    state.ghost.y = banishSpot.y;

    // Trigger dramatic lightning + electrical flash
    state.lightningFlashIntensity = 1.6;
    SoundFX.masterBreaker();
    const mbWorld = gridToWorld(state.masterBreakerPos.x, state.masterBreakerPos.y, state.masterBreakerPos.floor);
    spawnSoundRipple3D(mbWorld.x, mbWorld.y, mbWorld.z, 0xfbbf24);

    showToast('⚡ MASTER BREAKER PULLED (+100 pts)! All mansion rooms flooded with Ghost-proof light for 2 rounds & Ghost banished far away!', 'bolt');
    syncAllUI();
    rebuildStepHighlights3D();
    broadcastOnlineState();
}

function triggerFamilyDistraction() {
    if (!state.familyDistractAvailable) return;
    state.familyDistractAvailable = false;
    state.ghostLuredToVaultTurns = 2;
    getActivePlayer().score += 75;
    SoundFX.pipeBang();
    showToast('CLANG! Trapped family banged the Vault pipes—Ghost lured for 2 turns (+75 pts)!', 'notifications_active');
    syncAllUI();
}

function useSpecialAbility() {
    const p = getActivePlayer();
    if (p.skillCooldown > 0) {
        showToast(`Skill on cooldown (${p.skillCooldown} turns left)!`, 'timer');
        return;
    }
    p.skillCooldown = 3;
    p.score += 50;
    SoundFX.clueFound();

    if (p.char.id === 'sleuth') {
        const target = state.props.find(pr => !pr.searched && pr.hasClue);
        if (target) {
            target.revealedBySleuth = true;
            showToast(`Eagle Eye highlighted ${target.name} (${target.floor === 1 ? '2F' : '1F'}) in gold!`, 'visibility');
        }
    } else if (p.char.id === 'sprinter') {
        if (state.turnPhase === 'ROLL') state.turnPhase = 'MOVE';
        state.ap += 3;
        showToast(`Turbo Dash! +3 Bonus AP!`, 'sprint');
    } else if (p.char.id === 'medium') {
        addDread(-30);
        const banishSpot = pickRandomGhostSpawnFarFromPlayers(8);
        state.ghost.floor = banishSpot.floor;
        state.ghost.x = banishSpot.x;
        state.ghost.y = banishSpot.y;
        showToast(`Ecto Ward banished the Ghost far away to ${banishSpot.roomName} & lowered Dread -30%!`, 'shield_moon');
    } else if (p.char.id === 'inventor') {
        p.gadget = { ...POCKET_GADGETS[Math.floor(Math.random() * POCKET_GADGETS.length)] };
        showToast(`Theo crafted ${p.gadget.emoji} ${p.gadget.name}!`, 'precision_manufacturing');
    }
    syncAllUI();
    rebuildStepHighlights3D();
}

/* ============================================================================
 * 9. TURN ROTATION, SMARTER PATROL/HUNT GHOST AI & FULL-SCREEN JUMP SCARE
 * ============================================================================ */
function addDread(amount) {
    state.dread = Math.max(0, Math.min(100, state.dread + amount));
    document.getElementById('dreadPercentText').textContent = `${Math.round(state.dread)}%`;
    document.getElementById('dreadBar').style.width = `${state.dread}%`;
}

function endPlayerTurn() {
    if (state.lobbyMode === 'online' && !Net.isHost && state.activePlayerIndex === Net.myPlayerIndex) {
        Net.hostConn.send({ type: 'REMOTE_ACTION', action: 'END_TURN' });
        return;
    }
    if (state.turnPhase !== 'MOVE') return;

    const p = getActivePlayer();
    if (p.skillCooldown > 0) p.skillCooldown--;
    state.ap = 0;
    state.lightFlippedThisTurn = {};
    rebuildStepHighlights3D();

    if (state.activePlayerIndex < state.players.length - 1) {
        state.activePlayerIndex++;
        if (state.lobbyMode === 'pass') {
            showPassAndPlayHandoffModal();
        } else {
            state.turnPhase = 'ROLL';
            syncAllUI();
            broadcastOnlineState();
        }
    } else {
        state.turnPhase = 'GHOST';
        syncAllUI();
        runGhostTurn();
    }
}

function showPassAndPlayHandoffModal() {
    state.turnPhase = 'HANDOFF';
    const nextP = getActivePlayer();
    document.getElementById('handoffAvatar').textContent = nextP.char.emoji;
    document.getElementById('handoffTitle').textContent = `${nextP.name}'s Turn: ${nextP.char.name}`;
    document.getElementById('handoffNameStrong').textContent = `${nextP.name} (${nextP.char.shortName})`;
    document.getElementById('turnHandoffModal').classList.remove('hidden');
    document.getElementById('turnHandoffModal').classList.add('flex');
}

function confirmTurnHandoff() {
    SoundFX.clickSwitch();
    document.getElementById('turnHandoffModal').classList.add('hidden');
    document.getElementById('turnHandoffModal').classList.remove('flex');
    state.turnPhase = 'ROLL';
    updateFloorSwitcherUI();
    syncAllUI();
}

function runGhostTurn() {
    let steps = state.vaultUnlocked ? 2 : (3 + (state.dread >= 60 ? 1 : 0));
    let taken = 0;

    const gTimer = setInterval(() => {
        if (state.turnPhase !== 'GHOST') {
            clearInterval(gTimer);
            return;
        }
        stepGhostMultiplayerAI();
        taken++;

        const caughtPlayer = state.players.find(pl => {
            if (pl.escaped || pl.floor !== state.ghost.floor || pl.x !== state.ghost.x || pl.y !== state.ghost.y) return false;
            const pr = getRoomAt(pl.floor, pl.x, pl.y);
            if (pr && state.roomLights[pr.id]) return false;
            return true;
        });
        if (caughtPlayer) {
            clearInterval(gTimer);
            triggerGhostCatch(caughtPlayer);
            return;
        }

        if (taken >= steps) {
            clearInterval(gTimer);
            state.turnNumber++;
            state.activePlayerIndex = 0;
            state.lightFlippedThisTurn = {};

            if (state.masterBreakerRoundsLeft > 0) {
                state.masterBreakerRoundsLeft--;
                if (state.masterBreakerRoundsLeft === 0) {
                    getCurrentMap().rooms.forEach(r => {
                        if (!r.isLockedVault) state.roomLights[r.id] = false;
                    });
                    SoundFX.roomLightSwitch(false);
                    showToast('⚡ Master Breaker 2-round overload ended—mansion lights tripped back OFF!', 'light_off');
                }
            }

            if (state.lobbyMode === 'pass' && state.players.length > 1) {
                showPassAndPlayHandoffModal();
            } else {
                state.turnPhase = 'ROLL';
                syncAllUI();
                broadcastOnlineState();
            }
        }
    }, 240);
}

// v4.2 Smarter Co-op Ghost AI:
// 1. Hunts players whose Flashlight Beam is ON (not inside a Lit Safe Room).
// 2. When Flashlights are OFF (Stealth), intelligently patrols between unsearched True Clue rooms!
// 3. Leaves glowing 3D Ectoplasm Footprints & rattles room props as it passes through unlit rooms!
function stepGhostMultiplayerAI() {
    const prevFloor = state.ghost.floor;
    const prevX = state.ghost.x;
    const prevY = state.ghost.y;

    const isPlayerInLitSafeRoom = pl => {
        const r = getRoomAt(pl.floor, pl.x, pl.y);
        return !!(r && state.roomLights[r.id]);
    };

    // Players whose Flashlight is ON and who are NOT inside a Lit Safe-Zone Room attract the Ghost!
    const beamPlayers = state.players.filter(pl => !pl.escaped && pl.flashlightOn && !isPlayerInLitSafeRoom(pl));

    let targetFloor = state.ghost.floor;
    let targetX = 6, targetY = 7;

    if (state.ghostLuredToVaultTurns > 0) {
        state.ghostLuredToVaultTurns--;
        state.ghost.mode = 'LURED TO VAULT';
        targetFloor = 0;
        targetX = 9;
        targetY = 6;
    } else if (beamPlayers.length > 0) {
        state.ghost.mode = 'HUNTING BEAM';
        // Prefer beam players on the same floor; otherwise warp floor toward them
        let sameFloorBeam = beamPlayers.filter(pl => pl.floor === state.ghost.floor);
        if (sameFloorBeam.length === 0) {
            state.ghost.floor = beamPlayers[0].floor;
            sameFloorBeam = beamPlayers.filter(pl => pl.floor === state.ghost.floor);
        }
        sameFloorBeam.sort((a, b) =>
            (Math.abs(a.x - state.ghost.x) + Math.abs(a.y - state.ghost.y)) -
            (Math.abs(b.x - state.ghost.x) + Math.abs(b.y - state.ghost.y))
        );
        targetFloor = sameFloorBeam[0].floor;
        targetX = sameFloorBeam[0].x;
        targetY = sameFloorBeam[0].y;
    } else {
        // Stealth Mode (All Flashlights OFF) OR all players in Lit Safe Rooms:
        // Actively patrol between unsearched True Clue props in unlit rooms!
        state.ghost.mode = 'PATROLLING CLUES';
        const unsearchedClueProps = state.props.filter(pr => !pr.searched && pr.hasClue && !state.roomLights[pr.roomId]);

        if (unsearchedClueProps.length > 0) {
            let targetProp = unsearchedClueProps.find(pr => pr.roomId === state.ghost.targetRoomId);
            if (!targetProp || (state.ghost.floor === targetProp.floor && Math.abs(state.ghost.x - targetProp.x) + Math.abs(state.ghost.y - targetProp.y) <= 1)) {
                targetProp = unsearchedClueProps[Math.floor(Math.random() * unsearchedClueProps.length)];
                state.ghost.targetRoomId = targetProp.roomId;
            }
            if (targetProp.floor !== state.ghost.floor && Math.random() < 0.35) {
                state.ghost.floor = targetProp.floor;
            }
            targetFloor = targetProp.floor;
            targetX = targetProp.x;
            targetY = targetProp.y;
        } else {
            const patrolWaypoints = [{ x: 6, y: 4 }, { x: 12, y: 4 }, { x: 12, y: 10 }, { x: 6, y: 10 }];
            const wp = patrolWaypoints[state.turnNumber % patrolWaypoints.length];
            targetX = wp.x;
            targetY = wp.y;
        }
    }

    const dx = Math.sign(targetX - state.ghost.x);
    const dy = Math.sign(targetY - state.ghost.y);

    const candidates = [];
    if (Math.abs(targetX - state.ghost.x) >= Math.abs(targetY - state.ghost.y)) {
        if (dx !== 0) candidates.push({ x: state.ghost.x + dx, y: state.ghost.y });
        if (dy !== 0) candidates.push({ x: state.ghost.x, y: state.ghost.y + dy });
    } else {
        if (dy !== 0) candidates.push({ x: state.ghost.x, y: state.ghost.y + dy });
        if (dx !== 0) candidates.push({ x: state.ghost.x + dx, y: state.ghost.y });
    }
    candidates.push(
        { x: state.ghost.x + 1, y: state.ghost.y },
        { x: state.ghost.x - 1, y: state.ghost.y },
        { x: state.ghost.x, y: state.ghost.y + 1 },
        { x: state.ghost.x, y: state.ghost.y - 1 }
    );

    for (const cand of candidates) {
        const nx = Math.max(1, Math.min(GRID_COLS - 2, cand.x));
        const ny = Math.max(1, Math.min(GRID_ROWS - 2, cand.y));
        if (nx === state.ghost.x && ny === state.ghost.y) continue;

        if (state.saltWards.some(sw => sw.floor === state.ghost.floor && sw.x === nx && sw.y === ny)) continue;

        const r = getRoomAt(state.ghost.floor, nx, ny);
        if (r && r.isLockedVault) continue;
        // SOLID BARRIER: Ghost cannot enter any room with its Room Light ON!
        if (r && state.roomLights[r.id]) continue;

        state.ghost.rotY = Math.atan2(nx - state.ghost.x, ny - state.ghost.y);
        state.ghost.x = nx;
        state.ghost.y = ny;

        // Leave a glowing 3D Ectoplasm Footprint on the previous tile
        spawnGhostFootprint3D(prevFloor, prevX, prevY, state.ghost.rotY);

        // Poltergeist Haunting Tell: If the Ghost passes near an unsearched prop in an unlit room, rattle it!
        const nearbyProp = state.props.find(pr =>
            !pr.searched &&
            pr.floor === state.ghost.floor &&
            !state.roomLights[pr.roomId] &&
            Math.abs(pr.x - nx) + Math.abs(pr.y - ny) <= 2
        );
        if (nearbyProp && propMeshes[nearbyProp.id]) {
            propMeshes[nearbyProp.id].userData.rattleUntil = performance.now() + 1400;
            const pWorld = gridToWorld(nearbyProp.x, nearbyProp.y, nearbyProp.floor);
            spawnSoundRipple3D(pWorld.x, pWorld.y, pWorld.z, 0x2dd4bf);
            SoundFX.poltergeistRattle();
        }
        break;
    }
}

function triggerGhostCatch(victimPlayer) {
    SoundFX.jumpScareShriek(state.scareMode);
    victimPlayer.hearts = Math.max(1, victimPlayer.hearts - 1);
    victimPlayer.score = Math.max(0, victimPlayer.score - 100);

    // Knock player back to 1F Grand Foyer
    victimPlayer.floor = 0;
    victimPlayer.x = 9;
    victimPlayer.y = 12;

    // Teleport ghost to a randomized far-away room (>= 8 tiles from players)
    const respawnSpot = pickRandomGhostSpawnFarFromPlayers(8);
    state.ghost.floor = respawnSpot.floor;
    state.ghost.x = respawnSpot.x;
    state.ghost.y = respawnSpot.y;

    const workspace = document.getElementById('gameWorkspace');
    workspace.classList.remove('screen-shake');
    void workspace.offsetWidth;
    workspace.classList.add('screen-shake');

    drawJumpScareCanvas(state.scareMode);
    document.getElementById('scareTitle').textContent = state.scareMode === 'full'
        ? `💀 SHRIEK! ${victimPlayer.char.shortName.toUpperCase()} WAS AMBUSHED!`
        : `👻 BOO! ${victimPlayer.char.shortName.toUpperCase()} GOT SPOOKED!`;
    document.getElementById('scareDesc').textContent =
        `The Phantom lunged out of the dark at ${victimPlayer.name} (${victimPlayer.char.name})! Lost 1 Chance (-100 Sleuth Points) and knocked back to the 1F Grand Foyer!`;

    document.getElementById('scareOverlay').classList.remove('hidden');
    document.getElementById('scareOverlay').classList.add('flex');

    state.turnPhase = 'ROLL';
    syncAllUI();
    broadcastOnlineState();
}

function closeScareOverlay() {
    document.getElementById('scareOverlay').classList.add('hidden');
    document.getElementById('scareOverlay').classList.remove('flex');
}

/* ============================================================================
 * 10. 8-SUSPECT OVERLAPPING MATRIX ACCUSATION & FINAL ESCAPE SPRINT
 * ============================================================================ */
function inspectCurrentRoomPortrait() {
    openSuspectsModal();
}

function toggleCrossOffSuspect(suspectId) {
    const p = getActivePlayer();
    const idx = p.crossedOffSuspectIds.indexOf(suspectId);
    if (idx >= 0) p.crossedOffSuspectIds.splice(idx, 1);
    else p.crossedOffSuspectIds.push(suspectId);
    SoundFX.clickSwitch();
    openSuspectsModal();
    syncAllUI();
}

function accuseSuspectPortrait(suspectId) {
    const suspect = SUSPECTS.find(s => s.id === suspectId);
    const p = getActivePlayer();
    if (!suspect || !p) return;

    const targetRoomId = suspectRoomIdForCurrentMap(suspect);
    const currentRoom = getRoomAt(p.floor, p.x, p.y);
    if (!currentRoom || currentRoom.id !== targetRoomId) {
        const rObj = getCurrentMap().rooms.find(r => r.id === targetRoomId);
        showToast(`Walk inside ${rObj ? rObj.name : suspect.roomId} to accuse ${suspect.name}'s Portrait!`, 'directions_walk');
        closeSuspectsModal();
        return;
    }

    closeSuspectsModal();

    if (suspect.id === state.trueSuspect.id) {
        p.score += 500;
        state.vaultUnlocked = true;
        vaultChainMeshes.forEach(c => { c.visible = false; });
        SoundFX.victory();

        const sprintBanner = document.getElementById('escapeSprintBanner');
        if (sprintBanner) {
            sprintBanner.classList.remove('hidden');
            sprintBanner.classList.add('flex');
        }

        if (state.ap < 3) state.ap = 4;
        state.turnPhase = 'MOVE';
        showToast(`🏆 ${p.char.shortName} BROKE THE CURSE (+500 pts)! Central Vault Unsealed! Sprint to the 1F Foyer Front Door (+300 pts) or tap Finish Match!`, 'celebration');
        syncAllUI();
        rebuildStepHighlights3D();
        broadcastOnlineState();
    } else {
        p.score = Math.max(0, p.score - 200);
        triggerGhostCatch(p);
    }
}

function claimEscapeVictory() {
    const p = getActivePlayer();
    finishMatchWithLeaderboard(true, `${p.name} (${p.char.name}) broke the curse, unsealed the Central Ritual Vault, and escaped Blackwood Manor!`);
}

function finishMatchWithLeaderboard(isWin, summaryText) {
    state.turnPhase = 'GAMEOVER';
    document.getElementById('endGameIcon').textContent = isWin ? '🏆' : '💀';
    document.getElementById('endGameTitle').textContent = isWin ? 'Vault Unsealed & Family Saved!' : 'The Haunt Prevails!';
    document.getElementById('endGameSummary').textContent = summaryText;

    const ranked = [...state.players].sort((a, b) => b.score - a.score);
    const medals = ['🥇 1st', '🥈 2nd', '🥉 3rd', '🏅 4th'];
    document.getElementById('endGameLeaderboardList').innerHTML = ranked.map((pl, idx) => `
        <div class="p-2.5 rounded-xl bg-md-surface1 border ${idx === 0 ? 'border-amber-400' : 'border-purple-800/40'} flex items-center justify-between">
            <div class="flex items-center gap-2">
                <span class="font-cartoon font-bold text-xs text-amber-300 w-12">${medals[idx]}</span>
                <span class="text-lg">${pl.char.emoji}</span>
                <div>
                    <div class="font-cartoon font-bold text-xs text-white">${pl.name}: ${pl.char.name}</div>
                    <div class="text-[10px] text-purple-300">Clues: ${pl.discoveredClues.length}/3 • Heirlooms: 👑 ${pl.heirlooms.length}</div>
                </div>
            </div>
            <span class="font-mono font-bold text-sm text-teal-300">${pl.score} pts</span>
        </div>
    `).join('');

    const s = state.trueSuspect;
    const portraitUrl = paintSuspectPortraitCanvas(s).toDataURL();
    document.getElementById('endGameGhostReveal').innerHTML = `
        <img src="${portraitUrl}" alt="${s.name}" class="w-14 h-14 rounded-2xl border-2 shrink-0 object-cover" style="border-color:${s.portraitColor}" />
        <div>
            <div class="text-[10px] uppercase tracking-wider text-amber-300 font-bold">The True Culprit Spirit</div>
            <div class="font-cartoon text-base font-bold text-white">${s.name} — ${s.title}</div>
            <div class="flex flex-wrap gap-1 mt-1">
                <span class="px-2 py-0.5 rounded bg-md-surface3 text-[10px] text-teal-300">${s.traits.era}</span>
                <span class="px-2 py-0.5 rounded bg-md-surface3 text-[10px] text-amber-300">${s.traits.curse}</span>
                <span class="px-2 py-0.5 rounded bg-md-surface3 text-[10px] text-purple-300">${s.traits.relic}</span>
            </div>
        </div>
    `;

    document.getElementById('endGameModal').classList.remove('hidden');
    document.getElementById('endGameModal').classList.add('flex');
}
