/* ============================================================================
 * 2. 4 PLAYABLE HEROES, 8 OVERLAPPING SUSPECTS, GADGETS & MANSION MAPS
 * ============================================================================ */
const CHARACTERS = [
    {
        id: 'sleuth',
        name: 'Milo the Sleuth',
        shortName: 'Milo',
        emoji: '🕵️',
        color: '#c084fc',
        suitHex: 0x7e22ce,
        capeHex: 0x581c87,
        hatType: 'deerstalker',
        badge: '+1 Dice & Reach',
        maxHearts: 3,
        diceBonus: 1,
        minRoll: 1,
        searchRange: 2,
        skillName: 'Eagle Eye',
        skillIcon: 'visibility',
        description: 'Deerstalker cap & magnifier. Adds +1 to every Dice Roll and searches props from 2 tiles away.',
        skillDesc: 'Highlights the nearest True Clue prop in gold (3-turn cooldown).'
    },
    {
        id: 'sprinter',
        name: 'Zoe the Sprinter',
        shortName: 'Zoe',
        emoji: '👟',
        color: '#2dd4bf',
        suitHex: 0x0d9488,
        capeHex: 0x115e59,
        hatType: 'visor',
        badge: 'Min Roll 3 + Dash',
        maxHearts: 3,
        diceBonus: 0,
        minRoll: 3,
        searchRange: 1,
        skillName: 'Turbo Dash',
        skillIcon: 'sprint',
        description: 'Varsity jacket & winged sneakers. Never rolls lower than a 3 on the dice!',
        skillDesc: 'Instantly gain +3 Bonus Action Points this turn (3-turn cooldown).'
    },
    {
        id: 'medium',
        name: 'Luna the Medium',
        shortName: 'Luna',
        emoji: '🔮',
        color: '#fbbf24',
        suitHex: 0xd97706,
        capeHex: 0x78350f,
        hatType: 'witch',
        badge: '4 Hearts & Ward',
        maxHearts: 4,
        diceBonus: 0,
        minRoll: 2,
        searchRange: 1,
        skillName: 'Ecto Ward',
        skillIcon: 'shield_moon',
        description: 'Mystic witch hat & orb staff. Starts with 4 Hearts and senses teal aura rings on True Clues.',
        skillDesc: 'Banishes the Ghost across the house & lowers Dread -30% (3-turn cooldown).'
    },
    {
        id: 'inventor',
        name: 'Theo the Inventor',
        shortName: 'Theo',
        emoji: '🥽',
        color: '#38bdf8',
        suitHex: 0x0284c7,
        capeHex: 0x075985,
        hatType: 'goggles',
        badge: 'Free Gadget + Blueprint',
        maxHearts: 3,
        diceBonus: 0,
        minRoll: 2,
        searchRange: 1,
        skillName: 'Gadget Craft',
        skillIcon: 'precision_manufacturing',
        description: 'Brass steampunk goggles. Starts with a Pocket Salt gadget & spots Secret Passages from 3 tiles away!',
        skillDesc: 'Crafts a random Haunted Pocket Gadget immediately (3-turn cooldown).'
    }
];

// 8-Suspect Overlapping Trait Matrix (2^3 = 8 exact combinations of Era, Sign, Relic!)
const SUSPECTS = [
    {
        id: 'evelyn',
        name: 'Lady Evelyn',
        title: 'The Poison Botanist',
        roomId: 'conservatory',
        emoji: '🌿',
        portraitColor: '#10b981',
        skinColor: '#fde68a',
        hairColor: '#7c2d12',
        accessory: 'emerald_vines',
        traits: { era: 'Colonial 1700s', curse: 'Freezing Frost', relic: 'Silver Locket' }
    },
    {
        id: 'alistair',
        name: 'Lord Alistair',
        title: 'The Greedy Aristocrat',
        roomId: 'dining',
        emoji: '🎩',
        portraitColor: '#f97316',
        skinColor: '#fed7aa',
        hairColor: '#475569',
        accessory: 'tophat_monocle',
        traits: { era: 'Colonial 1700s', curse: 'Freezing Frost', relic: 'Crystal Vial' }
    },
    {
        id: 'marcel',
        name: 'Chef Marcel',
        title: 'The Phantom Sous-Chef',
        roomId: 'kitchen',
        emoji: '👨‍🍳',
        portraitColor: '#14b8a6',
        skinColor: '#fde68a',
        hairColor: '#1e293b',
        accessory: 'chef_toque',
        traits: { era: 'Colonial 1700s', curse: 'Cursed Melody', relic: 'Silver Locket' }
    },
    {
        id: 'victor',
        name: 'Maestro Victor',
        title: 'The Midnight Composer',
        roomId: 'ballroom',
        emoji: '🎼',
        portraitColor: '#ec4899',
        skinColor: '#e2e8f0',
        hairColor: '#581c87',
        accessory: 'baton_music',
        traits: { era: 'Colonial 1700s', curse: 'Cursed Melody', relic: 'Crystal Vial' }
    },
    {
        id: 'vance',
        name: 'Professor Vance',
        title: 'The Occult Archivist',
        roomId: 'library',
        emoji: '👓',
        portraitColor: '#a855f7',
        skinColor: '#fed7aa',
        hairColor: '#94a3b8',
        accessory: 'spectacles_tome',
        traits: { era: 'Victorian 1800s', curse: 'Freezing Frost', relic: 'Silver Locket' }
    },
    {
        id: 'sterling',
        name: 'Captain Sterling',
        title: 'The Cursed Navigator',
        roomId: 'study',
        emoji: '⚓',
        portraitColor: '#eab308',
        skinColor: '#fdba74',
        hairColor: '#334155',
        accessory: 'tricorn_compass',
        traits: { era: 'Victorian 1800s', curse: 'Freezing Frost', relic: 'Crystal Vial' }
    },
    {
        id: 'helena',
        name: 'Duchess Helena',
        title: 'The Clocktower Heiress',
        roomId: 'clocktower',
        fallbackRoomId: 'foyer',
        emoji: '🕰️',
        portraitColor: '#38bdf8',
        skinColor: '#fef08a',
        hairColor: '#1e1b4b',
        accessory: 'emerald_vines',
        traits: { era: 'Victorian 1800s', curse: 'Cursed Melody', relic: 'Silver Locket' }
    },
    {
        id: 'mordecai',
        name: 'Dr. Mordecai',
        title: 'The Mad Alchemist',
        roomId: 'alchemy',
        fallbackRoomId: 'gallery',
        emoji: '🧪',
        portraitColor: '#a3e635',
        skinColor: '#d9f99d',
        hairColor: '#3f6212',
        accessory: 'spectacles_tome',
        traits: { era: 'Victorian 1800s', curse: 'Cursed Melody', relic: 'Crystal Vial' }
    }
];

const POCKET_GADGETS = [
    { id: 'salt', name: 'Pocket Salt', emoji: '🧂', desc: 'Drops a Salt Ward on your tile that blocks the Ghost for 2 rounds!' },
    { id: 'skates', name: 'Winged Skates', emoji: '🛼', desc: 'Instantly grants +4 Bonus Action Points!' },
    { id: 'decoy', name: 'Ghost Decoy', emoji: '📻', desc: 'Lures the Ghost to the Central Vault for 2 turns!' }
];

const BONUS_HEIRLOOMS = [
    { id: 'will', name: 'The Stolen Blackwood Will', emoji: '📜' },
    { id: 'musicbox', name: 'Gilded Starlight Music Box', emoji: '👑' },
    { id: 'elixir', name: 'Vial of Eternal Aether', emoji: '⚗️' }
];

const GRID_COLS = 19;
const GRID_ROWS = 15;
const TILE_SIZE = 2.0;
const FLOOR_HEIGHT_3D = 4.6;

const MAP_DEFINITIONS = {
    blackwood: {
        id: 'blackwood',
        name: 'Blackwood Manor (1-Story Classic)',
        floors: 1,
        rooms: [
            { id: 'conservatory', name: 'Conservatory', icon: '🌿', floor: 0, x1: 1, y1: 1, x2: 5, y2: 4, floorType: 'conservatory', accentHex: 0x10b981, portraitWall: { x: 3, y: 1 } },
            { id: 'dining', name: 'Formal Dining', icon: '🍽️', floor: 0, x1: 1, y1: 5, x2: 5, y2: 9, floorType: 'wood_warm', accentHex: 0xf97316, portraitWall: { x: 2, y: 5 } },
            { id: 'kitchen', name: 'Gourmet Kitchen', icon: '🍲', floor: 0, x1: 1, y1: 10, x2: 5, y2: 13, floorType: 'checker_kitchen', accentHex: 0x14b8a6, portraitWall: { x: 2, y: 10 } },
            { id: 'gallery', name: 'North Gallery', icon: '🕯️', floor: 0, x1: 7, y1: 1, x2: 11, y2: 3, floorType: 'parquet_gold', accentHex: 0xa3e635, portraitWall: { x: 9, y: 1 } },
            { id: 'vault', name: 'Central Ritual Vault', icon: '🔒', floor: 0, x1: 8, y1: 5, x2: 10, y2: 8, floorType: 'ritual_stone', accentHex: 0xf43f5e, isLockedVault: true },
            { id: 'foyer', name: 'Grand Foyer', icon: '🏛️', floor: 0, x1: 7, y1: 11, x2: 11, y2: 13, floorType: 'marble_foyer', accentHex: 0x38bdf8, portraitWall: { x: 7, y: 11 } },
            { id: 'ballroom', name: 'Grand Ballroom', icon: '🎹', floor: 0, x1: 13, y1: 1, x2: 17, y2: 4, floorType: 'parquet_gold', accentHex: 0xec4899, portraitWall: { x: 15, y: 1 } },
            { id: 'library', name: 'Two-Story Library', icon: '📚', floor: 0, x1: 13, y1: 5, x2: 17, y2: 9, floorType: 'herringbone', accentHex: 0xa855f7, portraitWall: { x: 16, y: 5 } },
            { id: 'study', name: 'Master Study', icon: '🎱', floor: 0, x1: 13, y1: 10, x2: 17, y2: 13, floorType: 'carpet_study', accentHex: 0xeab308, portraitWall: { x: 16, y: 10 } }
        ],
        doorways: [
            { floor: 0, x1: 3, y1: 4, x2: 3, y2: 5 },
            { floor: 0, x1: 5, y1: 3, x2: 6, y2: 3 },
            { floor: 0, x1: 5, y1: 7, x2: 6, y2: 7 },
            { floor: 0, x1: 3, y1: 9, x2: 3, y2: 10 },
            { floor: 0, x1: 5, y1: 11, x2: 6, y2: 11 },
            { floor: 0, x1: 9, y1: 3, x2: 9, y2: 4 },
            { floor: 0, x1: 13, y1: 3, x2: 12, y2: 3 },
            { floor: 0, x1: 15, y1: 4, x2: 15, y2: 5 },
            { floor: 0, x1: 13, y1: 7, x2: 12, y2: 7 },
            { floor: 0, x1: 15, y1: 9, x2: 15, y2: 10 },
            { floor: 0, x1: 13, y1: 11, x2: 12, y2: 11 },
            { floor: 0, x1: 8, y1: 11, x2: 8, y2: 10 },
            { floor: 0, x1: 9, y1: 11, x2: 9, y2: 10 },
            { floor: 0, x1: 10, y1: 11, x2: 10, y2: 10 },
            { floor: 0, x1: 7, y1: 12, x2: 6, y2: 12 },
            { floor: 0, x1: 11, y1: 12, x2: 12, y2: 12 }
        ],
        stairs: [],
        passages: [
            {
                pairId: 'pairA',
                name: 'Gargoyle & False Bookcase Passage',
                blueprintTitle: 'Blueprint A: The Scholar’s Vine Tunnel',
                blueprintNote: 'Pull the Stone Gargoyle wing in the Conservatory (1F) to warp to the Master Study False Bookcase (1F)!',
                endpoints: [
                    { roomId: 'conservatory', floor: 0, x: 1, y: 1, targetRoomId: 'study', targetFloor: 0, targetX: 17, targetY: 12, triggerName: 'Stone Gargoyle Lever', visualClue: 'Muddy footprints & worn wing', type: 'gargoyle' },
                    { roomId: 'study', floor: 0, x: 17, y: 12, targetRoomId: 'conservatory', targetFloor: 0, targetX: 1, targetY: 1, triggerName: 'Revolving False Bookcase', visualClue: 'Floor scrape marks & cool draft', type: 'false_bookcase' }
                ]
            },
            {
                pairId: 'pairB',
                name: 'Dumbwaiter & Stage Sconce Lift',
                blueprintTitle: 'Blueprint B: The Banquet Service Shaft',
                blueprintNote: 'Ride the Brass Dumbwaiter in the Gourmet Kitchen (1F) straight to the Grand Ballroom Stage Curtain (1F)!',
                endpoints: [
                    { roomId: 'kitchen', floor: 0, x: 1, y: 13, targetRoomId: 'ballroom', targetFloor: 0, targetX: 17, targetY: 1, triggerName: 'Brass Dumbwaiter Pulley', visualClue: 'Chalk label & taut pulley rope', type: 'dumbwaiter' },
                    { roomId: 'ballroom', floor: 0, x: 17, y: 1, targetRoomId: 'kitchen', targetFloor: 0, targetX: 1, targetY: 13, triggerName: 'Tilted Brass Sconce', visualClue: '45° tilted candle lever', type: 'tilted_sconce' }
                ]
            }
        ],
        props: [
            { id: 'p1', roomId: 'conservatory', floor: 0, x: 4, y: 2, name: 'Snapping Venus Flytrap', emoji: '🪴', type: 'flytrap', animType: 'snap' },
            { id: 'p2', roomId: 'conservatory', floor: 0, x: 2, y: 3, name: 'Gargoyle Fountain', emoji: '⛲', type: 'terrarium', animType: 'bubble' },
            { id: 'p3', roomId: 'dining', floor: 0, x: 3, y: 7, name: '12-Seat Banquet Table', emoji: '🍽️', type: 'banquet', animType: 'cloche_float' },
            { id: 'p4', roomId: 'dining', floor: 0, x: 4, y: 6, name: 'Glass China Hutch', emoji: '🫖', type: 'hutch', animType: 'shake' },
            { id: 'p5', roomId: 'kitchen', floor: 0, x: 2, y: 12, name: 'Cast-Iron Cauldron Stove', emoji: '🍲', type: 'stove', animType: 'cauldron' },
            { id: 'p6', roomId: 'kitchen', floor: 0, x: 4, y: 12, name: 'Butcher Block & Cleaver', emoji: '🔪', type: 'butcher', animType: 'cleaver_chop' },
            { id: 'p7', roomId: 'ballroom', floor: 0, x: 14, y: 2, name: 'Concert Grand Piano', emoji: '🎹', type: 'piano', animType: 'piano_notes' },
            { id: 'p8', roomId: 'ballroom', floor: 0, x: 16, y: 3, name: 'Gilded Harp & Horn', emoji: '🪉', type: 'harp', animType: 'sway' },
            { id: 'p9', roomId: 'library', floor: 0, x: 16, y: 6, name: 'Haunted Bookcase', emoji: '📚', type: 'bookshelf', animType: 'flying_books' },
            { id: 'p10', roomId: 'library', floor: 0, x: 14, y: 8, name: 'Spinning World Globe', emoji: '🌍', type: 'globe_desk', animType: 'globe_spin' },
            { id: 'p11', roomId: 'study', floor: 0, x: 14, y: 12, name: 'Green-Felt Billiards Table', emoji: '🎱', type: 'billiards', animType: 'pool_balls' },
            { id: 'p12', roomId: 'study', floor: 0, x: 16, y: 11, name: 'Executive Clawfoot Desk', emoji: '📜', type: 'claw_desk', animType: 'float' },
            { id: 'p13', roomId: 'gallery', floor: 0, x: 10, y: 2, name: 'Cursed Suit of Armor', emoji: '⚔️', type: 'hutch', animType: 'shake' },
            { id: 'p14', roomId: 'foyer', floor: 0, x: 11, y: 11, name: 'Grandfather Clock', emoji: '🕰️', type: 'bookshelf', animType: 'shake' }
        ]
    },

    ravenwood: {
        id: 'ravenwood',
        name: 'Ravenwood Clocktower (2-Story Estate)',
        floors: 2,
        rooms: [
            // 1F GROUND FLOOR
            { id: 'conservatory', name: '1F Conservatory', icon: '🌿', floor: 0, x1: 1, y1: 1, x2: 5, y2: 5, floorType: 'conservatory', accentHex: 0x10b981, portraitWall: { x: 3, y: 1 } },
            { id: 'dining', name: '1F Formal Dining', icon: '🍽️', floor: 0, x1: 1, y1: 6, x2: 5, y2: 9, floorType: 'wood_warm', accentHex: 0xf97316, portraitWall: { x: 2, y: 6 } },
            { id: 'kitchen', name: '1F Gourmet Kitchen', icon: '🍲', floor: 0, x1: 1, y1: 10, x2: 5, y2: 13, floorType: 'checker_kitchen', accentHex: 0x14b8a6, portraitWall: { x: 2, y: 10 } },
            { id: 'vault', name: '1F Ritual Vault', icon: '🔒', floor: 0, x1: 8, y1: 5, x2: 10, y2: 8, floorType: 'ritual_stone', accentHex: 0xf43f5e, isLockedVault: true },
            { id: 'foyer', name: '1F Grand Foyer', icon: '🏛️', floor: 0, x1: 7, y1: 11, x2: 11, y2: 13, floorType: 'marble_foyer', accentHex: 0x38bdf8 },
            { id: 'ballroom', name: '1F Grand Ballroom', icon: '🎹', floor: 0, x1: 13, y1: 1, x2: 17, y2: 6, floorType: 'parquet_gold', accentHex: 0xec4899, portraitWall: { x: 15, y: 1 } },
            { id: 'library', name: '1F Grand Library', icon: '📚', floor: 0, x1: 13, y1: 8, x2: 17, y2: 13, floorType: 'herringbone', accentHex: 0xa855f7, portraitWall: { x: 16, y: 8 } },

            // 2F UPPER FLOOR
            { id: 'clocktower', name: '2F Clocktower Attic', icon: '🕰️', floor: 1, x1: 7, y1: 1, x2: 11, y2: 5, floorType: 'parquet_gold', accentHex: 0x38bdf8, portraitWall: { x: 9, y: 1 } },
            { id: 'alchemy', name: '2F Alchemy Lab', icon: '🧪', floor: 1, x1: 1, y1: 2, x2: 5, y2: 7, floorType: 'checker_kitchen', accentHex: 0xa3e635, portraitWall: { x: 3, y: 2 } },
            { id: 'study', name: '2F Master Study', icon: '🎱', floor: 1, x1: 13, y1: 2, x2: 17, y2: 7, floorType: 'carpet_study', accentHex: 0xeab308, portraitWall: { x: 15, y: 2 } },
            { id: 'balcony', name: '2F Upper Landing', icon: '🕯️', floor: 1, x1: 7, y1: 9, x2: 11, y2: 12, floorType: 'marble_foyer', accentHex: 0xc084fc }
        ],
        doorways: [
            // 1F Doors
            { floor: 0, x1: 3, y1: 5, x2: 3, y2: 6 },
            { floor: 0, x1: 5, y1: 3, x2: 6, y2: 3 },
            { floor: 0, x1: 5, y1: 7, x2: 6, y2: 7 },
            { floor: 0, x1: 3, y1: 9, x2: 3, y2: 10 },
            { floor: 0, x1: 5, y1: 11, x2: 6, y2: 11 },
            { floor: 0, x1: 13, y1: 3, x2: 12, y2: 3 },
            { floor: 0, x1: 13, y1: 10, x2: 12, y2: 10 },
            { floor: 0, x1: 8, y1: 11, x2: 8, y2: 10 },
            { floor: 0, x1: 9, y1: 11, x2: 9, y2: 10 },
            { floor: 0, x1: 10, y1: 11, x2: 10, y2: 10 },
            { floor: 0, x1: 7, y1: 12, x2: 6, y2: 12 },
            { floor: 0, x1: 11, y1: 12, x2: 12, y2: 12 },
            // 2F Doors
            { floor: 1, x1: 9, y1: 5, x2: 9, y2: 6 },
            { floor: 1, x1: 5, y1: 5, x2: 6, y2: 5 },
            { floor: 1, x1: 13, y1: 5, x2: 12, y2: 5 },
            { floor: 1, x1: 9, y1: 9, x2: 9, y2: 8 },
            { floor: 1, x1: 7, y1: 10, x2: 6, y2: 10 },
            { floor: 1, x1: 11, y1: 10, x2: 12, y2: 10 }
        ],
        stairs: [
            {
                id: 'grand_stairs',
                name: 'Grand Foyer Staircase',
                fromFloor: 0, fromX: 9, fromY: 10,
                toFloor: 1, toX: 9, toY: 10
            },
            {
                id: 'service_stairs',
                name: 'West Wing Service Stairs',
                fromFloor: 0, fromX: 6, fromY: 2,
                toFloor: 1, toX: 6, toY: 2
            }
        ],
        passages: [
            {
                pairId: 'pairA',
                name: 'West Wing Vertical Shaft: 1F Kitchen ⇅ 2F Alchemy Lab',
                blueprintTitle: 'Blueprint A: West Wing Vertical Shaft (1F ⇅ 2F)',
                blueprintNote: 'Ride the Brass Dumbwaiter Lift in the 1F Gourmet Kitchen straight up the vertical shaft into the 2F Alchemy Lab Apothecary Service Hatch!',
                isVertical: true,
                endpoints: [
                    { roomId: 'kitchen', floor: 0, x: 1, y: 13, targetRoomId: 'alchemy', targetFloor: 1, targetX: 1, targetY: 2, triggerName: 'Brass Dumbwaiter Lift (⇅ 2F Alchemy)', visualClue: 'Vertical brass lift shaft to 2F Alchemy Lab', type: 'dumbwaiter' },
                    { roomId: 'alchemy', floor: 1, x: 1, y: 2, targetRoomId: 'kitchen', targetFloor: 0, targetX: 1, targetY: 13, triggerName: 'Apothecary Service Hatch (⇅ 1F Kitchen)', visualClue: 'Counterweight hatch down to 1F Kitchen', type: 'dumbwaiter' }
                ]
            },
            {
                pairId: 'pairB',
                name: 'East Wing Spiral Chute: 1F Library ⇅ 2F Clocktower Attic',
                blueprintTitle: 'Blueprint B: East Wing Spiral Chute (1F ⇅ 2F)',
                blueprintNote: 'Pivot the Revolving False Bookcase in the 1F Grand Library to ascend the hidden spiral chute into the 2F Clocktower Attic Hidden Pendulum Trapdoor!',
                isVertical: true,
                endpoints: [
                    { roomId: 'library', floor: 0, x: 17, y: 12, targetRoomId: 'clocktower', targetFloor: 1, targetX: 10, targetY: 2, triggerName: 'Revolving False Bookcase (⇅ 2F Attic)', visualClue: 'Floor scrape marks & spiral chute to 2F', type: 'false_bookcase' },
                    { roomId: 'clocktower', floor: 1, x: 10, y: 2, targetRoomId: 'library', targetFloor: 0, targetX: 17, targetY: 12, triggerName: 'Hidden Pendulum Trapdoor (⇅ 1F Library)', visualClue: 'Worn pendulum trapdoor down to 1F Library', type: 'gargoyle' }
                ]
            }
        ],
        props: [
            // 1F Props
            { id: 'p1', roomId: 'conservatory', floor: 0, x: 4, y: 2, name: 'Snapping Venus Flytrap', emoji: '🪴', type: 'flytrap', animType: 'snap' },
            { id: 'p2', roomId: 'conservatory', floor: 0, x: 2, y: 4, name: 'Gargoyle Fountain', emoji: '⛲', type: 'terrarium', animType: 'bubble' },
            { id: 'p3', roomId: 'dining', floor: 0, x: 3, y: 7, name: '12-Seat Banquet Table', emoji: '🍽️', type: 'banquet', animType: 'cloche_float' },
            { id: 'p4', roomId: 'kitchen', floor: 0, x: 3, y: 12, name: 'Cast-Iron Cauldron Stove', emoji: '🍲', type: 'stove', animType: 'cauldron' },
            { id: 'p5', roomId: 'ballroom', floor: 0, x: 14, y: 3, name: 'Concert Grand Piano', emoji: '🎹', type: 'piano', animType: 'piano_notes' },
            { id: 'p6', roomId: 'ballroom', floor: 0, x: 16, y: 4, name: 'Gilded Harp & Horn', emoji: '🪉', type: 'harp', animType: 'sway' },
            { id: 'p7', roomId: 'library', floor: 0, x: 15, y: 9, name: 'Haunted Bookcase', emoji: '📚', type: 'bookshelf', animType: 'flying_books' },
            { id: 'p8', roomId: 'library', floor: 0, x: 14, y: 11, name: 'Spinning World Globe', emoji: '🌍', type: 'globe_desk', animType: 'globe_spin' },
            // 2F Props
            { id: 'p9', roomId: 'clocktower', floor: 1, x: 8, y: 3, name: 'Giant Clockwork Pendulum', emoji: '🕰️', type: 'hutch', animType: 'shake' },
            { id: 'p10', roomId: 'clocktower', floor: 1, x: 10, y: 4, name: 'Celestial Telescope', emoji: '🔭', type: 'globe_desk', animType: 'globe_spin' },
            { id: 'p11', roomId: 'alchemy', floor: 1, x: 2, y: 4, name: 'Bubbling Alembic Table', emoji: '🧪', type: 'stove', animType: 'cauldron' },
            { id: 'p12', roomId: 'alchemy', floor: 1, x: 4, y: 6, name: 'Apothecary Specimen Chest', emoji: '🏺', type: 'claw_desk', animType: 'float' },
            { id: 'p13', roomId: 'study', floor: 1, x: 14, y: 4, name: 'Green-Felt Billiards Table', emoji: '🎱', type: 'billiards', animType: 'pool_balls' },
            { id: 'p14', roomId: 'study', floor: 1, x: 16, y: 6, name: 'Executive Clawfoot Desk', emoji: '📜', type: 'claw_desk', animType: 'float' }
        ]
    }
};

// Exterior Gothic Storm Windows & Volumetric Moonlight Shafts
const MOONLIGHT_WINDOWS = [
    { wallX: 2, wallY: 1, side: 'north', lightTiles: [{ x: 2, y: 1 }, { x: 2, y: 2 }] },
    { wallX: 16, wallY: 1, side: 'north', lightTiles: [{ x: 16, y: 1 }, { x: 16, y: 2 }] },
    { wallX: 1, wallY: 7, side: 'west', lightTiles: [{ x: 1, y: 7 }, { x: 2, y: 7 }] },
    { wallX: 17, wallY: 7, side: 'east', lightTiles: [{ x: 17, y: 7 }, { x: 16, y: 7 }] },
    { wallX: 1, wallY: 11, side: 'west', lightTiles: [{ x: 1, y: 11 }, { x: 2, y: 11 }] },
    { wallX: 17, wallY: 11, side: 'east', lightTiles: [{ x: 17, y: 11 }, { x: 16, y: 11 }] }
];

// Flickering Wall Sconces along Central Vault & Hallways
const WALL_SCONCE_LOCATIONS = [
    { floor: 0, x: 7.45, z: 5.2 },
    { floor: 0, x: 10.55, z: 5.2 },
    { floor: 0, x: 7.45, z: 8.2 },
    { floor: 0, x: 10.55, z: 8.2 },
    { floor: 0, x: 6.2, z: 10.5 },
    { floor: 0, x: 11.8, z: 10.5 }
];
