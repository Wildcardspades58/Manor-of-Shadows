/* ============================================================================
 * 1. WEB AUDIO SYNTHESIZER (Footsteps, Thunder Rumbles, Chimes & Jump Scares)
 * ============================================================================ */
const SoundFX = {
    ctx: null,
    muted: false,
    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },
    playTone(freq, type, duration, vol = 0.12, slideTo = null) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, this.ctx.currentTime + duration);
            gain.gain.setValueAtTime(vol, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {}
    },
    step(floorType = 'hallway') {
        if (floorType === 'marble_foyer' || floorType === 'checker_kitchen') {
            this.playTone(320 + Math.random() * 50, 'sine', 0.045, 0.07, 180);
        } else {
            this.playTone(155 + Math.random() * 40, 'triangle', 0.05, 0.07, 90);
        }
    },
    clickSwitch() { this.playTone(620, 'sine', 0.04, 0.08, 420); },
    roomLightSwitch(isOn) {
        if (isOn) {
            this.playTone(540, 'triangle', 0.09, 0.12, 880);
            setTimeout(() => this.playTone(880, 'sine', 0.14, 0.1), 50);
        } else {
            this.playTone(640, 'triangle', 0.09, 0.11, 280);
        }
    },
    masterBreaker() {
        [220, 330, 440, 660, 880, 1174.66].forEach((f, idx) => {
            setTimeout(() => this.playTone(f, 'sawtooth', 0.18, 0.15, f * 1.15), idx * 55);
        });
    },
    thunderRumble() {
        if (this.muted || !this.ctx) return;
        [72, 58, 48, 38].forEach((f, idx) => {
            setTimeout(() => this.playTone(f, 'triangle', 0.45, 0.065, 28), idx * 110);
        });
    },
    poltergeistRattle() {
        [210, 165, 240].forEach((f, idx) => {
            setTimeout(() => this.playTone(f, 'triangle', 0.08, 0.06, 110), idx * 55);
        });
    },
    dice() {
        [280, 360, 440, 580].forEach((f, idx) => setTimeout(() => this.playTone(f, 'sine', 0.06, 0.09), idx * 42));
    },
    secretMechanism() {
        this.playTone(145, 'sawtooth', 0.3, 0.1, 230);
        setTimeout(() => this.playTone(520, 'triangle', 0.25, 0.12, 780), 150);
    },
    clueFound() {
        [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => setTimeout(() => this.playTone(f, 'triangle', 0.2, 0.13), idx * 70));
    },
    pipeBang() {
        [180, 250, 190, 280].forEach((f, idx) => setTimeout(() => this.playTone(f, 'square', 0.13, 0.11, 90), idx * 100));
    },
    jumpScareShriek(intensity = 'fun') {
        const vol = intensity === 'full' ? 0.24 : 0.12;
        [880, 932, 622, 1174, 415, 220].forEach((f, idx) => {
            setTimeout(() => this.playTone(f, 'sawtooth', 0.34, vol, f * 0.45), idx * 55);
        });
    },
    victory() {
        [440, 554.37, 659.25, 880, 1108.73, 1318.5].forEach((f, idx) => setTimeout(() => this.playTone(f, 'triangle', 0.3, 0.15), idx * 90));
    }
};

function toggleAudio() {
    SoundFX.muted = !SoundFX.muted;
    document.getElementById('soundIcon').textContent = SoundFX.muted ? 'volume_off' : 'volume_up';
}
