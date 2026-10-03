/**
 * Yanhal Holdings Ltd — High-Fidelity Human Studio TTS Player
 * Uses OpenAI Studio TTS (/api/assistant/tts) as the mandatory voice pipeline.
 * Strictly avoids robotic browser SpeechSynthesis.
 *
 * Mobile autoplay model (iOS Safari / Android WebView):
 * a media element may only play programmatically if THAT SAME element was
 * started from a user gesture. A `new Audio()` created after an async fetch
 * is blocked. So we keep ONE persistent element, "unlock" it inside every
 * voice-button press, and then reuse it (swap `src`) for every spoken reply.
 */

let sharedAudio: HTMLAudioElement | null = null;
let audioContext: AudioContext | null = null;
let currentSessionId = 0;

// Tiny silent WAV used purely to unlock the element inside a user gesture.
const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";

// Client-side cache (blob URLs are never revoked so cached replays stay valid)
const clientAudioCache = new Map<string, string>();

function getSharedAudio(): HTMLAudioElement {
  if (!sharedAudio) {
    sharedAudio = new Audio();
    sharedAudio.preload = "auto";
    (sharedAudio as any).playsInline = true;
    sharedAudio.setAttribute("playsinline", "true");
    sharedAudio.setAttribute("webkit-playsinline", "true");
  }
  return sharedAudio;
}

/**
 * Unlock Web Audio & HTML5 Audio. MUST be called synchronously inside a user
 * gesture (voice button press, send, etc.). Safe to call on every interaction.
 */
export function unlockAudio() {
  if (typeof window === "undefined") return;

  // 1. AudioContext: create once, resume on EVERY call (iOS re-suspends it).
  try {
    if (!audioContext) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) audioContext = new AudioCtx();
    }
    if (audioContext && audioContext.state !== "running") {
      audioContext.resume().catch(() => {});
    }
    // Play an inaudible buffer to fully unlock the iOS audio session
    if (audioContext) {
      const buf = audioContext.createBuffer(1, 1, 22050);
      const src = audioContext.createBufferSource();
      src.buffer = buf;
      src.connect(audioContext.destination);
      src.start(0);
    }
  } catch (e) {
    console.warn("[TTS] AudioContext unlock notice:", e);
  }

  // 2. The persistent <audio> element: start it inside the gesture.
  try {
    const audio = getSharedAudio();
    if (audio.paused && !audio.src) {
      audio.src = SILENT_WAV;
      audio.muted = true;
      const p = audio.play();
      const finish = () => {
        audio.pause();
        audio.muted = false;
        audio.removeAttribute("src");
      };
      if (p && typeof p.then === "function") {
        p.then(finish).catch(() => {
          audio.muted = false;
        });
      } else {
        finish();
      }
    }
  } catch (e) {
    console.warn("[TTS] Audio element unlock notice:", e);
  }
}

/**
 * Stop any ongoing audio playback immediately.
 * Invalidates any in-flight speech requests so no sound leaks after turn end.
 */
export function stopAudio() {
  currentSessionId++;

  if (sharedAudio) {
    sharedAudio.onplay = null;
    sharedAudio.onended = null;
    sharedAudio.onerror = null;
    try {
      sharedAudio.pause();
    } catch (_) {}
    // Keep the element (and its unlocked state); just detach the media.
    sharedAudio.removeAttribute("src");
    try {
      sharedAudio.load();
    } catch (_) {}
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

/** fetch timeout that works on older iOS (AbortSignal.timeout needs Safari 16.4+) */
function timeoutSignal(ms: number): AbortSignal | undefined {
  if (typeof AbortController === "undefined") return undefined;
  const c = new AbortController();
  setTimeout(() => c.abort(), ms);
  return c.signal;
}

/**
 * Fetch Studio TTS with a 1-shot retry. Validates that the response really is
 * audio (a static host's SPA fallback returns index.html with HTTP 200).
 */
async function fetchStudioAudio(cleanText: string, voice: string, sessionId: number): Promise<Blob | null> {
  const doFetch = async () => {
    const res = await fetch("/api/assistant/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: cleanText, voice }),
      signal: timeoutSignal(25000),
    });
    if (!res.ok) throw new Error(`TTS status ${res.status}`);
    const type = (res.headers.get("content-type") || "").toLowerCase();
    if (!type.startsWith("audio/")) throw new Error(`TTS returned non-audio content (${type || "unknown"})`);
    const raw = await res.blob();
    if (!raw || raw.size < 200) throw new Error("Empty audio blob");
    // Make sure the blob carries an audio MIME type iOS accepts
    return raw.type.startsWith("audio/") ? raw : new Blob([raw], { type: "audio/mpeg" });
  };

  try {
    return await doFetch();
  } catch (err) {
    if (sessionId !== currentSessionId) return null;
    console.warn(`[VoiceTurn #${sessionId}] First studio TTS attempt failed, retrying...`, err);
    await new Promise((r) => setTimeout(r, 350));
    if (sessionId !== currentSessionId) return null;
    try {
      return await doFetch();
    } catch (retryErr) {
      console.error(`[VoiceTurn #${sessionId}] Studio TTS retry failed:`, retryErr);
      return null;
    }
  }
}

/** Play a URL through the persistent, gesture-unlocked element. */
function playOnSharedElement(
  url: string,
  sessionId: number,
  handlers: { onStart?: () => void; onEnd?: () => void; onError?: (e: any) => void }
): Promise<void> {
  const audio = getSharedAudio();
  audio.onplay = () => {
    if (sessionId !== currentSessionId) {
      audio.pause();
      return;
    }
    handlers.onStart?.();
  };
  audio.onended = () => {
    if (sessionId !== currentSessionId) return;
    stopAudio();
    handlers.onEnd?.();
  };
  audio.onerror = (e) => {
    if (sessionId !== currentSessionId) return;
    console.error(`[VoiceTurn #${sessionId}] Audio element playback error:`, e);
    handlers.onError?.(e);
  };

  audio.muted = false;
  audio.src = url;
  // Resume a re-suspended context before playing
  if (audioContext && audioContext.state !== "running") audioContext.resume().catch(() => {});
  const p = audio.play();
  return p && typeof p.then === "function" ? p : Promise.resolve();
}

/**
 * Play text as natural human studio speech.
 * Mandatory studio path: never falls back to the robotic device voice.
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
    onEnd?.();
    return;
  }

  let failed = false;
  const fail = (message: string) => {
    if (failed || sessionId !== currentSessionId) return;
    failed = true;
    console.warn(`[VoiceTurn #${sessionId}] ${message}`);
    onError?.({ message, isVoiceDegraded: true });
  };

  const handlers = {
    onStart,
    onEnd,
    onError: () => fail("The voice reply could not be played on this device. Please tap the voice button again or switch to text chat."),
  };

  const cacheKey = `${voice}_${cleanText.toLowerCase()}`;
  let urlToPlay: string | null = clientAudioCache.get(cacheKey) || null;

  // Inline audio supplied by the chat endpoint
  if (!urlToPlay && audioBase64) {
    try {
      const bin = atob(audioBase64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      urlToPlay = URL.createObjectURL(new Blob([bytes], { type: "audio/mpeg" }));
    } catch (e) {
      console.warn(`[VoiceTurn #${sessionId}] Invalid inline audio, will request studio TTS`, e);
    }
  }

  // Request studio voice from the server
  if (!urlToPlay) {
    console.log(`[VoiceTurn #${sessionId}] Requesting studio speech playback (/api/assistant/tts)...`);
    const blob = await fetchStudioAudio(cleanText, voice, sessionId);
    if (sessionId !== currentSessionId) return;
    if (!blob) {
      fail("The studio voice could not be reached. Please check your connection, tap the voice button to retry, or switch to text chat.");
      return;
    }
    urlToPlay = URL.createObjectURL(blob);
  }

  if (clientAudioCache.size < 60) clientAudioCache.set(cacheKey, urlToPlay);

  try {
    await playOnSharedElement(urlToPlay, sessionId, handlers);
  } catch (playErr: any) {
    if (sessionId !== currentSessionId) return;
    console.error(`[VoiceTurn #${sessionId}] Audio playback failed:`, playErr);
    if (playErr?.name === "NotAllowedError") {
      fail("Your phone blocked the voice reply. Tap the voice button once more to allow audio, or switch to text chat.");
    } else {
      fail("The voice reply could not be played on this device. Please switch to text chat.");
    }
  }
}
