import { useState, useEffect } from 'react';

const PORTFOLIO_IMAGES = Array.from({ length: 9 }, (_, i) => `/showcase/project-${i + 1}.jpg`);

const getRandomImage = (currentExcludes: string[] = []) => {
  const available = PORTFOLIO_IMAGES.filter(img => !currentExcludes.includes(img));
  return available[Math.floor(Math.random() * available.length)] || PORTFOLIO_IMAGES[0];
};

export default function AnimatedPortfolioGrid() {
  const [images, setImages] = useState<string[]>([
    PORTFOLIO_IMAGES[0],
    PORTFOLIO_IMAGES[1],
    PORTFOLIO_IMAGES[2],
    PORTFOLIO_IMAGES[3],
  ]);

  useEffect(() => {
    // We want to update each image source when it is fully invisible.
    // The animation is 8s long.
    // TL (index 0) delay 2s -> Invisible from 28% to 100% of its cycle (which starts at 2s).
    // Let's just set an interval to swap one image every 2 seconds to keep it varied.
    const interval = setInterval(() => {
      setImages(prev => {
        const next = [...prev];
        // Pick a random slot to update (0 to 3)
        const slotToUpdate = Math.floor(Math.random() * 4);
        next[slotToUpdate] = getRandomImage(next);
        return next;
      });
    }, 4000); // Swap one image every 4 seconds to ensure varied experience over time without flickering visible ones

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{`
        @keyframes luxuryFadeFlash {
            0% { opacity: 0; transform: scale(0.7) translateY(40px) rotate(3deg); }
            3% { opacity: 1; transform: scale(1.02) translateY(-5px) rotate(-1deg); }
            6%, 22% { opacity: 1; transform: scale(1) translateY(0) rotate(0deg); }
            28% { opacity: 0; transform: scale(0.9) translateY(-20px) rotate(2deg); }
            100% { opacity: 0; }
        }
        
        .animated-card-inner {
            width: 100%;
            height: 100%;
            opacity: 0;
            transform: scale(0.8) translateY(20px);
            animation: luxuryFadeFlash 8s infinite ease-in-out;
        }

        .anim-tl { animation-delay: 2s; }
        .anim-tr { animation-delay: 6s; }
        .anim-bl { animation-delay: 4s; }
        .anim-br { animation-delay: 0s; }

        @media (prefers-reduced-motion: reduce) {
          .animated-card-inner {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
      
      <div className="w-full grid grid-cols-2 gap-3 sm:gap-[15px]">
        <div className="space-y-3 sm:space-y-[15px]">
          {/* Top Left */}
          <div className="h-36 sm:h-56 md:h-64 relative">
            <div className="animated-card-inner anim-tl absolute inset-0 shadow-2xl rounded-xl">
               <img src={images[0]} alt="Portfolio TL" className="w-full h-full object-cover rounded-xl" />
            </div>
          </div>
          {/* Bottom Left */}
          <div className="h-44 sm:h-72 md:h-80 relative">
            <div className="animated-card-inner anim-bl absolute inset-0 shadow-2xl rounded-xl">
               <img src={images[2]} alt="Portfolio BL" className="w-full h-full object-cover rounded-xl" />
            </div>
          </div>
        </div>
        <div className="space-y-3 sm:space-y-[15px] pt-6 sm:pt-10 md:pt-12">
          {/* Top Right */}
          <div className="h-44 sm:h-72 md:h-80 relative">
            <div className="animated-card-inner anim-tr absolute inset-0 shadow-2xl rounded-xl">
               <img src={images[1]} alt="Portfolio TR" className="w-full h-full object-cover rounded-xl" />
            </div>
          </div>
          {/* Bottom Right */}
          <div className="h-36 sm:h-56 md:h-64 relative">
            <div className="animated-card-inner anim-br absolute inset-0 shadow-2xl rounded-xl">
               <img src={images[3]} alt="Portfolio BR" className="w-full h-full object-cover rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
