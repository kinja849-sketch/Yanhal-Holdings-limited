import { motion } from "motion/react";
import AnimatedPortfolioGrid from "./AnimatedPortfolioGrid";
import AnimatedSiteProgressGrid from "./AnimatedSiteProgressGrid";
import AnimatedHeading from "./AnimatedHeading";
import AnimatedBlock from "./AnimatedBlock";
import {
  WrenchScrewdriverIcon,
  BoltIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
  SparklesIcon,
  LightBulbIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

const renderFeatureIcon = (iconName: string, colorClass = "text-[#AE917E]") => {
  const iconProps = { className: `w-6 h-6 sm:w-7 sm:h-7 ${colorClass} stroke-[1.5]` };
  switch (iconName) {
    case "precision_manufacturing":
      return <WrenchScrewdriverIcon {...iconProps} />;
    case "speed":
      return <BoltIcon {...iconProps} />;
    case "security":
      return <ShieldCheckIcon {...iconProps} />;
    case "space_dashboard":
      return <Squares2X2Icon {...iconProps} />;
    case "texture":
      return <SparklesIcon {...iconProps} />;
    case "light_mode":
      return <LightBulbIcon {...iconProps} />;
    default:
      return <CheckCircleIcon {...iconProps} />;
  }
};

interface FeatureSectionProps {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  features: { icon: string; title: string; desc: string }[];
  reverse?: boolean;
  dark?: boolean;
  theme?: "white" | "lime" | "violet" | "black" | "sage" | "sand" | "dark" | "charcoal";
  animatedGallery?: boolean;
  siteProgressGallery?: boolean;
  accentColor?: "lime" | "violet";
}

export default function FeatureSection({ 
  title, 
  subtitle, 
  description, 
  image, 
  features, 
  reverse, 
  dark, 
  theme,
  animatedGallery, 
  siteProgressGallery,
}: FeatureSectionProps) {
  const currentTheme = theme || (dark ? "black" : "white");
  const isDark = currentTheme === "black" || currentTheme === "dark" || currentTheme === "charcoal";

  const themeClass = isDark
    ? "bg-[#2D2926] text-[#FAF8F5]"
    : "bg-[#FAF8F5] text-[#2D2926]";

  const subtitleColor = "text-[#AE917E]";
  const titleColor = isDark ? "text-white" : "text-[#2D2926]";
  const descColor = isDark ? "text-stone-300" : "text-stone-700";
  
  const cardBg = isDark 
    ? "bg-[#1E1B18] p-4 sm:p-5 rounded-xl border border-[#AE917E]/30 text-white shadow-xl"
    : "bg-white p-4 sm:p-5 rounded-xl border border-stone-200 text-[#2D2926] shadow-sm";

  const cardTitleColor = isDark ? "text-white" : "text-[#2D2926]";
  const cardDescColor = isDark ? "text-stone-300" : "text-stone-600";
  const iconColor = isDark ? "text-[#E0B9A0]" : "text-[#AE917E]";

  return (
    <section className={`py-16 sm:py-20 lg:py-24 px-4 sm:px-8 lg:px-16 xl:px-20 ${themeClass} relative overflow-hidden`}>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.2, 0, 0.2, 1] }}
            className={`w-full lg:w-1/2 ${reverse ? 'lg:order-2' : 'lg:order-1'}`}
          >
            {animatedGallery ? (
              <AnimatedPortfolioGrid />
            ) : siteProgressGallery ? (
              <AnimatedSiteProgressGrid />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-3 sm:space-y-4">
                  <div className="h-36 sm:h-64 rounded-xl overflow-hidden shadow-2xl">
                    <img className="w-full h-full object-cover" src={image} alt={title} referrerPolicy="no-referrer" />
                  </div>
                  <div className="h-44 sm:h-80 rounded-xl overflow-hidden shadow-2xl bg-white/5 border border-white/5"></div>
                </div>
                <div className="space-y-3 sm:space-y-4 pt-6 sm:pt-12">
                  <div className="h-44 sm:h-80 rounded-xl overflow-hidden shadow-2xl bg-white/5 border border-white/5"></div>
                  <div className="h-36 sm:h-64 rounded-xl overflow-hidden shadow-2xl bg-white/5 border border-white/5"></div>
                </div>
              </div>
            )}
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.2, 0, 0.2, 1], delay: 0.1 }}
            className={`w-full lg:w-1/2 ${reverse ? 'lg:order-1' : 'lg:order-2'}`}
          >
            <span className={`${subtitleColor} text-[9.5px] sm:text-xs md:text-sm font-bold tracking-[0.25em] sm:tracking-[0.3em] uppercase mb-2.5 sm:mb-4 block leading-none`}>
              {subtitle}
            </span>
            <AnimatedHeading delay={0.1}>
              <h2 className={`text-2xl sm:text-4xl md:text-5xl font-black ${titleColor} leading-[1.15] sm:leading-tight mb-4 sm:mb-8 tracking-tighter uppercase font-display`}>
                {title}
              </h2>
            </AnimatedHeading>
            <AnimatedBlock delay={0.05}>
              <p className={`text-xs sm:text-base lg:text-lg ${descColor} mb-6 sm:mb-10 leading-relaxed max-w-xl font-normal`}>
                {description}
              </p>
            </AnimatedBlock>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6">
              {features.map((f, idx) => (
                <AnimatedBlock key={idx} index={idx} delay={0.1}>
                  <div className={`flex gap-4 sm:gap-6 items-start ${cardBg}`}>
                    <div className="shrink-0 mt-0.5">
                      {renderFeatureIcon(f.icon, iconColor)}
                    </div>
                    <div>
                      <h5 className={`text-base sm:text-lg font-bold ${cardTitleColor} mb-1 font-display uppercase tracking-tight`}>{f.title}</h5>
                      <p className={`${cardDescColor} text-xs sm:text-sm leading-relaxed font-normal`}>{f.desc}</p>
                    </div>
                  </div>
                </AnimatedBlock>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
