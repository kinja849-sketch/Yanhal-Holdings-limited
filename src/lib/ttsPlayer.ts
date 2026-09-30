/**
 * Yanhal Holdings Ltd — High-Fidelity Human TTS Player
 * Uses OpenAI Studio TTS (/api/assistant/tts) with graceful Web Speech Synthesis fallback.
 * Strictly prevents concurrent audio playback, voice switching, and ghost audio leaks.
 */

let activeAudio: HTMLAudioElement | null = null;
let activeObjectUrl: string | null = null;
let audioContext: AudioContext | null = null;
let currentSessionId = 0;

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
 * Stop any ongoing audio playback or speech synthesis immediately.
 * Invalidates any in-flight speech requests so no sound plays after exiting.
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
 * Play text as natural human speech with strictly guarded event lifecycle.
 */
export async function playHumanSpeech({
  text,
  voice = "nova",
  audioBase64,
  onStart,
  onEnd,
  onError,
}: PlaySpeechOptions) {
  // 1. Invalidate and cancel all previous audio
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

  console.log(`[VoiceTurn #${sessionId}] Requesting studio speech playback...`);

  // If audioBase64 is directly supplied, play immediately!
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
        console.log(`[VoiceTurn #${sessionId}] Instant Base64 audio playback started`);
        if (onStart) onStart();
      };

      audio.onended = () => {
        if (sessionId !== currentSessionId) return;
        console.log(`[VoiceTurn #${sessionId}] Audio playback ended`);
        stopAudio();
        if (onEnd) onEnd();
      };

      audio.onerror = (e) => {
        if (sessionId !== currentSessionId) return;
        console.warn(`[VoiceTurn #${sessionId}] Base64 audio error, falling back:`, e);
        fallbackSpeechSynthesis(cleanText, sessionId, onStart, onEnd, onError);
      };

      await audio.play();
      return;
    } catch (err) {
      console.warn(`[VoiceTurn #${sessionId}] Direct audio play notice:`, err);
    }
  }

  let serverTtsSucceeded = false;

  // 2. Fallback to OpenAI Studio TTS endpoint if audioBase64 was not provided
  try {
    const res = await fetch("/api/assistant/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: cleanText, voice }),
      signal: AbortSignal.timeout(9000),
    });

    // Check if user cancelled or ended voice mode while fetch was running!
    if (sessionId !== currentSessionId) {
      console.log(`[VoiceTurn #${sessionId}] Session was cancelled during fetch; discarding audio response.`);
      return;
    }

    if (res.ok) {
      const blob = await res.blob();
      if (sessionId !== currentSessionId) {
        return;
      }

      if (blob && blob.size > 200) {
        const url = URL.createObjectURL(blob);
        activeObjectUrl = url;

        const audio = new Audio(url);
        activeAudio = audio;

        audio.onplay = () => {
          if (sessionId !== currentSessionId) {
            audio.pause();
            return;
          }
          console.log(`[VoiceTurn #${sessionId}] OpenAI Studio audio playback started (Avatar state: speaking)`);
          if (onStart) onStart();
        };

        audio.onended = () => {
          if (sessionId !== currentSessionId) return;
          console.log(`[VoiceTurn #${sessionId}] OpenAI Studio audio playback ended (Avatar state: ready)`);
          stopAudio();
          if (onEnd) onEnd();
        };

        audio.onerror = (e) => {
          if (sessionId !== currentSessionId) return;
          console.warn(`[VoiceTurn #${sessionId}] Audio element error, attempting speech synthesis fallback:`, e);
          fallbackSpeechSynthesis(cleanText, sessionId, onStart, onEnd, onError);
        };

        await audio.play();
        serverTtsSucceeded = true;
        return;
      }
    }
  } catch (err) {
    console.warn(`[VoiceTurn #${sessionId}] Server TTS fetch notice:`, err);
  }

  // 3. Fallback to Enhanced Browser Speech Synthesis only if not cancelled and server failed
  if (!serverTtsSucceeded && sessionId === currentSessionId) {
    fallbackSpeechSynthesis(cleanText, sessionId, onStart, onEnd, onError);
  }
}

/**
 * Enhanced Browser Speech Synthesis fallback with session validation
 */
function fallbackSpeechSynthesis(
  text: string,
  sessionId: number,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
) {
  if (sessionId !== currentSessionId) return;

  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    console.warn("[VoiceTurn] No speech synthesis available in this browser");
    if (onEnd) onEnd();
    return;
  }

  try {
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const naturalVoice =
      voices.find(
        (v) =>
          (v.name.includes("Natural") ||
            v.name.includes("Google") ||
            v.name.includes("Premium") ||
            v.name.includes("Samantha") ||
            v.name.includes("Daniel") ||
            v.name.includes("Karen")) &&
          v.lang.startsWith("en")
      ) ||
      voices.find((v) => v.lang.startsWith("en")) ||
      voices[0];

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      if (sessionId !== currentSessionId) {
        window.speechSynthesis.cancel();
        return;
      }
      console.log(`[VoiceTurn #${sessionId}] SpeechSynthesis started (Speaking state active)`);
      if (onStart) onStart();
    };

    utterance.onend = () => {
      if (sessionId !== currentSessionId) return;
      console.log(`[VoiceTurn #${sessionId}] SpeechSynthesis finished (Turn ready for listening)`);
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      if (sessionId !== currentSessionId) return;
      console.warn(`[VoiceTurn #${sessionId}] SpeechSynthesis error:`, e);
      if (onEnd) onEnd();
      if (onError) onError(e);
    };

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.error("[VoiceTurn] Failed fallback speech synthesis:", e);
    if (onEnd) onEnd();
    if (onError) onError(e);
  }
}
