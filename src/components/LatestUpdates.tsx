import { useState, useRef, useMemo } from "react";
import { motion } from "motion/react";
import AnimatedHeading from "./AnimatedHeading";
import { PlayIcon } from "@heroicons/react/24/solid";
import { useInstagramFeed } from "../lib/instagramClient";

export default function LatestUpdates() {
  const { posts } = useInstagramFeed();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  // Strictly reflect only the latest three posts
  const latestThreePosts = useMemo(() => {
    return posts.slice(0, 3);
  }, [posts]);

  const handleTogglePlay = (id: string) => {
    const vid = videoRefs.current[id];
    if (!vid) return;

    if (playingId === id && !vid.paused) {
      vid.pause();
      setPlayingId(null);
    } else {
      // Pause any other playing video so sounds never clash
      Object.keys(videoRefs.current).forEach((k) => {
        const other = videoRefs.current[k];
        if (other && k !== id && !other.paused) {
          other.pause();
        }
      });
      vid.play().catch(() => {});
      setPlayingId(id);
    }
  };

  return (
    <section 
      id="updates" 
      className="py-24 sm:py-32 relative overflow-hidden bg-[#181514] text-[#FAF8F5] border-t border-b border-white/10"
    >
      {/* Subtle ambient lighting */}
      <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-[#E0B9A0]/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 relative z-10 space-y-12 sm:space-y-16">
        
        {/* Section Header */}
        <div className="border-b border-white/10 pb-8 sm:pb-10 max-w-3xl">
          <AnimatedHeading delay={0.1}>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold text-white uppercase tracking-tight leading-none m-0">
              LATEST <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E0B9A0] via-[#FAF8F5] to-[#AE917E]">UPDATES</span>
            </h2>
          </AnimatedHeading>
          <p className="text-stone-300 text-sm sm:text-base font-light leading-relaxed mt-4">
            Recent project milestones, on-site construction progress, and architectural transformations posted directly from our teams.
          </p>
        </div>

        {/* 3 Native Site Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {latestThreePosts.map((post, idx) => {
            const isPlaying = playingId === post.id;

            return (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex flex-col space-y-4"
              >
                {/* Post Author / Header */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#24201E] border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                    <img src="/logo.png" alt="Yanhal Holdings" className="w-6 h-6 object-contain" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white text-sm font-semibold tracking-tight">Yanhal Holdings</span>
                    <span className="text-stone-400 text-xs font-mono">{post.relativeTime}</span>
                  </div>
                </div>

                {/* Media Container: Full Video / Photo, Clickable & Playable Inline */}
                <div 
                  className="relative aspect-[9/16] w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10 cursor-pointer group"
                  onClick={() => handleTogglePlay(post.id)}
                >
                  {post.type === "video" && post.mediaUrl ? (
                    <>
                      <video
                        ref={(el) => { videoRefs.current[post.id] = el; }}
                        src={post.mediaUrl}
                        poster={post.thumbnailUrl}
                        playsInline
                        loop
                        controls={isPlaying}
                        onPlay={() => setPlayingId(post.id)}
                        onPause={() => {
                          if (playingId === post.id) setPlayingId(null);
                        }}
                        className="w-full h-full object-cover bg-black"
                      />
                      
                      {/* Play Button Overlay (visible when paused) */}
                      {!isPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/10 transition-colors pointer-events-none">
                          <div className="w-16 h-16 rounded-full bg-[#E0B9A0] text-[#181514] flex items-center justify-center shadow-[0_0_35px_rgba(224,185,160,0.6)] group-hover:scale-110 transition-transform">
                            <PlayIcon className="w-7 h-7 fill-current ml-0.5" />
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <img
                      src={post.thumbnailUrl || post.mediaUrl}
                      alt="Yanhal project update"
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Statement Written On The Post */}
                <div className="pt-1">
                  <p className="text-stone-200 text-sm leading-relaxed whitespace-pre-line font-light">
                    {post.rawCaption || post.caption}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </div>

      </div>
    </section>
  );
}
