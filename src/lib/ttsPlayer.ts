/**
 * Yanhal Holdings Ltd — High-Fidelity Human Studio TTS Player
 * Uses OpenAI Studio TTS (/api/assistant/tts) as the mandatory voice pipeline.
 * Strictly avoids robotic browser SpeechSynthesis on mobile.
 * Includes audio caching, connection retry, and session isolation.
 */

let activeAudio: HTMLAudioElement | null = null;
let activeObjectUrl: string | null = null;
let audioContext: AudioContext | null = null;
let currentSessionId = 0;

// Client-side cache for instantaneous playback of synthesized voice turns
const clientAudioCache = new Map<string, string>();

/**
 * Unlock Web Audio & HTML5 Audio on user gesture (e.g. entering Voice Mode).
 */
export function unlockAudio() {
  try {
    if (!audioContext && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioContext = new AudioCtx();
        if (audioContext.state === "suspended") {
          audioContext.resume();
        }
      }
    }
  } catch (e) {
    console.warn("[TTS] AudioContext unlock notice:", e);
  }
}

/**
 * Stop any ongoing audio playback immediately.
 * Invalidates any in-flight speech requests so no sound leaks after turn end.
 */
export function stopAudio() {
  currentSessionId++; // Invalidate all pending and inflight requests
  
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.onplay = null;
    activeAudio.onended = null;
    activeAudio.onerror = null;
    activeAudio.src = "";
    activeAudio = null;
  }
  if (activeObjectUrl) {
    URL.revokeObjectURL(activeObjectUrl);
    activeObjectUrl = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}
  }
  console.log(`[VoiceTurn] Audio stopped & playback session invalidated (ID: ${currentSessionId})`);
}

export interface PlaySpeechOptions {
  text: string;
  voice?: "nova" | "alloy" | "shimmer" | "echo";
  audioBase64?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

/**
 * Helper to fetch Studio TTS with automatic 1-shot retry on transient network errors.
 */
async function fetchStudioAudio(cleanText: string, voice: string, sessionId: number): Promise<Blob | null> {
  const doFetch = async () => {
    const res = await fetch("/api/assistant/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: cleanText, voice }),
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) throw new Error(`TTS status ${res.status}`);
    const blob = await res.blob();
    if (!blob || blob.size < 200) throw new Error("Empty audio blob");
    return blob;
  };

  try {
    return await doFetch();
  } catch (err) {
    if (sessionId !== currentSessionId) return null;
    console.warn(`[VoiceTurn #${sessionId}] First studio TTS attempt failed, retrying in 350ms...`, err);
    await new Promise(r => setTimeout(r, 350));
    if (sessionId !== currentSessionId) return null;
    try {
      return await doFetch();
    } catch (retryErr) {
      console.error(`[VoiceTurn #${sessionId}] Studio TTS retry failed:`, retryErr);
      return null;
    }
  }
}

/**
 * Play text as natural human studio speech.
 * Mandatory studio path: does NOT fall back to flat robotic browser SpeechSynthesis.
 */
export async function playHumanSpeech({
  text,
  voice = "nova",
  audioBase64,
  onStart,
  onEnd,
  onError,
}: PlaySpeechOptions) {
  stopAudio();
  const sessionId = currentSessionId;

  const cleanText = text
    .replace(/[#*_~`]/g, "")
    .replace(/https?:\/\/\S+/g, "our website")
    .trim();

  if (!cleanText && !audioBase64) {
    if (onEnd) onEnd();
    return;
  }

  const cacheKey = `${voice}_${cleanText.toLowerCase()}`;

  // 1. Check in-memory audio cache for instantaneous replay
  if (clientAudioCache.has(cacheKey)) {
    const cachedUrl = clientAudioCache.get(cacheKey)!;
    try {
      const audio = new Audio(cachedUrl);
      activeAudio = audio;

      audio.onplay = () => {
        if (sessionId !== currentSessionId) {
          audio.pause();
          return;
        }
        console.log(`[VoiceTurn #${sessionId}] Cached studio audio playback started`);
        if (onStart) onStart();
      };

      audio.onended = () => {
        if (sessionId !== currentSessionId) return;
        console.log(`[VoiceTurn #${sessionId}] Cached studio audio playback ended`);
        stopAudio();
        if (onEnd) onEnd();
      };

      audio.onerror = (e) => {
        if (sessionId !== currentSessionId) return;
        console.warn(`[VoiceTurn #${sessionId}] Cached audio error, refetching:`, e);
      };

      await audio.play();
      return;
    } catch (e) {
      console.warn(`[VoiceTurn #${sessionId}] Error playing cached audio:`, e);
    }
  }

  // 2. Play direct audioBase64 if provided from inline generation
  if (audioBase64) {
    try {
      const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;
      const audio = new Audio(audioUrl);
      activeAudio = audio;

      audio.onplay = () => {
        if (sessionId !== currentSessionId) {
          audio.pause();
          return;
        }
        console.log(`[VoiceTurn #${sessionId}] Instant Base64 studio audio playback started`);
        if (onStart) onStart();
      };

      audio.onended = () => {
        if (sessionId !== currentSessionId) return;
        console.log(`[VoiceTurn #${sessionId}] Studio audio playback ended`);
        stopAudio();
        if (onEnd) onEnd();
      };

      audio.onerror = (e) => {
        if (sessionId !== currentSessionId) return;
        console.warn(`[VoiceTurn #${sessionId}] Base64 audio error:`, e);
      };

      await audio.play();
      if (clientAudioCache.size < 60) {
        clientAudioCache.set(cacheKey, audioUrl);
      }
      return;
    } catch (err) {
      console.warn(`[VoiceTurn #${sessionId}] Direct audio play notice:`, err);
    }
  }

  // 3. Request Studio Voice via /api/assistant/tts with retry
  console.log(`[VoiceTurn #${sessionId}] Requesting studio speech playback (/api/assistant/tts)...`);
  const blob = await fetchStudioAudio(cleanText, voice, sessionId);
  if (sessionId !== currentSessionId) return;

  if (blob) {
    try {
      const url = URL.createObjectURL(blob);
      activeObjectUrl = url;

      const audio = new Audio(url);
      activeAudio = audio;

      audio.onplay = () => {
        if (sessionId !== currentSessionId) {
          audio.pause();
          return;
        }
        console.log(`[VoiceTurn #${sessionId}] OpenAI Studio audio playback started`);
        if (onStart) onStart();
      };

      audio.onended = () => {
        if (sessionId !== currentSessionId) return;
        console.log(`[VoiceTurn #${sessionId}] OpenAI Studio audio playback ended`);
        stopAudio();
        if (onEnd) onEnd();
      };

      audio.onerror = (e) => {
        if (sessionId !== currentSessionId) return;
        console.error(`[VoiceTurn #${sessionId}] Audio element playback error:`, e);
        if (onError) onError({ message: "Audio playback encountered an error on this device.", isVoiceDegraded: true });
        if (onEnd) onEnd();
      };

      await audio.play();
      if (clientAudioCache.size < 60) {
        clientAudioCache.set(cacheKey, url);
      }
      return;
    } catch (playErr) {
      console.error(`[VoiceTurn #${sessionId}] Audio playback failed:`, playErr);
    }
  }

  // 4. Mandatory Studio Voice handling:
  // Strictly prevent falling back to the flat robotic mobile browser speech synthesis.
  if (sessionId === currentSessionId) {
    console.warn(`[VoiceTurn #${sessionId}] Studio TTS unavailable after retry; notifying user cleanly rather than using robotic synthesizer.`);
    if (onError) {
      onError({ 
        message: "Studio voice audio connection is temporarily slow on your mobile network. Please check your connection or switch to text chat.",
        isVoiceDegraded: true 
      });
    }
    if (onEnd) onEnd();
  }
}
