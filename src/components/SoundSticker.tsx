import React from "react";

interface SoundStickerProps {
  isPlayingAudio: boolean;
  onToggle: () => void;
  size?: "default" | "compact" | "large";
  className?: string;
  showLabel?: boolean;
}

export default function SoundSticker({
  isPlayingAudio,
  onToggle,
  size = "default",
  className = "",
  showLabel = false,
}: SoundStickerProps) {
  // Dimensions according to size
  const badgeDimensions =
    size === "large"
      ? "w-20 h-20 sm:w-24 sm:h-24"
      : size === "compact"
      ? "w-11 h-11 sm:w-12 sm:h-12"
      : "w-14 h-14 sm:w-16 sm:h-16";

  const iconDimensions =
    size === "large"
      ? "w-7 h-7 sm:w-8 sm:h-8"
      : size === "compact"
      ? "w-4 h-4 sm:w-4.5 sm:h-4.5"
      : "w-5 h-5 sm:w-6 sm:h-6";

  return (
    <button
      onClick={onToggle}
      type="button"
      role="button"
      aria-label={isPlayingAudio ? "Mute audio" : "Unmute audio"}
      aria-pressed={isPlayingAudio}
      className={`group relative pointer-events-auto cursor-pointer select-none transition-transform duration-300 ease-out active:scale-95 focus:outline-none flex items-center gap-3 ${className}`}
    >
      {/* Signature Multi-Lobed Flower/Star Die-Cut Sticker Container from Reference */}
      <div
        className={`relative ${badgeDimensions} flex items-center justify-center transition-all duration-500 ease-out ${
          isPlayingAudio
            ? "scale-105 -rotate-6 group-hover:rotate-0 drop-shadow-[0_8px_25px_rgba(224,185,160,0.45)]"
            : "scale-100 rotate-3 group-hover:rotate-0 drop-shadow-[0_6px_18px_rgba(0,0,0,0.7)]"
        }`}
      >
        {/* Soft backlight bloom when active */}
        {isPlayingAudio && (
          <div
            className="absolute inset-0 rounded-full blur-xl scale-125 opacity-60 pointer-events-none animate-pulse"
            style={{ backgroundColor: "#E0B9A0" }}
          />
        )}

        {/* Organic Flower/Star Shape SVG (Exact geometry from reference phyusinyadanarthein.com) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none transition-colors duration-400"
          viewBox="0 0 166 170"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M149.641 82.9313C147.433 95.9844 149.259 108.779 153.674 121.766C153.923 122.483 154.338 123.751 153.915 124.134L153.874 124.176C153.542 124.518 152.761 124.476 151.824 124.293C148.188 123.617 144.885 122.791 141.249 122.299C130.476 121.34 119.561 122.875 109.693 127.612C101.194 131.449 95.4749 136.262 90.0467 143.81C83.8715 150.858 81.174 157.889 80.4685 167.306C80.2776 170.684 78.7504 170.934 77.2232 167.706C74.1356 161.409 71.546 154.636 67.3462 149.015C63.2211 143.752 58.7972 138.455 53.535 134.393C50.6383 132.241 47.9574 129.789 44.8864 127.879C43.3094 126.887 41.5083 126.303 39.9147 125.385C34.3786 121.54 27.971 119.213 21.5468 117.328C15.1807 115.21 8.54067 114.042 1.83427 113.567C0.489666 113.533 -0.647434 113.425 0.423266 111.957C1.41927 110.689 2.43187 109.488 3.31997 108.128C5.68547 104.575 7.90157 100.839 8.83117 96.5683C9.37897 93.7992 10.2671 91.0718 10.375 88.2443C10.3252 81.6218 8.64857 74.8324 4.74757 69.4277C2.16627 65.8996 3.43617 65.0989 7.43677 65.1656C14.3922 65.1656 21.1318 63.364 27.722 61.2121C34.196 59.2687 40.919 57.659 46.4302 53.547C52.9706 49.0931 59.3118 44.1721 64.3167 38C65.5119 36.5153 66.2672 34.7304 67.313 33.1457C69.0643 30.7269 71.0978 28.4832 72.293 25.6974C73.9364 22.2611 74.7581 18.391 75.7209 14.7044C76.3434 12.1355 77.0655 9.56653 77.3477 6.93087C77.7544 5.36282 76.7252 -0.275484 78.4682 -0.000241284C79.4559 0.216617 80.7175 2.25175 81.4728 3.35272C83.2739 5.99672 85.1165 8.62403 86.7848 11.3598C88.8432 14.9713 92.1549 17.5069 95.1927 20.1842C96.9606 21.7523 98.4878 23.704 100.413 25.1469C102.314 26.5982 104.455 27.6575 106.53 28.8252C112.897 32.9038 120.043 35.1641 127.106 37.6997C129.903 38.784 132.833 39.4429 135.796 39.8432C144.586 41.0526 153.351 42.971 162.232 42.9543C164.257 43.0127 167.735 42.579 164.954 45.7818C156.115 56.8666 151.948 69.5027 149.632 82.9229L149.641 82.9313Z"
            fill={isPlayingAudio ? "#E0B9A0" : "#1A1716"}
            stroke={isPlayingAudio ? "#AE917E" : "rgba(224, 185, 160, 0.45)"}
            strokeWidth="3.5"
          />
        </svg>

        {/* Inner Dual-State Speaker Vector Icon from Reference */}
        <div className={`relative z-10 ${iconDimensions} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
          {isPlayingAudio ? (
            /* Unmuted Icon: Speaker emitting dual acoustic waves */
            <svg
              className="w-full h-full text-[#2D2926] drop-shadow-sm transition-transform duration-300"
              viewBox="0 0 54 54"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M29 10.5C29 9.95184 28.701 9.44732 28.2202 9.18416C27.7392 8.921 27.1532 8.9411 26.6914 9.2366L14.6843 16.9211C14.6039 16.9726 14.5103 17 14.4148 17H8.5C6.567 17 5 18.567 5 20.5V33.5C5 35.433 6.567 37 8.5 37H14.4148C14.5103 37 14.6039 37.0274 14.6843 37.0788L26.6914 44.7634C27.1532 45.0588 27.7392 45.079 28.2202 44.8158C28.701 44.5526 29 44.0482 29 43.5V10.5Z"
                fill="currentColor"
              />
              <path
                d="M40.435 11.4432C41.0208 10.8575 41.9704 10.8575 42.5562 11.4432C46.5358 15.4228 49 20.9249 49 26.9996C49 33.0744 46.5358 38.5764 42.5562 42.556C41.9704 43.1418 41.0208 43.1418 40.435 42.556C39.8492 41.9702 39.8492 41.0204 40.435 40.4346C43.875 36.9946 46 32.2468 46 26.9996C46 21.7525 43.875 17.0045 40.435 13.5646C39.8492 12.9788 39.8492 12.029 40.435 11.4432Z"
                fill="currentColor"
              />
              <path
                d="M35.8388 18.162C35.253 17.5762 34.3032 17.5762 33.7174 18.162C33.1316 18.7478 33.1316 19.6975 33.7174 20.2833C35.4382 22.0041 36.5 24.377 36.5 27.0008C36.5 29.6246 35.4382 31.9976 33.7174 33.7184C33.1316 34.3042 33.1316 35.2538 33.7174 35.8396C34.3032 36.4254 35.253 36.4254 35.8388 35.8396C38.0992 33.5792 39.5 30.4522 39.5 27.0008C39.5 23.5494 38.0992 20.4224 35.8388 18.162Z"
                fill="currentColor"
              />
            </svg>
          ) : (
            /* Muted Icon: Speaker with strike-through slash */
            <svg
              className="w-full h-full text-[#FAF8F5]/85 group-hover:text-[#E0B9A0] transition-colors duration-300"
              viewBox="0 0 54 54"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.3818 8.50039C12.8934 7.92803 13.7447 7.84041 14.3584 8.26992C14.3696 8.28308 14.3799 8.29711 14.3916 8.30996L14.501 8.41738L52.001 41.9174L52.1201 42.0141C52.1264 42.0186 52.1333 42.0223 52.1396 42.0268C52.6204 42.5885 52.6243 43.4317 52.1182 43.9984C51.6007 44.5775 50.7353 44.6609 50.1201 44.2143L50.001 44.1176L44.999 39.6488C44.2681 40.687 43.4506 41.6601 42.5557 42.5551C41.9699 43.1407 41.0203 43.1408 40.4346 42.5551C39.8493 41.9693 39.8492 41.0197 40.4346 40.434C41.2902 39.5783 42.0647 38.6412 42.7451 37.6361L37.8271 33.2416C37.2776 34.1931 36.6101 35.068 35.8389 35.8393C35.2532 36.4247 34.3035 36.4246 33.7178 35.8393C33.1321 35.2534 33.132 34.3029 33.7178 33.7172C34.452 32.9828 35.0644 32.1286 35.5273 31.1879L29 25.3559V43.4994C28.9999 44.0475 28.7004 44.5517 28.2197 44.8148C27.7389 45.0778 27.1531 45.0583 26.6914 44.7631L14.6846 37.0785C14.6042 37.0272 14.5104 36.9995 14.415 36.9994H8.5C6.56706 36.9994 5.0001 35.4323 5 33.4994V20.4994C5.00017 18.5666 6.56711 16.9994 8.5 16.9994H14.415C14.5105 16.9994 14.6042 16.9718 14.6846 16.9203L17.5225 15.1029L12.501 10.6176L12.3916 10.5102C11.8788 9.94899 11.8646 9.07956 12.3818 8.50039Z"
                fill="currentColor"
              />
              <path
                d="M40.4346 11.4428C41.0203 10.8572 41.9699 10.8573 42.5557 11.4428C46.5351 15.4222 48.9998 20.924 49 26.9984C49 29.5023 48.5806 31.909 47.8096 34.1518L45.3447 31.9506C45.7703 30.3718 46 28.712 46 26.9984C45.9998 21.7516 43.8744 17.0037 40.4346 13.5639C39.8492 12.9782 39.8492 12.0285 40.4346 11.4428Z"
                fill="currentColor"
              />
              <path
                d="M33.7178 18.1615C34.3035 17.576 35.2531 17.576 35.8389 18.1615C38.0388 20.3616 39.4237 23.3831 39.4961 26.725L35.8018 23.4242C35.3201 22.2398 34.6083 21.1732 33.7178 20.2826C33.1321 19.6968 33.132 18.7472 33.7178 18.1615Z"
                fill="currentColor"
              />
              <path
                d="M26.6914 9.23574C27.153 8.94049 27.7389 8.92026 28.2197 9.18301C28.7004 9.44611 28.9999 9.95137 29 10.4994V17.348L22.7451 11.7602L26.6914 9.23574Z"
                fill="currentColor"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Optional Companion Badge Label */}
      {showLabel && (
        <div className="flex flex-col text-left">
          <span
            className={`font-mono text-[9px] sm:text-[10px] tracking-[0.2em] uppercase font-bold leading-tight transition-colors duration-300 ${
              isPlayingAudio ? "text-[#E0B9A0]" : "text-stone-300 group-hover:text-white"
            }`}
          >
            {isPlayingAudio ? "AUDIO ON" : "AUDIO OFF"}
          </span>
          <span className="font-mono text-[7px] sm:text-[8px] tracking-wider uppercase text-white/40 leading-none mt-0.5">
            SHOWREEL SOUND
          </span>
        </div>
      )}
    </button>
  );
}
