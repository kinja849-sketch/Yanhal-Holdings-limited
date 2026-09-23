import { useState } from "react";
import { motion } from "motion/react";
import AnimatedBlock from "./AnimatedBlock";

interface LeadershipCardProps {
  name: string;
  role: string;
  coverUrl: string;
  characterUrl: string;
  index: number;
  onClick: () => void;
}

export default function LeadershipCard({ name, role, coverUrl, characterUrl, index, onClick }: LeadershipCardProps) {
  const containerVariants = {
    initial: { rotateX: 0, rotateY: 0, scale: 1 },
    active: { 
      rotateX: 8, 
      rotateY: -5, 
      scale: 1.02,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const primaryImageVariants = {
    initial: { opacity: 1, scale: 1 },
    active: { opacity: 0, scale: 1.1, transition: { duration: 0.5 } }
  };

  const secondaryImageVariants = {
    initial: { opacity: 0, scale: 1.05 },
    active: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
  };

  const titleVariants = {
    initial: { z: 10, y: 0 },
    active: { z: 40, y: -8, transition: { duration: 0.4 } }
  };

  const [isFlipped, setIsFlipped] = useState(false);

  const handleCardClick = () => {
    const isTouch = window.matchMedia("(hover: none)").matches;
    if (isTouch && !isFlipped) {
      setIsFlipped(true);
    } else {
      onClick();
    }
  };

  return (
    <AnimatedBlock delay={0.2} index={index}>
      <motion.div 
        className="leadership-card group relative w-full max-w-[420px] mx-auto aspect-[3/4] min-h-[380px] sm:min-h-[460px] cursor-pointer"
        initial="initial"
        animate={isFlipped ? "active" : "initial"}
        whileHover="active"
        onClick={handleCardClick}
        style={{ perspective: 1000 }}
      >
        <motion.div 
          variants={containerVariants}
          className="leadership-wrapper absolute inset-0 w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-[#AE917E]/30 group-hover:border-[#E0B9A0] bg-[#1E1B18] transition-colors duration-500"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Primary Image (Default) */}
          <motion.img 
            variants={primaryImageVariants}
            src={coverUrl} 
            alt={name} 
            className="leadership-image-primary absolute inset-0 w-full h-full object-cover origin-center"
            referrerPolicy="no-referrer"
          />

          {/* Secondary Image (Hover Flip) */}
          <motion.img 
            variants={secondaryImageVariants}
            src={characterUrl} 
            alt={`${name} alternate`} 
            className="leadership-image-secondary absolute inset-0 w-full h-full object-cover origin-center"
            referrerPolicy="no-referrer"
          />

          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10 pointer-events-none"></div>

          {/* Title Layer */}
          <motion.div 
            variants={titleVariants}
            className="leadership-title absolute bottom-4 sm:bottom-6 left-0 right-0 z-30 text-center px-2 sm:px-4 pointer-events-none"
          >
            <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-display font-bold text-white uppercase tracking-wide mb-1 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] leading-tight px-2">{name}</h3>
            <p className="text-[#E0B9A0] text-[8px] sm:text-[9px] lg:text-[10px] tracking-[0.18em] sm:tracking-[0.25em] uppercase font-bold drop-shadow-md px-2 leading-relaxed">{role}</p>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatedBlock>
  );
}
