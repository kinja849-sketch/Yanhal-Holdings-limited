import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const mediaItems = [
  { type: 'image', url: '/media-loop/photo_11_2026-04-30_08-31-22.jpg' },
  { type: 'image', url: '/media-loop/photo_12_2026-04-30_08-27-39.jpg' },
  { type: 'image', url: '/media-loop/photo_12_2026-04-30_08-28-30.jpg' },
  { type: 'image', url: '/media-loop/photo_12_2026-04-30_08-31-22.jpg' },
  { type: 'image', url: '/media-loop/photo_13_2026-04-30_08-27-39.jpg' },
  { type: 'image', url: '/media-loop/photo_13_2026-04-30_08-28-30.jpg' },
  { type: 'image', url: '/media-loop/photo_13_2026-04-30_08-31-22.jpg' },
  { type: 'image', url: '/media-loop/photo_14_2026-04-30_08-27-39.jpg' },
  { type: 'image', url: '/media-loop/photo_14_2026-04-30_08-28-30.jpg' },
  { type: 'image', url: '/media-loop/photo_14_2026-04-30_08-31-22.jpg' },
  { type: 'image', url: '/media-loop/photo_15_2026-04-30_08-27-39.jpg' },
  { type: 'image', url: '/media-loop/photo_15_2026-04-30_08-28-30.jpg' },
  { type: 'image', url: '/media-loop/photo_15_2026-04-30_08-31-22.jpg' },
  { type: 'image', url: '/media-loop/photo_16_2026-04-30_08-27-39.jpg' },
  { type: 'image', url: '/media-loop/photo_16_2026-04-30_08-28-30.jpg' },
  { type: 'image', url: '/media-loop/photo_16_2026-04-30_08-31-22.jpg' },
  { type: 'image', url: '/media-loop/photo_17_2026-04-30_08-27-39.jpg' },
  { type: 'image', url: '/media-loop/photo_17_2026-04-30_08-28-30.jpg' },
  { type: 'image', url: '/media-loop/photo_17_2026-04-30_08-31-22.jpg' },
  { type: 'image', url: '/media-loop/photo_18_2026-04-30_08-27-39.jpg' },
  { type: 'image', url: '/media-loop/photo_18_2026-04-30_08-28-30.jpg' },
  { type: 'image', url: '/media-loop/photo_18_2026-04-30_08-31-22.jpg' },
  { type: 'image', url: '/media-loop/photo_19_2026-04-30_08-27-39.jpg' },
  { type: 'image', url: '/media-loop/photo_19_2026-04-30_08-28-30.jpg' },
  { type: 'image', url: '/media-loop/photo_19_2026-04-30_08-31-22.jpg' },
  { type: 'image', url: '/media-loop/photo_1_2026-04-30_08-27-39.jpg' },
  { type: 'image', url: '/media-loop/photo_1_2026-04-30_08-28-30.jpg' },
  { type: 'image', url: '/media-loop/photo_1_2026-04-30_08-31-22.jpg' },
  { type: 'image', url: '/media-loop/photo_20_2026-04-30_08-27-39.jpg' },
  { type: 'image', url: '/media-loop/photo_20_2026-04-30_08-28-30.jpg' },
  { type: 'image', url: '/media-loop/photo_20_2026-04-30_08-31-22.jpg' },
  { type: 'image', url: '/media-loop/photo_21_2026-04-30_08-28-30.jpg' },
  { type: 'image', url: '/media-loop/photo_21_2026-04-30_08-31-22.jpg' },
  { type: 'image', url: '/media-loop/photo_22_2026-04-30_08-28-30.jpg' },
  { type: 'image', url: '/media-loop/photo_22_2026-04-30_08-31-22.jpg' },
  { type: 'image', url: '/media-loop/photo_2_2026-04-30_08-27-39.jpg' },
  { type: 'image', url: '/media-loop/photo_2_2026-04-30_08-28-30.jpg' },
  { type: 'image', url: '/media-loop/photo_2_2026-04-30_08-31-22.jpg' },
  { type: 'image', url: '/media-loop/photo_3_2026-04-30_08-27-39.jpg' },
  { type: 'image', url: '/media-loop/photo_3_2026-04-30_08-28-30.jpg' },
  { type: 'image', url: '/media-loop/photo_3_2026-04-30_08-31-22.jpg' },
  { type: 'image', url: '/media-loop/photo_4_2026-04-30_08-27-39.jpg' },
  { type: 'image', url: '/media-loop/photo_4_2026-04-30_08-28-30.jpg' },
  { type: 'image', url: '/media-loop/photo_4_2026-04-30_08-31-22.jpg' },
  { type: 'image', url: '/media-loop/photo_5_2026-04-30_08-27-39.jpg' },
  { type: 'image', url: '/media-loop/photo_5_2026-04-30_08-28-30.jpg' },
  { type: 'image', url: '/media-loop/photo_5_2026-04-30_08-31-22.jpg' },
  { type: 'image', url: '/media-loop/photo_6_2026-04-30_08-27-39.jpg' },
  { type: 'video', url: '/media-loop/video-loop-2.mp4', thumb: 'https://images.unsplash.com/photo-1541888086425-d81bb19240f5?q=80&w=600&auto=format&fit=crop' },
  { type: 'video', url: '/media-loop/video-loop-3.mp4', thumb: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&auto=format&fit=crop' },
  { type: 'video', url: '/media-loop/video-loop-4.mp4', thumb: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=600&auto=format&fit=crop' },
  { type: 'video', url: '/media-loop/video-loop-5.mp4', thumb: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=600&auto=format&fit=crop' },
  { type: 'video', url: '/media-loop/video-loop-1.mp4', thumb: 'https://images.unsplash.com/photo-1541888086425-d81bb19240f5?q=80&w=600&auto=format&fit=crop' }
];

export default function InfiniteMediaLoop() {
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Lazy activate ticker only when scrolled into view
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin: "200px" }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (modalOpen && activeVideo && videoRef.current) {
      // Audio fix for "one side only" issue
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const source = ctx.createMediaElementSource(videoRef.current);
        const merger = ctx.createChannelMerger(1);
        const splitter = ctx.createChannelSplitter(2);

        // Connect both L and R channels to the single mono merger channel
        source.connect(splitter);
        splitter.connect(merger, 0, 0); // Left to mono
        splitter.connect(merger, 1, 0); // Right to mono
        
        merger.connect(ctx.destination);

        return () => {
          source.disconnect();
          merger.disconnect();
          splitter.disconnect();
        };
      } catch (e) {
        console.error("Audio correction failed:", e);
      }
    }
  }, [modalOpen, activeVideo]);

  // Duplicate items for the seamless loop
  const loopItems = [...mediaItems, ...mediaItems];

  return (
    <div ref={containerRef} className="w-full py-24 sm:py-32 bg-transparent overflow-hidden relative">
      <style>{`
        @keyframes scroll-left-to-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .media-track {
          display: flex;
          gap: 24px;
          width: max-content;
          animation: scroll-left-to-right 120s linear infinite;
          will-change: transform;
        }
        .media-track.paused {
          animation-play-state: paused;
        }
      `}</style>

      <div 
        className={`media-track ${isPaused || modalOpen || !isVisible ? 'paused' : ''}`} 
        ref={trackRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {loopItems.map((item, idx) => (
          <div 
            key={idx}
            className="group relative min-w-[200px] sm:min-w-[260px] md:min-w-[320px] h-[135px] sm:h-[180px] md:h-[220px] transition-all duration-300 ease-out cursor-pointer opacity-70 hover:opacity-100 hover:scale-105 z-0 hover:z-20 origin-center rounded-xl overflow-hidden shadow-2xl border border-white/5"
            onClick={() => {
              if (item.type === 'video') {
                setActiveVideo(item.url);
                setModalOpen(true);
              }
            }}
          >
            {item.type === 'video' ? (
              <div className="w-full h-full relative overflow-hidden bg-[#121214]">
                <img 
                  src={item.thumb} 
                  alt="Video Highlight" 
                  loading="lazy"
                  className="w-full h-full object-cover pointer-events-none transition-transform duration-500 group-hover:scale-110" 
                />
                {/* Frosted Play Indicator */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/35 group-hover:bg-black/15 transition-colors">
                  <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#E0B9A0]/25 backdrop-blur-md border border-[#E0B9A0]/50 flex items-center justify-center text-[#FAF8F5] shadow-lg group-hover:scale-115 transition-transform">
                    <span className="material-symbols-outlined text-2xl ml-0.5 text-[#FAF8F5]">play_arrow</span>
                  </div>
                </div>
                {/* Video Tag */}
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-[#080809]/80 backdrop-blur-md border border-[#E0B9A0]/30 text-[9px] tracking-wider font-mono text-[#E0B9A0] uppercase font-semibold">
                  VIDEO
                </div>
              </div>
            ) : (
              <img 
                src={item.url} 
                alt="Media Asset" 
                loading="lazy"
                className="w-full h-full object-cover pointer-events-none transition-transform duration-500 group-hover:scale-110" 
                referrerPolicy="no-referrer" 
              />
            )}
          </div>
        ))}
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-pointer"
              onClick={() => { setModalOpen(false); setActiveVideo(""); }}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl z-10 rounded-2xl overflow-hidden shadow-2xl bg-[#121214] border border-white/10"
            >
              <button 
                className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-[#E0B9A0] text-white hover:text-[#080809] rounded-full p-2 w-10 h-10 flex items-center justify-center transition-colors border border-white/10"
                onClick={() => { setModalOpen(false); setActiveVideo(""); }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
              <video 
                ref={videoRef} 
                src={activeVideo} 
                controls 
                autoPlay 
                playsInline
                preload="metadata"
                className="w-full h-auto max-h-[80vh] outline-none bg-black" 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
