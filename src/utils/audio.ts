class AudioSynthManager {
  private ctx: AudioContext | null = null;
  private musicVolume = 0.5;
  private sfxVolume = 0.5;
  private bgmAudio: HTMLAudioElement | null = null;
  private levelUpAudio: HTMLAudioElement | null = null;
  private clickAudioPool: HTMLAudioElement[] = [];
  private hitAudioPool: HTMLAudioElement[] = [];
  private bigPunchAudio: HTMLAudioElement | null = null;
  private smallKnockAudio: HTMLAudioElement | null = null;
  private isMusicPlaying = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.levelUpAudio = new Audio('/assets/sfx/levelup/levelcompletesplash.mp3');
      this.levelUpAudio.preload = 'auto';

      const clickFiles = [
        'button01.mp3.flac', 'button02.mp3.flac', 'button03.mp3.flac',
        'button04.mp3.flac', 'button05.mp3.flac', 'button06.mp3.flac',
        'Clic01.mp3.flac', 'clic02.mp3.flac', 'Clic03.mp3.flac',
        'Clic04.mp3.flac', 'Clic05.mp3.flac', 'Clic06.mp3.flac',
        'Clic07.mp3.flac', 'Clic08.mp3.flac', 'Clic09.mp3.flac', 'clic10.mp3.flac'
      ];
      
      this.clickAudioPool = clickFiles.map(f => {
        const a = new Audio(`/assets/sfx/clicks/${f}`);
        a.preload = 'auto';
        return a;
      });

      // Socapex combat hit audio pool
      const hitFiles = [
        'Socapex - Swordsmall.wav',
        'Socapex - Swordsmall_1.wav',
        'Socapex - Swordsmall_2.wav',
        'Socapex - Swordsmall_3.wav',
        'Socapex - new_hits.wav',
        'Socapex - new_hits_1.wav',
        'Socapex - new_hits_2.wav',
        'Socapex - new_hits_3.wav'
      ];

      this.hitAudioPool = hitFiles.map(f => {
        const a = new Audio(`/assets/sfx/combat/${encodeURIComponent(f)}`);
        a.preload = 'auto';
        return a;
      });

      this.bigPunchAudio = new Audio(`/assets/sfx/combat/${encodeURIComponent('Socapex - big punch.wav')}`);
      this.bigPunchAudio.preload = 'auto';

      this.smallKnockAudio = new Audio(`/assets/sfx/combat/${encodeURIComponent('Socapex - small knock.wav')}`);
      this.smallKnockAudio.preload = 'auto';

      const handleGlobalClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement | null;
        if (target && (target.tagName === 'BUTTON' || target.closest('button') || target.classList.contains('game-btn') || target.getAttribute('role') === 'button')) {
          this.playClick();
        }
      };

      const unlockAudio = () => {
        this.initContext();
        if (this.musicVolume > 0 && (!this.bgmAudio || this.bgmAudio.paused)) {
          this.startMusic();
        }
      };

      window.addEventListener('click', handleGlobalClick);
      window.addEventListener('click', unlockAudio);
      window.addEventListener('keydown', unlockAudio);
      window.addEventListener('pointerdown', unlockAudio);
    }
  }

  private initBgm() {
    if (typeof window === 'undefined') return;
    if (!this.bgmAudio) {
      this.bgmAudio = new Audio('/assets/music/awesomeness.wav');
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = this.musicVolume;
    }
  }

  private initContext() {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(music: number, sfx: number) {
    this.musicVolume = Math.max(0, Math.min(1, music / 100));
    this.sfxVolume = Math.max(0, Math.min(1, sfx / 100));
    
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.musicVolume;
    }

    if (this.musicVolume > 0) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
  }

  startMusic() {
    this.initBgm();
    if (!this.bgmAudio) return;

    this.bgmAudio.volume = this.musicVolume;
    if (this.musicVolume > 0) {
      try {
        const res = this.bgmAudio.play();
        if (res && typeof res.then === 'function') {
          res.then(() => {
            this.isMusicPlaying = true;
          }).catch(e => {
            console.warn('BGM waiting for user interaction:', e);
          });
        } else {
          this.isMusicPlaying = true;
        }
      } catch (e) {
        console.warn('BGM play failed:', e);
      }
    }
  }

  stopMusic() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.isMusicPlaying = false;
    }
  }

  playClick() {
    try {
      if (this.sfxVolume <= 0 || this.clickAudioPool.length === 0) return;
      const randomIdx = Math.floor(Math.random() * this.clickAudioPool.length);
      const originalAudio = this.clickAudioPool[randomIdx];
      const sound = originalAudio.cloneNode() as HTMLAudioElement;
      sound.volume = this.sfxVolume;
      sound.play().catch(() => {});
    } catch (e) {
      console.warn('Click audio failed:', e);
    }
  }

  playHit() {
    try {
      if (this.sfxVolume <= 0 || this.hitAudioPool.length === 0) return;
      const randomIdx = Math.floor(Math.random() * this.hitAudioPool.length);
      const originalAudio = this.hitAudioPool[randomIdx];
      const sound = originalAudio.cloneNode() as HTMLAudioElement;
      sound.volume = this.sfxVolume;
      const res = sound.play();
      if (res && typeof res.catch === 'function') {
        res.catch(e => console.warn('Hit SFX failed:', e));
      }
    } catch (e) {
      console.warn('Hit SFX failed:', e);
    }
  }

  playCrit() {
    try {
      if (this.sfxVolume <= 0) return;
      if (this.bigPunchAudio) {
        const sound = this.bigPunchAudio.cloneNode() as HTMLAudioElement;
        sound.volume = Math.min(1, this.sfxVolume * 1.25);
        const res = sound.play();
        if (res && typeof res.catch === 'function') {
          res.catch(e => console.warn('Crit SFX failed:', e));
        }
      }
    } catch (e) {
      console.warn('Crit SFX failed:', e);
    }
  }

  playEvade() {
    try {
      if (this.sfxVolume <= 0) return;
      if (this.smallKnockAudio) {
        const sound = this.smallKnockAudio.cloneNode() as HTMLAudioElement;
        sound.volume = this.sfxVolume;
        const res = sound.play();
        if (res && typeof res.catch === 'function') {
          res.catch(e => console.warn('Evade SFX failed:', e));
        }
      }
    } catch (e) {
      console.warn('Evade SFX failed:', e);
    }
  }

  playLevelUp() {
    try {
      if (this.sfxVolume <= 0) return;
      if (this.levelUpAudio) {
        const sound = this.levelUpAudio.cloneNode() as HTMLAudioElement;
        sound.volume = this.sfxVolume;
        const res = sound.play();
        if (res && typeof res.catch === 'function') {
          res.catch(e => console.warn('Level up SFX failed:', e));
        }
      }
    } catch (e) {
      console.warn('Level up SFX failed:', e);
    }
  }

  playLoot() {
    try {
      this.initContext();
      if (!this.ctx || this.sfxVolume <= 0) return;
      const notes = [440, 554.37, 659.25];
      notes.forEach((freq, idx) => {
        const t = (this.ctx?.currentTime || 0) + idx * 0.06;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(this.sfxVolume * 0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t);
        osc.stop(t + 0.12);
      });
    } catch (e) {
      console.warn('Audio failed:', e);
    }
  }

  playScrap() {
    try {
      this.initContext();
      if (!this.ctx || this.sfxVolume <= 0) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.12);

      gain.gain.setValueAtTime(this.sfxVolume * 0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.12);
    } catch (e) {
      console.warn('Audio failed:', e);
    }
  }

  playReforge() {
    try {
      this.initContext();
      if (!this.ctx || this.sfxVolume <= 0) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(450, t + 0.2);

      gain.gain.setValueAtTime(this.sfxVolume * 0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.2);
    } catch (e) {
      console.warn('Audio failed:', e);
    }
  }
}

export const audioSynth = new AudioSynthManager();
