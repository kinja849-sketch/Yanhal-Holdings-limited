type AudioSubscriber = (isPlaying: boolean) => void;

class AudioManager {
  private isPlaying: boolean = false;
  private subscribers: Set<AudioSubscriber> = new Set();
  private registeredVideos: Map<string, HTMLVideoElement> = new Map();
  private audioCtx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private ambientOsc: OscillatorNode | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      // Pause audio if page goes into background
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden" && this.isPlaying) {
          this.setAudio(false);
        }
      });
    }
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  subscribe(callback: AudioSubscriber): () => void {
    this.subscribers.add(callback);
    callback(this.isPlaying);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  registerVideo(id: string, video: HTMLVideoElement | null): void {
    if (!video) {
      this.registeredVideos.delete(id);
      return;
    }
    this.registeredVideos.set(id, video);
    // Apply current state to newly registered video
    video.muted = !this.isPlaying;
    if (this.isPlaying) {
      video.volume = 1;
    }
  }

  unregisterVideo(id: string): void {
    this.registeredVideos.delete(id);
  }

  toggle(): boolean {
    return this.setAudio(!this.isPlaying);
  }

  setAudio(enabled: boolean): boolean {
    this.isPlaying = enabled;

    // Synchronize all registered video elements
    this.registeredVideos.forEach((video) => {
      try {
        video.muted = !enabled;
        video.volume = enabled ? 1 : 0;
        if (enabled && video.paused) {
          video.play().catch(() => {});
        }
      } catch (err) {
        console.warn("Video audio toggle issue:", err);
      }
    });

    // Ambient architectural audio generator fallback
    if (enabled) {
      this.startAmbientTone();
    } else {
      this.stopAmbientTone();
    }

    // Notify all listeners
    this.subscribers.forEach((cb) => {
      try {
        cb(this.isPlaying);
      } catch (e) {
        console.error("Audio subscriber error:", e);
      }
    });

    return this.isPlaying;
  }

  private startAmbientTone(): void {
    try {
      if (typeof window === "undefined") return;
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }
    } catch {
      // AudioContext not supported or restricted
    }
  }

  private stopAmbientTone(): void {
    try {
      if (this.audioCtx && this.audioCtx.state === "running") {
        this.audioCtx.suspend();
      }
    } catch {
      // Ignore
    }
  }
}

export const audioManager = new AudioManager();
