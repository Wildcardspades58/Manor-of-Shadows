/* ============================================================================
 * 6. THREE.JS 3D SCENE, STORM WINDOWS, DUST MOTES, WALL-MOUNTED BREAKER & MODELS
 * ============================================================================ */
let scene, camera, renderer, controls;
let hemiLight, dirLight, fillLight, lightningDirectionalLight;
let architectureGroup;
let floorGroups = { 0: null, 1: null };
let wallMeshes = [];
let propMeshes = {};
let playerMeshes = [];
let ghostGroup, ghostPointLight;
let trappedFamilyGroups = [];
let stepHighlightMeshes = [];
let vaultChainMeshes = [];
let secretTriggerMeshes = {};
let scrapeMarkMeshes = {};
let roomFogMeshes = {};
let roomLightObjects = {};       // roomId -> { pointLight, bulbMesh, floorGlowMesh, switchPlateMesh, nameplate, room }
let roomNameplates = {};         // roomId -> { sprite, room }
let verticalShaftGroups = {};    // pairId -> THREE.Group (3D dotted light-tube between 1F & 2F)
let masterBreakerGroup = null;
let stormWindowObjects = [];     // [{ paneMat, shaftMat, windowLight }]
let dustMoteMeshes = [];         // [{ mesh, baseX, baseY, baseZ, speed, phase }]
let wallSconceLights = [];       // [{ light, flameMesh, phase }]
let ectoplasmFootprintMeshes = []; // [{ mesh, floor, x, y, bornTurn, alpha }]
let soundRippleRings = [];
let raycaster = new THREE.Raycaster();
let mouseVec = new THREE.Vector2();

function gridToWorld(gx, gy, floor = 0) {
    const wx = (gx - (GRID_COLS - 1) / 2) * TILE_SIZE;
    const wz = (gy - (GRID_ROWS - 1) / 2) * TILE_SIZE;
    const wy = floor * FLOOR_HEIGHT_3D;
    return { x: wx, y: wy, z: wz };
}

function suspectRoomIdForCurrentMap(suspect) {
    const mapRooms = getCurrentMap().rooms;
    if (mapRooms.some(r => r.id === suspect.roomId)) return suspect.roomId;
    return suspect.fallbackRoomId || 'foyer';
}

function buildCartoonHeroMesh(charData, includeFlashlight = false) {
    const group = new THREE.Group();
    const suitMat = new THREE.MeshStandardMaterial({ color: charData.suitHex, roughness: 0.42 });
    const capeMat = new THREE.MeshStandardMaterial({ color: charData.capeHex, roughness: 0.55 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.42 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x1e1b2e, roughness: 0.5 });

    const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.1, 0.42, 12), shoeMat);
    leftLeg.position.set(-0.15, 0.22, 0);
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.1, 0.42, 12), shoeMat);
    rightLeg.position.set(0.15, 0.22, 0);
    group.add(rightLeg);

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 0.68, 16), suitMat);
    body.position.y = 0.68;
    body.castShadow = true;
    group.add(body);

    const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.45, 12), capeMat);
    leftArm.position.set(-0.38, 0.72, 0);
    group.add(leftArm);

    const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.45, 12), capeMat);
    rightArm.position.set(0.38, 0.72, 0.1);
    rightArm.rotation.x = includeFlashlight ? -0.45 : 0;
    group.add(rightArm);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 20, 20), skinMat);
    head.position.y = 1.3;
    head.castShadow = true;
    group.add(head);

    const eyeWMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x090514 });
    [-0.13, 0.13].forEach(ex => {
        const ew = new THREE.Mesh(new THREE.SphereGeometry(0.068, 12, 12), eyeWMat);
        ew.position.set(ex, 0.04, 0.33);
        head.add(ew);
        const p = new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 10), pupilMat);
        p.position.set(ex, 0.04, 0.38);
        head.add(p);
    });

    if (charData.hatType === 'deerstalker') {
        const hatMat = new THREE.MeshStandardMaterial({ color: 0x9333ea });
        const dome = new THREE.Mesh(new THREE.SphereGeometry(0.39, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), hatMat);
        dome.position.y = 0.1;
        head.add(dome);
    } else if (charData.hatType === 'visor') {
        const visorMat = new THREE.MeshStandardMaterial({ color: 0x2dd4bf });
        const bill = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.05, 0.35), visorMat);
        bill.position.set(0, 0.14, 0.32);
        head.add(bill);
    } else if (charData.hatType === 'witch') {
        const hatMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
        const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.54, 0.05, 16), hatMat);
        brim.position.y = 0.18;
        head.add(brim);
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.65, 16), hatMat);
        cone.position.y = 0.52;
        head.add(cone);
    } else {
        const gogMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.8 });
        const gog = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.16, 0.22), gogMat);
        gog.position.set(0, 0.18, 0.3);
        head.add(gog);
    }

    let spotLight = null;
    let beamCone = null;
    if (includeFlashlight) {
        // Handheld brass torch cylinder
        const torchMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.05, 0.28, 10),
            new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.75, roughness: 0.25 })
        );
        torchMesh.rotation.x = Math.PI / 2;
        torchMesh.position.set(0.36, 0.74, 0.32);
        group.add(torchMesh);

        const coneGeo = new THREE.ConeGeometry(1.65, 5.6, 20, 1, true);
        coneGeo.translate(0, -2.8, 0);
        coneGeo.rotateX(-Math.PI / 2);
        beamCone = new THREE.Mesh(coneGeo, new THREE.MeshBasicMaterial({
            color: 0xfef08a,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide,
            depthWrite: false
        }));
        beamCone.position.set(0.36, 0.74, 0.44);
        group.add(beamCone);

        spotLight = new THREE.SpotLight(0xfef08a, 2.3, 13.5, Math.PI / 4, 0.45, 1.1);
        spotLight.position.set(0.36, 1.15, 0.35);
        group.add(spotLight);

        const spotTarget = new THREE.Object3D();
        spotTarget.position.set(0.36, 0.35, 6.2);
        group.add(spotTarget);
        spotLight.target = spotTarget;
    }

    group.userData = { leftLeg, rightLeg, leftArm, rightArm, head, body, spotLight, beamCone };
    return group;
}

// v4.2 Expressive 3D Phantom with Articulated Arms, Tattered Hem, Spectral Lantern & Vortex Ring
function buildCartoonGhostMesh() {
    const group = new THREE.Group();
    const sheetMat = new THREE.MeshStandardMaterial({
        color: 0x2dd4bf,
        emissive: 0x0d9488,
        emissiveIntensity: 0.7,
        transparent: true,
        opacity: 0.88,
        roughness: 0.25
    });

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.46, 20, 16), sheetMat);
    head.position.y = 1.32;
    group.add(head);

    const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.68, 0.94, 18), sheetMat);
    skirt.position.y = 0.84;
    group.add(skirt);

    // Tattered Floating Spectral Hem Spheres
    const hemNodes = [];
    for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        const hemBall = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), sheetMat);
        hemBall.position.set(Math.cos(ang) * 0.56, 0.38, Math.sin(ang) * 0.56);
        hemBall.userData = { baseAng: ang, idx: i };
        group.add(hemBall);
        hemNodes.push(hemBall);
    }

    // Articulated Spectral Arms
    const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.16, 0.55, 10), sheetMat);
    leftArm.position.set(-0.52, 1.0, 0.18);
    leftArm.rotation.z = 0.55;
    leftArm.rotation.x = -0.45;
    group.add(leftArm);

    const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.16, 0.55, 10), sheetMat);
    rightArm.position.set(0.52, 1.0, 0.22);
    rightArm.rotation.z = -0.55;
    rightArm.rotation.x = -0.55;
    group.add(rightArm);

    // Swinging Ghostly Lantern held by the Phantom
    const lanternGroup = new THREE.Group();
    lanternGroup.position.set(0.66, 0.76, 0.45);
    const lanternCap = new THREE.Mesh(
        new THREE.ConeGeometry(0.16, 0.14, 8),
        new THREE.MeshStandardMaterial({ color: 0x1e1b2e, metalness: 0.7 })
    );
    lanternCap.position.y = 0.14;
    lanternGroup.add(lanternCap);
    const lanternCore = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    lanternGroup.add(lanternCore);
    group.add(lanternGroup);

    // Glowing Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    [-0.15, 0.15].forEach(ex => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 10), eyeMat);
        eye.position.set(ex, 1.35, 0.42);
        group.add(eye);
    });

    // Swirling Ectoplasm Vortex Ring underneath the Ghost
    const vortexGeo = new THREE.RingGeometry(0.38, 0.82, 24);
    vortexGeo.rotateX(-Math.PI / 2);
    const vortexRing = new THREE.Mesh(
        vortexGeo,
        new THREE.MeshBasicMaterial({ color: 0x2dd4bf, transparent: true, opacity: 0.52, side: THREE.DoubleSide })
    );
    vortexRing.position.y = 0.05;
    group.add(vortexRing);

    ghostPointLight = new THREE.PointLight(0x2dd4bf, 1.65, 7.5);
    ghostPointLight.position.set(0, 1.45, 0);
    group.add(ghostPointLight);

    group.userData = { leftArm, rightArm, lanternGroup, vortexRing, hemNodes, sheetMat };
    return group;
}

function buildHauntedProp3D(prop) {
    const group = new THREE.Group();
    const ringGeo = new THREE.RingGeometry(0.55, 0.76, 24);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x2dd4bf, side: THREE.DoubleSide, transparent: true, opacity: 0.55 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.03;
    group.add(ring);

    const innerGroup = new THREE.Group();
    const tellGroup = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a2c18, roughness: 0.55 });
    const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x29180e, roughness: 0.45 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.7, roughness: 0.25 });

    if (prop.type === 'piano') {
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.65, 1.0), new THREE.MeshStandardMaterial({ color: 0x171717 }));
        body.position.y = 0.48;
        innerGroup.add(body);
        const note = new THREE.Mesh(new THREE.OctahedronGeometry(0.18), new THREE.MeshBasicMaterial({ color: 0xfbbf24 }));
        note.position.set(0, 1.35, 0);
        tellGroup.add(note);
    } else if (prop.type === 'billiards') {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.65, 1.0), darkWoodMat);
        frame.position.y = 0.33;
        innerGroup.add(frame);
        const felt = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.06, 0.85), new THREE.MeshStandardMaterial({ color: 0x059669 }));
        felt.position.y = 0.67;
        innerGroup.add(felt);
        const ball = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), goldMat);
        ball.position.set(0, 0.78, 0);
        tellGroup.add(ball);
    } else if (prop.type === 'stove') {
        const box = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.9), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
        box.position.y = 0.4;
        innerGroup.add(box);
        const brew = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), new THREE.MeshBasicMaterial({ color: 0x4ade80 }));
        brew.position.y = 1.05;
        tellGroup.add(brew);
    } else if (prop.type === 'flytrap') {
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.3, 0.5, 14), new THREE.MeshStandardMaterial({ color: 0xb45309 }));
        pot.position.y = 0.25;
        innerGroup.add(pot);
        const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.36, 12, 12), new THREE.MeshStandardMaterial({ color: 0x22c55e }));
        jaw.position.y = 0.95;
        tellGroup.add(jaw);
    } else {
        const cab = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.25, 0.7), woodMat);
        cab.position.y = 0.62;
        innerGroup.add(cab);
        const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.18), goldMat);
        orb.position.y = 1.45;
        tellGroup.add(orb);
    }

    group.add(innerGroup);
    group.add(tellGroup);
    group.traverse(c => {
        if (c.isMesh) c.userData = { propId: prop.id };
    });
    group.userData = { ring, innerGroup, tellGroup, propId: prop.id, rattleUntil: 0 };
    return group;
}

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
}

function initThreeScene() {
    const mount = document.getElementById('threeCanvasMount');
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x120d22);
    scene.fog = new THREE.FogExp2(0x120d22, 0.0082);

    camera = new THREE.PerspectiveCamera(44, mount.clientWidth / mount.clientHeight, 0.1, 160);
    camera.position.set(0, 26, 22);

    state.performanceMode = isMobileDevice();

    renderer = new THREE.WebGLRenderer({
        antialias: !state.performanceMode,
        powerPreference: 'high-performance'
    });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(state.performanceMode ? 1.0 : Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = !state.performanceMode;
    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    const perfIcon = document.getElementById('perfIcon');
    if (perfIcon) perfIcon.textContent = state.performanceMode ? 'bolt' : 'auto_awesome';

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.06;
    controls.minDistance = 8;
    controls.maxDistance = 48;

    hemiLight = new THREE.HemisphereLight(0xb39ddb, 0x312e81, 1.05);
    scene.add(hemiLight);

    dirLight = new THREE.DirectionalLight(0xbfdbfe, 0.92);
    dirLight.position.set(-14, 32, -16);
    dirLight.castShadow = true;
    scene.add(dirLight);

    fillLight = new THREE.DirectionalLight(0xfde68a, 0.42);
    fillLight.position.set(16, 24, 18);
    scene.add(fillLight);

    // v4.2 Storm Lightning Directional Burst Light
    lightningDirectionalLight = new THREE.DirectionalLight(0xe0f2fe, 0.0);
    lightningDirectionalLight.position.set(0, 38, -22);
    scene.add(lightningDirectionalLight);

    architectureGroup = new THREE.Group();
    scene.add(architectureGroup);

    let pointerDownPos = { x: 0, y: 0 };
    renderer.domElement.addEventListener('pointerdown', e => {
        pointerDownPos = { x: e.clientX, y: e.clientY };
    });
    renderer.domElement.addEventListener('pointerup', e => {
        const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
        if (dist > 9) return;
        handle3DViewportClick(e);
    });

    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    const mount = document.getElementById('threeCanvasMount');
    if (!mount || !renderer) return;
    camera.aspect = mount.clientWidth / mount.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(mount.clientWidth, mount.clientHeight);
}

function togglePerformanceMode() {
    state.performanceMode = !state.performanceMode;
    SoundFX.clickSwitch();
    if (renderer) {
        renderer.setPixelRatio(state.performanceMode ? 1.0 : Math.min(window.devicePixelRatio, 1.5));
        renderer.shadowMap.enabled = !state.performanceMode;
        onWindowResize();
    }
    wallSconceLights.forEach(ws => {
        if (ws.light) ws.light.visible = !state.performanceMode;
    });
    const iconEl = document.getElementById('perfIcon');
    if (iconEl) iconEl.textContent = state.performanceMode ? 'bolt' : 'auto_awesome';
    showToast(
        state.performanceMode
            ? '⚡ Smooth Eco Mode (1.0x Resolution & Fast Shaders for 60 FPS)'
            : '💎 High Quality Mode (Full Resolution & Dynamic Shadows)',
        state.performanceMode ? 'bolt' : 'auto_awesome'
    );
}

function buildMansionArchitecture3D() {
    if (!architectureGroup) return;
    while (architectureGroup.children.length > 0) {
        architectureGroup.remove(architectureGroup.children[0]);
    }

    wallMeshes = [];
    vaultChainMeshes = [];
    secretTriggerMeshes = {};
    scrapeMarkMeshes = {};
    roomFogMeshes = {};
    roomLightObjects = {};
    roomNameplates = {};
    verticalShaftGroups = {};
    stormWindowObjects = [];
    dustMoteMeshes = [];
    wallSconceLights = [];
    masterBreakerGroup = null;

    floorGroups = { 0: new THREE.Group(), 1: new THREE.Group() };
    architectureGroup.add(floorGroups[0]);
    architectureGroup.add(floorGroups[1]);

    const mapDef = getCurrentMap();
    const floorMats = {
        marble_foyer: new THREE.MeshStandardMaterial({ map: createFloorTexture('marble_foyer'), roughness: 0.16, metalness: 0.08 }),
        checker_kitchen: new THREE.MeshStandardMaterial({ map: createFloorTexture('checker_kitchen'), roughness: 0.26, metalness: 0.08 }),
        herringbone: new THREE.MeshStandardMaterial({ map: createFloorTexture('herringbone'), roughness: 0.36, metalness: 0.06 }),
        wood_warm: new THREE.MeshStandardMaterial({ map: createFloorTexture('wood_warm'), roughness: 0.34, metalness: 0.06 }),
        parquet_gold: new THREE.MeshStandardMaterial({ map: createFloorTexture('parquet_gold'), roughness: 0.2, metalness: 0.12 }),
        conservatory: new THREE.MeshStandardMaterial({ map: createFloorTexture('conservatory'), roughness: 0.45, metalness: 0.05 }),
        carpet_study: new THREE.MeshStandardMaterial({ map: createFloorTexture('carpet_study'), roughness: 0.55, metalness: 0.04 }),
        ritual_stone: new THREE.MeshStandardMaterial({ map: createFloorTexture('ritual_stone'), roughness: 0.28, metalness: 0.1 }),
        hallway: new THREE.MeshStandardMaterial({ map: createFloorTexture('hallway'), roughness: 0.4, metalness: 0.06 })
    };

    const tileGeo = new THREE.BoxGeometry(TILE_SIZE, 0.2, TILE_SIZE);
    const wallHeight = 2.55;
    const wallThickness = 0.22;
    const wainscotTex = createWainscotWallTexture(false);
    const vaultWallTex = createWainscotWallTexture(true);

    for (let fl = 0; fl < mapDef.floors; fl++) {
        const fGroup = floorGroups[fl];
        const yBase = fl * FLOOR_HEIGHT_3D;

        // Floor Tiles
        for (let gy = 1; gy < GRID_ROWS - 1; gy++) {
            for (let gx = 1; gx < GRID_COLS - 1; gx++) {
                const room = getRoomAt(fl, gx, gy);
                if (fl === 1 && !room && (gx < 5 || gx > 13 || gy < 2 || gy > 11)) continue;

                const mat = room ? floorMats[room.floorType] : floorMats.hallway;
                const tile = new THREE.Mesh(tileGeo, mat);
                const pos = gridToWorld(gx, gy, fl);
                tile.position.set(pos.x, yBase - 0.1, pos.z);
                tile.receiveShadow = true;
                tile.userData = { isFloor: true, floor: fl, gx, gy };
                fGroup.add(tile);
            }
        }

        // Shared Room Walls
        function addWall(wx, wz, len, isHoriz, normX, normZ, isVault) {
            const geo = isHoriz
                ? new THREE.BoxGeometry(len, wallHeight, wallThickness)
                : new THREE.BoxGeometry(wallThickness, wallHeight, len);
            geo.translate(0, wallHeight / 2, 0);
            const mat = new THREE.MeshStandardMaterial({ map: isVault ? vaultWallTex : wainscotTex, roughness: 0.5 });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(wx, yBase, wz);
            fGroup.add(mesh);
            wallMeshes.push({ mesh, floor: fl, normalX: normX, normalZ: normZ, isVaultWall: isVault });

            if (isVault) {
                const barMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0x9f1239 });
                const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, len * 0.95, 8), barMat);
                if (isHoriz) chain.rotateZ(Math.PI / 2);
                else chain.rotateX(Math.PI / 2);
                chain.position.set(wx, yBase + 1.35, wz);
                fGroup.add(chain);
                vaultChainMeshes.push(chain);
            }
        }

        for (let gy = 0; gy < GRID_ROWS - 1; gy++) {
            for (let gx = 1; gx < GRID_COLS - 1; gx++) {
                const r1 = getRoomAt(fl, gx, gy);
                const r2 = getRoomAt(fl, gx, gy + 1);
                if (fl === 1 && !r1 && !r2) continue;
                const isOuter = (fl === 0 && (gy === 0 || gy === GRID_ROWS - 2));
                if (isOuter || (r1 !== r2 && !hasDoorBetween(fl, gx, gy, gx, gy + 1))) {
                    const p1 = gridToWorld(gx, gy, fl);
                    const isV = (r1 && r1.isLockedVault) || (r2 && r2.isLockedVault);
                    addWall(p1.x, p1.z + TILE_SIZE / 2, TILE_SIZE, true, 0, gy === 0 ? -1 : 1, isV);
                }
            }
        }

        for (let gx = 0; gx < GRID_COLS - 1; gx++) {
            for (let gy = 1; gy < GRID_ROWS - 1; gy++) {
                const r1 = getRoomAt(fl, gx, gy);
                const r2 = getRoomAt(fl, gx + 1, gy);
                if (fl === 1 && !r1 && !r2) continue;
                const isOuter = (fl === 0 && (gx === 0 || gx === GRID_COLS - 2));
                if (isOuter || (r1 !== r2 && !hasDoorBetween(fl, gx, gy, gx + 1, gy))) {
                    const p1 = gridToWorld(gx, gy, fl);
                    const isV = (r1 && r1.isLockedVault) || (r2 && r2.isLockedVault);
                    addWall(p1.x + TILE_SIZE / 2, p1.z, TILE_SIZE, false, gx === 0 ? -1 : 1, 0, isV);
                }
            }
        }

        // v4.2 North-Wall Architectural Room Headers (Never covering room centers!) + Suspect Portraits + Room Light Switches
        for (const room of mapDef.rooms.filter(r => r.floor === fl)) {
            const cPos = gridToWorld((room.x1 + room.x2) / 2, (room.y1 + room.y2) / 2, fl);
            const northWallPos = gridToWorld((room.x1 + room.x2) / 2, room.y1, fl);

            // Pin slim brass nameplate high on the room's back North wall
            const nameplate = createRoomNameplateSprite(room);
            nameplate.position.set(northWallPos.x, yBase + 2.68, northWallPos.z - TILE_SIZE * 0.44);
            fGroup.add(nameplate);
            roomNameplates[room.id] = { sprite: nameplate, room };

            // Suspect Portrait on Room's North Wall
            const suspect = SUSPECTS.find(s => suspectRoomIdForCurrentMap(s) === room.id);
            if (suspect && room.portraitWall) {
                const pPos = gridToWorld(room.portraitWall.x, room.portraitWall.y, fl);
                const frameGeo = new THREE.BoxGeometry(1.45, 1.45, 0.14);
                const tex = new THREE.CanvasTexture(paintSuspectPortraitCanvas(suspect));
                const frameMesh = new THREE.Mesh(frameGeo, new THREE.MeshBasicMaterial({ map: tex }));
                frameMesh.position.set(pPos.x, yBase + 1.38, pPos.z - TILE_SIZE * 0.4);
                frameMesh.userData = { isPortrait: true, roomId: room.id, suspectId: suspect.id };
                fGroup.add(frameMesh);
            }

            // Overhead Chandelier / Sconce + Lit Safe-Zone Floor Overlay + Clickable 3D Light Switch
            if (!room.isLockedVault) {
                const roomW = (room.x2 - room.x1 + 1) * TILE_SIZE;
                const roomD = (room.y2 - room.y1 + 1) * TILE_SIZE;

                const glowGeo = new THREE.PlaneGeometry(roomW * 0.92, roomD * 0.92);
                glowGeo.rotateX(-Math.PI / 2);
                const glowMat = new THREE.MeshBasicMaterial({
                    color: 0xfde047,
                    transparent: true,
                    opacity: 0.0,
                    side: THREE.DoubleSide,
                    depthWrite: false
                });
                const floorGlowMesh = new THREE.Mesh(glowGeo, glowMat);
                floorGlowMesh.position.set(cPos.x, yBase + 0.02, cPos.z);
                fGroup.add(floorGlowMesh);

                const chandGroup = new THREE.Group();
                chandGroup.position.set(cPos.x, yBase + 2.25, cPos.z);
                const ringMesh = new THREE.Mesh(
                    new THREE.TorusGeometry(0.45, 0.05, 8, 20),
                    new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.8, roughness: 0.2 })
                );
                ringMesh.rotateX(Math.PI / 2);
                chandGroup.add(ringMesh);

                const bulbMat = new THREE.MeshBasicMaterial({ color: 0x475569 });
                const bulbMesh = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), bulbMat);
                bulbMesh.userData = { isRoomLightSwitch: true, roomId: room.id };
                chandGroup.add(bulbMesh);

                // Wall Switch Plate flush against the room corner wall
                const swPos = gridToWorld(room.x1, room.y2, fl);
                const switchPlateMesh = new THREE.Mesh(
                    new THREE.BoxGeometry(0.22, 0.42, 0.22),
                    new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0x451a03 })
                );
                switchPlateMesh.position.set(swPos.x - TILE_SIZE * 0.4, yBase + 1.1, swPos.z);
                switchPlateMesh.userData = { isRoomLightSwitch: true, roomId: room.id };
                fGroup.add(switchPlateMesh);

                const pointLight = new THREE.PointLight(0xfef08a, 0, Math.max(roomW, roomD) * 1.35);
                pointLight.position.set(0, -0.2, 0);
                chandGroup.add(pointLight);

                fGroup.add(chandGroup);
                roomLightObjects[room.id] = { pointLight, bulbMesh, floorGlowMesh, switchPlateMesh, nameplate, room };
            }
        }
    }

    // v4.2 Build 3D Gothic Storm Windows & Volumetric Moonlight/Lightning Shafts along Outer Walls
    const winTex = createStormWindowTexture();
    for (const mw of MOONLIGHT_WINDOWS) {
        const wPos = gridToWorld(mw.wallX, mw.wallY, 0);
        const winGroup = new THREE.Group();

        const paneMat = new THREE.MeshBasicMaterial({
            map: winTex,
            transparent: true,
            opacity: 0.92,
            side: THREE.DoubleSide
        });
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e1b2e, metalness: 0.5, roughness: 0.4 });

        const isNorth = mw.side === 'north';
        const paneGeo = isNorth
            ? new THREE.PlaneGeometry(1.45, 1.95)
            : new THREE.PlaneGeometry(1.45, 1.95);
        const paneMesh = new THREE.Mesh(paneGeo, paneMat);

        const frameGeo = new THREE.BoxGeometry(1.62, 2.08, 0.14);
        const frameMesh = new THREE.Mesh(frameGeo, frameMat);

        if (mw.side === 'north') {
            winGroup.position.set(wPos.x, 1.42, wPos.z - TILE_SIZE * 0.46);
        } else if (mw.side === 'west') {
            winGroup.position.set(wPos.x - TILE_SIZE * 0.46, 1.42, wPos.z);
            winGroup.rotation.y = Math.PI / 2;
        } else {
            winGroup.position.set(wPos.x + TILE_SIZE * 0.46, 1.42, wPos.z);
            winGroup.rotation.y = -Math.PI / 2;
        }
        paneMesh.position.z = 0.08;
        winGroup.add(frameMesh);
        winGroup.add(paneMesh);
        floorGroups[0].add(winGroup);

        // Volumetric Moonlight & Storm Shaft Carpet on Floor
        const shaftGeo = new THREE.PlaneGeometry(1.85, 3.6);
        shaftGeo.rotateX(-Math.PI / 2);
        const shaftMat = new THREE.MeshBasicMaterial({
            color: 0x7dd3fc,
            transparent: true,
            opacity: 0.16,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const shaftMesh = new THREE.Mesh(shaftGeo, shaftMat);
        if (mw.side === 'north') {
            shaftMesh.position.set(wPos.x, 0.03, wPos.z + 0.8);
        } else if (mw.side === 'west') {
            shaftMesh.rotation.z = Math.PI / 2;
            shaftMesh.position.set(wPos.x + 0.8, 0.03, wPos.z);
        } else {
            shaftMesh.rotation.z = Math.PI / 2;
            shaftMesh.position.set(wPos.x - 0.8, 0.03, wPos.z);
        }
        floorGroups[0].add(shaftMesh);

        stormWindowObjects.push({ paneMat, shaftMat });
    }

    // v4.2 Build Flickering 3D Wall Sconces & Floating Spectral Dust Motes
    WALL_SCONCE_LOCATIONS.forEach((loc, idx) => {
        const sPos = gridToWorld(loc.x, loc.z, loc.floor);
        const sconceGroup = new THREE.Group();
        sconceGroup.position.set(sPos.x, sPos.y + 1.65, sPos.z);

        const holder = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.1, 0.28, 8),
            new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.8, roughness: 0.25 })
        );
        sconceGroup.add(holder);

        const flameMesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.11, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xfde047 })
        );
        flameMesh.position.y = 0.2;
        sconceGroup.add(flameMesh);

        const sconceLight = new THREE.PointLight(0xfb923c, 0.55, 5.5);
        sconceLight.position.y = 0.25;
        sconceLight.visible = !state.performanceMode;
        sconceGroup.add(sconceLight);

        floorGroups[loc.floor].add(sconceGroup);
        wallSconceLights.push({ light: sconceLight, flameMesh, phase: idx * 1.3 });
    });

    // Floating Spectral Dust Motes / Fireflies across the Mansion (16 in Eco mode, 40 in HQ)
    const dustMoteCount = state.performanceMode ? 16 : 40;
    for (let i = 0; i < dustMoteCount; i++) {
        const isGold = i % 2 === 0;
        const moteMesh = new THREE.Mesh(
            new THREE.SphereGeometry(isGold ? 0.055 : 0.048, 6, 6),
            new THREE.MeshBasicMaterial({
                color: isGold ? 0xfef08a : 0x2dd4bf,
                transparent: true,
                opacity: 0.65
            })
        );
        const rx = (Math.random() - 0.5) * (GRID_COLS - 3) * TILE_SIZE;
        const rz = (Math.random() - 0.5) * (GRID_ROWS - 3) * TILE_SIZE;
        const ry = 0.6 + Math.random() * 2.2 + (mapDef.floors > 1 && i > 28 ? FLOOR_HEIGHT_3D : 0);
        moteMesh.position.set(rx, ry, rz);
        architectureGroup.add(moteMesh);
        dustMoteMeshes.push({
            mesh: moteMesh,
            baseX: rx,
            baseY: ry,
            baseZ: rz,
            speed: 0.5 + Math.random() * 0.7,
            phase: Math.random() * Math.PI * 2
        });
    }

    // Clearer 2nd-Floor Visual Framing on Ravenwood Clocktower (1F Indigo Foundation vs 2F Gilded Amber & Cyan Balustrade)
    const wMin1F = gridToWorld(1, 1, 0);
    const wMax1F = gridToWorld(GRID_COLS - 2, GRID_ROWS - 2, 0);
    const width1F = (wMax1F.x - wMin1F.x) + TILE_SIZE;
    const depth1F = (wMax1F.z - wMin1F.z) + TILE_SIZE;

    const trim1FMat = new THREE.MeshStandardMaterial({
        color: 0x6366f1,
        emissive: 0x312e81,
        emissiveIntensity: 0.75,
        roughness: 0.3
    });
    const nTrim1 = new THREE.Mesh(new THREE.BoxGeometry(width1F + 0.5, 0.28, 0.28), trim1FMat);
    nTrim1.position.set(0, 0.02, wMin1F.z - TILE_SIZE / 2 - 0.12);
    floorGroups[0].add(nTrim1);
    const sTrim1 = new THREE.Mesh(new THREE.BoxGeometry(width1F + 0.5, 0.28, 0.28), trim1FMat);
    sTrim1.position.set(0, 0.02, wMax1F.z + TILE_SIZE / 2 + 0.12);
    floorGroups[0].add(sTrim1);
    const wTrim1 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, depth1F + 0.5), trim1FMat);
    wTrim1.position.set(wMin1F.x - TILE_SIZE / 2 - 0.12, 0.02, 0);
    floorGroups[0].add(wTrim1);
    const eTrim1 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, depth1F + 0.5), trim1FMat);
    eTrim1.position.set(wMax1F.x + TILE_SIZE / 2 + 0.12, 0.02, 0);
    floorGroups[0].add(eTrim1);

    if (mapDef.floors > 1) {
        [
            { x: wMin1F.x - 0.6, z: wMax1F.z + 1.1 },
            { x: wMax1F.x + 0.6, z: wMax1F.z + 1.1 }
        ].forEach(c => {
            const b1 = create3DBadgeSprite('1F GROUND FLOOR', 'rgba(30, 27, 75, 0.94)', '#818cf8', '#c7d2fe', 3.2, 0.75);
            b1.position.set(c.x, 0.7, c.z);
            floorGroups[0].add(b1);
        });

        const y2F = FLOOR_HEIGHT_3D;
        const min2F = gridToWorld(1, 1, 1);
        const max2F = gridToWorld(17, 12, 1);
        const w2F = (max2F.x - min2F.x) + TILE_SIZE;
        const d2F = (max2F.z - min2F.z) + TILE_SIZE;
        const centerZ2F = (min2F.z + max2F.z) / 2;

        const goldLedgeMat = new THREE.MeshStandardMaterial({
            color: 0xfbbf24,
            emissive: 0xd97706,
            emissiveIntensity: 0.85,
            metalness: 0.7,
            roughness: 0.2
        });
        const cyanTrimMat = new THREE.MeshBasicMaterial({ color: 0x2dd4bf });

        const nBeam = new THREE.Mesh(new THREE.BoxGeometry(w2F + 0.7, 0.36, 0.36), goldLedgeMat);
        nBeam.position.set(0, y2F - 0.12, min2F.z - TILE_SIZE / 2 - 0.14);
        floorGroups[1].add(nBeam);

        const sBeam = new THREE.Mesh(new THREE.BoxGeometry(w2F + 0.7, 0.36, 0.36), goldLedgeMat);
        sBeam.position.set(0, y2F - 0.12, max2F.z + TILE_SIZE / 2 + 0.14);
        floorGroups[1].add(sBeam);

        const wBeam = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.36, d2F + 0.7), goldLedgeMat);
        wBeam.position.set(min2F.x - TILE_SIZE / 2 - 0.14, y2F - 0.12, centerZ2F);
        floorGroups[1].add(wBeam);

        const eBeam = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.36, d2F + 0.7), goldLedgeMat);
        eBeam.position.set(max2F.x + TILE_SIZE / 2 + 0.14, y2F - 0.12, centerZ2F);
        floorGroups[1].add(eBeam);

        const nCyan = new THREE.Mesh(new THREE.BoxGeometry(w2F + 0.8, 0.1, 0.42), cyanTrimMat);
        nCyan.position.set(0, y2F - 0.32, min2F.z - TILE_SIZE / 2 - 0.14);
        floorGroups[1].add(nCyan);

        const sCyan = new THREE.Mesh(new THREE.BoxGeometry(w2F + 0.8, 0.1, 0.42), cyanTrimMat);
        sCyan.position.set(0, y2F - 0.32, max2F.z + TILE_SIZE / 2 + 0.14);
        floorGroups[1].add(sCyan);

        const wCyan = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.1, d2F + 0.8), cyanTrimMat);
        wCyan.position.set(min2F.x - TILE_SIZE / 2 - 0.14, y2F - 0.32, centerZ2F);
        floorGroups[1].add(wCyan);

        const eCyan = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.1, d2F + 0.8), cyanTrimMat);
        eCyan.position.set(max2F.x + TILE_SIZE / 2 + 0.14, y2F - 0.32, centerZ2F);
        floorGroups[1].add(eCyan);

        const postGeo = new THREE.CylinderGeometry(0.09, 0.11, 0.95, 10);
        for (let bx = min2F.x - TILE_SIZE / 2; bx <= max2F.x + TILE_SIZE / 2; bx += TILE_SIZE * 2) {
            const pNorth = new THREE.Mesh(postGeo, goldLedgeMat);
            pNorth.position.set(bx, y2F + 0.42, min2F.z - TILE_SIZE / 2 - 0.14);
            floorGroups[1].add(pNorth);

            const pSouth = new THREE.Mesh(postGeo, goldLedgeMat);
            pSouth.position.set(bx, y2F + 0.42, max2F.z + TILE_SIZE / 2 + 0.14);
            floorGroups[1].add(pSouth);
        }
        for (let bz = min2F.z - TILE_SIZE / 2; bz <= max2F.z + TILE_SIZE / 2; bz += TILE_SIZE * 2) {
            const pWest = new THREE.Mesh(postGeo, goldLedgeMat);
            pWest.position.set(min2F.x - TILE_SIZE / 2 - 0.14, y2F + 0.42, bz);
            floorGroups[1].add(pWest);

            const pEast = new THREE.Mesh(postGeo, goldLedgeMat);
            pEast.position.set(max2F.x + TILE_SIZE / 2 + 0.14, y2F + 0.42, bz);
            floorGroups[1].add(pEast);
        }

        const sRail = new THREE.Mesh(new THREE.BoxGeometry(w2F + 0.6, 0.1, 0.14), goldLedgeMat);
        sRail.position.set(0, y2F + 0.88, max2F.z + TILE_SIZE / 2 + 0.14);
        floorGroups[1].add(sRail);

        [
            { x: min2F.x - 0.8, z: min2F.z - 1.1 },
            { x: max2F.x + 0.8, z: min2F.z - 1.1 },
            { x: min2F.x - 0.8, z: max2F.z + 1.1 },
            { x: max2F.x + 0.8, z: max2F.z + 1.1 }
        ].forEach(corner => {
            const badge2F = create3DBadgeSprite('⭐ 2F UPPER DECK', 'rgba(69, 26, 3, 0.95)', '#fbbf24', '#fef08a', 3.3, 0.78);
            badge2F.position.set(corner.x, y2F + 1.35, corner.z);
            floorGroups[1].add(badge2F);
        });
    }

    // v4.2 Wall-Mounted 1F Master Circuit Breaker: Bolted FLUSH on the Central Ritual Vault's West Exterior Stone Wall!
    // Hallway tile (7, 7) stays 100% open and walkable!
    const tilePos = gridToWorld(state.masterBreakerPos.x, state.masterBreakerPos.y, 0);
    const wallMountPos = gridToWorld(state.masterBreakerPos.wallMountX, state.masterBreakerPos.wallMountY, 0);

    masterBreakerGroup = new THREE.Group();
    masterBreakerGroup.position.set(wallMountPos.x, wallMountPos.y, wallMountPos.z);

    // Subtle flat floor chevron ring on the adjacent walkable tile (7, 7)
    const hazardRing = new THREE.Mesh(
        new THREE.RingGeometry(0.32, 0.58, 24),
        new THREE.MeshBasicMaterial({ color: 0xfbbf24, side: THREE.DoubleSide, transparent: true, opacity: 0.65 })
    );
    hazardRing.rotateX(-Math.PI / 2);
    hazardRing.position.set(tilePos.x - wallMountPos.x, 0.03, 0);
    masterBreakerGroup.add(hazardRing);

    // Wall-mounted steel electrical cabinet bolted flush against the Vault's West Wall (facing West toward x=7)
    const breakerBox = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 1.25, 0.68),
        new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0x7f1d1d, roughness: 0.35, metalness: 0.55 })
    );
    breakerBox.position.set(-0.08, 1.25, 0);
    breakerBox.userData = { isMasterBreaker: true };
    masterBreakerGroup.add(breakerBox);

    const breakerLever = new THREE.Mesh(
        new THREE.BoxGeometry(0.26, 0.48, 0.16),
        new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xb45309 })
    );
    breakerLever.position.set(-0.22, 1.32, 0);
    breakerLever.userData = { isMasterBreaker: true };
    masterBreakerGroup.add(breakerLever);

    const breakerBadge = create3DBadgeSprite('⚡ VAULT WALL BREAKER', 'rgba(127, 29, 29, 0.95)', '#fbbf24', '#fef08a', 2.85, 0.62);
    breakerBadge.position.set(-0.15, 2.38, 0);
    masterBreakerGroup.add(breakerBadge);
    masterBreakerGroup.userData = { hazardRing, breakerLever, isMasterBreaker: true };
    floorGroups[0].add(masterBreakerGroup);

    // Build 3D Staircases for 2-Story Map
    for (const st of mapDef.stairs) {
        const pos1 = gridToWorld(st.fromX, st.fromY, 0);
        const stairGroup = new THREE.Group();
        for (let step = 0; step < 6; step++) {
            const stepMesh = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 0.25, 0.35),
                new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.3 })
            );
            stepMesh.position.set(pos1.x, step * 0.32 + 0.15, pos1.z - 0.6 + step * 0.24);
            stepMesh.userData = { isStairs: true };
            stairGroup.add(stepMesh);
        }
        floorGroups[0].add(stairGroup);

        const pos2 = gridToWorld(st.toX, st.toY, 1);
        const landingRing = new THREE.Mesh(
            new THREE.RingGeometry(0.45, 0.78, 24),
            new THREE.MeshBasicMaterial({ color: 0xfbbf24, side: THREE.DoubleSide })
        );
        landingRing.rotateX(-Math.PI / 2);
        landingRing.position.set(pos2.x, FLOOR_HEIGHT_3D + 0.05, pos2.z);
        landingRing.userData = { isStairs: true };
        floorGroups[1].add(landingRing);
    }

    // Build Disguised Secret Passages + Glowing 3D Vertical Dotted Light-Tubes (1F <-> 2F)
    for (const pair of mapDef.passages) {
        for (const ep of pair.endpoints) {
            const pos = gridToWorld(ep.x, ep.y, ep.floor);
            const g = new THREE.Group();
            g.position.set(pos.x, pos.y, pos.z);

            const scrapeGeo = new THREE.RingGeometry(0.35, 0.85, 24, 1, 0, Math.PI);
            scrapeGeo.rotateX(-Math.PI / 2);
            const scrapeMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.45, side: THREE.DoubleSide });
            const scrapeMesh = new THREE.Mesh(scrapeGeo, scrapeMat);
            scrapeMesh.position.y = 0.03;
            g.add(scrapeMesh);
            scrapeMarkMeshes[`${pair.pairId}_${ep.roomId}`] = scrapeMesh;

            const pivot = new THREE.Mesh(
                new THREE.BoxGeometry(0.88, 1.55, 0.48),
                new THREE.MeshStandardMaterial({ color: 0x2dd4bf, emissive: 0x0f766e, metalness: 0.5, roughness: 0.25 })
            );
            pivot.position.y = 0.78;
            pivot.userData = { isSecretPassage: true, pairId: pair.pairId, roomId: ep.roomId };
            g.add(pivot);

            const epBadge = create3DBadgeSprite(
                ep.floor !== ep.targetFloor ? `⇅ ${ep.triggerName.toUpperCase()}` : `⇄ ${ep.triggerName.toUpperCase()}`,
                'rgba(19, 78, 74, 0.92)',
                '#2dd4bf',
                '#99f6e4',
                3.1,
                0.66
            );
            epBadge.position.set(0, 1.92, 0);
            g.add(epBadge);

            g.userData = { pivotGroup: pivot, epBadge };
            floorGroups[ep.floor].add(g);
            secretTriggerMeshes[`${pair.pairId}_${ep.roomId}`] = g;
        }

        const ep0 = pair.endpoints[0];
        const ep1 = pair.endpoints[1];
        if (ep0 && ep1 && ep0.floor !== ep1.floor) {
            const pStart = gridToWorld(ep0.x, ep0.y, ep0.floor);
            const pEnd = gridToWorld(ep1.x, ep1.y, ep1.floor);
            const shaftGroup = new THREE.Group();
            const dots = [];
            const numDots = 14;
            for (let i = 0; i <= numDots; i++) {
                const frac = i / numDots;
                const dx = pStart.x + (pEnd.x - pStart.x) * frac;
                const dy = (pStart.y + 0.5) + ((pEnd.y + 0.8) - (pStart.y + 0.5)) * frac;
                const dz = pStart.z + (pEnd.z - pStart.z) * frac;

                const dotMesh = new THREE.Mesh(
                    new THREE.SphereGeometry(i % 2 === 0 ? 0.16 : 0.11, 10, 10),
                    new THREE.MeshBasicMaterial({
                        color: i % 2 === 0 ? 0x2dd4bf : 0xfbbf24,
                        transparent: true,
                        opacity: 0.85
                    })
                );
                dotMesh.position.set(dx, dy, dz);
                dotMesh.userData = { baseFrac: frac, pStart, pEnd };
                shaftGroup.add(dotMesh);
                dots.push(dotMesh);
            }

            [0.25, 0.5, 0.75].forEach(f => {
                const rx = pStart.x + (pEnd.x - pStart.x) * f;
                const ry = (pStart.y + 0.5) + ((pEnd.y + 0.8) - (pStart.y + 0.5)) * f;
                const rz = pStart.z + (pEnd.z - pStart.z) * f;
                const ring = new THREE.Mesh(
                    new THREE.RingGeometry(0.32, 0.46, 20),
                    new THREE.MeshBasicMaterial({ color: 0x2dd4bf, side: THREE.DoubleSide, transparent: true, opacity: 0.55 })
                );
                ring.rotateX(-Math.PI / 2);
                ring.position.set(rx, ry, rz);
                shaftGroup.add(ring);
            });

            shaftGroup.userData = { dots, pairId: pair.pairId };
            architectureGroup.add(shaftGroup);
            verticalShaftGroups[pair.pairId] = shaftGroup;
        }
    }
}

// Spawn a 3D Glowing Ectoplasm Footprint Ring when the Ghost steps on a tile
function spawnGhostFootprint3D(floor, gx, gy, rotY) {
    if (!scene) return;
    const pos = gridToWorld(gx, gy, floor);
    const footGroup = new THREE.Group();
    footGroup.position.set(pos.x, pos.y + 0.03, pos.z);
    footGroup.rotation.y = rotY;

    const slimeMat = new THREE.MeshBasicMaterial({
        color: 0x2dd4bf,
        transparent: true,
        opacity: 0.72,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    const ringGeo = new THREE.RingGeometry(0.18, 0.44, 18);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMesh = new THREE.Mesh(ringGeo, slimeMat);
    footGroup.add(ringMesh);

    const arrowGeo = new THREE.ConeGeometry(0.16, 0.34, 3);
    arrowGeo.rotateX(Math.PI / 2);
    const arrowMesh = new THREE.Mesh(arrowGeo, slimeMat);
    arrowMesh.position.set(0, 0.01, 0.22);
    footGroup.add(arrowMesh);

    scene.add(footGroup);
    ectoplasmFootprintMeshes.push({
        mesh: footGroup,
        mat: slimeMat,
        floor,
        bornTurn: state.turnNumber,
        alpha: 0.72
    });
}

function clearAllGhostFootprints3D() {
    ectoplasmFootprintMeshes.forEach(fp => {
        if (fp.mesh && fp.mesh.parent) fp.mesh.parent.remove(fp.mesh);
    });
    ectoplasmFootprintMeshes = [];
}
