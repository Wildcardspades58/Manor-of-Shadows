/* ============================================================================
 * 5. PROCEDURAL TEXTURES, NORTH-WALL BRASS ROOM HEADERS, STORM WINDOWS & PORTRAITS
 * ============================================================================ */
function createFloorTexture(type) {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const g = c.getContext('2d');

    if (type === 'marble_foyer') {
        for (let y = 0; y < 2; y++) {
            for (let x = 0; x < 2; x++) {
                const isLight = (x + y) % 2 === 0;
                g.fillStyle = isLight ? '#e9d5ff' : '#2e2344';
                g.fillRect(x * 128, y * 128, 128, 128);
            }
        }
    } else if (type === 'checker_kitchen') {
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                g.fillStyle = (x + y) % 2 === 0 ? '#1f4b52' : '#357078';
                g.fillRect(x * 64, y * 64, 64, 64);
            }
        }
    } else if (type === 'herringbone') {
        g.fillStyle = '#573620';
        g.fillRect(0, 0, 256, 256);
        g.strokeStyle = '#382010';
        g.lineWidth = 4;
        for (let i = 0; i < 256; i += 32) {
            g.beginPath(); g.moveTo(0, i); g.lineTo(128, i + 48); g.lineTo(256, i); g.stroke();
        }
    } else if (type === 'wood_warm') {
        g.fillStyle = '#592d2d';
        g.fillRect(0, 0, 256, 256);
        g.fillStyle = 'rgba(251, 146, 60, 0.22)';
        g.fillRect(16, 16, 224, 224);
    } else if (type === 'parquet_gold') {
        g.fillStyle = '#5c3a24';
        g.fillRect(0, 0, 256, 256);
        g.strokeStyle = '#fbbf2488';
        g.lineWidth = 5;
        g.strokeRect(14, 14, 228, 228);
    } else if (type === 'conservatory') {
        g.fillStyle = '#184231';
        g.fillRect(0, 0, 256, 256);
        g.strokeStyle = '#34d39988';
        g.lineWidth = 6;
        g.strokeRect(10, 10, 236, 236);
    } else if (type === 'carpet_study') {
        g.fillStyle = '#0d523f';
        g.fillRect(0, 0, 256, 256);
        g.strokeStyle = '#facc1588';
        g.lineWidth = 6;
        g.strokeRect(16, 16, 224, 224);
    } else if (type === 'ritual_stone') {
        g.fillStyle = '#271736';
        g.fillRect(0, 0, 256, 256);
        g.strokeStyle = '#2dd4bfbb';
        g.lineWidth = 5;
        g.beginPath(); g.arc(128, 128, 92, 0, Math.PI * 2); g.stroke();
    } else {
        g.fillStyle = '#2e2246';
        g.fillRect(0, 0, 256, 256);
        g.fillStyle = '#6b2956';
        g.fillRect(34, 34, 188, 188);
    }
    return new THREE.CanvasTexture(c);
}

function createWainscotWallTexture(isVault = false) {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const g = c.getContext('2d');
    if (isVault) {
        g.fillStyle = '#351c47';
        g.fillRect(0, 0, 256, 256);
        g.strokeStyle = '#fb718588';
        g.lineWidth = 4;
        g.strokeRect(8, 8, 240, 240);
    } else {
        g.fillStyle = '#433260';
        g.fillRect(0, 0, 256, 150);
        g.fillStyle = '#d97706';
        g.fillRect(0, 146, 256, 10);
        g.fillStyle = '#54331d';
        g.fillRect(0, 156, 256, 100);
    }
    return new THREE.CanvasTexture(c);
}

// Gothic Storm Window Glass Texture with Rain Streaks & Leaded Mullions
function createStormWindowTexture() {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 256;
    const g = c.getContext('2d');

    const grad = g.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#38bdf8');
    grad.addColorStop(0.5, '#1d4ed8');
    grad.addColorStop(1, '#0f172a');
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 256);

    // Diagonal rain streaks on the windowpane
    g.strokeStyle = 'rgba(224, 242, 254, 0.55)';
    g.lineWidth = 2;
    for (let i = 0; i < 28; i++) {
        const rx = (i * 23) % 120;
        const ry = (i * 37) % 230;
        g.beginPath();
        g.moveTo(rx, ry);
        g.lineTo(rx - 8, ry + 24);
        g.stroke();
    }

    // Gothic leaded mullions
    g.strokeStyle = '#1e1b2e';
    g.lineWidth = 6;
    g.strokeRect(4, 4, 120, 248);
    g.beginPath();
    g.moveTo(64, 0); g.lineTo(64, 256);
    g.moveTo(0, 85); g.lineTo(128, 85);
    g.moveTo(0, 170); g.lineTo(128, 170);
    g.stroke();

    return new THREE.CanvasTexture(c);
}

function create3DBadgeSprite(labelText, bgFill = 'rgba(18, 13, 34, 0.92)', borderHex = '#fbbf24', textColor = '#fde68a', scaleX = 3.2, scaleY = 0.72) {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 128;
    const g = c.getContext('2d');

    g.fillStyle = bgFill;
    g.beginPath();
    g.roundRect(14, 18, 484, 92, 44);
    g.fill();

    g.strokeStyle = borderHex;
    g.lineWidth = 7;
    g.stroke();

    g.font = 'bold 34px Fredoka, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = textColor;
    g.fillText(labelText, 256, 66);

    const tex = new THREE.CanvasTexture(c);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(scaleX, scaleY, 1);
    return sprite;
}

// v4.2 Slim North-Wall Brass Architectural Header (Pinned to North Wall & Auto-Fades to 25% when inside room!)
function createRoomNameplateSprite(room) {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 112;
    const g = c.getContext('2d');

    const accentStr = '#' + room.accentHex.toString(16).padStart(6, '0');

    // Sleek Brass-Trimmed Architectural Plaque
    g.fillStyle = 'rgba(14, 10, 26, 0.90)';
    g.beginPath();
    g.roundRect(24, 16, 464, 80, 22);
    g.fill();

    // Outer Brass Frame + Inner Room Accent Line
    g.strokeStyle = '#fbbf24';
    g.lineWidth = 4;
    g.stroke();

    g.strokeStyle = accentStr;
    g.lineWidth = 3;
    g.beginPath();
    g.roundRect(32, 24, 448, 64, 16);
    g.stroke();

    // Brass Corner Rivets
    g.fillStyle = '#fde68a';
    [[42, 34], [470, 34], [42, 78], [470, 78]].forEach(([rx, ry]) => {
        g.beginPath();
        g.arc(rx, ry, 4, 0, Math.PI * 2);
        g.fill();
    });

    // Crisp Room Icon + Title
    g.font = 'bold 31px Fredoka, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = '#fef3c7';
    g.fillText(`${room.icon} ${room.name.toUpperCase()}`, 256, 57);

    const tex = new THREE.CanvasTexture(c);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.9, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    // Compact architectural header scale so it never covers room furniture or chandeliers
    sprite.scale.set(2.9, 0.64, 1);
    return sprite;
}

function paintSuspectPortraitCanvas(suspect) {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const g = c.getContext('2d');

    const grad = g.createRadialGradient(128, 105, 18, 128, 128, 140);
    grad.addColorStop(0, suspect.portraitColor);
    grad.addColorStop(1, '#0f0a19');
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);

    g.strokeStyle = '#f59e0b';
    g.lineWidth = 14;
    g.strokeRect(7, 7, 242, 242);

    g.fillStyle = '#1e1b2e';
    g.beginPath();
    g.arc(128, 210, 68, Math.PI, 0, false);
    g.fill();

    g.fillStyle = suspect.skinColor;
    g.beginPath();
    g.arc(128, 112, 40, 0, Math.PI * 2);
    g.fill();

    g.fillStyle = suspect.hairColor;
    g.beginPath();
    g.arc(128, 98, 42, Math.PI, 0, false);
    g.fill();

    g.fillStyle = '#ffffff';
    g.beginPath();
    g.arc(113, 112, 8, 0, Math.PI * 2);
    g.arc(143, 112, 8, 0, Math.PI * 2);
    g.fill();

    g.fillStyle = '#090514';
    g.beginPath();
    g.arc(114, 112, 4, 0, Math.PI * 2);
    g.arc(144, 112, 4, 0, Math.PI * 2);
    g.fill();

    g.fillStyle = 'rgba(13, 9, 22, 0.92)';
    g.fillRect(20, 198, 216, 42);
    g.strokeStyle = '#fbbf24';
    g.lineWidth = 2;
    g.strokeRect(20, 198, 216, 42);

    g.font = 'bold 20px Fredoka, sans-serif';
    g.textAlign = 'center';
    g.fillStyle = '#fde68a';
    g.fillText(suspect.name, 128, 224);

    return c;
}

// Paint Full-Screen Jump Scare Phantom Face
function drawJumpScareCanvas(scareMode) {
    const c = document.getElementById('jumpScareCanvas');
    if (!c) return;
    const g = c.getContext('2d');
    g.clearRect(0, 0, 280, 280);

    const grad = g.createRadialGradient(140, 140, 20, 140, 140, 140);
    grad.addColorStop(0, scareMode === 'full' ? '#dc2626' : '#2dd4bf');
    grad.addColorStop(1, '#090412');
    g.fillStyle = grad;
    g.fillRect(0, 0, 280, 280);

    // Spectral Shroud Head
    g.fillStyle = scareMode === 'full' ? '#1e1b2e' : '#134e4a';
    g.beginPath();
    g.arc(140, 135, 95, 0, Math.PI * 2);
    g.fill();

    // Glowing Eyes
    g.fillStyle = scareMode === 'full' ? '#ef4444' : '#fef08a';
    g.beginPath();
    g.arc(102, 118, 22, 0, Math.PI * 2);
    g.arc(178, 118, 22, 0, Math.PI * 2);
    g.fill();

    g.fillStyle = '#ffffff';
    g.beginPath();
    g.arc(102, 118, 8, 0, Math.PI * 2);
    g.arc(178, 118, 8, 0, Math.PI * 2);
    g.fill();

    // Roaring Spectral Jaw
    g.fillStyle = '#05020a';
    g.beginPath();
    g.ellipse(140, 190, 42, scareMode === 'full' ? 46 : 28, 0, 0, Math.PI * 2);
    g.fill();

    if (scareMode === 'full') {
        g.fillStyle = '#f8fafc';
        for (let x = 108; x <= 172; x += 16) {
            g.beginPath();
            g.moveTo(x, 154); g.lineTo(x + 8, 174); g.lineTo(x + 16, 154);
            g.fill();
        }
    }
}
