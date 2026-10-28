/* ============================================================================
 * 3. MULTIPLAYER GAME STATE, PEERJS WEBRTC NETWORKING & MAP HELPERS
 * ============================================================================ */
let state = {
    lobbyMode: 'solo',       // 'solo' | 'pass' | 'online'
    mapId: 'blackwood',      // 'blackwood' | 'ravenwood'
    playerCount: 1,
    scareMode: 'fun',        // 'fun' | 'full'
    difficulty: 'standard',  // 'standard' | 'nightmare'
    viewFloor: 'auto',       // 0 | 1 | 'auto'

    // Array of 1..4 active player states
    players: [],
    activePlayerIndex: 0,
    trappedFamily: [],

    ap: 0,
    turnPhase: 'ROLL',       // 'ROLL' | 'MOVE' | 'GHOST' | 'HANDOFF' | 'RESCUE_CUTSCENE' | 'GAMEOVER'
    turnNumber: 1,
    dread: 0,
    searchedThisTurn: false,
    familyDistractAvailable: true,
    ghostLuredToVaultTurns: 0,
    saltWards: [],           // [{ floor, x, y, turnsLeft }]
    cutawayMode: 'auto',
    cameraPreset: 'iso',

    ghost: {
        floor: 0,
        x: 3,
        y: 2,
        visualX: 3,
        visualY: 2,
        visualFloor: 0,
        rotY: 0,
        visualRotY: 0,
        mode: 'PATROLLING CLUES',
        targetRoomId: null
    },
    trueSuspect: null,
    props: [],
    discoveredBlueprints: [],
    openedPassages: { pairA: false, pairB: false },
    exploredRooms: new Set(['foyer', 'vault', 'balcony']),
    vaultUnlocked: false,
    escapeRoundsLeft: 0,
    dreadInterval: null,

    // Room Light Switches & Wall-Mounted 1F Master Circuit Breaker (Bolted Flush on Central Ritual Vault West Wall at (7,7))
    roomLights: {},              // roomId -> boolean (true = Chandelier ON / Ghost-proof Safe Zone / Clues Hidden)
    lightFlippedThisTurn: {},    // roomId -> boolean (One-Flip-Per-Turn Rule per room!)
    masterBreakerRoundsLeft: 0,  // >0 when 1F Master Circuit Breaker is active
    masterBreakerPos: { floor: 0, x: 7, y: 7, wallMountX: 7.48, wallMountY: 7 },
    cleanViewportMode: false,
    showRoomLabels: true,
    performanceMode: false,

    // v4.2 Thunderstorm Lightning State
    lightningFlashIntensity: 0,
    nextLightningTime: 6
};

// PeerJS Online Room State
const Net = {
    peer: null,
    isHost: false,
    roomCode: null,
    connections: [],
    hostConn: null,
    myPlayerIndex: 0
};

function generateRoomCode() {
    return 'GHOST-' + Math.floor(1000 + Math.random() * 9000);
}

function hostOnlineRoom() {
    if (typeof Peer === 'undefined') {
        showToast('PeerJS library still loading—check internet connection!', 'wifi_off');
        return;
    }
    const code = generateRoomCode();
    Net.roomCode = code;
    Net.isHost = true;
    Net.myPlayerIndex = 0;

    document.getElementById('hostCodeDisplay').textContent = `Connecting ${code}...`;
    if (Net.peer) Net.peer.destroy();

    Net.peer = new Peer(code);
    Net.peer.on('open', id => {
        document.getElementById('hostCodeDisplay').textContent = `Code: ${id} (Waiting for players...)`;
        document.getElementById('onlineRoomPill').classList.remove('hidden');
        document.getElementById('onlineRoomPill').classList.add('inline-flex');
        document.getElementById('onlineRoomCodeText').textContent = id;
        if (state.playerCount < 2) setPlayerCount(2);
        showToast(`Online Room ${id} hosted! Share this code with other devices!`, 'cell_tower');
    });

    Net.peer.on('connection', conn => {
        Net.connections.push(conn);
        const assignedIdx = Math.min(state.playerCount - 1, Net.connections.length);
        conn.on('open', () => {
            conn.send({ type: 'WELCOME', assignedPlayerIndex: assignedIdx, roomCode: Net.roomCode });
            showToast(`Player ${assignedIdx + 1} connected to ${Net.roomCode}!`, 'group_add');
            broadcastOnlineState();
        });
        conn.on('data', data => handleNetworkMessage(data, conn));
    });

    Net.peer.on('error', () => {
        document.getElementById('hostCodeDisplay').textContent = `Peer Error: Try again`;
    });
}

function joinOnlineRoom() {
    let input = document.getElementById('joinCodeInput').value.trim().toUpperCase();
    if (!input) {
        showToast('Enter the 4-digit Room Code first!', 'warning');
        return;
    }
    if (!input.startsWith('GHOST-')) input = 'GHOST-' + input;

    Net.isHost = false;
    Net.roomCode = input;
    if (Net.peer) Net.peer.destroy();

    Net.peer = new Peer();
    Net.peer.on('open', () => {
        const conn = Net.peer.connect(input);
        Net.hostConn = conn;
        conn.on('open', () => {
            document.getElementById('onlineRoomPill').classList.remove('hidden');
            document.getElementById('onlineRoomPill').classList.add('inline-flex');
            document.getElementById('onlineRoomCodeText').textContent = input;
            showToast(`Joined Room ${input}! Waiting for Host...`, 'wifi_tethering');
        });
        conn.on('data', data => handleNetworkMessage(data, conn));
    });
}

function broadcastOnlineState() {
    if (state.lobbyMode !== 'online' || !Net.isHost) return;
    const payload = {
        type: 'STATE_SYNC',
        mapId: state.mapId,
        playerCount: state.playerCount,
        activePlayerIndex: state.activePlayerIndex,
        ap: state.ap,
        turnPhase: state.turnPhase,
        turnNumber: state.turnNumber,
        dread: state.dread,
        vaultUnlocked: state.vaultUnlocked,
        ghost: state.ghost,
        players: state.players.map(p => ({
            index: p.index,
            charId: p.char.id,
            floor: p.floor,
            x: p.x,
            y: p.y,
            rotY: p.rotY,
            hearts: p.hearts,
            maxHearts: p.maxHearts,
            score: p.score,
            flashlightOn: p.flashlightOn,
            gadget: p.gadget,
            discoveredClues: p.discoveredClues,
            heirlooms: p.heirlooms,
            crossedOffSuspectIds: p.crossedOffSuspectIds,
            escaped: p.escaped
        })),
        props: state.props.map(pr => ({ id: pr.id, searched: pr.searched, revealedBySleuth: pr.revealedBySleuth })),
        openedPassages: state.openedPassages,
        discoveredBlueprints: state.discoveredBlueprints,
        roomLights: state.roomLights,
        lightFlippedThisTurn: state.lightFlippedThisTurn,
        masterBreakerRoundsLeft: state.masterBreakerRoundsLeft
    };
    Net.connections.forEach(c => {
        if (c.open) c.send(payload);
    });
}

function handleNetworkMessage(data) {
    if (data.type === 'WELCOME') {
        Net.myPlayerIndex = data.assignedPlayerIndex;
        showToast(`Connected as Player ${Net.myPlayerIndex + 1}!`, 'verified');
    } else if (data.type === 'STATE_SYNC') {
        if (state.mapId !== data.mapId) {
            state.mapId = data.mapId;
            buildMansionArchitecture3D();
        }
        state.activePlayerIndex = data.activePlayerIndex;
        state.ap = data.ap;
        state.turnPhase = data.turnPhase;
        state.turnNumber = data.turnNumber;
        state.dread = data.dread;
        state.vaultUnlocked = data.vaultUnlocked;
        Object.assign(state.ghost, data.ghost);
        state.openedPassages = data.openedPassages;
        state.discoveredBlueprints = data.discoveredBlueprints;
        if (data.roomLights) state.roomLights = data.roomLights;
        if (data.lightFlippedThisTurn) state.lightFlippedThisTurn = data.lightFlippedThisTurn;
        if (typeof data.masterBreakerRoundsLeft === 'number') state.masterBreakerRoundsLeft = data.masterBreakerRoundsLeft;

        data.players.forEach((np, idx) => {
            if (state.players[idx]) {
                Object.assign(state.players[idx], np);
            }
        });
        data.props.forEach(npr => {
            const localPr = state.props.find(p => p.id === npr.id);
            if (localPr) {
                localPr.searched = npr.searched;
                localPr.revealedBySleuth = npr.revealedBySleuth;
            }
        });
        syncAllUI();
        rebuildStepHighlights3D();
    } else if (data.type === 'REMOTE_ACTION' && Net.isHost) {
        if (data.action === 'ROLL') handleRollDice();
        else if (data.action === 'MOVE') movePlayerGrid(data.dx, data.dy);
        else if (data.action === 'SEARCH') interactWithNearbyProp();
        else if (data.action === 'PASSAGE') useSecretPassageOrStairs();
        else if (data.action === 'FLIP_LIGHT') flipCurrentRoomLight();
        else if (data.action === 'MASTER_BREAKER') pullMasterCircuitBreaker();
        else if (data.action === 'END_TURN') endPlayerTurn();
        broadcastOnlineState();
    }
}

function copyRoomCode() {
    if (!Net.roomCode) return;
    const temp = document.createElement('textarea');
    temp.value = Net.roomCode;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
    showToast(`Copied Room Code ${Net.roomCode} to clipboard!`, 'content_copy');
}

/* ============================================================================
 * 4. CURRENT MAP, FLOOR & ACCESSIBILITY HELPERS
 * ============================================================================ */
function getCurrentMap() {
    return MAP_DEFINITIONS[state.mapId] || MAP_DEFINITIONS.blackwood;
}

function getActivePlayer() {
    return state.players[state.activePlayerIndex] || state.players[0];
}

function getActiveDisplayedFloor() {
    if (getCurrentMap().floors === 1) return 0;
    if (state.viewFloor === 'auto') {
        const p = getActivePlayer();
        return p ? p.floor : 0;
    }
    return state.viewFloor;
}

function setViewFloor(fl) {
    state.viewFloor = fl;
    SoundFX.clickSwitch();
    updateFloorSwitcherUI();
    rebuildStepHighlights3D();
}

function updateFloorSwitcherUI() {
    const bar = document.getElementById('floorSwitcherBar');
    if (getCurrentMap().floors < 2) {
        bar.classList.add('hidden');
        bar.classList.remove('flex');
        return;
    }
    bar.classList.remove('hidden');
    bar.classList.add('flex');

    const activeFl = getActiveDisplayedFloor();
    document.getElementById('btnFloor1').className = activeFl === 0 && state.viewFloor !== 'auto'
        ? 'md-btn px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 text-xs font-cartoon font-bold'
        : 'md-btn px-2.5 py-1 rounded-xl bg-md-surface2 text-purple-200 text-xs font-cartoon font-bold';
    document.getElementById('btnFloor2').className = activeFl === 1 && state.viewFloor !== 'auto'
        ? 'md-btn px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 text-xs font-cartoon font-bold'
        : 'md-btn px-2.5 py-1 rounded-xl bg-md-surface2 text-purple-200 text-xs font-cartoon font-bold';
    document.getElementById('btnFloorAuto').className = state.viewFloor === 'auto'
        ? 'md-btn px-2 py-1 rounded-xl bg-teal-400 text-slate-950 text-[10px] font-bold'
        : 'md-btn px-2 py-1 rounded-xl bg-md-surface2 text-teal-300 text-[10px] font-bold border border-teal-500/30';
}

function getRoomAt(floor, x, y) {
    const rooms = getCurrentMap().rooms;
    for (const r of rooms) {
        if (r.floor === floor && x >= r.x1 && x <= r.x2 && y >= r.y1 && y <= r.y2) return r;
    }
    return null;
}

function isMoonlightTile(floor, x, y) {
    return MOONLIGHT_WINDOWS.some(w => w.lightTiles.some(t => t.x === x && t.y === y));
}

function hasDoorBetween(floor, x1, y1, x2, y2) {
    return getCurrentMap().doorways.some(d =>
        d.floor === floor &&
        ((d.x1 === x1 && d.y1 === y1 && d.x2 === x2 && d.y2 === y2) ||
         (d.x2 === x1 && d.y2 === y1 && d.x1 === x2 && d.y1 === y2))
    );
}

function isWallBetween(floor, x1, y1, x2, y2) {
    const r1 = getRoomAt(floor, x1, y1);
    const r2 = getRoomAt(floor, x2, y2);
    if (r1 === r2) return false;
    if (hasDoorBetween(floor, x1, y1, x2, y2)) return false;
    return true;
}

function canMoveBetween(floor, x1, y1, x2, y2) {
    if (x2 <= 0 || x2 >= GRID_COLS - 1 || y2 <= 0 || y2 >= GRID_ROWS - 1) return false;
    const targetRoom = getRoomAt(floor, x2, y2);
    if (targetRoom && targetRoom.isLockedVault && !state.vaultUnlocked) return false;

    const blockingProp = state.props.find(p => p.floor === floor && p.x === x2 && p.y === y2);
    if (blockingProp) return false;

    if (isWallBetween(floor, x1, y1, x2, y2)) return false;
    return true;
}

function getNearbyStaircase(player) {
    for (const st of getCurrentMap().stairs) {
        if (player.floor === st.fromFloor && Math.abs(player.x - st.fromX) + Math.abs(player.y - st.fromY) <= 1) {
            return { stair: st, targetFloor: st.toFloor, targetX: st.toX, targetY: st.toY, dirLabel: 'Climb Upstairs to 2F' };
        }
        if (player.floor === st.toFloor && Math.abs(player.x - st.toX) + Math.abs(player.y - st.toY) <= 1) {
            return { stair: st, targetFloor: st.fromFloor, targetX: st.fromX, targetY: st.fromY, dirLabel: 'Descend Stairs to 1F' };
        }
    }
    return null;
}

function getNearbySecretPassageEndpoint(player) {
    const detectRange = player.char.id === 'inventor' ? 3 : 2;
    for (const pair of getCurrentMap().passages) {
        for (const ep of pair.endpoints) {
            if (ep.floor !== player.floor) continue;
            const dist = Math.abs(player.x - ep.x) + Math.abs(player.y - ep.y);
            if (dist <= detectRange) {
                const isKnown = state.discoveredBlueprints.includes(pair.pairId) || state.openedPassages[pair.pairId] || player.char.id === 'inventor';
                const hasLight = player.flashlightOn || isMoonlightTile(player.floor, player.x, player.y);
                if (isKnown || hasLight) {
                    return { pair, ep, dist };
                }
            }
        }
    }
    return null;
}

function isNearMasterBreaker(player) {
    if (!player) return false;
    const mb = state.masterBreakerPos;
    return player.floor === mb.floor && (Math.abs(player.x - mb.x) + Math.abs(player.y - mb.y) <= 1);
}
