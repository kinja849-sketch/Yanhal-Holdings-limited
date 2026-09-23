import { useState, useEffect } from 'react';

const SITE_IMAGES = [
  "/site-progress/media__1777503752851.jpg",
  "/site-progress/media__1777503752885.jpg",
  "/site-progress/media__1777503752962.jpg",
  "/site-progress/media__1777503753000.jpg",
  "/site-progress/media__1777503753014.jpg"
];

const getRandomImage = (currentExcludes: string[] = []) => {
  const available = SITE_IMAGES.filter(img => !currentExcludes.includes(img));
  return available[Math.floor(Math.random() * available.length)] || SITE_IMAGES[0];
};

export default function AnimatedSiteProgressGrid() {
  const [images, setImages] = useState<string[]>([
    SITE_IMAGES[0],
    SITE_IMAGES[1],
    SITE_IMAGES[2],
    SITE_IMAGES[3],
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setImages(prev => {
        const next = [...prev];
        const slotToUpdate = Math.floor(Math.random() * 4);
        next[slotToUpdate] = getRandomImage(next);
        return next;
      });
    }, 4000); 

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
        
        .animated-card-inner-site {
            width: 100%;
            height: 100%;
            opacity: 0;
            transform: scale(0.8) translateY(20px);
            animation: luxuryFadeFlash 8s infinite ease-in-out;
        }

        .anim-tl-site { animation-delay: 2s; }
        .anim-tr-site { animation-delay: 6s; }
        .anim-bl-site { animation-delay: 4s; }
        .anim-br-site { animation-delay: 0s; }

        @media (prefers-reduced-motion: reduce) {
          .animated-card-inner-site {
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
            <div className="animated-card-inner-site anim-tl-site absolute inset-0 shadow-2xl rounded-xl">
               <img src={images[0]} alt="Site Progress TL" className="w-full h-full object-cover rounded-xl" />
            </div>
          </div>
          {/* Bottom Left */}
          <div className="h-44 sm:h-72 md:h-80 relative">
            <div className="animated-card-inner-site anim-bl-site absolute inset-0 shadow-2xl rounded-xl">
               <img src={images[2]} alt="Site Progress BL" className="w-full h-full object-cover rounded-xl" />
            </div>
          </div>
        </div>
        <div className="space-y-3 sm:space-y-[15px] pt-6 sm:pt-10 md:pt-12">
          {/* Top Right */}
          <div className="h-44 sm:h-72 md:h-80 relative">
            <div className="animated-card-inner-site anim-tr-site absolute inset-0 shadow-2xl rounded-xl">
               <img src={images[1]} alt="Site Progress TR" className="w-full h-full object-cover rounded-xl" />
            </div>
          </div>
          {/* Bottom Right */}
          <div className="h-36 sm:h-56 md:h-64 relative">
            <div className="animated-card-inner-site anim-br-site absolute inset-0 shadow-2xl rounded-xl">
               <img src={images[3]} alt="Site Progress BR" className="w-full h-full object-cover rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
