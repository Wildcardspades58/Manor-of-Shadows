/* ============================================================================
 * 11. COMPREHENSIVE UI, LIGHTNING STORM, AUTO-FADE LABELS & 60FPS 3D LOOP
 * ============================================================================ */
function lerpAngleRadians(current, target, factor) {
    let diff = ((target - current + Math.PI) % (Math.PI * 2)) - Math.PI;
    if (diff < -Math.PI) diff += Math.PI * 2;
    return current + diff * factor;
}

function handleTurnPillClick() {
    if (state.turnPhase === 'ROLL') {
        handleRollDice();
    } else if (state.turnPhase === 'MOVE' && state.ap === 0) {
        endPlayerTurn();
    }
}

function cycleCameraPreset() {
    const presets = ['iso', 'top', 'follow'];
    const curIdx = presets.indexOf(state.cameraPreset);
    const nextPreset = presets[(curIdx + 1) % presets.length];
    setCameraPreset(nextPreset);
    const names = { iso: '45°', top: 'Top', follow: 'Follow' };
    const labelEl = document.getElementById('quickCameraLabel');
    if (labelEl) labelEl.textContent = names[nextPreset] || nextPreset;
    showToast(`Camera: ${nextPreset === 'iso' ? '45° Dollhouse' : nextPreset === 'top' ? 'Top-Down 3D' : 'Follow Player'}`, 'videocam');
}

function toggleRoomLabels() {
    state.showRoomLabels = !state.showRoomLabels;
    SoundFX.clickSwitch();
    const btn = document.getElementById('btnToggleLabels');
    if (btn) {
        btn.className = state.showRoomLabels
            ? 'md-btn px-2 py-1 rounded-xl bg-amber-500/25 border border-amber-400/50 text-amber-200 text-[11px] font-semibold flex items-center gap-1'
            : 'md-btn px-2 py-1 rounded-xl bg-md-surface2 text-purple-300 text-[11px] font-semibold flex items-center gap-1';
    }
    showToast(
        state.showRoomLabels
            ? '🏷️ North-Wall Room Headers ON (Auto-fades to 25% when inside room)'
            : '🏷️ Room Headers Hidden',
        'label'
    );
}

function syncAllUI() {
    const p = getActivePlayer();
    if (!p) return;

    document.getElementById('activePlayerBannerTop').textContent = `${p.name}: ${p.char.shortName}'s Turn (${p.floor === 1 ? '2F' : '1F'})`;
    document.getElementById('topScoreText').textContent = `${p.score} pts`;
    document.getElementById('turnPlayerAvatar').textContent = p.char.emoji;
    document.getElementById('charAvatarBox').textContent = p.char.emoji;
    document.getElementById('charNameDisplay').textContent = `${p.name}: ${p.char.name}`;
    document.getElementById('charTraitPill').textContent = p.char.badge;
    document.getElementById('specialSkillIcon').textContent = p.char.skillIcon;
    document.getElementById('specialSkillLabel').textContent = p.skillCooldown > 0 ? `Wait ${p.skillCooldown}T` : p.char.skillName;

    const currentRoom = getRoomAt(p.floor, p.x, p.y);
    document.getElementById('currentRoomText').textContent = currentRoom ? currentRoom.name : `${p.floor === 1 ? '2F' : '1F'} Corridor`;

    let heartsHtml = '';
    for (let i = 0; i < p.maxHearts; i++) {
        heartsHtml += `<span class="material-symbols-rounded text-base ${i < p.hearts ? 'text-rose-500' : 'text-purple-950'}">favorite</span>`;
    }
    document.getElementById('heartsContainer').innerHTML = heartsHtml;

    document.getElementById('flashlightText').textContent = p.flashlightOn ? 'Beam ON' : 'Stealth';
    const btnRoomSwitch = document.getElementById('btnRoomLightSwitch');
    const roomSwitchTxt = document.getElementById('roomSwitchText');
    if (currentRoom && !currentRoom.isLockedVault) {
        const isLit = !!state.roomLights[currentRoom.id];
        const alreadyFlipped = !!state.lightFlippedThisTurn[currentRoom.id];
        btnRoomSwitch.disabled = alreadyFlipped;
        roomSwitchTxt.textContent = alreadyFlipped ? 'Locked 1T' : (isLit ? '💡 Lit (Safe)' : '🌑 Room OFF');
        btnRoomSwitch.className = isLit
            ? 'md-btn py-1.5 px-1.5 rounded-xl bg-amber-400 text-slate-950 disabled:opacity-50 text-[10px] font-bold flex items-center justify-center gap-1 shadow'
            : 'md-btn py-1.5 px-1.5 rounded-xl bg-amber-500/20 border border-amber-400/60 disabled:opacity-40 text-amber-200 text-[10px] font-bold flex items-center justify-center gap-1';
    } else {
        btnRoomSwitch.disabled = true;
        roomSwitchTxt.textContent = 'In Hallway';
    }

    const breakerBanner = document.getElementById('masterBreakerBanner');
    if (state.masterBreakerRoundsLeft > 0) {
        breakerBanner.classList.remove('hidden');
        breakerBanner.classList.add('flex');
        document.getElementById('breakerRoundsText').textContent = state.masterBreakerRoundsLeft;
    } else {
        breakerBanner.classList.add('hidden');
        breakerBanner.classList.remove('flex');
    }

    const btnGadget = document.getElementById('btnUseGadget');
    const gadgetTxt = document.getElementById('gadgetBtnText');
    if (p.gadget) {
        btnGadget.disabled = false;
        gadgetTxt.textContent = `${p.gadget.emoji} ${p.gadget.name}`;
    } else {
        btnGadget.disabled = true;
        gadgetTxt.textContent = 'No Gadget';
    }

    document.getElementById('apCounter').textContent = state.ap;
    document.getElementById('compactApText').textContent = state.ap;
    const phaseTitle = document.getElementById('turnPhaseTitle');
    const compactBtn = document.getElementById('compactRollOrEndBtn');
    const compactTxt = document.getElementById('compactPrimaryText');
    const compactIcon = document.getElementById('compactPrimaryIcon');

    if (state.turnPhase === 'ROLL') {
        phaseTitle.textContent = `${p.name.toUpperCase()} (${p.char.shortName}): TAP TO ROLL 🎲`;
        document.getElementById('btnRollDice').disabled = false;
        document.getElementById('btnEndTurn').disabled = true;
        compactBtn.disabled = false;
        compactIcon.textContent = 'casino';
        compactTxt.textContent = '🎲 Roll Dice';
        compactBtn.className = 'md-btn px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-teal-300 to-emerald-400 text-slate-950 font-cartoon font-bold text-xs flex items-center gap-1 shadow-lg amber-glow animate-pulse';
    } else if (state.turnPhase === 'MOVE') {
        phaseTitle.textContent = `${p.char.shortName.toUpperCase()}: MOVE (${state.ap} AP LEFT)`;
        document.getElementById('btnRollDice').disabled = true;
        document.getElementById('btnEndTurn').disabled = false;
        compactBtn.disabled = false;
        compactIcon.textContent = 'skip_next';
        compactTxt.textContent = state.ap === 0 ? '⏭️ End Turn' : 'End Turn';
        compactBtn.className = state.ap === 0
            ? 'md-btn px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-cartoon font-bold text-xs flex items-center gap-1 shadow amber-glow'
            : 'md-btn px-3 py-1.5 rounded-xl bg-md-surface3 hover:bg-purple-700 text-purple-100 font-cartoon font-bold text-xs flex items-center gap-1 border border-purple-500/40';
    } else {
        phaseTitle.textContent = `GHOST IS ${state.ghost.mode || 'HUNTING'}...`;
        document.getElementById('btnRollDice').disabled = true;
        document.getElementById('btnEndTurn').disabled = true;
        compactBtn.disabled = true;
        compactIcon.textContent = 'hourglass_top';
        compactTxt.textContent = '👻 Ghost Turn';
    }

    const nearProp = getInteractableProp();
    const nearStair = getNearbyStaircase(p);
    const nearSecret = getNearbySecretPassageEndpoint(p);
    const nearBreaker = isNearMasterBreaker(p);
    const btnSearch = document.getElementById('btnSearchProp');
    const btnSecret = document.getElementById('btnSecretPassage');

    let floatingPillsHtml = '';

    // 0. Primary Roll Dice Floating Pill (Prominent on Mobile / Tablet!)
    if (state.turnPhase === 'ROLL') {
        const bonusStr = p.char.diceMod !== 0 ? ` (D6 ${p.char.diceMod > 0 ? '+' : ''}${p.char.diceMod} Bonus)` : ' (D6)';
        floatingPillsHtml += `
            <button onclick="handleRollDice()" class="pointer-events-auto md-btn px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-teal-300 to-emerald-400 text-slate-950 font-cartoon font-bold text-xs sm:text-sm flex items-center gap-2 shadow-2xl amber-glow active:scale-95 transition-transform animate-pulse border-2 border-white/60">
                <span class="material-symbols-rounded text-base sm:text-lg">casino</span>
                <span>🎲 TAP TO ROLL DICE${bonusStr}</span>
            </button>
        `;
    }

    // 1. Room Light Switch Floating Pill
    if (currentRoom && !currentRoom.isLockedVault && (state.turnPhase === 'MOVE' || state.turnPhase === 'ROLL')) {
        const isLit = !!state.roomLights[currentRoom.id];
        const alreadyFlipped = !!state.lightFlippedThisTurn[currentRoom.id];
        if (!alreadyFlipped) {
            floatingPillsHtml += `
                <button onclick="flipCurrentRoomLight()" class="pointer-events-auto md-btn px-3 py-2 rounded-2xl ${
                    isLit ? 'bg-slate-900/95 text-amber-300 border-2 border-amber-400' : 'bg-amber-300 text-slate-950 border-2 border-white'
                } font-cartoon font-bold text-xs flex items-center gap-1.5 shadow-xl">
                    <span>${isLit ? '🌑 Flip Room Light OFF (See Clues)' : '💡 Flip Room Switch ON (Safe Zone)'}</span>
                </button>
            `;
        } else {
            floatingPillsHtml += `
                <div class="pointer-events-none px-2.5 py-1.5 rounded-2xl bg-md-surface1/90 border border-purple-500/40 text-[10px] font-semibold text-purple-300 flex items-center gap-1">
                    <span>🔒 Switch Flipped This Turn (${isLit ? 'Safe Zone ON' : 'Lights OFF'})</span>
                </div>
            `;
        }
    }

    // 2. Wall-Mounted Master Circuit Breaker Floating Pill (when near Vault West Wall at 7,7 on 1F)
    if (nearBreaker && state.turnPhase === 'MOVE' && state.ap >= 1 && state.masterBreakerRoundsLeft === 0) {
        floatingPillsHtml += `
            <button onclick="pullMasterCircuitBreaker()" class="pointer-events-auto md-btn px-3.5 py-2 rounded-2xl bg-gradient-to-r from-rose-500 via-amber-400 to-yellow-300 text-slate-950 font-cartoon font-bold text-xs flex items-center gap-1.5 shadow-xl amber-glow">
                <span>⚡ Pull Vault Wall Breaker (1 AP • All Lights ON & Banish Ghost!)</span>
            </button>
        `;
    }

    // 3. Search Prop Pill
    if (nearProp && state.turnPhase === 'MOVE' && state.ap >= 1) {
        const propRoomLit = !!state.roomLights[nearProp.roomId];
        if (propRoomLit) {
            btnSearch.disabled = true;
            document.getElementById('searchBtnText').textContent = '💡 Flip Light OFF to Search';
            floatingPillsHtml += `
                <button onclick="interactWithNearbyProp()" class="pointer-events-auto md-btn px-3 py-2 rounded-2xl bg-amber-950/95 text-amber-200 border border-amber-400/60 font-cartoon font-bold text-xs flex items-center gap-1 shadow-xl">
                    <span>💡 Glare Blocks ${nearProp.emoji} — Flip Switch OFF!</span>
                </button>
            `;
        } else {
            btnSearch.disabled = false;
            document.getElementById('searchBtnText').textContent = `Search ${nearProp.emoji} (F)`;
            floatingPillsHtml += `
                <button onclick="interactWithNearbyProp()" class="pointer-events-auto md-btn px-3.5 py-2 rounded-2xl bg-amber-400 text-slate-950 font-cartoon font-bold text-xs flex items-center gap-1.5 shadow-xl amber-glow">
                    <span>🔍 Search ${nearProp.name} (1 AP)</span>
                </button>
            `;
        }
    } else {
        btnSearch.disabled = true;
        document.getElementById('searchBtnText').textContent = 'Stand Near Prop (F)';
    }

    // 4. Stairs or Vertical Secret Passage Pill
    if ((nearStair || nearSecret) && state.turnPhase === 'MOVE' && state.ap >= 1) {
        btnSecret.disabled = false;
        const label = nearStair ? nearStair.dirLabel : nearSecret.ep.triggerName;
        document.getElementById('secretPassageText').textContent = `${label} (E)`;
        floatingPillsHtml += `
            <button onclick="useSecretPassageOrStairs()" class="pointer-events-auto md-btn px-3.5 py-2 rounded-2xl bg-teal-400 text-slate-950 font-cartoon font-bold text-xs flex items-center gap-1.5 shadow-xl ecto-glow">
                <span>🪜 ${label} (1 AP)</span>
            </button>
        `;
    } else {
        btnSecret.disabled = true;
        document.getElementById('secretPassageText').textContent = 'Stairs / Lever (E)';
    }

    // 5. Suspect Room Portrait Pill
    if (currentRoom) {
        const roomSuspect = SUSPECTS.find(s => suspectRoomIdForCurrentMap(s) === currentRoom.id);
        if (roomSuspect) {
            floatingPillsHtml += `
                <button onclick="openSuspectsModal()" class="pointer-events-auto md-btn px-3 py-2 rounded-2xl bg-rose-500 text-white font-cartoon font-bold text-xs flex items-center gap-1 shadow-xl">
                    <span>🖼️ Inspect ${roomSuspect.name} (R)</span>
                </button>
            `;
        }
    }

    document.getElementById('floatingContextBar').innerHTML = floatingPillsHtml;

    // Private Case File Clues & Bonus Heirlooms
    document.getElementById('caseFileOwnerTitle').textContent = `${p.name.toUpperCase()} (${p.char.shortName}) CASE FILE`;
    document.getElementById('cluesCountBadge').textContent = `🔍 ${p.discoveredClues.length}/3 CLUES`;
    document.getElementById('mobileClueBadge').textContent = `${p.discoveredClues.length}/3`;
    document.getElementById('heirloomCountBadge').textContent = `👑 ${p.heirlooms.length}/3`;

    const slots = [
        { category: 'era', label: 'Era', icon: 'history_edu' },
        { category: 'curse', label: 'Sign', icon: 'ac_unit' },
        { category: 'relic', label: 'Relic', icon: 'diamond' }
    ];
    document.getElementById('clueSlotsContainer').innerHTML = slots.map(sl => {
        const found = p.discoveredClues.find(c => c.category === sl.category);
        return found ? `
            <div class="px-2.5 py-1 rounded-xl bg-teal-950/60 border border-teal-500/40 flex items-center justify-between text-xs">
                <span class="text-teal-200">${sl.label}:</span>
                <strong class="font-cartoon text-amber-300">${found.value}</strong>
            </div>
        ` : `
            <div class="px-2.5 py-1 rounded-xl bg-md-surface1/70 border border-purple-800/30 flex items-center justify-between text-[11px] text-purple-400">
                <span>${sl.label}:</span>
                <span class="italic">Unfound...</span>
            </div>
        `;
    }).join('');

    const remaining = SUSPECTS.filter(s => {
        if (p.crossedOffSuspectIds.includes(s.id)) return false;
        return p.discoveredClues.every(c => s.traits[c.category] === c.value);
    });
    document.getElementById('deductionText').textContent = remaining.length === 1
        ? `Culprit: ${remaining[0].name}!`
        : `${remaining.length} Suspects Possible`;

    document.getElementById('miniScoreboardGrid').innerHTML = state.players.map(pl => `
        <div class="px-2 py-1 rounded-lg bg-md-surface2 border ${pl.index === state.activePlayerIndex ? 'border-teal-400' : 'border-purple-800/40'} flex items-center justify-between text-[11px]">
            <span class="truncate font-semibold text-white">${pl.char.emoji} ${pl.char.shortName}</span>
            <span class="font-mono font-bold text-amber-300">${pl.score}</span>
        </div>
    `).join('');
}

function openSuspectsModal() {
    const p = getActivePlayer();
    const currentRoom = getRoomAt(p.floor, p.x, p.y);

    document.getElementById('modalLeaderboardStrip').innerHTML = state.players.map(pl => `
        <div class="px-3 py-1.5 rounded-xl bg-md-surface1 border ${pl.index === state.activePlayerIndex ? 'border-amber-400' : 'border-purple-700/40'} flex items-center gap-2 text-xs">
            <span>${pl.char.emoji}</span>
            <span class="font-bold text-white">${pl.name} (${pl.char.shortName}):</span>
            <span class="font-mono font-bold text-teal-300">${pl.score} pts</span>
            <span class="text-[10px] text-amber-300">👑${pl.heirlooms.length}</span>
        </div>
    `).join('');

    document.getElementById('suspectsGrid').innerHTML = SUSPECTS.map(s => {
        const targetRoomId = suspectRoomIdForCurrentMap(s);
        const roomObj = getCurrentMap().rooms.find(r => r.id === targetRoomId);
        const roomDisplayName = roomObj ? roomObj.name : s.roomId;

        const matchesClues = p.discoveredClues.every(c => s.traits[c.category] === c.value);
        const isManuallyCrossed = p.crossedOffSuspectIds.includes(s.id);
        const isEliminated = !matchesClues || isManuallyCrossed;
        const isPlayerHere = currentRoom && currentRoom.id === targetRoomId;
        const portraitUrl = paintSuspectPortraitCanvas(s).toDataURL();

        const checkTrait = (cat, val) => {
            const found = p.discoveredClues.find(c => c.category === cat);
            if (!found) return `<span class="text-purple-200">${val}</span>`;
            if (found.value === val) return `<span class="text-teal-300 font-bold">✓ ${val}</span>`;
            return `<span class="text-rose-400/75 line-through">✗ ${val}</span>`;
        };

        return `
            <div class="rounded-2xl p-3 border-2 transition-all flex flex-col justify-between ${
                !isEliminated ? 'bg-md-surface2 border-purple-500/60' : 'bg-md-surface1/40 border-purple-900/30 opacity-45'
            } ${isPlayerHere ? 'ring-2 ring-amber-400' : ''}">
                <div>
                    <div class="flex items-center justify-between gap-1 mb-2">
                        <div class="flex items-center gap-2 min-w-0">
                            <img src="${portraitUrl}" class="w-11 h-11 rounded-xl border object-cover shrink-0" style="border-color:${s.portraitColor}" />
                            <div class="min-w-0">
                                <h4 class="font-cartoon font-bold text-xs text-white truncate ${isEliminated ? 'line-through' : ''}">${s.name}</h4>
                                <span class="text-[10px] text-amber-300 font-semibold block truncate">${roomDisplayName}</span>
                            </div>
                        </div>
                        <button onclick="toggleCrossOffSuspect('${s.id}')" class="px-1.5 py-0.5 rounded text-[9px] font-bold border shrink-0 ${
                            isManuallyCrossed ? 'bg-rose-950 text-rose-300 border-rose-500/40' : 'bg-md-surface3 text-purple-200 border-purple-600/30'
                        }">
                            ${isManuallyCrossed ? 'Undo' : 'Cross Off'}
                        </button>
                    </div>

                    <div class="space-y-1 text-[11px] bg-md-surface1 p-2 rounded-xl border border-purple-800/40">
                        <div class="flex justify-between"><span class="text-purple-400">Era:</span> ${checkTrait('era', s.traits.era)}</div>
                        <div class="flex justify-between"><span class="text-purple-400">Sign:</span> ${checkTrait('curse', s.traits.curse)}</div>
                        <div class="flex justify-between"><span class="text-purple-400">Relic:</span> ${checkTrait('relic', s.traits.relic)}</div>
                    </div>
                </div>

                <button onclick="accuseSuspectPortrait('${s.id}')" ${!isPlayerHere ? 'disabled' : ''} class="md-btn mt-2 w-full py-1.5 rounded-xl font-cartoon font-bold text-[11px] flex items-center justify-center gap-1 ${
                    isPlayerHere
                        ? 'bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 shadow-md'
                        : 'bg-md-surface3 text-purple-400 opacity-50'
                }">
                    <span class="material-symbols-rounded text-xs">gavel</span>
                    <span>${isPlayerHere ? 'ACCUSE (+500 PTS)' : `Go to ${roomDisplayName}`}</span>
                </button>
            </div>
        `;
    }).join('');

    document.getElementById('suspectsModal').classList.remove('hidden');
    document.getElementById('suspectsModal').classList.add('flex');
}

function closeSuspectsModal() {
    document.getElementById('suspectsModal').classList.add('hidden');
    document.getElementById('suspectsModal').classList.remove('flex');
}

function openBlueprintsModal() {
    const mapDef = getCurrentMap();
    document.getElementById('blueprintsListContainer').innerHTML = mapDef.passages.map(pair => {
        const isFound = state.discoveredBlueprints.includes(pair.pairId);
        return `
            <div class="p-3.5 rounded-2xl border-2 ${isFound ? 'bg-teal-950/40 border-teal-400/60' : 'bg-md-surface2 border-purple-800/40'}">
                <div class="font-cartoon font-bold text-sm text-teal-200 mb-1">${pair.blueprintTitle}</div>
                <p class="text-xs text-purple-200/90 mb-2">${pair.blueprintNote}</p>
            </div>
        `;
    }).join('');
    document.getElementById('blueprintsModal').classList.remove('hidden');
    document.getElementById('blueprintsModal').classList.add('flex');
}

function closeBlueprintsModal() {
    document.getElementById('blueprintsModal').classList.add('hidden');
    document.getElementById('blueprintsModal').classList.remove('flex');
}

function openHelpModal() {
    document.getElementById('helpModal').classList.remove('hidden');
    document.getElementById('helpModal').classList.add('flex');
}

function closeHelpModal() {
    document.getElementById('helpModal').classList.add('hidden');
    document.getElementById('helpModal').classList.remove('flex');
}

function toggleMobileDrawer() {
    const drawer = document.getElementById('controlDeckDrawer');
    const isHidden = drawer.classList.contains('hidden');
    if (isHidden) {
        drawer.classList.remove('hidden');
        drawer.classList.add('flex');
        document.getElementById('mobileDrawerBtnText').textContent = '🔽 Hide Tools';
    } else {
        drawer.classList.add('hidden');
        drawer.classList.remove('flex');
        document.getElementById('mobileDrawerBtnText').textContent = '🛠️ Open Tools';
    }
    SoundFX.clickSwitch();
    setTimeout(onWindowResize, 60);
}

function handleCompactPrimaryAction() {
    if (state.turnPhase === 'ROLL') {
        handleRollDice();
    } else if (state.turnPhase === 'MOVE') {
        endPlayerTurn();
    }
}

function toggleCleanViewport() {
    state.cleanViewportMode = !state.cleanViewportMode;
    SoundFX.clickSwitch();

    const topBar = document.getElementById('topAppBar');
    const camBar = document.getElementById('bottomLeftCameraBar');
    const dock = document.getElementById('mobileCommandDock');
    const drawer = document.getElementById('controlDeckDrawer');
    const iconEl = document.getElementById('cleanViewFloatingIcon');
    const txtEl = document.getElementById('cleanViewFloatingText');

    if (state.cleanViewportMode) {
        if (topBar) topBar.classList.add('hidden');
        if (camBar) camBar.classList.add('hidden');
        if (drawer) {
            drawer.classList.add('hidden');
            drawer.classList.remove('flex', 'lg:flex');
        }
        if (iconEl) iconEl.textContent = 'visibility_off';
        if (txtEl) txtEl.textContent = 'Show HUD';
        const mobileDrawerTxt = document.getElementById('mobileDrawerBtnText');
        if (mobileDrawerTxt) mobileDrawerTxt.textContent = 'Tools';
        showToast('👁️ Clean Viewport Active (92%+ 3D View)! Tap "Show HUD" or "🛠️ Tools" anytime.', 'visibility');
    } else {
        if (topBar) topBar.classList.remove('hidden');
        if (camBar) camBar.classList.remove('hidden');
        if (drawer && window.innerWidth >= 1024) {
            drawer.classList.remove('hidden');
            drawer.classList.add('flex', 'lg:flex');
        }
        if (iconEl) iconEl.textContent = 'visibility';
        if (txtEl) txtEl.textContent = 'Clean View';
    }
    setTimeout(onWindowResize, 60);
}

/* ============================================================================
 * 12. 3D STEP HIGHLIGHTS, CAMERA PRESETS & 60FPS ANIMATION LOOP
 * ============================================================================ */
function rebuildStepHighlights3D() {
    stepHighlightMeshes.forEach(m => scene.remove(m));
    stepHighlightMeshes = [];
    if (state.turnPhase !== 'MOVE' || state.ap <= 0) return;

    const p = getActivePlayer();
    const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
        const nx = p.x + dx;
        const ny = p.y + dy;
        if (canMoveBetween(p.floor, p.x, p.y, nx, ny)) {
            const pos = gridToWorld(nx, ny, p.floor);
            const geo = new THREE.PlaneGeometry(TILE_SIZE * 0.76, TILE_SIZE * 0.76);
            geo.rotateX(-Math.PI / 2);
            const mat = new THREE.MeshBasicMaterial({ color: 0x2dd4bf, transparent: true, opacity: 0.38, side: THREE.DoubleSide });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(pos.x, pos.y + 0.04, pos.z);
            scene.add(mesh);
            stepHighlightMeshes.push(mesh);
        }
    }
}

function setCameraPreset(preset) {
    state.cameraPreset = preset;
    SoundFX.clickSwitch();
    const p = getActivePlayer();
    const pWorld = gridToWorld(p.visualX, p.visualY, p.floor);

    if (preset === 'iso') {
        camera.position.set(pWorld.x, pWorld.y + 23, pWorld.z + 19);
        controls.target.set(pWorld.x * 0.4, pWorld.y, pWorld.z * 0.4);
    } else if (preset === 'top') {
        camera.position.set(0, pWorld.y + 34, 3);
        controls.target.set(0, pWorld.y, 0);
    } else if (preset === 'follow') {
        camera.position.set(pWorld.x, pWorld.y + 11, pWorld.z + 9);
        controls.target.set(pWorld.x, pWorld.y + 0.8, pWorld.z);
    }
    controls.update();

    const labelEl = document.getElementById('quickCameraLabel');
    if (labelEl) {
        const names = { iso: '45°', top: 'Top', follow: 'Follow' };
        labelEl.textContent = names[preset] || preset;
    }
    const iconEl = document.getElementById('quickCamIcon');
    if (iconEl) {
        const icons = { iso: 'deployed_code', top: 'grid_view', follow: 'person_pin_circle' };
        iconEl.textContent = icons[preset] || 'videocam';
    }
}

function toggleCutawayWalls() {
    const modes = ['auto', 'down', 'up'];
    state.cutawayMode = modes[(modes.indexOf(state.cutawayMode) + 1) % modes.length];
    document.getElementById('wallModeText').textContent = `Walls: ${state.cutawayMode.toUpperCase()}`;
    SoundFX.clickSwitch();
}

function spawnSoundRipple3D(wx, wy, wz, colorHex) {
    const ringGeo = new THREE.RingGeometry(0.3, 0.5, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(ringGeo, ringMat);
    mesh.position.set(wx, wy + 0.15, wz);
    scene.add(mesh);
    soundRippleRings.push({ mesh, scale: 1, alpha: 0.9 });
}

let toastTimeout = null;
function showToast(msg, icon = 'auto_awesome') {
    const banner = document.getElementById('toastBanner');
    document.getElementById('toastMessage').textContent = msg;
    document.getElementById('toastIcon').textContent = icon;
    banner.classList.remove('opacity-0', '-translate-y-3');
    banner.classList.add('opacity-100', 'translate-y-0');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        banner.classList.add('opacity-0', '-translate-y-3');
        banner.classList.remove('opacity-100', 'translate-y-0');
    }, 3600);
}

window.addEventListener('keydown', e => {
    if (!document.getElementById('lobbyModal').classList.contains('hidden') ||
        !document.getElementById('turnHandoffModal').classList.contains('hidden') ||
        !document.getElementById('suspectsModal').classList.contains('hidden')) {
        return;
    }
    switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': e.preventDefault(); movePlayerCameraRelative(0, -1); break;
        case 'ArrowDown': case 's': case 'S': e.preventDefault(); movePlayerCameraRelative(0, 1); break;
        case 'ArrowLeft': case 'a': case 'A': e.preventDefault(); movePlayerCameraRelative(-1, 0); break;
        case 'ArrowRight': case 'd': case 'D': e.preventDefault(); movePlayerCameraRelative(1, 0); break;
        case ' ': e.preventDefault(); if (state.turnPhase === 'ROLL') handleRollDice(); break;
        case 'f': case 'F': case 'Enter': e.preventDefault(); interactWithNearbyProp(); break;
        case 'e': case 'E': e.preventDefault(); useSecretPassageOrStairs(); break;
        case 'r': case 'R': e.preventDefault(); openSuspectsModal(); break;
        case 'l': case 'L': e.preventDefault(); toggleFlashlight(); break;
        case 'k': case 'K': e.preventDefault(); flipCurrentRoomLight(); break;
        case 'g': case 'G': e.preventDefault(); usePocketGadget(); break;
        case 'x': case 'X': e.preventDefault(); if (state.turnPhase === 'MOVE') endPlayerTurn(); break;
    }
});

function animate3DLoop(timestamp) {
    requestAnimationFrame(animate3DLoop);
    const t = timestamp * 0.001;
    if (!scene || !renderer) return;

    const activeFl = getActiveDisplayedFloor();
    const activePlayer = getActivePlayer();
    const activePlayerRoom = activePlayer ? getRoomAt(activePlayer.floor, activePlayer.x, activePlayer.y) : null;

    // 1. Two-Story Floor Visibility
    if (floorGroups[1]) {
        floorGroups[1].visible = getCurrentMap().floors > 1 && activeFl === 1;
    }

    // 2. v4.2 Periodic Thunderstorm Lightning Flash System
    if (t > state.nextLightningTime) {
        state.lightningFlashIntensity = 1.45;
        state.nextLightningTime = t + 14 + Math.random() * 9;
        SoundFX.thunderRumble();
        // Secondary double-pulse lightning flicker
        setTimeout(() => {
            state.lightningFlashIntensity = 1.85;
        }, 140);
    }
    if (state.lightningFlashIntensity > 0.01) {
        state.lightningFlashIntensity *= 0.88;
    } else {
        state.lightningFlashIntensity = 0;
    }
    if (lightningDirectionalLight) {
        lightningDirectionalLight.intensity = state.lightningFlashIntensity * 1.4;
    }
    stormWindowObjects.forEach(sw => {
        sw.shaftMat.opacity = 0.14 + state.lightningFlashIntensity * 0.28 + Math.sin(t * 2.2) * 0.02;
    });

    // 3. v4.2 Expressive 3D Hero Animations (Smooth Directional Facing, Walking Swing & Proximity Shiver!)
    state.players.forEach((p, idx) => {
        const mesh = playerMeshes[idx];
        if (!mesh) return;
        p.visualX += (p.x - p.visualX) * 0.22;
        p.visualY += (p.y - p.visualY) * 0.22;
        p.visualFloor += (p.floor - p.visualFloor) * 0.2;
        if (typeof p.visualRotY !== 'number') p.visualRotY = p.rotY;
        p.visualRotY = lerpAngleRadians(p.visualRotY, p.rotY, 0.24);

        const pWorld = gridToWorld(p.visualX, p.visualY, p.visualFloor);
        const isMoving = Math.abs(p.x - p.visualX) + Math.abs(p.y - p.visualY) > 0.04;
        const walkBob = isMoving ? Math.abs(Math.sin(t * 18)) * 0.18 : Math.sin(t * 3.5 + idx) * 0.03;

        // Check if Ghost is within 4 tiles on the same floor (and player is not in a Lit Safe Room)
        const pRoom = getRoomAt(p.floor, p.x, p.y);
        const inSafeLitRoom = !!(pRoom && state.roomLights[pRoom.id]);
        const ghostDist = (p.floor === state.ghost.floor)
            ? Math.abs(p.x - state.ghost.x) + Math.abs(p.y - state.ghost.y)
            : 99;
        const isScaredShivering = !inSafeLitRoom && ghostDist <= 4;

        const shiverX = isScaredShivering ? Math.sin(t * 48) * 0.045 : 0;
        const shiverZ = isScaredShivering ? Math.cos(t * 52) * 0.045 : 0;

        mesh.position.set(pWorld.x + shiverX, pWorld.y + walkBob, pWorld.z + shiverZ);
        mesh.rotation.y = p.visualRotY;
        mesh.visible = p.floor <= activeFl;

        // Articulated limb swing & scared head tremble
        if (mesh.userData.leftLeg && mesh.userData.rightLeg) {
            const legSwing = isMoving ? Math.sin(t * 20) * 0.45 : 0;
            mesh.userData.leftLeg.rotation.x = legSwing;
            mesh.userData.rightLeg.rotation.x = -legSwing;
            mesh.userData.leftArm.rotation.x = -legSwing * 0.7;
        }
        if (mesh.userData.head) {
            mesh.userData.head.rotation.z = isScaredShivering ? Math.sin(t * 36) * 0.12 : 0;
        }

        if (mesh.userData.spotLight) mesh.userData.spotLight.intensity = p.flashlightOn ? 2.3 : 0;
        if (mesh.userData.beamCone) mesh.userData.beamCone.visible = p.flashlightOn;
    });

    // 4. v4.2 Expressive 3D Phantom Animations (Articulated Arms, Swinging Lantern & Vortex Ring)
    state.ghost.visualX += (state.ghost.x - state.ghost.visualX) * 0.15;
    state.ghost.visualY += (state.ghost.y - state.ghost.visualY) * 0.15;
    state.ghost.visualFloor += (state.ghost.floor - state.ghost.visualFloor) * 0.18;
    if (typeof state.ghost.visualRotY !== 'number') state.ghost.visualRotY = state.ghost.rotY;
    state.ghost.visualRotY = lerpAngleRadians(state.ghost.visualRotY, state.ghost.rotY, 0.2);

    if (ghostGroup) {
        const gWorld = gridToWorld(state.ghost.visualX, state.ghost.visualY, state.ghost.visualFloor);
        ghostGroup.position.set(gWorld.x, gWorld.y + 0.22 + Math.sin(t * 4.5) * 0.18, gWorld.z);
        ghostGroup.rotation.y = state.ghost.visualRotY;
        ghostGroup.visible = state.ghost.floor <= activeFl;

        const gu = ghostGroup.userData;
        if (gu.leftArm && gu.rightArm) {
            gu.leftArm.rotation.x = -0.45 + Math.sin(t * 5.2) * 0.25;
            gu.rightArm.rotation.x = -0.55 + Math.cos(t * 5.2) * 0.22;
        }
        if (gu.lanternGroup) {
            gu.lanternGroup.rotation.z = Math.sin(t * 6) * 0.22;
        }
        if (gu.vortexRing) {
            gu.vortexRing.rotation.z = t * 2.5;
            gu.vortexRing.scale.setScalar(0.92 + Math.sin(t * 5) * 0.1);
        }
        if (gu.hemNodes) {
            gu.hemNodes.forEach(h => {
                h.position.y = 0.36 + Math.sin(t * 6 + h.userData.idx) * 0.08;
            });
        }
    }

    // 5. v4.2 Auto-Fading North-Wall Room Nameplates (Fades to 25% opacity when player is inside that room!)
    for (const [roomId, rn] of Object.entries(roomNameplates)) {
        if (!rn.sprite) continue;
        if (!state.showRoomLabels) {
            rn.sprite.visible = false;
            continue;
        }
        rn.sprite.visible = rn.room.floor <= activeFl;
        const isInsideThisRoom = activePlayerRoom && activePlayerRoom.id === roomId;
        const targetOpacity = isInsideThisRoom ? 0.25 : 0.88;
        rn.sprite.material.opacity += (targetOpacity - rn.sprite.material.opacity) * 0.16;
    }

    // 6. Animate Room Chandeliers, Safe-Zone Floor Glow & Wall-Mounted Master Breaker
    for (const [roomId, ro] of Object.entries(roomLightObjects)) {
        const isLit = !!state.roomLights[roomId];
        const targetIntensity = isLit ? 2.1 : 0.0;
        ro.pointLight.intensity += (targetIntensity - ro.pointLight.intensity) * 0.18;
        ro.pointLight.visible = isLit || ro.pointLight.intensity > 0.05;
        ro.bulbMesh.material.color.setHex(isLit ? 0xfef08a : 0x475569);
        ro.floorGlowMesh.material.opacity = isLit ? (0.24 + Math.sin(t * 3) * 0.04) : 0.0;
        if (ro.switchPlateMesh) {
            ro.switchPlateMesh.material.emissive.setHex(isLit ? 0xd97706 : 0x31102f);
        }
    }

    if (masterBreakerGroup && masterBreakerGroup.userData.hazardRing) {
        const mbActive = state.masterBreakerRoundsLeft > 0;
        masterBreakerGroup.userData.hazardRing.material.color.setHex(mbActive ? 0x2dd4bf : 0xfbbf24);
        masterBreakerGroup.userData.hazardRing.scale.setScalar(1 + Math.sin(t * 5) * 0.08);
        masterBreakerGroup.userData.breakerLever.rotation.z = mbActive ? -0.55 : 0.45;
    }

    // 7. Animate Floating Dust Motes, Flickering Wall Sconces & Ghost Ectoplasm Footprints
    dustMoteMeshes.forEach(dm => {
        dm.mesh.position.x = dm.baseX + Math.sin(t * dm.speed + dm.phase) * 0.55;
        dm.mesh.position.y = dm.baseY + Math.cos(t * dm.speed * 1.3 + dm.phase) * 0.28;
        dm.mesh.position.z = dm.baseZ + Math.cos(t * dm.speed + dm.phase) * 0.55;
        dm.mesh.material.opacity = 0.35 + Math.sin(t * 3 + dm.phase) * 0.3;
    });

    wallSconceLights.forEach(ws => {
        const flicker = 0.48 + Math.sin(t * 11 + ws.phase) * 0.1 + Math.cos(t * 19 + ws.phase) * 0.06;
        ws.light.visible = !state.performanceMode;
        if (!state.performanceMode) ws.light.intensity = flicker;
        ws.flameMesh.scale.setScalar(0.88 + Math.sin(t * 14 + ws.phase) * 0.14);
    });

    for (let i = ectoplasmFootprintMeshes.length - 1; i >= 0; i--) {
        const fp = ectoplasmFootprintMeshes[i];
        fp.mesh.visible = fp.floor <= activeFl;
        fp.alpha -= 0.0009;
        if (state.turnNumber - fp.bornTurn > 1) {
            fp.alpha -= 0.015;
        }
        fp.mat.opacity = Math.max(0, fp.alpha);
        if (fp.alpha <= 0) {
            if (fp.mesh.parent) fp.mesh.parent.remove(fp.mesh);
            ectoplasmFootprintMeshes.splice(i, 1);
        }
    }

    // 8. Animate Poltergeist Furniture Tells (Including Ghost Proximity Rattle!)
    const nowMs = performance.now();
    for (const prop of state.props) {
        const pGroup = propMeshes[prop.id];
        if (!pGroup) continue;
        const tell = pGroup.userData.tellGroup;
        const ring = pGroup.userData.ring;
        const inner = pGroup.userData.innerGroup;
        const roomIsLit = !!state.roomLights[prop.roomId];
        const isRattling = pGroup.userData.rattleUntil > nowMs;

        if (!prop.searched && !roomIsLit) {
            tell.visible = true;
            ring.visible = true;
            tell.position.y = Math.sin(t * 5 + prop.x) * 0.18;
            tell.rotation.y = t * 2.2;
            if (isRattling) {
                inner.rotation.z = Math.sin(t * 42) * 0.12;
                ring.material.color.setHex(0xf43f5e);
            } else {
                inner.rotation.z = 0;
                if (prop.revealedBySleuth) ring.material.color.setHex(0xfbbf24);
                else ring.material.color.setHex(0x2dd4bf);
            }
        } else {
            tell.visible = false;
            ring.visible = false;
            inner.rotation.z = 0;
        }
    }

    // 9. Animate Vertical 1F <-> 2F Secret Passage Dotted Light-Tubes
    for (const [pairId, sGroup] of Object.entries(verticalShaftGroups)) {
        const isKnown = state.discoveredBlueprints.includes(pairId) || state.openedPassages[pairId];
        sGroup.visible = getCurrentMap().floors > 1;
        if (sGroup.visible && sGroup.userData.dots) {
            sGroup.userData.dots.forEach((d, idx) => {
                const pulse = 0.65 + Math.sin(t * 4.5 - idx * 0.5) * 0.35;
                d.scale.setScalar(isKnown ? pulse * 1.25 : pulse * 0.75);
                d.material.opacity = isKnown ? 0.92 : 0.38;
            });
        }
    }

    // 10. Cutaway Walls
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    for (const w of wallMeshes) {
        let targetScaleY = 1.0;
        if (state.cutawayMode === 'down') targetScaleY = 0.22;
        else if (state.cutawayMode === 'auto') {
            const dot = w.normalX * camDir.x + w.normalZ * camDir.z;
            if (dot > 0.25 || w.isVaultWall) targetScaleY = 0.24;
        }
        w.mesh.scale.y += (targetScaleY - w.mesh.scale.y) * 0.18;
    }

    // 11. Sound Ripple Rings
    for (let i = soundRippleRings.length - 1; i >= 0; i--) {
        const r = soundRippleRings[i];
        r.scale += 0.18;
        r.alpha -= 0.025;
        r.mesh.scale.set(r.scale, r.scale, 1);
        r.mesh.material.opacity = Math.max(0, r.alpha);
        if (r.alpha <= 0) {
            scene.remove(r.mesh);
            soundRippleRings.splice(i, 1);
        }
    }

    controls.update();
    renderer.render(scene, camera);
}

window.onload = function () {
    initThreeScene();
    renderCharacterSelectionCards();
    startMatchFromLobby();
    openLobbyModal();
    requestAnimationFrame(animate3DLoop);
};
