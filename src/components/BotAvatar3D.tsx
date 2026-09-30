import React, { useState, useEffect, useRef } from "react";

export type BotVoiceStatus = "idle" | "listening" | "thinking" | "speaking";

export type GrokMood =
  | "neutral"
  | "attentive"
  | "surprised"
  | "excited"
  | "happy"
  | "laughing"
  | "angry"
  | "sad"
  | "scared"
  | "suspicious"
  | "confused"
  | "curious"
  | "proud"
  | "shy"
  | "unimpressed"
  | "sleepy";

interface EyeData {
  w: number;
  h: number;
  tilt: number;
  open: number;
}

interface GrokState {
  id: GrokMood;
  gaze: { yaw: number; pitch: number; roll: number };
  split: number;
  eyes: [EyeData, EyeData];
}

// 16 Exact Grok Bot Expressions from bloub.vercel.app / x.ai reference
const eyeDef = (w: number, h: number, tilt = 0, open = 1): EyeData => ({ w, h, tilt, open });
const eyePair = (w: number, h: number, tilt = 0, open = 1): [EyeData, EyeData] => [
  eyeDef(w, h, tilt, open),
  eyeDef(w, h, -tilt, open),
];

const GROK_EXPRESSIONS: Record<GrokMood, GrokState> = {
  neutral: {
    id: "neutral",
    gaze: { yaw: 28.49, pitch: 28.62, roll: -13 },
    split: 15.46,
    eyes: [eyeDef(0.186, 0.412), eyeDef(0.186, 0.412)],
  },
  attentive: {
    id: "attentive",
    gaze: { yaw: 4, pitch: 5, roll: -4 },
    split: 16,
    eyes: eyePair(0.21, 0.44),
  },
  surprised: {
    id: "surprised",
    gaze: { yaw: 3, pitch: -3, roll: 0 },
    split: 19,
    eyes: eyePair(0.45, 0.47),
  },
  excited: {
    id: "excited",
    gaze: { yaw: 6, pitch: -14, roll: 0 },
    split: 19.5,
    eyes: eyePair(0.4, 0.56, -10),
  },
  happy: {
    id: "happy",
    gaze: { yaw: 5, pitch: 9, roll: 0 },
    split: 17,
    eyes: eyePair(0.27, 0.17, 14),
  },
  laughing: {
    id: "laughing",
    gaze: { yaw: 4, pitch: 14, roll: 0 },
    split: 18,
    eyes: eyePair(0.34, 0.13, 20),
  },
  angry: {
    id: "angry",
    gaze: { yaw: 3, pitch: 7, roll: 0 },
    split: 17,
    eyes: eyePair(0.34, 0.15, 30),
  },
  sad: {
    id: "sad",
    gaze: { yaw: 3, pitch: -13, roll: 0 },
    split: 16,
    eyes: eyePair(0.22, 0.4, -28),
  },
  scared: {
    id: "scared",
    gaze: { yaw: 2, pitch: -20, roll: 0 },
    split: 20.5,
    eyes: eyePair(0.4, 0.6),
  },
  suspicious: {
    id: "suspicious",
    gaze: { yaw: 12, pitch: 6, roll: -6 },
    split: 16,
    eyes: [eyeDef(0.21, 0.4), eyeDef(0.22, 0.15)],
  },
  confused: {
    id: "confused",
    gaze: { yaw: -14, pitch: 3, roll: 8 },
    split: 16.5,
    eyes: [eyeDef(0.2, 0.44, -18), eyeDef(0.28, 0.17, 14)],
  },
  curious: {
    id: "curious",
    gaze: { yaw: 16, pitch: -9, roll: -15 },
    split: 16.5,
    eyes: [eyeDef(0.24, 0.46, -8), eyeDef(0.2, 0.38, -8)],
  },
  proud: {
    id: "proud",
    gaze: { yaw: 5, pitch: 17, roll: 0 },
    split: 17,
    eyes: eyePair(0.3, 0.15, 18),
  },
  shy: {
    id: "shy",
    gaze: { yaw: -19, pitch: -14, roll: -7 },
    split: 14,
    eyes: eyePair(0.17, 0.3),
  },
  unimpressed: {
    id: "unimpressed",
    gaze: { yaw: -22, pitch: 2, roll: 0 },
    split: 16,
    eyes: eyePair(0.3, 0.12),
  },
  sleepy: {
    id: "sleepy",
    gaze: { yaw: 6, pitch: -9, roll: -3 },
    split: 16,
    eyes: eyePair(0.2, 0.42, 0, 0.42),
  },
};

const toRad = (deg: number) => (deg * Math.PI) / 180;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function rot3D(v1: number[], v2: number[], ang: number): [number[], number[]] {
  const c = Math.cos(ang), s = Math.sin(ang);
  return [
    [v1[0]*c + v2[0]*s, v1[1]*c + v2[1]*s, v1[2]*c + v2[2]*s],
    [v2[0]*c - v1[0]*s, v2[1]*c - v1[1]*s, v2[2]*c - v1[2]*s],
  ];
}

// 3D Spherical Projection Function from bloub.vercel.app
function projectEyeOnSphere(
  gaze: { yaw: number; pitch: number; roll: number },
  radius: number,
  split: number,
  sign: number
) {
  let r = [0, 0, 1], i = [1, 0, 0], a = [0, 1, 0];
  [r, i] = rot3D(r, i, toRad(gaze.yaw));
  [a, r] = rot3D(a, r, toRad(gaze.pitch));
  [i, a] = rot3D(i, a, toRad(gaze.roll));

  const [o, s] = rot3D(r, i, toRad(split * sign));
  return {
    x: o[0] * radius,
    y: o[1] * radius,
    depth: o[2],
    tiltDeg: (Math.atan2(s[1], s[0]) * 180) / Math.PI,
  };
}

interface BotAvatar3DProps {
  status?: BotVoiceStatus;
  className?: string;
  size?: number; // default 145px
}

/**
 * YanhalBot Avatar strictly powered by Grok's 3D Spherical Expression Engine
 * Recreates the exact multi-directional wandering, eyelid blinking, breathing,
 * and natural expression interpolation from https://bloub.vercel.app/
 */
export default function BotAvatar3D({
  status = "idle",
  className = "",
  size = 145,
}: BotAvatar3DProps) {
  // Target expression based on conversational status or random idle mood
  const [targetMood, setTargetMood] = useState<GrokMood>("neutral");

  // Current interpolated state for 60fps rendering
  const currentStateRef = useRef<GrokState>({ ...GROK_EXPRESSIONS.neutral });
  const [renderFrame, setRenderFrame] = useState(0);

  // Time tracking for wander & breath
  const startTimeRef = useRef(Date.now());
  const nextBlinkTimeRef = useRef(Date.now() + 2500);
  const blinkDuration = 180; // ms
  const isBlinkingRef = useRef(false);

  // Update target mood when status changes
  useEffect(() => {
    if (status === "listening") {
      setTargetMood("attentive");
    } else if (status === "thinking") {
      setTargetMood("curious");
    } else if (status === "speaking") {
      setTargetMood("happy");
    } else {
      setTargetMood("neutral");
    }
  }, [status]);

  // Natural unhurried expression shifts during idle or conversation (4.5s – 7s)
  useEffect(() => {
    let timer: any;

    const scheduleNextShift = () => {
      const delay = 4500 + Math.random() * 2500;
      timer = setTimeout(() => {
        if (status === "idle") {
          const idlePool: GrokMood[] = [
            "neutral",
            "attentive",
            "curious",
            "thoughtful" as any, // fallback to curious if thoughtful
            "proud",
            "sleepy",
            "neutral",
            "unimpressed",
            "shy",
          ].filter(m => GROK_EXPRESSIONS[m as GrokMood]) as GrokMood[];
          const next = idlePool[Math.floor(Math.random() * idlePool.length)];
          setTargetMood(next);
        } else if (status === "speaking") {
          const speakPool: GrokMood[] = ["happy", "attentive", "laughing", "excited"];
          setTargetMood(speakPool[Math.floor(Math.random() * speakPool.length)]);
        } else if (status === "thinking") {
          const thinkPool: GrokMood[] = ["curious", "confused"];
          setTargetMood(thinkPool[Math.floor(Math.random() * thinkPool.length)]);
        }
        scheduleNextShift();
      }, delay);
    };

    scheduleNextShift();
    return () => clearTimeout(timer);
  }, [status]);

  // Animation Frame Loop: Continuous Smooth Interpolation, Organic Wander, Breathing & Blinking
  useEffect(() => {
    let animId: number;

    const tick = () => {
      const now = Date.now();
      const elapsed = (now - startTimeRef.current) / 1000;

      // Handle Blinking
      let lidOpen = 1;
      if (now > nextBlinkTimeRef.current) {
        isBlinkingRef.current = true;
        const blinkProgress = (now - nextBlinkTimeRef.current) / blinkDuration;
        if (blinkProgress >= 1) {
          isBlinkingRef.current = false;
          nextBlinkTimeRef.current = now + 2400 + Math.random() * 3200;
          lidOpen = 1;
        } else {
          lidOpen = blinkProgress < 0.45 ? 1 - blinkProgress / 0.45 : (blinkProgress - 0.45) / 0.55;
          lidOpen = Math.max(0.08, lidOpen);
        }
      }

      // Smooth Lerp towards target expression (0.045 = ~0.8s smooth transition)
      const target = GROK_EXPRESSIONS[targetMood] || GROK_EXPRESSIONS.neutral;
      const curr = currentStateRef.current;

      curr.gaze.yaw = lerp(curr.gaze.yaw, target.gaze.yaw, 0.05);
      curr.gaze.pitch = lerp(curr.gaze.pitch, target.gaze.pitch, 0.05);
      curr.gaze.roll = lerp(curr.gaze.roll, target.gaze.roll, 0.05);
      curr.split = lerp(curr.split, target.split, 0.05);

      for (let j = 0; j < 2; j++) {
        curr.eyes[j].w = lerp(curr.eyes[j].w, target.eyes[j].w, 0.055);
        curr.eyes[j].h = lerp(curr.eyes[j].h, target.eyes[j].h, 0.055);
        curr.eyes[j].tilt = lerp(curr.eyes[j].tilt, target.eyes[j].tilt, 0.055);
        curr.eyes[j].open = lerp(curr.eyes[j].open, target.eyes[j].open, 0.055);
      }

      setRenderFrame(prev => (prev + 1) % 10000);
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [targetMood]);

  // Compute Current Physics: Organic Wander & Float
  const now = Date.now();
  const elapsed = (now - startTimeRef.current) / 1000;

  // Grok wander harmonics
  const wanderYaw = Math.sin(elapsed * 0.6) * 3.5 + Math.sin(elapsed * 1.4) * 1.2;
  const wanderPitch = Math.sin(elapsed * 0.5) * 2.8 + Math.sin(elapsed * 1.1) * 1.0;
  const wanderRoll = Math.sin(elapsed * 0.4) * 1.5;

  const currentGaze = {
    yaw: currentStateRef.current.gaze.yaw + wanderYaw,
    pitch: currentStateRef.current.gaze.pitch + wanderPitch,
    roll: currentStateRef.current.gaze.roll + wanderRoll,
  };

  // Breathing and gentle vertical float
  const floatY = Math.sin(elapsed * 1.5) * 2.2;
  const floatRotate = Math.sin(elapsed * 0.8) * 0.3;

  // Blink state
  const isBlinkingNow = isBlinkingRef.current;
  const blinkLid = isBlinkingNow ? 0.1 : 1;

  // Sphere dimensions
  const sphereRadius = 66; // projection radius
  const cx = 114.27;
  const cy = 114.23;

  // Project eyes with exact 3D spherical geometry
  const eye0 = projectEyeOnSphere(currentGaze, sphereRadius, currentStateRef.current.split, -1);
  const eye1 = projectEyeOnSphere(currentGaze, sphereRadius, currentStateRef.current.split, 1);

  const eyesData = [
    { ...eye0, def: currentStateRef.current.eyes[0] },
    { ...eye1, def: currentStateRef.current.eyes[1] },
  ];

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <div
        style={{
          width: size,
          height: size,
          transform: `translateY(${floatY}px) rotate(${floatRotate}deg)`,
          transition: "transform 0.1s linear",
        }}
        className="relative flex items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="-20 -20 270 270"
          width={size}
          height={size}
          className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.16)]"
        >
          <defs>
            {/* Yanhal Application Luxury Gradient: Terracotta-Bronze Charcoal to Deep Obsidian */}
            <radialGradient id="grok-yanhal-gradient" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#4A3D36" />
              <stop offset="32%" stopColor="#302621" />
              <stop offset="70%" stopColor="#1C1614" />
              <stop offset="100%" stopColor="#0B0908" />
            </radialGradient>
            <linearGradient id="grok-yanhal-rim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E0B9A0" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#AE917E" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#8E6822" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Authentic Body Contour filled with Yanhal Application Gradient */}
          <path
            d="M228.541 114.228C228.541 130.133 225.184 145.994 218.738 160.534C212.674 174.217 203.904 186.669 193.065 196.988C155.933 232.34 99.497 238.596 55.5255 212.24C45.097 205.99 35.6851 198.072 27.7451 188.866C19.1926 178.953 12.3686 167.569 7.65781 155.351C2.60712 142.264 0 128.257 0 114.228C0 98.3219 3.35751 82.4611 9.80315 67.9215C15.8672 54.2382 24.6377 41.7862 35.4767 31.4668C72.6081 -3.88483 129.044 -10.1413 173.016 16.2153C183.444 22.4653 192.856 30.3829 200.796 39.5896C209.349 49.5018 216.173 60.8859 220.883 73.1037C225.934 86.1906 228.541 100.198 228.541 114.228Z"
            fill="url(#grok-yanhal-gradient)"
            stroke="url(#grok-yanhal-rim)"
            strokeWidth="1.2"
          />

          {/* 3D Rendered Eye Capsules */}
          <g>
            {eyesData.map((eye, idx) => {
              // Depth-based visibility test
              if (eye.depth < -0.15) return null;

              // Dimensions scaled according to Grok's formula
              const w = Math.max(8, eye.def.w * sphereRadius * 1.8);
              const h = Math.max(6, eye.def.h * sphereRadius * 1.8 * eye.def.open * blinkLid);
              const eyeTilt = eye.tiltDeg + eye.def.tilt;

              // Subtle optical foreshortening based on depth
              const depthFactor = Math.max(0.65, Math.min(1.05, 0.5 + eye.depth * 0.5));
              const finalW = w * depthFactor;
              const finalH = h * (0.8 + 0.2 * depthFactor);

              return (
                <g
                  key={idx}
                  transform={`translate(${cx + eye.x}, ${cy + eye.y}) rotate(${eyeTilt})`}
                >
                  <rect
                    x={-finalW / 2}
                    y={-finalH / 2}
                    width={finalW}
                    height={finalH}
                    rx={finalW / 2}
                    fill="#FFFFFF"
                    className="transition-all"
                  />
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Subtle Warm Ambient Shadow */}
      <div
        style={{
          width: size * 0.55,
          height: 8,
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(45,41,38,0.28) 0%, rgba(45,41,38,0) 70%)",
        }}
        className="mt-2 blur-[2px] pointer-events-none"
      />
    </div>
  );
}
