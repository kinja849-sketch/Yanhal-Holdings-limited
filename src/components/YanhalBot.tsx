import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { transitionManager } from "../lib/transitionManager";
import YanhalLogoSvg from "./YanhalLogoSvg";
import BotAvatar3D from "./BotAvatar3D";
import { generateDynamicAssistantResponse, ChatMessage } from "../lib/dynamicChat";
import { playHumanSpeech, stopAudio, unlockAudio } from "../lib/ttsPlayer";

interface MessageItem {
  id: string;
  sender: "visitor" | "assistant" | "system";
  content: string;
  mode: "text" | "voice";
  progressStatus?: string;
  actionType?: string;
  actionData?: any;
  created_at?: string;
  attachedImages?: string[];
}

export default function YanhalBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVoiceToVoice, setIsVoiceToVoice] = useState(false);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isDictating, setIsDictating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentProgress, setCurrentProgress] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [attachedPreviews, setAttachedPreviews] = useState<string[]>([]);
  const [voiceStatus, setVoiceStatus] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [mapViewModes, setMapViewModes] = useState<Record<string, "map" | "satellite">>({});
  const [showOwnerView, setShowOwnerView] = useState(false);
  const [ownerData, setOwnerData] = useState<any>(null);

  const isVoiceToVoiceRef = useRef(isVoiceToVoice);
  useEffect(() => {
    isVoiceToVoiceRef.current = isVoiceToVoice;
  }, [isVoiceToVoice]);

  const voiceStatusRef = useRef(voiceStatus);
  useEffect(() => {
    voiceStatusRef.current = voiceStatus;
  }, [voiceStatus]);

  // Position for draggable circular floating button
  const [pos, setPos] = useState({ x: 28, y: 110 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });

  // Anonymous session ID persisted in localStorage
  const [sessionId] = useState(() => {
    let sid = localStorage.getItem("yanhal_assistant_session_id");
    if (!sid) {
      sid = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem("yanhal_assistant_session_id", sid);
    }
    return sid;
  });

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const speechRecognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize SpeechSynthesis
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, currentProgress]);

  // Lock background scroll and pause Lenis engine when modal is active
  useEffect(() => {
    const isModalActive = isOpen || showOwnerView;
    if (isModalActive) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      if (typeof window !== "undefined" && (window as any).__lenis) {
        try {
          (window as any).__lenis.stop();
        } catch (_) {}
      }
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      if (typeof window !== "undefined" && (window as any).__lenis) {
        try {
          (window as any).__lenis.start();
        } catch (_) {}
      }
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      if (typeof window !== "undefined" && (window as any).__lenis) {
        try {
          (window as any).__lenis.start();
        } catch (_) {}
      }
    };
  }, [isOpen, showOwnerView]);

  const lastAssistantReplyRef = useRef<string>("");

  function isEcho(userText: string, assistantText: string): boolean {
    if (!userText || !assistantText) return false;
    const u = userText.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
    const a = assistantText.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
    if (u.length < 6) return false;
    if (a.includes(u) || u.includes(a)) return true;
    return false;
  }

  // Web Speech Recognition for dictation & voice-to-voice
  const startListening = useCallback((targetMode: "dictation" | "voicetovoice") => {
    if (targetMode === "voicetovoice" && !isVoiceToVoiceRef.current) {
      console.log("[VoiceTurn] Voice mode is not active; skipping startListening.");
      return;
    }

    console.log(`[VoiceTurn] Initializing speech recognition for mode: ${targetMode}`);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.");
      return;
    }

    try {
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch (_) {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      if (targetMode === "dictation") {
        setIsDictating(true);
      } else {
        setVoiceStatus("listening");
        setVoiceError(null);
      }

      let finalTranscript = "";

      recognition.onstart = () => {
        console.log(`[VoiceTurn] Microphone capture active (State: listening)`);
      };

      recognition.onresult = (event: any) => {
        if (targetMode === "voicetovoice" && !isVoiceToVoiceRef.current) return;

        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interim += transcript;
          }
        }

        const currentText = finalTranscript || interim;
        console.log(`[VoiceTurn] Speech captured: "${currentText}"`);
        if (targetMode === "dictation") {
          setInputValue(currentText);
        }

        // Active silence detector: automatically commit speech 700ms after user pauses speaking
        if (targetMode === "voicetovoice" && currentText.trim()) {
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (isVoiceToVoiceRef.current && speechRecognitionRef.current) {
              console.log("[VoiceTurn] Silence pause detected (700ms); committing turn promptly.");
              try { speechRecognitionRef.current.stop(); } catch (_) {}
            }
          }, 700);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn("[VoiceTurn] Speech recognition error:", e.error);
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
        if (e.error === "not-allowed" || e.error === "permission-denied") {
          setVoiceError("Microphone access was denied. Please allow microphone permissions in your browser bar or switch to text chat.");
        }
        if (targetMode === "dictation") {
          setIsDictating(false);
        } else {
          setVoiceStatus("idle");
        }
      };

      recognition.onend = () => {
        console.log("[VoiceTurn] Microphone turned off");
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
        if (targetMode === "dictation") {
          setIsDictating(false);
        } else {
          // If the user already closed voice mode, ignore completely!
          if (!isVoiceToVoiceRef.current) {
            console.log("[VoiceTurn] Voice mode closed; discarding recognition end.");
            return;
          }

          const trimmed = finalTranscript.trim();
          if (trimmed) {
            // Echo guard: discard if speaker picked up the assistant's own voice
            if (isEcho(trimmed, lastAssistantReplyRef.current)) {
              console.log("[VoiceTurn] Echo detected and ignored from speaker feedback.");
              if (isVoiceToVoiceRef.current) {
                try { recognition.start(); } catch (_) {}
              }
              return;
            }

            console.log(`[VoiceTurn] Visitor finished turn: "${trimmed}"`);
            handleSend(trimmed, "voice");
          } else {
            // If still in voice mode and expecting user input, keep listening
            if (isVoiceToVoiceRef.current && voiceStatusRef.current === "listening") {
              try { recognition.start(); } catch (_) {}
            } else if (isVoiceToVoiceRef.current && voiceStatusRef.current !== "thinking" && voiceStatusRef.current !== "speaking") {
              setVoiceStatus("listening");
            }
          }
        }
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error("[VoiceTurn] Failed to start speech recognition:", err);
      if (err.name === "NotAllowedError" || err.message?.includes("permission")) {
        setVoiceError("Microphone permission denied. Please allow microphone permissions to speak.");
      }
      setIsDictating(false);
      setVoiceStatus("idle");
    }
  }, []);

  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (speechRecognitionRef.current) {
      try { speechRecognitionRef.current.stop(); } catch (_) {}
    }
    setIsDictating(false);
  }, []);

  // Enter Voice-to-Voice section (Triggered by the Blue Button)
  const openVoiceToVoice = () => {
    console.log("[VoiceTurn] Entering Voice-to-Voice section");
    unlockAudio();
    stopAudio();
    isVoiceToVoiceRef.current = true;
    setIsOpen(true);
    setIsVoiceToVoice(true);
    setVoiceError(null);
    setVoiceStatus("listening");
    startListening("voicetovoice");
  };

  // Exit Voice-to-Voice section (Triggered by the Cancel X Button or Switch to Text)
  const cancelVoiceMode = () => {
    console.log("[VoiceTurn] Cancelling Voice-to-Voice section completely");
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    isVoiceToVoiceRef.current = false;
    stopAudio();
    stopListening();
    setIsVoiceToVoice(false);
    setVoiceStatus("idle");
    setVoiceError(null);
  };

  // Send message using dynamic conversational engine
  const handleSend = async (textToSend?: string, mode: "text" | "voice" = "text") => {
    const text = (textToSend !== undefined ? textToSend : inputValue).trim();
    if (!text && attachedFiles.length === 0) return;

    const currentImages = [...attachedPreviews];
    const userMsgId = `user_${Date.now()}`;
    const newMsg: MessageItem = {
      id: userMsgId,
      sender: "visitor",
      content: text || "(Uploaded project reference)",
      mode,
      attachedImages: currentImages,
    };

    setMessages(prev => [...prev, newMsg]);
    setInputValue("");
    setAttachedFiles([]);
    setAttachedPreviews([]);
    setIsLoading(true);
    setCurrentProgress("Thinking...");

    if (mode === "voice") {
      setVoiceStatus("thinking");
    }

    // Build chat history for context and learning
    const history: ChatMessage[] = messages.map(m => ({
      role: m.sender === "visitor" ? "user" : "assistant",
      content: m.content,
    }));

    try {
      // 1. Try server endpoint first
      let resultText = "";
      let actionType: string | undefined;
      let actionData: any = null;
      let navigationTarget: any = null;
      let returnedAudioBase64: string | undefined;

      try {
        const response = await fetch("/api/assistant/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            anonymousSessionId: sessionId,
            message: text,
            mode,
          }),
          signal: AbortSignal.timeout(6000),
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.reply && typeof data.reply === "string" && data.reply.trim().length > 0) {
            resultText = data.reply.trim();
            actionType = data.triggeredAction?.type;
            actionData = data.triggeredAction?.data;
            navigationTarget = data.navigationTarget;
            returnedAudioBase64 = data.audioBase64;
          }
        }
      } catch (_) {}

      // 2. If server didn't provide dynamic reply, invoke dynamic engine directly with memory
      if (!resultText) {
        const dynamicRes = await generateDynamicAssistantResponse(history, text, currentImages);
        resultText = dynamicRes.reply;
        actionType = dynamicRes.actionType;
        actionData = dynamicRes.actionData;
        navigationTarget = dynamicRes.navigationTarget;
      }

      const assistantMsg: MessageItem = {
        id: `asst_${Date.now()}`,
        sender: "assistant",
        content: resultText,
        mode,
        actionType,
        actionData,
      };

      setMessages(prev => [...prev, assistantMsg]);

      // If in Voice-to-Voice mode, speak the reply aloud with studio human voice!
      if (isVoiceToVoiceRef.current) {
        setVoiceStatus("speaking");
        playHumanSpeech({
          text: resultText,
          voice: "nova",
          audioBase64: returnedAudioBase64,
          onStart: () => {
            console.log("[VoiceTurn] Assistant speech playback active (Avatar state: speaking)");
            if (isVoiceToVoiceRef.current) {
              setVoiceStatus("speaking");
            }
          },
          onEnd: () => {
            console.log("[VoiceTurn] Assistant speech playback completed (Avatar state: listening)");
            if (isVoiceToVoiceRef.current) {
              setVoiceStatus("listening");
              startListening("voicetovoice");
            } else {
              setVoiceStatus("idle");
            }
          },
          onError: (err) => {
            console.warn("[VoiceTurn] Assistant speech playback error, resuming listening:", err);
            if (isVoiceToVoiceRef.current) {
              setVoiceStatus("listening");
              startListening("voicetovoice");
            } else {
              setVoiceStatus("idle");
            }
          },
        });
      }

      // Smooth section navigation if requested
      if (navigationTarget) {
        setTimeout(() => {
          transitionManager.transitionTo({
            destination: navigationTarget.anchor,
            label: navigationTarget.label,
          });
        }, 800);
      }
    } catch (err) {
      console.error("Chat error:", err);
      if (mode === "voice") setVoiceStatus("idle");
    } finally {
      setIsLoading(false);
      setCurrentProgress(null);
    }
  };

  // Handle Image Upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setAttachedFiles(prev => [...prev, ...files]);

      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            setAttachedPreviews(prev => [...prev, ev.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Draggable circular floating button logic
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: pos.x,
      posY: pos.y,
    };

    const handlePointerMove = (moveEv: PointerEvent) => {
      const dx = moveEv.clientX - dragStartRef.current.mouseX;
      const dy = moveEv.clientY - dragStartRef.current.mouseY;
      if (Math.hypot(dx, dy) > 5) {
        isDraggingRef.current = true;
      }
      setPos({
        x: Math.max(10, Math.min(window.innerWidth - 90, dragStartRef.current.posX - dx)),
        y: Math.max(10, Math.min(window.innerHeight - 90, dragStartRef.current.posY - dy)),
      });
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  // Fetch owner data
  const openOwnerDashboard = async () => {
    try {
      const res = await fetch("/api/assistant/owner-data");
      const d = await res.json();
      if (d.success) {
        setOwnerData(d.data);
        setShowOwnerView(true);
      }
    } catch (_) {}
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. MOVABLE CIRCULAR FLOATING TRIGGER WITH FULLY ENHANCED LOGO SVG & 'Bot' */}
      {/* ========================================================================= */}
      <div
        style={{
          position: "fixed",
          right: `${pos.x}px`,
          bottom: `${pos.y}px`,
          zIndex: 9999,
          touchAction: "none",
        }}
        onPointerDown={handlePointerDown}
        className="select-none flex items-center gap-2 group cursor-grab active:cursor-grabbing"
      >
        {/* Soft luxury ambient glow */}
        <div className="absolute inset-0 rounded-full bg-[#E0B9A0] opacity-25 blur-xl group-hover:opacity-50 transition-opacity pointer-events-none" />

        {/* Circular Floating Button: Logo SVG is ENHANCED in size, filling the circle */}
        <button
          type="button"
          onClick={() => {
            if (!isDraggingRef.current) {
              setIsOpen(true);
            }
          }}
          className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#121110] hover:bg-[#1f1d1b] border-2 border-[#E0B9A0] hover:border-[#FAF8F5] text-white flex items-center justify-center shadow-[0_12px_45px_rgba(0,0,0,0.75)] transition-all duration-300 transform group-hover:scale-105 p-2.5"
          aria-label="Open Bot"
          title="Open Bot"
        >
          {/* Logo SVG: Fully visible and enhanced, NOT shrunk, zero text inside */}
          <div className="w-full h-full flex items-center justify-center">
            <YanhalLogoSvg className="w-full h-full drop-shadow-[0_2px_10px_rgba(224,185,160,0.4)]" />
          </div>
        </button>

        {/* One-Tap 'Bot' Tag beside the circle */}
        <button
          type="button"
          onClick={() => {
            if (!isDraggingRef.current) {
              setIsOpen(true);
            }
          }}
          className="bg-[#121110]/95 hover:bg-[#2D2926] border border-[#E0B9A0]/70 text-[#FAF8F5] text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md transition-all group-hover:border-[#E0B9A0]"
        >
          Bot
        </button>
      </div>

      {/* Hidden file input for attachments */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* ========================================================================= */}
      {/* 2. CHATGPT-STYLE MODAL INTERFACE                                          */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isOpen && (
          <div
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              data-lenis-prevent="true"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="relative w-full h-full sm:h-[88vh] sm:max-w-4xl bg-[#FAF8F5] text-[#2D2926] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-black/10"
            >
              {/* Header Bar: Increased logo SVG size + reads strictly 'Bot' beside it */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/5 bg-white/70 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#181514] p-1.5 flex items-center justify-center shadow-inner">
                    <YanhalLogoSvg className="w-full h-full" />
                  </div>
                  <span className="text-base font-bold tracking-tight text-neutral-900">
                    Bot
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Staff Review Button */}
                  <button
                    onClick={openOwnerDashboard}
                    className="text-[11px] text-neutral-500 hover:text-neutral-900 border border-neutral-300 hover:border-neutral-500 px-2.5 py-1 rounded-md transition-colors font-medium"
                    title="Authorized Staff Inspection"
                  >
                    Staff Review
                  </button>

                  {/* Close Button */}
                  <button
                    onClick={() => {
                      cancelVoiceMode();
                      setIsOpen(false);
                    }}
                    className="w-8 h-8 rounded-full hover:bg-neutral-200 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors"
                    aria-label="Close"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Main Content: Voice-to-Voice Mode OR Standard ChatGPT-style Chat */}
              {isVoiceToVoice ? (
                /* ========================================================================= */
                /* 3. VOICE-TO-VOICE TWO-WAY CONVERSATION SECTION (White background & 3D Bot)*/
                /* ========================================================================= */
                <div className="flex-1 flex flex-col items-center justify-between p-6 sm:p-10 bg-white text-neutral-900 relative">
                  {/* Top Bar: Clean minimal navigation */}
                  <div className="flex items-center justify-end w-full">
                    <button
                      type="button"
                      onClick={cancelVoiceMode}
                      className="text-xs text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1.5 font-medium shadow-sm"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      Switch to Text
                    </button>
                  </div>

                  {/* Center Area: Bot Avatar & Live Dialogue */}
                  <div className="my-auto flex flex-col items-center justify-center max-w-lg w-full">
                    {/* Bot Avatar strictly using the exact user-provided SVG */}
                    <BotAvatar3D
                      status={voiceStatus}
                      size={145}
                      className="mb-6"
                    />

                    {/* Status label: listening, thinking, speaking */}
                    <div className="flex items-center gap-2 mb-2">
                      {voiceStatus === "listening" && (
                        <span className="flex gap-1.5 items-center">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                            Listening to you...
                          </span>
                        </span>
                      )}
                      {voiceStatus === "thinking" && (
                        <span className="flex gap-1.5 items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:150ms]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:300ms]" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 ml-1">
                            Thinking...
                          </span>
                        </span>
                      )}
                      {voiceStatus === "speaking" && (
                        <span className="flex gap-1.5 items-center">
                          <span className="w-2 h-2 rounded-full bg-[#AE917E] animate-pulse" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#AE917E]">
                            Speaking...
                          </span>
                        </span>
                      )}
                      {voiceStatus === "idle" && (
                        <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                          Ready
                        </span>
                      )}
                    </div>

                    {/* Permission / Network Error Notice if any */}
                    {voiceError && (
                      <div className="w-full mt-3 text-center px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium shadow-sm">
                        {voiceError}
                      </div>
                    )}
                  </div>

                  {/* Bottom Controls: Clean Cancel Button indicating an X */}
                  <div className="flex items-center justify-center w-full pt-4 pb-2">
                    <button
                      type="button"
                      onClick={cancelVoiceMode}
                      className="w-14 h-14 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
                      title="Cancel voice conversation"
                      aria-label="Cancel voice conversation"
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                /* ========================================================================= */
                /* 4. CHATGPT-STYLE TEXT CHAT SECTION                                        */
                /* ========================================================================= */
                <div className="flex-1 flex flex-col justify-between overflow-hidden relative">
                  {/* Messages Area */}
                  <div
                    ref={chatScrollRef}
                    data-lenis-prevent="true"
                    onWheel={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                    style={{ overscrollBehavior: "contain", WebkitOverflowScrolling: "touch" }}
                    className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6"
                  >
                    {messages.length === 0 ? (
                      /* Zero state: strictly matches screenshot "Ready when you are." */
                      <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center select-none">
                        <h2 className="text-3xl sm:text-4xl font-normal text-neutral-800 tracking-tight mb-2">
                          Ready when you are.
                        </h2>
                        <p className="text-sm text-neutral-500 max-w-sm leading-relaxed">
                          Ask about project estimates, blueprint process, our services, or explore completed works.
                        </p>

                        {/* Quick Prompts */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-8 max-w-md w-full">
                          {[
                            "Estimate a 200 sqm residential project",
                            "What is your Blueprint Process?",
                            "Check consultation availability",
                            "Where is Yanhal headquarters located?"
                          ].map((prompt, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSend(prompt, "text")}
                              className="text-left text-xs text-neutral-600 bg-white hover:bg-neutral-100 border border-neutral-200 p-3 rounded-xl transition-all shadow-sm"
                            >
                              {prompt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* Active Conversation */
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex gap-3.5 ${msg.sender === "visitor" ? "justify-end" : "justify-start"}`}
                        >
                          {msg.sender === "assistant" && (
                            <div className="w-8 h-8 rounded-full bg-[#181514] p-1.5 border border-[#E0B9A0]/50 shrink-0 flex items-center justify-center shadow-sm">
                              <YanhalLogoSvg className="w-full h-full" />
                            </div>
                          )}

                          <div
                            className={`max-w-[85%] sm:max-w-xl text-sm leading-relaxed ${
                              msg.sender === "visitor"
                                ? "bg-neutral-900 text-white rounded-2xl rounded-br-none px-4 py-3 shadow-md"
                                : "bg-white text-neutral-900 rounded-2xl rounded-tl-none px-5 py-4 border border-neutral-200/80 shadow-sm"
                            }`}
                          >
                            {/* Attached images preview */}
                            {msg.attachedImages && msg.attachedImages.length > 0 && (
                              <div className="flex gap-2 mb-3 overflow-x-auto">
                                {msg.attachedImages.map((src, i) => (
                                  <img key={i} src={src} alt="Attached" className="h-24 w-auto rounded-lg object-cover border border-white/20 shadow-sm" />
                                ))}
                              </div>
                            )}

                            {/* Clean Paragraphs */}
                            <div className="space-y-2 whitespace-pre-wrap">
                              {msg.content}
                            </div>

                            {/* Action Data Rendering */}
                            {msg.actionType === "estimate_calculated" && msg.actionData && (
                              <div className="mt-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-800">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#AE917E]">
                                    Indicative Estimate
                                  </span>
                                  <span className="text-xs text-neutral-500">
                                    {msg.actionData.sizeSqm} m² • {msg.actionData.serviceDepth}
                                  </span>
                                </div>
                                <div className="text-lg font-bold text-neutral-900">
                                  KES {msg.actionData.minKes.toLocaleString()} – KES {msg.actionData.maxKes.toLocaleString()}
                                </div>
                                <div className="text-xs text-neutral-500 mb-3">
                                  Approx. ${msg.actionData.minUsd.toLocaleString()} – ${msg.actionData.maxUsd.toLocaleString()} USD
                                </div>
                                <button
                                  onClick={() => handleSend("Send summary to my email", "text")}
                                  className="w-full py-2 bg-[#2D2926] text-white hover:bg-[#181514] text-xs font-medium rounded-lg transition-colors"
                                >
                                  Email Me This Estimate
                                </button>
                              </div>
                            )}

                            {msg.actionType === "slots_offered" && msg.actionData?.slots && (
                              <div className="mt-4 space-y-2">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-[#AE917E] block">
                                  Verified Available Openings
                                </span>
                                {msg.actionData.slots.slice(0, 3).map((slot: any) => (
                                  <button
                                    key={slot.slotId}
                                    onClick={() => {
                                      handleSend(`Confirm appointment for ${slot.displayTime}`, "text");
                                    }}
                                    className="w-full text-left p-2.5 rounded-lg bg-neutral-50 hover:bg-[#E0B9A0]/20 border border-neutral-200 text-xs font-medium text-neutral-800 transition-colors flex justify-between items-center"
                                  >
                                    <span>{slot.displayTime}</span>
                                    <span className="text-emerald-600 font-semibold">Book</span>
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Verified Company Headquarters with Google Maps & Satellite View */}
                            {msg.actionType === "company_location" && msg.actionData && (
                              <div className="mt-4 rounded-xl bg-neutral-50 border border-neutral-200 overflow-hidden text-neutral-800 shadow-sm">
                                <div className="p-3.5 bg-white border-b border-neutral-200">
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#AE917E] flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                      Owner-Verified Headquarters
                                    </span>
                                    <span className="text-[11px] text-neutral-500 font-medium">South C, Nairobi</span>
                                  </div>
                                  <h4 className="font-bold text-neutral-900 text-sm">{msg.actionData.name}</h4>
                                  <p className="text-xs text-neutral-600 mt-0.5">{msg.actionData.address}</p>
                                </div>

                                {/* Map & Satellite Interactive View */}
                                <div className="relative w-full h-48 bg-neutral-200">
                                  <iframe
                                    title="Yanhal Headquarters Location"
                                    src={mapViewModes[msg.id] === 'satellite' ? msg.actionData.embedSatelliteUrl : msg.actionData.embedMapUrl}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                  />
                                  {/* View Switcher Chips (Map vs Satellite) */}
                                  <div className="absolute top-2 right-2 flex bg-white/90 backdrop-blur-sm rounded-lg p-0.5 shadow-md border border-neutral-200 text-[11px] font-medium z-10">
                                    <button
                                      type="button"
                                      onClick={() => setMapViewModes(prev => ({ ...prev, [msg.id]: 'map' }))}
                                      className={`px-2.5 py-1 rounded-md transition-colors ${
                                        mapViewModes[msg.id] !== 'satellite' ? 'bg-neutral-900 text-white font-semibold' : 'text-neutral-600 hover:text-neutral-900'
                                      }`}
                                    >
                                      Map View
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setMapViewModes(prev => ({ ...prev, [msg.id]: 'satellite' }))}
                                      className={`px-2.5 py-1 rounded-md transition-colors ${
                                        mapViewModes[msg.id] === 'satellite' ? 'bg-neutral-900 text-white font-semibold' : 'text-neutral-600 hover:text-neutral-900'
                                      }`}
                                    >
                                      Satellite View
                                    </button>
                                  </div>
                                </div>

                                {/* Direct Navigation Buttons */}
                                <div className="p-3 bg-white flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-neutral-200">
                                  <a
                                    href={msg.actionData.mapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto text-center px-3.5 py-2 bg-[#181514] text-white hover:bg-neutral-800 text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                      <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                                      <circle cx="12" cy="10" r="3" />
                                    </svg>
                                    Open Direct Location in Google Maps
                                  </a>
                                  <a
                                    href={msg.actionData.satelliteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-neutral-600 hover:text-neutral-900 font-medium underline transition-colors"
                                  >
                                    View Full Satellite Pin ↗
                                  </a>
                                </div>
                              </div>
                            )}

                            {msg.actionType === "places_found" && msg.actionData && (
                              <div className="mt-3 p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-700">
                                <p className="font-semibold text-neutral-900 mb-1">
                                  {msg.actionData[0]?.name}
                                </p>
                                <p className="text-neutral-500 mb-2">
                                  {msg.actionData[0]?.formattedAddress}
                                </p>
                                <a
                                  href={msg.actionData[0]?.mapsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#AE917E] hover:underline font-medium inline-flex items-center gap-1"
                                >
                                  Open on Google Maps →
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}

                    {/* Dedicated Active Typing Indicator Bubble */}
                    {isLoading && (
                      <div className="flex gap-3.5 justify-start items-center">
                        <div className="w-8 h-8 rounded-full bg-[#181514] p-1.5 border border-[#E0B9A0]/50 shrink-0 flex items-center justify-center shadow-sm">
                          <YanhalLogoSvg className="w-full h-full" />
                        </div>
                        <div className="bg-white text-neutral-800 rounded-2xl rounded-tl-none px-4 py-3 border border-neutral-200/80 shadow-sm flex items-center gap-2.5">
                          <span className="flex gap-1 items-center">
                            <span className="w-2 h-2 rounded-full bg-[#AE917E] animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-2 h-2 rounded-full bg-[#AE917E] animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-2 h-2 rounded-full bg-[#AE917E] animate-bounce" style={{ animationDelay: "300ms" }} />
                          </span>
                          <span className="text-xs text-neutral-500 font-medium">
                            {currentProgress || "Bot is typing..."}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Attached files preview chips */}
                  {attachedPreviews.length > 0 && (
                    <div className="px-6 py-2 flex gap-2 overflow-x-auto bg-neutral-100 border-t border-neutral-200 shrink-0">
                      {attachedPreviews.map((src, i) => (
                        <div key={i} className="relative group shrink-0">
                          <img src={src} alt="Upload" className="h-14 w-14 rounded-lg object-cover border border-neutral-300 shadow-sm" />
                          <button
                            onClick={() => {
                              setAttachedPreviews(p => p.filter((_, idx) => idx !== i));
                              setAttachedFiles(f => f.filter((_, idx) => idx !== i));
                            }}
                            className="absolute -top-1.5 -right-1.5 bg-neutral-800 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ChatGPT-style Input Bar (strictly matches user's screenshot) */}
                  <div className="p-4 sm:p-6 bg-white border-t border-neutral-200/80 shrink-0">
                    <div className="relative max-w-3xl mx-auto flex items-center bg-[#F4F4F4] hover:bg-[#EEEEEE] focus-within:bg-white rounded-full border border-neutral-200 focus-within:border-neutral-400 focus-within:shadow-md transition-all px-3 py-1.5">
                      {/* Plus icon on far left for image upload */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200 transition-colors shrink-0"
                        title="Upload images or documents"
                        aria-label="Upload attachments"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </button>

                      {/* Main text box */}
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        placeholder="Ask YanhalBot"
                        className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-sm text-neutral-800 placeholder-neutral-500"
                      />

                      {/* Instant selector chip */}
                      <div className="hidden sm:flex items-center gap-1 text-xs text-neutral-500 font-medium px-2 py-1 rounded hover:bg-neutral-200/60 cursor-pointer select-none shrink-0">
                        <span>Instant</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </div>

                      {/* Microphone icon for dictation: text appears in box upon completion */}
                      <button
                        type="button"
                        onClick={() => {
                          if (isDictating) {
                            stopListening();
                          } else {
                            startListening("dictation");
                          }
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 ml-1 ${
                          isDictating 
                            ? "text-white bg-red-600 shadow-md animate-pulse ring-2 ring-red-400/50" 
                            : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/80"
                        }`}
                        title={isDictating ? "Stop dictation" : "Dictate message"}
                        aria-label="Dictate message"
                      >
                        {isDictating ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="5" y="5" width="14" height="14" rx="2" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                          </svg>
                        )}
                      </button>

                      {/* Blue circular voice button on the far right (takes user into voice-to-voice section) */}
                      <button
                        type="button"
                        onClick={openVoiceToVoice}
                        className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-md transition-transform hover:scale-105 shrink-0 ml-2"
                        title="Start Voice-to-Voice Conversation"
                        aria-label="Start Voice-to-Voice"
                      >
                        {/* Audio wave vertical lines icon */}
                        <div className="flex items-center gap-0.5">
                          <span className="w-0.5 h-3 bg-white rounded-full" />
                          <span className="w-0.5 h-4.5 bg-white rounded-full" />
                          <span className="w-0.5 h-2.5 bg-white rounded-full" />
                          <span className="w-0.5 h-3.5 bg-white rounded-full" />
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 5. OWNER / STAFF INSPECTION VIEW MODAL                                    */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showOwnerView && (
          <div
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              data-lenis-prevent="true"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl max-h-[85vh] bg-[#181514] text-[#FAF8F5] border border-[#E0B9A0]/40 rounded-2xl flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#2D2926]">
                <h3 className="text-sm font-bold tracking-wider uppercase text-[#E0B9A0]">
                  Yanhal Staff & Owner Inspection Console
                </h3>
                <button
                  onClick={() => setShowOwnerView(false)}
                  className="text-stone-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-stone-300">
                <div>
                  <h4 className="font-bold text-white mb-2 uppercase tracking-wide">
                    Enquiries ({ownerData?.enquiries?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {ownerData?.enquiries?.map((enq: any) => (
                      <div key={enq.id} className="p-3 bg-white/5 rounded-lg border border-white/5">
                        <div className="flex justify-between text-white font-semibold">
                          <span>{enq.project_type} • {enq.service_depth}</span>
                          <span className="text-[#E0B9A0]">{enq.status}</span>
                        </div>
                        <p className="mt-1 text-stone-400">Location: {enq.location_name} • Size: {enq.size_sqm} m²</p>
                        <p className="text-stone-400">Budget: {enq.budget_range || "Not specified"}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-white mb-2 uppercase tracking-wide">
                    Confirmed Appointments ({ownerData?.appointments?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {ownerData?.appointments?.map((appt: any) => (
                      <div key={appt.id} className="p-3 bg-white/5 rounded-lg border border-white/5 flex justify-between">
                        <div>
                          <p className="text-white font-semibold">{new Date(appt.start_time).toLocaleString()} EAT</p>
                          <p className="text-stone-400">{appt.location_address}</p>
                        </div>
                        <span className="text-emerald-400 font-semibold">{appt.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-white mb-2 uppercase tracking-wide">
                    Notification & Email Delivery Logs ({ownerData?.notifications?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {ownerData?.notifications?.map((notif: any) => (
                      <div key={notif.id} className="p-3 bg-white/5 rounded-lg border border-white/5 flex justify-between">
                        <div>
                          <p className="text-white font-semibold">{notif.subject}</p>
                          <p className="text-stone-400">To: {notif.recipient_email} • Type: {notif.type}</p>
                        </div>
                        <span className={notif.status === "sent" ? "text-emerald-400" : "text-amber-400"}>
                          {notif.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
