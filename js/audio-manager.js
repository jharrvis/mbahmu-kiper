export class AudioManager {
    constructor() {
        this.bgmEnabled = true;
        this.sfxEnabled = true;
        this.currentBGM = null;
        this.loadSettings();
    }

    loadSettings() {
        const settings = localStorage.getItem('gameAudioSettings');
        if (settings) {
            const parsed = JSON.parse(settings);
            this.bgmEnabled = parsed.bgm ?? true;
            this.sfxEnabled = parsed.sfx ?? true;
        }
    }

    saveSettings() {
        localStorage.setItem('gameAudioSettings', JSON.stringify({
            bgm: this.bgmEnabled,
            sfx: this.sfxEnabled
        }));
    }

    toggleBGM() {
        this.bgmEnabled = !this.bgmEnabled;
        if (!this.bgmEnabled && this.currentBGM) {
            this.currentBGM.pause();
        } else if (this.bgmEnabled && this.currentBGM) {
            this.currentBGM.play();
        }
        this.saveSettings();
        return this.bgmEnabled;
    }

    toggleSFX() {
        this.sfxEnabled = !this.sfxEnabled;
        this.saveSettings();
        return this.sfxEnabled;
    }

    playSFX(audio) {
        if (this.sfxEnabled && audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log('SFX play failed:', e));
        }
    }

    playBGM(audio) {
        this.currentBGM = audio;
        if (this.bgmEnabled && audio) {
            audio.play().catch(e => console.log('BGM play failed:', e));
        }
    }

    stopBGM() {
        if (this.currentBGM) {
            this.currentBGM.pause();
            this.currentBGM.currentTime = 0;
        }
    }
}
